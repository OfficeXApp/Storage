// hooks/useIdentity.tsx
import {
  useState,
  useCallback,
  useEffect,
  useRef,
  createContext,
  useContext,
  ReactNode,
} from "react";
import { Account, mnemonicToAccount } from "viem/accounts";
import { Ed25519KeyIdentity } from "@dfinity/identity";
import { Principal } from "@dfinity/principal";
import { mnemonicToSeed } from "@scure/bip39";
import { HttpAgent, Actor, ActorSubclass } from "@dfinity/agent";
import { shortenAddress } from "../identity_deprecated/evm-auth";
import { generate } from "random-words";

// Constants - Adjust these based on your needs
const LOCAL_STORAGE_SEED_PHRASE = "local_storage_seed_phrase";
const LOCAL_STORAGE_ALIAS_NICKNAME = "alias_nickname";
const LOCAL_STORAGE_ICP_PUBLIC_ADDRESS = "icp_public_address";

// Types
export interface ICPAccount {
  identity: Ed25519KeyIdentity;
  principal: Principal;
}

export interface AuthProfile {
  evmAccount: Account | null;
  evmSlug: string;
  icpAccount: ICPAccount | null;
  icpSlug: string;
  alias: string;
}

export interface IdentityContextProps {
  profile: AuthProfile;
  icpAgent: React.MutableRefObject<HttpAgent | undefined>;
  importProfileFromSeed: (
    seedPhrase: string,
    evmSeedPhrase?: string
  ) => Promise<AuthProfile>;
  generateSignature: (message: string) => Promise<string | null>;
  generateNewAccount: () => Promise<AuthProfile>;
  isInitialized: boolean;
}

// Create Context
const IdentityContext = createContext<IdentityContextProps | undefined>(
  undefined
);

// Provider Component - Separate the logic from the hook definition
export const IdentityProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [profile, setProfile] = useState<AuthProfile>({
    evmAccount: null,
    evmSlug: "0x0",
    icpAccount: null,
    icpSlug: "0i0",
    alias: "0x0",
  });

  const [isInitialized, setIsInitialized] = useState(false);
  const icpAgent = useRef<HttpAgent>();

  // Initialize ICP agent
  const initIcpAgent = async (identity: Ed25519KeyIdentity) => {
    // const isProduction =
    //   window.location.hostname === "your-production-domain.com";
    // const host = isProduction ? "https://icp-api.io" : "http://localhost:4943";
    // const agent = new HttpAgent({ identity, host });
    // // Fetch root key for local development
    // if (!isProduction) {
    //   try {
    //     await agent.fetchRootKey();
    //   } catch (error) {
    //     console.error("Error fetching root key:", error);
    //   }
    // }
    // icpAgent.current = agent;
  };

  // Generate addresses from seed phrase
  const importProfileFromSeed = useCallback(
    async (seedPhrase: string): Promise<AuthProfile> => {
      try {
        // For EVM address generation
        const evmAccount = mnemonicToAccount(seedPhrase);
        const evmAddress = evmAccount.address;
        const evmSlug = shortenAddress(evmAddress);

        // For ICP address generation
        // Convert mnemonic to seed bytes for Ed25519 identity
        const seedBytes = await mnemonicToSeed(seedPhrase, "");

        // Create a consistent slice of the seed to use for the identity
        const identitySeed = seedBytes.slice(0, 32);

        // Create Ed25519 identity using the seed
        const icpIdentity = Ed25519KeyIdentity.generate(identitySeed);
        const icpPrincipal = icpIdentity.getPrincipal();
        const icpAddress = icpPrincipal.toString();
        const icpSlug = shortenAddress(icpAddress);

        // Store in local storage
        localStorage.setItem(LOCAL_STORAGE_SEED_PHRASE, seedPhrase);
        localStorage.setItem(LOCAL_STORAGE_ICP_PUBLIC_ADDRESS, icpAddress);

        // Get alias from local storage or use a default
        const storedAlias =
          localStorage.getItem(LOCAL_STORAGE_ALIAS_NICKNAME) || "User";

        // Initialize ICP agent
        await initIcpAgent(icpIdentity);

        const newProfile = {
          evmAccount,
          evmSlug,
          icpAccount: {
            identity: icpIdentity,
            principal: icpPrincipal,
          },
          icpSlug,
          alias: storedAlias,
        };

        // Update state
        setProfile(newProfile);

        return newProfile;
      } catch (error) {
        console.error("Failed to generate addresses:", error);
        throw error;
      }
    },
    []
  );

  // Generate signature using ICP identity
  const generateSignature = useCallback(
    async (message: string): Promise<string | null> => {
      try {
        if (!profile.icpAccount) {
          console.error("ICP account not initialized");
          return null;
        }

        const identity = profile.icpAccount.identity;

        // Use the raw public key for signature verification
        const rawPublicKey = identity.getPublicKey().toRaw();
        const publicKeyArray = Array.from(new Uint8Array(rawPublicKey));

        // Get the canonical principal
        const canonicalPrincipal = identity.getPrincipal().toString();

        const now = Date.now();

        // Build the challenge
        const challenge = {
          timestamp_ms: now,
          message: message,
          self_auth_principal: publicKeyArray,
          canonical_principal: canonicalPrincipal,
        };

        // Serialize and sign the challenge
        const challengeBytes = new TextEncoder().encode(
          JSON.stringify(challenge)
        );
        const signature = await identity.sign(challengeBytes);
        const signatureArray = Array.from(new Uint8Array(signature));

        // Build and encode the proof
        const proof = {
          auth_type: "SIGNATURE",
          challenge,
          signature: signatureArray,
        };

        return btoa(JSON.stringify(proof));
      } catch (error) {
        console.error("Signature generation error:", error);
        return null;
      }
    },
    [profile.icpAccount]
  );

  const generateNewAccount = async () => {
    // generate new seed phrase
    const seedPhrase = (generate(12) as string[]).join(" ");
    // call importProfileFromSeed
    const newProfile = await importProfileFromSeed(seedPhrase);
    // return auth profile
    return newProfile;
  };

  // Initialize from localStorage on component mount
  useEffect(() => {
    const initializeFromStorage = async () => {
      const localStorageSeedPhrase = localStorage.getItem(
        LOCAL_STORAGE_SEED_PHRASE
      );

      if (localStorageSeedPhrase) {
        try {
          await importProfileFromSeed(localStorageSeedPhrase);
          setIsInitialized(true);
        } catch (error) {
          console.error(
            "Failed to initialize from stored seed phrases:",
            error
          );
        }
      } else {
        setIsInitialized(true); // Mark as initialized even if no stored phrases
      }
    };

    initializeFromStorage();
  }, [importProfileFromSeed]);

  const contextValue = {
    profile,
    icpAgent,
    importProfileFromSeed,
    generateSignature,
    isInitialized,
    generateNewAccount,
  };

  return (
    <IdentityContext.Provider value={contextValue}>
      {children}
    </IdentityContext.Provider>
  );
};

// Custom hook to use the identity context
export const useIdentity = () => {
  const context = useContext(IdentityContext);
  if (context === undefined) {
    throw new Error("useIdentity must be used within an IdentityProvider");
  }
  return context;
};

// Export default hook for backward compatibility if needed
export default useIdentity;

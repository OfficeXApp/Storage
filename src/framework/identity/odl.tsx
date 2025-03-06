// // hooks/useIdentity.tsx
// import {
//   useState,
//   useCallback,
//   useEffect,
//   useRef,
//   createContext,
//   useContext,
//   ReactNode,
//   useMemo,
// } from "react";
// import { Account, mnemonicToAccount } from "viem/accounts";
// import { Ed25519KeyIdentity } from "@dfinity/identity";
// import { Principal } from "@dfinity/principal";
// import { mnemonicToSeed, mnemonicToSeedSync } from "@scure/bip39";
// import { HttpAgent, Actor, ActorSubclass } from "@dfinity/agent";
// import { shortenAddress } from "../identity_deprecated/evm-auth";
// import { generate } from "random-words";
// import {
//   EvmPublicAddress,
//   ICPPrincipalString,
//   UserID,
// } from "@officexapp/types";
// import {
//   LOCAL_STORAGE_ALIAS_NICKNAME,
//   LOCAL_STORAGE_EVM_PUBLIC_ADDRESS,
//   LOCAL_STORAGE_ICP_PUBLIC_ADDRESS,
//   LOCAL_STORAGE_SEED_PHRASE,
// } from "./constants";
// import {
//   IndexDB_Profile,
//   useSwitchOrgProfiles,
// } from "../../api/switch-profiles";
// import { hexStringToUint8Array } from "../identity_deprecated/icp-auth";

// export interface AuthProfile {
//   evmPublicKey: EvmPublicAddress;
//   icpPublicKey: ICPPrincipalString;
//   icpAccount: {
//     identity: Ed25519KeyIdentity;
//     principal: Principal;
//   };
//   slug: string;
//   nickname: string;
//   userID: UserID;
// }

// export interface IdentityContextProps {
//   currentProfile: AuthProfile | undefined;
//   importProfileFromSeed: (seedPhrase: string) => Promise<IndexDB_Profile>;
//   generateSignature: (message: string) => Promise<string | null>;
//   generateNewAccount: () => Promise<IndexDB_Profile>;
//   isInitialized: boolean;
// }

// // Function to derive Ed25519 key from seed (uses the first 32 bytes of the seed)
// const deriveEd25519KeyFromSeed = async (
//   seed: Uint8Array
// ): Promise<Uint8Array> => {
//   const hashBuffer = await crypto.subtle.digest("SHA-256", seed);
//   return new Uint8Array(hashBuffer).slice(0, 32); // Ed25519 secret key should be 32 bytes
// };

// // Create Context
// const IdentityContext = createContext<IdentityContextProps | undefined>(
//   undefined
// );

// // Provider Component - Separate the logic from the hook definition
// export const IdentityProvider: React.FC<{ children: ReactNode }> = ({
//   children,
// }) => {
//   const { queryExistingProfile, selectProfile, addProfile, currentProfile } =
//     useSwitchOrgProfiles();
//   const [isInitialized, setIsInitialized] = useState(false);

//   const [profile, setProfile] = useState<AuthProfile>();

//   console.log(`multi-currentprofile`, currentProfile);

//   useEffect(() => {
//     const setOfficialCurrentProfile = async () => {
//       const derivedKey = await deriveEd25519KeyFromSeed(
//         mnemonicToSeedSync(currentProfile?.seedPhrase || "")
//       );
//       // Create the identity from the derived key
//       const identity = Ed25519KeyIdentity.fromSecretKey(derivedKey);
//       const publicKeyBuffer = hexStringToUint8Array(
//         currentProfile?.icpPublicAddress || ""
//       );
//       const principal = Principal.selfAuthenticating(publicKeyBuffer);
//       const auth_profile = {
//         evmPublicKey: currentProfile?.evmPublicAddress || "",
//         icpPublicKey: currentProfile?.icpPublicAddress || "",
//         slug: shortenAddress(currentProfile?.icpPublicAddress || ""),
//         nickname: currentProfile?.nickname || "",
//         userID: currentProfile?.userID || "",
//         icpAccount: {
//           identity,
//           principal,
//         },
//       };
//       setProfile(auth_profile);
//     };
//     setOfficialCurrentProfile();
//   }, [currentProfile]);

//   // Generate addresses from seed phrase
//   const importProfileFromSeed = useCallback(
//     async (seedPhrase: string): Promise<IndexDB_Profile> => {
//       try {
//         // For EVM address generation
//         const evmAccount = mnemonicToAccount(seedPhrase);
//         const evmAddress = evmAccount.address;
//         const evmSlug = shortenAddress(evmAddress);

//         // For ICP address generation
//         // Convert mnemonic to seed bytes for Ed25519 identity
//         const seedBytes = await mnemonicToSeed(seedPhrase, "");

//         // Create a consistent slice of the seed to use for the identity
//         const identitySeed = seedBytes.slice(0, 32);

//         // Create Ed25519 identity using the seed
//         const icpIdentity = Ed25519KeyIdentity.generate(identitySeed);
//         const icpPrincipal = icpIdentity.getPrincipal();
//         const icpAddress = icpPrincipal.toString();
//         const icpSlug = shortenAddress(icpAddress);

//         // Store in local storage
//         localStorage.setItem(LOCAL_STORAGE_SEED_PHRASE, seedPhrase);
//         localStorage.setItem(LOCAL_STORAGE_ICP_PUBLIC_ADDRESS, icpAddress);
//         localStorage.setItem(LOCAL_STORAGE_EVM_PUBLIC_ADDRESS, evmAddress);

//         // Get alias from local storage or use a default
//         const storedAlias =
//           localStorage.getItem(LOCAL_STORAGE_ALIAS_NICKNAME) || "Restored User";

//         const newProfile = {
//           userID: `UserID_${icpAddress}` as UserID,
//           nickname: storedAlias,
//           icpPublicAddress: icpAddress,
//           evmPublicAddress: evmAddress,
//           seedPhrase: seedPhrase,
//           note: "",
//           avatar: "",
//         };

//         const profile = await addProfile(newProfile);
//         await selectProfile(profile);
//         return profile;
//       } catch (error) {
//         console.error("Failed to generate addresses:", error);
//         throw error;
//       }
//     },
//     []
//   );

//   // Generate signature using ICP identity
//   const generateSignature = useCallback(
//     async (message: string): Promise<string | null> => {
//       try {
//         if (!profile) {
//           console.error("ICP account not initialized");
//           return null;
//         }
//         const identity = profile.icpAccount.identity;

//         // Use the raw public key for signature verification
//         const rawPublicKey = identity.getPublicKey().toRaw();
//         const publicKeyArray = Array.from(new Uint8Array(rawPublicKey));

//         // Get the canonical principal
//         const canonicalPrincipal = identity.getPrincipal().toString();

//         const now = Date.now();

//         // Build the challenge
//         const challenge = {
//           timestamp_ms: now,
//           message: message,
//           self_auth_principal: publicKeyArray,
//           canonical_principal: canonicalPrincipal,
//         };

//         // Serialize and sign the challenge
//         const challengeBytes = new TextEncoder().encode(
//           JSON.stringify(challenge)
//         );
//         const signature = await identity.sign(challengeBytes);
//         const signatureArray = Array.from(new Uint8Array(signature));

//         // Build and encode the proof
//         const proof = {
//           auth_type: "SIGNATURE",
//           challenge,
//           signature: signatureArray,
//         };

//         return btoa(JSON.stringify(proof));
//       } catch (error) {
//         console.error("Signature generation error:", error);
//         return null;
//       }
//     },
//     [profile?.icpAccount]
//   );

//   const generateNewAccount = async () => {
//     // generate new seed phrase
//     const seedPhrase = (generate(12) as string[]).join(" ");
//     // call importProfileFromSeed
//     const newProfile = await importProfileFromSeed(seedPhrase);

//     // return auth profile
//     return newProfile;
//   };

//   // Initialize from localStorage on component mount
//   useEffect(() => {
//     const initializeFromStorage = async () => {
//       const localStorageICPPublicAddress = localStorage.getItem(
//         LOCAL_STORAGE_ICP_PUBLIC_ADDRESS
//       );
//       const restored_user_id =
//         `UserID_${localStorageICPPublicAddress}` as UserID;

//       if (localStorageICPPublicAddress) {
//         try {
//           const existing_restored_profile =
//             await queryExistingProfile(restored_user_id);
//           if (existing_restored_profile) {
//             await selectProfile(existing_restored_profile);
//             setIsInitialized(true);
//           } else {
//             generateNewAccount();
//             setIsInitialized(true);
//           }
//           // check if  exists in indexdb
//         } catch (error) {
//           console.error(
//             "Failed to initialize from stored seed phrases:",
//             error
//           );
//         }
//       } else {
//         generateNewAccount();
//         setIsInitialized(true); // Mark as initialized even if no stored phrases
//       }
//     };

//     initializeFromStorage();
//   }, [importProfileFromSeed]);

//   const contextValue = {
//     currentProfile: profile,
//     importProfileFromSeed,
//     generateSignature,
//     isInitialized,
//     generateNewAccount,
//   };

//   return (
//     <IdentityContext.Provider value={contextValue}>
//       {children}
//     </IdentityContext.Provider>
//   );
// };

// // Custom hook to use the identity context
// export const useIdentity = () => {
//   const context = useContext(IdentityContext);
//   if (context === undefined) {
//     throw new Error("useIdentity must be used within an IdentityProvider");
//   }
//   return context;
// };

// // Export default hook for backward compatibility if needed
// export default useIdentity;

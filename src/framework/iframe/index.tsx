import {
  createContext,
  useState,
  useEffect,
  useCallback,
  useContext,
  ReactNode,
  useRef,
} from "react";
import { useIdentitySystem } from "../identity";
import { DriveID } from "@officexapp/types";
import { message } from "antd";

// Cryptography imports for deterministic mnemonics
import { hexToBytes, sha256 } from "viem";
import { entropyToMnemonic } from "@scure/bip39";
import { wordlist } from "@scure/bip39/wordlists/english";

// Types for iframe communication
interface IFrameMessage {
  type: string;
  data: any;
  tracer?: string;
}

interface EphemeralConfig {
  orgSeed: string;
  profileSeed: string;
}

interface InitData {
  ephemeral?: EphemeralConfig;
}

interface EphemeralConnection {
  domain: string;
  orgID: string;
  profileID: string;
}

// Context type definition
interface IFrameContextType {
  isIFrameMode: boolean;
  parentOrigin: string | null;
  isInitialized: boolean;
  currentConnection: EphemeralConnection | null;
  sendMessageToParent: (type: string, data: any, tracer?: string) => void;
}

// Create the context
const IFrameContext = createContext<IFrameContextType | undefined>(undefined);

// Helper function to generate a deterministic mnemonic from a string
const generateDeterministicMnemonic = (secret: string): string => {
  const secretBytes = new TextEncoder().encode(secret);
  const entropyHex = sha256(secretBytes);
  const entropyBytes = hexToBytes(entropyHex);
  return entropyToMnemonic(entropyBytes, wordlist);
};

// Provider component
export function IFrameProvider({ children }: { children: ReactNode }) {
  const {
    createOrganization,
    createProfile,
    switchOrganization,
    switchProfile,
    deriveProfileFromSeed,
    readOrganization,
    readProfile,
    updateOrganization,
  } = useIdentitySystem();

  // State
  const [isIFrameMode, setIsIFrameMode] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);
  const [currentConnection, setCurrentConnection] =
    useState<EphemeralConnection | null>(null);

  // Refs
  const parentOriginRef = useRef<string | null>(null);
  const heartbeatIntervalRef = useRef<number | null>(null);

  // Send message to parent window
  const sendMessageToParent = useCallback(
    (type: string, data: any, tracer?: string) => {
      const targetOrigin = parentOriginRef.current;
      if (!isIFrameMode || !targetOrigin) {
        console.warn(
          "Cannot send message: not in iframe mode or no parent origin"
        );
        return;
      }
      const message: IFrameMessage = { type, data, tracer };
      if (window.parent && window.parent !== window) {
        window.parent.postMessage(message, targetOrigin);
      }
    },
    [isIFrameMode]
  );

  // Effect to clean up heartbeat interval
  useEffect(() => {
    return () => {
      if (heartbeatIntervalRef.current) {
        clearInterval(heartbeatIntervalRef.current);
      }
    };
  }, []);

  // Extract clean domain from origin
  const extractDomainFromOrigin = useCallback((origin: string): string => {
    try {
      const url = new URL(origin);
      return url.hostname;
    } catch {
      return origin;
    }
  }, []);

  // Handle ephemeral initialization
  const handleEphemeralInit = useCallback(
    async (
      ephemeralConfig: EphemeralConfig,
      origin: string,
      tracer?: string
    ) => {
      try {
        message.info("Starting ephemeral initialization...");
        const domain = extractDomainFromOrigin(origin);

        // 1. Deterministically generate org and profile IDs from seeds
        const profileMnemonic = generateDeterministicMnemonic(
          `${domain}-profile-${ephemeralConfig.profileSeed}`
        );
        const orgMnemonic = generateDeterministicMnemonic(
          `${domain}-organization-${ephemeralConfig.orgSeed}`
        );

        const derivedProfile = await deriveProfileFromSeed(profileMnemonic);
        const orgIdentityProfile = await deriveProfileFromSeed(orgMnemonic);
        const orgDriveID =
          `DriveID_${orgIdentityProfile.icpPublicAddress}` as DriveID;

        // 2. Check for existing Organization, or create if it doesn't exist.
        let targetOrg = await readOrganization(orgDriveID);

        if (targetOrg) {
          console.log("Found existing organization:", targetOrg.driveID);
          // If org exists, ensure the current domain is allowed
          if (!targetOrg.allowedDomains.includes(domain)) {
            targetOrg.allowedDomains.push(domain);
            await updateOrganization(targetOrg);
            message.info(`Added ${domain} to existing org.`);
          }
        } else {
          console.log("No existing organization found, creating new one...");
          targetOrg = await createOrganization({
            driveID: orgDriveID,
            nickname: `Org ${domain}`,
            icpPublicAddress: orgIdentityProfile.icpPublicAddress,
            endpoint: "",
            note: `Created via iframe from ${domain}`,
            defaultProfile: "",
            allowedDomains: [domain],
          });
          message.success(`New organization for ${domain} created.`);
        }

        // 3. Check for existing Profile, or create if it doesn't exist.
        let targetProfile = await readProfile(derivedProfile.userID);

        if (targetProfile) {
          console.log("Found existing profile:", targetProfile.userID);
        } else {
          console.log("No existing profile found, creating new one...");
          derivedProfile.nickname = `Profile ${domain}`;
          derivedProfile.note = `Created via iframe from ${domain}`;
          targetProfile = await createProfile(derivedProfile);
          message.success(`New profile for ${domain} created.`);
        }

        // 4. Switch to the target org and profile
        await switchOrganization(targetOrg, targetProfile.userID);
        await switchProfile(targetProfile);

        setCurrentConnection({
          domain,
          orgID: targetOrg.driveID,
          profileID: targetProfile.userID,
        });

        setIsInitialized(true);

        sendMessageToParent(
          "officex-init-response",
          {
            success: true,
            mode: "ephemeral",
            orgID: targetOrg.driveID,
            profileID: targetProfile.userID,
            isPersistent: true,
            domain: domain,
          },
          tracer
        );
      } catch (error) {
        console.error("Ephemeral init failed:", error);
        sendMessageToParent(
          "officex-init-response",
          {
            success: false,
            error: error instanceof Error ? error.message : "Unknown error",
          },
          tracer
        );
      }
    },
    [
      extractDomainFromOrigin,
      deriveProfileFromSeed,
      readOrganization,
      createOrganization,
      updateOrganization,
      readProfile,
      createProfile,
      switchOrganization,
      switchProfile,
      sendMessageToParent,
    ]
  );

  // ... (the rest of your IFrameProvider component remains unchanged)

  // Handle init message
  const handleInitMessage = useCallback(
    async (initData: InitData, origin: string, tracer?: string) => {
      if (initData.ephemeral) {
        if (!parentOriginRef.current) {
          parentOriginRef.current = origin;
          setIsIFrameMode(true);

          if (heartbeatIntervalRef.current)
            clearInterval(heartbeatIntervalRef.current);
          heartbeatIntervalRef.current = window.setInterval(() => {
            sendMessageToParent("officex-heartbeat", { timestamp: Date.now() });
          }, 2000);
        }

        await handleEphemeralInit(initData.ephemeral, origin, tracer);
      } else {
        const message: IFrameMessage = {
          type: "officex-init-response",
          data: {
            success: false,
            error: "Invalid init data: must provide ephemeral config",
          },
          tracer,
        };
        if (window.parent && window.parent !== window) {
          window.parent.postMessage(message, origin);
        }
      }
    },
    [handleEphemeralInit, sendMessageToParent]
  );

  // Handle go-to-page message
  const handleGoToPageMessage = useCallback(
    (data: any, origin: string, tracer?: string) => {
      if (!isInitialized || parentOriginRef.current !== origin) {
        return;
      }

      const { route } = data;

      if (typeof route === "string" && route.startsWith("org/current/")) {
        window.location.href = `/${route}`;

        sendMessageToParent(
          "officex-go-to-page-response",
          { success: true, route: route },
          tracer
        );
      } else {
        sendMessageToParent(
          "officex-go-to-page-response",
          {
            success: false,
            error: "Invalid route: only org/current/* routes are allowed",
            attemptedRoute: route,
          },
          tracer
        );
      }
    },
    [isInitialized, sendMessageToParent]
  );

  // Handle incoming messages from parent
  useEffect(() => {
    const handleMessage = async (event: MessageEvent) => {
      if (!event.origin || event.origin === "null") return;

      const { type, data, tracer }: IFrameMessage = event.data;

      switch (type) {
        case "officex-init":
          await handleInitMessage(data as InitData, event.origin, tracer);
          break;
        case "officex-go-to-page":
          handleGoToPageMessage(data, event.origin, tracer);
          break;
        default:
          // It's good practice to ignore unknown message types
          break;
      }
    };

    window.addEventListener("message", handleMessage);

    return () => {
      window.removeEventListener("message", handleMessage);
    };
  }, [handleInitMessage, handleGoToPageMessage]);

  // Context value
  const contextValue: IFrameContextType = {
    isIFrameMode,
    parentOrigin: parentOriginRef.current,
    isInitialized,
    currentConnection,
    sendMessageToParent,
  };

  return (
    <IFrameContext.Provider value={contextValue}>
      {children}
    </IFrameContext.Provider>
  );
}

// Hook to use the context
export function useIFrame() {
  const context = useContext(IFrameContext);

  if (context === undefined) {
    throw new Error("useIFrame must be used within an IFrameProvider");
  }

  return context;
}

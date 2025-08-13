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
import {
  DiskID,
  DiskTypeEnum,
  DriveID,
  FileConflictResolutionEnum,
  FileID,
  FolderID,
  LabelValue,
  ExternalID,
  ExternalPayload,
  UserID,
  ApiKeyValue,
} from "@officexapp/types";
import { message } from "antd";
import { v4 as uuidv4 } from "uuid";

// Cryptography imports for deterministic mnemonics
import { hexToBytes, sha256 } from "viem";
import { entropyToMnemonic } from "@scure/bip39";
import { wordlist } from "@scure/bip39/wordlists/english";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { getMimeTypeFromExtension } from "../drive/helpers";
import {
  createFileAction,
  createFolderAction,
  generateListDirectoryKey,
  updateFileAction,
} from "../../redux-offline/directory/directory.actions";
import { useMultiUploader } from "../uploader/hook";

// Types for iframe communication
interface IFrameMessage {
  type: string;
  data: any;
  tracer?: string;
  success?: boolean;
  error?: string;
}

interface EphemeralConfig {
  optional_org_entropy: string;
  optional_profile_entropy: string;
  org_name: string;
  profile_name: string;
}

interface InjectedConfig {
  host: string;
  drive_id: DriveID;
  org_name?: string;
  user_id: UserID;
  profile_name?: string;
  api_key_value?: ApiKeyValue; // only provide apiKey if you are subsidizing for users
  redirect_to?: string; // optional, default is the drive path
}

interface InitData {
  ephemeral?: EphemeralConfig;
  injected?: InjectedConfig;
}

interface CurrentConnection {
  domain: string;
  orgID: string;
  profileID: string;
  org_name: string;
  profile_name: string;
}

// About Child IFrame Instance response type
interface AboutChildIFrameInstanceResponse {
  organization_name: string;
  drive_id: string;
  user_id: string;
  profile_name: string;
  host?: string;
  frontend_domain?: string;
  frontend_url?: string;
  current_url?: string;
}

interface AuthTokenIFrameResponse {
  drive_id: string;
  user_id: string;
  host?: string;
  auth_token: string;
}

// REST Command types for CREATE_FILE
interface CreateFileCommandPayload {
  name: string;
  file_size?: number;
  expires_at?: number;
  raw_url?: string;
  base64?: string;
  parent_folder_uuid?: FolderID; // Optional parent folder ID
}

interface CreateFileCommand {
  action: "CREATE_FILE";
  payload: CreateFileCommandPayload;
}

// REST Command types for CREATE_FOLDER
interface CreateFolderCommandPayload {
  name: string;
  labels?: LabelValue[];
  expires_at?: number;
  file_conflict_resolution?: FileConflictResolutionEnum;
  has_sovereign_permissions?: boolean;
  shortcut_to?: FolderID;
  external_id?: ExternalID;
  external_payload?: ExternalPayload;
  parent_folder_uuid?: FolderID; // Optional parent folder ID
}

interface CreateFolderCommand {
  action: "CREATE_FOLDER";
  payload: CreateFolderCommandPayload;
}

// Union type for all REST commands
type RestCommand = CreateFileCommand | CreateFolderCommand;

// Context type definition
interface IFrameContextType {
  isIFrameMode: boolean;
  parentOrigin: string | null;
  isInitialized: boolean;
  currentConnection: CurrentConnection | null;
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

// Global emitter function type
type GlobalEmitFunction = (message: IFrameMessage) => void;

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
    wrapOrgCode,
    currentOrg,
    currentProfile,
    currentAPIKey,
    generateSignature,
    createApiKey,
  } = useIdentitySystem();

  const dispatch = useDispatch();
  const { uploadFiles } = useMultiUploader();

  // State
  const [isIFrameMode, setIsIFrameMode] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);
  const [currentConnection, setCurrentConnection] =
    useState<CurrentConnection | null>(null);
  const navigate = useNavigate();

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

  // Global emit function that uses the provider's context
  const globalEmit: GlobalEmitFunction = useCallback(
    (message: IFrameMessage) => {
      sendMessageToParent(
        message.type,
        {
          success: message.success,
          data: message.data,
          error: message.error,
        },
        message.tracer
      );
    },
    [sendMessageToParent]
  );

  // Set up global emitter when provider initializes
  useEffect(() => {
    // Expose globally
    window.iframeEmit = globalEmit;

    return () => {
      // Clean up on unmount
      delete window.iframeEmit;
    };
  }, [globalEmit]);

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

  // Handle About Child IFrame Instance request
  const handleAboutChildIFrameInstance = useCallback(
    async (origin: string, tracer?: string) => {
      try {
        if (!isInitialized || parentOriginRef.current !== origin) {
          sendMessageToParent(
            "officex-about-child-iframe-instance-response",
            {
              success: false,
              error: "IFrame not initialized or unauthorized origin",
            },
            tracer
          );
          return;
        }

        if (!currentOrg || !currentProfile) {
          sendMessageToParent(
            "officex-about-child-iframe-instance-response",
            {
              success: false,
              error: "No current organization or profile found",
            },
            tracer
          );
          return;
        }

        const response: AboutChildIFrameInstanceResponse = {
          organization_name:
            currentOrg.nickname || `Org ${currentConnection?.domain}`,
          drive_id: currentOrg.driveID,
          user_id: currentProfile.userID,
          profile_name:
            currentProfile.nickname || `Profile ${currentConnection?.domain}`,
          host: currentOrg.host || undefined,
          frontend_domain: `${window.location.origin}`,
          frontend_url: `${window.location.origin}${wrapOrgCode("")}`,
          current_url: `${window.location.href}`,
        };

        sendMessageToParent(
          "officex-about-child-iframe-instance-response",
          {
            success: true,
            data: response,
          },
          tracer
        );
      } catch (error) {
        console.error("About Child IFrame Instance failed:", error);
        sendMessageToParent(
          "officex-about-child-iframe-instance-response",
          {
            success: false,
            error: error instanceof Error ? error.message : "Unknown error",
          },
          tracer
        );
      }
    },
    [
      isInitialized,
      currentConnection,
      currentOrg,
      currentProfile,
      sendMessageToParent,
    ]
  );

  const handleAuthTokenRequestIFrame = async (
    origin: string,
    tracer?: string
  ) => {
    try {
      if (!isInitialized || parentOriginRef.current !== origin) {
        sendMessageToParent(
          "officex-auth-token-response",
          {
            success: false,
            error: "IFrame not initialized or unauthorized origin",
          },
          tracer
        );
        return;
      }

      // Get current organization and profile
      let auth_token = currentAPIKey?.value || (await generateSignature());

      if (!currentOrg || !currentProfile || !auth_token) {
        sendMessageToParent(
          "officex-auth-token-response",
          {
            success: false,
            error: "No current organization or profile or auth_token found",
          },
          tracer
        );
        return;
      }

      const response: AuthTokenIFrameResponse = {
        drive_id: currentOrg.driveID,
        user_id: currentProfile.userID,
        host: currentOrg.host || undefined,
        auth_token: auth_token,
      };

      sendMessageToParent(
        "officex-auth-token-response",
        {
          success: true,
          data: response,
        },
        tracer
      );
    } catch (error) {
      console.error("Auth Token Request failed:", error);
      sendMessageToParent(
        "officex-auth-token-response",
        {
          success: false,
          error: error instanceof Error ? error.message : "Unknown error",
        },
        tracer
      );
    }
  };

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
          `${domain}-profile-${ephemeralConfig.optional_profile_entropy}`
        );
        const orgMnemonic = generateDeterministicMnemonic(
          `${domain}-organization-${ephemeralConfig.optional_org_entropy}`
        );

        const derivedProfile = await deriveProfileFromSeed(profileMnemonic);
        const orgIdentityProfile = await deriveProfileFromSeed(orgMnemonic);
        const orgDriveID =
          `DriveID_${orgIdentityProfile.icpPublicAddress}` as DriveID;

        // 2. Check for existing Organization, or create if it doesn't exist.
        let targetOrg = await readOrganization(orgDriveID);

        if (targetOrg) {
          console.log("Found existing organization:", targetOrg.driveID);
        } else {
          console.log("No existing organization found, creating new one...");
          targetOrg = await createOrganization({
            driveID: orgDriveID,
            nickname: `${domain} | ${ephemeralConfig.org_name}`,
            icpPublicAddress: orgIdentityProfile.icpPublicAddress,
            host: "",
            note: `Created via iframe from ${domain}`,
            defaultProfile: "",
          });
          message.success(`New organization for ${domain} created.`);
        }

        // 3. Check for existing Profile, or create if it doesn't exist.
        let targetProfile = await readProfile(derivedProfile.userID);

        if (targetProfile) {
          console.log("Found existing profile:", targetProfile.userID);
        } else {
          console.log("No existing profile found, creating new one...");
          derivedProfile.nickname = `${domain} | ${ephemeralConfig.profile_name}`;
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
          org_name: `${domain} | ${ephemeralConfig.org_name}`,
          profile_name: `${domain} | ${ephemeralConfig.profile_name}`,
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

  const handleInjectedInit = useCallback(
    async (injectedConfig: InjectedConfig, origin: string, tracer?: string) => {
      try {
        message.info("Starting ephemeral initialization...");
        const domain = extractDomainFromOrigin(origin);
        const {
          host,
          drive_id,
          org_name,
          user_id,
          profile_name,
          api_key_value, // only provide apiKey if you are subsidizing for users
          redirect_to, // optional, default is the drive path
        } = injectedConfig;

        // check if injectedConfig.user_id & injectedConfig.drive_id already exist in indexdb, switch to it if found

        let targetOrg = await readOrganization(drive_id);

        if (!targetOrg) {
          console.log("No existing organization found, creating new one...");
          targetOrg = await createOrganization({
            driveID: drive_id,
            nickname: `${domain} | ${org_name || "Org"}`,
            icpPublicAddress: drive_id.replace("DriveID_", ""),
            host: host,
            note: `Created via iframe from ${domain}`,
            defaultProfile: "",
          });
          message.success(`New organization for ${domain} created.`);
        }

        // 3. Check for existing Profile, or create if it doesn't exist.
        let targetProfile = await readProfile(user_id);

        if (!targetProfile) {
          console.log("No existing profile found, creating new one...");
          if (!api_key_value) {
            // report error to tracer and end early
            sendMessageToParent(
              "officex-init-response",
              {
                success: false,
                error: "API key value is required if no existing profile found",
              },
              tracer
            );
            return;
          }
          const newProfile = {
            userID: user_id,
            nickname: `${domain} | ${profile_name || "Profile"}`,
            icpPublicAddress: user_id.replace("UserID_", ""),
            evmPublicAddress: "",
            seedPhrase: "",
            note: `Created via iframe from ${domain}`,
            avatar: "",
          };
          targetProfile = await createProfile(newProfile);
          // use injectedConfig.api_key_value to create a new org and profile
          await createApiKey({
            apiKeyID: `ApiKey_${uuidv4()}`,
            userID: user_id,
            driveID: drive_id,
            note: `Created via iframe from ${domain}`,
            value: api_key_value,
            host: host,
          });
          message.success(`New profile for ${domain} created.`);
        }

        // 4. Switch to the target org and profile
        await switchOrganization(targetOrg, targetProfile.userID);
        await switchProfile(targetProfile);

        setCurrentConnection({
          domain,
          orgID: targetOrg.driveID,
          profileID: targetProfile.userID,
          org_name: `${domain} | ${org_name}`,
          profile_name: `${domain} | ${profile_name}`,
        });

        setIsInitialized(true);

        sendMessageToParent(
          "officex-init-response",
          {
            success: true,
            mode: "injected",
            orgID: targetOrg.driveID,
            profileID: targetProfile.userID,
            isPersistent: true,
            domain: domain,
          },
          tracer
        );

        if (redirect_to) {
          navigate(redirect_to);
        }

        // await 500ms and refresh page
        await new Promise((resolve) => setTimeout(resolve, 500));
        window.location.reload();
      } catch (error) {
        console.error("Injected init failed:", error);
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
    []
  );

  // Handle init message
  const handleInitMessage = useCallback(
    async (initData: InitData, origin: string, tracer?: string) => {
      if (!parentOriginRef.current) {
        parentOriginRef.current = origin;
        setIsIFrameMode(true);

        //   if (heartbeatIntervalRef.current)
        //     clearInterval(heartbeatIntervalRef.current);
        //   heartbeatIntervalRef.current = window.setInterval(() => {
        //     sendMessageToParent("officex-heartbeat", { timestamp: Date.now() });
        //   }, 2000);
      }

      if (initData.ephemeral) {
        await handleEphemeralInit(initData.ephemeral, origin, tracer);
      } else if (initData.injected) {
        await handleInjectedInit(initData.injected, origin, tracer);
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

      if (typeof route === "string" && route.startsWith("/org/current/")) {
        try {
          // Remove "/org/current/" prefix and get the actual route
          const actualRoute = route.replace("/org/current/", "");

          // Use wrapOrgCode to create the proper organization-specific route
          const wrappedRoute = wrapOrgCode(`/${actualRoute}`);

          // Navigate using React Router
          navigate(wrappedRoute);

          sendMessageToParent(
            "officex-go-to-page-response",
            { success: true, route: wrappedRoute },
            tracer
          );
        } catch (error) {
          console.error("Navigation error:", error);
          sendMessageToParent(
            "officex-go-to-page-response",
            {
              success: false,
              error: "Navigation failed",
              attemptedRoute: route,
            },
            tracer
          );
        }
      } else {
        sendMessageToParent(
          "officex-go-to-page-response",
          {
            success: false,
            error: "Invalid route: only /org/current/* routes are allowed",
            attemptedRoute: route,
          },
          tracer
        );
      }
    },
    [isInitialized, sendMessageToParent, navigate, wrapOrgCode]
  );

  const handleRestCommandIFrame = useCallback(
    async (data: RestCommand, origin: string, tracer?: string) => {
      if (!isInitialized || parentOriginRef.current !== origin) {
        sendMessageToParent(
          "officex-rest-command-response",
          {
            success: false,
            error: "IFrame not initialized or unauthorized origin",
          },
          tracer
        );
        return;
      }

      try {
        // Default values used by both file and folder creation
        const diskType = DiskTypeEnum.BrowserCache;
        const diskID = "DiskID_offline-local-browser-cache" as DiskID;
        const defaultParentFolderID =
          "FolderID_root-folder-offline-local-browser-cache" as FolderID;

        if (data.action === "CREATE_FILE") {
          const { payload } = data;

          // Use provided parent folder ID or default
          const parentFolderID =
            payload.parent_folder_uuid || defaultParentFolderID;

          // Generate file ID
          const fileID = `FileID_${uuidv4()}` as FileID;

          // Extract file extension
          const extension = payload.name.split(".").pop() || "";

          // If base64 is provided, we need to convert it to a File object and store it
          if (payload.base64) {
            // Convert base64 to blob
            const byteCharacters = atob(payload.base64);
            const byteNumbers = new Array(byteCharacters.length);
            for (let i = 0; i < byteCharacters.length; i++) {
              byteNumbers[i] = byteCharacters.charCodeAt(i);
            }
            const byteArray = new Uint8Array(byteNumbers);

            // Determine MIME type from extension
            const mimeType =
              getMimeTypeFromExtension(extension) || "application/octet-stream";
            const blob = new Blob([byteArray], { type: mimeType });

            // Create File object
            const file = new File([blob], payload.name, { type: mimeType });

            // Use uploadFiles from useMultiUploader to handle the actual storage
            const uploadFilesArray = [
              {
                file,
                fileID: fileID,
              },
            ];

            uploadFiles(uploadFilesArray, parentFolderID, diskType, diskID, {
              onFileComplete: (fileUUID) => {
                console.log(`IFrame file upload completed: ${fileUUID}`);
              },
              metadata: {
                dispatch,
              },
              parentFolderID: parentFolderID,
              listDirectoryKey: generateListDirectoryKey({
                folder_id: parentFolderID,
              }),
            });

            sendMessageToParent(
              "officex-rest-command-response",
              {
                success: true,
                data: {
                  fileID,
                  diskID,
                  diskType,
                  parentFolderID,
                  message: "File upload initiated successfully",
                  name: payload.name,
                },
              },
              tracer
            );
          } else if (payload.raw_url) {
            // Handle URL-based file creation
            const createAction = {
              action: "CREATE_FILE" as const,
              payload: {
                id: fileID,
                name: payload.name,
                parent_folder_uuid: parentFolderID,
                extension: extension,
                labels: [],
                file_size: payload.file_size || 0,
                disk_id: diskID,
                disk_type: diskType,
                expires_at: payload.expires_at || -1,
                file_conflict_resolution: FileConflictResolutionEnum.KEEP_BOTH,
                raw_url: payload.raw_url,
              },
            };

            // Dispatch create action
            dispatch(
              createFileAction(
                createAction,
                generateListDirectoryKey({ folder_id: parentFolderID }),
                true
              )
            );

            sendMessageToParent(
              "officex-rest-command-response",
              {
                success: true,
                data: {
                  fileID,
                  diskID,
                  diskType,
                  parentFolderID,
                  raw_url: payload.raw_url,
                  message: "File created successfully with URL",
                  name: payload.name,
                },
              },
              tracer
            );
          } else {
            sendMessageToParent(
              "officex-rest-command-response",
              {
                success: false,
                error: "Neither base64 nor raw_url provided",
              },
              tracer
            );
          }
        } else if (data.action === "CREATE_FOLDER") {
          const { payload } = data;

          // Use provided parent folder ID or default
          const parentFolderID =
            payload.parent_folder_uuid || defaultParentFolderID;

          // Generate folder ID
          const folderID = `FolderID_${uuidv4()}` as FolderID;

          const createAction = {
            action: "CREATE_FOLDER" as const,
            payload: {
              id: folderID,
              name: payload.name,
              parent_folder_uuid: parentFolderID,
              labels: payload.labels || [],
              disk_id: diskID,
              disk_type: diskType,
              expires_at: payload.expires_at || -1, // Never expires by default
              file_conflict_resolution:
                payload.file_conflict_resolution ||
                FileConflictResolutionEnum.KEEP_BOTH,
              has_sovereign_permissions:
                payload.has_sovereign_permissions || false,
              shortcut_to: payload.shortcut_to,
              external_id: payload.external_id,
              external_payload: payload.external_payload,
            },
          };

          // Dispatch create folder action
          dispatch(
            createFolderAction(
              createAction,
              generateListDirectoryKey({ folder_id: parentFolderID }),
              true
            )
          );

          sendMessageToParent(
            "officex-rest-command-response",
            {
              success: true,
              data: {
                folderID,
                diskID,
                diskType,
                parentFolderID,
                message: "Folder created successfully",
                name: payload.name,
              },
            },
            tracer
          );
        } else {
          sendMessageToParent(
            "officex-rest-command-response",
            {
              success: false,
              error: `Unknown action: ${(data as any).action}`,
            },
            tracer
          );
        }
      } catch (error) {
        console.error("REST command failed:", error);
        sendMessageToParent(
          "officex-rest-command-response",
          {
            success: false,
            error: error instanceof Error ? error.message : "Unknown error",
          },
          tracer
        );
      }
    },
    [isInitialized, sendMessageToParent, uploadFiles, dispatch]
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
        // case "officex-switch-profile-org":
        //   await handleSwitchProfileOrgMessage(data, event.origin, tracer);
        //   break;
        case "officex-go-to-page":
          handleGoToPageMessage(data, event.origin, tracer);
          break;
        case "officex-about-iframe":
          await handleAboutChildIFrameInstance(event.origin, tracer);
          break;
        case "officex-auth-token":
          await handleAuthTokenRequestIFrame(event.origin, tracer);
          break;
        case "officex-rest-command":
          await handleRestCommandIFrame(data, event.origin, tracer);
          break;
        default:
          // For any other message type, broadcast it as a DOM event
          // Your app components can listen and respond via window.iframeEmit()
          if (isInitialized && parentOriginRef.current === event.origin) {
            document.dispatchEvent(
              new CustomEvent("iframe-message-received", {
                detail: { type, data, tracer, origin: event.origin },
              })
            );
          }
          break;
      }
    };

    window.addEventListener("message", handleMessage);

    return () => {
      window.removeEventListener("message", handleMessage);
    };
  }, [
    handleInitMessage,
    handleGoToPageMessage,
    handleAboutChildIFrameInstance,
    handleAuthTokenRequestIFrame,
    handleRestCommandIFrame,
    isInitialized,
  ]);

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

// Global type declaration
declare global {
  interface Window {
    iframeEmit?: (message: IFrameMessage) => void;
  }
}

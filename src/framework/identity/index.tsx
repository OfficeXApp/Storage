import {
  createContext,
  useState,
  useEffect,
  useCallback,
  useContext,
  ReactNode,
  useRef,
} from "react";
import { v4 as uuidv4 } from "uuid";
import {
  hexStringToUint8Array,
  LOCAL_STORAGE_ALIAS_NICKNAME,
  LOCAL_STORAGE_EVM_PUBLIC_ADDRESS,
  LOCAL_STORAGE_ICP_PUBLIC_ADDRESS,
  LOCAL_STORAGE_ORGANIZATION_DRIVE_ID,
  LOCAL_STORAGE_SEED_PHRASE,
  shortenAddress,
} from "./constants";
import {
  DriveID,
  EvmPublicAddress,
  ICPPrincipalString,
  UserID,
} from "@officexapp/types";
import { Ed25519KeyIdentity } from "@dfinity/identity";
import { Principal } from "@dfinity/principal";
import { mnemonicToAccount } from "viem/accounts";
import { mnemonicToSeed, mnemonicToSeedSync } from "@scure/bip39";
import { generate } from "random-words";
import { generateRandomSeed } from "../../api/icp";
import {
  closeDexieDb,
  deleteDexieDb,
  getDexieDb,
  initDexieDb,
} from "../../api/dexie-database";
import { listContactsAction } from "../../redux-offline/contacts/contacts.actions";
import { listDisksAction } from "../../redux-offline/disks/disks.actions";
import { listDrivesAction } from "../../redux-offline/drives/drives.actions";
import { listGroupsAction } from "../../redux-offline/groups/groups.actions";
import { listLabelsAction } from "../../redux-offline/labels/labels.actions";
import { useParams } from "react-router-dom";
import { urlSafeBase64Decode, urlSafeBase64Encode } from "../../api/helpers";
import { Button, message, notification, Space } from "antd";
import LoadingAnimation from "../../components/NotFound/LoadingAnimation";

// Define types for our data structures
export interface IndexDB_Organization {
  driveID: string;
  nickname: string;
  icpPublicAddress: string;
  host: string;
  note: string;
  defaultProfile: string; // the userID string of a IndexDB_Profile
}

export interface IndexDB_Profile {
  userID: string;
  nickname: string;
  icpPublicAddress: string;
  evmPublicAddress: string;
  seedPhrase: string;
  note: string;
  avatar: string;
}

export interface IndexDB_ApiKey {
  apiKeyID: string;
  userID: string;
  driveID: string;
  note: string;
  value: string;
  host: string;
}

export interface IndexDB_AgenticKeyGrant {
  agenticKeyGrantID: string;
  profileID: UserID;
  driveID: DriveID;
  host: string;
  note: string;
  apiKeyID: string;
  apiKeyValue: string;
  domain: string;
}

export interface AuthProfile {
  evmPublicKey: EvmPublicAddress;
  icpPublicKey: ICPPrincipalString;
  icpAccount: {
    identity: Ed25519KeyIdentity;
    principal: Principal;
  } | null;
  slug: string;
  nickname: string;
  userID: UserID;
}

// Context type definition
interface IdentitySystemContextType {
  isInitialized: boolean;
  error: Error | null;

  isOfflineOrg: boolean;

  currentOrg: IndexDB_Organization | null;
  currentProfile: AuthProfile | null;
  currentAPIKey: IndexDB_ApiKey | null;

  listOfOrgs: IndexDB_Organization[];
  listOfProfiles: IndexDB_Profile[];

  listOrganizations: () => Promise<IndexDB_Organization[]>;
  createOrganization: ({
    driveID,
    nickname,
    icpPublicAddress,
    host,
    note,
    defaultProfile,
  }: {
    driveID: DriveID;
    nickname: string;
    icpPublicAddress: string;
    host: string;
    note: string;
    defaultProfile: string;
  }) => Promise<IndexDB_Organization>;
  readOrganization: (driveID: DriveID) => Promise<IndexDB_Organization | null>;
  updateOrganization: (org: IndexDB_Organization) => Promise<void>;
  deleteOrganization: (driveID: DriveID) => Promise<void>;
  switchOrganization: (
    org: IndexDB_Organization,
    defaultProfile?: string
  ) => void;

  listProfiles: () => Promise<IndexDB_Profile[]>;
  createProfile: (
    profile: Omit<IndexDB_Profile, "userID">
  ) => Promise<IndexDB_Profile>;
  readProfile: (userID: UserID) => Promise<IndexDB_Profile | null>;
  updateProfile: (profile: IndexDB_Profile) => Promise<void>;
  deleteProfile: (userID: UserID) => Promise<void>;
  switchProfile: (profile: IndexDB_Profile) => void;

  createApiKey: (apiKey: IndexDB_ApiKey) => Promise<IndexDB_ApiKey>;
  removeApiKey: (apiKeyID: string) => Promise<void>;

  setAgenticKeyGrant: (
    agenticKeyGrant: IndexDB_AgenticKeyGrant
  ) => Promise<IndexDB_AgenticKeyGrant>;
  getAgenticKeyGrant: (
    agenticKeyGrantID: string
  ) => Promise<IndexDB_AgenticKeyGrant | null>;

  syncLatestIdentities: () => Promise<void>;
  deriveProfileFromSeed: (seedPhrase: string) => Promise<IndexDB_Profile>;
  generateSignature: (auth_profile?: AuthProfile) => Promise<string>;
  hydrateFullAuthProfile: (
    profile: IndexDB_Profile,
    ephemeral?: boolean
  ) => Promise<AuthProfile>;
  wrapOrgCode: (route: string) => string;
}

// Create the context
const IdentitySystemContext = createContext<
  IdentitySystemContextType | undefined
>(undefined);

// Constants for IndexedDB
const DB_NAME = "OFFICEX-local-identity-system";
const DB_VERSION = 1;
const ORGS_STORE_NAME = "organizations";
const PROFILES_STORE_NAME = "profiles";
const API_KEYS_STORE_NAME = "apiKeys";
const API_KEY_GRANTS_STORE_NAME = "apiKeyGrants";

// Function to derive Ed25519 key from seed (uses the first 32 bytes of the seed)
const deriveEd25519KeyFromSeed = async (
  seed: Uint8Array
): Promise<Uint8Array> => {
  const hashBuffer = await crypto.subtle.digest("SHA-256", seed);
  return new Uint8Array(hashBuffer).slice(0, 32); // Ed25519 secret key should be 32 bytes
};

// Provider component
export function IdentitySystemProvider({ children }: { children: ReactNode }) {
  // State declarations
  const db = useRef<IDBDatabase | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const [currentOrg, setCurrentOrg] = useState<IndexDB_Organization | null>(
    null
  );
  const [_currentProfile, _setCurrentProfile] =
    useState<IndexDB_Profile | null>(null);
  const [currentProfile, setCurrentProfile] = useState<AuthProfile | null>(
    null
  );
  const [currentAPIKey, setCurrentAPIKey] = useState<IndexDB_ApiKey | null>(
    null
  );
  const currentProfileRef = useRef(currentProfile);
  const currentOrgRef = useRef(currentOrg);
  const isOfflineOrg = currentOrg?.host === "";
  const [listOfOrgs, setListOfOrgs] = useState<IndexDB_Organization[]>([]);
  const [listOfProfiles, setListOfProfiles] = useState<IndexDB_Profile[]>([]);
  const [listOfAPIKeys, setListOfAPIKeys] = useState<IndexDB_ApiKey[]>([]);

  const listOfOrgsRef = useRef(listOfOrgs);
  const listOfProfilesRef = useRef(listOfProfiles);
  const listOfAPIKeysRef = useRef(listOfAPIKeys);

  useEffect(() => {
    currentProfileRef.current = currentProfile;
    listOfOrgsRef.current = listOfOrgs;
    listOfProfilesRef.current = listOfProfiles;
    listOfAPIKeysRef.current = listOfAPIKeys;
  }, [currentProfile, listOfOrgs, listOfProfiles, listOfAPIKeys]);

  // Initialize IndexedDB when component mounts
  useEffect(() => {
    const initDB = async () => {
      try {
        if (!window.indexedDB) {
          throw new Error("INDEXEDDB_NOT_SUPPORTED");
        }

        const request = window.indexedDB.open(DB_NAME, DB_VERSION);

        request.onerror = (event) => {
          const error = (event.target as IDBOpenDBRequest).error;
          if (error?.name === "QuotaExceededError") {
            setError(new Error("STORAGE_QUOTA_EXCEEDED"));
          } else if (/^Access is denied/.test(error?.message || "")) {
            setError(new Error("PRIVATE_MODE_NOT_SUPPORTED"));
          } else {
            setError(new Error("INDEXEDDB_INITIALIZATION_FAILED"));
          }
        };

        request.onupgradeneeded = (event) => {
          const database = (event.target as IDBOpenDBRequest).result;

          // Create object stores if they don't exist
          if (!database.objectStoreNames.contains(ORGS_STORE_NAME)) {
            database.createObjectStore(ORGS_STORE_NAME, { keyPath: "driveID" });
          }

          if (!database.objectStoreNames.contains(PROFILES_STORE_NAME)) {
            database.createObjectStore(PROFILES_STORE_NAME, {
              keyPath: "userID",
            });
          }

          if (!database.objectStoreNames.contains(API_KEYS_STORE_NAME)) {
            database.createObjectStore(API_KEYS_STORE_NAME, {
              keyPath: "apiKeyID",
            });
          }

          if (!database.objectStoreNames.contains(API_KEY_GRANTS_STORE_NAME)) {
            database.createObjectStore(API_KEY_GRANTS_STORE_NAME, {
              keyPath: "apiKeyGrantID",
            });
          }
        };

        request.onsuccess = async (event) => {
          const database = (event.target as IDBOpenDBRequest).result;
          db.current = database;

          let initial_org_id = "";
          let initial_profile_id = "";

          // Initialize with initial org and profile if provided
          try {
            // Check if profile exists
            const localStorageICPPublicAddress = localStorage.getItem(
              LOCAL_STORAGE_ICP_PUBLIC_ADDRESS
            );
            const local_storage_profile_id =
              `UserID_${localStorageICPPublicAddress}` as UserID;

            const existingProfile = await readProfile(local_storage_profile_id);
            if (localStorageICPPublicAddress && existingProfile) {
              // select profile
              await hydrateFullAuthProfile(existingProfile);
              initial_profile_id = existingProfile.userID;
            } else {
              // Create initial profile
              const seedPhrase = (generate(12) as string[]).join(" ");
              const newProfile = await deriveProfileFromSeed(seedPhrase);
              newProfile.nickname = "Anon";
              await createProfile(newProfile);
              await hydrateFullAuthProfile(newProfile);
              overwriteLocalStorageProfile(newProfile);
              initial_profile_id = newProfile.userID;
            }

            // Check if organization exists LOCAL_STORAGE_ORGANIZATION_DRIVE_ID
            const localStorageOrgDriveID = localStorage.getItem(
              LOCAL_STORAGE_ORGANIZATION_DRIVE_ID
            );
            const existingOrg = await readOrganization(
              localStorageOrgDriveID || ""
            );
            if (existingOrg) {
              setCurrentOrg(existingOrg);
              currentOrgRef.current = existingOrg;
              initial_org_id = existingOrg.driveID;
            } else {
              const seedPhrase = generateRandomSeed();
              const tempProfile = await deriveProfileFromSeed(seedPhrase);
              const newDriveID = `DriveID_${tempProfile.icpPublicAddress}`;

              const newOrg = await createOrganization({
                driveID: newDriveID,
                nickname: "Anonymous Org",
                icpPublicAddress: tempProfile.icpPublicAddress,
                host: "",
                note: "",
              });
              setCurrentOrg(newOrg);
              currentOrgRef.current = newOrg;
              localStorage.setItem(
                LOCAL_STORAGE_ORGANIZATION_DRIVE_ID,
                newOrg.driveID
              );
              initial_org_id = newOrg.driveID;
            }

            if (initial_profile_id && initial_org_id) {
              // load dexie database
              await getDexieDb(initial_profile_id, initial_org_id);
              await initDexieDb(initial_profile_id, initial_org_id);
              // set api key
              try {
                const apiKeys = await listApiKeys();
                const matchingKey = apiKeys.find(
                  (key) =>
                    key.userID === initial_profile_id &&
                    key.driveID === initial_org_id
                );
                if (matchingKey) {
                  setCurrentAPIKey(matchingKey);
                }
              } catch (err) {
                console.log("Error finding API key:", err);
              }
            }

            // Load initial data
            await syncLatestIdentities();

            await enterByOrgCode();
          } catch (err) {
            console.error("Error initializing default data:", err);
            setError(err instanceof Error ? err : new Error(String(err)));
          }
        };
      } catch (err) {
        console.error("Error initializing database:", err);
        setError(err instanceof Error ? err : new Error(String(err)));
      }
    };

    initDB();
  }, []);

  // Internal
  const hydrateFullAuthProfile = async (
    profile: IndexDB_Profile,
    ephemeral = false
  ) => {
    if (!ephemeral) {
      _setCurrentProfile(profile);
    }
    if (profile.seedPhrase) {
      const derivedKey = await deriveEd25519KeyFromSeed(
        mnemonicToSeedSync(profile.seedPhrase || "")
      );
      // Create the identity from the derived key
      const identity = Ed25519KeyIdentity.fromSecretKey(derivedKey);
      const publicKeyBuffer = hexStringToUint8Array(
        profile.icpPublicAddress || ""
      );
      const principal = Principal.selfAuthenticating(publicKeyBuffer);
      const auth_profile = {
        evmPublicKey: profile.evmPublicAddress || "",
        icpPublicKey: profile.icpPublicAddress || "",
        slug: shortenAddress(profile.icpPublicAddress || ""),
        nickname: profile.nickname || "",
        userID: profile.userID || "",
        icpAccount: {
          identity,
          principal,
        },
      };
      if (!ephemeral) {
        setCurrentProfile(auth_profile);
      }
      return auth_profile;
    } else {
      const auth_profile = {
        evmPublicKey: profile.evmPublicAddress || "",
        icpPublicKey: profile.icpPublicAddress || "",
        slug: shortenAddress(profile.icpPublicAddress || ""),
        nickname: profile.nickname || "",
        userID: profile.userID || "",
        icpAccount: null,
      };
      if (!ephemeral) {
        setCurrentProfile(auth_profile);
      }
      return auth_profile;
    }
  };
  const overwriteLocalStorageProfile = useCallback(
    (profile: IndexDB_Profile) => {
      localStorage.setItem(LOCAL_STORAGE_SEED_PHRASE, profile.seedPhrase);
      localStorage.setItem(
        LOCAL_STORAGE_EVM_PUBLIC_ADDRESS,
        profile.evmPublicAddress
      );
      localStorage.setItem(
        LOCAL_STORAGE_ICP_PUBLIC_ADDRESS,
        profile.icpPublicAddress
      );
      localStorage.setItem(LOCAL_STORAGE_ALIAS_NICKNAME, profile.nickname);
    },
    []
  );
  const syncLatestIdentities = useCallback(async () => {
    if (!db) {
      throw new Error("INDEXEDDB_NOT_INITIALIZED");
    }
    const orgs = await listOrganizations();
    setListOfOrgs(orgs);
    const profiles = await listProfiles();
    setListOfProfiles(profiles);
    const apiKeys = await listApiKeys();
    setListOfAPIKeys(apiKeys);

    listOfOrgsRef.current = orgs;
    listOfProfilesRef.current = profiles;
    listOfAPIKeysRef.current = apiKeys;
  }, [db]);

  function getOrgCodeFromUrl() {
    const path = window.location.pathname;

    // Match pattern /org/{orgcode}/ in the URL
    const orgRegex = /\/org\/([^\/]+)/;
    const match = path.match(orgRegex);

    if (match && match[1]) {
      return match[1];
    }

    return "current"; // Default fallback
  }

  const findApiKeyForProfileAndOrg = async (
    userID: string,
    driveID: string
  ): Promise<IndexDB_ApiKey | null> => {
    if (!db.current) {
      throw new Error("INDEXEDDB_NOT_INITIALIZED");
    }
    return new Promise((resolve, reject) => {
      if (!db.current) throw new Error("INDEXEDDB_NOT_INITIALIZED");
      const transaction = db.current.transaction(
        [API_KEYS_STORE_NAME],
        "readonly"
      );
      const store = transaction.objectStore(API_KEYS_STORE_NAME);
      const request = store.getAll();

      request.onerror = () => {
        reject(new Error("GET_API_KEYS_FAILED"));
      };

      request.onsuccess = () => {
        const apiKeys = request.result as IndexDB_ApiKey[];
        // Find the appropriate API key for this profile and organization
        const matchingKey = apiKeys.find(
          (key) => key.userID === userID && key.driveID === driveID
        );
        resolve(matchingKey || null);
      };
    });
  };

  // Helpers
  const deriveProfileFromSeed = useCallback(
    async (seedPhrase: string): Promise<IndexDB_Profile> => {
      try {
        // For EVM address generation
        const evmAccount = mnemonicToAccount(seedPhrase);
        const evmAddress = evmAccount.address;

        const derivedKey = await deriveEd25519KeyFromSeed(
          mnemonicToSeedSync(seedPhrase || "")
        );
        // Create the identity from the derived key
        const identity = Ed25519KeyIdentity.fromSecretKey(derivedKey);

        // Get the principal using the identity's getPrincipal method
        const principal = identity.getPrincipal();
        const principalStr = principal.toString();

        // Create the profile with the derived information
        const derivedUserID = `UserID_${principalStr}` as UserID;
        const newProfile = {
          userID: derivedUserID,
          nickname: derivedUserID,
          icpPublicAddress: principalStr,
          evmPublicAddress: evmAddress,
          seedPhrase: seedPhrase,
          note: "",
          avatar: "",
        };

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
    async (auth_profile?: AuthProfile): Promise<string> => {
      try {
        if (!auth_profile) {
          if (!currentProfileRef.current) {
            console.error("ICP account not initialized");
            return "";
          }
          if (!currentProfileRef.current.icpAccount) {
            console.error(
              "No ICP Account via private key, this is likely an API user"
            );
            return "";
          }
        }

        const target_profile = auth_profile || currentProfileRef.current;
        if (!target_profile || !target_profile.icpAccount) {
          throw Error("No target profile for signature generation");
        }

        const identity = target_profile.icpAccount.identity;

        // Use the raw public key for signature verification
        const rawPublicKey = identity.getPublicKey().toRaw();
        const publicKeyArray = Array.from(new Uint8Array(rawPublicKey));

        // Get the canonical principal
        const canonicalPrincipal = identity.getPrincipal().toString();

        const now = Date.now();

        // Build the challenge
        const challenge = {
          timestamp_ms: now,
          drive_canister_id:
            currentOrg?.icpPublicAddress ||
            currentOrgRef.current?.icpPublicAddress,
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

        const sig_token = btoa(JSON.stringify(proof));

        return sig_token;
      } catch (error) {
        console.error("Signature generation error:", error);
        return "";
      }
    },
    [currentProfile]
  );

  // Profiles
  const listProfiles = async (): Promise<IndexDB_Profile[]> => {
    return new Promise((resolve, reject) => {
      if (!db.current) throw new Error("INDEXEDDB_NOT_INITIALIZED");
      const transaction = db.current.transaction(
        [PROFILES_STORE_NAME],
        "readonly"
      );
      const store = transaction.objectStore(PROFILES_STORE_NAME);
      const request = store.getAll();

      request.onerror = () => {
        reject(new Error("GET_PROFILES_FAILED"));
      };

      request.onsuccess = () => {
        resolve(request.result as IndexDB_Profile[]);
      };
    });
  };
  const createProfile = useCallback(
    async (profile: Omit<IndexDB_Profile, "userID">) => {
      if (!db.current) {
        throw new Error("INDEXEDDB_NOT_INITIALIZED");
      }
      try {
        const newProfile: IndexDB_Profile = {
          ...profile,
          userID: `UserID_${profile.icpPublicAddress}` as UserID,
        };
        const transaction = db.current.transaction(
          [PROFILES_STORE_NAME],
          "readwrite"
        );
        const store = transaction.objectStore(PROFILES_STORE_NAME);
        store.add(newProfile);
        await syncLatestIdentities();
        if (newProfile.userID && currentOrg?.driveID) {
          initDexieDb(newProfile.userID, currentOrg?.driveID || "");
        }
        return newProfile;
      } catch (err) {
        console.error("Error adding profile:", err);
        setError(err instanceof Error ? err : new Error(String(err)));
        throw err;
      }
    },
    [db, syncLatestIdentities]
  );
  const readProfile = async (
    userID: string
  ): Promise<IndexDB_Profile | null> => {
    return new Promise((resolve, reject) => {
      if (!db.current) throw new Error("INDEXEDDB_NOT_INITIALIZED");
      const transaction = db.current.transaction(
        [PROFILES_STORE_NAME],
        "readonly"
      );
      const store = transaction.objectStore(PROFILES_STORE_NAME);
      const request = store.get(userID);

      request.onerror = () => {
        reject(new Error("GET_PROFILE_FAILED"));
      };

      request.onsuccess = () => {
        resolve(request.result || null);
      };
    });
  };
  const updateProfile = useCallback(
    async (profile: IndexDB_Profile) => {
      if (!db.current) {
        throw new Error("INDEXEDDB_NOT_INITIALIZED");
      }

      try {
        const transaction = db.current.transaction(
          [PROFILES_STORE_NAME],
          "readwrite"
        );
        const store = transaction.objectStore(PROFILES_STORE_NAME);
        store.put(profile);
        await syncLatestIdentities();

        // Update current profile if it's the one being updated
        if (_currentProfile && _currentProfile.userID === profile.userID) {
          await hydrateFullAuthProfile(profile);
        }
      } catch (err) {
        console.error("Error updating profile:", err);
        setError(err instanceof Error ? err : new Error(String(err)));
        throw err;
      }
    },
    [_currentProfile, db, syncLatestIdentities]
  );
  const deleteProfile = useCallback(
    async (userID: string) => {
      if (!db.current) {
        throw new Error("INDEXEDDB_NOT_INITIALIZED");
      }

      try {
        if (_currentProfile && _currentProfile.userID === userID) {
          closeDexieDb();
        }
        for (const org of listOfOrgs) {
          try {
            await deleteDexieDb(userID as UserID, org.driveID);
          } catch (error) {
            // Continue if one deletion fails - just log it
            console.warn(
              `Could not delete database for ${userID}@${org.driveID}:`,
              error
            );
          }
        }

        const transaction = db.current.transaction(
          [PROFILES_STORE_NAME],
          "readwrite"
        );
        const store = transaction.objectStore(PROFILES_STORE_NAME);
        store.delete(userID);
        await syncLatestIdentities();

        // Clear current profile if it's the one being deleted
        if (_currentProfile && _currentProfile.userID === userID) {
          const remainingProfiles = listOfProfiles.filter(
            (profile) => profile.userID !== userID
          );
          if (remainingProfiles.length > 0) {
            await hydrateFullAuthProfile(remainingProfiles[0]);
          }
        }
      } catch (err) {
        console.error("Error removing profile:", err);
        setError(err instanceof Error ? err : new Error(String(err)));
        throw err;
      }
    },
    [_currentProfile, db, listOfProfiles, syncLatestIdentities]
  );
  const switchProfile = useCallback(
    async (profile: IndexDB_Profile) => {
      localStorage.setItem(LOCAL_STORAGE_SEED_PHRASE, profile.seedPhrase);
      localStorage.setItem(
        LOCAL_STORAGE_EVM_PUBLIC_ADDRESS,
        profile.evmPublicAddress
      );
      localStorage.setItem(
        LOCAL_STORAGE_ICP_PUBLIC_ADDRESS,
        profile.icpPublicAddress
      );
      localStorage.setItem(LOCAL_STORAGE_ALIAS_NICKNAME, profile.nickname);
      await hydrateFullAuthProfile(profile);
      closeDexieDb();
      console.log(`we have swiched profiles`);
      console.log(`currentOrg on profile swtich`, currentOrg);
      if (currentOrg) {
        console.log(`seeking api key...`);
        const apiKey = await findApiKeyForProfileAndOrg(
          profile.userID,
          currentOrg.driveID
        );
        console.log(`found api key`, apiKey);
        setCurrentAPIKey(apiKey);
      }
    },
    [currentOrg]
  );

  // Organizations
  const listOrganizations = async (): Promise<IndexDB_Organization[]> => {
    return new Promise((resolve, reject) => {
      if (!db.current) throw new Error("INDEXEDDB_NOT_INITIALIZED");
      const transaction = db.current.transaction([ORGS_STORE_NAME], "readonly");
      const store = transaction.objectStore(ORGS_STORE_NAME);
      const request = store.getAll();

      request.onerror = () => {
        reject(new Error("GET_ORGANIZATIONS_FAILED"));
      };

      request.onsuccess = () => {
        resolve(request.result);
      };
    });
  };
  const createOrganization = useCallback(
    async ({
      driveID,
      nickname,
      icpPublicAddress,
      host,
      note,
    }: {
      driveID: DriveID;
      nickname: string;
      icpPublicAddress: string;
      host: string;
      note: string;
    }) => {
      if (!db.current) {
        throw new Error("INDEXEDDB_NOT_INITIALIZED");
      }

      try {
        const newOrg: IndexDB_Organization = {
          driveID,
          nickname,
          icpPublicAddress,
          host,
          note,
          defaultProfile: "",
        };
        const transaction = db.current.transaction(
          [ORGS_STORE_NAME],
          "readwrite"
        );
        const store = transaction.objectStore(ORGS_STORE_NAME);
        store.add(newOrg);
        await syncLatestIdentities();
        if (currentProfile?.userID && driveID) {
          initDexieDb(currentProfile?.userID || "", driveID);
        }
        return newOrg;
      } catch (err) {
        console.error("Error adding organization:", err);
        setError(err instanceof Error ? err : new Error(String(err)));
        throw err;
      }
    },
    [db, syncLatestIdentities]
  );
  const readOrganization = async (
    driveID: DriveID
  ): Promise<IndexDB_Organization | null> => {
    return new Promise((resolve, reject) => {
      if (!db.current) throw new Error("INDEXEDDB_NOT_INITIALIZED");
      const transaction = db.current.transaction([ORGS_STORE_NAME], "readonly");
      const store = transaction.objectStore(ORGS_STORE_NAME);
      const request = store.get(driveID);

      request.onerror = () => {
        reject(new Error("GET_ORGANIZATION_FAILED"));
      };

      request.onsuccess = () => {
        resolve(request.result || null);
      };
    });
  };
  const updateOrganization = useCallback(
    async (org: IndexDB_Organization) => {
      if (!db.current) {
        throw new Error("INDEXEDDB_NOT_INITIALIZED");
      }

      try {
        const transaction = db.current.transaction(
          [ORGS_STORE_NAME],
          "readwrite"
        );
        const store = transaction.objectStore(ORGS_STORE_NAME);
        store.put(org);
        await syncLatestIdentities();

        // Update current org if it's the one being updated
        if (currentOrg && currentOrg.driveID === org.driveID) {
          setCurrentOrg(org);
          currentOrgRef.current = org;
        }
      } catch (err) {
        console.error("Error updating organization:", err);
        setError(err instanceof Error ? err : new Error(String(err)));
        throw err;
      }
    },
    [currentOrg, db, syncLatestIdentities]
  );
  const deleteOrganization = useCallback(
    async (driveID: string) => {
      if (!db.current) {
        throw new Error("INDEXEDDB_NOT_INITIALIZED");
      }

      try {
        if (currentOrg && currentOrg.driveID === driveID) {
          closeDexieDb();
        }
        for (const profile of listOfProfiles) {
          try {
            await deleteDexieDb(profile.userID, driveID as DriveID);
          } catch (error) {
            // Continue if one deletion fails - just log it
            console.warn(
              `Could not delete database for ${profile.userID}@${driveID}:`,
              error
            );
          }
        }

        const transaction = db.current.transaction(
          [ORGS_STORE_NAME],
          "readwrite"
        );
        const store = transaction.objectStore(ORGS_STORE_NAME);
        const request = store.delete(driveID);
        await syncLatestIdentities();

        // Clear current org if it's the one being deleted
        if (currentOrg && currentOrg.driveID === driveID) {
          const remainingOrgs = listOfOrgs.filter(
            (org) => org.driveID !== driveID
          );
          setCurrentOrg(remainingOrgs.length > 0 ? remainingOrgs[0] : null);
          currentOrgRef.current =
            remainingOrgs.length > 0 ? remainingOrgs[0] : null;
        }
      } catch (err) {
        console.error("Error removing organization:", err);
        setError(err instanceof Error ? err : new Error(String(err)));
        throw err;
      }
    },
    [currentOrg, db, listOfOrgs, syncLatestIdentities]
  );
  const switchOrganization = useCallback(
    async (org: IndexDB_Organization, defaultProfile?: string) => {
      // get current profile and set as org.defaultProfile
      const updated_org: IndexDB_Organization = {
        ...org,
        defaultProfile: defaultProfile || "",
      };
      await updateOrganization(updated_org);

      setCurrentOrg(updated_org);
      currentOrgRef.current = updated_org;
      localStorage.setItem(LOCAL_STORAGE_ORGANIZATION_DRIVE_ID, org.driveID);
      closeDexieDb();
      if (currentProfile) {
        const apiKey = await findApiKeyForProfileAndOrg(
          currentProfile.userID,
          org.driveID
        );
        setCurrentAPIKey(apiKey);
      }

      // Update URL with new org code
      const path = window.location.pathname;
      const orgRegex = /\/org\/([^\/]+)(\/.*)?$/;
      const match = path.match(orgRegex);

      if (match) {
        // Get the route part after the org code
        const routeSuffix = match[2] || "";

        // Generate new org code
        const btoaEndpoint = urlSafeBase64Encode(org.host || "");
        const newOrgCode = `${org.driveID}__${btoaEndpoint}`;

        console.log(
          `window.location.href.split("?")`,
          window.location.href.split("?")
        );

        // Create new path with updated org code
        const winLocSplit = window.location.href.split("?");
        const lastParamsElement =
          winLocSplit.length > 1 ? winLocSplit.pop() : "";
        const newPath = `/org/${newOrgCode}${routeSuffix}?${lastParamsElement}`;

        // Update browser history without refreshing the page
        window.history.pushState({}, "", newPath);
      }
    },
    []
  );

  // API Keys
  const listApiKeys = async (): Promise<IndexDB_ApiKey[]> => {
    return new Promise((resolve, reject) => {
      if (!db.current) throw new Error("INDEXEDDB_NOT_INITIALIZED");
      const transaction = db.current.transaction(
        [API_KEYS_STORE_NAME],
        "readonly"
      );
      const store = transaction.objectStore(API_KEYS_STORE_NAME);
      const request = store.getAll();

      request.onerror = () => {
        reject(new Error("GET_API_KEYS_FAILED"));
      };

      request.onsuccess = () => {
        resolve(request.result as IndexDB_ApiKey[]);
      };
    });
  };
  const createApiKey = useCallback(
    async (apiKey: IndexDB_ApiKey) => {
      if (!db.current) {
        throw new Error("INDEXEDDB_NOT_INITIALIZED");
      }
      try {
        const transaction = db.current.transaction(
          [API_KEYS_STORE_NAME],
          "readwrite"
        );
        const store = transaction.objectStore(API_KEYS_STORE_NAME);
        store.add(apiKey);
        await syncLatestIdentities();
        return apiKey;
      } catch (err) {
        console.error("Error adding API key:", err);
        setError(err instanceof Error ? err : new Error(String(err)));
        throw err;
      }
    },
    [db, syncLatestIdentities]
  );
  const removeApiKey = useCallback(
    async (apiKeyID: string) => {
      if (!db.current) {
        throw new Error("INDEXEDDB_NOT_INITIALIZED");
      }
      try {
        const transaction = db.current.transaction(
          [API_KEYS_STORE_NAME],
          "readwrite"
        );
        const store = transaction.objectStore(API_KEYS_STORE_NAME);
        store.delete(apiKeyID);
        await syncLatestIdentities();
      } catch (err) {
        console.error("Error removing API key:", err);
        setError(err instanceof Error ? err : new Error(String(err)));
        throw err;
      }
    },
    [db, syncLatestIdentities]
  );

  // Agentic Key Grant
  const setAgenticKeyGrant = useCallback(
    async (agenticKeyGrant: IndexDB_AgenticKeyGrant) => {
      if (!db.current) {
        throw new Error("INDEXEDDB_NOT_INITIALIZED");
      }
      try {
        const transaction = db.current.transaction(
          [API_KEY_GRANTS_STORE_NAME],
          "readwrite"
        );
        const store = transaction.objectStore(API_KEY_GRANTS_STORE_NAME);
        store.add(agenticKeyGrant);
        await syncLatestIdentities();
        return agenticKeyGrant;
      } catch (err) {
        console.error("Error adding agentic key grant:", err);
        setError(err instanceof Error ? err : new Error(String(err)));
        throw err;
      }
    },
    [db, syncLatestIdentities]
  );

  const getAgenticKeyGrant = useCallback(
    async (agenticKeyGrantID: string) => {
      if (!db.current) {
        throw new Error("INDEXEDDB_NOT_INITIALIZED");
      }
      try {
        const transaction = db.current.transaction(
          [API_KEY_GRANTS_STORE_NAME],
          "readonly"
        );
        const store = transaction.objectStore(API_KEY_GRANTS_STORE_NAME);
        const agenticKeyGrant = await store.get(agenticKeyGrantID);
        return agenticKeyGrant as unknown as IndexDB_AgenticKeyGrant | null;
      } catch (err) {
        console.error("Error getting agentic key grant:", err);
        setError(err instanceof Error ? err : new Error(String(err)));
        // throw err;
        return null;
      }
    },
    [db]
  );

  // Enter by orgcode
  const enterByOrgCode = async () => {
    const orgcode = getOrgCodeFromUrl();
    console.log(`orgcode: ${orgcode}`);
    if (orgcode === "current") {
      setIsInitialized(true);
      return;
    }
    const [driveID, endpointBtoa] = orgcode.split("__");
    const host = urlSafeBase64Decode(endpointBtoa);
    console.log(`enterByOrgCode: ${driveID}`, host);
    if (!driveID) {
      console.error("Invalid orgcode");
      setIsInitialized(true);
      return;
    }
    console.log(`driveID: ${driveID}`, listOfOrgs);
    console.log(`host: ${host}`);
    const org = listOfOrgsRef.current?.find((org) => org.driveID === driveID);
    console.log(`>> org: ${org}`, org);
    if (!org && (!host || host === "undefined")) {
      console.log(`Skipping offline anon org`, org, host);
      setIsInitialized(true);
      return;
    }
    if (org) {
      const defaultProfile = listOfProfilesRef.current?.find(
        (profile) => profile.userID === org.defaultProfile
      );
      console.log(`>> defaultProfile: ${defaultProfile}`, defaultProfile);
      await switchOrganization(org);
      if (defaultProfile) {
        await switchProfile(defaultProfile);
      }
    } else {
      // org not found, lets add it
      const newOrg = await createOrganization({
        driveID,
        nickname: `Unknown Shared Org`,
        icpPublicAddress: driveID.replace("DriveID_", ""),
        host,
        note: "",
      });
      await switchOrganization(newOrg);

      notification.warning({
        message: "Unknown Organization",
        description:
          "You're accessing an unknown organization. Please be careful and remember to remove it later if not needed.",
        duration: 10, // Show for 10 seconds
        placement: "topRight",
        key: "unknown-org-notification", // Unique key to prevent duplicates
        btn: (
          <Space>
            <Button type="link" href="https://officex.app" target="_blank">
              Learn More
            </Button>
          </Space>
        ),
      });
    }

    setIsInitialized(true);
  };

  const wrapOrgCode = (route: string) => {
    const btoaEndpoint = urlSafeBase64Encode(currentOrg?.host || "");
    const orgcode = `${currentOrg?.driveID}__${btoaEndpoint}`;

    return `/org/${orgcode}${route}`;
  };

  // Context value
  const contextValue: IdentitySystemContextType = {
    isInitialized,
    error,

    isOfflineOrg,

    currentOrg,
    currentProfile,
    currentAPIKey,

    listOfOrgs,
    listOfProfiles,

    listOrganizations,
    createOrganization,
    readOrganization,
    updateOrganization,
    deleteOrganization,
    switchOrganization,

    listProfiles,
    createProfile,
    readProfile,
    updateProfile,
    deleteProfile,
    switchProfile,

    createApiKey,
    removeApiKey,

    setAgenticKeyGrant,
    getAgenticKeyGrant,

    syncLatestIdentities,
    deriveProfileFromSeed,
    generateSignature,
    hydrateFullAuthProfile,
    wrapOrgCode,
  };

  if (!isInitialized) {
    return <LoadingAnimation />;
  }

  return (
    <IdentitySystemContext.Provider value={contextValue}>
      {isInitialized && currentProfile ? children : null}
    </IdentitySystemContext.Provider>
  );
}

// Hook to use the context
export function useIdentitySystem() {
  const context = useContext(IdentitySystemContext);

  if (context === undefined) {
    throw new Error(
      "useIdentitySystem must be used within a useIdentitySystem"
    );
  }

  return context;
}

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
} from "../../api/dexie-database";

// Define types for our data structures
export interface IndexDB_Organization {
  driveID: string;
  nickname: string;
  icpPublicAddress: string;
  endpoint: string;
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
  endpoint: string;
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
    endpoint,
    note,
    defaultProfile,
  }: {
    driveID: DriveID;
    nickname: string;
    icpPublicAddress: string;
    endpoint: string;
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

  syncLatestIdentities: () => Promise<void>;
  deriveProfileFromSeed: (seedPhrase: string) => Promise<IndexDB_Profile>;
  generateSignature: () => Promise<string | null>;
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

  const [listOfOrgs, setListOfOrgs] = useState<IndexDB_Organization[]>([]);
  const [listOfProfiles, setListOfProfiles] = useState<IndexDB_Profile[]>([]);
  const [listOfAPIKeys, setListOfAPIKeys] = useState<IndexDB_ApiKey[]>([]);

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
              hydrateFullAuthProfile(existingProfile);
              initial_profile_id = existingProfile.userID;
            } else {
              // Create initial profile
              const seedPhrase = (generate(12) as string[]).join(" ");
              const newProfile = await deriveProfileFromSeed(seedPhrase);
              newProfile.nickname = "Anonymous";
              await createProfile(newProfile);
              hydrateFullAuthProfile(newProfile);
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
              initial_org_id = existingOrg.driveID;
            } else {
              const seedPhrase = generateRandomSeed();
              const tempProfile = await deriveProfileFromSeed(seedPhrase);
              const newDriveID = `DriveID_${tempProfile.icpPublicAddress}`;

              const newOrg = await createOrganization({
                driveID: newDriveID,
                nickname: "Anonymous Org",
                icpPublicAddress: tempProfile.icpPublicAddress,
                endpoint: "",
                note: "",
              });
              setCurrentOrg(newOrg);
              localStorage.setItem(
                LOCAL_STORAGE_ORGANIZATION_DRIVE_ID,
                newOrg.driveID
              );
              initial_org_id = newOrg.driveID;
            }

            if (initial_profile_id && initial_org_id) {
              // load dexie database
              await getDexieDb(initial_profile_id, initial_org_id);
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

            setIsInitialized(true);
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
  const hydrateFullAuthProfile = async (profile: IndexDB_Profile) => {
    _setCurrentProfile(profile);
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
      setCurrentProfile(auth_profile);
    } else {
      const auth_profile = {
        evmPublicKey: profile.evmPublicAddress || "",
        icpPublicKey: profile.icpPublicAddress || "",
        slug: shortenAddress(profile.icpPublicAddress || ""),
        nickname: profile.nickname || "",
        userID: profile.userID || "",
        icpAccount: null,
      };
      setCurrentProfile(auth_profile);
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
  }, [db]);
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
  const generateSignature = useCallback(async (): Promise<string | null> => {
    try {
      if (!currentProfile) {
        console.error("ICP account not initialized");
        return null;
      }
      if (!currentProfile.icpAccount) {
        console.error(
          "No ICP Account via private key, this is likely an API user"
        );
        return null;
      }

      const identity = currentProfile.icpAccount.identity;

      // Use the raw public key for signature verification
      const rawPublicKey = identity.getPublicKey().toRaw();
      const publicKeyArray = Array.from(new Uint8Array(rawPublicKey));

      // Get the canonical principal
      const canonicalPrincipal = identity.getPrincipal().toString();

      const now = Date.now();

      // Build the challenge
      const challenge = {
        timestamp_ms: now,
        drive_canister_id: currentOrg?.icpPublicAddress,
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
      return null;
    }
  }, [currentProfile?.icpAccount]);

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
          hydrateFullAuthProfile(profile);
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
            hydrateFullAuthProfile(remainingProfiles[0]);
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
  const switchProfile = useCallback(async (profile: IndexDB_Profile) => {
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
    if (currentOrg) {
      const apiKey = await findApiKeyForProfileAndOrg(
        profile.userID,
        currentOrg.driveID
      );
      setCurrentAPIKey(apiKey);
    }
  }, []);

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
      endpoint,
      note,
    }: {
      driveID: DriveID;
      nickname: string;
      icpPublicAddress: string;
      endpoint: string;
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
          endpoint,
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
      localStorage.setItem(LOCAL_STORAGE_ORGANIZATION_DRIVE_ID, org.driveID);
      closeDexieDb();
      if (currentProfile) {
        const apiKey = await findApiKeyForProfileAndOrg(
          currentProfile.userID,
          org.driveID
        );
        setCurrentAPIKey(apiKey);
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

  // Context value
  const contextValue: IdentitySystemContextType = {
    isInitialized,
    error,

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

    syncLatestIdentities,
    deriveProfileFromSeed,
    generateSignature,
  };

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

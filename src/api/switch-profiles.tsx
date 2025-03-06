import {
  createContext,
  useState,
  useEffect,
  useCallback,
  useContext,
  ReactNode,
} from "react";
import { v4 as uuidv4 } from "uuid";
import {
  LOCAL_STORAGE_ALIAS_NICKNAME,
  LOCAL_STORAGE_EVM_PUBLIC_ADDRESS,
  LOCAL_STORAGE_ICP_PUBLIC_ADDRESS,
  LOCAL_STORAGE_SEED_PHRASE,
} from "../framework/identity/constants";
import useIdentity from "../framework/identity";
import { DriveID, UserID } from "@officexapp/types";

// Define types for our data structures
export interface IndexDB_Organization {
  driveID: string;
  note: string;
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
}

// Context type definition
interface SwitchOrgProfilesContextType {
  isInitialized: boolean;
  error: Error | null;

  currentOrg: IndexDB_Organization | null;
  currentProfile: IndexDB_Profile | null;
  currentAPIKey: IndexDB_ApiKey | null;

  listOfOrgs: IndexDB_Organization[];
  listOfProfiles: IndexDB_Profile[];

  queryExistingOrganization: (
    driveID: DriveID
  ) => Promise<IndexDB_Organization | null>;
  addOrganization: (note: string) => Promise<IndexDB_Organization>;
  updateOrganization: (org: IndexDB_Organization) => Promise<void>;
  removeOrganization: (driveID: DriveID) => Promise<void>;
  selectOrganization: (org: IndexDB_Organization) => void;

  queryExistingProfile: (userID: UserID) => Promise<IndexDB_Profile | null>;
  addProfile: (
    profile: Omit<IndexDB_Profile, "userID">
  ) => Promise<IndexDB_Profile>;
  updateProfile: (profile: IndexDB_Profile) => Promise<void>;
  removeProfile: (userID: UserID) => Promise<void>;
  selectProfile: (profile: IndexDB_Profile) => void;

  addApiKey: (
    apiKey: Omit<IndexDB_ApiKey, "apiKeyID">
  ) => Promise<IndexDB_ApiKey>;
  updateApiKey: (apiKey: IndexDB_ApiKey) => Promise<void>;
  removeApiKey: (apiKeyID: string) => Promise<void>;
  createApiKeyForCurrentOrgAndProfile: (
    note: string
  ) => Promise<IndexDB_ApiKey>;

  refreshOrganizations: () => Promise<void>;
  refreshProfiles: () => Promise<void>;
  refreshApiKeys: () => Promise<void>;
}

// Create the context
const SwitchOrgProfilesContext = createContext<
  SwitchOrgProfilesContextType | undefined
>(undefined);

// Constants for IndexedDB
const DB_NAME = "switch-multiple";
const DB_VERSION = 1;
const ORGS_STORE_NAME = "organizations";
const PROFILES_STORE_NAME = "profiles";
const API_KEYS_STORE_NAME = "apiKeys";

// Provider component
export function SwitchOrgProfilesProvider({
  children,
}: {
  children: ReactNode;
}) {
  // State declarations
  const [db, setDb] = useState<IDBDatabase | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const [currentOrg, setCurrentOrg] = useState<IndexDB_Organization | null>(
    null
  );
  const [currentProfile, setCurrentProfile] = useState<IndexDB_Profile | null>(
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
          setDb(database);

          // Initialize with initial org and profile if provided
          try {
            // Setup database
            setDb(database);

            // // Check if organization exists
            // const orgExists = await getOrganizationFromDB(
            //   database,
            //   initialDriveID
            // );
            // if (!orgExists) {
            //   // Create initial organization
            //   await saveOrganizationToDB(database, {
            //     driveID: initialDriveID,
            //     note: "Default Organization",
            //   });
            // }

            // // // Check if profile exists
            // // const profileExists = await getProfileFromDB(
            // //   database,
            // //   initialUserID
            // // );
            // // if (!profileExists) {
            // //   // Create initial profile
            // //   await saveProfileToDB(database, {
            // //     userID: initialUserID,
            // //     icpPublicAddress: "",
            // //     evmPublicAddress: "",
            // //     seedPhrase: "",
            // //     note: "Default Profile",
            // //     avatar: "",
            // //   });
            // // }

            // Load initial data
            await loadOrganizationsFromDB(database);
            await loadProfilesFromDB(database);
            await loadApiKeysFromDB(database);

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

  // AI Slop 😢 should refactor
  // DB helper functions
  const getOrganizationFromDB = async (
    database: IDBDatabase,
    driveID: DriveID
  ): Promise<IndexDB_Organization | null> => {
    return new Promise((resolve, reject) => {
      const transaction = database.transaction([ORGS_STORE_NAME], "readonly");
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

  const saveOrganizationToDB = async (
    database: IDBDatabase,
    org: IndexDB_Organization
  ): Promise<void> => {
    return new Promise((resolve, reject) => {
      const transaction = database.transaction([ORGS_STORE_NAME], "readwrite");
      const store = transaction.objectStore(ORGS_STORE_NAME);
      const request = store.put(org);

      request.onerror = () => {
        reject(new Error("SAVE_ORGANIZATION_FAILED"));
      };

      request.onsuccess = () => {
        resolve();
      };
    });
  };

  const getProfileFromDB = async (
    database: IDBDatabase,
    userID: string
  ): Promise<IndexDB_Profile | null> => {
    return new Promise((resolve, reject) => {
      const transaction = database.transaction(
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

  const saveProfileToDB = async (
    database: IDBDatabase,
    profile: IndexDB_Profile
  ): Promise<void> => {
    return new Promise((resolve, reject) => {
      const transaction = database.transaction(
        [PROFILES_STORE_NAME],
        "readwrite"
      );
      const store = transaction.objectStore(PROFILES_STORE_NAME);
      const request = store.put(profile);

      request.onerror = () => {
        reject(new Error("SAVE_PROFILE_FAILED"));
      };

      request.onsuccess = () => {
        resolve();
      };
    });
  };

  // Load data methods
  const loadOrganizationsFromDB = async (database: IDBDatabase) => {
    try {
      const orgs = await getAllOrganizationsFromDB(database);
      setListOfOrgs(orgs);
    } catch (err) {
      console.error("Error loading organizations:", err);
      setError(err instanceof Error ? err : new Error(String(err)));
    }
  };

  const getAllOrganizationsFromDB = async (
    database: IDBDatabase
  ): Promise<IndexDB_Organization[]> => {
    return new Promise((resolve, reject) => {
      const transaction = database.transaction([ORGS_STORE_NAME], "readonly");
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

  const loadProfilesFromDB = async (database: IDBDatabase) => {
    try {
      const profiles = await getAllProfilesFromDB(database);
      setListOfProfiles(profiles);
    } catch (err) {
      console.error("Error loading profiles:", err);
      setError(err instanceof Error ? err : new Error(String(err)));
    }
  };

  const getAllProfilesFromDB = async (
    database: IDBDatabase
  ): Promise<IndexDB_Profile[]> => {
    return new Promise((resolve, reject) => {
      const transaction = database.transaction(
        [PROFILES_STORE_NAME],
        "readonly"
      );
      const store = transaction.objectStore(PROFILES_STORE_NAME);
      const request = store.getAll();

      request.onerror = () => {
        reject(new Error("GET_PROFILES_FAILED"));
      };

      request.onsuccess = () => {
        resolve(request.result);
      };
    });
  };

  const loadApiKeysFromDB = async (database: IDBDatabase) => {
    try {
      const apiKeys = await getAllApiKeysFromDB(database);
      setListOfAPIKeys(apiKeys);
      updateCurrentApiKey(apiKeys);
    } catch (err) {
      console.error("Error loading API keys:", err);
      setError(err instanceof Error ? err : new Error(String(err)));
    }
  };

  const getAllApiKeysFromDB = async (
    database: IDBDatabase
  ): Promise<IndexDB_ApiKey[]> => {
    return new Promise((resolve, reject) => {
      const transaction = database.transaction(
        [API_KEYS_STORE_NAME],
        "readonly"
      );
      const store = transaction.objectStore(API_KEYS_STORE_NAME);
      const request = store.getAll();

      request.onerror = () => {
        reject(new Error("GET_API_KEYS_FAILED"));
      };

      request.onsuccess = () => {
        resolve(request.result);
      };
    });
  };

  // Update current API key based on current org and profile
  const updateCurrentApiKey = useCallback(
    (apiKeys: IndexDB_ApiKey[]) => {
      if (currentOrg && currentProfile) {
        const matchingKey = apiKeys.find(
          (key) =>
            key.driveID === currentOrg.driveID &&
            key.userID === currentProfile.userID
        );
        setCurrentAPIKey(matchingKey || null);
      } else {
        setCurrentAPIKey(null);
      }
    },
    [currentOrg, currentProfile]
  );

  // Update current API key when org or profile changes
  useEffect(() => {
    updateCurrentApiKey(listOfAPIKeys);
  }, [currentOrg, currentProfile, listOfAPIKeys, updateCurrentApiKey]);

  // Public data refresh methods
  const refreshOrganizations = useCallback(async () => {
    if (!db) {
      throw new Error("INDEXEDDB_NOT_INITIALIZED");
    }
    await loadOrganizationsFromDB(db);
  }, [db]);

  const refreshProfiles = useCallback(async () => {
    if (!db) {
      throw new Error("INDEXEDDB_NOT_INITIALIZED");
    }
    await loadProfilesFromDB(db);
  }, [db]);

  const refreshApiKeys = useCallback(async () => {
    if (!db) {
      throw new Error("INDEXEDDB_NOT_INITIALIZED");
    }
    await loadApiKeysFromDB(db);
  }, [db]);

  // CRUD operations for organizations
  const queryExistingOrganization = useCallback(
    async (driveID: DriveID): Promise<IndexDB_Organization | null> => {
      if (!db) {
        throw new Error("INDEXEDDB_NOT_INITIALIZED");
      }

      try {
        return await getOrganizationFromDB(db, driveID);
      } catch (err) {
        console.error("Error querying existing organization:", err);
        setError(err instanceof Error ? err : new Error(String(err)));
        throw err;
      }
    },
    [db]
  );
  const addOrganization = useCallback(
    async (note: string) => {
      if (!db) {
        throw new Error("INDEXEDDB_NOT_INITIALIZED");
      }

      try {
        const newOrg: IndexDB_Organization = {
          driveID: uuidv4(),
          note,
        };

        await saveOrganizationToDB(db, newOrg);
        await refreshOrganizations();
        return newOrg;
      } catch (err) {
        console.error("Error adding organization:", err);
        setError(err instanceof Error ? err : new Error(String(err)));
        throw err;
      }
    },
    [db, refreshOrganizations]
  );

  const updateOrganization = useCallback(
    async (org: IndexDB_Organization) => {
      if (!db) {
        throw new Error("INDEXEDDB_NOT_INITIALIZED");
      }

      try {
        await saveOrganizationToDB(db, org);
        await refreshOrganizations();

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
    [currentOrg, db, refreshOrganizations]
  );

  const removeOrganization = useCallback(
    async (driveID: string) => {
      if (!db) {
        throw new Error("INDEXEDDB_NOT_INITIALIZED");
      }

      try {
        await deleteOrganizationFromDB(db, driveID);
        await refreshOrganizations();

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
    [currentOrg, db, listOfOrgs, refreshOrganizations]
  );

  const deleteOrganizationFromDB = async (
    database: IDBDatabase,
    driveID: string
  ): Promise<void> => {
    return new Promise((resolve, reject) => {
      const transaction = database.transaction([ORGS_STORE_NAME], "readwrite");
      const store = transaction.objectStore(ORGS_STORE_NAME);
      const request = store.delete(driveID);

      request.onerror = () => {
        reject(new Error("DELETE_ORGANIZATION_FAILED"));
      };

      request.onsuccess = () => {
        resolve();
      };
    });
  };

  // CRUD operations for profiles
  const queryExistingProfile = useCallback(
    async (userID: UserID): Promise<IndexDB_Profile | null> => {
      if (!db) {
        throw new Error("INDEXEDDB_NOT_INITIALIZED");
      }

      try {
        return await getProfileFromDB(db, userID);
      } catch (err) {
        console.error("Error querying existing profile:", err);
        setError(err instanceof Error ? err : new Error(String(err)));
        throw err;
      }
    },
    [db]
  );
  const addProfile = useCallback(
    async (profile: Omit<IndexDB_Profile, "userID">) => {
      if (!db) {
        throw new Error("INDEXEDDB_NOT_INITIALIZED");
      }

      try {
        const newProfile: IndexDB_Profile = {
          ...profile,
          userID: uuidv4(),
        };

        await saveProfileToDB(db, newProfile);
        await refreshProfiles();
        return newProfile;
      } catch (err) {
        console.error("Error adding profile:", err);
        setError(err instanceof Error ? err : new Error(String(err)));
        throw err;
      }
    },
    [db, refreshProfiles]
  );

  const updateProfile = useCallback(
    async (profile: IndexDB_Profile) => {
      if (!db) {
        throw new Error("INDEXEDDB_NOT_INITIALIZED");
      }

      try {
        await saveProfileToDB(db, profile);
        await refreshProfiles();

        // Update current profile if it's the one being updated
        if (currentProfile && currentProfile.userID === profile.userID) {
          setCurrentProfile(profile);
        }
      } catch (err) {
        console.error("Error updating profile:", err);
        setError(err instanceof Error ? err : new Error(String(err)));
        throw err;
      }
    },
    [currentProfile, db, refreshProfiles]
  );

  const removeProfile = useCallback(
    async (userID: string) => {
      if (!db) {
        throw new Error("INDEXEDDB_NOT_INITIALIZED");
      }

      try {
        await deleteProfileFromDB(db, userID);
        await refreshProfiles();

        // Clear current profile if it's the one being deleted
        if (currentProfile && currentProfile.userID === userID) {
          const remainingProfiles = listOfProfiles.filter(
            (profile) => profile.userID !== userID
          );
          setCurrentProfile(
            remainingProfiles.length > 0 ? remainingProfiles[0] : null
          );
        }
      } catch (err) {
        console.error("Error removing profile:", err);
        setError(err instanceof Error ? err : new Error(String(err)));
        throw err;
      }
    },
    [currentProfile, db, listOfProfiles, refreshProfiles]
  );

  const deleteProfileFromDB = async (
    database: IDBDatabase,
    userID: string
  ): Promise<void> => {
    return new Promise((resolve, reject) => {
      const transaction = database.transaction(
        [PROFILES_STORE_NAME],
        "readwrite"
      );
      const store = transaction.objectStore(PROFILES_STORE_NAME);
      const request = store.delete(userID);

      request.onerror = () => {
        reject(new Error("DELETE_PROFILE_FAILED"));
      };

      request.onsuccess = () => {
        resolve();
      };
    });
  };

  // CRUD operations for API keys
  const addApiKey = useCallback(
    async (apiKey: Omit<IndexDB_ApiKey, "apiKeyID">) => {
      if (!db) {
        throw new Error("INDEXEDDB_NOT_INITIALIZED");
      }

      try {
        const newApiKey: IndexDB_ApiKey = {
          ...apiKey,
          apiKeyID: uuidv4(),
        };

        await saveApiKeyToDB(db, newApiKey);
        await refreshApiKeys();
        return newApiKey;
      } catch (err) {
        console.error("Error adding API key:", err);
        setError(err instanceof Error ? err : new Error(String(err)));
        throw err;
      }
    },
    [db, refreshApiKeys]
  );

  const saveApiKeyToDB = async (
    database: IDBDatabase,
    apiKey: IndexDB_ApiKey
  ): Promise<void> => {
    return new Promise((resolve, reject) => {
      const transaction = database.transaction(
        [API_KEYS_STORE_NAME],
        "readwrite"
      );
      const store = transaction.objectStore(API_KEYS_STORE_NAME);
      const request = store.put(apiKey);

      request.onerror = () => {
        reject(new Error("SAVE_API_KEY_FAILED"));
      };

      request.onsuccess = () => {
        resolve();
      };
    });
  };

  const updateApiKey = useCallback(
    async (apiKey: IndexDB_ApiKey) => {
      if (!db) {
        throw new Error("INDEXEDDB_NOT_INITIALIZED");
      }

      try {
        await saveApiKeyToDB(db, apiKey);
        await refreshApiKeys();
      } catch (err) {
        console.error("Error updating API key:", err);
        setError(err instanceof Error ? err : new Error(String(err)));
        throw err;
      }
    },
    [db, refreshApiKeys]
  );

  const removeApiKey = useCallback(
    async (apiKeyID: string) => {
      if (!db) {
        throw new Error("INDEXEDDB_NOT_INITIALIZED");
      }

      try {
        await deleteApiKeyFromDB(db, apiKeyID);
        await refreshApiKeys();
      } catch (err) {
        console.error("Error removing API key:", err);
        setError(err instanceof Error ? err : new Error(String(err)));
        throw err;
      }
    },
    [db, refreshApiKeys]
  );

  const deleteApiKeyFromDB = async (
    database: IDBDatabase,
    apiKeyID: string
  ): Promise<void> => {
    return new Promise((resolve, reject) => {
      const transaction = database.transaction(
        [API_KEYS_STORE_NAME],
        "readwrite"
      );
      const store = transaction.objectStore(API_KEYS_STORE_NAME);
      const request = store.delete(apiKeyID);

      request.onerror = () => {
        reject(new Error("DELETE_API_KEY_FAILED"));
      };

      request.onsuccess = () => {
        resolve();
      };
    });
  };

  // Methods to set current selections
  const selectOrganization = useCallback((org: IndexDB_Organization) => {
    setCurrentOrg(org);
  }, []);

  const selectProfile = useCallback((profile: IndexDB_Profile) => {
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
    setCurrentProfile(profile);
  }, []);

  // Create API key for current org and profile
  const createApiKeyForCurrentOrgAndProfile = useCallback(
    async (note: string) => {
      if (!currentOrg || !currentProfile) {
        throw new Error("No current organization or profile selected");
      }

      return addApiKey({
        userID: currentProfile.userID,
        driveID: currentOrg.driveID,
        note,
      });
    },
    [addApiKey, currentOrg, currentProfile]
  );

  // Create context value
  const contextValue: SwitchOrgProfilesContextType = {
    isInitialized,
    error,

    currentOrg,
    currentProfile,
    currentAPIKey,

    listOfOrgs,
    listOfProfiles,

    queryExistingOrganization,
    addOrganization,
    updateOrganization,
    removeOrganization,
    selectOrganization,

    queryExistingProfile,
    addProfile,
    updateProfile,
    removeProfile,
    selectProfile,

    addApiKey,
    updateApiKey,
    removeApiKey,
    createApiKeyForCurrentOrgAndProfile,

    refreshOrganizations,
    refreshProfiles,
    refreshApiKeys,
  };

  return (
    <SwitchOrgProfilesContext.Provider value={contextValue}>
      {children}
    </SwitchOrgProfilesContext.Provider>
  );
}

// Hook to use the context
export function useSwitchOrgProfiles() {
  const context = useContext(SwitchOrgProfilesContext);

  if (context === undefined) {
    throw new Error(
      "useSwitchOrgProfiles must be used within a SwitchOrgProfilesProvider"
    );
  }

  return context;
}

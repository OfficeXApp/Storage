import { useState, useEffect, useCallback } from "react";
import { v4 as uuidv4 } from "uuid";

// Define types for our data structures
export interface IndexDB_Organization {
  driveID: string;
  note: string;
}

export interface IndexDB_Profile {
  userID: string;
  icpPublicAddress: string;
  emvPublicAddress: string;
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

// IndexedDB utility class
class MultiOrgIndexedDB {
  private static instance: MultiOrgIndexedDB;
  private db: IDBDatabase | null = null;
  private readonly DB_NAME = "officex-storage";
  private readonly ORGS_STORE_NAME = "organizations";
  private readonly PROFILES_STORE_NAME = "profiles";
  private readonly API_KEYS_STORE_NAME = "apiKeys";

  private constructor() {}

  public static getInstance(): MultiOrgIndexedDB {
    if (!MultiOrgIndexedDB.instance) {
      MultiOrgIndexedDB.instance = new MultiOrgIndexedDB();
    }
    return MultiOrgIndexedDB.instance;
  }

  public async initialize(
    initialDriveID: string,
    initialUserID: string
  ): Promise<void> {
    if (this.db) {
      console.log("MultiOrgIndexedDB already initialized");
      return Promise.resolve();
    }

    return new Promise((resolve, reject) => {
      if (!window.indexedDB) {
        reject(new Error("INDEXEDDB_NOT_SUPPORTED"));
        return;
      }

      const request = window.indexedDB.open(this.DB_NAME, 1);

      request.onerror = (event) => {
        const error = (event.target as IDBOpenDBRequest).error;
        if (error?.name === "QuotaExceededError") {
          reject(new Error("STORAGE_QUOTA_EXCEEDED"));
        } else if (/^Access is denied/.test(error?.message || "")) {
          reject(new Error("PRIVATE_MODE_NOT_SUPPORTED"));
        } else {
          reject(new Error("INDEXEDDB_INITIALIZATION_FAILED"));
        }
      };

      request.onsuccess = async (event) => {
        this.db = (event.target as IDBOpenDBRequest).result;

        // Initialize with initial org and profile if provided
        if (initialDriveID && initialUserID) {
          try {
            // Check if organization exists
            const orgExists = await this.getOrganization(initialDriveID);
            if (!orgExists) {
              // Create initial organization
              await this.saveOrganization({
                driveID: initialDriveID,
                note: "Default Organization",
              });
            }

            // Check if profile exists
            const profileExists = await this.getProfile(initialUserID);
            if (!profileExists) {
              // Create initial profile
              await this.saveProfile({
                userID: initialUserID,
                icpPublicAddress: "",
                emvPublicAddress: "",
                seedPhrase: "",
                note: "Default Profile",
                avatar: "",
              });
            }
          } catch (err) {
            console.error("Error initializing default data:", err);
          }
        }

        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        // Create object stores if they don't exist
        if (!db.objectStoreNames.contains(this.ORGS_STORE_NAME)) {
          db.createObjectStore(this.ORGS_STORE_NAME, { keyPath: "driveID" });
        }

        if (!db.objectStoreNames.contains(this.PROFILES_STORE_NAME)) {
          db.createObjectStore(this.PROFILES_STORE_NAME, { keyPath: "userID" });
        }

        if (!db.objectStoreNames.contains(this.API_KEYS_STORE_NAME)) {
          db.createObjectStore(this.API_KEYS_STORE_NAME, {
            keyPath: "apiKeyID",
          });
        }
      };
    });
  }

  // Organization methods
  public async saveOrganization(org: IndexDB_Organization): Promise<void> {
    if (!this.db) {
      throw new Error("INDEXEDDB_NOT_INITIALIZED");
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(
        [this.ORGS_STORE_NAME],
        "readwrite"
      );
      const store = transaction.objectStore(this.ORGS_STORE_NAME);
      const request = store.put(org);

      request.onerror = () => {
        reject(new Error("SAVE_ORGANIZATION_FAILED"));
      };

      request.onsuccess = () => {
        resolve();
      };
    });
  }

  public async getOrganization(
    driveID: string
  ): Promise<IndexDB_Organization | null> {
    if (!this.db) {
      throw new Error("INDEXEDDB_NOT_INITIALIZED");
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(
        [this.ORGS_STORE_NAME],
        "readonly"
      );
      const store = transaction.objectStore(this.ORGS_STORE_NAME);
      const request = store.get(driveID);

      request.onerror = () => {
        reject(new Error("GET_ORGANIZATION_FAILED"));
      };

      request.onsuccess = () => {
        resolve(request.result || null);
      };
    });
  }

  public async getAllOrganizations(): Promise<IndexDB_Organization[]> {
    if (!this.db) {
      throw new Error("INDEXEDDB_NOT_INITIALIZED");
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(
        [this.ORGS_STORE_NAME],
        "readonly"
      );
      const store = transaction.objectStore(this.ORGS_STORE_NAME);
      const request = store.getAll();

      request.onerror = () => {
        reject(new Error("GET_ORGANIZATIONS_FAILED"));
      };

      request.onsuccess = () => {
        resolve(request.result);
      };
    });
  }

  public async deleteOrganization(driveID: string): Promise<void> {
    if (!this.db) {
      throw new Error("INDEXEDDB_NOT_INITIALIZED");
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(
        [this.ORGS_STORE_NAME],
        "readwrite"
      );
      const store = transaction.objectStore(this.ORGS_STORE_NAME);
      const request = store.delete(driveID);

      request.onerror = () => {
        reject(new Error("DELETE_ORGANIZATION_FAILED"));
      };

      request.onsuccess = () => {
        resolve();
      };
    });
  }

  // Profile methods
  public async saveProfile(profile: IndexDB_Profile): Promise<void> {
    if (!this.db) {
      throw new Error("INDEXEDDB_NOT_INITIALIZED");
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(
        [this.PROFILES_STORE_NAME],
        "readwrite"
      );
      const store = transaction.objectStore(this.PROFILES_STORE_NAME);
      const request = store.put(profile);

      request.onerror = () => {
        reject(new Error("SAVE_PROFILE_FAILED"));
      };

      request.onsuccess = () => {
        resolve();
      };
    });
  }

  public async getProfile(userID: string): Promise<IndexDB_Profile | null> {
    if (!this.db) {
      throw new Error("INDEXEDDB_NOT_INITIALIZED");
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(
        [this.PROFILES_STORE_NAME],
        "readonly"
      );
      const store = transaction.objectStore(this.PROFILES_STORE_NAME);
      const request = store.get(userID);

      request.onerror = () => {
        reject(new Error("GET_PROFILE_FAILED"));
      };

      request.onsuccess = () => {
        resolve(request.result || null);
      };
    });
  }

  public async getAllProfiles(): Promise<IndexDB_Profile[]> {
    if (!this.db) {
      throw new Error("INDEXEDDB_NOT_INITIALIZED");
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(
        [this.PROFILES_STORE_NAME],
        "readonly"
      );
      const store = transaction.objectStore(this.PROFILES_STORE_NAME);
      const request = store.getAll();

      request.onerror = () => {
        reject(new Error("GET_PROFILES_FAILED"));
      };

      request.onsuccess = () => {
        resolve(request.result);
      };
    });
  }

  public async deleteProfile(userID: string): Promise<void> {
    if (!this.db) {
      throw new Error("INDEXEDDB_NOT_INITIALIZED");
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(
        [this.PROFILES_STORE_NAME],
        "readwrite"
      );
      const store = transaction.objectStore(this.PROFILES_STORE_NAME);
      const request = store.delete(userID);

      request.onerror = () => {
        reject(new Error("DELETE_PROFILE_FAILED"));
      };

      request.onsuccess = () => {
        resolve();
      };
    });
  }

  // API Key methods
  public async saveApiKey(apiKey: IndexDB_ApiKey): Promise<void> {
    if (!this.db) {
      throw new Error("INDEXEDDB_NOT_INITIALIZED");
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(
        [this.API_KEYS_STORE_NAME],
        "readwrite"
      );
      const store = transaction.objectStore(this.API_KEYS_STORE_NAME);
      const request = store.put(apiKey);

      request.onerror = () => {
        reject(new Error("SAVE_API_KEY_FAILED"));
      };

      request.onsuccess = () => {
        resolve();
      };
    });
  }

  public async getAllApiKeys(): Promise<IndexDB_ApiKey[]> {
    if (!this.db) {
      throw new Error("INDEXEDDB_NOT_INITIALIZED");
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(
        [this.API_KEYS_STORE_NAME],
        "readonly"
      );
      const store = transaction.objectStore(this.API_KEYS_STORE_NAME);
      const request = store.getAll();

      request.onerror = () => {
        reject(new Error("GET_API_KEYS_FAILED"));
      };

      request.onsuccess = () => {
        resolve(request.result);
      };
    });
  }

  public async deleteApiKey(apiKeyID: string): Promise<void> {
    if (!this.db) {
      throw new Error("INDEXEDDB_NOT_INITIALIZED");
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(
        [this.API_KEYS_STORE_NAME],
        "readwrite"
      );
      const store = transaction.objectStore(this.API_KEYS_STORE_NAME);
      const request = store.delete(apiKeyID);

      request.onerror = () => {
        reject(new Error("DELETE_API_KEY_FAILED"));
      };

      request.onsuccess = () => {
        resolve();
      };
    });
  }
}

// The actual React hook
export function useMultipleOrgs(initialDriveID: string, initialUserID: string) {
  // State declarations
  const [isInitialized_localIndexDB, setIsInitialized] = useState(false);
  const [error_localIndexDB, setError] = useState<Error | null>(null);

  const [currentOrg_localIndexDB, setCurrentOrg] =
    useState<IndexDB_Organization | null>(null);
  const [currentProfile_localIndexDB, setCurrentProfile] =
    useState<IndexDB_Profile | null>(null);
  const [currentAPIKey_localIndexDB, setCurrentAPIKey] =
    useState<IndexDB_ApiKey | null>(null);

  const [listOfOrgs_localIndexDB, setListOfOrgs] = useState<
    IndexDB_Organization[]
  >([]);
  const [listOfProfiles_localIndexDB, setListOfProfiles] = useState<
    IndexDB_Profile[]
  >([]);
  const [listOfAPIKeys_localIndexDB, setListOfAPIKeys] = useState<
    IndexDB_ApiKey[]
  >([]);

  // Initialize IndexedDB on component mount
  useEffect(() => {
    const initDB = async () => {
      try {
        const db = MultiOrgIndexedDB.getInstance();
        await db.initialize(initialDriveID, initialUserID);
        setIsInitialized(true);

        // Load initial data
        await loadOrganizations();
        await loadProfiles();
        await loadApiKeys();
      } catch (err) {
        console.error("Error initializing database:", err);
        setError(err instanceof Error ? err : new Error(String(err)));
      }
    };

    initDB();
  }, [initialDriveID, initialUserID]);

  // Load data methods
  const loadOrganizations = useCallback(async () => {
    try {
      const db = MultiOrgIndexedDB.getInstance();
      const orgs = await db.getAllOrganizations();
      setListOfOrgs(orgs);

      // Set current org to the initial one if none is selected
      if (!currentOrg_localIndexDB && orgs.length > 0) {
        const initialOrg = orgs.find((org) => org.driveID === initialDriveID);
        setCurrentOrg(initialOrg || orgs[0]);
      }
    } catch (err) {
      console.error("Error loading organizations:", err);
      setError(err instanceof Error ? err : new Error(String(err)));
    }
  }, [currentOrg_localIndexDB, initialDriveID]);

  const loadProfiles = useCallback(async () => {
    try {
      const db = MultiOrgIndexedDB.getInstance();
      const profiles = await db.getAllProfiles();
      setListOfProfiles(profiles);

      // Set current profile to the initial one if none is selected
      if (!currentProfile_localIndexDB && profiles.length > 0) {
        const initialProfile = profiles.find(
          (profile) => profile.userID === initialUserID
        );
        setCurrentProfile(initialProfile || profiles[0]);
      }
    } catch (err) {
      console.error("Error loading profiles:", err);
      setError(err instanceof Error ? err : new Error(String(err)));
    }
  }, [currentProfile_localIndexDB, initialUserID]);

  const loadApiKeys = useCallback(async () => {
    try {
      const db = MultiOrgIndexedDB.getInstance();
      const apiKeys = await db.getAllApiKeys();
      setListOfAPIKeys(apiKeys);
      updateCurrentApiKey(apiKeys);
    } catch (err) {
      console.error("Error loading API keys:", err);
      setError(err instanceof Error ? err : new Error(String(err)));
    }
  }, []);

  // Update current API key based on current org and profile
  const updateCurrentApiKey = useCallback(
    (apiKeys: IndexDB_ApiKey[]) => {
      if (currentOrg_localIndexDB && currentProfile_localIndexDB) {
        const matchingKey = apiKeys.find(
          (key) =>
            key.driveID === currentOrg_localIndexDB.driveID &&
            key.userID === currentProfile_localIndexDB.userID
        );
        setCurrentAPIKey(matchingKey || null);
      } else {
        setCurrentAPIKey(null);
      }
    },
    [currentOrg_localIndexDB, currentProfile_localIndexDB]
  );

  // Update current API key when org or profile changes
  useEffect(() => {
    updateCurrentApiKey(listOfAPIKeys_localIndexDB);
  }, [
    currentOrg_localIndexDB,
    currentProfile_localIndexDB,
    listOfAPIKeys_localIndexDB,
    updateCurrentApiKey,
  ]);

  // CRUD operations for organizations
  const addOrganization = useCallback(
    async (note: string) => {
      try {
        const newOrg: IndexDB_Organization = {
          driveID: uuidv4(),
          note,
        };

        const db = MultiOrgIndexedDB.getInstance();
        await db.saveOrganization(newOrg);
        await loadOrganizations();
        return newOrg;
      } catch (err) {
        console.error("Error adding organization:", err);
        setError(err instanceof Error ? err : new Error(String(err)));
        throw err;
      }
    },
    [loadOrganizations]
  );

  const updateOrganization = useCallback(
    async (org: IndexDB_Organization) => {
      try {
        const db = MultiOrgIndexedDB.getInstance();
        await db.saveOrganization(org);
        await loadOrganizations();

        // Update current org if it's the one being updated
        if (
          currentOrg_localIndexDB &&
          currentOrg_localIndexDB.driveID === org.driveID
        ) {
          setCurrentOrg(org);
        }
      } catch (err) {
        console.error("Error updating organization:", err);
        setError(err instanceof Error ? err : new Error(String(err)));
        throw err;
      }
    },
    [currentOrg_localIndexDB, loadOrganizations]
  );

  const removeOrganization = useCallback(
    async (driveID: string) => {
      try {
        const db = MultiOrgIndexedDB.getInstance();
        await db.deleteOrganization(driveID);
        await loadOrganizations();

        // Clear current org if it's the one being deleted
        if (
          currentOrg_localIndexDB &&
          currentOrg_localIndexDB.driveID === driveID
        ) {
          const remainingOrgs = listOfOrgs_localIndexDB.filter(
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
    [currentOrg_localIndexDB, listOfOrgs_localIndexDB, loadOrganizations]
  );

  // CRUD operations for profiles
  const addProfile = useCallback(
    async (profile: Omit<IndexDB_Profile, "userID">) => {
      try {
        const newProfile: IndexDB_Profile = {
          ...profile,
          userID: uuidv4(),
        };

        const db = MultiOrgIndexedDB.getInstance();
        await db.saveProfile(newProfile);
        await loadProfiles();
        return newProfile;
      } catch (err) {
        console.error("Error adding profile:", err);
        setError(err instanceof Error ? err : new Error(String(err)));
        throw err;
      }
    },
    [loadProfiles]
  );

  const updateProfile = useCallback(
    async (profile: IndexDB_Profile) => {
      try {
        const db = MultiOrgIndexedDB.getInstance();
        await db.saveProfile(profile);
        await loadProfiles();

        // Update current profile if it's the one being updated
        if (
          currentProfile_localIndexDB &&
          currentProfile_localIndexDB.userID === profile.userID
        ) {
          setCurrentProfile(profile);
        }
      } catch (err) {
        console.error("Error updating profile:", err);
        setError(err instanceof Error ? err : new Error(String(err)));
        throw err;
      }
    },
    [currentProfile_localIndexDB, loadProfiles]
  );

  const removeProfile = useCallback(
    async (userID: string) => {
      try {
        const db = MultiOrgIndexedDB.getInstance();
        await db.deleteProfile(userID);
        await loadProfiles();

        // Clear current profile if it's the one being deleted
        if (
          currentProfile_localIndexDB &&
          currentProfile_localIndexDB.userID === userID
        ) {
          const remainingProfiles = listOfProfiles_localIndexDB.filter(
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
    [currentProfile_localIndexDB, listOfProfiles_localIndexDB, loadProfiles]
  );

  // CRUD operations for API keys
  const addApiKey = useCallback(
    async (apiKey: Omit<IndexDB_ApiKey, "apiKeyID">) => {
      try {
        const newApiKey: IndexDB_ApiKey = {
          ...apiKey,
          apiKeyID: uuidv4(),
        };

        const db = MultiOrgIndexedDB.getInstance();
        await db.saveApiKey(newApiKey);
        await loadApiKeys();
        return newApiKey;
      } catch (err) {
        console.error("Error adding API key:", err);
        setError(err instanceof Error ? err : new Error(String(err)));
        throw err;
      }
    },
    [loadApiKeys]
  );

  const updateApiKey = useCallback(
    async (apiKey: IndexDB_ApiKey) => {
      try {
        const db = MultiOrgIndexedDB.getInstance();
        await db.saveApiKey(apiKey);
        await loadApiKeys();
      } catch (err) {
        console.error("Error updating API key:", err);
        setError(err instanceof Error ? err : new Error(String(err)));
        throw err;
      }
    },
    [loadApiKeys]
  );

  const removeApiKey = useCallback(
    async (apiKeyID: string) => {
      try {
        const db = MultiOrgIndexedDB.getInstance();
        await db.deleteApiKey(apiKeyID);
        await loadApiKeys();
      } catch (err) {
        console.error("Error removing API key:", err);
        setError(err instanceof Error ? err : new Error(String(err)));
        throw err;
      }
    },
    [loadApiKeys]
  );

  // Methods to set current selections
  const selectOrganization = useCallback((org: IndexDB_Organization) => {
    setCurrentOrg(org);
  }, []);

  const selectProfile = useCallback((profile: IndexDB_Profile) => {
    setCurrentProfile(profile);
  }, []);

  // Create API key for current org and profile
  const createApiKeyForCurrentOrgAndProfile = useCallback(
    async (note: string) => {
      if (!currentOrg_localIndexDB || !currentProfile_localIndexDB) {
        throw new Error("No current organization or profile selected");
      }

      return addApiKey({
        userID: currentProfile_localIndexDB.userID,
        driveID: currentOrg_localIndexDB.driveID,
        note,
      });
    },
    [addApiKey, currentOrg_localIndexDB, currentProfile_localIndexDB]
  );

  return {
    // State variables with underscore prefix
    _isInitialized: isInitialized_localIndexDB,
    _error: error_localIndexDB,
    _currentOrg: currentOrg_localIndexDB,
    _currentProfile: currentProfile_localIndexDB,
    _currentAPIKey: currentAPIKey_localIndexDB,
    _listOfOrgs: listOfOrgs_localIndexDB,
    _listOfProfiles: listOfProfiles_localIndexDB,

    // Organization operations with underscore prefix
    _addOrganization: addOrganization,
    _updateOrganization: updateOrganization,
    _removeOrganization: removeOrganization,
    _selectOrganization: selectOrganization,

    // Profile operations with underscore prefix
    _addProfile: addProfile,
    _updateProfile: updateProfile,
    _removeProfile: removeProfile,
    _selectProfile: selectProfile,

    // API key operations with underscore prefix
    _addApiKey: addApiKey,
    _updateApiKey: updateApiKey,
    _removeApiKey: removeApiKey,
    _createApiKeyForCurrentOrgAndProfile: createApiKeyForCurrentOrgAndProfile,

    // Refresh methods with underscore prefix
    _refreshOrganizations: loadOrganizations,
    _refreshProfiles: loadProfiles,
    _refreshApiKeys: loadApiKeys,
  };
}

import React, {
  useRef,
  useEffect,
  useCallback,
  useContext,
  createContext,
} from "react";
import { Provider } from "react-redux";
import {
  createStore,
  applyMiddleware,
  compose,
  Store,
  Middleware,
} from "redux";
import { createOffline } from "@redux-offline/redux-offline";
import offlineConfig from "@redux-offline/redux-offline/lib/defaults";
import { rootReducer } from "./reducer";
import { customNetworkDetector } from "./network-detector";
import { DISKS_REDUX_KEY } from "./disks/disks.reducer";
import localForage from "localforage";
import {
  AuthProfile,
  IndexDB_ApiKey,
  IndexDB_Organization,
  useIdentitySystem,
} from "../framework/identity";
import { DriveID, UserID } from "@officexapp/types";
import { disksOptimisticDexieMiddleware } from "./disks/disks.optimistic";
import { contactsOptimisticDexieMiddleware } from "./contacts/contacts.optimistic";
import { drivesOptimisticDexieMiddleware } from "./drives/drives.optimistic";
import { groupsOptimisticDexieMiddleware } from "./groups/groups.optimistic";
import { groupInvitesOptimisticDexieMiddleware } from "./group-invites/group-invites.optimistic";
import { labelsOptimisticDexieMiddleware } from "./labels/labels.optimistic";
import { webhooksOptimisticDexieMiddleware } from "./webhooks/webhooks.optimistic";
import { apiKeysOptimisticDexieMiddleware } from "./api-keys/api-keys.optimistic";
import { permissionsOptimisticDexieMiddleware } from "./permissions/permissions.optimistic";
import { directoryOptimisticDexieMiddleware } from "./directory/directory.optimistic";

// Custom discard function
const discard = (error: any) => {
  // If there's no response, it's a network error, so don't discard
  if (!error.response) return false;

  // Get status from the error response
  const status = error.status || (error.response && error.response.status);

  // Be more selective about which errors to discard
  // 400 - Bad Request (likely won't succeed on retry)
  // 403 - Forbidden (authorization issue)
  // 404 - Not Found (resource doesn't exist)
  // 409 - Conflict (data conflict)
  // 422 - Unprocessable Entity (validation error)
  return [400, 403, 404, 409, 422].includes(status);

  // Keep retrying:
  // 401 - Unauthorized (token might refresh)
  // 408 - Request Timeout
  // 429 - Too Many Requests
  // 5xx - Server errors
};

// Define the shape of your state including offline
export interface ReduxAppState extends ReturnType<typeof rootReducer> {
  offline: {
    online: boolean;
    busy: boolean;
    lastTransaction: number;
    outbox: any[];
    retryCount: number;
    retryScheduled: boolean;
    netInfo?: {
      isConnectionExpensive: boolean;
      reach: string;
    };
  };
}

// Create a context to expose store management functions
interface ReduxOfflineContextValue {
  deleteReduxOfflineStore: (orgId: DriveID, userID: UserID) => Promise<void>;
}

const ReduxOfflineContext = createContext<ReduxOfflineContextValue | null>(
  null
);

// Hook for components to access the Redux Offline context
export const useReduxOfflineMultiTenant = () => {
  const context = useContext(ReduxOfflineContext);
  if (!context) {
    throw new Error(
      "useReduxOfflineMultiTenant must be used within a ReduxOfflineProvider"
    );
  }
  return context;
};

const compileReduxStoreKey = (orgId: DriveID, userID: UserID) =>
  `${userID}@${orgId}`;

// Create the provider component that manages organization-specific stores
export const ReduxOfflineProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { currentOrg, currentProfile, currentAPIKey, generateSignature } =
    useIdentitySystem();
  const storeRef = useRef<Store | null>(null);
  const storesMapRef = useRef(new Map<string, Store>());
  const [, forceUpdate] = React.useReducer((x) => x + 1, 0); // Simple way to force re-render

  const currentOrgRef = useRef(currentOrg);
  const currentProfileRef = useRef(currentProfile);
  const currentAPIKeyRef = useRef(currentAPIKey);

  useEffect(() => {
    console.log(`currentAPIKEy`, currentAPIKey);
    currentOrgRef.current = currentOrg;
    currentProfileRef.current = currentProfile;
    currentAPIKeyRef.current = currentAPIKey;
  }, [currentOrg, currentProfile, currentAPIKey]);

  console.log(`--outside-- ${currentProfile?.nickname}`, currentProfile);
  console.log(`--outside--`, atob(currentAPIKey?.value || ""));

  // Create or get a store for a specific organization
  const getOrCreateStore = useCallback(
    async (orgId: DriveID, userID: UserID): Promise<Store> => {
      // const org = currentOrgRef.current;
      // const profile = currentProfileRef.current;
      // const apiKey = currentAPIKeyRef.current;

      // Return existing store if we have one
      const storeKey = compileReduxStoreKey(orgId, userID);
      if (storesMapRef.current.has(storeKey)) {
        return storesMapRef.current.get(storeKey)!;
      }
      if (!currentOrgRef.current || !currentProfileRef.current) {
        throw new Error("Cannot create store without current org and profile");
      }

      // Create organization-specific storage
      const orgStorage = localForage.createInstance({
        name: `OFFICEX-Redux-Queue-${storeKey}`,
        description: `Offline buffer for ${storeKey}`,
        driver: [localForage.INDEXEDDB],
        storeName: "offline-data",
      });

      const effectWithAuth = async (effect: any) => {
        if (
          !currentOrgRef.current ||
          !currentOrgRef.current.endpoint ||
          !currentProfileRef.current
        )
          return;

        // Extract request details from the effect
        const { url, method = "GET", headers = {}, data } = effect;

        if (headers["shouldBehaveOfflineDiskUI"]) return;

        const sanitizedHeaders = { ...headers };
        delete sanitizedHeaders["shouldBehaveOfflineDiskUI"];

        // Construct full URL if needed
        let fullUrl = url;
        if (!url.includes("http")) {
          fullUrl = `${currentOrgRef.current.endpoint}/v1/${currentOrgRef.current.driveID}${url}`;
        }

        // Get fresh auth token right when executing the request
        const authToken = currentAPIKeyRef.current?.value
          ? currentAPIKeyRef.current.value
          : await generateSignature();

        if (!authToken) {
          throw new Error("Failed to obtain authentication token");
        }
        console.log(
          `currentOrg = ${currentOrgRef.current.nickname}`,
          currentOrgRef.current
        );
        console.log(
          `currentProfile = ${currentProfileRef.current.nickname}`,
          currentProfileRef.current
        );
        console.log(`currentAPIKey =>`, currentAPIKeyRef.current);
        console.log(`authToken`, atob(authToken));

        console.log(`currentOrg REF = `, currentOrgRef.current);
        console.log(`currentProfile REF = `, currentProfileRef.current);

        // Configure fetch options with fresh auth token
        const fetchOptions: RequestInit = {
          method,
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${authToken}`,
            ...sanitizedHeaders,
          },
          // Only include body for non-GET requests
          ...(method !== "GET" && {
            body: data ? JSON.stringify(data) : undefined,
          }),
        };

        // Execute the fetch
        return fetch(fullUrl, fetchOptions).then(async (response) => {
          if (!response.ok) {
            const error: any = new Error(
              `HTTP error! Status: ${response.status}`
            );
            error.status = response.status;
            error.response = response;
            throw error;
          }
          return response.json();
        });
      };

      // Configure offline options specific to this profile+organization pair
      const retrySchedule = [2000, 15000];
      const offlineOptions = {
        ...offlineConfig,
        effect: effectWithAuth,
        discard,
        detectNetwork: customNetworkDetector,
        persistOptions: {
          key: `officex-offline-${storeKey}`,
          storage: orgStorage,
          whitelist: [
            "offline",
            // DISKS_REDUX_KEY
          ],
        },
        retry: (action: any, retries: number) => {
          if (!currentOrgRef.current?.endpoint) return;
          // If we've exceeded our retry schedule, stop retrying
          if (retries >= retrySchedule.length) {
            console.log(
              `Maximum retries (${retrySchedule.length}) reached for action:`,
              action
            );
            return;
          }

          // Get the appropriate delay from our schedule
          const delay = retrySchedule[retries];
          console.log(
            `Scheduling retry ${retries + 1}/${retrySchedule.length} in ${delay / 1000}s for:`,
            action
          );
          return delay;
        },
        persistCallback: () => {
          // console.log(`Redux state for pair ${storeKey} has been rehydrated`);
        },
      };

      // Create the store with the enhanced reducer and store enhancer
      const {
        middleware: offlineMiddleware,
        enhanceReducer,
        enhanceStore,
      } = createOffline(offlineOptions);

      const _idset = {
        currentOrg: currentOrgRef.current,
        currentProfile: currentProfileRef.current,
      };

      const middlewares: Middleware[] = [
        // These optimistic middleware must come before offlineMiddleware
        disksOptimisticDexieMiddleware(_idset),
        contactsOptimisticDexieMiddleware(_idset),
        drivesOptimisticDexieMiddleware(_idset),
        groupsOptimisticDexieMiddleware(_idset),
        groupInvitesOptimisticDexieMiddleware(_idset),
        labelsOptimisticDexieMiddleware(_idset),
        webhooksOptimisticDexieMiddleware(_idset),
        apiKeysOptimisticDexieMiddleware(_idset),
        permissionsOptimisticDexieMiddleware(_idset),
        directoryOptimisticDexieMiddleware(_idset),
        // This comes after the optimistic middleware
        offlineMiddleware,
      ];

      const store = createStore(
        enhanceReducer(rootReducer),
        compose(enhanceStore, applyMiddleware(...middlewares))
      );

      // Save it for future use
      storesMapRef.current.set(storeKey, store);
      return store;
    },
    [currentOrg, currentProfile, currentAPIKey, generateSignature]
  );

  // Function to delete a Redux Offline store for a specific organization
  const deleteReduxOfflineStore = useCallback(
    async (orgId: DriveID, userID: UserID): Promise<void> => {
      try {
        // Remove the store from our map if it exists
        const storeKey = compileReduxStoreKey(orgId, userID);
        if (storesMapRef.current.has(storeKey)) {
          storesMapRef.current.delete(storeKey);
        }

        // The database name we need to completely remove
        const dbName = `OFFICEX-redux-offline-${storeKey}`;

        // First, clear any data using localForage
        const orgStorage = localForage.createInstance({
          name: dbName,
          description: `Storage for organization ${storeKey}`,
          driver: [localForage.INDEXEDDB],
          storeName: "offline-data",
        });

        // Clear data first
        await orgStorage.clear();

        // Then completely delete the database using native indexedDB API
        await new Promise<void>((resolve, reject) => {
          const deleteRequest = window.indexedDB.deleteDatabase(dbName);

          deleteRequest.onerror = (event) => {
            console.error(
              `Error deleting IndexedDB database ${dbName}:`,
              event
            );
            reject(new Error(`Failed to delete database ${dbName}`));
          };

          deleteRequest.onsuccess = () => {
            resolve();
          };
        });

        // Also delete the persistence key data from localStorage
        const persistKey = `officex-offline-${orgId}`;
        localStorage.removeItem(persistKey);

        // If the deleted store was the current one, force a re-render
        if (currentOrg && currentOrg.driveID === orgId && storeRef.current) {
          storeRef.current = null;
          forceUpdate();
        }
      } catch (error) {
        console.error(
          `Failed to delete Redux Offline store for ${compileReduxStoreKey(orgId, userID)}:`,
          error
        );
        // throw error; // Re-throw to allow caller to handle
      }
    },
    [currentOrg]
  );

  // Update the store when current organization changes
  useEffect(() => {
    const updateStore = async () => {
      if (currentOrg && currentProfile) {
        // Get the appropriate store
        console.log(
          `about to create stores with user = ${currentProfile.nickname}`
        );
        const store = await getOrCreateStore(
          currentOrg.driveID,
          currentProfile.userID
        );

        // Only update if the store has changed
        if (store !== storeRef.current) {
          storeRef.current = store;
          forceUpdate(); // Force re-render with new store
        }
      } else {
        // If org or profile is missing, throw an error
        throw new Error("Cannot create store without current org and profile");
      }
    };
    updateStore();
  }, [
    currentOrg,
    currentProfile,
    getOrCreateStore,
    currentAPIKey,
    generateSignature,
  ]);

  // Context value with the delete function
  const contextValue = React.useMemo(
    () => ({
      deleteReduxOfflineStore,
    }),
    [deleteReduxOfflineStore]
  );

  // Show loading state if no store is available yet
  if (!storeRef.current) {
    return <div>"Loading store..."</div>;
  }

  // Provide the context and current store to the application
  return (
    <ReduxOfflineContext.Provider value={contextValue}>
      <Provider store={storeRef.current}>{children}</Provider>
    </ReduxOfflineContext.Provider>
  );
};

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

// Auth middleware
export const createAuthMiddleware = (
  currentOrg: IndexDB_Organization,
  currentProfile: AuthProfile,
  currentAPIKey: IndexDB_ApiKey | null,
  generateSignature: () => Promise<string | null>
): Middleware => {
  return () => (next) => async (action: any) => {
    // Only process offline actions with an effect
    if (action.meta && action.meta.offline && action.meta.offline.effect) {
      if (currentOrg && currentProfile) {
        // Deep clone the action to avoid mutating the original
        const enrichedAction = JSON.parse(JSON.stringify(action));
        const effect = enrichedAction.meta.offline.effect;

        console.log(`Found current api key? ${currentAPIKey?.value}`);

        // Get auth token - generate signature or use public key
        const authToken = currentAPIKey?.value
          ? currentAPIKey?.value
          : await generateSignature();

        // Add endpoint and drive ID if needed
        if (effect.url && !effect.url.includes("http")) {
          effect.url = `${currentOrg.endpoint}/v1/${currentOrg.driveID}${
            effect.url
          }`;
        }

        // Ensure headers exist
        effect.headers = effect.headers || {};

        // Add auth token to headers
        effect.headers.Authorization = `Bearer ${authToken}`;

        console.log(`enrichedAction`, enrichedAction);

        return next(enrichedAction);
      }
    }

    // Pass through any actions that don't match our criteria
    return next(action);
  };
};

// Custom effect handler using browser fetch API instead of axios
const effect = (effect: any) => {
  // Extract request details from the effect
  const { url, method = "GET", headers = {}, data } = effect;

  // Configure fetch options
  const fetchOptions: RequestInit = {
    method,
    headers: {
      "Content-Type": "application/json",
      ...headers,
    },
    // Only include body for non-GET requests
    ...(method !== "GET" && {
      body: data ? JSON.stringify(data) : undefined,
    }),
  };

  // Return a promise that resolves or rejects based on the response
  return fetch(url, fetchOptions).then((response) => {
    // Check if the request was successful
    if (!response.ok) {
      // Create an error object with the status
      const error: any = new Error(`HTTP error! Status: ${response.status}`);
      error.status = response.status;
      error.response = response;
      throw error;
    }

    // Parse the JSON response
    return response.json();
  });
};

// Custom discard function
const discard = (error: any) => {
  // If there's no response, it's a network error, so don't discard
  if (!error.response) return false;

  // Get status from the error response
  const status = error.status || (error.response && error.response.status);

  // Discard on client errors (4xx) except 401 Unauthorized
  return status >= 400 && status < 500 && status !== 401;
};

// Define the shape of your state including offline
export interface AppState extends ReturnType<typeof rootReducer> {
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
  deleteReduxOfflineStore: (orgId: DriveID) => Promise<void>;
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

  // Create or get a store for a specific organization
  const getOrCreateStore = useCallback(
    async (orgId: DriveID, userID: UserID): Promise<Store> => {
      // Return existing store if we have one
      const storeKey = compileReduxStoreKey(orgId, userID);
      if (storesMapRef.current.has(storeKey)) {
        return storesMapRef.current.get(storeKey)!;
      }
      if (!currentOrg || !currentProfile) {
        throw new Error("Cannot create store without current org and profile");
      }

      // Create organization-specific storage
      const orgStorage = localForage.createInstance({
        name: `OFFICEX-redux-offline-${storeKey}`,
        description: `Offline buffer for ${storeKey}`,
        driver: [localForage.INDEXEDDB],
        storeName: "offline-data",
      });

      // Create auth middleware with getters for identity information
      const authMiddleware = createAuthMiddleware(
        currentOrg,
        currentProfile,
        currentAPIKey,
        generateSignature
      );

      // Configure offline options specific to this profile+organization pair
      const offlineOptions = {
        ...offlineConfig,
        effect,
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
        persistCallback: () => {
          console.log(`Redux state for pair ${storeKey} has been rehydrated`);
        },
      };

      // Create the store with the enhanced reducer and store enhancer
      const {
        middleware: offlineMiddleware,
        enhanceReducer,
        enhanceStore,
      } = createOffline(offlineOptions);

      const store = createStore(
        enhanceReducer(rootReducer),
        compose(
          enhanceStore,
          applyMiddleware(authMiddleware, offlineMiddleware)
        )
      );

      // Save it for future use
      storesMapRef.current.set(storeKey, store);
      return store;
    },
    [currentOrg, currentProfile, currentAPIKey]
  );

  // Function to delete a Redux Offline store for a specific organization
  const deleteReduxOfflineStore = useCallback(
    async (orgId: string): Promise<void> => {
      try {
        // Remove the store from our map if it exists
        if (storesMapRef.current.has(orgId)) {
          storesMapRef.current.delete(orgId);
          console.log(`Store for organization ${orgId} removed from memory`);
        }

        // The database name we need to completely remove
        const dbName = `OFFICEX-redux-offline-${orgId}`;

        // First, clear any data using localForage
        const orgStorage = localForage.createInstance({
          name: dbName,
          description: `Storage for organization ${orgId}`,
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
            console.log(`IndexedDB database ${dbName} successfully deleted`);
            resolve();
          };
        });

        // Also delete the persistence key data from localStorage
        const persistKey = `officex-offline-${orgId}`;
        localStorage.removeItem(persistKey);
        console.log(
          `Removed persistent data for ${persistKey} from localStorage`
        );

        // If the deleted store was the current one, force a re-render
        if (currentOrg && currentOrg.driveID === orgId && storeRef.current) {
          storeRef.current = null;
          forceUpdate();
        }
      } catch (error) {
        console.error(
          `Failed to delete Redux Offline store for ${orgId}:`,
          error
        );
        throw error; // Re-throw to allow caller to handle
      }
    },
    [currentOrg]
  );

  // Update the store when current organization changes
  useEffect(() => {
    const updateStore = async () => {
      if (currentOrg && currentProfile) {
        // Get the appropriate store
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
  }, [currentOrg, currentProfile, getOrCreateStore]);

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

// store/store.ts
import { createStore, applyMiddleware, compose, StoreEnhancer } from "redux";
import { createOffline } from "@redux-offline/redux-offline";
import offlineConfig from "@redux-offline/redux-offline/lib/defaults";
import { rootReducer } from "./reducer";
import { customNetworkDetector } from "./network-detector";
import { DISKS_PERSIST_KEY } from "./disks/disks.reducer";
import localForage from "localforage";

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

const orgStorage = localForage.createInstance({
  name: `officex-localforage-redux-offline`,
  description: `Storage for OfficeX Redux Offline`,
});

// Configure offline options
const offlineOptions = {
  ...offlineConfig,
  effect,
  discard,
  detectNetwork: customNetworkDetector,
  persistOptions: {
    key: "officex-offline-storage",
    storage: orgStorage,
    whitelist: ["offline", DISKS_PERSIST_KEY],
  },
  persistCallback: () => {
    console.log("Redux state has been rehydrated");
  },
};

export const configureStore = () => {
  // Using the createOffline approach for better TypeScript compatibility
  const { middleware, enhanceReducer, enhanceStore } =
    createOffline(offlineOptions);

  // Create the store with the enhanced reducer and store enhancer
  const store = createStore(
    enhanceReducer(rootReducer),
    compose(enhanceStore, applyMiddleware(middleware))
  );

  return store;
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

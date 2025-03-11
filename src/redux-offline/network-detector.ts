// store/network-detector.ts
import { NetworkCallback } from "@redux-offline/redux-offline/lib/types";
import { v4 as uuidv4 } from "uuid";

/**
 * Custom network detector that uses both the browser's online/offline events
 * and also performs a periodic check to a known endpoint
 */
export const customNetworkDetector = (callback: NetworkCallback) => {
  // Initially set the status based on navigator.onLine
  callback(navigator.onLine);

  // Listen for online event
  window.addEventListener("online", () => {
    callback(true);
  });

  // Listen for offline event
  window.addEventListener("offline", () => {
    callback(false);
  });

  // Optional: Perform additional periodic checks to handle cases where
  // browser events are unreliable
  const checkNetworkStatus = async () => {
    try {
      // Attempt to fetch a small resource to verify connection
      // Use a timestamp to prevent caching
      const response = await fetch(`/api/health-check?_=${Date.now()}`, {
        method: "HEAD",
        cache: "no-store",
        headers: {
          "Cache-Control": "no-cache",
        },
      });

      callback(response.ok);
    } catch (error) {
      // If fetch fails, we're offline
      callback(false);
    }
  };

  // Check every 30 seconds
  const intervalId = setInterval(checkNetworkStatus, 30000);

  // Clean up on component unmount if needed
  return () => {
    clearInterval(intervalId);
    window.removeEventListener("online", () => callback(true));
    window.removeEventListener("offline", () => callback(false));
  };
};

export const createOptimisticID = () => {
  return `OptimisticID-${uuidv4()}`;
};

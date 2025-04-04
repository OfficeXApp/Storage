// Store the original fetch function
const originalFetch = window.fetch;

// Override the global fetch with a timeout-enabled version
window.fetch = function (resource, options: any = {}) {
  // Default timeout (e.g., 60 seconds)
  const timeout = options.timeout || 60000;

  // Create abort controller for timeout if one isn't already provided
  const controller = new AbortController();
  const { signal } = controller;

  // If the options already has a signal, we need to handle both
  // the provided signal and our timeout signal
  const originalSignal = options.signal;

  // Set up the timeout
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  // Handle the case where the original signal aborts
  if (originalSignal) {
    if (originalSignal.aborted) {
      controller.abort();
    } else {
      originalSignal.addEventListener("abort", () => controller.abort());
    }
  }

  // Create a new options object with our signal
  const newOptions = {
    ...options,
    signal: signal,
  };

  // Remove the timeout property as it's not a standard fetch option
  delete newOptions.timeout;

  // Call the original fetch with the new options
  return originalFetch(resource, newOptions)
    .then((response) => {
      clearTimeout(timeoutId);
      return response;
    })
    .catch((error) => {
      clearTimeout(timeoutId);
      if (error.name === "AbortError" && !originalSignal?.aborted) {
        throw new Error(`Fetch timeout after ${timeout}ms`);
      }
      throw error;
    });
};

// // Example usage - now all fetch calls can use the timeout option
// fetch("https://your-slow-api-endpoint.com", {
//   timeout: 120000, // 2 minute timeout
//   // ... other options
// });

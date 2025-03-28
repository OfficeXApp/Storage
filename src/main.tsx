// src/main.tsx
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import { ConfigProvider as AntDesignConfigProvider } from "antd";
import { DriveProvider } from "./framework";
import "./index.css";
import mixpanel from "mixpanel-browser";
import { Provider as ReduxProvider } from "react-redux";
import { registerServiceWorker } from "./registerSW.ts";
import { IdentitySystemProvider } from "./framework/identity/index.tsx";
import { ReduxOfflineProvider } from "./redux-offline/ReduxProvider.tsx";
import { MultiUploaderProvider } from "./framework/uploader/hook.tsx";
import { BrowserRouter } from "react-router-dom";

mixpanel.init("cae2fd45d17ff2cdf642b1d8afd80aa8", {
  debug: true,
  track_pageview: true,
  persistence: "localStorage",
});

const isFileSystemAccessSupported = "showDirectoryPicker" in window;

if (isFileSystemAccessSupported) {
  // Initialize file system
  console.log(
    "File System Access API is supported in this browser. SSD storage will be available."
  );
} else {
  console.warn(
    "File System Access API is not supported in this browser. SSD storage will not be available."
  );
  // Maybe fall back to just using IndexedDB
}

// Register service worker with UI notifications
registerServiceWorker({
  onNeedRefresh: () => {
    // Show a UI notification that an update is available
    const updateConfirm = window.confirm(
      "New content available. Reload to update?"
    );
    if (updateConfirm) {
      window.location.reload();
    }
  },
  onOfflineReady: () => {
    // Notify the user that the app can work offline
    console.log("Service Worker - App is ready for offline use");
  },
  onRegistered: (registration) => {
    console.log("Service Worker registered:", registration);
  },
});

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <AntDesignConfigProvider>
      <BrowserRouter>
        <IdentitySystemProvider>
          <ReduxOfflineProvider>
            <DriveProvider
              onUploadComplete={(fileUUID) =>
                console.log(`Uploaded ${fileUUID}`)
              }
            >
              <MultiUploaderProvider>
                <App />
              </MultiUploaderProvider>
            </DriveProvider>
          </ReduxOfflineProvider>
        </IdentitySystemProvider>
      </BrowserRouter>
    </AntDesignConfigProvider>
  </React.StrictMode>
);

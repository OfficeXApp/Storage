// src/main.tsx
import "./instrument";
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
import "./fetch";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { IFrameProvider } from "./framework/iframe/index.tsx";
import { CONFIG } from "./config.ts";
import * as Sentry from "@sentry/react";
import { LingoProviderWrapper, loadDictionary } from "lingo.dev/react/client";
import toast, { Toaster } from "react-hot-toast";

import en_US from "antd/locale/en_US";

dayjs.extend(relativeTime);

mixpanel.init(CONFIG.MIXPANEL_TOKEN, {
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
    <LingoProviderWrapper
      loadDictionary={(locale: any) => loadDictionary(locale)}
    >
      <Sentry.ErrorBoundary fallback={<p>An error has occurred</p>}>
        <AntDesignConfigProvider
          locale={en_US}
          theme={{
            token: {
              colorPrimary: CONFIG.WHITELABEL_THEME_COLOR,
            },
          }}
        >
          <>
            <Toaster
              position="top-center"
              toastOptions={{
                style: {
                  fontFamily: "Inter, sans-serif",
                },
              }}
            />
            <BrowserRouter>
              <IdentitySystemProvider>
                <ReduxOfflineProvider>
                  <DriveProvider onUploadComplete={(fileUUID) => null}>
                    <MultiUploaderProvider>
                      <IFrameProvider>
                        <App />
                      </IFrameProvider>
                    </MultiUploaderProvider>
                  </DriveProvider>
                </ReduxOfflineProvider>
              </IdentitySystemProvider>
            </BrowserRouter>
          </>
        </AntDesignConfigProvider>
      </Sentry.ErrorBoundary>
    </LingoProviderWrapper>
  </React.StrictMode>
);

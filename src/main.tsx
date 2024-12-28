// main.tsx
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import { ConfigProvider } from "antd";
import { Identity, DriveProvider } from "./framework";
import "./index.css";
import mixpanel from "mixpanel-browser";

mixpanel.init("cae2fd45d17ff2cdf642b1d8afd80aa8", {
  debug: true,
  track_pageview: true,
  persistence: "localStorage",
});

const { IdentityProvider } = Identity;

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

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ConfigProvider>
      <IdentityProvider>
        <DriveProvider
          onUploadComplete={(fileUUID) => console.log(`Uploaded ${fileUUID}`)}
        >
          <App />
        </DriveProvider>
      </IdentityProvider>
    </ConfigProvider>
  </React.StrictMode>
);

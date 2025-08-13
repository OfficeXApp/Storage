import React from "react";
import {
  Popover,
  Button,
  Tabs,
  Space,
  Typography,
  message,
  Tooltip,
} from "antd";
import { CodeOutlined, CopyOutlined } from "@ant-design/icons";
import { useIdentitySystem } from "../../framework/identity";

const { Title, Text } = Typography;
const { TabPane } = Tabs;

const anonHtml = `<div class="iframe-container">
  <iframe
    id="officex-iframe"
    src="https://officex.app/org/current/drive/BROWSER_CACHE/DiskID_offline-local-browser-cache/FolderID_root-folder-offline-local-browser-cache/"
    sandbox="allow-same-origin allow-scripts allow-downloads allow-popups"
  ></iframe>
  <script>
    const iframeElement = document.getElementById("officex-iframe");

    iframeElement.onload = () => {
      const ephemeralConfig = {
        optional_org_entropy: "____",
        optional_profile_entropy: "____",
        org_name: "Offline Org",
        profile_name: "Anon",
      };

      const initData = { ephemeral: ephemeralConfig };

      iframeElement.contentWindow.postMessage(
        {
          type: "officex-init",
          data: initData,
          tracer: "my-tracer",
        },
        "https://officex.app"
      );
    };
  </script>
</div>`;

const CopyIFrameButton: React.FC = () => {
  const { currentOrg, currentProfile, currentAPIKey } = useIdentitySystem();

  const handleCopy = (text: string) => {
    navigator.clipboard
      .writeText(text)
      .then(() => {
        message.success("Copied to clipboard!");
      })
      .catch((err) => {
        message.error("Failed to copy text.");
      });
  };

  const plainAuthJson = `{
  "host": "${currentOrg?.host}",
  "drive_id": "${currentOrg?.driveID}",
  "org_name": "${currentOrg?.nickname}",
  "user_id": "${currentProfile?.userID}",
  "profile_name": "${currentProfile?.nickname}",
  "api_key_value": "${currentAPIKey?.value}",
  "redirect_to": "org/current/welcome"
}`;
  const reactWithAuthHtml = `import React, { useEffect, useRef } from "react";

const OfficeXIFrame = () => {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const authJson = {
    "host": "${currentOrg?.host}",
  "drive_id": "${currentOrg?.driveID}",
  "org_name": "${currentOrg?.nickname}",
  "user_id": "${currentProfile?.userID}",
  "profile_name": "${currentProfile?.nickname}",
  "api_key_value": "${currentAPIKey?.value}",
  "redirect_to": "org/current/welcome"
  };


  useEffect(() => {
    const handleLoad = () => {
      // TypeScript now knows iframeRef.current is an HTMLIFrameElement
      if (iframeRef.current && iframeRef.current.contentWindow) {
        const message = {
          type: "officex-init",
          data: { injected: authJson },
          tracer: "my-tracer",
        };
        iframeRef.current.contentWindow.postMessage(message, "http://officex.app");
      }
    };

    const iframeElement = iframeRef.current;
    if (iframeElement) {
      iframeElement.addEventListener("load", handleLoad);
    }

    return () => {
      if (iframeElement) {
        iframeElement.removeEventListener("load", handleLoad);
      }
    };
  }, []);

  return (
    <div style={{ width: "1200px" }}>
      <iframe
        ref={iframeRef}
        src={"https://officex.app/org/current/welcome"}
        style={{ width: "100%", height: "800px", border: "none" }}
        sandbox="allow-same-origin allow-scripts allow-downloads allow-popups"
      />
    </div>
  );
};

export default OfficeXIFrame;`;

  const renderTabContent = (
    title: string,
    subheading: string,
    content: string
  ) => (
    <Space direction="vertical" style={{ width: "100%" }}>
      <b>{title}</b>
      <Text type="secondary">
        {subheading}{" "}
        <a
          href="https://iframe.officex.app"
          target="_blank"
          rel="noopener noreferrer"
          style={{ marginLeft: 0, color: "gray", textDecoration: "underline" }}
        >
          Learn More
        </a>
      </Text>
      <div style={{ position: "relative" }}>
        <textarea
          readOnly
          value={content}
          rows={6}
          style={{
            width: "100%",
            backgroundColor: "#f5f5f5",
            border: "1px solid #d9d9d9",
            borderRadius: "4px",
            padding: "8px",
            whiteSpace: "pre-wrap",
            wordWrap: "break-word",
            maxHeight: "200px",
            overflowY: "auto",
            fontFamily: "monospace",
            fontSize: "12px",
            resize: "none",
            outline: "none",
          }}
        />
        <Tooltip title="Copy to clipboard">
          <Button
            type="text"
            icon={<CopyOutlined />}
            style={{ position: "absolute", top: "4px", right: "4px" }}
            onClick={() => handleCopy(content)}
          />
        </Tooltip>
      </div>
    </Space>
  );

  const popoverContent = (
    <div style={{ width: "400px" }}>
      <Tabs defaultActiveKey="1">
        <TabPane tab="Auth JSON" key="1">
          {renderTabContent(
            "Auth with JSON",
            "Copy these credentials to inject into any iframe",
            plainAuthJson
          )}
        </TabPane>
        <TabPane tab="Anon HTML" key="2">
          {renderTabContent(
            "Anonymous Embed",
            "Use this plain HTML snippet for an unauthenticated offline iframe.",
            anonHtml
          )}
        </TabPane>
        <TabPane tab="React w/ Auth" key="3">
          {renderTabContent(
            "React Component with Auth",
            "Give your users their own whitelabel officex workspace, managed by our free cloud or self hosted by you.",
            reactWithAuthHtml
          )}
        </TabPane>
      </Tabs>
    </div>
  );

  return (
    <Popover content={popoverContent} trigger="click" placement="bottom">
      <Button icon={<CodeOutlined />}>Copy iFrame Code</Button>
    </Popover>
  );
};

export default CopyIFrameButton;

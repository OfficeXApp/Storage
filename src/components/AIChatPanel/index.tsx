import React, { useState, useEffect, useRef, useMemo } from "react";
import { useMultiUploader } from "../../framework/uploader/hook";

import { Button, Typography } from "antd";

import {
  ExpandAltOutlined,
  ShrinkOutlined,
  WechatWorkOutlined,
} from "@ant-design/icons";
import { useLocation, useNavigate } from "react-router-dom";
import { v4 as uuidv4 } from "uuid";
import useScreenType from "react-screentype-hook";
import { useDispatch } from "react-redux";
import { useIdentitySystem } from "../../framework/identity";
import { AI_CHAT_ENDPOINT } from "../../framework/identity/constants";
import { useLingoLocale } from "lingo.dev/react-client";

const { Text } = Typography;

const AIChatPanel: React.FC<{
  uploadPanelVisible: boolean;
  setUploadPanelVisible: (bool: boolean) => void;
}> = ({ uploadPanelVisible, setUploadPanelVisible }) => {
  const { wrapOrgCode } = useIdentitySystem();
  const currentLocale = useLingoLocale();
  const dispatch = useDispatch();
  const screenType = useScreenType();
  const navigate = useNavigate();
  const location = useLocation();
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [selectedChatEndpoint, setSelectedChatEndpoint] = useState(
    `${AI_CHAT_ENDPOINT}?lang=${currentLocale?.replace(/-/g, "_")}&pop_panel_mode=true`
  );

  const appendRefreshParam = () => {
    const params = new URLSearchParams(location.search);
    params.set("refresh", uuidv4()); // Set or update the refresh parameter
    navigate(`${location.pathname}?${params.toString()}`, { replace: true }); // Update the URL
  };

  const renderUploadContent = () => (
    <div
      style={{
        padding: "10px",
        height: "calc(100% - 50px)",
        overflowY: "auto",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: "20px",
        }}
      >
        <iframe
          ref={iframeRef}
          src={selectedChatEndpoint}
          allow="clipboard-read; clipboard-write"
          sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
          style={
            screenType.isMobile
              ? {
                  width: "100%",
                  height: "550px",
                  border: "none",
                  position: "fixed",
                  bottom: 0,
                  paddingBottom: "0vh",
                }
              : {
                  width: "100%",
                  height: "530px",
                  border: "none",
                }
          }
        />
        {/* <div>
          <Button
            icon={<UploadOutlined />}
            onClick={handleUploadFiles}
            style={{ borderRadius: "5px 0px 0px 5px" }}
          >
            Upload Files
          </Button>
          <Button
            icon={<FolderOutlined />}
            onClick={handleUploadFolder}
            style={{ borderRadius: "0px 5px 5px 0px", marginLeft: "-1px" }}
          >
            Upload Folder
          </Button>
        </div>
        <Button icon={<ClearOutlined />} onClick={handleClearQueue}></Button> */}
      </div>

      <section></section>
    </div>
  );

  const renderMinimizedContent = () => (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 10px",
      }}
    >
      <Text>AI Copilot</Text>
    </div>
  );

  return (
    <>
      <div
        style={{
          position: "fixed",
          bottom: 0,
          right: screenType.isMobile ? 0 : 20,
          width: screenType.isMobile ? "100%" : "400px",
          backgroundColor: "white",
          boxShadow: "0 -2px 8px rgba(0,0,0,0.15)",
          borderRadius: "8px 8px 0 0",
          transition: "height 0.3s ease-in-out",
          height: uploadPanelVisible ? "600px" : "50px",
          overflow: "hidden",
          zIndex: 1000,
        }}
      >
        <div
          onClick={() => setUploadPanelVisible(!uploadPanelVisible)}
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "5px 10px",
            borderBottom: "1px solid #f0f0f0",
            height: "40px",
            cursor: "pointer",
          }}
        >
          <div style={{ display: "flex", alignItems: "center" }}>
            <WechatWorkOutlined style={{ marginRight: "8px" }} />
            <Text strong>AI Copilot</Text>
          </div>
          <Button
            type="text"
            icon={
              uploadPanelVisible ? <ShrinkOutlined /> : <ExpandAltOutlined />
            }
            size="small"
          />
        </div>
        {uploadPanelVisible ? renderUploadContent() : renderMinimizedContent()}
      </div>
    </>
  );
};

export default AIChatPanel;

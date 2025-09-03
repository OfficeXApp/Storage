import React, { useState, useEffect, useRef, useMemo } from "react";
import { useMultiUploader } from "../../framework/uploader/hook";

import { Button, Tabs, Typography } from "antd";

import {
  ExpandAltOutlined,
  PlusOutlined,
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
import {
  connect,
  Connection,
  Methods,
  RemoteProxy,
  WindowMessenger,
} from "penpal";
import {
  deleteConvoByConvoID,
  getConvoByConvoID,
  listConvosByFileID,
  saveConvoToAIChatHistory,
} from "../../api/dexie-database";
import { FileID } from "@officexapp/types";

const { Text } = Typography;

interface TabItem {
  key: string;
  label: React.ReactNode;
  children: React.ReactNode;
}

const AIChatPanel: React.FC<{ isSheets?: boolean; fileID?: FileID }> = ({
  fileID,
  isSheets = false,
}) => {
  const [uploadPanelVisible, setUploadPanelVisible] = useState(false);
  const { currentOrg, currentProfile } = useIdentitySystem();
  const currentLocale = useLingoLocale();
  const screenType = useScreenType();
  const iframeRefs = useRef(new Map<string, HTMLIFrameElement>());
  const penpalConnections = useRef(new Map<string, Connection>());

  const initialTabKey = uuidv4();
  const [tabs, setTabs] = useState<TabItem[]>([]);
  const [activeTabKey, setActiveTabKey] = useState<string>(initialTabKey);

  useEffect(() => {
    const loadConvosOfFile = async () => {
      console.log(`fileID`, fileID);
      if (!fileID) return;
      const convos = await listConvosByFileID(
        currentProfile?.userID || "",
        currentOrg?.driveID || "",
        fileID
      );
      console.log(`convos`, convos);
      if (convos.length === 0) {
        addTab();
      } else if (convos.length > 0) {
        const sortedFIFO = convos
          .map((c) => ({ id: c.id, created_at: c.created_at }))
          .sort((a, b) => a.created_at - b.created_at);
        console.log(`sortedFIFO`, sortedFIFO);
        // sortedFIFO.forEach((convo) => {
        //   addTab(convo.id);
        // });
        for (let i = 0; i < sortedFIFO.length; i++) {
          addTab(sortedFIFO[i].id);
        }
      }
    };
    loadConvosOfFile();
  }, [fileID]);

  useEffect(() => {
    if (!activeTabKey) return;
    console.log(`Tab change detected. Active key: ${activeTabKey}`);

    const connectPenpalForTab = (convoID: string) => {
      // Check if the connection already exists
      if (penpalConnections.current.has(convoID)) {
        console.log(
          `Penpal connection already exists for tab: ${convoID}. Skipping.`
        );
        return;
      }

      const newIframe = iframeRefs.current.get(convoID);
      if (newIframe && newIframe.contentWindow) {
        console.log(`Attempting to connect Penpal for tab: ${convoID}`);
        try {
          const connection = connect({
            messenger: new WindowMessenger({
              remoteWindow: newIframe.contentWindow,
              allowedOrigins: [new URL(AI_CHAT_ENDPOINT).origin],
            }),
            methods: parentMethods,
          });
          penpalConnections.current.set(convoID, connection);
          console.log(`✅ Penpal connection established for tab: ${convoID}`);
        } catch (error) {
          console.error("Failed to establish Penpal connection:", error);
        }
      } else {
        console.warn(
          `Could not find iframe or contentWindow for tab: ${convoID}. Retrying in a moment.`
        );
        // Add a retry mechanism for robustness
        setTimeout(() => connectPenpalForTab(convoID), 200);
      }
    };

    connectPenpalForTab(activeTabKey);
  }, [activeTabKey]);

  const addTab = (tabKey?: string) => {
    const convoID = tabKey || `ChatID_${uuidv4()}`;
    const newTab: TabItem = {
      key: convoID,
      label: <span>Chat</span>,
      children: (
        <iframe
          ref={(el) => {
            if (el) {
              iframeRefs.current.set(convoID, el);
            }
          }}
          src={`${AI_CHAT_ENDPOINT}?lang=${currentLocale?.replace(/-/g, "_")}&pop_panel_mode=true&convo_id=${convoID}`}
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
      ),
    };
    setTabs((prevTabs) => {
      const filtered = prevTabs.filter((tab) => tab.key !== convoID);
      return [...filtered, newTab];
    });
    setActiveTabKey(convoID);
  };

  const removeTab = async (convoID: string) => {
    // Destroy the Penpal connection for the tab being removed
    const connection = penpalConnections.current.get(convoID);
    if (connection) {
      connection.destroy();
      penpalConnections.current.delete(convoID);
      console.log(`Penpal connection destroyed for tab: ${convoID}`);
    }

    // Remove the iframe reference
    iframeRefs.current.delete(convoID);

    // Your existing logic for updating tabs and active key
    let newActiveKey = activeTabKey;
    let lastIndex = -1;
    tabs.forEach((tab, i) => {
      if (tab.key === convoID) {
        lastIndex = i - 1;
      }
    });
    const newTabs = tabs.filter((tab) => tab.key !== convoID);
    if (newTabs.length && newActiveKey === convoID) {
      if (lastIndex >= 0) {
        newActiveKey = newTabs[lastIndex].key;
      } else {
        newActiveKey = newTabs[0].key;
      }
    }
    setTabs(newTabs);
    setActiveTabKey(newActiveKey);

    await deleteConvoByConvoID(
      currentProfile?.userID || "",
      currentOrg?.driveID || "",
      convoID
    );
  };

  const onEdit = (
    convoID: React.MouseEvent | React.KeyboardEvent | string,
    action: "add" | "remove"
  ) => {
    if (action === "remove" && tabs.length > 1) {
      removeTab(convoID as string);
    }
  };

  const renderMinimizedContent = () => (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 10px",
      }}
    >
      <Text>Chat in OfficeX</Text>
    </div>
  );

  const parentMethods = {
    saveHistory: async (convoID: string, chatHistoryJsonString: string) => {
      if (!fileID) return;
      console.log("> Saving chat history:", chatHistoryJsonString);
      await saveConvoToAIChatHistory(
        currentProfile?.userID || "",
        currentOrg?.driveID || "",
        {
          id: convoID,
          file_id: fileID,
          chat_history: chatHistoryJsonString,
          created_at: Date.now(),
        }
      );
    },
    loadHistory: async (convoID: string) => {
      console.log("✈️ Loading chat history:", convoID);
      const convo = await getConvoByConvoID(
        currentProfile?.userID || "",
        currentOrg?.driveID || "",
        convoID
      );
      console.log("✈️ Loaded chat history:", convo);
      return convo?.chat_history || "";
    },
  };

  return (
    <>
      <div
        style={{
          position: "fixed",
          bottom: 0,
          right: isSheets && !uploadPanelVisible ? 150 : 20,
          width: screenType.isMobile ? "100%" : "500px",
          backgroundColor: "white",
          boxShadow: "0 -2px 8px rgba(0,0,0,0.15)",
          borderRadius: "8px 8px 0 0",
          transition: "height 0.3s ease-in-out",
          height: uploadPanelVisible ? "650px" : "50px",
          maxHeight: "90vh",
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
            <Text strong>Chat in OfficeX</Text>
          </div>
          <Button
            type="text"
            icon={
              uploadPanelVisible ? <ShrinkOutlined /> : <ExpandAltOutlined />
            }
            size="small"
          />
        </div>
        {!uploadPanelVisible && renderMinimizedContent()}

        <div
          style={{
            padding: "10px",
            height: "calc(100% - 50px)",
            overflowY: "auto",
          }}
        >
          <Tabs
            type="editable-card"
            hideAdd={true}
            items={tabs}
            activeKey={activeTabKey}
            onChange={setActiveTabKey}
            onEdit={onEdit}
            size="small"
            renderTabBar={(props, DefaultTabBar) => (
              <div
                style={{
                  display: "flex",
                  overflowX: "auto",
                  whiteSpace: "nowrap",
                }}
              >
                <Button
                  type="text"
                  icon={<PlusOutlined />}
                  onClick={() => addTab()}
                  style={{ flexShrink: 0, marginRight: "8px" }}
                />
                <DefaultTabBar {...props} />
              </div>
            )}
          />
        </div>
      </div>
    </>
  );
};

export default AIChatPanel;

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

const { Text } = Typography;

interface TabItem {
  key: string;
  label: React.ReactNode;
  children: React.ReactNode;
}

const AIChatPanel: React.FC<{ isSheets?: boolean }> = ({
  isSheets = false,
}) => {
  const [uploadPanelVisible, setUploadPanelVisible] = useState(false);
  const { wrapOrgCode } = useIdentitySystem();
  const currentLocale = useLingoLocale();
  const screenType = useScreenType();

  const initialTabKey = uuidv4();
  const [tabs, setTabs] = useState<TabItem[]>([
    {
      key: initialTabKey,
      label: <span>Chat</span>,
      children: (
        <iframe
          src={`${AI_CHAT_ENDPOINT}?lang=${currentLocale?.replace(/-/g, "_")}&pop_panel_mode=true&refresh=${initialTabKey}`}
          allow="clipboard-read; clipboard-write"
          sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
          style={
            screenType.isMobile
              ? {
                  width: "100%",
                  height: "500px",
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
    },
  ]);
  const [activeTabKey, setActiveTabKey] = useState<string>(initialTabKey);

  const addTab = () => {
    const newTabKey = uuidv4();
    const newTab: TabItem = {
      key: newTabKey,
      label: <span>Chat</span>,
      children: (
        <iframe
          src={`${AI_CHAT_ENDPOINT}?lang=${currentLocale?.replace(/-/g, "_")}&pop_panel_mode=true&refresh=${newTabKey}`}
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
    setTabs([...tabs, newTab]);
    setActiveTabKey(newTabKey);
  };

  const removeTab = (targetKey: string) => {
    let newActiveKey = activeTabKey;
    let lastIndex = -1;
    tabs.forEach((tab, i) => {
      if (tab.key === targetKey) {
        lastIndex = i - 1;
      }
    });
    const newTabs = tabs.filter((tab) => tab.key !== targetKey);
    if (newTabs.length && newActiveKey === targetKey) {
      if (lastIndex >= 0) {
        newActiveKey = newTabs[lastIndex].key;
      } else {
        newActiveKey = newTabs[0].key;
      }
    }
    setTabs(newTabs);
    setActiveTabKey(newActiveKey);
  };

  const onEdit = (
    targetKey: React.MouseEvent | React.KeyboardEvent | string,
    action: "add" | "remove"
  ) => {
    if (action === "remove" && tabs.length > 1) {
      removeTab(targetKey as string);
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
      <Text>AI Copilot</Text>
    </div>
  );

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
                  onClick={addTab}
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

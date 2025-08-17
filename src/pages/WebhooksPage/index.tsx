// src/components/WebhooksPage/index.tsx

import React, { useCallback, useState, useRef, useEffect } from "react";
import { Button, Layout, Typography, Space, Result } from "antd";
import {
  type WebhookFE,
  type IRequestCreateWebhook,
  type WebhookID,
  SystemPermissionType,
} from "@officexapp/types";
import { useDispatch, useSelector } from "react-redux";
import { ReduxAppState } from "../../redux-offline/ReduxProvider";
import {
  CloseOutlined,
  PlusOutlined,
  ApiOutlined,
  ExperimentOutlined,
} from "@ant-design/icons";
import WebhooksAddDrawer from "./webhook.add";
import WebhookTab from "./webhook.tab";
import WebhooksTableList from "./webhooks.table";
import useScreenType from "react-screentype-hook";
import { useIdentitySystem } from "../../framework/identity";
import {
  checkWebhookTablePermissionsAction,
  listWebhooksAction,
} from "../../redux-offline/webhooks/webhooks.actions";
import { pastLastCheckedCacheLimit } from "../../api/helpers";
import { useNavigate } from "react-router-dom";

const { Content } = Layout;
const { Title } = Typography;

// Define tab item type for TypeScript
type TabItem = {
  key: string;
  label: React.ReactNode;
  children: React.ReactNode;
  closable?: boolean;
};

const WebhooksPage: React.FC = () => {
  // Drawer state
  const [drawerOpen, setDrawerOpen] = useState<boolean>(false);
  const navigate = useNavigate();
  const screenType = useScreenType();
  const { wrapOrgCode, currentProfile, currentOrg } = useIdentitySystem();
  const [lastClickedId, setLastClickedId] = useState<string | null>(null);
  const { tablePermissions, lastChecked } = useSelector(
    (state: ReduxAppState) => ({
      tablePermissions: state.webhooks.tablePermissions,
      lastChecked: state.webhooks.lastChecked,
    })
  );
  const dispatch = useDispatch();

  // Check if a webhook tab is open
  const isWebhookTabOpen = useCallback(
    (id: string) => {
      if (id === lastClickedId) {
        return true;
      }
      return tabItemsRef.current.some((item) => item.key === id);
    },
    [lastClickedId]
  );

  useEffect(() => {
    if (currentProfile && pastLastCheckedCacheLimit(lastChecked)) {
      dispatch(checkWebhookTablePermissionsAction(currentProfile.userID));
      dispatch(listWebhooksAction({}));
    }
  }, [currentProfile, lastChecked]);

  // Tab state management
  const [activeKey, setActiveKey] = useState<string>("list");
  const [tabItems, setTabItems] = useState<TabItem[]>([
    {
      key: "list",
      label: "Webhooks List",
      children: null,
      closable: false,
    },
  ]);

  // Create a ref to track the current tabItems state
  const tabItemsRef = useRef(tabItems);

  // Keep the ref updated with the latest tabItems state
  useEffect(() => {
    tabItemsRef.current = tabItems;
    if (lastClickedId && !tabItems.some((item) => item.key === lastClickedId)) {
      setLastClickedId(null);
    }
  }, [tabItems]);

  // Function to handle clicking on a webhook
  const handleClickContentTab = useCallback(
    (webhook: WebhookFE, focus_tab = false) => {
      setLastClickedId(webhook.id);
      // Use the ref to access the current state
      const currentTabItems = tabItemsRef.current;

      const existingTabIndex = currentTabItems.findIndex(
        (item) => item.key === webhook.id
      );

      if (existingTabIndex !== -1 && focus_tab == true) {
        setActiveKey(webhook.id);
        return;
      }

      if (existingTabIndex !== -1) {
        // Tab already exists, remove it
        const updatedTabs = currentTabItems.filter(
          (item) => item.key !== webhook.id
        );
        setTabItems(updatedTabs);
      } else {
        // Create new tab
        const newTab: TabItem = {
          key: webhook.id,
          label: shortenUrl(webhook.url),
          children: (
            <WebhookTab
              webhookCache={webhook}
              onDelete={handleDeletionCloseTabs}
            />
          ),
          closable: true,
        };

        // Insert new tab at position 1 (after list tab)
        setTabItems((prev) => {
          const updatedTabs = [...prev];
          updatedTabs.splice(1, 0, newTab);
          return updatedTabs;
        });

        // Switch to the clicked webhook's tab
        if (focus_tab) {
          setActiveKey(webhook.id);
        }
      }
    },
    [] // No dependencies needed since we use the ref
  );

  // Function to shorten URLs for display
  const shortenUrl = (url: string) => {
    try {
      const parsed = new URL(url);
      return `${parsed.hostname}${parsed.pathname.length > 15 ? parsed.pathname.substring(0, 15) + "..." : parsed.pathname}`;
    } catch (e) {
      return url;
    }
  };

  const handleDeletionCloseTabs = (webhookID: WebhookID) => {
    setActiveKey("list");
    const updatedTabs = tabItems.filter((item) => item.key !== webhookID);
    setTabItems(updatedTabs);
    tabItemsRef.current = updatedTabs;
  };

  // Handle tab change
  const onTabChange = (newActiveKey: string) => {
    setActiveKey(newActiveKey);
    if (newActiveKey === "list") {
      const newUrl = wrapOrgCode(`/resources/webhooks`);
      window.history.pushState({}, "", newUrl);
    } else {
      const newUrl = wrapOrgCode(`/resources/webhooks/${newActiveKey}`);
      window.history.pushState({}, "", newUrl);
    }
  };

  // Handle tab removal
  const onTabEdit = (targetKey: string, action: "add" | "remove") => {
    if (action === "remove") {
      // Filter out the tab being removed
      const newTabs = tabItems.filter((item) => item.key !== targetKey);
      setTabItems(newTabs);
      tabItemsRef.current = newTabs;

      if (targetKey === lastClickedId) {
        setLastClickedId(null);
      }

      // If the active tab was removed, go back to the list tab
      if (targetKey === activeKey) {
        setActiveKey("list");
      }
    }
  };

  // Toggle drawer
  const toggleDrawer = () => {
    setDrawerOpen(!drawerOpen);
  };

  if (currentOrg && currentOrg.host && !currentOrg.host.includes("icp0.io")) {
    return (
      <Result
        icon={<ExperimentOutlined />}
        title="Coming Soon"
        subTitle="This feature is coming soon for this organization."
        extra={
          <Button onClick={() => navigate(-1)} type="primary">
            Back
          </Button>
        }
        style={{ marginTop: "10vh" }}
      />
    );
  }

  return (
    <Layout
      style={{
        height: "100%",
        width: "100%",
        display: "flex",
        flexDirection: "column",
        backgroundColor: "white",
        overflowX: "hidden",
      }}
    >
      <Content
        style={{
          padding: screenType.isMobile ? "0px" : "0 16px",
          flex: 1,
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-end",
            margin: screenType.isMobile
              ? "0px 8px 8px 16px"
              : "0px 0px 16px 16px",
          }}
        >
          <Title
            level={2}
            style={{
              fontWeight: 500,
              fontSize: "24px",
              marginBottom: 0,
              color: "#262626",
            }}
          >
            Webhooks
          </Title>
          <Button
            size={screenType.isMobile ? "small" : "middle"}
            type={
              screenType.isMobile && activeKey !== "list"
                ? "default"
                : "primary"
            }
            icon={<PlusOutlined />}
            onClick={toggleDrawer}
            style={{ marginBottom: screenType.isMobile ? "8px" : 0 }}
            disabled={!tablePermissions.includes(SystemPermissionType.CREATE)}
          >
            Add Webhook
          </Button>
        </div>

        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
          }}
        >
          <div
            className="custom-tabs-container"
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              minHeight: screenType.isMobile ? "70vh" : 0, // Critical fix for flexbox scrolling
            }}
          >
            {/* Custom tab bar with pinned first tab */}
            <div
              style={{
                display: "flex",
                borderBottom: "1px solid #f0f0f0",
                overflow: "hidden",
              }}
            >
              {/* Pinned first tab */}
              <div
                className={`pinned-tab ${activeKey === "list" ? "active-tab" : ""}`}
                onClick={() => onTabChange("list")}
                style={{
                  padding: "12px 16px",
                  cursor: "pointer",
                  backgroundColor: activeKey === "list" ? "#fff" : "#fafafa",
                  border: activeKey === "list" ? "1px solid #f0f0f0" : "none",
                  borderBottom:
                    activeKey === "list" ? "1px solid #fff" : "none",
                  borderRadius: "4px 4px 0 0",
                  marginRight: "2px",
                  zIndex: 1,
                  position: "relative",
                  fontWeight: activeKey === "list" ? "500" : "normal",
                  minWidth: "120px",
                  textAlign: "center",
                }}
              >
                Search All
              </div>

              {/* Scrollable container for the rest of the tabs */}
              <div style={{ overflow: "auto", display: "flex", flex: 1 }}>
                {tabItems.slice(1).map((item) => (
                  <div
                    key={item.key}
                    className={`scroll-tab ${activeKey === item.key ? "active-tab" : ""}`}
                    onClick={() => onTabChange(item.key)}
                    style={{
                      padding: "12px 16px",
                      cursor: "pointer",
                      backgroundColor:
                        activeKey === item.key ? "#fff" : "#fafafa",
                      border:
                        activeKey === item.key ? "1px solid #f0f0f0" : "none",
                      borderBottom:
                        activeKey === item.key ? "1px solid #fff" : "none",
                      borderRadius: "4px 4px 0 0",
                      marginRight: "2px",
                      position: "relative",
                      display: "flex",
                      alignItems: "center",
                      whiteSpace: "nowrap",
                      fontWeight: activeKey === item.key ? "500" : "normal",
                    }}
                  >
                    {item.closable && (
                      <CloseOutlined
                        style={{ marginRight: "8px", fontSize: "12px" }}
                        onClick={(e) => {
                          e.stopPropagation();
                          onTabEdit(item.key, "remove");
                        }}
                      />
                    )}
                    <ApiOutlined style={{ marginRight: "8px" }} />
                    {item.label}
                  </div>
                ))}
              </div>
            </div>

            {/* Tab content */}
            <div
              style={{
                flex: 1,
                overflow: "hidden",
                display: "flex",
                minHeight: screenType.isMobile ? "70vh" : 0,
                position: "relative", // Added for absolute positioning of children
              }}
            >
              {/* Render all tab content but only show the active one */}
              <div
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  display: activeKey === "list" ? "flex" : "none",
                  overflow: "hidden",
                }}
              >
                <WebhooksTableList
                  isWebhookTabOpen={isWebhookTabOpen}
                  handleClickContentTab={handleClickContentTab}
                />
              </div>

              {/* Render all other tabs */}
              {tabItems
                .filter((item) => item.key !== "list")
                .map((item) => (
                  <div
                    key={item.key}
                    style={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      display: activeKey === item.key ? "flex" : "none",
                      overflow: "hidden",
                    }}
                  >
                    {item.children}
                  </div>
                ))}
            </div>
          </div>
        </div>
      </Content>

      <WebhooksAddDrawer
        open={drawerOpen}
        onClose={toggleDrawer}
        onAddWebhook={() => {}}
      />
    </Layout>
  );
};

export default WebhooksPage;

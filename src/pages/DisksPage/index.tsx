// src/components/DisksPage/index.tsx

import React, { useCallback, useState, useRef, useEffect } from "react";
import { Button, Layout, Typography, Space } from "antd";
import type {
  DiskID,
  IRequestCreateDisk,
  IRequestListDisks,
} from "@officexapp/types";
import { DiskTypeEnum, SystemPermissionType } from "@officexapp/types";
import { useDispatch, useSelector } from "react-redux";
import { ReduxAppState } from "../../redux-offline/ReduxProvider";
import {
  checkDiskTablePermissionsAction,
  createDiskAction,
  listDisksAction,
} from "../../redux-offline/disks/disks.actions";
import { CloseOutlined, PlusOutlined } from "@ant-design/icons";
import DisksAddDrawer from "./disk.add";
import DiskTab from "./disk.tab";
import DisksTableList from "./disks.table";
import useScreenType from "react-screentype-hook";
import { DiskFEO } from "../../redux-offline/disks/disks.reducer";
import { useIdentitySystem } from "../../framework/identity";
import { pastLastCheckedCacheLimit } from "../../api/helpers";

const { Content } = Layout;
const { Title } = Typography;

// Define tab item type for TypeScript
type TabItem = {
  key: string;
  label: React.ReactNode;
  children: React.ReactNode;
  closable?: boolean;
};

const DisksPage: React.FC = () => {
  // Drawer state
  const [drawerOpen, setDrawerOpen] = useState<boolean>(false);
  const screenType = useScreenType();
  const { wrapOrgCode, currentProfile } = useIdentitySystem();
  const [lastClickedId, setLastClickedId] = useState<string | null>(null);
  const { tablePermissions, lastChecked } = useSelector(
    (state: ReduxAppState) => ({
      tablePermissions: state.disks.tablePermissions,
      lastChecked: state.disks.lastChecked,
    })
  );

  // Check if a specific disk tab is open
  const isContentTabOpen = useCallback(
    (id: string) => {
      if (id === lastClickedId) {
        return true;
      }
      return tabItemsRef.current.some((item) => item.key === id);
    },
    [lastClickedId]
  );

  // Tab state management
  const [activeKey, setActiveKey] = useState<string>("list");
  const [tabItems, setTabItems] = useState<TabItem[]>([
    {
      key: "list",
      label: "Disks List",
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

  // Function to handle clicking on a disk
  const handleClickContentTab = useCallback(
    (disk: DiskFEO, focus_tab = false) => {
      setLastClickedId(disk.id);
      // Use the ref to access the current state
      const currentTabItems = tabItemsRef.current;

      const existingTabIndex = currentTabItems.findIndex(
        (item) => item.key === disk.id
      );

      if (existingTabIndex !== -1 && focus_tab == true) {
        setActiveKey(disk.id);
        return;
      }

      if (existingTabIndex !== -1) {
        // Tab already exists, remove it
        const updatedTabs = currentTabItems.filter(
          (item) => item.key !== disk.id
        );
        setTabItems(updatedTabs);
      } else {
        // Create new tab
        const newTab: TabItem = {
          key: disk.id,
          label: disk.name,
          children: (
            <DiskTab diskCache={disk} onDelete={handleDeletionCloseTabs} />
          ),
          closable: true,
        };

        // Insert new tab at position 1 (after list tab)
        setTabItems((prev) => {
          const updatedTabs = [...prev];
          updatedTabs.splice(1, 0, newTab);
          return updatedTabs;
        });

        // Switch to the clicked disk's tab
        if (focus_tab) {
          setActiveKey(disk.id);
        }
      }
    },
    [] // No dependencies needed since we use the ref
  );

  const handleDeletionCloseTabs = (diskID: DiskID) => {
    setActiveKey("list");
    const updatedTabs = tabItems.filter((item) => item.key !== diskID);
    setTabItems(updatedTabs);
    tabItemsRef.current = updatedTabs;
  };

  // Handle tab change
  const onTabChange = (newActiveKey: string) => {
    setActiveKey(newActiveKey);
    if (newActiveKey === "list") {
      const newUrl = wrapOrgCode(`/resources/disks`);
      window.history.pushState({}, "", newUrl);
    } else {
      const newUrl = wrapOrgCode(`/resources/disks/${newActiveKey}`);
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

  // Dispatch to load disks when component mounts
  const dispatch = useDispatch();

  useEffect(() => {
    if (currentProfile && pastLastCheckedCacheLimit(lastChecked)) {
      dispatch(checkDiskTablePermissionsAction(currentProfile.userID));
      const listParams: IRequestListDisks = {};
      dispatch(listDisksAction(listParams));
    }
  }, [currentProfile, lastChecked]);

  // The main component render
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
            Disks
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
            Add Disk
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
                <DisksTableList
                  isContentTabOpen={isContentTabOpen}
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

      <DisksAddDrawer
        open={drawerOpen}
        onClose={toggleDrawer}
        onAddDisk={() => {}}
      />
    </Layout>
  );
};

export default DisksPage;

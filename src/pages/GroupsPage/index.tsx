// src/components/GroupsPage/index.tsx

import React, { useCallback, useState, useRef, useEffect } from "react";
import { Button, Layout, Typography } from "antd";
import {
  SystemPermissionType,
  type GroupFE,
  type GroupID,
  type IRequestCreateGroup,
} from "@officexapp/types";
import { useDispatch, useSelector } from "react-redux";
import { CloseOutlined, PlusOutlined } from "@ant-design/icons";
import useScreenType from "react-screentype-hook";
import GroupsAddDrawer from "./group.add";
import GroupTab from "./group.tab";
import GroupsTableList from "./groups.table";
import { useIdentitySystem } from "../../framework/identity";
import { ReduxAppState } from "../../redux-offline/ReduxProvider";
import {
  checkGroupTablePermissionsAction,
  listGroupsAction,
} from "../../redux-offline/groups/groups.actions";
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

const GroupsPage: React.FC = () => {
  // Drawer state
  const [drawerOpen, setDrawerOpen] = useState<boolean>(false);
  const screenType = useScreenType();
  const { wrapOrgCode, currentProfile } = useIdentitySystem();
  const [lastClickedId, setLastClickedId] = useState<string | null>(null);
  const { tablePermissions, lastChecked } = useSelector(
    (state: ReduxAppState) => ({
      tablePermissions: state.groups.tablePermissions,
      lastChecked: state.groups.lastChecked,
    })
  );
  const dispatch = useDispatch();

  // Check if a group's tab is open
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
      label: "Groups List",
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

  useEffect(() => {
    if (currentProfile && pastLastCheckedCacheLimit(lastChecked)) {
      dispatch(checkGroupTablePermissionsAction(currentProfile.userID));
      dispatch(listGroupsAction({}));
    }
  }, [currentProfile, lastChecked]);

  // Function to handle clicking on a group
  const handleClickContentTab = useCallback(
    (group: GroupFE, focus_tab = false) => {
      setLastClickedId(group.id);
      // Use the ref to access the current state
      const currentTabItems = tabItemsRef.current;
      console.log("Current tabItems via ref:", currentTabItems);

      const existingTabIndex = currentTabItems.findIndex(
        (item) => item.key === group.id
      );
      console.log(`existingTabIndex`, existingTabIndex);

      if (existingTabIndex !== -1 && !focus_tab) {
        // Tab already exists, remove it
        const updatedTabs = currentTabItems.filter(
          (item) => item.key !== group.id
        );
        setTabItems(updatedTabs);
      } else if (existingTabIndex === -1) {
        // Create new tab
        const newTab: TabItem = {
          key: group.id,
          label: group.name,
          children: (
            <GroupTab groupCache={group} onDelete={handleDeletionCloseTabs} />
          ),
          closable: true,
        };

        // Insert new tab at position 1 (after list tab)
        setTabItems((prev) => {
          const updatedTabs = [...prev];
          updatedTabs.splice(1, 0, newTab);
          return updatedTabs;
        });

        // Switch to the clicked group's tab
        if (focus_tab) {
          setActiveKey(group.id);
        }
      } else if (focus_tab) {
        if (focus_tab) {
          setActiveKey(group.id);
        }
      }
    },
    [] // No dependencies needed since we use the ref
  );

  const handleDeletionCloseTabs = (groupID: GroupID) => {
    setActiveKey("list");
    const updatedTabs = tabItems.filter((item) => item.key !== groupID);
    setTabItems(updatedTabs);
    tabItemsRef.current = updatedTabs;
  };

  // Handle tab change
  const onTabChange = (newActiveKey: string) => {
    setActiveKey(newActiveKey);
    if (newActiveKey === "list") {
      const newUrl = wrapOrgCode(`/resources/groups`);
      window.history.pushState({}, "", newUrl);
    } else {
      const newUrl = wrapOrgCode(`/resources/groups/${newActiveKey}`);
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

  // Handle adding a new group
  const handleAddGroup = (groupData: IRequestCreateGroup) => {
    // This function can be expanded later if additional logic is needed
    console.log("Group added:", groupData);
  };

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
            Groups
          </Title>
          {activeKey === "list" && (
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
              Add Group
            </Button>
          )}
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
                <GroupsTableList
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

      <GroupsAddDrawer
        open={drawerOpen}
        onClose={toggleDrawer}
        onAddGroup={handleAddGroup}
      />
    </Layout>
  );
};

export default GroupsPage;

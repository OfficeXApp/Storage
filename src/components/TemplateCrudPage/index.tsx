// src/components/ContactsPage/index.tsx

import React, { useCallback, useState, useRef, useEffect } from "react";
import { Button, Drawer, Layout, Typography, Space, Input, Form } from "antd";
import type {
  Disk,
  IRequestCreateDisk,
  IRequestListDisks,
  IResponseCreateDisk,
  IResponseListDisks,
  UserID,
} from "@officexapp/types";
import { DiskTypeEnum } from "@officexapp/types";
import { useDispatch, useSelector } from "react-redux";
import { AppState } from "../../store/store";
import { createDisk, fetchDisks } from "../../store/disks/disks.actions";
import { CloseOutlined, PlusOutlined, UserOutlined } from "@ant-design/icons";
import TemplatesAddDrawer from "./templates.add";
import TemplateTab, { TemplateItem } from "./templates.tab";
import TemplatesTableList from "./templates.table";

const { Content, Footer } = Layout;
const { Title, Paragraph, Text } = Typography;

// Define tab item type for TypeScript
type TabItem = {
  key: string;
  label: React.ReactNode;
  children: React.ReactNode;
  closable?: boolean;
};

const ContactsPage: React.FC = () => {
  // Drawer state
  const [drawerOpen, setDrawerOpen] = useState<boolean>(false);

  const [lastClickedId, setLastClickedId] = useState<string | null>(null);

  // Sample profile data - expanded list
  const [profiles, setProfiles] = useState<TemplateItem[]>([
    {
      id: "1",
      name: "Anna Smith",
      email: "anna.smith@example.com",
      phone: "555-1234",
    },
    {
      id: "2",
      name: "Bob Johnson",
      email: "bob.johnson@example.com",
      phone: "555-2345",
    },
    {
      id: "3",
      name: "Charlie Davis",
      email: "charlie.davis@example.com",
      phone: "555-3456",
    },
    {
      id: "4",
      name: "David Wilson",
      email: "david.wilson@example.com",
      phone: "555-4567",
    },
    {
      id: "5",
      name: "Emma Brown",
      email: "emma.brown@example.com",
      phone: "555-5678",
    },
    {
      id: "6",
      name: "Frank Miller",
      email: "frank.miller@example.com",
      phone: "555-6789",
    },
    {
      id: "7",
      name: "Grace Lee",
      email: "grace.lee@example.com",
      phone: "555-7890",
    },
    {
      id: "8",
      name: "Henry Taylor",
      email: "henry.taylor@example.com",
      phone: "555-8901",
    },
    {
      id: "9",
      name: "Ivy Robinson",
      email: "ivy.robinson@example.com",
      phone: "555-9012",
    },
    {
      id: "10",
      name: "Jack Thompson",
      email: "jack.thompson@example.com",
      phone: "555-0123",
    },
    {
      id: "11",
      name: "Karen Martin",
      email: "karen.martin@example.com",
      phone: "555-1234",
    },
    {
      id: "12",
      name: "Leo Anderson",
      email: "leo.anderson@example.com",
      phone: "555-2345",
    },
    {
      id: "13",
      name: "Maria Garcia",
      email: "maria.garcia@example.com",
      phone: "555-3456",
    },
    {
      id: "14",
      name: "Nathan Kim",
      email: "nathan.kim@example.com",
      phone: "555-4567",
    },
    {
      id: "15",
      name: "Olivia White",
      email: "olivia.white@example.com",
      phone: "555-5678",
    },
    {
      id: "16",
      name: "Patrick Chen",
      email: "patrick.chen@example.com",
      phone: "555-6789",
    },
    {
      id: "17",
      name: "Quinn Harris",
      email: "quinn.harris@example.com",
      phone: "555-7890",
    },
    {
      id: "18",
      name: "Rachel Clark",
      email: "rachel.clark@example.com",
      phone: "555-8901",
    },
    {
      id: "19",
      name: "Sam Rodriguez",
      email: "sam.rodriguez@example.com",
      phone: "555-9012",
    },
    {
      id: "20",
      name: "Tina Patel",
      email: "tina.patel@example.com",
      phone: "555-0123",
    },
  ]);
  const isTemplateTabOpen = useCallback(
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
      label: "Contacts List",
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

  // Function to handle clicking on a contact
  const handleTemplateTab = useCallback(
    (profile: TemplateItem, focus_tab = false) => {
      setLastClickedId(profile.id);
      // Use the ref to access the current state
      const currentTabItems = tabItemsRef.current;
      console.log("Current tabItems via ref:", currentTabItems);

      const existingTabIndex = currentTabItems.findIndex(
        (item) => item.key === profile.id
      );
      console.log(`existingTabIndex`, existingTabIndex);

      if (existingTabIndex !== -1) {
        // Tab already exists, remove it
        const updatedTabs = currentTabItems.filter(
          (item) => item.key !== profile.id
        );
        setTabItems(updatedTabs);
      } else {
        // Create new tab
        const newTab: TabItem = {
          key: profile.id,
          label: profile.name,
          children: <TemplateTab contact={profile} />,
          closable: true,
        };

        // Insert new tab at position 1 (after list tab)
        setTabItems((prev) => {
          const updatedTabs = [...prev];
          updatedTabs.splice(1, 0, newTab);
          return updatedTabs;
        });

        // Switch to the clicked contact's tab
        if (focus_tab) {
          setActiveKey(profile.id);
        }
      }
    },
    [] // No dependencies needed since we use the ref
  );

  // Handle tab change
  const onTabChange = (newActiveKey: string) => {
    setActiveKey(newActiveKey);
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

  // Add new contact
  const addNewContact = (newContactName: string) => {
    // Changed to accept a parameter
    if (newContactName.trim()) {
      const newId = (profiles.length + 1).toString();
      const newProfile: TemplateItem = {
        id: newId,
        name: newContactName.trim(),
        email: `${newContactName.toLowerCase().replace(/\s+/g, ".")}@example.com`,
        phone: `555-${Math.floor(1000 + Math.random() * 9000)}`,
      };

      // Update profiles list
      const updatedProfiles = [...profiles, newProfile];
      setProfiles(updatedProfiles);

      // Close drawer
      setDrawerOpen(false);

      // Open the new contact tab
      handleTemplateTab(newProfile);
    }
  };

  // The rest of your component remains the same
  return (
    <Layout
      style={{
        height: "100%",
        width: "100%",
        display: "flex",
        flexDirection: "column",
        backgroundColor: "white",
      }}
    >
      <Content
        style={{
          padding: "0 16px",
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
            margin: "0px 0px 16px 16px",
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
            Templates
          </Title>
          <Button type="primary" icon={<PlusOutlined />} onClick={toggleDrawer}>
            Add Template
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
              minHeight: 0, // Critical fix for flexbox scrolling
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
                onClick={() => setActiveKey("list")}
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
                    onClick={() => setActiveKey(item.key)}
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
                minHeight: 0,
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
                <TemplatesTableList
                  profiles={profiles}
                  isTemplateTabOpen={isTemplateTabOpen}
                  handleTemplateTab={handleTemplateTab}
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

      <TemplatesAddDrawer
        open={drawerOpen}
        onClose={toggleDrawer}
        onAddContact={addNewContact}
      />

      <Footer style={{ textAlign: "center" }}>OfficeX ©2024</Footer>
    </Layout>
  );
};

export default ContactsPage;

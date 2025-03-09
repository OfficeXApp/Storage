// src/components/ContactsPage/index.tsx

import React, { useCallback, useState, useRef, useEffect } from "react";
import { Button, Drawer, Layout, Typography, Space, Input, Form } from "antd";
import type {
  ContactFE,
  Disk,
  IRequestCreateDisk,
  IRequestListDisks,
  IResponseCreateDisk,
  IResponseListDisks,
  UserID,
} from "@officexapp/types";
import { DiskTypeEnum, SystemPermissionType } from "@officexapp/types";
import { useDispatch, useSelector } from "react-redux";
import { AppState } from "../../store/store";
import { createDisk, fetchDisks } from "../../store/disks/disks.actions";
import { CloseOutlined, PlusOutlined, UserOutlined } from "@ant-design/icons";
import ContactsAddDrawer from "./contacts.add";
import ContactTab from "./contacts.tab";
import ContactsTableList from "./contacts.table";
import { SAMPLE_CONTACTS } from "./sample";

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

  // Sample contact data - expanded list
  const [contacts, setContacts] = useState<ContactFE[]>(SAMPLE_CONTACTS);
  const isContactTabOpen = useCallback(
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
  const handleContactTab = useCallback(
    (contact: ContactFE, focus_tab = false) => {
      setLastClickedId(contact.id);
      // Use the ref to access the current state
      const currentTabItems = tabItemsRef.current;
      console.log("Current tabItems via ref:", currentTabItems);

      const existingTabIndex = currentTabItems.findIndex(
        (item) => item.key === contact.id
      );
      console.log(`existingTabIndex`, existingTabIndex);

      if (existingTabIndex !== -1) {
        // Tab already exists, remove it
        const updatedTabs = currentTabItems.filter(
          (item) => item.key !== contact.id
        );
        setTabItems(updatedTabs);
      } else {
        // Create new tab
        const newTab: TabItem = {
          key: contact.id,
          label: contact.name,
          children: <ContactTab contact={contact} />,
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
          setActiveKey(contact.id);
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
            Contacts
          </Title>
          <Button type="primary" icon={<PlusOutlined />} onClick={toggleDrawer}>
            Add Contact
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
                <ContactsTableList
                  contacts={contacts}
                  isContactTabOpen={isContactTabOpen}
                  handleContactTab={handleContactTab}
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

      <ContactsAddDrawer
        open={drawerOpen}
        onClose={toggleDrawer}
        onAddContact={() => {}}
      />

      <Footer style={{ textAlign: "center" }}>OfficeX ©2024</Footer>
    </Layout>
  );
};

export default ContactsPage;

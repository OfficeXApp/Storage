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
import { DiskTypeEnum } from "@officexapp/types";
import { useDispatch, useSelector } from "react-redux";
import { AppState } from "../../store/store";
import { createDisk, fetchDisks } from "../../store/disks/disks.actions";
import { CloseOutlined, PlusOutlined, UserOutlined } from "@ant-design/icons";
import ContactsAddDrawer from "./contacts.add";
import ContactTab from "./contacts.tab";
import ContactsTableList from "./contacts.table";

const { Content, Footer } = Layout;
const { Title, Paragraph, Text } = Typography;

// Define tab item type for TypeScript
type TabItem = {
  key: string;
  label: React.ReactNode;
  children: React.ReactNode;
  closable?: boolean;
};

const SAMPLE_CONTACTS: ContactFE[] = [
  {
    // Contact 1
    id: "user_01HGXPT5ABCDEF123456789",
    name: "Alice Johnson",
    avatar: "",
    email: "alice.johnson@example.com",
    webhook_url: "https://webhook.site/123456-abcd-efgh-ijkl-123456789abc",
    public_note: "Product Manager at TechCorp",
    private_note: "Met at DevConf 2024, interested in API integrations",
    evm_public_address: "0x1234567890123456789012345678901234567890",
    icp_principal: "rrkah-fqaaa-aaaaa-aaaaq-cai",
    teams: ["team_01HX7ZP5ABCDEF123456789", "team_01HX7ZP6ABCDEF123456789"],
    tags: ["customer", "enterprise", "priority"],
    last_online_at: 1709911245000, // March 8, 2025
    created_at: 1677861645000, // March 3, 2023
    external_id: "CRM-12345",
    team_previews: [
      {
        team_id: "team_01HX7ZP5ABCDEF123456789",
        invite_id: "invite_01HX8ZP5ABCDEF123456789",
        is_admin: true,
        team_name: "Product Team",
        team_avatar: "",
      },
      {
        team_id: "team_01HX7ZP6ABCDEF123456789",
        invite_id: "invite_01HX8ZP6ABCDEF123456789",
        is_admin: false,
        team_name: "Marketing Team",
        team_avatar: "",
      },
    ],
  },
  {
    // Contact 2
    id: "user_01HGXPT6ABCDEF123456789",
    name: "Bob Smith",
    avatar: "",
    email: "bob.smith@example.com",
    webhook_url: "https://webhook.site/234567-bcde-fghi-jklm-234567890abc",
    public_note: "Senior Developer at WebSolutions",
    private_note:
      "Prefers technical communication, follow up on integration issues",
    evm_public_address: "0x2345678901234567890123456789012345678901",
    icp_principal: "k4qsa-4aaaa-aaaaa-aaaaq-cai",
    teams: ["team_01HX7ZP7ABCDEF123456789"],
    tags: ["developer", "beta-tester"],
    last_online_at: 1709824845000, // March 7, 2025
    created_at: 1693470845000, // August 31, 2023
    external_id: "DEV-78901",
    team_previews: [
      {
        team_id: "team_01HX7ZP7ABCDEF123456789",
        invite_id: "invite_01HX8ZP7ABCDEF123456789",
        is_admin: true,
        team_name: "Engineering",
        team_avatar: "",
      },
    ],
  },
  {
    // Contact 3
    id: "user_01HGXPT7ABCDEF123456789",
    name: "Carol Davis",
    avatar: "",
    email: "carol.davis@example.com",
    webhook_url: "https://webhook.site/345678-cdef-ghij-klmn-345678901abc",
    public_note: "CFO at FinanceHub",
    private_note: "Requires detailed invoices for all transactions",
    evm_public_address: "0x3456789012345678901234567890123456789012",
    icp_principal: "nw4gu-4iaaa-aaaaa-aaaaq-cai",
    teams: ["team_01HX7ZP8ABCDEF123456789", "team_01HX7ZP9ABCDEF123456789"],
    tags: ["finance", "enterprise", "decision-maker"],
    last_online_at: 1709738445000, // March 6, 2025
    created_at: 1688286845000, // July 2, 2023
    external_id: "FIN-23456",
    team_previews: [
      {
        team_id: "team_01HX7ZP8ABCDEF123456789",
        invite_id: "invite_01HX8ZP8ABCDEF123456789",
        is_admin: true,
        team_name: "Finance",
        team_avatar: "",
      },
      {
        team_id: "team_01HX7ZP9ABCDEF123456789",
        invite_id: "invite_01HX8ZP9ABCDEF123456789",
        is_admin: false,
        team_name: "Executive",
        team_avatar: "",
      },
    ],
  },
  {
    // Contact 4
    id: "user_01HGXPT8ABCDEF123456789",
    name: "David Wilson",
    avatar: "",
    email: "david.wilson@example.com",
    webhook_url: "https://webhook.site/456789-defg-hijk-lmno-456789012abc",
    public_note: "UX Designer at DesignLab",
    private_note: "Great at providing feedback, potential case study candidate",
    evm_public_address: "0x4567890123456789012345678901234567890123",
    icp_principal: "oazcs-eqaaa-aaaaa-aaaaq-cai",
    teams: [],
    tags: [],
    last_online_at: 1709652045000, // March 5, 2025
    created_at: 1672603245000, // January 1, 2023
    team_previews: [],
  },
  {
    // Contact 5
    id: "user_01HGXPT9ABCDEF123456789",
    name: "Elena Rodriguez",
    avatar: "",
    email: "elena.rodriguez@example.com",
    webhook_url: "https://webhook.site/567890-efgh-ijkl-mnop-567890123abc",
    public_note: "",
    private_note:
      "Looking to scale their infrastructure, potential upsell opportunity",
    evm_public_address: "0x5678901234567890123456789012345678901234",
    icp_principal: "pfouk-5yaaa-aaaaa-aaaaq-cai",
    teams: [],
    tags: [],
    last_online_at: 1709565645000, // March 4, 2025
    created_at: 1683125445000, // May 3, 2023
    external_id: "TECH-34567",
    team_previews: [],
  },
  {
    // Contact 6
    id: "user_01HGXPTAABCDEF123456789",
    name: "Frank Lee",
    avatar: "",
    email: "frank.lee@example.com",
    webhook_url: "https://webhook.site/678901-fghi-jklm-nopq-678901234abc",
    public_note: "Marketing Director at BrandCo",
    private_note: "Interested in case studies and content collaborations",
    evm_public_address: "0x6789012345678901234567890123456789012345",
    icp_principal: "qnpeu-2yaaa-aaaaa-aaaaq-cai",
    teams: ["team_01HX7ZQE1BCDEF123456789"],
    tags: ["marketing", "partnership", "content"],
    last_online_at: 1709479245000, // March 3, 2025
    created_at: 1704225645000, // January 2, 2024
    external_id: "MKT-45678",
    team_previews: [
      {
        team_id: "team_01HX7ZQE1BCDEF123456789",
        invite_id: "invite_01HX8ZQE1BCDEF123456789",
        is_admin: true,
        team_name: "Marketing",
      },
    ],
  },
  {
    // Contact 7
    id: "user_01HGXPTBABCDEF123456789",
    name: "Grace Kim",
    avatar: "",
    email: "grace.kim@example.com",
    webhook_url: "https://webhook.site/789012-ghij-klmn-opqr-789012345abc",
    public_note: "Customer Support Lead at ServiceNow",
    private_note:
      "Great advocate for our platform, potential reference customer",
    evm_public_address: "0x7890123456789012345678901234567890123456",
    icp_principal: "rffb6-tiaaa-aaaaa-aaaaq-cai",
    teams: ["team_01HX7ZQF1BCDEF123456789", "team_01HX7ZQG1BCDEF123456789"],
    tags: ["support", "advocate", "reference"],
    last_online_at: 1709392845000, // March 2, 2025
    created_at: 1675281645000, // February 1, 2023
    external_id: "SUP-56789",
    team_previews: [
      {
        team_id: "team_01HX7ZQF1BCDEF123456789",
        invite_id: "invite_01HX8ZQF1BCDEF123456789",
        is_admin: true,
        team_name: "Customer Success",
        team_avatar: "",
      },
      {
        team_id: "team_01HX7ZQG1BCDEF123456789",
        invite_id: "invite_01HX8ZQG1BCDEF123456789",
        is_admin: false,
        team_name: "Community",
        team_avatar: "",
      },
    ],
  },
  {
    // Contact 8
    id: "user_01HGXPTCABCDEF123456789",
    name: "Henry Garcia",
    avatar: "",
    email: "henry.garcia@example.com",
    webhook_url: "https://webhook.site/890123-hijk-lmno-pqrs-890123456abc",
    public_note: "Sales Director at Enterprise Solutions",
    private_note: "Looking for white-label solutions, high-value prospect",
    evm_public_address: "0x8901234567890123456789012345678901234567",
    icp_principal: "ske6q-saaaa-aaaaa-aaaaq-cai",
    teams: ["team_01HX7ZQH1BCDEF123456789"],
    tags: [],
    last_online_at: 1709306445000, // March 1, 2025
    created_at: 1696149245000, // October 1, 2023
    external_id: "SALES-67890",
    team_previews: [
      {
        team_id: "team_01HX7ZQH1BCDEF123456789",
        invite_id: "invite_01HX8ZQH1BCDEF123456789",
        is_admin: false,
        team_name: "Sales",
        team_avatar: "",
      },
    ],
  },
  {
    // Contact 9
    id: "user_01HGXPTDABCDEF123456789",
    name: "Irene Thompson",
    avatar: "",
    email: "irene.thompson@example.com",
    webhook_url: "https://webhook.site/901234-ijkl-mnop-qrst-901234567abc",
    public_note: "HR Director at PeopleFirst",
    private_note:
      "Looking for solutions to improve employee onboarding experience",
    evm_public_address: "0x9012345678901234567890123456789012345678",
    icp_principal: "tqpzl-3qaaa-aaaaa-aaaaq-cai",
    teams: ["team_01HX7ZQI1BCDEF123456789", "team_01HX7ZQJ1BCDEF123456789"],
    tags: ["hr", "mid-market", "implementation"],
    last_online_at: 1709220045000, // February 29, 2025
    created_at: 1704139245000, // January 1, 2024
    external_id: "HR-78901",
    team_previews: [
      {
        team_id: "team_01HX7ZQI1BCDEF123456789",
        invite_id: "invite_01HX8ZQI1BCDEF123456789",
        is_admin: true,
        team_name: "Human Resources",
      },
      {
        team_id: "team_01HX7ZQJ1BCDEF123456789",
        invite_id: "invite_01HX8ZQJ1BCDEF123456789",
        is_admin: false,
        team_name: "Operations",
        team_avatar: "",
      },
    ],
  },
  {
    // Contact 10
    id: "user_01HGXPTEABCDEF123456789",
    name: "James Miller",
    avatar: "",
    email: "james.miller@example.com",
    webhook_url: "https://webhook.site/012345-jklm-nopq-rstu-012345678abc",
    public_note: "Security Consultant at CyberShield",
    private_note:
      "Very particular about data privacy, requires detailed compliance documentation",
    evm_public_address: "0x0123456789012345678901234567890123456789",
    icp_principal: "uuafj-uyaaa-aaaaa-aaaaq-cai",
    teams: ["team_01HX7ZQK1BCDEF123456789"],
    tags: ["security", "compliance", "consultant"],
    last_online_at: 1709133645000, // February 28, 2025
    created_at: 1680410045000, // April 2, 2023
    external_id: "SEC-89012",
    team_previews: [
      {
        team_id: "team_01HX7ZQK1BCDEF123456789",
        invite_id: "invite_01HX8ZQK1BCDEF123456789",
        is_admin: true,
        team_name: "Security",
        team_avatar: "",
      },
    ],
  },
];

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

  // Add new contact
  const addNewContact = (newContactName: string) => {
    // Changed to accept a parameter
    if (newContactName.trim()) {
      const newId = (contacts.length + 1).toString();
      // Create timestamp for now
      const currentTimestamp = Date.now();

      const newContact: ContactFE = {
        id: newId,
        name: newContactName.trim(),
        avatar: ``,
        email: `${newContactName.toLowerCase().replace(/\s+/g, ".")}@example.com`,
        webhook_url: `https://webhook.site/${Math.random().toString(36).substring(2, 8)}-${Math.random().toString(36).substring(2, 6)}-${Math.random().toString(36).substring(2, 6)}-${Math.random().toString(36).substring(2, 6)}-${Math.random().toString(36).substring(2, 14)}`,
        public_note: "",
        evm_public_address: `0x${Array.from({ length: 40 }, () => Math.floor(Math.random() * 16).toString(16)).join("")}`,
        icp_principal: `${Math.random().toString(36).substring(2, 7)}-${Math.random().toString(36).substring(2, 6)}aaa-aaaaa-aaaaq-cai`,
        teams: [],
        tags: [],
        last_online_at: currentTimestamp,
        created_at: currentTimestamp,
        team_previews: [],
      };

      // Update contacts list
      const updatedContacts = [...contacts, newContact];
      setContacts(updatedContacts);

      // Close drawer
      setDrawerOpen(false);

      // Open the new contact tab
      handleContactTab(newContact);
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
        onAddContact={addNewContact}
      />

      <Footer style={{ textAlign: "center" }}>OfficeX ©2024</Footer>
    </Layout>
  );
};

export default ContactsPage;

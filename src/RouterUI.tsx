// Router.tsx
import { useEffect, useState } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  useNavigate,
  Navigate,
  Link,
} from "react-router-dom";
import {
  Layout,
  Menu,
  Button,
  Drawer,
  MenuProps,
  Dropdown,
  Space,
  Card,
  Statistic,
  Select,
} from "antd";
import {
  FolderOutlined,
  UserOutlined,
  ClockCircleOutlined,
  StarOutlined,
  DeleteOutlined,
  MenuOutlined,
  PlusOutlined,
  ArrowUpOutlined,
  SettingOutlined,
  SwapOutlined,
  HomeOutlined,
  UnorderedListOutlined,
  TeamOutlined,
} from "@ant-design/icons";
import DriveUI from "./components/DriveUI";
import UploadPanel from "./components/UploadPanel";
import SearchHeader from "./components/SearchHeader";
import ActionMenuButton from "./components/ActionMenuButton";
import PreseedOffer from "./components/PreseedOffer";
import useScreenType from "react-screentype-hook";
import LoadSampleFiles from "./components/DriveUI/LoadSampleFiles";
import ConnectICPButton from "./components/ConnectICPButton";
import SettingsPage from "./components/SettingsPage";
import GiftPage from "./components/GiftPage";
import SandboxPage from "./components/SandboxPage";
import ContactsPage from "./components/ContactsPage";
import TeamsPage from "./components/TeamsPage";
import PermissionsPage from "./components/PermissionsPage";
import TagsPage from "./components/TagsPage";
import DisksPage from "./components/DisksPage";
import DrivesPage from "./components/DrivesPage";
import WebhooksPage from "./components/WebhooksPage";
import ApiKeysPage from "./components/ApiKeysPage";
import OrganizationSwitcher from "./components/SwitchOrganization";

const { Sider, Content } = Layout;

const MOBILE_BREAKPOINT = 768;
const SIDEBAR_WIDTH = 250;

const SideMenu = ({
  setSidebarVisible,
}: {
  setSidebarVisible?: (visible: boolean) => void;
}) => {
  const navigate = useNavigate();
  const menuItems = [
    // {
    //   key: "drive",
    //   icon: <FolderOutlined />,
    //   label: "My Drive",
    //   onClick: () => {
    //     navigate("/drive");
    //     if (setSidebarVisible) {
    //       setSidebarVisible(false);
    //     }
    //   },
    // },
    // {
    //   key: "shared",
    //   icon: <UserOutlined />,
    //   label: "Shared with me",
    //   disabled: true,
    // },
    // {
    //   key: "recent",
    //   icon: <ClockCircleOutlined />,
    //   label: "Recent",
    //   disabled: true,
    // },
    // {
    //   key: "starred",
    //   icon: <StarOutlined />,
    //   label: "Starred",
    //   disabled: true,
    // },
    // {
    //   key: "trash",
    //   icon: <DeleteOutlined />,
    //   label: "Trash",
    //   disabled: true,
    // },
    {
      key: "navigate-storage",
      label: "Storage",
      icon: <FolderOutlined />,
      children: [
        {
          key: "drive",
          label: "My Drive",
          type: "item",
          // icon: <FolderOutlined />,
          onClick: () => {
            navigate("/drive");
            if (setSidebarVisible) {
              setSidebarVisible(false);
            }
          },
        },
        {
          key: "shared",
          label: "Shared with me",
          type: "item",
          // icon: <UserOutlined />,
        },
        {
          key: "recent",
          label: "Recent",
          type: "item",
          // icon: <ClockCircleOutlined />,
        },
        {
          key: "starred",
          label: "Tagged",
          type: "item",
          // icon: <StarOutlined />,
        },
        {
          key: "trash",
          label: "Trash",
          type: "item",
          // icon: <DeleteOutlined />,
        },
      ],
    },
    {
      key: "organization",
      label: "Organization",
      icon: <TeamOutlined />,
      children: [
        {
          key: "people",
          label: "Teams",
          type: "group",
          children: [
            {
              key: "contacts",
              label: "Contacts",
              onClick: () => {
                navigate("/resources/contacts");
                if (setSidebarVisible) {
                  setSidebarVisible(false);
                }
              },
            },
            {
              key: "teams",
              label: "Teams",
              onClick: () => {
                navigate("/resources/teams");
                if (setSidebarVisible) {
                  setSidebarVisible(false);
                }
              },
            },
            {
              key: "permissions",
              label: "Permissions",
              onClick: () => {
                navigate("/resources/permissions");
                if (setSidebarVisible) {
                  setSidebarVisible(false);
                }
              },
            },
            {
              key: "tags",
              label: "Tags",
              onClick: () => {
                navigate("/resources/tags");
                if (setSidebarVisible) {
                  setSidebarVisible(false);
                }
              },
            },
          ],
        },
        {
          key: "storage",
          label: "Storage",
          type: "group",
          children: [
            {
              key: "disks",
              label: "Disks",
              onClick: () => {
                navigate("/resources/disks");
                if (setSidebarVisible) {
                  setSidebarVisible(false);
                }
              },
            },
            {
              key: "drives",
              label: "Drives",
              onClick: () => {
                navigate("/resources/drives");
                if (setSidebarVisible) {
                  setSidebarVisible(false);
                }
              },
            },
          ],
        },
        {
          key: "developers",
          label: "Developers",
          type: "group",
          children: [
            {
              key: "webhooks",
              label: "Webhooks",
              onClick: () => {
                navigate("/resources/webhooks");
                if (setSidebarVisible) {
                  setSidebarVisible(false);
                }
              },
            },
            {
              key: "api-keys",
              label: "API Keys",
              onClick: () => {
                navigate("/resources/api-keys");
                if (setSidebarVisible) {
                  setSidebarVisible(false);
                }
              },
            },
          ],
        },
      ],
    },
    {
      key: "settings",
      icon: <SettingOutlined />,
      label: "Settings",
      onClick: () => {
        navigate("/settings");
        if (setSidebarVisible) {
          setSidebarVisible(false);
        }
      },
    },
  ];

  return (
    <Menu
      mode="inline"
      items={menuItems}
      defaultOpenKeys={["navigate-storage"]}
      style={{ backgroundColor: "inherit", border: 0 }}
    />
  );
};

function ExternalRedirect({ url }: { url: string }) {
  useEffect(() => {
    window.location.href = url;
  }, []);

  return null;
}

const RouterUI = () => {
  const [sidebarVisible, setSidebarVisible] = useState(false);
  const screenType = useScreenType();

  const [uploadPanelVisible, setUploadPanelVisible] = useState(false);

  return (
    <BrowserRouter>
      <LoadSampleFiles />
      <UploadPanel
        uploadPanelVisible={uploadPanelVisible}
        setUploadPanelVisible={setUploadPanelVisible}
      >
        <Layout style={{ minHeight: "100vh", background: "#fbfbfb" }}>
          {!screenType.isMobile && (
            <Sider
              width={SIDEBAR_WIDTH}
              style={{
                background: "#fbfbfb",
                border: "0px solid white",
              }}
            >
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  height: "95%",
                  overflowY: "auto",
                }}
              >
                <div style={{ flex: 1 }}>
                  <div
                    style={{
                      padding: "32px",
                      fontWeight: "bold",
                      height: "80px",
                      display: "flex",
                      justifyContent: "flex-start",
                      alignItems: "center",
                      color: "#1a1a3a",
                      fontSize: "1rem",
                    }}
                  >
                    <h1>OfficeX</h1>
                    <span
                      style={{
                        fontWeight: 300,
                        marginLeft: "10px",
                        fontSize: "0.8rem",
                      }}
                    >
                      Alpha v0.1
                    </span>
                  </div>
                  <section
                    style={{
                      width: "100%",
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "center",
                      alignItems: "center",
                      padding: "0px 20px 20px 20px",
                    }}
                  >
                    <ConnectICPButton />
                    <ActionMenuButton
                      isBigButton={true}
                      toggleUploadPanel={setUploadPanelVisible}
                    />
                  </section>
                  <SideMenu />
                </div>
                <OrganizationSwitcher />
              </div>
            </Sider>
          )}
          <Layout style={{ padding: "0px 8px 0px 0px", background: "#fbfbfb" }}>
            <SearchHeader setSidebarVisible={setSidebarVisible} />
            <Content
              style={{
                background: "#fbfbfb",
                overflowY: "auto",
                maxHeight: "calc(100vh - 64px)",
              }}
            >
              <Routes>
                <Route path="/" element={<Navigate to="/drive/Web3Storj/" />} />
                <Route
                  path="/drive/*"
                  element={
                    <DriveUI toggleUploadPanel={setUploadPanelVisible} />
                  }
                />
                <Route
                  path="/buy"
                  element={
                    <ExternalRedirect url="https://app.uniswap.org/swap?inputCurrency=0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913&outputCurrency=0x48808407d95f691D076C90337d42eE3836656990" />
                  }
                />
                <Route path="/settings" element={<SettingsPage />} />
                <Route path="/sandbox" element={<SandboxPage />} />
                <Route path="/presale" element={<PreseedOffer />} />
                <Route path="/preseed" element={<Navigate to="/presale" />} />
                <Route
                  path="/whitepaper"
                  element={
                    <ExternalRedirect url="https://tinyurl.com/ofx-whitepaper" />
                  }
                />
                <Route path="/gift" element={<GiftPage />} />

                {/* Organization Level Routes */}
                <Route path="/resources/contacts" element={<ContactsPage />} />
                <Route path="/resources/teams" element={<TeamsPage />} />
                <Route
                  path="/resources/permissions"
                  element={<PermissionsPage />}
                />
                <Route path="/resources/tags" element={<TagsPage />} />
                <Route path="/resources/disks" element={<DisksPage />} />
                <Route path="/resources/drives" element={<DrivesPage />} />
                <Route path="/resources/webhooks" element={<WebhooksPage />} />
                <Route path="/resources/api-keys" element={<ApiKeysPage />} />

                {/* Add other routes here */}
              </Routes>
            </Content>
          </Layout>
          {screenType.isMobile && (
            <Drawer
              title={
                <div>
                  <b>OfficeX</b>
                  <span style={{ fontWeight: 300, marginLeft: "5px" }}>
                    Alpha
                  </span>
                </div>
              }
              placement="left"
              onClose={() => setSidebarVisible(false)}
              open={sidebarVisible}
              width={SIDEBAR_WIDTH}
              footer={
                <div style={{ padding: "16px 16px" }}>
                  <OrganizationSwitcher />
                </div>
              }
              style={{ overflowY: "auto" }}
            >
              <ConnectICPButton />
              <SideMenu setSidebarVisible={setSidebarVisible} />
            </Drawer>
          )}
        </Layout>
      </UploadPanel>
    </BrowserRouter>
  );
};

export default RouterUI;

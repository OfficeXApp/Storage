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
// import LoadSampleFiles from "./components/DriveUI/LoadSampleFiles";
import ConnectICPButton from "./components/ConnectICPButton";
import SettingsPage from "./components/SettingsPage";
import GiftPage from "./components/GiftPage";
import SandboxPage from "./components/SandboxPage";
import SandboxUploader from "./components/SandboxPage/SandboxUploader.tsx";
import ContactsPage from "./pages/ContactsPage";
import GroupsPage from "./pages/GroupsPage";
import PermissionsPage from "./pages/PermissionsPage";
import LabelsPage from "./pages/LabelsPage";
import DisksPage from "./pages/DisksPage";
import DrivesPage from "./pages/DrivesPage";
import ApiKeysPage from "./pages/ApiKeysPage";
import WebhooksPage from "./pages/WebhooksPage";
import OrganizationSwitcher from "./components/SwitchOrganization";
import TemplateCrudPage from "./components/TemplateCrudPage";
import ContactPage from "./pages/ContactsPage/contact.page";
import GroupPage from "./pages/GroupsPage/group.page";
import LabelPage from "./pages/LabelsPage/label.page";
import DiskPage from "./pages/DisksPage/disk.page";
import WebhookPage from "./pages/WebhooksPage/webhook.page";
import DrivePage from "./pages/DrivesPage/drive.page";
import ApiKeyPage from "./pages/ApiKeysPage/api-key.page";
import PermissionPage from "./pages/PermissionsPage/permission.page";
import {
  defaultTempCloudSharingDiskID,
  defaultTempCloudSharingRootFolderID,
} from "./api/dexie-database";
import { useSelector } from "react-redux";
import { ReduxAppState } from "./redux-offline/ReduxProvider";

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
    {
      key: "navigate-storage",
      label: "Storage",
      icon: <FolderOutlined />,
      children: [
        {
          key: "drive",
          label: <Link to="/drive">My Drive</Link>,
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
          label: "Labeled",
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
          label: "Groups",
          type: "group",
          children: [
            {
              key: "contacts",
              label: <Link to="/resources/contacts">Contacts</Link>,
            },
            {
              key: "groups",
              label: <Link to="/resources/groups">Groups</Link>,
            },
            {
              key: "permissions",
              label: <Link to="/resources/permissions">Permissions</Link>,
            },
            {
              key: "labels",
              label: <Link to="/resources/labels">Labels</Link>,
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
              label: <Link to="/resources/disks">Disks</Link>,
            },
            {
              key: "drives",
              label: <Link to="/resources/drives">Drives</Link>,
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
              label: <Link to="/resources/webhooks">Webhooks</Link>,
            },
            {
              key: "api-keys",
              label: <Link to="/resources/api-keys">API Keys</Link>,
            },
            {
              key: "sandbox",
              label: "Sandbox",
              onClick: () => {
                navigate("/sandbox");
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
    <div style={{ maxHeight: "75vh", overflowY: "scroll" }}>
      <Menu
        mode="inline"
        items={menuItems}
        defaultOpenKeys={["navigate-storage"]}
        style={{ backgroundColor: "inherit", border: 0 }}
      />
    </div>
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
      {/* <LoadSampleFiles /> */}
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
                  height: "100%",
                  paddingBottom: "8px",
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
                      overflowY: "scroll",
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
                <Route
                  path="/"
                  element={
                    <Navigate
                      to={`/drive/${defaultTempCloudSharingDiskID}/${defaultTempCloudSharingRootFolderID}/`}
                    />
                  }
                />
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
                <Route path="/sandbox_uploader" element={<SandboxUploader />} />
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
                <Route
                  path="/resources/contacts/:userID"
                  element={<ContactPage />}
                />
                <Route path="/resources/groups" element={<GroupsPage />} />
                <Route
                  path="/resources/groups/:groupID"
                  element={<GroupPage />}
                />
                <Route
                  path="/resources/permissions"
                  element={<PermissionsPage />}
                />
                <Route
                  path="/resources/permissions/:permissionVariant/:permissionID"
                  element={<PermissionPage />}
                />
                <Route path="/resources/labels" element={<LabelsPage />} />
                <Route
                  path="/resources/labels/:labelID"
                  element={<LabelPage />}
                />
                <Route path="/resources/disks" element={<DisksPage />} />
                <Route path="/resources/disks/:diskID" element={<DiskPage />} />
                <Route path="/resources/drives" element={<DrivesPage />} />
                <Route
                  path="/resources/drives/:driveID"
                  element={<DrivePage />}
                />
                <Route
                  path="/resources/templates"
                  element={<TemplateCrudPage />}
                />
                <Route path="/resources/webhooks" element={<WebhooksPage />} />
                <Route
                  path="/resources/webhooks/:webhookID"
                  element={<WebhookPage />}
                />
                <Route path="/resources/api-keys" element={<ApiKeysPage />} />
                <Route
                  path="/resources/api-keys/:apiKeyID"
                  element={<ApiKeyPage />}
                />

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
                <div style={{ padding: "0px" }}>
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

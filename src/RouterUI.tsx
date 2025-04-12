// Router.tsx
import { useEffect, useId, useState } from "react";
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
// import SandboxIndexdbUploader from "./components/SandboxPage/SandboxIndexdbUploader.tsx";
// import SandboxCanisterUploader from "./components/SandboxPage/SandboxCanisterUploader.tsx";
// import SandboxLocalStorjUploader from "./components/SandboxPage/SandboxLocalStorjUploader.tsx";
// import SandboxCloudStorjUploader from "./components/SandboxPage/SandboxCloudStorjUploader.tsx";
import ContactsPage from "./pages/ContactsPage";
import ContactRedeem from "./pages/ContactsPage/contact.redeem";
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
import RedeemDirectoryPermitPage from "./components/DirectorySharingDrawer/directory-permission.redeem";
import RedeemGroupInvite from "./pages/GroupsPage/invite.redeem";
import {
  defaultTempCloudSharingDiskID,
  defaultTempCloudSharingRootFolderID,
} from "./api/dexie-database";
import { useSelector } from "react-redux";
import { ReduxAppState } from "./redux-offline/ReduxProvider";
import { useIdentitySystem } from "./framework/identity";
import {
  DiskTypeEnum,
  IRequestListDirectory,
  SortDirection,
} from "@officexapp/types";
import FreeFileSharePreview from "./components/FreeFileSharePreview";
import NotFoundPage from "./components/NotFound";
import { generateListDirectoryKey } from "./redux-offline/directory/directory.actions";

const { Sider, Content } = Layout;

const MOBILE_BREAKPOINT = 768;
const SIDEBAR_WIDTH = 250;

const SideMenu = ({
  setSidebarVisible,
}: {
  setSidebarVisible?: (visible: boolean) => void;
}) => {
  const navigate = useNavigate();
  const { wrapOrgCode } = useIdentitySystem();
  const menuItems = [
    {
      key: "navigate-storage",
      label: "Storage",
      icon: <FolderOutlined />,
      children: [
        {
          key: "drive",
          label: <Link to={wrapOrgCode("/drive")}>My Drive</Link>,
        },
        {
          key: "shared",
          label: "Shared with me",
          type: "item",
          disabled: true,
          // icon: <UserOutlined />,
        },
        {
          key: "recent",
          label: "Recent",
          type: "item",
          disabled: true,
          // icon: <ClockCircleOutlined />,
        },
        {
          key: "starred",
          label: "Labeled",
          type: "item",
          disabled: true,
          // icon: <StarOutlined />,
        },
        {
          key: "trash",
          label: "Trash",
          type: "item",
          disabled: true,
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
              label: (
                <Link to={wrapOrgCode("/resources/contacts")}>Contacts</Link>
              ),
            },
            {
              key: "groups",
              label: <Link to={wrapOrgCode("/resources/groups")}>Groups</Link>,
            },
            {
              key: "permissions",
              label: (
                <Link to={wrapOrgCode("/resources/permissions")}>
                  Permissions
                </Link>
              ),
            },
            {
              key: "labels",
              label: <Link to={wrapOrgCode("/resources/labels")}>Labels</Link>,
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
              label: <Link to={wrapOrgCode("/resources/disks")}>Disks</Link>,
            },
            {
              key: "drives",
              label: <Link to={wrapOrgCode("/resources/drives")}>Drives</Link>,
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
              label: (
                <Link to={wrapOrgCode("/resources/webhooks")}>Webhooks</Link>
              ),
            },
            {
              key: "api-keys",
              label: (
                <Link to={wrapOrgCode("/resources/api-keys")}>API Keys</Link>
              ),
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
        navigate(wrapOrgCode("/settings"));
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
  const { currentOrg } = useIdentitySystem();

  const [uploadPanelVisible, setUploadPanelVisible] = useState(false);

  return (
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
                <Link to="/org/current/drive">
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
                      Beta v0.1
                    </span>
                  </div>
                </Link>
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

                  {currentOrg && currentOrg.endpoint && (
                    <ActionMenuButton
                      isBigButton={true}
                      toggleUploadPanel={setUploadPanelVisible}
                    />
                  )}
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
                    to={
                      currentOrg && currentOrg.endpoint
                        ? `/org/current/drive/`
                        : `/org/current/drive/${DiskTypeEnum.StorjWeb3}/${defaultTempCloudSharingDiskID}/${defaultTempCloudSharingRootFolderID}/`
                    }
                  />
                }
              />
              <Route
                path="/org/:orgcode/drive/*"
                element={<DriveUI toggleUploadPanel={setUploadPanelVisible} />}
              />
              <Route
                path="/buy"
                element={
                  <ExternalRedirect url="https://app.uniswap.org/swap?inputCurrency=0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913&outputCurrency=0x48808407d95f691D076C90337d42eE3836656990" />
                }
              />
              <Route path="/org/:orgcode/settings" element={<SettingsPage />} />
              <Route path="/sandbox" element={<SandboxPage />} />
              {/* <Route
                  path="/sandbox_indexdb_uploader"
                  element={<SandboxIndexdbUploader />}
                />
                <Route
                  path="/sandbox_canister_uploader"
                  element={<SandboxCanisterUploader />}
                />
                <Route
                  path="/sandbox_localstorj_uploader"
                  element={<SandboxLocalStorjUploader />}
                />
                <Route
                  path="/sandbox_cloudstorj_uploader"
                  element={<SandboxCloudStorjUploader />}
                /> */}

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

              <Route
                path="/org/:orgcode/resources/contacts"
                element={<ContactsPage />}
              />
              <Route
                path="/org/:orgcode/resources/contacts/redeem"
                element={<ContactRedeem />}
              />
              <Route
                path="/org/:orgcode/resources/contacts/:userID"
                element={<ContactPage />}
              />
              <Route
                path="/org/:orgcode/resources/groups"
                element={<GroupsPage />}
              />
              <Route
                path="/org/:orgcode/resources/groups/:groupID"
                element={<GroupPage />}
              />
              <Route
                path="/org/:orgcode/resources/permissions"
                element={<PermissionsPage />}
              />

              <Route
                path="/org/:orgcode/redeem/directory-permit"
                element={<RedeemDirectoryPermitPage />}
              />

              <Route
                path="/org/:orgcode/redeem/group-invite"
                element={<RedeemGroupInvite />}
              />

              <Route
                path="/org/:orgcode/share/free-cloud-filesharing"
                element={<FreeFileSharePreview />}
              />

              <Route
                path="/org/:orgcode/resources/permissions/:permissionVariant/:permissionID"
                element={<PermissionPage />}
              />
              <Route
                path="/org/:orgcode/resources/labels"
                element={<LabelsPage />}
              />
              <Route
                path="/org/:orgcode/resources/labels/:labelID"
                element={<LabelPage />}
              />
              <Route
                path="/org/:orgcode/resources/disks"
                element={<DisksPage />}
              />
              <Route
                path="/org/:orgcode/resources/disks/:diskID"
                element={<DiskPage />}
              />
              <Route
                path="/org/:orgcode/resources/drives"
                element={<DrivesPage />}
              />
              <Route
                path="/org/:orgcode/resources/drives/:driveID"
                element={<DrivePage />}
              />
              <Route
                path="/org/:orgcode/resources/templates"
                element={<TemplateCrudPage />}
              />
              <Route
                path="/org/:orgcode/resources/webhooks"
                element={<WebhooksPage />}
              />
              <Route
                path="/org/:orgcode/resources/webhooks/:webhookID"
                element={<WebhookPage />}
              />
              <Route
                path="/org/:orgcode/resources/api-keys"
                element={<ApiKeysPage />}
              />
              <Route
                path="/org/:orgcode/resources/api-keys/:apiKeyID"
                element={<ApiKeyPage />}
              />

              <Route path="*" element={<NotFoundPage />} />
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
  );
};

export default RouterUI;

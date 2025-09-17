// Router.tsx
import { useEffect, useId, useState, Suspense, lazy } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  useNavigate,
  Navigate,
  Link,
  useLocation,
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
  Divider,
  Popover,
  QRCode,
  Input,
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
  AppstoreAddOutlined,
  EyeInvisibleOutlined,
  EyeOutlined,
  CopyOutlined,
  ProductFilled,
  ProductOutlined,
} from "@ant-design/icons";
import DriveUI from "./components/DriveUI";
import UploadPanel from "./components/UploadPanel";
import SearchHeader from "./components/SearchHeader";
import ActionMenuButton from "./components/ActionMenuButton";
import PreseedOffer from "./components/PreseedOffer";
import useScreenType from "react-screentype-hook";
// import LoadSampleFiles from "./components/DriveUI/LoadSampleFiles";
import ConnectICPButton from "./components/ConnectICPButton";
import LoadingSpinner from "./components/LoadingSpinner";

// Lazy load major page components for better performance
const SettingsPage = lazy(() => import("./components/SettingsPage"));
const GiftPage = lazy(() => import("./components/GiftPage"));
const SandboxPage = lazy(() => import("./components/SandboxPage"));
const ContactsPage = lazy(() => import("./pages/ContactsPage"));
const ContactRedeem = lazy(() => import("./pages/ContactsPage/contact.redeem"));
const GroupsPage = lazy(() => import("./pages/GroupsPage"));
const PermissionsPage = lazy(() => import("./pages/PermissionsPage"));
const LabelsPage = lazy(() => import("./pages/LabelsPage"));
const DisksPage = lazy(() => import("./pages/DisksPage"));
const DrivesPage = lazy(() => import("./pages/DrivesPage"));
const ApiKeysPage = lazy(() => import("./pages/ApiKeysPage"));
const WebhooksPage = lazy(() => import("./pages/WebhooksPage"));
const TemplateCrudPage = lazy(() => import("./components/TemplateCrudPage"));
const ContactPage = lazy(() => import("./pages/ContactsPage/contact.page"));
const GroupPage = lazy(() => import("./pages/GroupsPage/group.page"));
const LabelPage = lazy(() => import("./pages/LabelsPage/label.page"));
const DiskPage = lazy(() => import("./pages/DisksPage/disk.page"));
const WebhookPage = lazy(() => import("./pages/WebhooksPage/webhook.page"));
const DrivePage = lazy(() => import("./pages/DrivesPage/drive.page"));
const ApiKeyPage = lazy(() => import("./pages/ApiKeysPage/api-key.page"));
const PermissionPage = lazy(
  () => import("./pages/PermissionsPage/permission.page")
);
const RedeemDirectoryPermitPage = lazy(
  () =>
    import("./components/DirectorySharingDrawer/directory-permission.redeem")
);
const RedeemGroupInvite = lazy(
  () => import("./pages/GroupsPage/invite.redeem")
);
const FreeFileSharePreview = lazy(
  () => import("./components/FreeFileSharePreview")
);
const NotFoundPage = lazy(() => import("./components/NotFound"));
const SearchResultsPage = lazy(() => import("./pages/SearchResults"));
const WelcomePage = lazy(() => import("./components/WelcomePage"));
const GiftCardOnboarding = lazy(() => import("./pages/GiftCardOnboarding"));
const AutoLoginPage = lazy(() => import("./pages/AutoLoginPage"));
const RedeemDiskGiftCard = lazy(() => import("./pages/DisksPage/disk.redeem"));
const SpreadsheetEditor = lazy(() => import("./apps/SpreadsheetEditor"));
const DocumentEditor = lazy(() => import("./apps/DocumentEditor"));
const SelectAgenticKey = lazy(() => import("./components/SelectAgenticKey"));
const AppStorePage = lazy(() => import("./components/AppStore"));
const AppPage = lazy(() => import("./components/AppPage"));
const ChatWithAI = lazy(() => import("./apps/ChatWithAI"));
const DSpreadsheetEditor = lazy(() => import("./apps/DSpreadsheetEditor"));
const DDocumentEditor = lazy(() => import("./apps/DDocumentEditor"));
const PurchasesPage = lazy(() => import("./pages/PurchasesPage"));
import {
  defaultBrowserCacheDiskID,
  defaultBrowserCacheRootFolderID,
  defaultTempCloudSharingDefaultUploadFolderID,
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
import TagCopy from "./components/TagCopy";
import { DriveProvider } from "./framework";
import WalletControlPopover from "./components/WalletControlPopover";
import {
  ENABLE_APPSTORE,
  isAIChatEnabled,
  ENABLE_WALLET,
  LOCALSTORAGE_IS_AI_CHAT_ENABLED,
} from "./framework/flags/feature-flags";
const PrettyUrlShortener = lazy(
  () => import("./components/PrettyUrlShortener")
);
const WelcomeAutoSpawn = lazy(() => import("./components/WelcomeAutoSpawn"));
import { CONFIG } from "./config";
import OrganizationSwitcher from "./components/SwitchOrganization";
import PurchasePage from "./pages/PurchasesPage/purchases.page";

const { Sider, Content } = Layout;

const MOBILE_BREAKPOINT = 768;
const SIDEBAR_WIDTH = 250;

const SideMenu = ({
  setSidebarVisible,
}: {
  setSidebarVisible?: (visible: boolean) => void;
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { wrapOrgCode } = useIdentitySystem();

  // State for selected and open keys
  const [selectedKeys, setSelectedKeys] = useState<string[]>([]);
  const [openKeys, setOpenKeys] = useState<string[]>([]);

  // Update selected and open keys based on current route
  useEffect(() => {
    const path = location.pathname;

    if (path.includes("/recent")) {
      setSelectedKeys(["recent"]);
      setOpenKeys(["navigate-directory"]);
    } else if (path.includes("/drive-shared")) {
      setSelectedKeys(["drive-shared"]);
      setOpenKeys(["navigate-directory"]);
    } else if (path.includes("/drive-trash")) {
      setSelectedKeys(["drive-trash"]);
      setOpenKeys(["navigate-directory"]);
    } else if (path.includes("/drive")) {
      setSelectedKeys(["drive"]);
      setOpenKeys(["navigate-directory"]);
    } else if (path.includes("/resources/contacts")) {
      setSelectedKeys(["contacts"]);
      setOpenKeys(["organization"]);
    } else if (path.includes("/resources/groups")) {
      setSelectedKeys(["groups"]);
      setOpenKeys(["organization"]);
    } else if (path.includes("/resources/permissions")) {
      setSelectedKeys(["permissions"]);
      setOpenKeys(["organization"]);
    } else if (path.includes("/resources/labels")) {
      setSelectedKeys(["labels"]);
      setOpenKeys(["organization"]);
    } else if (path.includes("/resources/disks")) {
      setSelectedKeys(["disks"]);
      setOpenKeys(["organization"]);
    } else if (path.includes("/resources/canisters")) {
      setSelectedKeys(["canisters"]);
      setOpenKeys(["organization"]);
    } else if (path.includes("/resources/webhooks")) {
      setSelectedKeys(["webhooks"]);
      setOpenKeys(["organization"]);
    } else if (path.includes("/resources/api-keys")) {
      setSelectedKeys(["api-keys"]);
      setOpenKeys(["organization"]);
    } else if (path.includes("/settings")) {
      setSelectedKeys(["settings"]);
    } else if (path.includes("/appstore")) {
      setSelectedKeys(["appstore"]);
    } else if (path.includes("/chat")) {
      setSelectedKeys(["chat"]);
    }
  }, [location]);

  // Handle menu click for items that don't use Link
  const handleMenuClick = (key: string, route: string) => {
    navigate(wrapOrgCode(route));
    if (setSidebarVisible) {
      setSidebarVisible(false);
    }
  };

  const menuItems = [
    ENABLE_APPSTORE
      ? {
          key: "appstore",
          icon: <AppstoreAddOutlined />, // <ProductOutlined />, //
          label: (
            <div
              onClick={() => {
                navigate(wrapOrgCode("/appstore"));
                if (setSidebarVisible) {
                  setSidebarVisible(false);
                }
              }}
            >
              App Store
            </div>
          ),
        }
      : null,
    {
      key: "navigate-directory",
      label: (
        <div
          onClick={() => {
            navigate(wrapOrgCode("/drive"));
            if (setSidebarVisible) {
              setSidebarVisible(false);
            }
          }}
        >
          Storage
        </div>
      ),
      icon: <FolderOutlined />,
      children: [
        {
          key: "drive",
          label: (
            <Link
              to={wrapOrgCode("/drive")}
              onClick={() => {
                if (setSidebarVisible) {
                  setSidebarVisible(false);
                }
              }}
            >
              My Drive
            </Link>
          ),
        },
        {
          key: "recent",
          label: (
            <Link
              to={wrapOrgCode("/recent")}
              onClick={() => {
                if (setSidebarVisible) {
                  setSidebarVisible(false);
                }
              }}
            >
              Recent
            </Link>
          ),
        },
        {
          key: "drive-shared",
          label: (
            <Link
              to={wrapOrgCode("/drive-shared?default_disk_action=shared")}
              onClick={() => {
                if (setSidebarVisible) {
                  setSidebarVisible(false);
                }
              }}
            >
              Shared with Me
            </Link>
          ),
        },
        // {
        //   key: "starred",
        //   label: "Labeled",
        //   type: "item",
        //   disabled: true,
        // },
        {
          key: "drive-trash",
          label: (
            <Link
              to={wrapOrgCode("/drive-trash?default_disk_action=trash")}
              onClick={() => {
                if (setSidebarVisible) {
                  setSidebarVisible(false);
                }
              }}
            >
              Trash
            </Link>
          ),
        },
      ],
    },
    {
      key: "organization",
      label: <div>Company</div>,
      icon: <TeamOutlined />,
      children: [
        {
          key: "people",
          label: <div>Groups</div>,
          type: "group",
          children: [
            {
              key: "contacts",
              label: (
                <Link
                  to={wrapOrgCode("/resources/contacts")}
                  onClick={() => {
                    if (setSidebarVisible) {
                      setSidebarVisible(false);
                    }
                  }}
                >
                  Contacts
                </Link>
              ),
            },
            {
              key: "groups",
              label: (
                <Link
                  to={wrapOrgCode("/resources/groups")}
                  onClick={() => {
                    if (setSidebarVisible) {
                      setSidebarVisible(false);
                    }
                  }}
                >
                  Groups
                </Link>
              ),
            },
            {
              key: "permissions",
              label: (
                <Link
                  to={wrapOrgCode("/resources/permissions")}
                  onClick={() => {
                    if (setSidebarVisible) {
                      setSidebarVisible(false);
                    }
                  }}
                >
                  Permissions
                </Link>
              ),
            },
            {
              key: "labels",
              label: (
                <Link
                  to={wrapOrgCode("/resources/labels")}
                  onClick={() => {
                    if (setSidebarVisible) {
                      setSidebarVisible(false);
                    }
                  }}
                >
                  Labels
                </Link>
              ),
            },
          ],
        },
        {
          key: "storage",
          label: <div>Storage</div>,
          type: "group",
          children: [
            {
              key: "disks",
              label: (
                <Link
                  to={wrapOrgCode("/resources/disks")}
                  onClick={() => {
                    if (setSidebarVisible) {
                      setSidebarVisible(false);
                    }
                  }}
                >
                  Disks
                </Link>
              ),
            },
            {
              key: "canister",
              label: (
                <Link
                  to={wrapOrgCode("/resources/canisters")}
                  onClick={() => {
                    if (setSidebarVisible) {
                      setSidebarVisible(false);
                    }
                  }}
                >
                  Servers
                </Link>
              ),
            },
          ],
        },
        {
          key: "developers",
          label: <div>Developers</div>,
          type: "group",
          children: [
            ENABLE_APPSTORE
              ? {
                  key: "apps",
                  label: (
                    <Link
                      to={wrapOrgCode("/resources/purchases")}
                      onClick={() => {
                        if (setSidebarVisible) {
                          setSidebarVisible(false);
                        }
                      }}
                    >
                      Purchases
                    </Link>
                  ),
                }
              : null,
            {
              key: "webhooks",
              label: (
                <Link
                  to={wrapOrgCode("/resources/webhooks")}
                  onClick={() => {
                    if (setSidebarVisible) {
                      setSidebarVisible(false);
                    }
                  }}
                >
                  Webhooks
                </Link>
              ),
            },
            {
              key: "api-keys",
              label: (
                <Link
                  to={wrapOrgCode("/resources/api-keys")}
                  onClick={() => {
                    if (setSidebarVisible) {
                      setSidebarVisible(false);
                    }
                  }}
                >
                  API Keys
                </Link>
              ),
            },
            // {
            //   key: "sandbox",
            //   label: "Sandbox",
            //   onClick: () => {
            //     navigate("/sandbox");
            //     if (setSidebarVisible) {
            //       setSidebarVisible(false);
            //     }
            //   },
            // },
          ],
        },
      ],
    },
    {
      key: "settings",
      icon: <SettingOutlined />,
      label: (
        <div
          onClick={() => {
            navigate(wrapOrgCode("/settings"));
            if (setSidebarVisible) {
              setSidebarVisible(false);
            }
          }}
        >
          Settings
        </div>
      ),
    },
  ];

  return (
    <div style={{ maxHeight: "75vh", overflowY: "scroll" }}>
      <Menu
        mode="inline"
        items={menuItems}
        selectedKeys={selectedKeys}
        openKeys={openKeys}
        onOpenChange={setOpenKeys}
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
  const { currentOrg, wrapOrgCode, currentProfile } = useIdentitySystem();
  const [uploadPanelVisible, setUploadPanelVisible] = useState(false);
  const [showBalance, setShowBalance] = useState(false);

  return (
    <Routes>
      <Route
        path="/docs"
        element={
          <Navigate
            to={`/org/current/drive/${DiskTypeEnum.BrowserCache}/${defaultBrowserCacheDiskID}/${defaultBrowserCacheRootFolderID}/new/apps/documents`}
          />
        }
      />
      <Route
        path="/org/:orgcode/drive/:diskTypeEnum/:diskID/:parentFolderID/:fileID/apps/docs"
        element={<DocumentEditor />}
      />
      <Route
        path="/sheets"
        element={
          <Navigate
            to={`/org/current/drive/${DiskTypeEnum.BrowserCache}/${defaultBrowserCacheDiskID}/${defaultBrowserCacheRootFolderID}/new/apps/spreadsheets`}
          />
        }
      />
      <Route
        path="/org/:orgcode/drive/:diskTypeEnum/:diskID/:parentFolderID/:fileID/apps/sheets"
        element={<SpreadsheetEditor />}
      />
      <Route
        path="/org/:orgcode/drive/:diskTypeEnum/:diskID/:parentFolderID/:fileID/apps/spreadsheets"
        element={<DSpreadsheetEditor />}
      />
      <Route
        path="/org/:orgcode/drive/:diskTypeEnum/:diskID/:parentFolderID/:fileID/apps/documents"
        element={<DDocumentEditor />}
      />

      <Route
        path="*"
        element={
          <>
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
                        <Link to="/org/current/welcome">
                          {CONFIG.WHITELABEL_LOGO ? (
                            <div
                              style={{
                                width: "100%",
                                padding: "16px 16px 8px 16px",
                                display: "flex",
                                flexDirection: "column",
                                alignItems: "center",
                              }}
                            >
                              <img
                                src={CONFIG.WHITELABEL_LOGO}
                                alt="Logo"
                                style={{
                                  width: "100%",
                                }}
                              />
                              <span
                                style={{
                                  color: CONFIG.WHITELABEL_THEME_COLOR,
                                  fontSize: "0.7rem",
                                  width: "100%",
                                  textAlign: "center",
                                  marginTop: "8px",
                                  fontWeight: 350,
                                }}
                              >
                                Workspace by OfficeX
                              </span>
                            </div>
                          ) : (
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
                                Beta v1.0
                              </span>
                            </div>
                          )}
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

                          {!currentOrg?.host && (
                            <Link
                              to="/org/current/chat"
                              style={{ width: "100%" }}
                            >
                              <Button block>Chat</Button>
                            </Link>
                          )}

                          {currentOrg && currentOrg.host && (
                            <ActionMenuButton
                              isBigButton={true}
                              toggleUploadPanel={setUploadPanelVisible}
                            />
                          )}
                        </section>
                        <SideMenu />
                      </div>

                      {/* Wallet Card Added Here */}
                      {ENABLE_WALLET && (
                        <WalletControlPopover>
                          <Card
                            bordered={false}
                            hoverable={true}
                            style={{
                              width: "100%",
                              borderRadius: "8px",
                              background: "#FFF",
                            }}
                          >
                            <Statistic
                              title={
                                <div
                                  style={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                  }}
                                >
                                  <span>Wallet Balance</span>

                                  <div
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      e.preventDefault();
                                    }}
                                  >
                                    {/* Top Up */}
                                    <TagCopy
                                      id={currentProfile?.evmPublicKey || ""}
                                      style={{ fontSize: "0.65rem" }}
                                    />
                                  </div>
                                </div>
                              }
                              value={showBalance ? 1280.52 : "******"} // Mask value if not shown
                              precision={2}
                              valueStyle={{
                                color: "rgba(0, 0, 0, 0.6)",
                                fontSize: "24px",
                                fontWeight: "bold",
                              }}
                              prefix={showBalance ? "$" : ""} // Only show prefix if balance is visible
                              suffix={
                                <div
                                  style={{
                                    padding: "0px 0px 0px 0px",
                                    marginLeft: "8px",
                                  }}
                                >
                                  {showBalance ? (
                                    <EyeInvisibleOutlined
                                      onClick={() =>
                                        setShowBalance(!showBalance)
                                      }
                                      size={8}
                                      style={{ fontSize: "0.9rem" }}
                                    />
                                  ) : (
                                    <EyeOutlined
                                      onClick={() =>
                                        setShowBalance(!showBalance)
                                      }
                                      size={8}
                                      style={{ fontSize: "0.9rem" }}
                                    />
                                  )}
                                </div>
                              }
                            />
                          </Card>
                        </WalletControlPopover>
                      )}
                      <OrganizationSwitcher />
                    </div>
                  </Sider>
                )}
                <Layout
                  style={{ padding: "0px 8px 0px 0px", background: "#fbfbfb" }}
                >
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
                              isAIChatEnabled()
                                ? "/org/current/chat"
                                : currentOrg && currentOrg.host
                                  ? `/org/current/drive/`
                                  : `/org/current/drive/${DiskTypeEnum.StorjWeb3}/${defaultTempCloudSharingDiskID}/${defaultTempCloudSharingDefaultUploadFolderID}/`
                            }
                          />
                        }
                      />

                      <Route path="/welcome" element={<WelcomeAutoSpawn />} />
                      {ENABLE_APPSTORE && (
                        <Route
                          path="/appstore"
                          element={<Navigate to="/org/current/appstore" />}
                        />
                      )}
                      {true && (
                        <Route
                          path="/chat"
                          element={<Navigate to="/org/current/chat" />}
                        />
                      )}
                      <Route
                        path="/org/:orgcode/drive/*"
                        element={
                          <DriveUI toggleUploadPanel={setUploadPanelVisible} />
                        }
                      />
                      <Route
                        path="/org/:orgcode/drive-shared/*"
                        element={
                          <DriveUI toggleUploadPanel={setUploadPanelVisible} />
                        }
                      />
                      <Route
                        path="/org/:orgcode/drive-trash/*"
                        element={
                          <DriveUI toggleUploadPanel={setUploadPanelVisible} />
                        }
                      />
                      <Route
                        path="/org/:orgcode/recent"
                        element={
                          <DriveUI toggleUploadPanel={setUploadPanelVisible} />
                        }
                      />
                      <Route
                        path="/gift-card-onboarding"
                        element={<GiftCardOnboarding />}
                      />
                      <Route
                        path="/org/:orgcode/redeem/disk-giftcard"
                        element={<RedeemDiskGiftCard />}
                      />

                      <Route path="/auto-login" element={<AutoLoginPage />} />

                      <Route
                        path="/buy"
                        element={
                          <ExternalRedirect url="https://app.uniswap.org/swap?inputCurrency=0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913&outputCurrency=0x48808407d95f691D076C90337d42eE3836656990" />
                        }
                      />
                      <Route
                        path="/org/:orgcode/settings"
                        element={
                          <Suspense fallback={<LoadingSpinner />}>
                            <SettingsPage />
                          </Suspense>
                        }
                      />
                      {ENABLE_APPSTORE && (
                        <Route
                          path="/org/:orgcode/appstore"
                          element={
                            <Suspense fallback={<LoadingSpinner />}>
                              <AppStorePage />
                            </Suspense>
                          }
                        />
                      )}
                      {ENABLE_APPSTORE && (
                        <Route
                          path="/org/:orgcode/appstore/app/:app_id"
                          element={
                            <Suspense fallback={<LoadingSpinner />}>
                              <AppPage />
                            </Suspense>
                          }
                        />
                      )}
                      {true && (
                        <Route
                          path="/org/:orgcode/chat"
                          element={
                            <Suspense fallback={<LoadingSpinner />}>
                              <ChatWithAI />
                            </Suspense>
                          }
                        />
                      )}
                      <Route
                        path="/org/:orgcode"
                        element={<Navigate to="/org/:orgcode/welcome" />}
                      />
                      <Route
                        path="/org/:orgcode/welcome"
                        element={
                          <Suspense fallback={<LoadingSpinner />}>
                            <WelcomePage />
                          </Suspense>
                        }
                      />
                      <Route
                        path="/org/:orgcode/search"
                        element={
                          <Suspense fallback={<LoadingSpinner />}>
                            <SearchResultsPage />
                          </Suspense>
                        }
                      />
                      <Route
                        path="/org/:orgcode/grant-agentic-key"
                        element={
                          <Suspense fallback={<LoadingSpinner />}>
                            <SelectAgenticKey />
                          </Suspense>
                        }
                      />
                      <Route
                        path="/org/:orgcode/to/:shortlink_slug"
                        element={
                          <Suspense fallback={<LoadingSpinner />}>
                            <PrettyUrlShortener />
                          </Suspense>
                        }
                      />

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
                      <Route
                        path="/preseed"
                        element={<Navigate to="/presale" />}
                      />
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
                        element={
                          <Suspense fallback={<LoadingSpinner />}>
                            <ContactsPage />
                          </Suspense>
                        }
                      />
                      <Route
                        path="/org/:orgcode/resources/contacts/redeem"
                        element={
                          <Suspense fallback={<LoadingSpinner />}>
                            <ContactRedeem />
                          </Suspense>
                        }
                      />
                      <Route
                        path="/org/:orgcode/resources/contacts/:userID"
                        element={
                          <Suspense fallback={<LoadingSpinner />}>
                            <ContactPage />
                          </Suspense>
                        }
                      />
                      <Route
                        path="/org/:orgcode/resources/groups"
                        element={
                          <Suspense fallback={<LoadingSpinner />}>
                            <GroupsPage />
                          </Suspense>
                        }
                      />
                      <Route
                        path="/org/:orgcode/resources/groups/:groupID"
                        element={
                          <Suspense fallback={<LoadingSpinner />}>
                            <GroupPage />
                          </Suspense>
                        }
                      />
                      <Route
                        path="/org/:orgcode/resources/permissions"
                        element={
                          <Suspense fallback={<LoadingSpinner />}>
                            <PermissionsPage />
                          </Suspense>
                        }
                      />

                      <Route
                        path="/org/:orgcode/redeem/directory-permit"
                        element={
                          <Suspense fallback={<LoadingSpinner />}>
                            <RedeemDirectoryPermitPage />
                          </Suspense>
                        }
                      />

                      <Route
                        path="/org/:orgcode/redeem/group-invite"
                        element={
                          <Suspense fallback={<LoadingSpinner />}>
                            <RedeemGroupInvite />
                          </Suspense>
                        }
                      />

                      <Route
                        path="/org/:orgcode/share/free-cloud-filesharing"
                        element={
                          <Suspense fallback={<LoadingSpinner />}>
                            <FreeFileSharePreview />
                          </Suspense>
                        }
                      />

                      <Route
                        path="/org/:orgcode/resources/permissions/:permissionVariant/:permissionID"
                        element={
                          <Suspense fallback={<LoadingSpinner />}>
                            <PermissionPage />
                          </Suspense>
                        }
                      />
                      <Route
                        path="/org/:orgcode/resources/labels"
                        element={
                          <Suspense fallback={<LoadingSpinner />}>
                            <LabelsPage />
                          </Suspense>
                        }
                      />
                      <Route
                        path="/org/:orgcode/resources/labels/:labelID"
                        element={
                          <Suspense fallback={<LoadingSpinner />}>
                            <LabelPage />
                          </Suspense>
                        }
                      />
                      <Route
                        path="/org/:orgcode/resources/disks"
                        element={
                          <Suspense fallback={<LoadingSpinner />}>
                            <DisksPage />
                          </Suspense>
                        }
                      />
                      <Route
                        path="/org/:orgcode/resources/disks/:diskID"
                        element={
                          <Suspense fallback={<LoadingSpinner />}>
                            <DiskPage />
                          </Suspense>
                        }
                      />
                      <Route
                        path="/org/:orgcode/resources/canisters"
                        element={
                          <Suspense fallback={<LoadingSpinner />}>
                            <DrivesPage />
                          </Suspense>
                        }
                      />
                      <Route
                        path="/org/:orgcode/resources/canisters/:driveID"
                        element={
                          <Suspense fallback={<LoadingSpinner />}>
                            <DrivePage />
                          </Suspense>
                        }
                      />
                      <Route
                        path="/org/:orgcode/resources/templates"
                        element={
                          <Suspense fallback={<LoadingSpinner />}>
                            <TemplateCrudPage />
                          </Suspense>
                        }
                      />
                      <Route
                        path="/org/:orgcode/resources/webhooks"
                        element={
                          <Suspense fallback={<LoadingSpinner />}>
                            <WebhooksPage />
                          </Suspense>
                        }
                      />
                      <Route
                        path="/org/:orgcode/resources/webhooks/:webhookID"
                        element={
                          <Suspense fallback={<LoadingSpinner />}>
                            <WebhookPage />
                          </Suspense>
                        }
                      />
                      <Route
                        path="/org/:orgcode/resources/api-keys"
                        element={
                          <Suspense fallback={<LoadingSpinner />}>
                            <ApiKeysPage />
                          </Suspense>
                        }
                      />
                      <Route
                        path="/org/:orgcode/resources/api-keys/:apiKeyID"
                        element={
                          <Suspense fallback={<LoadingSpinner />}>
                            <ApiKeyPage />
                          </Suspense>
                        }
                      />
                      {ENABLE_APPSTORE && (
                        <Route
                          path="/org/:orgcode/resources/purchases"
                          element={
                            <Suspense fallback={<LoadingSpinner />}>
                              <PurchasesPage />
                            </Suspense>
                          }
                        />
                      )}

                      {ENABLE_APPSTORE && (
                        <Route
                          path="/org/:orgcode/resources/purchases/:purchaseID"
                          element={
                            <Suspense fallback={<LoadingSpinner />}>
                              <PurchasePage />
                            </Suspense>
                          }
                        />
                      )}
                      <Route
                        path="*"
                        element={
                          <Suspense fallback={<LoadingSpinner />}>
                            <NotFoundPage />
                          </Suspense>
                        }
                      />
                    </Routes>
                  </Content>
                </Layout>
                {screenType.isMobile && (
                  <Drawer
                    title={
                      <Link to={wrapOrgCode("/welcome")}>
                        <div>
                          <b>OfficeX</b>
                          <span style={{ fontWeight: 300, marginLeft: "5px" }}>
                            Alpha
                          </span>
                        </div>
                      </Link>
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
          </>
        }
      />
    </Routes>
  );
};

export default RouterUI;

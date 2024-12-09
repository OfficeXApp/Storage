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
      key: "drive",
      icon: <FolderOutlined />,
      label: "My Drive",
      onClick: () => {
        navigate("/drive");
        if (setSidebarVisible) {
          setSidebarVisible(false);
        }
      },
    },
    {
      key: "shared",
      icon: <UserOutlined />,
      label: "Shared with me",
      disabled: true,
    },
    {
      key: "recent",
      icon: <ClockCircleOutlined />,
      label: "Recent",
      disabled: true,
    },
    {
      key: "starred",
      icon: <StarOutlined />,
      label: "Starred",
      disabled: true,
    },
    {
      key: "trash",
      icon: <DeleteOutlined />,
      label: "Trash",
      disabled: true,
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
                {/* <Card
                  style={{
                    margin: "10px 10px",
                  }}
                >
                  <Statistic
                    title="Token Pre-Seed Sale"
                    value={0.01}
                    precision={2}
                    valueStyle={{ color: "#4e94f5" }}
                    prefix="$"
                    suffix={<span style={{ fontSize: "0.7rem" }}>USDT</span>}
                  />
                  <Link to="/presale">
                    <Button
                      type="dashed"
                      style={{
                        marginTop: 16,
                        border: "1px dashed #4e94f5",
                        color: "#4e94f5",
                      }}
                    >
                      Buy $OFX
                    </Button>
                  </Link>
                </Card> */}
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
                    <ExternalRedirect url="https://buy.indiecrypto.club/fund/8453/0x1899C4e4129045c322cA2c5dFbE762FbcFf94633" />
                  }
                />
                <Route path="/settings" element={<SettingsPage />} />
                <Route path="/presale" element={<PreseedOffer />} />
                <Route path="/preseed" element={<Navigate to="/presale" />} />
                <Route
                  path="/whitepaper"
                  element={
                    <ExternalRedirect url="https://tinyurl.com/ofx-whitepaper" />
                  }
                />
                <Route path="/gift" element={<GiftPage />} />
                {/* Add other routes here */}
              </Routes>
            </Content>
          </Layout>
          {screenType.isMobile && (
            <Drawer
              title="OfficeX Drive"
              placement="left"
              onClose={() => setSidebarVisible(false)}
              open={sidebarVisible}
              width={SIDEBAR_WIDTH}
              footer={
                <div style={{ padding: "16px 16px" }}>
                  <Statistic
                    title="Token Pre-Seed Sale"
                    value={0.01}
                    precision={2}
                    valueStyle={{ color: "#4e94f5" }}
                    prefix="$"
                    suffix={<span style={{ fontSize: "0.7rem" }}>USDT</span>}
                  />
                  <Link to="/presale">
                    <Button
                      type="dashed"
                      onClick={() => setSidebarVisible(false)}
                      style={{
                        marginTop: 16,
                        border: "1px dashed #4e94f5",
                        color: "#4e94f5",
                      }}
                    >
                      Buy $OFX
                    </Button>
                  </Link>
                </div>
              }
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

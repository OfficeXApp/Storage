import React, { useEffect, useState } from "react";
import {
  Button,
  Dropdown,
  Input,
  Space,
  Table,
  Avatar,
  Tag,
  Badge,
  List,
  message,
  Popover,
} from "antd";
import {
  BarsOutlined,
  ClockCircleOutlined,
  DownOutlined,
  SearchOutlined,
  SortAscendingOutlined,
  TeamOutlined,
  UserAddOutlined,
  MailOutlined,
  DeleteOutlined,
  RightOutlined,
  KeyOutlined,
  LockOutlined,
} from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import { shortenAddress } from "../../framework/identity/constants";
import { ApiKeyFE } from "@officexapp/types";
import useScreenType from "react-screentype-hook";
import { ReduxAppState } from "../../redux-offline/ReduxProvider";
import { useDispatch, useSelector } from "react-redux";
import { listApiKeysAction } from "../../redux-offline/api-keys/api-keys.actions";
import { useIdentitySystem } from "../../framework/identity";

interface ApiKeysTableListProps {
  isContentTabOpen: (id: string) => boolean;
  handleClickContentTab: (apiKey: ApiKeyFE, focus_tab?: boolean) => void;
}

const ApiKeysTableList: React.FC<ApiKeysTableListProps> = ({
  isContentTabOpen,
  handleClickContentTab,
}) => {
  const dispatch = useDispatch();
  const isOnline = useSelector((state: ReduxAppState) => state.offline?.online);
  const apiKeys = useSelector((state: ReduxAppState) => state.apikeys.apikeys);
  const screenType = useScreenType();
  const { currentProfile, wrapOrgCode } = useIdentitySystem();
  const [searchText, setSearchText] = useState("");
  const [filteredApiKeys, setFilteredApiKeys] = useState(apiKeys);
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);

  // Update filtered apiKeys whenever search text or apiKeys change
  useEffect(() => {
    const filtered = apiKeys.filter((apiKey) =>
      apiKey.name.toLowerCase().includes(searchText.toLowerCase())
    );
    setFilteredApiKeys(filtered);
  }, [searchText, apiKeys]);

  // Handle responsive layout and fetch API keys
  useEffect(() => {
    try {
      // Assuming the current user's ID is needed for fetching API keys
      // If user ID is stored differently, adjust this accordingly

      if (currentProfile && currentProfile.userID) {
        dispatch(listApiKeysAction(currentProfile.userID));
      }
    } catch (e) {
      console.error(e);
    }

    const handleResize = () => {
      const desktopView = document.getElementById("desktop-view-apikeys");
      const mobileView = document.getElementById("mobile-view-apikeys");

      if (desktopView && mobileView) {
        if (window.innerWidth <= 768) {
          desktopView.style.display = "none";
          mobileView.style.display = "flex";
        } else {
          desktopView.style.display = "flex";
          mobileView.style.display = "none";
        }
      }
    };

    // Initial call
    handleResize();

    // Add event listener
    window.addEventListener("resize", handleResize);

    // Cleanup
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Handle row selection
  const rowSelection = {
    selectedRowKeys,
    onChange: (newSelectedRowKeys: React.Key[]) => {
      setSelectedRowKeys(newSelectedRowKeys);
    },
  };

  // Dropdown menu items for the Manage button
  const manageMenuItems = [
    {
      key: "1",
      icon: <LockOutlined />,
      label: "Revoke Selected",
      disabled: selectedRowKeys.length === 0,
    },
    {
      key: "2",
      icon: <DeleteOutlined />,
      label: "Delete Selected",
      disabled: selectedRowKeys.length === 0,
    },
  ];

  // Function to get a status label for an API key
  const getStatusLabel = (apiKey: ApiKeyFE) => {
    if (apiKey.is_revoked) {
      return <Tag color="red">Revoked</Tag>;
    }

    if (apiKey.expires_at === -1) {
      return <Tag color="green">Active</Tag>;
    }

    const now = Date.now();
    if (apiKey.expires_at < now) {
      return <Tag color="orange">Expired</Tag>;
    }

    return <Tag color="green">Active</Tag>;
  };

  // Function to shorten API key for display
  const shortenKey = (key: string) => {
    if (!key || key.length < 10) return key;
    return `${key.slice(0, 6)}...${key.slice(-4)}`;
  };

  // Format expiration date
  const formatExpiryDate = (timestamp: number) => {
    if (timestamp === -1) return "Never";

    const date = new Date(timestamp);
    const now = new Date();

    // If expired
    if (date < now) {
      return "Expired";
    }

    // If expires today
    if (date.toDateString() === now.toDateString()) {
      return "Today";
    }

    // If expires tomorrow
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    if (date.toDateString() === tomorrow.toDateString()) {
      return "Tomorrow";
    }

    // Format date
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  // Define table columns - Restructured to match the desired layout
  const columns: ColumnsType<ApiKeyFE> = [
    {
      title: "API Key",
      dataIndex: "name",
      key: "name",
      render: (_: any, record: ApiKeyFE) => (
        <Space
          onClick={(e) => {
            e?.stopPropagation();
            handleClickContentTab(record);
          }}
        >
          <div
            onClick={(e) => {
              e.stopPropagation();
              handleClickContentTab(record, true);
              const newUrl = wrapOrgCode(`/resources/api-keys/${record.id}`);
              window.history.pushState({}, "", newUrl);
            }}
          >
            <Avatar
              size="default"
              icon={<KeyOutlined />}
              style={{ backgroundColor: "#1890ff" }}
            />
            <span style={{ marginLeft: "8px" }}>{record.name}</span>
          </div>
          <Tag
            color="blue"
            onClick={() => {
              navigator.clipboard.writeText(record.value);
              message.success("API key copied to clipboard");
            }}
            style={{ cursor: "pointer" }}
          >
            {shortenKey(record.value)}
          </Tag>
          {getStatusLabel(record)}
        </Space>
      ),
    },
    {
      title: "Expires",
      dataIndex: "expires_at",
      key: "expires_at",
      width: 150,
      render: (expiresAt: number, record: ApiKeyFE) => (
        <span
          onClick={(e) => {
            e?.stopPropagation();
            handleClickContentTab(record);
          }}
        >
          {formatExpiryDate(expiresAt)}
        </span>
      ),
    },
  ];

  // Example items for filter dropdowns
  const filterItems = [
    { key: "1", label: "All Keys" },
    { key: "2", label: "Active" },
    { key: "3", label: "Expired" },
    { key: "4", label: "Revoked" },
  ];

  const sortItems = [
    { key: "1", label: "Name (A-Z)" },
    { key: "2", label: "Name (Z-A)" },
    { key: "3", label: "Newest first" },
    { key: "4", label: "Oldest first" },
    { key: "5", label: "Expiring soon" },
  ];

  // Updated mobile list to include ID, value label, and status inline with the name
  const renderMobileList = () => {
    return (
      <List
        itemLayout="horizontal"
        dataSource={filteredApiKeys}
        renderItem={(apiKey: ApiKeyFE) => (
          <List.Item
            style={{
              padding: "12px 16px",
              cursor: "pointer",
              backgroundColor: isContentTabOpen(apiKey.id)
                ? "#e6f7ff"
                : "transparent",
            }}
            onClick={() => handleClickContentTab(apiKey, true)}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                width: "100%",
                justifyContent: "space-between",
              }}
            >
              <div
                style={{ display: "flex", alignItems: "center", gap: "12px" }}
              >
                <Avatar
                  size="default"
                  icon={<KeyOutlined />}
                  style={{ backgroundColor: "#1890ff" }}
                />
                <div style={{ display: "flex", flexDirection: "column" }}>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                    }}
                  >
                    <span style={{ fontWeight: "500" }}>{apiKey.name}</span>
                    {getStatusLabel(apiKey)}
                  </div>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                    }}
                  >
                    <span
                      style={{ fontSize: "12px", color: "rgba(0,0,0,0.45)" }}
                    >
                      ID: {apiKey.id}
                    </span>
                    <span
                      style={{ fontSize: "12px", color: "rgba(0,0,0,0.45)" }}
                    >
                      <ClockCircleOutlined style={{ marginRight: 4 }} />
                      {formatExpiryDate(apiKey.expires_at)}
                    </span>
                  </div>
                </div>
              </div>
              <div
                style={{ display: "flex", alignItems: "center", gap: "12px" }}
              >
                <Tag color="blue">{shortenKey(apiKey.value)}</Tag>
                <RightOutlined style={{ color: "rgba(0,0,0,0.4)" }} />
              </div>
            </div>
          </List.Item>
        )}
      />
    );
  };

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Header section with search and filters */}
      <div style={{ padding: "16px 16px 0 16px" }}>
        {/* We'll use a useEffect to handle responsive layout */}
        <div style={{ marginBottom: "16px" }}>
          {/* For larger screens (desktop) */}
          <div
            className="desktop-view-apikeys"
            id="desktop-view-apikeys"
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            {/* Search input */}
            <Input
              placeholder="Search API keys..."
              prefix={<SearchOutlined />}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              style={{ width: "240px" }}
            />

            {/* Filter options and manage button */}
            <div style={{ display: "flex", gap: "20px", alignItems: "center" }}>
              <Dropdown menu={{ items: sortItems, onClick: () => {} }}>
                <a
                  onClick={(e) => e.preventDefault()}
                  style={{ color: "rgba(0,0,0,0.4)" }}
                >
                  <Space>
                    <SortAscendingOutlined /> Sort By <DownOutlined />
                  </Space>
                </a>
              </Dropdown>
              <Dropdown menu={{ items: filterItems, onClick: () => {} }}>
                <a
                  onClick={(e) => e.preventDefault()}
                  style={{ color: "rgba(0,0,0,0.4)" }}
                >
                  <Space>
                    <BarsOutlined /> Filter By <DownOutlined />
                  </Space>
                </a>
              </Dropdown>
              <Dropdown
                menu={{ items: manageMenuItems }}
                disabled={selectedRowKeys.length === 0}
              >
                <Button>
                  Manage{" "}
                  {selectedRowKeys.length > 0
                    ? `(${selectedRowKeys.length})`
                    : ""}
                  <DownOutlined />
                </Button>
              </Dropdown>
            </div>
          </div>

          {/* For mobile screens */}
          <div
            className="mobile-view-apikeys"
            id="mobile-view-apikeys"
            style={{
              display: "none",
              flexDirection: "column",
              gap: "16px",
            }}
          >
            {/* Search input - always on top for mobile */}
            <Input
              placeholder="Search API keys..."
              prefix={<SearchOutlined />}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              style={{ width: "100%" }}
            />

            {/* Filter options and manage button */}
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: "12px",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <div style={{ display: "flex", flexWrap: "wrap", gap: "12px" }}>
                <Dropdown menu={{ items: sortItems, onClick: () => {} }}>
                  <a
                    onClick={(e) => e.preventDefault()}
                    style={{ color: "rgba(0,0,0,0.4)" }}
                  >
                    <Space>
                      <SortAscendingOutlined /> Sort By <DownOutlined />
                    </Space>
                  </a>
                </Dropdown>

                <Dropdown menu={{ items: filterItems, onClick: () => {} }}>
                  <a
                    onClick={(e) => e.preventDefault()}
                    style={{ color: "rgba(0,0,0,0.4)" }}
                  >
                    <Space>
                      <BarsOutlined /> Filter By <DownOutlined />
                    </Space>
                  </a>
                </Dropdown>
              </div>

              {!screenType.isMobile && (
                <Dropdown
                  menu={{ items: manageMenuItems }}
                  disabled={selectedRowKeys.length === 0}
                >
                  <Button>
                    Manage{" "}
                    {selectedRowKeys.length > 0
                      ? `(${selectedRowKeys.length})`
                      : ""}
                    <DownOutlined />
                  </Button>
                </Dropdown>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* API Keys Table */}
      <div style={{ flex: 1, padding: "0 16px 16px 16px", overflowY: "auto" }}>
        {screenType.isMobile ? (
          renderMobileList()
        ) : (
          <Table
            rowSelection={{
              type: "checkbox",
              ...rowSelection,
              columnWidth: 50,
            }}
            columns={columns}
            dataSource={filteredApiKeys}
            rowKey="id"
            pagination={false}
            onRow={(record) => ({
              onClick: () => {
                handleClickContentTab(record, false);
              },
              style: {
                backgroundColor: isContentTabOpen(record.id)
                  ? "#e6f7ff"
                  : "transparent",
                cursor: "pointer",
              },
            })}
            size="middle"
          />
        )}
        <br />
        <br />
      </div>
    </div>
  );
};

export default ApiKeysTableList;

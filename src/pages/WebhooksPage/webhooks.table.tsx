// src/components/WebhooksPage/webhooks.table.tsx

import React, { useEffect, useState } from "react";
import {
  Button,
  Dropdown,
  Input,
  Space,
  Table,
  Tag,
  Badge,
  List,
  message,
  Popover,
  Result,
} from "antd";
import {
  BarsOutlined,
  ClockCircleOutlined,
  DownOutlined,
  SearchOutlined,
  SortAscendingOutlined,
  ApiOutlined,
  RightOutlined,
  LinkOutlined,
  DeleteOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  LoadingOutlined,
  SyncOutlined,
  LockOutlined,
} from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import { SystemPermissionType, WebhookFE } from "@officexapp/types";
import useScreenType from "react-screentype-hook";
import { ReduxAppState } from "../../redux-offline/ReduxProvider";
import { useDispatch, useSelector } from "react-redux";
import {
  checkWebhookTablePermissionsAction,
  listWebhooksAction,
} from "../../redux-offline/webhooks/webhooks.actions";
import TagCopy from "../../components/TagCopy";
import { useIdentitySystem } from "../../framework/identity";
import { Link } from "react-router-dom";

interface WebhooksTableListProps {
  isWebhookTabOpen: (id: string) => boolean;
  handleClickContentTab: (webhook: WebhookFE, focus_tab?: boolean) => void;
}

const WebhooksTableList: React.FC<WebhooksTableListProps> = ({
  isWebhookTabOpen,
  handleClickContentTab,
}) => {
  const { wrapOrgCode, currentProfile } = useIdentitySystem();
  const dispatch = useDispatch();
  const isOnline = useSelector((state: ReduxAppState) => state.offline?.online);
  const { webhooks, loading, tablePermissions } = useSelector(
    (state: ReduxAppState) => ({
      webhooks: state.webhooks.webhooks,
      loading: state.webhooks.loading,
      tablePermissions: state.webhooks.tablePermissions,
    })
  );
  console.log(`look at webhooks`, webhooks);
  const screenType = useScreenType();
  const [searchText, setSearchText] = useState("");
  const [filteredWebhooks, setFilteredWebhooks] = useState(webhooks);
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);

  // Update filtered webhooks whenever search text or webhooks change
  useEffect(() => {
    const filtered = webhooks.filter(
      (webhook) =>
        webhook.url.toLowerCase().includes(searchText.toLowerCase()) ||
        webhook.description.toLowerCase().includes(searchText.toLowerCase()) ||
        webhook.event.toLowerCase().includes(searchText.toLowerCase())
    );
    setFilteredWebhooks(filtered);
  }, [searchText, webhooks]);

  // Handle responsive layout
  useEffect(() => {
    const handleResize = () => {
      const desktopView = document.getElementById("desktop-view");
      const mobileView = document.getElementById("mobile-view");

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

  // Function to shorten URLs for display
  const shortenUrl = (url: string) => {
    try {
      const parsed = new URL(url);
      return `${parsed.hostname}${parsed.pathname.length > 15 ? parsed.pathname.substring(0, 15) + "..." : parsed.pathname}`;
    } catch (e) {
      return url;
    }
  };

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
      icon: <ApiOutlined />,
      label: "Test Webhooks",
      disabled: true,
    },
    {
      key: "2",
      icon: <DeleteOutlined />,
      label: "Delete",
      disabled: true,
    },
  ];

  // Define table columns
  const columns: ColumnsType<WebhookFE> = [
    {
      title: "Webhook",
      dataIndex: "url",
      key: "url",
      render: (_: any, record: WebhookFE) => {
        return (
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
                const newUrl = wrapOrgCode(`/resources/webhooks/${record.id}`);
                window.history.pushState({}, "", newUrl);
              }}
            >
              <Popover content={record.active ? "Active" : "Inactive"}>
                <Badge
                  status={record.active ? "success" : "error"}
                  dot
                  offset={[-3, 3]}
                >
                  <div
                    style={{
                      width: 32,
                      height: 32,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      backgroundColor: "#1890ff",
                      borderRadius: "50%",
                      color: "white",
                    }}
                  >
                    <ApiOutlined />
                  </div>
                </Badge>
              </Popover>
              <span style={{ marginLeft: "8px" }}>
                {shortenUrl(record.url)}
              </span>
            </div>
            <TagCopy id={record.id} />
          </Space>
        );
      },
    },
    {
      title: "Event",
      dataIndex: "event",
      key: "event",
      width: 180,
      render: (event: string) => <Tag color="purple">{event}</Tag>,
    },
    {
      title: "Status",
      key: "active",
      width: 120,
      render: (_: any, record: WebhookFE) => (
        <Space>
          {record.active ? (
            <Tag icon={<CheckCircleOutlined />} color="success">
              Active
            </Tag>
          ) : (
            <Tag icon={<CloseCircleOutlined />} color="error">
              Inactive
            </Tag>
          )}
        </Space>
      ),
    },
  ];

  // Example items for filter dropdowns
  const filterItems = [
    { key: "1", label: "Coming Soon" },
    { key: "2", label: "Coming Soon" },
    { key: "3", label: "Coming Soon" },
  ];

  const renderMobileList = () => {
    return (
      <List
        itemLayout="horizontal"
        dataSource={filteredWebhooks}
        renderItem={(webhook: WebhookFE) => (
          <List.Item
            style={{
              padding: "12px 16px",
              cursor: "pointer",
              backgroundColor: isWebhookTabOpen(webhook.id)
                ? "#e6f7ff"
                : "transparent",
            }}
            onClick={() => handleClickContentTab(webhook, true)}
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
                <div
                  style={{
                    width: 32,
                    height: 32,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    backgroundColor: "#1890ff",
                    borderRadius: "50%",
                    color: "white",
                  }}
                >
                  <ApiOutlined />
                </div>
                <div style={{ display: "flex", flexDirection: "column" }}>
                  <span style={{ fontWeight: "500" }}>
                    {shortenUrl(webhook.url)}
                  </span>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                    }}
                  >
                    <Badge status={webhook.active ? "success" : "error"} dot />
                    <span
                      style={{ fontSize: "10px", color: "rgba(0,0,0,0.45)" }}
                    >
                      <Tag color="purple" style={{ margin: 0 }}>
                        {webhook.event}
                      </Tag>
                    </span>
                  </div>
                </div>
              </div>
              <div
                style={{ display: "flex", alignItems: "center", gap: "12px" }}
              >
                <Tag color="default">{webhook.alt_index}</Tag>
                <RightOutlined style={{ color: "rgba(0,0,0,0.4)" }} />
              </div>
            </div>
          </List.Item>
        )}
      />
    );
  };

  const syncLatest = () => {
    if (!currentProfile) return;
    dispatch(listWebhooksAction({}));
    dispatch(checkWebhookTablePermissionsAction(currentProfile.userID));
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
            className="desktop-view"
            id="desktop-view"
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            {/* Search input */}

            <Space direction="horizontal">
              <Input
                placeholder="Search webhooks..."
                prefix={<SearchOutlined />}
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                style={{ width: "240px" }}
              />

              {loading ? (
                <span>
                  <LoadingOutlined />
                  <i style={{ marginLeft: 8, color: "rgba(0,0,0,0.2)" }}>
                    Syncing
                  </i>
                </span>
              ) : (
                <SyncOutlined
                  onClick={() => {
                    message.info("Syncing latest...");
                    syncLatest();
                  }}
                  style={{ color: "rgba(0,0,0,0.2)" }}
                />
              )}
            </Space>

            {/* Filter options and manage button */}
            <div style={{ display: "flex", gap: "20px", alignItems: "center" }}>
              <Dropdown menu={{ items: filterItems, onClick: () => {} }}>
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
            className="mobile-view"
            id="mobile-view"
            style={{
              display: "none",
              flexDirection: "column",
              gap: "16px",
            }}
          >
            {/* Search input - always on top for mobile */}
            <Input
              placeholder="Search webhooks..."
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
                <Dropdown menu={{ items: filterItems, onClick: () => {} }}>
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

      {/* Webhooks Table */}
      {tablePermissions.includes(SystemPermissionType.VIEW) ||
      webhooks.length > 0 ? (
        <div
          style={{ flex: 1, padding: "0 16px 16px 16px", overflowY: "auto" }}
        >
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
              dataSource={filteredWebhooks}
              rowKey="id"
              pagination={false}
              onRow={(record) => ({
                onClick: () => {
                  handleClickContentTab(record, false);
                },
                style: {
                  backgroundColor: isWebhookTabOpen(record.id)
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
      ) : (
        <Result
          icon={<LockOutlined />}
          title="Unauthorized"
          subTitle={
            <div>
              <span>Sorry, you are not authorized to view webhooks.</span>
              <br />
              <span>Contact your organization administrator.</span>
            </div>
          }
          extra={
            <Link to={wrapOrgCode("/welcome")}>
              <Button type="primary">Back Home</Button>
            </Link>
          }
          style={{
            marginTop: screenType.isMobile ? "0vh" : "10vh",
            marginBottom: "20vh",
          }}
        />
      )}
    </div>
  );
};

export default WebhooksTableList;

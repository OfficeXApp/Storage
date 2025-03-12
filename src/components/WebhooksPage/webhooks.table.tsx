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
} from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import { WebhookFE } from "@officexapp/types";
import useScreenType from "react-screentype-hook";
import { ReduxAppState } from "../../redux-offline/ReduxProvider";
import { useDispatch, useSelector } from "react-redux";
import { listWebhooksAction } from "../../redux-offline/webhooks/webhooks.actions";

interface WebhooksTableListProps {
  isWebhookTabOpen: (id: string) => boolean;
  handleClickWebhookTab: (webhook: WebhookFE, focus_tab?: boolean) => void;
}

const WebhooksTableList: React.FC<WebhooksTableListProps> = ({
  isWebhookTabOpen,
  handleClickWebhookTab,
}) => {
  const dispatch = useDispatch();
  const isOnline = useSelector((state: ReduxAppState) => state.offline?.online);
  const webhooks = useSelector(
    (state: ReduxAppState) => state.webhooks.webhooks
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
    try {
      dispatch(listWebhooksAction({}));
    } catch (e) {
      console.error(e);
    }

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
              handleClickWebhookTab(record);
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
            <span style={{ marginLeft: "0px" }}>{shortenUrl(record.url)}</span>
            <Tag
              onClick={() => {
                // copy to clipboard
                navigator.clipboard.writeText(record.url);
                message.success("URL copied to clipboard");
              }}
              color="default"
            >
              {record.alt_index}
            </Tag>
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
    {
      title: "Actions",
      key: "actions",
      width: 150,
      render: (_: any, record: WebhookFE) => (
        <Button
          type="default"
          size="middle"
          style={{ width: "100%" }}
          onClick={(e) => {
            e.stopPropagation();
            handleClickWebhookTab(record, true);
            const newUrl = `/resources/webhooks/${record.id}`;
            window.history.pushState({}, "", newUrl);
          }}
        >
          Open
        </Button>
      ),
    },
  ];

  // Example items for filter dropdowns
  const filterItems = [
    { key: "1", label: "Option 1" },
    { key: "2", label: "Option 2" },
    { key: "3", label: "Option 3" },
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
            onClick={() => handleClickWebhookTab(webhook, true)}
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
            <Input
              placeholder="Search webhooks..."
              prefix={<SearchOutlined />}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              style={{ width: "240px" }}
            />

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
            dataSource={filteredWebhooks}
            rowKey="id"
            pagination={false}
            onRow={(record) => ({
              onClick: () => {
                handleClickWebhookTab(record, false);
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
    </div>
  );
};

export default WebhooksTableList;

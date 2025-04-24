import React, { useEffect, useState } from "react";
import { TemplateItem } from "./templates.tab";
import {
  Button,
  Dropdown,
  Input,
  Space,
  Table,
  Avatar,
  Tag,
  Badge,
  Menu,
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
} from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import { shortenAddress } from "../../framework/identity/constants";

interface TemplatesTableListProps {
  profiles: TemplateItem[];
  isTemplateTabOpen: (id: string) => boolean;
  handleTemplateTab: (profile: TemplateItem, focus_tab?: boolean) => void;
}

const TemplatesTableList: React.FC<TemplatesTableListProps> = ({
  profiles,
  isTemplateTabOpen,
  handleTemplateTab,
}) => {
  const [searchText, setSearchText] = useState("");
  const [filteredProfiles, setFilteredProfiles] = useState(profiles);
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);

  // Update filtered profiles whenever search text or profiles change
  useEffect(() => {
    const filtered = profiles.filter((profile) =>
      profile.name.toLowerCase().includes(searchText.toLowerCase())
    );
    setFilteredProfiles(filtered);
  }, [searchText, profiles]);

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
      icon: <UserAddOutlined />,
      label: "Add to Group",
      disabled: true,
    },
    {
      key: "2",
      icon: <MailOutlined />,
      label: "Send Invites",
      disabled: true,
    },
    {
      key: "3",
      icon: <DeleteOutlined />,
      label: "Delete",
      disabled: true,
    },
  ];

  // Define table columns
  const columns: ColumnsType<TemplateItem> = [
    {
      title: "Contact",
      dataIndex: "name",
      key: "name",
      render: (_: any, record: TemplateItem) => (
        <Space
          onClick={(e) => {
            e?.stopPropagation();
            handleTemplateTab(record);
          }}
        >
          <Avatar
            size="default"
            src={
              record.avatar || `https://ui-avatars.com/api/?name=${record.name}`
            }
          />
          <span>{record.name}</span>
          <Badge color="green" dot />
          <span style={{ fontSize: "12px", color: "rgba(0,0,0,0.45)" }}>
            <ClockCircleOutlined style={{ marginRight: 4 }} />
            Active 2h ago
          </span>
        </Space>
      ),
    },
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
      width: 120, // Reduced width for ID column
      ellipsis: true, // Add ellipsis to handle overflow
      render: (id: string) => <Tag color="default">{shortenAddress(id)}</Tag>,
    },
    {
      title: "Actions",
      key: "actions",
      width: 150, // Increased width for actions column
      render: (_: any, record: TemplateItem) => (
        <Button
          type="default"
          size="middle"
          style={{ width: "100%" }} // Make button take up full column width
          onClick={(e) => {
            e.stopPropagation();
            handleTemplateTab(record, true);
          }}
        >
          Open
        </Button>
      ),
    },
  ];

  // Example items for filter dropdowns
  const filterItems = [
    { key: "1", label: "Coming Soon" },
    { key: "2", label: "Coming Soon" },
    { key: "3", label: "Coming Soon" },
  ];

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
              placeholder="Search contacts..."
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

              <Dropdown menu={{ items: filterItems, onClick: () => {} }}>
                <a
                  onClick={(e) => e.preventDefault()}
                  style={{ color: "rgba(0,0,0,0.4)" }}
                >
                  <Space>
                    <TeamOutlined /> Group By <DownOutlined />
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
              placeholder="Search contacts..."
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

                <Dropdown menu={{ items: filterItems, onClick: () => {} }}>
                  <a
                    onClick={(e) => e.preventDefault()}
                    style={{ color: "rgba(0,0,0,0.4)" }}
                  >
                    <Space>
                      <TeamOutlined /> Group By <DownOutlined />
                    </Space>
                  </a>
                </Dropdown>
              </div>

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
        </div>
      </div>

      {/* Contacts Table */}
      <div style={{ flex: 1, padding: "0 16px 16px 16px", overflowY: "auto" }}>
        <Table
          rowSelection={{
            type: "checkbox",
            ...rowSelection,
            columnWidth: 50,
          }}
          columns={columns}
          dataSource={filteredProfiles}
          rowKey="id"
          pagination={false}
          onRow={(record) => ({
            onClick: () => {
              // Now clicking row just selects the checkbox
              // const key = record.id;
              // const newSelectedRowKeys = selectedRowKeys.includes(key)
              //   ? selectedRowKeys.filter((k) => k !== key)
              //   : [...selectedRowKeys, key];
              // setSelectedRowKeys(newSelectedRowKeys);
              handleTemplateTab(record, false);
            },
            style: {
              backgroundColor: isTemplateTabOpen(record.id)
                ? "#e6f7ff"
                : "transparent",
              cursor: "pointer",
            },
          })}
          size="middle"
        />
      </div>
    </div>
  );
};

export default TemplatesTableList;

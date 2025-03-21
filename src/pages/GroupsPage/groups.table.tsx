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
  EditOutlined,
  LockOutlined,
  SisternodeOutlined,
} from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import { shortenAddress } from "../../framework/identity/constants";
import { GroupFE } from "@officexapp/types";
import useScreenType from "react-screentype-hook";
import { ReduxAppState } from "../../redux-offline/ReduxProvider";
import { useDispatch, useSelector } from "react-redux";
import { listGroupsAction } from "../../redux-offline/groups/groups.actions";
import { formatUserString } from "../../api/helpers";

interface GroupsTableProps {
  isContentTabOpen: (id: string) => boolean;
  handleClickContentTab: (group: GroupFE, focus_tab?: boolean) => void;
}

const GroupsTable: React.FC<GroupsTableProps> = ({
  isContentTabOpen,
  handleClickContentTab,
}) => {
  const dispatch = useDispatch();
  const isOnline = useSelector((state: ReduxAppState) => state.offline?.online);
  const groups = useSelector((state: ReduxAppState) => state.groups.groups);
  const screenType = useScreenType();
  const [searchText, setSearchText] = useState("");
  const [filteredGroups, setFilteredGroups] = useState(groups);
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);

  console.log(`groups`, groups);

  // Update filtered groups whenever search text or groups change
  useEffect(() => {
    const filtered = groups.filter((group) =>
      group.name.toLowerCase().includes(searchText.toLowerCase())
    );
    setFilteredGroups(filtered);
  }, [searchText, groups]);

  // Handle responsive layout
  useEffect(() => {
    try {
      dispatch(listGroupsAction({}));
    } catch (e) {
      console.error(e);
    }

    // message.success(
    //   isOnline
    //     ? "Fetching groups..."
    //     : "Queued fetch groups for when you're back online"
    // );

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
  const manageMenuItems =
    selectedRowKeys.length === 0
      ? [
          {
            key: "add-group",
            icon: <UserAddOutlined />,
            label: "Add Group",
          },
          {
            key: "manage-permissions",
            icon: <LockOutlined />,
            label: "Permissions",
          },
          {
            key: "manage-webhooks",
            icon: <SisternodeOutlined />,
            label: "Webhooks",
          },
        ]
      : [
          {
            key: "add-members",
            icon: <UserAddOutlined />,
            label: "Add Members",
            disabled: true,
          },
          {
            key: "edit-group",
            icon: <EditOutlined />,
            label: "Edit Group",
            disabled: true,
          },
          {
            key: "delete-group",
            icon: <DeleteOutlined />,
            label: "Delete",
            disabled: true,
          },
        ];

  // Define table columns
  const columns: ColumnsType<GroupFE> = [
    {
      title: "Group",
      dataIndex: "name",
      key: "name",
      render: (_: any, record: GroupFE) => (
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
              const newUrl = `/resources/groups/${record.id}`;
              window.history.pushState({}, "", newUrl);
            }}
          >
            <Avatar
              size="default"
              style={{ backgroundColor: "#87d068" }}
              icon={<TeamOutlined />}
            />
            <span style={{ marginLeft: "8px" }}>{record.name}</span>
          </div>
          <Tag
            onClick={() => {
              // copy to clipboard
              formatUserString(record.name, record.id);
              message.success("Copied to clipboard");
            }}
            color="default"
          >
            {shortenAddress(record.id.replace("GroupID_", ""))}
          </Tag>
        </Space>
      ),
    },
    {
      title: "Size",
      key: "actions",
      width: 120,
      render: (_: any, record: GroupFE) => (
        <span
          onClick={(e) => {
            e?.stopPropagation();
            handleClickContentTab(record);
          }}
        >
          {record.member_previews.length} Members
        </span>
      ),
    },
    {
      title: "Description",
      dataIndex: "public_note",
      key: "public_note",
      ellipsis: true,
      render: (text: string, record) => (
        <span
          onClick={(e) => {
            e?.stopPropagation();
            handleClickContentTab(record);
          }}
        >
          {text || "No description provided"}
        </span>
      ),
    },
  ];

  // Example items for filter dropdowns
  const filterItems = [
    { key: "1", label: "Recently Created" },
    { key: "2", label: "Alphabetical (A-Z)" },
    { key: "3", label: "Alphabetical (Z-A)" },
  ];

  const renderMobileList = () => {
    return (
      <List
        itemLayout="horizontal"
        dataSource={filteredGroups}
        renderItem={(group: GroupFE) => (
          <List.Item
            style={{
              padding: "12px 16px",
              cursor: "pointer",
              backgroundColor: isContentTabOpen(group.id)
                ? "#e6f7ff"
                : "transparent",
            }}
            onClick={() => handleClickContentTab(group, true)}
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
                  style={{ backgroundColor: "#87d068" }}
                  icon={<TeamOutlined />}
                />
                <div style={{ display: "flex", flexDirection: "column" }}>
                  <span style={{ fontWeight: "500" }}>{group.name}</span>
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
                      {group.public_note || "No description provided"}
                    </span>
                  </div>
                </div>
              </div>
              <div
                style={{ display: "flex", alignItems: "center", gap: "12px" }}
              >
                <Tag color="default">{shortenAddress(group.id)}</Tag>
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
              placeholder="Search groups..."
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
              {/* <Button
                type="primary"
                icon={<TeamOutlined />}
                onClick={() => {
                  message.info("Create group functionality to be implemented");
                }}
              >
                Create Group
              </Button> */}
              <Dropdown menu={{ items: manageMenuItems }}>
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
              placeholder="Search groups..."
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

              <Button
                type="primary"
                icon={<TeamOutlined />}
                onClick={() => {
                  message.info("Create group functionality to be implemented");
                }}
              >
                Create
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Groups Table */}
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
            dataSource={filteredGroups}
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

export default GroupsTable;

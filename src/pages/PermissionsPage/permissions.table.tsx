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
  Tabs,
} from "antd";
import {
  BarsOutlined,
  ClockCircleOutlined,
  DownOutlined,
  SearchOutlined,
  SortAscendingOutlined,
  TeamOutlined,
  UserAddOutlined,
  DeleteOutlined,
  RightOutlined,
  LockOutlined,
  GlobalOutlined,
  FolderOutlined,
  UserOutlined,
  CalendarOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import { shortenAddress } from "../../framework/identity/constants";
import { DirectoryPermissionFE, SystemPermissionType } from "@officexapp/types";
import useScreenType from "react-screentype-hook";
import { ReduxAppState } from "../../redux-offline/ReduxProvider";
import { useDispatch, useSelector } from "react-redux";
import { listSystemPermissionsAction } from "../../redux-offline/permissions/permissions.actions";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import {
  DirectoryPermissionFEO,
  SystemPermissionFEO,
} from "../../redux-offline/permissions/permissions.reducer";
import SystemPermissionAddDrawer from "./system-permission.add";
import TagCopy from "../../components/TagCopy";
import { useIdentitySystem } from "../../framework/identity";

dayjs.extend(relativeTime);

const { TabPane } = Tabs;

interface PermissionsTableListProps {
  isContentTabOpen: (id: string) => boolean;
  handleClickContentTab: (
    permission: SystemPermissionFEO,
    focus_tab?: boolean
  ) => void;
}

const PermissionsTableList: React.FC<PermissionsTableListProps> = ({
  isContentTabOpen,
  handleClickContentTab,
}) => {
  const { wrapOrgCode } = useIdentitySystem();
  const dispatch = useDispatch();
  const isOnline = useSelector((state: ReduxAppState) => state.offline?.online);
  const systemPermissions = useSelector(
    (state: ReduxAppState) => state.systemPermissions.permissions
  );
  const tablePermissions = useSelector(
    (state: ReduxAppState) => state.systemPermissions.tablePermissions
  );
  const [systemDrawerOpen, setSystemDrawerOpen] = useState(false);
  const screenType = useScreenType();
  const [searchText, setSearchText] = useState("");
  const [filteredSystemPermissions, setFilteredSystemPermissions] = useState<
    SystemPermissionFEO[]
  >([]);
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);

  useEffect(() => {
    if (systemPermissions.length > 0) {
      setFilteredSystemPermissions(
        systemPermissions.filter((p) => p.permission_types.length > 0)
      );
    }
  }, []);

  // Update filtered permissions whenever search text or permissions change
  useEffect(() => {
    const filteredSystem = systemPermissions
      .filter((p) => p.permission_types.length > 0)
      .filter((permission) => {
        console.log("permission", permission);
        return (
          permission.resource_id
            .toLowerCase()
            .includes(searchText.toLowerCase()) ||
          permission.granted_to
            .toLowerCase()
            .includes(searchText.toLowerCase()) ||
          (permission.grantee_name || "")
            .toLowerCase()
            .includes(searchText.toLowerCase()) ||
          (permission.resource_name || "")
            .toLowerCase()
            .includes(searchText.toLowerCase()) ||
          (permission.note &&
            permission.note.toLowerCase().includes(searchText.toLowerCase()))
        );
      });
    setFilteredSystemPermissions(filteredSystem);
  }, [searchText, systemPermissions]);

  // Fetch permissions on component mount
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

  // Check if a permission is active
  const isPermissionActive = (permission: SystemPermissionFEO) => {
    if (permission.expiry_date_ms === -1) {
      return true;
    }
    const now = Date.now();
    const hasBegun =
      !permission.begin_date_ms || permission.begin_date_ms <= now;
    const hasExpired =
      permission.expiry_date_ms && permission.expiry_date_ms < now;
    return hasBegun && !hasExpired;
  };

  // Format relative time
  const formatRelativeTime = (timestamp: number) => {
    return dayjs(timestamp).fromNow();
  };

  // Get the status badge for a permission
  const getPermissionStatus = (permission: SystemPermissionFEO) => {
    if (isPermissionActive(permission)) {
      return { status: "success", text: "Active" };
    } else {
      const now = Date.now();
      if (permission.begin_date_ms && permission.begin_date_ms > now) {
        return {
          status: "warning",
          text: `Starts ${formatRelativeTime(permission.begin_date_ms)}`,
        };
      } else if (permission.expiry_date_ms && permission.expiry_date_ms < now) {
        return {
          status: "error",
          text: `Expired ${formatRelativeTime(permission.expiry_date_ms)}`,
        };
      }
      return { status: "default", text: "Unknown" };
    }
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
      icon: <DeleteOutlined />,
      label: "Delete Selected",
      disabled: false,
    },
  ];

  // Define system permission table columns
  const systemColumns: ColumnsType<SystemPermissionFEO> = [
    {
      title: "Resource",
      dataIndex: "resource_id",
      key: "resource_id",
      render: (_: any, record: SystemPermissionFEO) => {
        const status = getPermissionStatus(record);
        const resourceType = record.resource_id.split("_")[0];

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
                const newUrl = wrapOrgCode(
                  `/resources/permissions/system/${record.id}`
                );
                window.history.pushState({}, "", newUrl);
              }}
            >
              <Popover content={status.text}>
                <Badge
                  // @ts-ignore
                  status={status.status}
                  dot
                  offset={[-3, 3]}
                >
                  <div
                    style={{
                      width: 32,
                      height: 32,
                      background: "#1890ff",
                      borderRadius: "50%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "white",
                    }}
                  >
                    <LockOutlined />
                  </div>
                </Badge>
              </Popover>
              <span style={{ marginLeft: "8px" }}>
                {getPermissionTitle(record, "system")}
              </span>
            </div>
            <TagCopy id={record.resource_id} />
          </Space>
        );
      },
    },
    {
      title: "Granted To",
      dataIndex: "granted_to",
      key: "granted_to",
      render: (_: any, record: SystemPermissionFEO) => (
        <Space
          onClick={(e) => {
            e?.stopPropagation();
            handleClickContentTab(record);
          }}
        >
          <UserOutlined />
          <span>{record.grantee_name || "Unnamed"}</span>
          <TagCopy id={record.granted_to} />
        </Space>
      ),
    },
    {
      title: "Permissions",
      dataIndex: "permission_types",
      key: "permission_types",
      render: (_: any, record: SystemPermissionFEO) => (
        <div
          onClick={(e) => {
            e?.stopPropagation();
            handleClickContentTab(record);
          }}
        >
          {record.permission_types.map((permission) => (
            <Tag key={permission}>{permission}</Tag>
          ))}
        </div>
      ),
    },
    {
      title: "Expiry",
      dataIndex: "expiry_date_ms",
      key: "expiry_date_ms",
      render: (_: any, record: SystemPermissionFEO) => (
        <Space
          onClick={(e) => {
            e?.stopPropagation();
            handleClickContentTab(record);
          }}
        >
          <CalendarOutlined />
          <span>
            {record.expiry_date_ms && record.expiry_date_ms !== -1
              ? dayjs(record.expiry_date_ms).format("MMM D, YYYY")
              : "Never"}
          </span>
        </Space>
      ),
    },
  ];

  // Example items for filter dropdowns
  const filterItems = [
    { key: "1", label: "Option 1" },
    { key: "2", label: "Option 2" },
    { key: "3", label: "Option 3" },
  ];

  // Render the mobile list view for system permissions
  const renderSystemMobileList = () => {
    return (
      <List
        itemLayout="horizontal"
        dataSource={filteredSystemPermissions}
        renderItem={(permission: SystemPermissionFEO) => {
          const status = getPermissionStatus(permission);
          const resourceType = permission.resource_id.split("_")[0];

          return (
            <List.Item
              style={{
                padding: "12px 16px",
                cursor: "pointer",
                backgroundColor: isContentTabOpen(permission.id)
                  ? "#e6f7ff"
                  : "transparent",
              }}
              onClick={() => handleClickContentTab(permission, true)}
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
                      background: "#1890ff",
                      borderRadius: "50%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "white",
                    }}
                  >
                    <GlobalOutlined />
                  </div>
                  <div style={{ display: "flex", flexDirection: "column" }}>
                    <span style={{ fontWeight: "500" }}>{resourceType}</span>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                      }}
                    >
                      <Badge color={status.status as any} dot />
                      <span
                        style={{ fontSize: "10px", color: "rgba(0,0,0,0.45)" }}
                      >
                        {status.text}
                      </span>
                    </div>
                  </div>
                </div>
                <div
                  style={{ display: "flex", alignItems: "center", gap: "12px" }}
                >
                  <div>
                    {permission.permission_previews.length > 0 && (
                      <Tag color="blue">
                        {permission.permission_previews[0]}
                      </Tag>
                    )}
                    {permission.permission_previews.length > 1 && (
                      <Tag>+{permission.permission_previews.length - 1}</Tag>
                    )}
                  </div>
                  <RightOutlined style={{ color: "rgba(0,0,0,0.4)" }} />
                </div>
              </div>
            </List.Item>
          );
        }}
      />
    );
  };

  const getPermissionTitle = (
    permission: SystemPermissionFEO,
    permissionType: "system"
  ) => {
    if (permissionType === "system") {
      const sysPermission = permission;
      let resourceId = "";

      // Handle if resource_id is an object or string
      if (typeof sysPermission.resource_id === "object") {
        resourceId = String(sysPermission.resource_id);
      } else {
        resourceId = String(sysPermission.resource_id);
      }

      // Check if it's a TABLE resource
      if (resourceId.startsWith("TABLE_")) {
        const tableName = resourceId.split("TABLE_")[1];

        // Map table names to titles
        switch (tableName) {
          case "DRIVES":
            return "All Drives";
          case "DISKS":
            return "All Disks";
          case "CONTACTS":
            return "All Contacts";
          case "GROUPS":
            return "All Groups";
          case "WEBHOOKS":
            return "All Webhooks";
          case "API_KEYS":
            return "All API Keys";
          case "PERMISSIONS":
            return "All Permissions";
          case "LABELS":
            return "All Labels";
          default:
            return "System";
        }
      }
      // Handle specific resource types
      else if (resourceId.startsWith("DriveID_")) {
        return "Single Drive";
      } else if (resourceId.startsWith("DiskID_")) {
        return "Single Disk";
      } else if (resourceId.startsWith("UserID_")) {
        return "Single User";
      } else if (resourceId.startsWith("GroupID_")) {
        return "Single Group";
      } else if (resourceId.startsWith("ApiKeyID_")) {
        return "Single API Key";
      } else if (resourceId.startsWith("WebhookID_")) {
        return "Single Webhook";
      } else if (resourceId.startsWith("LabelID_")) {
        return "Single Label";
      } else if (resourceId.startsWith("SystemPermissionID_")) {
        return "System Permit";
      } else {
        return "Permission";
      }
    } else {
      // For directory permissions
      return "Directory Permit";
    }
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
              placeholder="Search permissions..."
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
              {/* Replace this Dropdown with the new Add buttons */}
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => setSystemDrawerOpen(true)}
                disabled={
                  !tablePermissions.includes(SystemPermissionType.CREATE)
                }
              >
                Add System Permission
              </Button>
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
              placeholder="Search permissions..."
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
            </div>
          </div>
        </div>
      </div>

      {/* Permissions Tabs & Tables */}
      <div style={{ flex: 1, padding: "0 16px 16px 16px", overflowY: "auto" }}>
        {screenType.isMobile ? (
          renderSystemMobileList()
        ) : (
          <Table
            rowSelection={{
              type: "checkbox",
              ...rowSelection,
              columnWidth: 50,
            }}
            columns={systemColumns}
            dataSource={filteredSystemPermissions}
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
      <SystemPermissionAddDrawer
        open={systemDrawerOpen}
        onClose={() => setSystemDrawerOpen(false)}
        onAddPermission={(data) => {
          // Handle the new permission if needed
          setSystemDrawerOpen(false);
        }}
      />
    </div>
  );
};

export default PermissionsTableList;

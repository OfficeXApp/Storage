import React, { useState, useEffect } from "react";
import { Table, Input, Button, Space, Tag, Tooltip, Avatar } from "antd";
import { SearchOutlined, LockOutlined } from "@ant-design/icons";
import type { TableProps } from "antd";
import dayjs from "dayjs";

// Types based on the Rust structs
interface SystemPermissionType {
  // This is a placeholder since the actual type is not provided
  name: string;
  description: string;
}

interface TagStringValue {
  value: string;
}

interface PermissionMetadata {
  [key: string]: any;
}

interface ExternalID {
  value: string;
}

interface ExternalPayload {
  [key: string]: any;
}

interface SystemPermission {
  id: string;
  resource_id: string;
  granted_to: string;
  granted_by: string;
  permission_types: SystemPermissionType[];
  begin_date_ms: number;
  expiry_date_ms: number;
  note: string;
  created_at: number;
  last_modified_at: number;
  from_placeholder_grantee?: string;
  tags: TagStringValue[];
  metadata?: PermissionMetadata;
  external_id?: ExternalID;
  external_payload?: ExternalPayload;
}

interface SystemPermissionFE {
  system_permission: SystemPermission;
  resource_name?: string;
  grantee_name?: string;
  grantee_avatar?: string;
  granter_name?: string;
  permission_previews: SystemPermissionType[];
}

interface SystemPermissionsManagerProps {
  title: string;
  resource_id?: string;
}

const SystemPermissionsManager: React.FC<SystemPermissionsManagerProps> = ({
  title,
  resource_id,
}) => {
  const [searchText, setSearchText] = useState("");
  const [permissions, setPermissions] = useState<SystemPermissionFE[]>([]);
  const [loading, setLoading] = useState(false);

  // Mock data for the table
  useEffect(() => {
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      const mockPermissions = generateMockPermissions(10);
      setPermissions(mockPermissions);
      setLoading(false);
    }, 500);
  }, [resource_id]);

  // Generate mock permission data
  const generateMockPermissions = (count: number): SystemPermissionFE[] => {
    const mockPermissionTypes: SystemPermissionType[] = [
      { name: "VIEW", description: "Can view the resource" },
      { name: "EDIT", description: "Can edit the resource" },
      { name: "DELETE", description: "Can delete the resource" },
      { name: "ADMIN", description: "Has admin privileges" },
    ];

    return Array.from({ length: count }, (_, i) => {
      const now = Date.now();
      const permTypes = mockPermissionTypes.slice(
        0,
        Math.floor(Math.random() * 3) + 1
      );

      return {
        system_permission: {
          id: `perm-${i + 1}`,
          resource_id:
            resource_id || `resource-${Math.floor(Math.random() * 5) + 1}`,
          granted_to: `user-${Math.floor(Math.random() * 10) + 1}`,
          granted_by: `admin-${Math.floor(Math.random() * 3) + 1}`,
          permission_types: permTypes,
          begin_date_ms: Math.random() > 0.8 ? now + 86400000 : 0, // 24h in future or immediate
          expiry_date_ms: Math.random() > 0.7 ? now + 2592000000 : -1, // 30 days or never
          note: `Permission note ${i + 1}`,
          created_at: now - Math.floor(Math.random() * 86400000 * 30),
          last_modified_at: now - Math.floor(Math.random() * 86400000),
          tags: [{ value: "system" }, { value: `tag-${i}` }],
        },
        resource_name: `Resource ${Math.floor(Math.random() * 5) + 1}`,
        grantee_name: `User ${Math.floor(Math.random() * 10) + 1}`,
        grantee_avatar: `https://randomuser.me/api/portraits/men/${i + 1}.jpg`,
        granter_name: `Admin ${Math.floor(Math.random() * 3) + 1}`,
        permission_previews: permTypes,
      };
    });
  };

  // Filter permissions based on search text
  const filteredPermissions = permissions.filter((permission) => {
    const searchLower = searchText.toLowerCase();
    return (
      (permission.grantee_name?.toLowerCase().includes(searchLower) ?? false) ||
      (permission.resource_name?.toLowerCase().includes(searchLower) ??
        false) ||
      (permission.granter_name?.toLowerCase().includes(searchLower) ?? false) ||
      permission.permission_previews.some((p) =>
        p.name.toLowerCase().includes(searchLower)
      ) ||
      permission.system_permission.note.toLowerCase().includes(searchLower)
    );
  });

  // Handle grant permission button click
  const handleGrantPermission = () => {
    console.log("Grant permission clicked");
    // Implementation would go here
  };

  // Format date for display
  const formatDate = (ms: number): string => {
    if (ms === -1) return "Never";
    if (ms === 0) return "Immediate";
    return dayjs(ms).format("YYYY-MM-DD HH:mm");
  };

  // Table columns
  const columns: TableProps<SystemPermissionFE>["columns"] = [
    {
      title: "Grantee",
      dataIndex: ["grantee_name"],
      key: "grantee",
      render: (text, record) => (
        <Space>
          {record.grantee_avatar && (
            <Avatar src={record.grantee_avatar} size="small" />
          )}
          {text || record.system_permission.granted_to}
        </Space>
      ),
    },
    {
      title: "Resource",
      dataIndex: ["resource_name"],
      key: "resource",
      render: (text, record) => text || record.system_permission.resource_id,
    },
    {
      title: "Permissions",
      dataIndex: ["permission_previews"],
      key: "permissions",
      render: (permissions: SystemPermissionType[]) => (
        <>
          {permissions.map((perm) => (
            <Tag color="blue" key={perm.name}>
              {perm.name}
            </Tag>
          ))}
        </>
      ),
    },
    {
      title: "Granted By",
      dataIndex: ["granter_name"],
      key: "granter",
      render: (text, record) => text || record.system_permission.granted_by,
    },
    {
      title: "Start Date",
      dataIndex: ["system_permission", "begin_date_ms"],
      key: "start_date",
      render: (date) => formatDate(date),
    },
    {
      title: "Expiry Date",
      dataIndex: ["system_permission", "expiry_date_ms"],
      key: "expiry_date",
      render: (date) => formatDate(date),
    },
    {
      title: "Notes",
      dataIndex: ["system_permission", "note"],
      key: "note",
      ellipsis: {
        showTitle: false,
      },
      render: (note) => (
        <Tooltip placement="topLeft" title={note}>
          {note}
        </Tooltip>
      ),
    },
  ];

  return (
    <div style={{ padding: "20px" }}>
      <h2>{title}</h2>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: "16px",
          alignItems: "center",
        }}
      >
        <Input
          placeholder="Search permissions"
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          style={{ width: "300px" }}
          prefix={<SearchOutlined />}
          allowClear
        />
        <Button
          type="primary"
          icon={<LockOutlined />}
          disabled
          onClick={handleGrantPermission}
        >
          Grant Permission
        </Button>
      </div>
      <Table
        columns={columns}
        dataSource={filteredPermissions}
        rowKey={(record) => record.system_permission.id}
        pagination={{ pageSize: 10 }}
        loading={loading}
      />
    </div>
  );
};

export default SystemPermissionsManager;

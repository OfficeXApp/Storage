// src/components/DirectoryPage/directory.sharing.tsx

import React, { useState } from "react";
import {
  Button,
  Checkbox,
  DatePicker,
  Drawer,
  Dropdown,
  Input,
  Space,
  Table,
  Tooltip,
  message,
  Typography,
} from "antd";
import {
  CopyOutlined,
  InfoCircleOutlined,
  MoreOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import type { MenuProps } from "antd";
import { Permission } from "@aws-sdk/client-s3";

interface DirectorySharingDrawerProps {
  open: boolean;
  onClose: () => void;
  directoryId?: string;
}

const { RangePicker } = DatePicker;
const { Text } = Typography;

interface PermissionRecord {
  key: string;
  who: string;
  canView: boolean;
  canEdit: boolean;
  canDelete: boolean;
  canInvite: boolean;
  whenStart: number | null;
  whenEnd: number | null;
}

const DirectorySharingDrawer: React.FC<DirectorySharingDrawerProps> = ({
  open,
  onClose,
  directoryId,
}) => {
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);
  const [shareUrl, setShareUrl] = useState(window.location.href);

  const [dataSource, setDataSource] = useState<PermissionRecord[]>([
    {
      key: "1",
      who: "Public",
      canView: false,
      canEdit: false,
      canDelete: false,
      canInvite: false,
      whenStart: 0,
      whenEnd: -1,
    },
    {
      key: "2",
      who: "John D",
      canView: true,
      canEdit: false,
      canDelete: false,
      canInvite: false,
      whenStart: Date.now(),
      whenEnd: Date.now() + 30 * 24 * 60 * 60 * 1000,
    },
    {
      key: "3",
      who: "Market",
      canView: true,
      canEdit: true,
      canDelete: true,
      canInvite: true,
      whenStart: Date.now(),
      whenEnd: null,
    },
    {
      key: "4",
      who: "Admin",
      canView: true,
      canEdit: true,
      canDelete: true,
      canInvite: true,
      whenStart: null,
      whenEnd: null,
    },
  ]);

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(shareUrl);
    message.success("Share URL copied to clipboard");
  };

  const handleNameChange = (key: string, value: string) => {
    const newData = [...dataSource];
    const index = newData.findIndex((item) => item.key === key);
    newData[index].who = value;
    setDataSource(newData);
  };

  const handleCheckboxChange = (
    key: string,
    field: "canView" | "canEdit" | "canDelete" | "canInvite",
    value: boolean
  ) => {
    const newData = [...dataSource];
    const index = newData.findIndex((item) => item.key === key);

    if (field === "canView") newData[index].canView = value;
    if (field === "canEdit") newData[index].canEdit = value;
    if (field === "canDelete") newData[index].canDelete = value;
    if (field === "canInvite") newData[index].canInvite = value;

    setDataSource(newData);
  };

  const handleDateRangeChange = (
    key: string,
    dates: [Date | null, Date | null] | null
  ) => {
    const newData = [...dataSource];
    const index = newData.findIndex((item) => item.key === key);

    if (dates) {
      newData[index].whenStart = dates[0] ? dates[0].getTime() : null;
      newData[index].whenEnd = dates[1] ? dates[1].getTime() : null;
    } else {
      newData[index].whenStart = null;
      newData[index].whenEnd = null;
    }

    setDataSource(newData);
  };

  const handleRemove = (key: string) => {
    const newData = dataSource.filter((item) => item.key !== key);
    setDataSource(newData);
  };

  const columns = [
    {
      title: "Who",
      dataIndex: "who",
      key: "who",
      width: "30%",
      render: (text: string, record: PermissionRecord) => {
        return record.key === "1" ? (
          <span style={{ fontSize: "16px" }}>Public</span>
        ) : (
          <Input
            value={text}
            onChange={(e) => handleNameChange(record.key, e.target.value)}
            size="large"
            style={{ width: "100%" }}
          />
        );
      },
    },
    {
      title: "Can",
      key: "can",
      width: "30%",
      render: (_: any, record: PermissionRecord) => (
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          <Checkbox
            checked={record.canView}
            onChange={(e) =>
              handleCheckboxChange(record.key, "canView", e.target.checked)
            }
            disabled={record.key === "1"}
          >
            <Text style={{ fontSize: "14px" }}>View</Text>
          </Checkbox>
          <Checkbox
            checked={record.canEdit}
            onChange={(e) =>
              handleCheckboxChange(record.key, "canEdit", e.target.checked)
            }
            disabled={record.key === "1"}
          >
            <Text style={{ fontSize: "14px" }}>Edit</Text>
          </Checkbox>
          <Checkbox
            checked={record.canDelete}
            onChange={(e) =>
              handleCheckboxChange(record.key, "canDelete", e.target.checked)
            }
            disabled={record.key === "1"}
          >
            <Text style={{ fontSize: "14px" }}>Delete</Text>
          </Checkbox>
          <Checkbox
            checked={record.canInvite}
            onChange={(e) =>
              handleCheckboxChange(record.key, "canInvite", e.target.checked)
            }
            disabled={record.key === "1"}
          >
            <Text style={{ fontSize: "14px" }}>Invite</Text>
          </Checkbox>
        </div>
      ),
    },
    {
      title: "When",
      key: "when",
      width: "30%",
      render: (_: any, record: PermissionRecord) => {
        if (record.key === "1") {
          return <span style={{ fontSize: "16px" }}>Always</span>;
        }

        return (
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            <DatePicker style={{ width: "100%" }} placeholder="Start date" />
            <DatePicker style={{ width: "100%" }} placeholder="End date" />
          </div>
        );
      },
    },
    {
      title: (_: any, record: PermissionRecord) => (
        <Button icon={<PlusOutlined style={{ fontSize: "20px" }} />}>
          Add
        </Button>
      ),
      key: "action",
      width: "10%",
      render: (_: any, record: PermissionRecord) => {
        const items: MenuProps["items"] = [
          {
            key: "1",
            label: <a onClick={() => handleRemove(record.key)}>Remove</a>,
          },
        ];

        return (
          <Dropdown
            menu={{ items }}
            trigger={["click"]}
            disabled={record.key === "1"}
          >
            <Button
              type="text"
              icon={<MoreOutlined style={{ fontSize: "20px" }} />}
            />
          </Dropdown>
        );
      },
    },
  ];

  return (
    <Drawer
      title="Share Directory"
      placement="right"
      onClose={onClose}
      open={open}
      width={700}
      footer={
        <div style={{ textAlign: "right" }}>
          <Button size="large" onClick={onClose} style={{ marginRight: 8 }}>
            Cancel
          </Button>
          <Button
            onClick={() => {
              message.success("Share settings saved");
              onClose();
            }}
            type="primary"
            size="large"
          >
            Save Settings
          </Button>
        </div>
      }
    >
      <div style={{ marginBottom: "16px" }}>
        <Input
          value={shareUrl}
          readOnly
          size="large"
          variant="borderless"
          style={{ backgroundColor: "#fafafa" }}
          suffix={
            <Button
              type="primary"
              icon={<CopyOutlined />}
              onClick={handleCopyUrl}
              size="large"
            >
              Copy Link
            </Button>
          }
        />
      </div>
      <div style={{ marginBottom: "8px" }}>
        <Tooltip title="Link that can be shared with others to access this directory">
          <Space>
            <span style={{ color: "green" }}>
              This file is PUBLIC on the internet
            </span>{" "}
            <InfoCircleOutlined style={{ color: "#aaa" }} />
          </Space>
        </Tooltip>
      </div>

      {/* Advanced Section */}
      <details
        style={{ marginTop: "16px" }}
        open={isAdvancedOpen}
        onToggle={(e) => setIsAdvancedOpen(e.currentTarget.open)}
      >
        <summary
          style={{
            cursor: "pointer",
            color: "#595959",
            fontSize: "14px",
            marginBottom: "8px",
            userSelect: "none",
          }}
        >
          Settings
        </summary>

        <Table
          dataSource={dataSource}
          columns={columns}
          pagination={false}
          rowKey="key"
          style={{ marginTop: "16px" }}
          bordered={false}
          rowClassName={() => "permission-table-row"}
        />
      </details>

      <style>
        {`
          .permission-table-row td {
            padding: 16px 8px;
          }
          .ant-table-thead > tr > th {
            background-color: #fafafa;
            font-weight: bold;
            font-size: 16px;
          }
        `}
      </style>
    </Drawer>
  );
};

export default DirectorySharingDrawer;

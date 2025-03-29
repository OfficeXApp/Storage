import React, { useEffect, useMemo, useState } from "react";
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
  CheckOutlined,
  CloseOutlined,
  CopyOutlined,
  EditOutlined,
  InfoCircleOutlined,
  MoreOutlined,
  PlusOutlined,
  SaveOutlined,
} from "@ant-design/icons";
import type { MenuProps } from "antd";
import { Permission } from "@aws-sdk/client-s3";
import dayjs from "dayjs";
import { useSelector } from "react-redux";
import { ReduxAppState } from "../../redux-offline/ReduxProvider";
import {
  DirectoryPermissionType,
  DirectoryResourceID,
} from "@officexapp/types";
import DirectoryPermissionAddDrawer from "../../pages/PermissionsPage/directory-permission.add";
import { LOCAL_STORAGE_DIRECTORY_PERMISSIONS_ADVANCED_OPEN } from "../../framework/identity/constants";
import TagCopy from "../TagCopy";

interface DirectorySharingDrawerProps {
  open: boolean;
  onClose: () => void;
  resourceID: DirectoryResourceID;
}

const { RangePicker } = DatePicker;
const { Text } = Typography;

interface PermissionRecord {
  key: string;
  who: string;
  who_id: string;
  canView: boolean;
  canEdit: boolean;
  canDelete: boolean;
  canInvite: boolean;
  canUpload: boolean;
  whenStart: number | null;
  whenEnd: number | null;
  isEditing: boolean;
}

const DirectorySharingDrawer: React.FC<DirectorySharingDrawerProps> = ({
  open,
  onClose,
  resourceID,
}) => {
  const [isAddDrawerOpen, setIsAddDrawerOpen] = useState(false);
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);
  const [shareUrl, setShareUrl] = useState(window.location.href);
  const [searchText, setSearchText] = useState("");
  const { permissionMap, permissionIDs } = useSelector(
    (state: ReduxAppState) => ({
      permissionMap: state.directoryPermissions.permissionMap,
      permissionIDs:
        state.directoryPermissions.resourcePermissionsMap[resourceID] || [],
    })
  );
  //   const permissions = permissionIDs.map((pid) => permissionMap[pid]);
  const permissions = useMemo(() => {
    return permissionIDs.map((pid) => permissionMap[pid]);
  }, [permissionIDs, permissionMap]);
  console.log(`permissions`, permissions);

  useEffect(() => {
    const should_default_advanced_open = localStorage.getItem(
      LOCAL_STORAGE_DIRECTORY_PERMISSIONS_ADVANCED_OPEN
    );
    console.log(`should_default_advanced_open`, should_default_advanced_open);
    if (parseInt(should_default_advanced_open || "0")) {
      setIsAdvancedOpen(true);
    }
  }, []);

  const [dataSource, setDataSource] = useState<PermissionRecord[]>([]);

  useEffect(() => {
    if (permissions.length > 0) {
      const data = permissions.map((p) => ({
        key: p.id,
        who: p.grantee_name || p.granted_to,
        who_id: p.granted_to,
        canView: p.permission_types.includes(DirectoryPermissionType.VIEW),
        canEdit: p.permission_types.includes(DirectoryPermissionType.EDIT),
        canDelete: p.permission_types.includes(DirectoryPermissionType.DELETE),
        canInvite: p.permission_types.includes(DirectoryPermissionType.INVITE),
        canUpload: p.permission_types.includes(DirectoryPermissionType.UPLOAD),
        whenStart: p.begin_date_ms,
        whenEnd: p.expiry_date_ms,
        isEditing: false,
      }));

      setDataSource(data);
    }
  }, [permissions]);

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(shareUrl);
    message.success("Share URL copied to clipboard");
  };

  const handleCheckboxChange = (
    key: string,
    field: "canView" | "canEdit" | "canDelete" | "canInvite" | "canUpload",
    value: boolean
  ) => {
    const newData = [...dataSource];
    const index = newData.findIndex((item) => item.key === key);

    if (field === "canView") newData[index].canView = value;
    if (field === "canEdit") newData[index].canEdit = value;
    if (field === "canDelete") newData[index].canDelete = value;
    if (field === "canInvite") newData[index].canInvite = value;
    if (field === "canUpload") newData[index].canUpload = value;

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

  const toggleEditMode = (key: string) => {
    // const newData = [...dataSource];
    // const index = newData.findIndex((item) => item.key === key);
    // newData[index].isEditing = !newData[index].isEditing;
    // setDataSource(newData);
  };

  const handleRemove = (key: string) => {
    // const newData = dataSource.filter((item) => item.key !== key);
    // setDataSource(newData);
  };

  const handleAddPermission = () => {
    setIsAddDrawerOpen(true);
  };

  const getPermissionSummary = (record: PermissionRecord) => {
    const permissions = [];
    if (record.canView) permissions.push("View");
    if (record.canEdit) permissions.push("Edit");
    if (record.canDelete) permissions.push("Delete");
    if (record.canInvite) permissions.push("Invite");

    return permissions.length ? permissions.join(", ") : "No permissions";
  };

  const getDateRangeSummary = (record: PermissionRecord) => {
    if (record.key === "1") return "Always";

    if (!record.whenStart && !record.whenEnd) return "No time limit";

    const startDate = record.whenStart
      ? new Date(record.whenStart).toLocaleDateString()
      : "Any time";
    const endDate = record.whenEnd
      ? new Date(record.whenEnd).toLocaleDateString()
      : "No end date";

    return `${startDate} to ${endDate}`;
  };

  const columns = [
    {
      title: "Who",
      dataIndex: "who",
      key: "who",
      width: "45%",
      render: (text: string, record: PermissionRecord) => (
        <span style={{ fontSize: "16px" }}>
          {text} <TagCopy id={record.who_id} />
        </span>
      ),
    },
    {
      title: "Can",
      key: "can",
      width: "25%",
      render: (_: any, record: PermissionRecord) => {
        if (record.isEditing) {
          return (
            <div
              style={{ display: "flex", flexDirection: "column", gap: "8px" }}
            >
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
                  handleCheckboxChange(
                    record.key,
                    "canDelete",
                    e.target.checked
                  )
                }
                disabled={record.key === "1"}
              >
                <Text style={{ fontSize: "14px" }}>Delete</Text>
              </Checkbox>
              <Checkbox
                checked={record.canInvite}
                onChange={(e) =>
                  handleCheckboxChange(
                    record.key,
                    "canInvite",
                    e.target.checked
                  )
                }
                disabled={record.key === "1"}
              >
                <Text style={{ fontSize: "14px" }}>Invite</Text>
              </Checkbox>
            </div>
          );
        }

        return (
          <span style={{ fontSize: "14px" }}>
            {getPermissionSummary(record)}
          </span>
        );
      },
    },
    {
      title: "When",
      key: "when",
      width: "20%",
      render: (_: any, record: PermissionRecord) => {
        if (record.isEditing) {
          if (record.key === "1") {
            return <span style={{ fontSize: "16px" }}>Always</span>;
          }

          const startDate = record.whenStart ? dayjs(record.whenStart) : null;
          const endDate = record.whenEnd ? dayjs(record.whenEnd) : null;

          return (
            <div
              style={{ display: "flex", flexDirection: "column", gap: "8px" }}
            >
              <DatePicker
                style={{ width: "100%" }}
                placeholder="Start date"
                value={startDate}
                onChange={(date) => {
                  const endValue = endDate ? endDate.toDate() : null;
                  const startValue = date ? date.toDate() : null;
                  handleDateRangeChange(record.key, [startValue, endValue]);
                }}
              />
              <DatePicker
                style={{ width: "100%" }}
                placeholder="End date"
                value={endDate}
                onChange={(date) => {
                  const startValue = startDate ? startDate.toDate() : null;
                  const endValue = date ? date.toDate() : null;
                  handleDateRangeChange(record.key, [startValue, endValue]);
                }}
              />
            </div>
          );
        }

        return (
          <span style={{ fontSize: "14px" }}>
            {getDateRangeSummary(record)}
          </span>
        );
      },
    },
    {
      title: () => {
        return (
          <Button
            onClick={handleAddPermission}
            icon={<PlusOutlined style={{ fontSize: "20px" }} />}
          >
            Add
          </Button>
        );
      },
      key: "action",
      width: "10%",
      render: (_: any, record: PermissionRecord) => {
        const items: MenuProps["items"] = [
          {
            key: "1",
            label: (
              <a onClick={() => handleRemove(record.key)}>Copy Password</a>
            ),
          },
          {
            key: "2",
            label: (
              <a onClick={() => handleRemove(record.key)}>Copy Magic Link</a>
            ),
          },
          {
            key: "3",
            label: <a onClick={() => handleRemove(record.key)}>Remove</a>,
          },
        ];

        return (
          <Space>
            <Button
              type="text"
              icon={
                record.isEditing ? (
                  <CheckOutlined style={{ fontSize: "20px" }} />
                ) : (
                  <EditOutlined style={{ fontSize: "20px" }} />
                )
              }
              onClick={() => toggleEditMode(record.key)}
              disabled={record.key === "1"}
            />
            {record.isEditing ? (
              <CloseOutlined
                style={{ fontSize: "20px" }}
                onClick={() => toggleEditMode(record.key)}
              />
            ) : (
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
            )}
          </Space>
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
      footer={null}
    >
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
              style={{ marginLeft: 8 }}
            >
              Copy Link
            </Button>
          }
        />
      </div>

      {/* Advanced Section */}
      <details
        style={{ marginTop: "16px" }}
        open={isAdvancedOpen}
        onToggle={(e) => {
          setIsAdvancedOpen(e.currentTarget.open);
          console.log(`toggled open`, e.currentTarget.open);
          localStorage.setItem(
            LOCAL_STORAGE_DIRECTORY_PERMISSIONS_ADVANCED_OPEN,
            e.currentTarget.open ? "1" : "0"
          );
        }}
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
          Advanced
        </summary>

        <Input
          placeholder="Search by name"
          allowClear
          onChange={(e) => setSearchText(e.target.value)}
          style={{ marginTop: "16px", marginBottom: 8 }}
          prefix={<InfoCircleOutlined style={{ color: "#aaa" }} />}
          size="middle"
        />

        <Table
          dataSource={dataSource.filter((item) =>
            item.who.toLowerCase().includes(searchText.toLowerCase())
          )}
          columns={columns}
          pagination={false}
          rowKey="key"
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
      <DirectoryPermissionAddDrawer
        open={isAddDrawerOpen}
        onClose={() => setIsAddDrawerOpen(false)}
        onAddPermission={(p) =>
          console.log("directory permission to b created", p)
        }
        resourceID={resourceID}
      />
    </Drawer>
  );
};

export default DirectorySharingDrawer;

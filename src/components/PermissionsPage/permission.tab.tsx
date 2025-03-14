import React, { useEffect, useState } from "react";
import {
  Typography,
  Card,
  Button,
  Form,
  Input,
  Space,
  Tag,
  Row,
  Col,
  Tooltip,
  Badge,
  Popover,
  message,
  Tabs,
  FloatButton,
  Divider,
  Popconfirm,
  Switch,
  DatePicker,
  Checkbox,
} from "antd";
import {
  EditOutlined,
  InfoCircleOutlined,
  TeamOutlined,
  ClockCircleOutlined,
  UserOutlined,
  GlobalOutlined,
  FileTextOutlined,
  CopyOutlined,
  WalletOutlined,
  DownOutlined,
  UpOutlined,
  CodeOutlined,
  DeleteOutlined,
  EyeOutlined,
  UploadOutlined,
  UserAddOutlined,
  SettingOutlined,
  LockOutlined,
  UnlockOutlined,
  CalendarOutlined,
  FolderOutlined,
} from "@ant-design/icons";
import {
  DirectoryPermissionID,
  DirectoryPermissionType,
  GranteeID,
  IRequestDeleteDirectoryPermission,
  IRequestDeleteSystemPermission,
  IRequestUpdateDirectoryPermission,
  IRequestUpdateSystemPermission,
  SystemPermissionID,
  SystemPermissionType,
} from "@officexapp/types";
import { shortenAddress } from "../../framework/identity/constants";
import CodeBlock from "../CodeBlock";
import useScreenType from "react-screentype-hook";
import { useDispatch, useSelector } from "react-redux";
import { ReduxAppState } from "../../redux-offline/ReduxProvider";
import {
  deleteDirectoryPermissionAction,
  deleteSystemPermissionAction,
  updateDirectoryPermissionAction,
  updateSystemPermissionAction,
} from "../../redux-offline/permissions/permissions.actions";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import {
  DirectoryPermissionFEO,
  SystemPermissionFEO,
} from "../../redux-offline/permissions/permissions.reducer";
import TagCopy from "../TagCopy";

dayjs.extend(relativeTime);
const { Title, Paragraph, Text } = Typography;
const { TextArea } = Input;
const { RangePicker } = DatePicker;

// Constants for localStorage
const LOCAL_STORAGE_TOGGLE_REST_API_DOCS = "TOGGLE_REST_API_DOCS";

// Define the props for the PermissionTab component
interface PermissionTabProps {
  permission: SystemPermissionFEO | DirectoryPermissionFEO;
  permissionType: "system" | "directory";
  onDelete?: (permissionID: SystemPermissionID | DirectoryPermissionID) => void;
}

const PermissionTab: React.FC<PermissionTabProps> = ({
  permission,
  permissionType,
  onDelete,
}) => {
  const dispatch = useDispatch();
  const isOnline = useSelector((state: ReduxAppState) => state.offline?.online);
  const [isEditing, setIsEditing] = useState(false);
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);
  const [showCodeSnippets, setShowCodeSnippets] = useState(false);
  const [form] = Form.useForm();
  const screenType = useScreenType();

  // Check if permission is optimistic
  const isOptimistic = Boolean(permission._isOptimistic);
  const syncWarning = permission._syncWarning || "";
  const syncConflict = Boolean(permission._syncConflict);

  useEffect(() => {
    const _showCodeSnippets = localStorage.getItem(
      LOCAL_STORAGE_TOGGLE_REST_API_DOCS
    );
    if (_showCodeSnippets === "true") {
      setShowCodeSnippets(true);
    }
  }, []);

  const getPermissionTitle = (
    permission: SystemPermissionFEO | DirectoryPermissionFEO,
    permissionType: "system" | "directory"
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
            return "All Drives Permit";
          case "DISKS":
            return "All Disks Permit";
          case "CONTACTS":
            return "All Contacts Permit";
          case "GROUPS":
            return "All Groups Permit";
          case "WEBHOOKS":
            return "All Webhooks Permit";
          case "API_KEYS":
            return "All API Keys Permit";
          case "PERMISSIONS":
            return "All Permissions Permit";
          case "LABELS":
            return "All Labels Permit";
          default:
            return "System Permit";
        }
      }
      // Handle specific resource types
      else if (resourceId.startsWith("DriveID_")) {
        return "Drive Permit";
      } else if (resourceId.startsWith("DiskID_")) {
        return "Disk Permit";
      } else if (resourceId.startsWith("UserID_")) {
        return "User Permit";
      } else if (resourceId.startsWith("GroupID_")) {
        return "Group Permit";
      } else if (resourceId.startsWith("ApiKeyID_")) {
        return "API Key Permit";
      } else if (resourceId.startsWith("WebhookID_")) {
        return "Webhook Permit";
      } else if (resourceId.startsWith("LabelID_")) {
        return "Label Permit";
      } else if (
        resourceId.startsWith("SystemPermissionID_") ||
        resourceId.startsWith("DirectoryPermissionID_")
      ) {
        return "Permission Permit";
      } else {
        return "System Permit";
      }
    } else {
      // For directory permissions
      return "Directory Permit";
    }
  };

  const toggleEdit = () => {
    if (isEditing) {
      form.resetFields();
    } else {
      // Set form initial values
      const beginDate =
        permission.begin_date_ms > 0 ? dayjs(permission.begin_date_ms) : null;

      const expiryDate =
        permission.expiry_date_ms > 0 ? dayjs(permission.expiry_date_ms) : null;

      const dateRange =
        beginDate && expiryDate ? [beginDate, expiryDate] : null;

      form.setFieldsValue({
        permissionTypes: permission.permission_types,
        note: permission.note,
        dateRange: dateRange,
        inheritable:
          permissionType === "directory"
            ? (permission as DirectoryPermissionFEO).inheritable
            : undefined,
        externalId: permission.external_id,
        externalPayload: permission.external_payload,
      });
    }
    setIsEditing(!isEditing);
  };

  const handleSave = () => {
    form.validateFields().then((values) => {
      const now = dayjs().valueOf();
      let beginDate = permission.begin_date_ms;
      let expiryDate = permission.expiry_date_ms;

      if (values.dateRange && values.dateRange.length === 2) {
        beginDate = values.dateRange[0].valueOf();
        expiryDate = values.dateRange[1].valueOf();
      }

      if (permissionType === "system") {
        const updateData: IRequestUpdateSystemPermission = {
          id: permission.id as SystemPermissionID,
          permission_types: values.permissionTypes,
          begin_date_ms: beginDate,
          expiry_date_ms: expiryDate,
          note: values.note,
          external_id: values.externalId,
          external_payload: values.externalPayload,
        };
        console.log(`>>> Dispatching updateSystemPermissionAction`, updateData);
        dispatch(updateSystemPermissionAction(updateData));
      } else {
        const updateData: IRequestUpdateDirectoryPermission = {
          id: permission.id as DirectoryPermissionID,
          permission_types: values.permissionTypes,
          begin_date_ms: beginDate,
          expiry_date_ms: expiryDate,
          inheritable: values.inheritable,
          note: values.note,
          external_id: values.externalId,
          external_payload: values.externalPayload,
        };

        dispatch(updateDirectoryPermissionAction(updateData));
      }

      message.success(
        isOnline
          ? "Updating permission..."
          : "Queued permission update for when you're back online"
      );

      setIsEditing(false);
    });
  };

  const handleDelete = () => {
    console.log(
      `Deleting permission ${permission.id} with permissionType ${permissionType}`
    );
    if (permissionType === "system") {
      const deleteData: IRequestDeleteSystemPermission = {
        permission_id: permission.id as SystemPermissionID,
      };

      dispatch(deleteSystemPermissionAction(deleteData));
    } else {
      const deleteData: IRequestDeleteDirectoryPermission = {
        permission_id: permission.id as DirectoryPermissionID,
      };

      dispatch(deleteDirectoryPermissionAction(deleteData));
    }

    message.success(
      isOnline
        ? "Deleting permission..."
        : "Queued permission deletion for when you're back online"
    );

    if (onDelete) {
      onDelete(permission.id);
    }
  };

  const formatDate = (timestamp: number) => {
    if (timestamp <= 0) return "Never";
    return dayjs(timestamp).format("MMMM D, YYYY h:mm A");
  };

  const getRelativeTime = (timestamp: number) => {
    if (timestamp <= 0) return null;
    return dayjs(timestamp).fromNow();
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    message.success("Copied to clipboard");
  };

  // Get permission type options based on permission type
  const getPermissionTypeOptions = () => {
    if (permissionType === "system") {
      return [
        {
          label: "Create",
          value: SystemPermissionType.CREATE,
          icon: <EditOutlined />,
        },
        {
          label: "View",
          value: SystemPermissionType.VIEW,
          icon: <EyeOutlined />,
        },
        {
          label: "Edit",
          value: SystemPermissionType.EDIT,
          icon: <EditOutlined />,
        },
        {
          label: "Delete",
          value: SystemPermissionType.DELETE,
          icon: <DeleteOutlined />,
        },
        {
          label: "Invite",
          value: SystemPermissionType.INVITE,
          icon: <UserAddOutlined />,
        },
      ];
    } else {
      return [
        {
          label: "View",
          value: DirectoryPermissionType.VIEW,
          icon: <EyeOutlined />,
        },
        {
          label: "Upload",
          value: DirectoryPermissionType.UPLOAD,
          icon: <UploadOutlined />,
        },
        {
          label: "Edit",
          value: DirectoryPermissionType.EDIT,
          icon: <EditOutlined />,
        },
        {
          label: "Delete",
          value: DirectoryPermissionType.DELETE,
          icon: <DeleteOutlined />,
        },
        {
          label: "Invite",
          value: DirectoryPermissionType.INVITE,
          icon: <UserAddOutlined />,
        },
        {
          label: "Manage",
          value: DirectoryPermissionType.MANAGE,
          icon: <SettingOutlined />,
        },
      ];
    }
  };

  // Check if permission is currently active
  const isPermissionActive = () => {
    const now = dayjs().valueOf();
    const beginDate = permission.begin_date_ms;
    const expiryDate = permission.expiry_date_ms;

    return beginDate <= now && (expiryDate <= 0 || expiryDate > now);
  };

  // Format resource name and type
  const getResourceName = () => {
    if (permissionType === "system") {
      const sysPermission = permission as SystemPermissionFEO;
      if (sysPermission.resource_name) {
        return sysPermission.resource_name;
      }

      if (typeof sysPermission.resource_id === "object") {
        return sysPermission.resource_id;
      }

      return String(sysPermission.resource_id);
    } else {
      const dirPermission = permission as DirectoryPermissionFEO;
      return dirPermission.resource_path;
    }
  };

  // Render permission type labels
  const renderPermissionTypeLabels = (
    types: SystemPermissionType[] | DirectoryPermissionType[]
  ) => {
    const colorMap: Record<string, string> = {
      VIEW: "green",
      EDIT: "orange",
      DELETE: "red",
      CREATE: "orange",
      UPLOAD: "purple",
      INVITE: "cyan",
      MANAGE: "magenta",
    };

    return (
      <Space size={[0, 8]} wrap>
        {types.map((type) => (
          <Tag key={type} color={colorMap[type]} style={{ marginBottom: 8 }}>
            {type}
          </Tag>
        ))}
      </Space>
    );
  };

  const renderReadOnlyField = (
    label: string,
    value: string,
    icon: React.ReactNode
  ) => {
    return (
      <Input
        readOnly
        onClick={() => copyToClipboard(value)}
        value={value}
        style={{ marginBottom: 8, backgroundColor: "#fafafa" }}
        variant="borderless"
        addonBefore={
          <div
            style={{
              width: screenType.isMobile ? 120 : 90,
              display: "flex",
              alignItems: "center",
            }}
          >
            {icon}
            <span style={{ marginLeft: 8 }}>{label}</span>
          </div>
        }
        suffix={
          <Tooltip title="Copy to clipboard">
            <CopyOutlined
              onClick={() => copyToClipboard(value)}
              style={{ cursor: "pointer", color: "#1890ff" }}
            />
          </Tooltip>
        }
      />
    );
  };

  const renderCodeSnippets = () => {
    const jsCode_GET = `// Get a ${permissionType} permission by ID
const getPermission = async (permissionId) => {
  const response = await fetch(\`/permissions/${permissionType}/get/\${permissionId}\`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });
  return response.json();
};`;

    const jsCode_UPDATE = `// Update a ${permissionType} permission
const updatePermission = async (permissionData) => {
  const response = await fetch(\`/permissions/${permissionType}/update\`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(permissionData),
  });
  return response.json();
};`;

    const jsCode_DELETE = `// Delete a ${permissionType} permission
const deletePermission = async (permissionId) => {
  const response = await fetch(\`/permissions/${permissionType}/delete\`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ permission_id: permissionId }),
  });
  return response.json();
};`;

    return (
      <Card
        bordered={false}
        style={{
          boxShadow: "0 1px 2px rgba(0,0,0,0.03)",
          height: "100%",
        }}
        title="API Reference"
      >
        <Tabs defaultActiveKey="javascript">
          <Tabs.TabPane tab="JavaScript" key="javascript">
            <Space direction="vertical" size="large" style={{ width: "100%" }}>
              <CodeBlock
                code={jsCode_GET}
                language="javascript"
                title={`GET ${permissionType.charAt(0).toUpperCase() + permissionType.slice(1)} Permission`}
              />
              <CodeBlock
                code={jsCode_UPDATE}
                language="javascript"
                title={`UPDATE ${permissionType.charAt(0).toUpperCase() + permissionType.slice(1)} Permission`}
              />
              <CodeBlock
                code={jsCode_DELETE}
                language="javascript"
                title={`DELETE ${permissionType.charAt(0).toUpperCase() + permissionType.slice(1)} Permission`}
              />
            </Space>
          </Tabs.TabPane>
          <Tabs.TabPane tab="Prompt" key="prompt"></Tabs.TabPane>
          <Tabs.TabPane tab="Python" key="python"></Tabs.TabPane>
          <Tabs.TabPane tab="CURL" key="curl"></Tabs.TabPane>
        </Tabs>
      </Card>
    );
  };

  return (
    <div
      style={{
        padding: "0",
        height: "100%",
        width: "100%",
        overflowY: "auto",
        overflowX: "hidden",
        position: "relative",
      }}
    >
      <Row justify="space-between" align="middle" style={{ marginTop: 16 }}>
        <Col>
          {/* Empty col where Invite & Edit buttons used to be */}
          <p></p>
        </Col>
        <Col>
          <Space>
            {isEditing ? (
              <>
                <Button
                  size={screenType.isMobile ? "small" : "middle"}
                  onClick={toggleEdit}
                  type="default"
                >
                  Cancel
                </Button>
                <Button
                  size={screenType.isMobile ? "small" : "middle"}
                  onClick={handleSave}
                  type="primary"
                >
                  Save Changes
                </Button>
              </>
            ) : (
              <>
                <Button
                  icon={<EditOutlined />}
                  onClick={toggleEdit}
                  type="primary"
                  size={screenType.isMobile ? "small" : "middle"}
                  ghost
                  disabled={isOptimistic && syncConflict}
                >
                  Edit
                </Button>
                <Popover content="Coming soon">
                  <Button
                    icon={<CopyOutlined />}
                    type="primary"
                    size={screenType.isMobile ? "small" : "middle"}
                    disabled
                  >
                    Duplicate
                  </Button>
                </Popover>
              </>
            )}
          </Space>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col span={showCodeSnippets && !screenType.isMobile ? 16 : 24}>
          <Card
            bordered={false}
            style={{ boxShadow: "0 1px 2px rgba(0,0,0,0.03)" }}
          >
            {/* Optimistic update warning */}
            {isOptimistic && (
              <div style={{ marginBottom: 16 }}>
                <Card
                  style={{
                    borderColor: syncConflict ? "#ff4d4f" : "#faad14",
                  }}
                >
                  <Space align="start">
                    <InfoCircleOutlined
                      style={{ color: syncConflict ? "#ff4d4f" : "#faad14" }}
                    />
                    <div>
                      <Text
                        strong
                        style={{ color: syncConflict ? "#ff4d4f" : "#faad14" }}
                      >
                        {syncConflict ? "Sync Conflict" : "Pending Sync"}
                      </Text>
                      <br />
                      <Text>{syncWarning}</Text>
                    </div>
                  </Space>
                </Card>
              </div>
            )}

            {isEditing ? (
              <Form form={form} layout="vertical">
                <Form.Item
                  name="permissionTypes"
                  label="Permission Types"
                  rules={[
                    {
                      required: true,
                      message: "Please select at least one permission type",
                      type: "array",
                    },
                  ]}
                >
                  <Checkbox.Group
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "8px",
                    }}
                  >
                    {getPermissionTypeOptions().map((option) => (
                      <Checkbox key={option.value} value={option.value}>
                        <Space>
                          {option.icon}
                          {option.label}
                        </Space>
                      </Checkbox>
                    ))}
                  </Checkbox.Group>
                </Form.Item>

                {permissionType === "directory" && (
                  <Form.Item
                    name="inheritable"
                    label="Inherit to Child Folders/Files"
                    valuePropName="checked"
                  >
                    <Switch />
                  </Form.Item>
                )}

                <Form.Item name="dateRange" label="Active Date Range">
                  <RangePicker
                    showTime
                    format="YYYY-MM-DD HH:mm:ss"
                    placeholder={["Begin Date", "Expiry Date"]}
                    style={{ width: "100%" }}
                  />
                </Form.Item>

                <Form.Item name="note" label="Notes">
                  <TextArea
                    rows={3}
                    placeholder="Add notes about this permission"
                  />
                </Form.Item>

                <Divider />

                <Form.Item name="externalId" label="External ID">
                  <Input
                    placeholder="External identifier"
                    variant="borderless"
                    style={{ backgroundColor: "#fafafa" }}
                  />
                </Form.Item>

                <Form.Item name="externalPayload" label="External Payload">
                  <TextArea
                    rows={2}
                    placeholder='{"key": "value"}'
                    variant="borderless"
                    style={{ backgroundColor: "#fafafa" }}
                  />
                </Form.Item>

                <Divider />

                <Form.Item name="delete">
                  <Popconfirm
                    title="Are you sure you want to delete this permission?"
                    okText="Yes"
                    cancelText="No"
                    onConfirm={handleDelete}
                  >
                    <Button ghost type="primary" danger>
                      Delete Permission
                    </Button>
                  </Popconfirm>
                </Form.Item>
              </Form>
            ) : (
              <>
                <Row gutter={[16, 16]}>
                  <Col span={24}>
                    <Space
                      align="center"
                      size={16}
                      style={{
                        width: "100%",
                        justifyContent: "space-between",
                      }}
                    >
                      <Space align="center" size={16}>
                        {permissionType === "system" ? (
                          <div
                            style={{
                              width: 56,
                              height: 56,
                              background: "#f0f5ff",
                              borderRadius: "50%",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                            }}
                          >
                            <LockOutlined
                              style={{ fontSize: 24, color: "#1890ff" }}
                            />
                          </div>
                        ) : (
                          <div
                            style={{
                              width: 56,
                              height: 56,
                              background: "#f6ffed",
                              borderRadius: "50%",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                            }}
                          >
                            <FolderOutlined
                              style={{ fontSize: 24, color: "#52c41a" }}
                            />
                          </div>
                        )}
                        <div
                          style={{
                            display: "flex",
                            flexDirection: "column",
                            justifyContent: "center",
                            height: "64px",
                            marginTop: screenType.isMobile ? "-32px" : 0,
                          }}
                        >
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              marginBottom: "2px",
                            }}
                          >
                            <Title
                              level={4}
                              style={{ marginBottom: 0, marginRight: "12px" }}
                            >
                              {getPermissionTitle(permission, permissionType)}
                            </Title>
                            <TagCopy id={permission.id} />
                          </div>
                          <Space>
                            <Badge
                              status={
                                isPermissionActive() ? "success" : "warning"
                              }
                            />
                            <Text type="secondary">
                              {isPermissionActive()
                                ? permission.expiry_date_ms > 0
                                  ? `Expires ${getRelativeTime(permission.expiry_date_ms)}`
                                  : "No expiration"
                                : `Activates ${getRelativeTime(permission.begin_date_ms)}`}
                            </Text>
                          </Space>
                        </div>
                      </Space>
                    </Space>
                  </Col>
                </Row>

                <Row gutter={[16, 16]}>
                  <Col span={24}>
                    {!screenType.isMobile && (
                      <div
                        style={{
                          marginTop: 4,
                          display: "flex",
                          justifyContent: "flex-end",
                          flexWrap: "wrap",
                        }}
                      >
                        {permission.labels &&
                          permission.labels.map((label, index) => (
                            <Tag
                              key={index}
                              style={{ marginBottom: 4, marginLeft: 4 }}
                            >
                              {label}
                            </Tag>
                          ))}
                      </div>
                    )}

                    <div
                      style={{
                        marginBottom: screenType.isMobile ? 8 : 16,
                        marginTop: screenType.isMobile
                          ? 16
                          : permission.labels && permission.labels.length > 0
                            ? 0
                            : 32,
                      }}
                    >
                      <Card size="small" style={{ marginTop: 8 }}>
                        <Row gutter={[16, 16]}>
                          <Col span={24}>
                            <Space
                              direction="vertical"
                              style={{ width: "100%" }}
                            >
                              <div>
                                <Text type="secondary">Who:</Text>
                                <div style={{ marginTop: 4 }}>
                                  <UserOutlined />
                                  &nbsp; &nbsp;
                                  {
                                    (permission as SystemPermissionFEO)
                                      .grantee_name
                                  }
                                  &nbsp; &nbsp;
                                  <TagCopy
                                    id={permission.granted_to}
                                    style={{ fontSize: "0.7rem" }}
                                  />
                                </div>
                              </div>

                              <div>
                                <Text type="secondary">Can:</Text>
                                <div style={{ marginTop: 4 }}>
                                  {renderPermissionTypeLabels(
                                    permission.permission_types
                                  )}
                                </div>
                              </div>

                              <div>
                                <Text type="secondary">What:</Text>
                                <div style={{ marginTop: 4 }}>
                                  <GlobalOutlined />
                                  &nbsp; &nbsp;
                                  {(permission as any).resource_name ||
                                    permission.resource_id.slice(0, 20)}
                                  &nbsp; &nbsp;
                                  <TagCopy
                                    id={permission.resource_id}
                                    style={{ fontSize: "0.7rem" }}
                                  />
                                </div>
                              </div>

                              {permissionType === "directory" && (
                                <div>
                                  <Text type="secondary">Inheritable:</Text>
                                  <div style={{ marginTop: 4 }}>
                                    <Tag>
                                      {(permission as DirectoryPermissionFEO)
                                        .inheritable
                                        ? "Yes"
                                        : "No"}
                                    </Tag>
                                  </div>
                                </div>
                              )}

                              <div>
                                <Text type="secondary">Timeframe:</Text>
                                <div style={{ marginTop: 4 }}>
                                  <Space direction="vertical" size={0}>
                                    <div>
                                      <CalendarOutlined
                                        style={{ marginRight: 8 }}
                                      />
                                      <Text>
                                        Begin:{" "}
                                        {formatDate(permission.begin_date_ms)}
                                      </Text>
                                    </div>
                                    <div>
                                      <CalendarOutlined
                                        style={{ marginRight: 8 }}
                                      />
                                      <Text>
                                        Expiry:{" "}
                                        {formatDate(permission.expiry_date_ms)}
                                      </Text>
                                    </div>
                                  </Space>
                                </div>
                              </div>
                            </Space>
                          </Col>
                        </Row>
                      </Card>

                      {permission.note && (
                        <Card size="small" style={{ marginTop: 8 }}>
                          <Space align="start">
                            <GlobalOutlined style={{ marginRight: 8 }} />
                            <Text>{permission.note}</Text>
                          </Space>
                        </Card>
                      )}
                    </div>

                    {screenType.isMobile && permission.labels && (
                      <div
                        style={{
                          marginTop: 4,
                          display: "flex",
                          justifyContent: "flex-start",
                          flexWrap: "wrap",
                        }}
                      >
                        {permission.labels.map((label, index) => (
                          <Tag
                            key={index}
                            style={{ marginBottom: 4, marginLeft: 4 }}
                          >
                            {label}
                          </Tag>
                        ))}
                      </div>
                    )}

                    {/* Advanced section with details */}
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
                          display: "flex",
                          alignItems: "center",
                        }}
                      >
                        Advanced &nbsp;
                        {screenType.isMobile ? null : isAdvancedOpen ? (
                          <UpOutlined />
                        ) : (
                          <DownOutlined />
                        )}
                      </summary>

                      <div style={{ padding: "8px 0" }}>
                        {renderReadOnlyField(
                          "Permission ID",
                          permission.id,
                          <LockOutlined />
                        )}

                        {renderReadOnlyField(
                          "Granted By",
                          permission.granted_by,
                          <UserOutlined />
                        )}

                        {permission.external_id &&
                          renderReadOnlyField(
                            "External ID",
                            permission.external_id,
                            <FileTextOutlined />
                          )}

                        {permission.external_payload &&
                          renderReadOnlyField(
                            "External Payload",
                            permission.external_payload,
                            <FileTextOutlined />
                          )}

                        <div style={{ marginTop: "16px" }}>
                          <Space align="center">
                            <ClockCircleOutlined />
                            <Text type="secondary">
                              Created: {formatDate(permission.created_at)}
                            </Text>
                          </Space>
                          <div style={{ marginTop: 8 }}>
                            <Space align="center">
                              <ClockCircleOutlined />
                              <Text type="secondary">
                                Last Modified:{" "}
                                {formatDate(permission.last_modified_at)}
                              </Text>
                            </Space>
                          </div>
                        </div>
                      </div>
                    </details>
                  </Col>
                </Row>
              </>
            )}
          </Card>
        </Col>

        {/* Conditional rendering of code snippets column */}
        {showCodeSnippets && !screenType.isMobile && (
          <Col span={8}>{renderCodeSnippets()}</Col>
        )}
      </Row>

      {/* FloatButton for View Code at bottom right corner */}
      {!screenType.isMobile && (
        <FloatButton
          icon={<CodeOutlined />}
          type={showCodeSnippets ? "primary" : "default"}
          tooltip={showCodeSnippets ? "Hide Code" : "View Code"}
          onClick={() => {
            setShowCodeSnippets(!showCodeSnippets);
            localStorage.setItem(
              LOCAL_STORAGE_TOGGLE_REST_API_DOCS,
              JSON.stringify(!showCodeSnippets)
            );
          }}
          style={{ right: 24, bottom: 64 }}
        />
      )}
      <br />
      <br />
    </div>
  );
};

export default PermissionTab;

// src/components/DrivesPage/drive.tab.tsx

import React, { useEffect, useState } from "react";
import {
  Typography,
  Card,
  Button,
  Form,
  Input,
  Space,
  Tag,
  Avatar,
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
} from "antd";
import toast from "react-hot-toast";
import {
  EditOutlined,
  GlobalOutlined,
  TagOutlined,
  ClockCircleOutlined,
  DatabaseOutlined,
  FileTextOutlined,
  CopyOutlined,
  WalletOutlined,
  InfoCircleOutlined,
  DownOutlined,
  UpOutlined,
  CodeOutlined,
  TeamOutlined,
  LoadingOutlined,
  SyncOutlined,
} from "@ant-design/icons";
import {
  DriveFE,
  Drive,
  IRequestUpdateDrive,
  SystemPermissionType,
  DriveID,
} from "@officexapp/types";
import { LOCAL_STORAGE_TOGGLE_REST_API_DOCS } from "../../framework/identity/constants";
import CodeBlock from "../../components/CodeBlock";
import useScreenType from "react-screentype-hook";
import { useDispatch, useSelector } from "react-redux";
import { ReduxAppState } from "../../redux-offline/ReduxProvider";
import {
  deleteDriveAction,
  getDriveAction,
  updateDriveAction,
} from "../../redux-offline/drives/drives.actions";
import { DriveFEO } from "../../redux-offline/drives/drives.reducer";
import { useNavigate } from "react-router-dom";
import TagCopy from "../../components/TagCopy";

const { Title, Paragraph, Text } = Typography;
const { TextArea } = Input;

// Define the props for the DriveTab component
interface DriveTabProps {
  driveCache: DriveFEO;
  onSave?: (updatedDrive: Partial<DriveFEO>) => void;
  onDelete?: (driveID: DriveID) => void;
}

const DriveTab: React.FC<DriveTabProps> = ({
  driveCache,
  onSave,
  onDelete,
}) => {
  const dispatch = useDispatch();
  const isOnline = useSelector((state: ReduxAppState) => state.offline?.online);
  const [isEditing, setIsEditing] = useState(false);
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);
  const [showCodeSnippets, setShowCodeSnippets] = useState(false);
  const [form] = Form.useForm();
  const screenType = useScreenType();
  const navigate = useNavigate();
  const drive =
    useSelector(
      (state: ReduxAppState) => state.drives.driveMap[driveCache.id]
    ) || driveCache;

  useEffect(() => {
    const _showCodeSnippets = localStorage.getItem(
      LOCAL_STORAGE_TOGGLE_REST_API_DOCS
    );
    if (_showCodeSnippets === "true") {
      setShowCodeSnippets(true);
    }
  }, []);

  const toggleEdit = () => {
    if (isEditing) {
      form.resetFields();
    }
    setIsEditing(!isEditing);
  };

  const handleSave = () => {
    form.validateFields().then((values) => {
      // Determine which fields have changed
      const changedFields: IRequestUpdateDrive = { id: drive.id as DriveID };

      // Define the specific fields we care about
      const fieldsToCheck: (keyof IRequestUpdateDrive)[] = [
        "name",
        "public_note",
        "private_note",
        "host_url",
        "external_id",
        "external_payload",
      ];

      // Only check the fields we care about
      fieldsToCheck.forEach((field) => {
        // Skip if the field isn't in values
        if (!(field in values)) return;

        const valueFromForm = values[field];
        const originalValue = drive[field as keyof DriveFEO];

        // Only include fields that have changed
        if (valueFromForm !== originalValue) {
          // Handle empty strings - don't include them if they're just empty strings replacing undefined/null
          if (valueFromForm === "" && !originalValue) {
            return;
          }

          changedFields[field] = valueFromForm;
        }
      });

      // Only proceed if there are actual changes
      if (Object.keys(changedFields).length > 1 && changedFields.id) {
        // More than just the ID
        // Dispatch the update action if we're online
        dispatch(
          updateDriveAction({
            ...changedFields,
          })
        );

        toast.success(
          isOnline ? (
            <span>Updating drive...</span>
          ) : (
            <span>Queued drive update for when you're back online</span>
          )
        );

        // Call the onSave prop if provided (for backward compatibility)
        if (onSave) {
          onSave(changedFields);
        }
      } else {
        toast(<span>No changes detected</span>);
      }

      setIsEditing(false);
    });
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success(<span>Copied to clipboard</span>);
  };

  const renderReadOnlyField = (
    label: string,
    value: string,
    icon: React.ReactNode,
    navigationRoute?: string
  ) => {
    const handleClick = (e: React.MouseEvent) => {
      if (navigationRoute) {
        if (e.ctrlKey || e.metaKey) {
          // Open in a new tab with the full URL
          const url = `${window.location.origin}${navigationRoute}`;
          window.open(url, "_blank");
        } else {
          // Navigate using React Router
          navigate(navigationRoute);
        }
      } else {
        // Default behavior if no navigation route is provided
        copyToClipboard(value);
      }
    };
    return (
      <Input
        readOnly
        onClick={handleClick}
        value={value}
        style={{
          marginBottom: 8,
          backgroundColor: "#fafafa",
          cursor: "pointer",
        }}
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

  if (!drive) return null;

  const initialValues = {
    name: drive.name,
    host_url: drive.host_url,
    icp_principal: drive.icp_principal,
    public_note: drive.public_note || "",
    private_note: drive.private_note || "",
    external_id: drive.external_id || "",
    external_payload: drive.external_payload || "",
  };

  const renderCodeSnippets = () => {
    const jsCode_GET = `// Get Drive by ID
const getDrive = async (driveId) => {
  const response = await fetch(\`/api/drives/\${driveId}\`);
  return response.json();
};`;

    const jsCode_CREATE = `// Create a new Drive
const createDrive = async (driveData) => {
  const response = await fetch('/api/drives', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(driveData),
  });
  return response.json();
};`;

    const jsCode_UPDATE = `// Update Drive by ID
const updateDrive = async (driveId, updateData) => {
  const response = await fetch(\`/api/drives/\${driveId}\`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updateData),
  });
  return response.json();
};`;

    const jsCode_DELETE = `// Delete Drive by ID
const deleteDrive = async (driveId) => {
  const response = await fetch(\`/api/drives/\${driveId}\`, {
    method: 'DELETE',
  });
  return response.json();
};`;

    const jsCode_LIST = `// List all Drives with pagination
const listDrives = async (page = 1, limit = 10) => {
  const response = await fetch(\`/api/drives?page=\${page}&limit=\${limit}\`);
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
                title="GET Drive"
              />
              <CodeBlock
                code={jsCode_CREATE}
                language="javascript"
                title="CREATE Drive"
              />
              <CodeBlock
                code={jsCode_UPDATE}
                language="javascript"
                title="UPDATE Drive"
              />
              <CodeBlock
                code={jsCode_DELETE}
                language="javascript"
                title="DELETE Drive"
              />
              <CodeBlock
                code={jsCode_LIST}
                language="javascript"
                title="LIST Drives"
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

  const syncLatest = () => {
    dispatch(getDriveAction(drive.id));
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
                  disabled={
                    !drive.permission_previews.includes(
                      SystemPermissionType.EDIT
                    )
                  }
                >
                  Edit
                </Button>
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
            {isEditing ? (
              <Form form={form} layout="vertical" initialValues={initialValues}>
                <Form.Item
                  name="name"
                  label="Name"
                  rules={[{ required: true, message: "Please enter name" }]}
                >
                  <Input
                    placeholder="Drive name"
                    variant="borderless"
                    style={{ backgroundColor: "#fafafa" }}
                  />
                </Form.Item>

                <Form.Item name="host_url" label="Endpoint URL">
                  <Input
                    prefix={<GlobalOutlined />}
                    placeholder="https://example.com/endpoint"
                    variant="borderless"
                    style={{ backgroundColor: "#fafafa" }}
                  />
                </Form.Item>

                <Form.Item name="public_note" label="Public Note">
                  <TextArea
                    rows={2}
                    placeholder="Public information about this drive"
                    variant="borderless"
                    style={{ backgroundColor: "#fafafa" }}
                  />
                </Form.Item>

                {drive.permission_previews.includes(
                  SystemPermissionType.EDIT
                ) && (
                  <Form.Item
                    name="private_note"
                    label="Private Note"
                    extra="Only organization owners and editors can view this note"
                  >
                    <TextArea
                      rows={3}
                      placeholder="Private notes (only visible to owners and editors)"
                      variant="borderless"
                      style={{ backgroundColor: "#fafafa" }}
                    />
                  </Form.Item>
                )}

                <Form.Item name="external_id" label="External ID">
                  <Input
                    placeholder="External identifier"
                    variant="borderless"
                    style={{ backgroundColor: "#fafafa" }}
                  />
                </Form.Item>

                <Form.Item name="external_payload" label="External Payload">
                  <TextArea
                    rows={2}
                    placeholder="Additional data for external systems"
                    variant="borderless"
                    style={{ backgroundColor: "#fafafa" }}
                  />
                </Form.Item>

                <Divider />
                <Form.Item name="delete">
                  <Popconfirm
                    title="Are you sure you want to delete this drive?"
                    okText="Yes"
                    cancelText="No"
                    onConfirm={() => {
                      dispatch(deleteDriveAction({ id: drive.id }));
                      toast.success(
                        isOnline ? (
                          <span>Deleting drive...</span>
                        ) : (
                          <span>
                            Queued drive delete for when you're back online
                          </span>
                        )
                      );
                      if (onDelete) {
                        onDelete(drive.id);
                      }
                    }}
                  >
                    <Button
                      disabled={
                        !drive.permission_previews.includes(
                          SystemPermissionType.DELETE
                        )
                      }
                      ghost
                      type="primary"
                      danger
                    >
                      Delete Drive
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
                        <Avatar
                          size={64}
                          icon={<DatabaseOutlined />}
                          style={{ backgroundColor: "#1890ff" }}
                        >
                          {drive.name.charAt(0).toUpperCase()}
                        </Avatar>
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
                              level={3}
                              style={{ marginBottom: 0, marginRight: "12px" }}
                            >
                              {drive.name}
                            </Title>
                            <TagCopy id={drive.id} />

                            <div style={{ marginTop: "0px" }}>
                              {drive.isLoading ? (
                                <span>
                                  <LoadingOutlined />
                                  <i
                                    style={{
                                      marginLeft: 8,
                                      color: "rgba(0,0,0,0.2)",
                                    }}
                                  >
                                    Syncing
                                  </i>
                                </span>
                              ) : (
                                <SyncOutlined
                                  onClick={() => {
                                    toast(<span>Syncing latest...</span>);
                                    syncLatest();
                                  }}
                                  style={{ color: "rgba(0,0,0,0.2)" }}
                                />
                              )}
                            </div>
                          </div>
                          {drive.last_indexed_ms && (
                            <Space>
                              <Badge status="processing" />
                              <Text type="secondary">
                                Last Indexed:{" "}
                                {formatDate(drive.last_indexed_ms)}
                              </Text>
                            </Space>
                          )}
                        </div>
                      </Space>
                    </Space>
                  </Col>
                </Row>

                <Row gutter={[16, 16]}>
                  <Col span={24}>
                    {/* Always displayed fields */}

                    {!screenType.isMobile &&
                      drive.labels &&
                      drive.labels.length > 0 && (
                        <div
                          style={{
                            marginTop: 4,
                            display: "flex",
                            justifyContent: "flex-end",
                            flexWrap: "wrap",
                          }}
                        >
                          {drive.labels.map((label, index) => (
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
                          : drive.labels && drive.labels.length > 0
                            ? 0
                            : 32,
                      }}
                    >
                      {drive.host_url && (
                        <Card size="small" style={{ marginTop: 8 }}>
                          <GlobalOutlined style={{ marginRight: 8 }} />
                          <a
                            href={`${drive.host_url}/v1/drive/${drive.id}`}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            {`${drive.host_url}/v1/drive/${drive.id}`}
                          </a>
                        </Card>
                      )}

                      {drive.public_note && (
                        <Card size="small" style={{ marginTop: 8 }}>
                          <FileTextOutlined style={{ marginRight: 8 }} />
                          {drive.public_note}
                        </Card>
                      )}
                    </div>

                    {screenType.isMobile &&
                      drive.labels &&
                      drive.labels.length > 0 && (
                        <div
                          style={{
                            marginTop: 4,
                            display: "flex",
                            justifyContent: "flex-start",
                            flexWrap: "wrap",
                          }}
                        >
                          {drive.labels.map((label, index) => (
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
                          "Drive ID",
                          drive.id,
                          <DatabaseOutlined />
                        )}

                        {renderReadOnlyField(
                          "ICP Principal",
                          drive.icp_principal,
                          <WalletOutlined />
                        )}

                        {drive.private_note &&
                          drive.permission_previews.includes(
                            SystemPermissionType.EDIT
                          ) && (
                            <div style={{ marginTop: "16px" }}>
                              <Space align="center">
                                <Text strong>Private Note:</Text>
                                <Popover
                                  content="Only organization owners and editors can view this note"
                                  trigger="hover"
                                >
                                  <InfoCircleOutlined
                                    style={{ color: "#1890ff" }}
                                  />
                                </Popover>
                              </Space>
                              <Card
                                size="small"
                                style={{
                                  marginTop: 8,
                                  backgroundColor: "#fafafa",
                                }}
                              >
                                <FileTextOutlined style={{ marginRight: 8 }} />
                                {drive.private_note}
                              </Card>
                            </div>
                          )}

                        <div style={{ marginTop: "16px" }}>
                          <Space align="center">
                            <ClockCircleOutlined />
                            <Text type="secondary">
                              Created on {formatDate(drive.created_at)}
                            </Text>
                          </Space>
                          {drive.external_id && (
                            <div style={{ marginTop: 8 }}>
                              <Text type="secondary">
                                External ID: {drive.external_id}
                              </Text>
                            </div>
                          )}
                          {drive.external_payload && (
                            <div style={{ marginTop: 8 }}>
                              <Text type="secondary">
                                External Payload: {drive.external_payload}
                              </Text>
                            </div>
                          )}
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

export default DriveTab;

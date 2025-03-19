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
  DatePicker,
  message,
  Tabs,
  FloatButton,
  Divider,
  Popconfirm,
  Switch,
} from "antd";
import {
  EditOutlined,
  KeyOutlined,
  TagOutlined,
  ClockCircleOutlined,
  UserOutlined,
  GlobalOutlined,
  FileTextOutlined,
  CopyOutlined,
  InfoCircleOutlined,
  DownOutlined,
  UpOutlined,
  CodeOutlined,
  LockOutlined,
} from "@ant-design/icons";
import {
  ApiKeyFE,
  ApiKeyID,
  IRequestUpdateApiKey,
  SystemPermissionType,
} from "@officexapp/types";
import {
  LOCAL_STORAGE_TOGGLE_REST_API_DOCS,
  shortenAddress,
} from "../../framework/identity/constants";
import CodeBlock from "../../components/CodeBlock";
import useScreenType from "react-screentype-hook";
import { useDispatch, useSelector } from "react-redux";
import { ReduxAppState } from "../../redux-offline/ReduxProvider";
import {
  deleteApiKeyAction,
  updateApiKeyAction,
} from "../../redux-offline/api-keys/api-keys.actions";
import dayjs from "dayjs";
import { useNavigate } from "react-router-dom";

const { Title, Paragraph, Text } = Typography;
const { TextArea } = Input;

// Define the props for the ApiKeyTab component
interface ApiKeyTabProps {
  apiKey: ApiKeyFE;
  onSave?: (updatedApiKey: Partial<ApiKeyFE>) => void;
  onDelete?: (apiKeyID: ApiKeyID) => void;
}

const ApiKeyTab: React.FC<ApiKeyTabProps> = ({ apiKey, onSave, onDelete }) => {
  const dispatch = useDispatch();
  const isOnline = useSelector((state: ReduxAppState) => state.offline?.online);
  const [isEditing, setIsEditing] = useState(false);
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);
  const [showCodeSnippets, setShowCodeSnippets] = useState(false);
  const [neverExpires, setNeverExpires] = useState(apiKey.expires_at === -1);
  const [form] = Form.useForm();
  const screenType = useScreenType();
  const navigate = useNavigate();

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
      const changedFields: IRequestUpdateApiKey = { id: apiKey.id };

      // Calculate expiration
      let expiresAt: number | undefined = undefined;
      if (neverExpires) {
        expiresAt = -1;
      } else if (values.expires_at) {
        expiresAt = values.expires_at.valueOf();
      }

      // Only include fields that have changed
      if (values.name !== apiKey.name) {
        changedFields.name = values.name;
      }

      if (expiresAt !== apiKey.expires_at) {
        changedFields.expires_at = expiresAt;
      }

      if (values.is_revoked !== apiKey.is_revoked) {
        changedFields.is_revoked = values.is_revoked;
      }

      if (values.external_id !== (apiKey.external_id || "")) {
        changedFields.external_id = values.external_id || undefined;
      }

      if (values.external_payload !== (apiKey.external_payload || "")) {
        changedFields.external_payload = values.external_payload || undefined;
      }

      // Only proceed if there are actual changes
      if (Object.keys(changedFields).length > 1 && changedFields.id) {
        // More than just the ID
        // Dispatch the update action if we're online
        dispatch(updateApiKeyAction(changedFields));

        message.success(
          isOnline
            ? "Updating API key..."
            : "Queued API key update for when you're back online"
        );

        // Call the onSave prop if provided
        if (onSave) {
          onSave(changedFields);
        }
      } else {
        message.info("No changes detected");
      }

      setIsEditing(false);
    });
  };

  const formatDate = (timestamp: number) => {
    if (timestamp === -1) return "Never expires";
    return new Date(timestamp).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    message.success("Copied to clipboard");
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
              width: screenType.isMobile ? 120 : 100,
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

  const shortenKey = (key: string) => {
    if (!key || key.length < 10) return key;
    return `${key.slice(0, 6)}...${key.slice(-4)}`;
  };

  const initialValues = {
    name: apiKey.name,
    is_revoked: apiKey.is_revoked,
    expires_at: apiKey.expires_at === -1 ? null : dayjs(apiKey.expires_at),
    external_id: apiKey.external_id || "",
    external_payload: apiKey.external_payload || "",
  };

  const getStatusLabel = () => {
    if (apiKey.is_revoked) {
      return <Tag color="red">Revoked</Tag>;
    }

    if (apiKey.expires_at === -1) {
      return <Tag color="green">Active</Tag>;
    }

    const now = Date.now();
    if (apiKey.expires_at < now) {
      return <Tag color="orange">Expired</Tag>;
    }

    return <Tag color="green">Active</Tag>;
  };

  const renderCodeSnippets = () => {
    const jsCode_GET = `// Get API Key
const response = await fetch(\`/api_keys/get/\${apiKeyId}\`, {
  method: 'GET',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer YOUR_ACCESS_TOKEN'
  }
});
const data = await response.json();`;

    const jsCode_CREATE = `// Create API Key
const response = await fetch('/api_keys/create', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer YOUR_ACCESS_TOKEN'
  },
  body: JSON.stringify({
    name: 'My API Key',
    expires_at: -1, // Never expires, or timestamp
    external_id: 'external-identifier', // Optional
    external_payload: '{"custom":"data"}' // Optional
  })
});
const data = await response.json();`;

    const jsCode_UPDATE = `// Update API Key
const response = await fetch('/api_keys/update', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer YOUR_ACCESS_TOKEN'
  },
  body: JSON.stringify({
    id: '${apiKey.id}',
    name: 'Updated Name', // Optional
    expires_at: ${apiKey.expires_at}, // Optional
    is_revoked: false, // Optional
    external_id: '${apiKey.external_id || "external-id"}', // Optional
    external_payload: '${apiKey.external_payload || "{}"}' // Optional
  })
});
const data = await response.json();`;

    const jsCode_DELETE = `// Delete API Key
const response = await fetch('/api_keys/delete', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer YOUR_ACCESS_TOKEN'
  },
  body: JSON.stringify({
    id: '${apiKey.id}'
  })
});
const data = await response.json();`;

    const jsCode_LIST = `// List API Keys
const response = await fetch(\`/api_keys/list/\${userId}\`, {
  method: 'GET',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer YOUR_ACCESS_TOKEN'
  }
});
const data = await response.json();`;

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
                title="GET API Key"
              />
              <CodeBlock
                code={jsCode_CREATE}
                language="javascript"
                title="CREATE API Key"
              />
              <CodeBlock
                code={jsCode_UPDATE}
                language="javascript"
                title="UPDATE API Key"
              />
              <CodeBlock
                code={jsCode_DELETE}
                language="javascript"
                title="DELETE API Key"
              />
              <CodeBlock
                code={jsCode_LIST}
                language="javascript"
                title="LIST API Keys"
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
          {/* Empty col where buttons used to be */}
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
                    !apiKey.permission_previews.includes(
                      SystemPermissionType.EDIT
                    )
                  }
                >
                  Edit
                </Button>
                <Popconfirm
                  title="Do you want to revoke this API key?"
                  description="This will immediately prevent this key from being used."
                  onConfirm={() => {
                    dispatch(
                      updateApiKeyAction({
                        id: apiKey.id,
                        is_revoked: true,
                      })
                    );
                    message.success("API key revoked");
                  }}
                  okText="Yes"
                  cancelText="No"
                  disabled={apiKey.is_revoked}
                >
                  <Button
                    icon={<LockOutlined />}
                    size={screenType.isMobile ? "small" : "middle"}
                    danger
                    disabled={
                      apiKey.is_revoked ||
                      !apiKey.permission_previews.includes(
                        SystemPermissionType.EDIT
                      )
                    }
                  >
                    Revoke
                  </Button>
                </Popconfirm>
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
                    placeholder="API key name"
                    variant="borderless"
                    style={{ backgroundColor: "#fafafa" }}
                  />
                </Form.Item>

                <Form.Item name="is_revoked" label="Status">
                  <Switch
                    checked={!form.getFieldValue("is_revoked")}
                    onChange={(checked) => {
                      form.setFieldsValue({ is_revoked: !checked });
                    }}
                    checkedChildren="Active"
                    unCheckedChildren="Revoked"
                  />
                </Form.Item>

                <Form.Item label="Expiration">
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      marginBottom: 16,
                    }}
                  >
                    <Switch
                      checked={neverExpires}
                      onChange={(checked) => {
                        setNeverExpires(checked);
                        if (checked) {
                          form.setFieldsValue({ expires_at: null });
                        }
                      }}
                    />
                    <span style={{ marginLeft: 8 }}>Never Expires</span>
                  </div>

                  {!neverExpires && (
                    <Form.Item name="expires_at" noStyle>
                      <DatePicker
                        showTime
                        placeholder="Select expiry date and time"
                        style={{ width: "100%" }}
                      />
                    </Form.Item>
                  )}
                </Form.Item>

                {/* Advanced section in edit mode */}
                <div style={{ marginTop: "16px" }}>
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
                      Advanced Details
                    </summary>

                    <div style={{ padding: "12px 0" }}>
                      <Form.Item name="external_id" label="External ID">
                        <Input
                          prefix={<GlobalOutlined />}
                          placeholder="External identifier"
                          variant="borderless"
                          style={{ backgroundColor: "#fafafa" }}
                        />
                      </Form.Item>

                      <Form.Item
                        name="external_payload"
                        label="External Payload"
                      >
                        <TextArea
                          rows={3}
                          placeholder="Additional data for external systems (JSON, etc.)"
                          variant="borderless"
                          style={{ backgroundColor: "#fafafa" }}
                        />
                      </Form.Item>
                    </div>
                  </details>
                </div>

                <Divider />
                <Form.Item name="delete">
                  <Popconfirm
                    title="Are you sure you want to delete this API key?"
                    okText="Yes"
                    cancelText="No"
                    onConfirm={() => {
                      dispatch(deleteApiKeyAction({ id: apiKey.id }));
                      message.success(
                        isOnline
                          ? "Deleting API key..."
                          : "Queued API key delete for when you're back online"
                      );
                      if (onDelete) {
                        onDelete(apiKey.id);
                      }
                    }}
                  >
                    <Button
                      disabled={
                        !apiKey.permission_previews.includes(
                          SystemPermissionType.DELETE
                        )
                      }
                      ghost
                      type="primary"
                      danger
                    >
                      Delete API Key
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
                          icon={<KeyOutlined />}
                          style={{ backgroundColor: "#1890ff" }}
                        />
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
                              {apiKey.name}
                            </Title>
                            <Tag>
                              {shortenAddress(
                                apiKey.id.replace("ApiKeyID_", "")
                              )}
                            </Tag>
                            {getStatusLabel()}
                          </div>
                          <Space style={{ marginTop: "4px" }}>
                            {apiKey.user_name && (
                              <Text type="secondary">
                                Owned by {apiKey.user_name}{" "}
                                <code style={{ fontSize: "0.6rem" }}>
                                  {shortenAddress(
                                    apiKey.user_id.replace("UserID_", "")
                                  )}
                                </code>
                              </Text>
                            )}
                          </Space>
                        </div>
                      </Space>
                    </Space>
                  </Col>
                </Row>

                <Row gutter={[16, 16]}>
                  <Col span={24}>
                    {/* Always displayed fields */}
                    {!screenType.isMobile && (
                      <div
                        style={{
                          marginTop: 4,
                          display: "flex",
                          justifyContent: "flex-end",
                          flexWrap: "wrap",
                        }}
                      >
                        {apiKey.labels &&
                          apiKey.labels.map((label, index) => (
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
                          : apiKey.labels && apiKey.labels.length > 0
                            ? 0
                            : 32,
                      }}
                    >
                      {/* Key value display */}
                      <Card size="small" style={{ marginTop: 8 }}>
                        <Space>
                          <Input.Password
                            readOnly
                            value={apiKey.value}
                            style={{ width: 300 }}
                          />
                          <Button
                            type="text"
                            icon={<CopyOutlined />}
                            onClick={() => copyToClipboard(apiKey.value)}
                            size="small"
                          >
                            Copy
                          </Button>
                        </Space>
                      </Card>
                    </div>

                    {screenType.isMobile && apiKey.labels && (
                      <div
                        style={{
                          marginTop: 4,
                          display: "flex",
                          justifyContent: "flex-start",
                          flexWrap: "wrap",
                        }}
                      >
                        {apiKey.labels.map((label, index) => (
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
                          "API Key ID",
                          apiKey.id,
                          <KeyOutlined />
                        )}

                        {apiKey.user_id &&
                          renderReadOnlyField(
                            "User ID",
                            apiKey.user_id,
                            <UserOutlined />,
                            `/resources/contacts/${apiKey.user_id}`
                          )}

                        {apiKey.external_id &&
                          renderReadOnlyField(
                            "External ID",
                            apiKey.external_id,
                            <GlobalOutlined />
                          )}

                        {apiKey.external_payload && (
                          <div style={{ marginTop: "16px" }}>
                            <Space align="center">
                              <Text strong>External Payload:</Text>
                            </Space>
                            <Card
                              size="small"
                              style={{
                                marginTop: 8,
                                backgroundColor: "#fafafa",
                              }}
                            >
                              <FileTextOutlined style={{ marginRight: 8 }} />
                              {apiKey.external_payload}
                            </Card>
                          </div>
                        )}

                        <div style={{ marginTop: "16px" }}>
                          <Space align="center">
                            <ClockCircleOutlined />
                            <Text type="secondary">
                              Created on {formatDate(apiKey.created_at)}
                            </Text>
                          </Space>
                        </div>

                        <div style={{ marginTop: "8px" }}>
                          <Space align="center">
                            <ClockCircleOutlined />
                            <Text type="secondary">
                              Expires on {formatDate(apiKey.expires_at)}
                            </Text>
                          </Space>
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

export default ApiKeyTab;

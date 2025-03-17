// src/components/WebhooksPage/webhook.tab.tsx

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
  Select,
} from "antd";
import {
  EditOutlined,
  LinkOutlined,
  ApiOutlined,
  TagOutlined,
  ClockCircleOutlined,
  GlobalOutlined,
  FileTextOutlined,
  CopyOutlined,
  InfoCircleOutlined,
  DownOutlined,
  UpOutlined,
  CodeOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  AimOutlined,
} from "@ant-design/icons";
import {
  WebhookFE,
  IRequestUpdateWebhook,
  SystemPermissionType,
  WebhookID,
  WebhookEventLabel,
} from "@officexapp/types";
import { LOCAL_STORAGE_TOGGLE_REST_API_DOCS } from "../../framework/identity/constants";
import CodeBlock from "../CodeBlock";
import useScreenType from "react-screentype-hook";
import { useDispatch, useSelector } from "react-redux";
import { ReduxAppState } from "../../redux-offline/ReduxProvider";
import {
  deleteWebhookAction,
  updateWebhookAction,
} from "../../redux-offline/webhooks/webhooks.actions";
import TagCopy from "../TagCopy";
import { useNavigate } from "react-router-dom";

const { Title, Paragraph, Text } = Typography;
const { TextArea } = Input;
const { Option } = Select;

// Mock webhook event types for dropdown
const WEBHOOK_EVENT_TYPES = [
  { value: "document.created", label: "Document Created" },
  { value: "document.updated", label: "Document Updated" },
  { value: "document.deleted", label: "Document Deleted" },
  { value: "contact.created", label: "Contact Created" },
  { value: "contact.updated", label: "Contact Updated" },
  { value: "contact.deleted", label: "Contact Deleted" },
];

// Define the props for the WebhookTab component
interface WebhookTabProps {
  webhook: WebhookFE;
  onSave?: (updatedWebhook: Partial<WebhookFE>) => void;
  onDelete?: (webhookID: WebhookID) => void;
}

const WebhookTab: React.FC<WebhookTabProps> = ({
  webhook,
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
      const changedFields: IRequestUpdateWebhook = { id: webhook.id };

      // Define the specific fields we care about
      const fieldsToCheck: (keyof IRequestUpdateWebhook)[] = [
        "url",
        "name",
        "description",
        "signature",
        "active",
        "filters",
        "external_id",
        "external_payload",
      ];

      // Only check the fields we care about
      fieldsToCheck.forEach((field) => {
        // Skip if the field isn't in values
        if (!(field in values)) return;

        const valueFromForm = values[field];
        const originalValue = webhook[field as keyof WebhookFE];

        // Only include fields that have changed
        if (valueFromForm !== originalValue) {
          // Handle empty strings - don't include them if they're just empty strings replacing undefined/null
          if (valueFromForm === "" && !originalValue) {
            return;
          }

          // @ts-ignore
          changedFields[field] = valueFromForm;
        }
      });

      // Only proceed if there are actual changes
      if (Object.keys(changedFields).length > 1 && changedFields.id) {
        // More than just the ID
        // Dispatch the update action if we're online
        dispatch(
          updateWebhookAction({
            ...changedFields,
          })
        );

        message.success(
          isOnline
            ? "Updating webhook..."
            : "Queued webhook update for when you're back online"
        );

        // Call the onSave prop if provided (for backward compatibility)
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
    return new Date(timestamp).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    message.success("Copied to clipboard");
  };

  // Function to shorten URLs for display
  const shortenUrl = (url: string) => {
    try {
      const parsed = new URL(url);
      return `${parsed.hostname}${parsed.pathname.length > 15 ? parsed.pathname.substring(0, 15) + "..." : parsed.pathname}`;
    } catch (e) {
      return url;
    }
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
              width: screenType.isMobile ? 130 : 110,
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

  const initialValues = {
    url: webhook.url,
    name: webhook.name,
    description: webhook.description,
    signature: webhook.signature,
    active: webhook.active,
    filters: webhook.filters,
    external_id: webhook.external_id || "",
    external_payload: webhook.external_payload || "",
  };

  const renderCodeSnippets = () => {
    const jsCode_GET = `
// Get a webhook by ID
async function getWebhook(webhookId) {
  const response = await fetch(\`/api/webhooks/\${webhookId}\`, {
    method: 'GET',
    headers: {
      'Authorization': 'Bearer YOUR_API_TOKEN'
    }
  });
  return response.json();
}`;

    const jsCode_CREATE = `
// Create a new webhook
async function createWebhook(webhookData) {
  const response = await fetch('/api/webhooks', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer YOUR_API_TOKEN'
    },
    body: JSON.stringify({
      url: webhookData.url,
      event: webhookData.event,
      description: webhookData.description,
      active: true
    })
  });
  return response.json();
}`;

    const jsCode_UPDATE = `
// Update an existing webhook
async function updateWebhook(webhookId, updates) {
  const response = await fetch(\`/api/webhooks/\${webhookId}\`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer YOUR_API_TOKEN'
    },
    body: JSON.stringify(updates)
  });
  return response.json();
}`;

    const jsCode_DELETE = `
// Delete a webhook
async function deleteWebhook(webhookId) {
  const response = await fetch(\`/api/webhooks/\${webhookId}\`, {
    method: 'DELETE',
    headers: {
      'Authorization': 'Bearer YOUR_API_TOKEN'
    }
  });
  return response.json();
}`;

    const jsCode_LIST = `
// List all webhooks
async function listWebhooks(page = 1, limit = 10) {
  const response = await fetch(\`/api/webhooks?page=\${page}&limit=\${limit}\`, {
    method: 'GET',
    headers: {
      'Authorization': 'Bearer YOUR_API_TOKEN'
    }
  });
  return response.json();
}`;

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
                title="GET Webhook"
              />
              <CodeBlock
                code={jsCode_CREATE}
                language="javascript"
                title="CREATE Webhook"
              />
              <CodeBlock
                code={jsCode_UPDATE}
                language="javascript"
                title="UPDATE Webhook"
              />
              <CodeBlock
                code={jsCode_DELETE}
                language="javascript"
                title="DELETE Webhook"
              />
              <CodeBlock
                code={jsCode_LIST}
                language="javascript"
                title="LIST Webhooks"
              />
            </Space>
          </Tabs.TabPane>
          <Tabs.TabPane tab="CURL" key="curl"></Tabs.TabPane>
          <Tabs.TabPane tab="Python" key="python"></Tabs.TabPane>
        </Tabs>
      </Card>
    );
  };

  const determineLinkForResource = (resource_id: string) => {
    if (resource_id.startsWith("UserID_")) {
      return `/resources/contacts/${resource_id}`;
    } else if (resource_id.startsWith("GroupID_")) {
      return `/resources/groups/${resource_id}`;
    } else if (resource_id.startsWith("SystemPermissionID_")) {
      return `/resources/permissions/system/${resource_id}`;
    } else if (resource_id.startsWith("DirectoryPermissionID_")) {
      return `/resources/permissions/directory/${resource_id}`;
    } else if (resource_id.startsWith("Disk_ID_")) {
      return `/resources/disks/${resource_id}`;
    } else if (resource_id.startsWith("DriveID_")) {
      return `/resources/drives/${resource_id}`;
    } else if (resource_id.startsWith("LabelID_")) {
      return `/resources/labels/${resource_id}`;
    } else if (resource_id.startsWith("WebhookID_")) {
      return `/resources/webhooks/${resource_id}`;
    } else if (resource_id.startsWith("ApiKeyID_")) {
      return `/resources/api-keys/${resource_id}`;
    } else {
      return undefined;
    }
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
                    !webhook.permission_previews.includes(
                      SystemPermissionType.EDIT
                    )
                  }
                >
                  Edit
                </Button>
                <a
                  href="https://webhook.cool/?ref=officexapp"
                  rel="noopener noreferrer"
                  target="_blank"
                >
                  <Button
                    icon={<ApiOutlined />}
                    type="primary"
                    size={screenType.isMobile ? "small" : "middle"}
                  >
                    Test Webhook
                  </Button>
                </a>
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
                  name="url"
                  label="Endpoint URL"
                  rules={[
                    { required: true, message: "Please enter webhook URL" },
                    {
                      type: "url",
                      message: "Please enter a valid URL",
                    },
                  ]}
                >
                  <Input
                    prefix={<LinkOutlined />}
                    placeholder="https://example.com/webhook"
                    variant="borderless"
                    style={{ backgroundColor: "#fafafa" }}
                  />
                </Form.Item>

                <Form.Item name="name" label="Name">
                  <Input
                    prefix={<InfoCircleOutlined />}
                    placeholder="Name"
                    variant="borderless"
                    style={{ backgroundColor: "#fafafa" }}
                  />
                </Form.Item>

                <Form.Item name="description" label="Description">
                  <Input
                    prefix={<InfoCircleOutlined />}
                    placeholder="Description"
                    variant="borderless"
                    style={{ backgroundColor: "#fafafa" }}
                  />
                </Form.Item>

                <Form.Item name="active" label="Active" valuePropName="checked">
                  <Switch />
                </Form.Item>

                {/* Additional fields for advanced section */}
                <Form.Item name="signature" label="Signature">
                  <Input
                    prefix={<ApiOutlined />}
                    placeholder="Webhook signature"
                    variant="borderless"
                    style={{ backgroundColor: "#fafafa" }}
                  />
                </Form.Item>

                <Form.Item name="filters" label="Filters">
                  <TextArea
                    rows={2}
                    placeholder='{"key": "value"}'
                    variant="borderless"
                    style={{ backgroundColor: "#fafafa" }}
                    disabled
                  />
                </Form.Item>

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
                    placeholder='{"key": "value"}'
                    variant="borderless"
                    style={{ backgroundColor: "#fafafa" }}
                  />
                </Form.Item>

                <Divider />
                <Form.Item name="delete">
                  <Popconfirm
                    title="Are you sure you want to delete this webhook?"
                    okText="Yes"
                    cancelText="No"
                    onConfirm={() => {
                      dispatch(deleteWebhookAction({ id: webhook.id }));
                      message.success(
                        isOnline
                          ? "Deleting webhook..."
                          : "Queued webhook delete for when you're back online"
                      );
                      if (onDelete) {
                        onDelete(webhook.id);
                      }
                    }}
                  >
                    <Button
                      disabled={
                        !webhook.permission_previews.includes(
                          SystemPermissionType.DELETE
                        )
                      }
                      ghost
                      type="primary"
                      danger
                    >
                      Delete Webhook
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
                        <div
                          style={{
                            width: 64,
                            height: 64,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            backgroundColor: "#1890ff",
                            borderRadius: "50%",
                            color: "white",
                            fontSize: 32,
                          }}
                        >
                          <ApiOutlined />
                        </div>
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
                              {webhook.name || shortenUrl(webhook.url)}
                            </Title>
                            <TagCopy id={webhook.id} />
                          </div>
                          <Space>
                            <Badge
                              status={webhook.active ? "success" : "error"}
                            />
                            <Text type="secondary">
                              {webhook.active ? "Active" : "Inactive"}
                            </Text>
                            <Tag color="purple">{webhook.event}</Tag>
                          </Space>
                        </div>
                      </Space>
                    </Space>
                  </Col>
                </Row>

                <Row gutter={[16, 16]}>
                  <Col span={24}>
                    {/* Always displayed fields */}

                    {!screenType.isMobile &&
                      webhook.labels &&
                      webhook.labels.length > 0 && (
                        <div
                          style={{
                            marginTop: 4,
                            display: "flex",
                            justifyContent: "flex-end",
                            flexWrap: "wrap",
                          }}
                        >
                          {webhook.labels.map((label, index) => (
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
                          : webhook.labels && webhook.labels.length > 0
                            ? 0
                            : 32,
                      }}
                    >
                      <Card size="small" style={{ marginTop: 8 }}>
                        <GlobalOutlined style={{ marginRight: 8 }} />
                        {webhook.description || "No description provided"}
                      </Card>
                    </div>

                    {screenType.isMobile &&
                      webhook.labels &&
                      webhook.labels.length > 0 && (
                        <div
                          style={{
                            marginTop: 4,
                            display: "flex",
                            justifyContent: "flex-start",
                            flexWrap: "wrap",
                          }}
                        >
                          {webhook.labels.map((label, index) => (
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
                          "Resource",
                          webhook.alt_index,
                          <AimOutlined />,
                          determineLinkForResource(webhook.alt_index)
                        )}

                        {renderReadOnlyField(
                          "Full URL",
                          webhook.url,
                          <LinkOutlined />
                        )}

                        {renderReadOnlyField(
                          "Webhook ID",
                          webhook.id,
                          <CodeOutlined />
                        )}

                        {webhook.signature &&
                          renderReadOnlyField(
                            "Signature",
                            webhook.signature,
                            <ApiOutlined />
                          )}

                        {webhook.filters &&
                          renderReadOnlyField(
                            "Filters",
                            webhook.filters,
                            <FileTextOutlined />
                          )}

                        {webhook.external_id &&
                          renderReadOnlyField(
                            "External ID",
                            webhook.external_id,
                            <CodeOutlined />
                          )}

                        {webhook.external_payload && (
                          <div style={{ marginTop: "16px" }}>
                            <Space align="center">
                              <Text strong>External Payload:</Text>
                              <Popover
                                content="Additional data for external integrations"
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
                              {webhook.external_payload}
                            </Card>
                          </div>
                        )}

                        <div style={{ marginTop: "16px" }}>
                          <Space align="center">
                            <ClockCircleOutlined />
                            <Text type="secondary">
                              Created on {formatDate(webhook.created_at)}
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

export default WebhookTab;

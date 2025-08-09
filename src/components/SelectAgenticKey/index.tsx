import React, { useCallback, useState, useRef, useEffect } from "react";
import {
  Button,
  Layout,
  Typography,
  Space,
  Card,
  Radio,
  Avatar,
  Tag,
  message,
  Modal,
  Form,
  Input,
  Switch,
  DatePicker,
  Tooltip,
  Badge,
  Divider,
  Alert,
} from "antd";
import type { ApiKeyFE, IRequestCreateApiKey } from "@officexapp/types";
import { SystemPermissionType } from "@officexapp/types";
import { useDispatch, useSelector } from "react-redux";
import { ReduxAppState } from "../../redux-offline/ReduxProvider";
import {
  checkApiKeyTablePermissionsAction,
  listApiKeysAction,
  createApiKeyAction,
} from "../../redux-offline/api-keys/api-keys.actions";
import {
  KeyOutlined,
  PlusOutlined,
  InfoCircleOutlined,
  ArrowRightOutlined,
  LoadingOutlined,
  TagOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  SafetyOutlined,
  GlobalOutlined,
} from "@ant-design/icons";
import useScreenType from "react-screentype-hook";
import { useIdentitySystem } from "../../framework/identity";
import { pastLastCheckedCacheLimit } from "../../api/helpers";
import { useLocation, useNavigate } from "react-router-dom";
import { v4 as uuidv4 } from "uuid";
import dayjs from "dayjs";
import TagCopy from "../TagCopy";

/**
 * Test This Page
 * // http://localhost:5173/org/current/grant-agentic-key?tracer=abc123&redirect_url=http%3A%2F%2Flocalhost%3A5174
 
// Step 1: Encode the redirect URL
const redirectUrl = "http://localhost:5174";
const encodedRedirectUrl = encodeURIComponent(redirectUrl);

// Step 2: Construct the full URL
const selectKeyUrl = `http://localhost:5173/org/current/grant-agentic-key?tracer=abc123&redirect_url=${encodedRedirectUrl}`;

console.log(selectKeyUrl);
// Output: http://localhost:5173/org/current/grant-agentic-key?tracer=abc123&redirect_url=http%3A%2F%2Flocalhost%3A5174

 */

const { Content } = Layout;
const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;

const SelectAgenticKey: React.FC = () => {
  const dispatch = useDispatch();
  const location = useLocation();
  const navigate = useNavigate();
  const screenType = useScreenType();
  const { currentProfile, currentOrg } = useIdentitySystem();

  const [selectedKeyId, setSelectedKeyId] = useState<string | null>(null);
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  // Form state for new key creation
  const [neverExpires, setNeverExpires] = useState(true);
  const [expiryDate, setExpiryDate] = useState<dayjs.Dayjs | null>(null);
  const [labels, setLabels] = useState<string[]>([]);
  const [inputVisible, setInputVisible] = useState(false);
  const [inputValue, setInputValue] = useState("");

  const {
    apiKeys,
    tablePermissions,
    lastChecked,
    loading: apiKeysLoading,
  } = useSelector((state: ReduxAppState) => ({
    apiKeys: state.apikeys.apikeys,
    tablePermissions: state.apikeys.tablePermissions,
    lastChecked: state.apikeys.lastChecked,
    loading: state.apikeys.loading,
  }));

  // Get redirect URL from query params and extract app name from domain
  const searchParams = new URLSearchParams(location.search);
  const redirectUrl = searchParams.get("redirect_url");
  const tracer = searchParams.get("tracer");

  // Extract app name from redirect URL domain
  const getAppNameFromUrl = (url: string | null): string => {
    if (!url) return "Third-party Application";
    try {
      const decodedUrl = decodeURIComponent(url);
      const domain = new URL(decodedUrl).hostname;
      // Remove www. prefix but keep the rest of the domain
      const cleanDomain = domain.replace(/^www\./, "");
      // Capitalize first letter of the domain name (before the first dot)
      const parts = cleanDomain.split(".");
      if (parts.length > 0) {
        parts[0] = parts[0].charAt(0).toUpperCase() + parts[0].slice(1);
      }
      // Rejoin all parts to keep the TLD
      return parts.join(".");
    } catch (error) {
      console.error("Invalid redirect URL:", error);
      return "Third-party Application";
    }
  };

  const appName = getAppNameFromUrl(redirectUrl);

  useEffect(() => {
    if (currentProfile && pastLastCheckedCacheLimit(lastChecked)) {
      dispatch(checkApiKeyTablePermissionsAction(currentProfile.userID));
      dispatch(listApiKeysAction(currentProfile.userID));
    }
  }, [currentProfile, lastChecked, dispatch]);

  // Filter only active, non-expired keys
  const activeApiKeys = apiKeys.filter(
    (key) =>
      !key.is_revoked && (key.expires_at === -1 || key.expires_at > Date.now())
  );

  const getStatusBadge = (apiKey: ApiKeyFE) => {
    if (apiKey.is_revoked) {
      return <Badge status="error" text="Revoked" />;
    }

    if (apiKey.expires_at === -1) {
      return <Badge status="success" text="Active" />;
    }

    const now = Date.now();
    if (apiKey.expires_at < now) {
      return <Badge status="warning" text="Expired" />;
    }

    return <Badge status="success" text="Active" />;
  };

  const formatExpiryDate = (timestamp: number) => {
    if (timestamp === -1) return "Never expires";
    const date = new Date(timestamp);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const handleContinue = () => {
    if (!selectedKeyId && !isCreatingNew) {
      message.warning("Please select an API key or choose to create a new one");
      return;
    }

    if (isCreatingNew) {
      setShowCreateModal(true);
      return;
    }

    const selectedKey = activeApiKeys.find((key) => key.id === selectedKeyId);
    if (selectedKey) {
      message.success("API key selected successfully!");

      // Redirect back to the app if redirect URL is provided
      if (redirectUrl) {
        try {
          const url = new URL(decodeURIComponent(redirectUrl));
          url.searchParams.set("api_key_value", selectedKey.value);
          url.searchParams.set("user_id", selectedKey.user_id);
          url.searchParams.set("drive_id", currentOrg?.driveID || "");
          url.searchParams.set("host", currentOrg?.host || "");
          url.searchParams.set("tracer", tracer || "");
          window.location.href = url.toString();
        } catch (error) {
          console.error("Invalid redirect URL:", error);
          message.error("Invalid redirect URL provided");
        }
      }
    }
  };

  // Labels management for new key creation
  const handleClose = (removedLabel: string) => {
    const newLabels = labels.filter((label) => label !== removedLabel);
    setLabels(newLabels);
  };

  const showInput = () => {
    setInputVisible(true);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  const handleInputConfirm = () => {
    if (inputValue && !labels.includes(inputValue)) {
      setLabels([...labels, inputValue]);
    }
    setInputVisible(false);
    setInputValue("");
  };

  const handleCreateNewKey = () => {
    form
      .validateFields()
      .then((values) => {
        const expiresAt = neverExpires
          ? -1
          : expiryDate
            ? expiryDate.valueOf()
            : -1;

        // Add app-specific label based on domain
        const keyLabels = [...labels];
        if (redirectUrl) {
          try {
            const domain = new URL(
              decodeURIComponent(redirectUrl)
            ).hostname.replace(/^www\./, "");
            if (!keyLabels.includes(domain)) {
              keyLabels.push(domain);
            }
          } catch (error) {
            console.error("Error extracting domain for label:", error);
          }
        }

        const apiKeyData: IRequestCreateApiKey = {
          id: `ApiKeyID_${uuidv4()}`,
          name: values.name,
          expires_at: expiresAt,
          external_id: values.externalId || undefined,
          external_payload: values.externalPayload || undefined,
        };

        setLoading(true);
        dispatch(createApiKeyAction(apiKeyData));

        message.success("API key created successfully!");

        // Redirect back to the app if redirect URL is provided
        if (redirectUrl) {
          try {
            const url = new URL(decodeURIComponent(redirectUrl));
            url.searchParams.set("api_key_id", apiKeyData.id || "");
            url.searchParams.set("api_key_name", apiKeyData.name);
            window.location.href = url.toString();
          } catch (error) {
            console.error("Invalid redirect URL:", error);
            message.error("Invalid redirect URL provided");
          }
        }

        setShowCreateModal(false);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Validation failed:", error);
        setLoading(false);
      });
  };

  if (currentOrg && !currentOrg.host) {
    return (
      <Layout
        style={{
          minHeight: "100vh",
          backgroundColor: "#f5f7fa",
        }}
      >
        <Content
          style={{
            padding: screenType.isMobile ? "24px 16px" : "60px 24px",
            maxWidth: "800px",
            margin: "0 auto",
            width: "100%",
          }}
        >
          <Card
            bordered={false}
            style={{
              marginBottom: "32px",
              borderRadius: "12px",
              boxShadow: "0 2px 8px rgba(0, 0, 0, 0.06)",
            }}
          >
            <Title level={2} style={{ fontWeight: "bold" }}>
              No Cloud Available
            </Title>
            <p>
              Offline Orgs cannot be used with agentic keys. Please switch to
              another organization with cloud endpoint.
            </p>
          </Card>
        </Content>
      </Layout>
    );
  }

  return (
    <Layout
      style={{
        minHeight: "100vh",
        backgroundColor: "#f5f7fa",
      }}
    >
      <Content
        style={{
          padding: screenType.isMobile ? "24px 16px" : "60px 24px",
          maxWidth: "800px",
          margin: "0 auto",
          width: "100%",
        }}
      >
        {/* Header Card */}
        <Card
          bordered={false}
          style={{
            marginBottom: "32px",
            borderRadius: "12px",
            boxShadow: "0 2px 8px rgba(0, 0, 0, 0.06)",
          }}
        >
          <div style={{ textAlign: "center", padding: "20px 0" }}>
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                width: "80px",
                height: "80px",
                borderRadius: "50%",
                backgroundColor: "#f0f5ff",
                marginBottom: "24px",
              }}
            >
              <KeyOutlined style={{ fontSize: "36px", color: "#1890ff" }} />
            </div>

            <Title
              level={2}
              style={{
                fontWeight: 600,
                fontSize: screenType.isMobile ? "24px" : "32px",
                marginBottom: "12px",
                color: "#262626",
              }}
            >
              Grant Agentic Key
            </Title>

            <div
              style={{
                fontSize: screenType.isMobile ? "16px" : "18px",
                color: "#595959",
                marginBottom: "8px",
              }}
            >
              Allow{" "}
              <Tag
                icon={<GlobalOutlined />}
                color="blue"
                style={{
                  fontSize: "16px",
                  padding: "4px 12px",
                  borderRadius: "16px",
                }}
              >
                {appName}
              </Tag>{" "}
              to connect with {currentOrg?.nickname}
            </div>

            <Paragraph
              style={{
                fontSize: "14px",
                color: "#8c8c8c",
                maxWidth: "500px",
                margin: "16px auto 0",
                lineHeight: "1.6",
              }}
            >
              We recommend creating a dedicated API key per app for easy access
              management. For enhanced security, consider creating a separate
              profile just for this app.
            </Paragraph>
          </div>
        </Card>

        {/* Security Notice */}
        <Alert
          message="Security Best Practice"
          description="Each API key has full access to your profile. Creating separate keys for each app allows you to revoke access individually if needed. For max security, create an entirely new profile just for the app."
          type="info"
          showIcon
          icon={<SafetyOutlined />}
          style={{
            marginBottom: "24px",
            borderRadius: "8px",
          }}
        />

        {/* API Key Selection */}
        {apiKeysLoading ? (
          <Card
            style={{
              textAlign: "center",
              padding: "60px",
              borderRadius: "12px",
              boxShadow: "0 2px 8px rgba(0, 0, 0, 0.06)",
            }}
          >
            <LoadingOutlined style={{ fontSize: "32px", color: "#1890ff" }} />
            <div
              style={{ marginTop: "16px", color: "#595959", fontSize: "16px" }}
            >
              Loading your API keys...
            </div>
          </Card>
        ) : (
          <>
            {/* Existing Keys Section */}
            {activeApiKeys.length > 0 && (
              <div style={{ marginBottom: "32px" }}>
                <Title
                  level={4}
                  style={{
                    fontSize: "18px",
                    marginBottom: "16px",
                    color: "#262626",
                  }}
                >
                  {currentProfile?.nickname}
                </Title>

                <Space direction="vertical" size={12} style={{ width: "100%" }}>
                  {activeApiKeys.map((apiKey) => (
                    <Card
                      key={apiKey.id}
                      hoverable
                      onClick={() => {
                        setIsCreatingNew(false);
                        setSelectedKeyId(apiKey.id);
                      }}
                      style={{
                        borderRadius: "12px",
                        border:
                          selectedKeyId === apiKey.id
                            ? "2px solid #1890ff"
                            : "1px solid #e8e8e8",
                        backgroundColor:
                          selectedKeyId === apiKey.id ? "#f0f7ff" : "#fff",
                        transition: "all 0.3s ease",
                        cursor: "pointer",
                        boxShadow:
                          selectedKeyId === apiKey.id
                            ? "0 4px 12px rgba(24, 144, 255, 0.15)"
                            : "0 2px 8px rgba(0, 0, 0, 0.06)",
                      }}
                      styles={{
                        body: { padding: "20px 24px" },
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "16px",
                            flex: 1,
                          }}
                        >
                          <Avatar
                            size={48}
                            icon={<KeyOutlined />}
                            style={{
                              backgroundColor:
                                selectedKeyId === apiKey.id
                                  ? "#1890ff"
                                  : "#f0f0f0",
                              color:
                                selectedKeyId === apiKey.id
                                  ? "#fff"
                                  : "#595959",
                            }}
                          />

                          <div style={{ flex: 1 }}>
                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "8px",
                                marginBottom: "4px",
                              }}
                            >
                              <Text
                                strong
                                style={{
                                  fontSize: "16px",
                                  color: "#262626",
                                }}
                              >
                                {apiKey.name}
                              </Text>
                              {getStatusBadge(apiKey)}
                            </div>

                            <Space size={16}>
                              <Text
                                style={{
                                  fontSize: "14px",
                                  color: "#8c8c8c",
                                }}
                              >
                                <ClockCircleOutlined
                                  style={{ marginRight: "4px" }}
                                />
                                {formatExpiryDate(apiKey.expires_at)}
                              </Text>
                              {!screenType.isMobile && (
                                <TagCopy id={apiKey.id} />
                              )}
                            </Space>
                          </div>
                        </div>

                        {selectedKeyId === apiKey.id && (
                          <CheckCircleOutlined
                            style={{
                              fontSize: "24px",
                              color: "#1890ff",
                            }}
                          />
                        )}
                      </div>

                      {screenType.isMobile && (
                        <div style={{ marginTop: "12px" }}>
                          <TagCopy id={apiKey.id} />
                        </div>
                      )}
                    </Card>
                  ))}
                </Space>
              </div>
            )}

            {/* Divider */}
            {activeApiKeys.length > 0 && (
              <Divider style={{ margin: "32px 0" }}>
                <Text style={{ color: "#8c8c8c", fontSize: "14px" }}>OR</Text>
              </Divider>
            )}

            {/* Create New Section */}
            <div>
              <Title
                level={4}
                style={{
                  fontSize: "18px",
                  marginBottom: "16px",
                  color: "#262626",
                }}
              >
                Create a new API key
              </Title>

              <Card
                hoverable
                onClick={() => {
                  setIsCreatingNew(true);
                  setSelectedKeyId(null);
                }}
                style={{
                  borderRadius: "12px",
                  border: isCreatingNew
                    ? "2px solid #52c41a"
                    : "2px dashed #d9d9d9",
                  backgroundColor: isCreatingNew ? "#f6ffed" : "#fafafa",
                  transition: "all 0.3s ease",
                  cursor: "pointer",
                  boxShadow: isCreatingNew
                    ? "0 4px 12px rgba(82, 196, 26, 0.15)"
                    : "none",
                }}
                styles={{
                  body: { padding: "24px" },
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "16px",
                    }}
                  >
                    <Avatar
                      size={48}
                      icon={<PlusOutlined />}
                      style={{
                        backgroundColor: isCreatingNew ? "#52c41a" : "#f0f0f0",
                        color: isCreatingNew ? "#fff" : "#8c8c8c",
                        width: "48px",
                        height: "48px",
                      }}
                    />
                    <div>
                      <Text
                        strong
                        style={{
                          fontSize: "16px",
                          color: isCreatingNew ? "#52c41a" : "#595959",
                          display: "block",
                          marginBottom: "4px",
                        }}
                      >
                        Create New API Key for {appName}
                      </Text>
                      <Text
                        style={{
                          fontSize: "14px",
                          color: "#8c8c8c",
                        }}
                      >
                        Recommended for security isolation. Consider even
                        creating a new profile for each application.
                      </Text>
                    </div>
                  </div>

                  {isCreatingNew && (
                    <CheckCircleOutlined
                      style={{
                        fontSize: "24px",
                        color: "#52c41a",
                      }}
                    />
                  )}
                </div>
              </Card>
            </div>
          </>
        )}

        {/* Continue Button */}
        <div style={{ marginTop: "40px", textAlign: "center" }}>
          <Button
            type="primary"
            size="large"
            block
            icon={<ArrowRightOutlined />}
            onClick={handleContinue}
            disabled={!selectedKeyId && !isCreatingNew}
            style={{
              minWidth: screenType.isMobile ? "100%" : "200px",
              height: "48px",
              fontSize: "16px",
              borderRadius: "8px",
              boxShadow: "0 2px 8px rgba(24, 144, 255, 0.25)",
            }}
          >
            Continue
          </Button>

          {/* Redirect URL Info */}
          {redirectUrl && (
            <Alert
              message={
                <Text style={{ fontSize: "14px" }}>
                  <InfoCircleOutlined style={{ marginRight: "4px" }} />
                  After selection, you'll be redirected back to{" "}
                  <strong>
                    {(() => {
                      try {
                        return new URL(decodeURIComponent(redirectUrl))
                          .hostname;
                      } catch {
                        return "the requesting application";
                      }
                    })()}
                  </strong>
                </Text>
              }
              type="success"
              style={{
                marginTop: "24px",
                borderRadius: "8px",
                marginBottom: "100px",
              }}
            />
          )}
        </div>
      </Content>

      {/* Create New API Key Modal */}
      <Modal
        title={
          <Space>
            <KeyOutlined style={{ color: "#52c41a" }} />
            Create New API Key
          </Space>
        }
        open={showCreateModal}
        onCancel={() => setShowCreateModal(false)}
        footer={[
          <Button key="cancel" onClick={() => setShowCreateModal(false)}>
            Cancel
          </Button>,
          <Button
            key="create"
            type="primary"
            loading={loading}
            onClick={handleCreateNewKey}
            icon={<PlusOutlined />}
          >
            Create API Key
          </Button>,
        ]}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          initialValues={{
            name: `${appName} API Key`,
          }}
          style={{ marginTop: "24px" }}
        >
          <Form.Item
            name="name"
            label={
              <Tooltip title="Name for this API key">
                <Space>
                  Name <InfoCircleOutlined style={{ color: "#aaa" }} />
                </Space>
              </Tooltip>
            }
            rules={[
              {
                required: true,
                message: "Please enter a name for the API key",
              },
            ]}
          >
            <Input
              prefix={<KeyOutlined />}
              placeholder="Enter API key name"
              size="large"
            />
          </Form.Item>

          <Form.Item
            label={
              <Tooltip title="API key expiration settings">
                <Space>
                  Expiration <InfoCircleOutlined style={{ color: "#aaa" }} />
                </Space>
              </Tooltip>
            }
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                marginBottom: 16,
              }}
            >
              <Switch checked={neverExpires} onChange={setNeverExpires} />
              <span style={{ marginLeft: 8 }}>Never Expires</span>
            </div>

            {!neverExpires && (
              <DatePicker
                showTime
                placeholder="Select expiry date and time"
                onChange={setExpiryDate}
                style={{ width: "100%" }}
                size="large"
              />
            )}
          </Form.Item>

          <Form.Item
            label={
              <Tooltip title="Labels to categorize this API key">
                <Space>
                  Labels <InfoCircleOutlined style={{ color: "#aaa" }} />
                </Space>
              </Tooltip>
            }
          >
            <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
              {labels.map((label) => (
                <Tag
                  key={label}
                  closable
                  onClose={() => handleClose(label)}
                  style={{ marginRight: 3 }}
                >
                  {label}
                </Tag>
              ))}
              {inputVisible ? (
                <Input
                  type="text"
                  size="small"
                  value={inputValue}
                  onChange={handleInputChange}
                  onBlur={handleInputConfirm}
                  onPressEnter={handleInputConfirm}
                  autoFocus
                  style={{ width: 78 }}
                />
              ) : (
                <Tag
                  onClick={showInput}
                  style={{
                    cursor: "pointer",
                    borderStyle: "dashed",
                  }}
                >
                  <TagOutlined /> New Label
                </Tag>
              )}
            </div>
          </Form.Item>

          <Form.Item
            name="externalId"
            label={
              <Tooltip title="External identifier for integration">
                <Space>
                  External ID <InfoCircleOutlined style={{ color: "#aaa" }} />
                </Space>
              </Tooltip>
            }
          >
            <Input placeholder="Optional external identifier" size="large" />
          </Form.Item>
        </Form>
      </Modal>
    </Layout>
  );
};

export default SelectAgenticKey;

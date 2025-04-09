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
import {
  EditOutlined,
  MailOutlined,
  BellOutlined,
  TeamOutlined,
  TagOutlined,
  ClockCircleOutlined,
  UserOutlined,
  GlobalOutlined,
  FileTextOutlined,
  CopyOutlined,
  WalletOutlined,
  InfoCircleOutlined,
  DownOutlined,
  UpOutlined,
  CodeOutlined,
  LockOutlined,
} from "@ant-design/icons";
import {
  IRequestUpdateContact,
  SystemPermissionType,
  UserID,
} from "@officexapp/types";
import {
  LOCAL_STORAGE_TOGGLE_REST_API_DOCS,
  shortenAddress,
} from "../../framework/identity/constants";
import CodeBlock from "../../components/CodeBlock";
import useScreenType from "react-screentype-hook";
import { getLastOnlineStatus } from "../../api/helpers";
import { useDispatch, useSelector } from "react-redux";
import { ReduxAppState } from "../../redux-offline/ReduxProvider";
import {
  deleteContactAction,
  updateContactAction,
} from "../../redux-offline/contacts/contacts.actions";
import { useNavigate } from "react-router-dom";
import { ContactFEO } from "../../redux-offline/contacts/contacts.reducer";
import InviteContactModal from "./contact.invite";

const { Title, Paragraph, Text } = Typography;
const { TextArea } = Input;

// Define the props for the ContactTab component
interface ContactTabProps {
  contact: ContactFEO;
  onSave?: (updatedContact: Partial<ContactFEO>) => void;
  onDelete?: (contactID: UserID) => void;
}

const ContactTab: React.FC<ContactTabProps> = ({
  contact,
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
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);

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
      const changedFields: IRequestUpdateContact = { id: contact.id as UserID };

      // Define the specific fields we care about
      const fieldsToCheck: (keyof IRequestUpdateContact)[] = [
        "name",
        "public_note",
        "private_note",
        "evm_public_address",
        "email",
      ];

      // Only check the fields we care about
      fieldsToCheck.forEach((field) => {
        // Skip if the field isn't in values
        if (!(field in values)) return;

        const valueFromForm = values[field];
        const originalValue = contact[field as keyof ContactFEO];

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
          updateContactAction({
            ...changedFields,
          })
        );

        message.success(
          isOnline
            ? "Updating contact..."
            : "Queued contact update for when you're back online"
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

  const lastOnlineStatus = getLastOnlineStatus(contact.last_online_ms);

  const initialValues = {
    name: contact.name,
    email: contact.email,
    evm_public_address: contact.evm_public_address || "",
    notifications_url: contact.notifications_url,
    public_note: contact.public_note,
    private_note: contact.private_note || "",
  };

  const renderCodeSnippets = () => {
    const jsCode_GET = `function hello() {\n  console.log("Hello, world!");\n}`;
    const jsCode_CREATE = `function hello() {\n  console.log("Hello, world!");\n} function hello() {\n  console.log("Hello, world!");\n} function hello() {\n  console.log("Hello, world!");\n} function hello() {\n  console.log("Hello, world!");\n} function hello() {\n  console.log("Hello, world!");\n} function hello() {\n  console.log("Hello, world!");\n} function hello() {\n  console.log("Hello, world!");\n} function hello() {\n  console.log("Hello, world!");\n} function hello() {\n  console.log("Hello, world!");\n} function hello() {\n  console.log("Hello, world!");\n} function hello() {\n  console.log("Hello, world!");\n} function hello() {\n  console.log("Hello, world!");\n} function hello() {\n  console.log("Hello, world!");\n} function hello() {\n  console.log("Hello, world!");\n} function hello() {\n  console.log("Hello, world!");\n} function hello() {\n  console.log("Hello, world!");\n}`;
    const jsCode_UPDATE = `function hello() {\n  console.log("Hello, world!");\n}`;
    const jsCode_DELETE = `function hello() {\n  console.log("Hello, world!");\n}`;
    const jsCode_LIST = `function hello() {\n  console.log("Hello, world!");\n}`;

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
                title="GET Contact"
              />
              <CodeBlock
                code={jsCode_CREATE}
                language="javascript"
                title="CREATE Contact"
              />
              <CodeBlock
                code={jsCode_UPDATE}
                language="javascript"
                title="UPDATE Contact"
              />
              <CodeBlock
                code={jsCode_DELETE}
                language="javascript"
                title="DELETE Contact"
              />
              <CodeBlock
                code={jsCode_LIST}
                language="javascript"
                title="LIST Contacts"
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
                  disabled={
                    !contact.permission_previews.includes(
                      SystemPermissionType.EDIT
                    ) && !contact._isOptimistic
                  }
                >
                  Edit
                </Button>
                <Button
                  icon={<LockOutlined />}
                  onClick={() => setIsInviteModalOpen(true)}
                  type="primary"
                  size={screenType.isMobile ? "small" : "middle"}
                  disabled={contact._isOptimistic}
                >
                  Share Login
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
                    placeholder="Contact name"
                    variant="borderless"
                    style={{ backgroundColor: "#fafafa" }}
                  />
                </Form.Item>

                <Form.Item name="email" label="Email">
                  <Input
                    prefix={<MailOutlined />}
                    placeholder="Email address"
                    variant="borderless"
                    style={{ backgroundColor: "#fafafa" }}
                  />
                </Form.Item>

                <Form.Item name="evm_public_address" label="EVM Wallet Address">
                  <Input
                    prefix={<WalletOutlined />}
                    placeholder="EVM wallet address"
                    variant="borderless"
                    style={{ backgroundColor: "#fafafa" }}
                  />
                </Form.Item>

                {/* Advanced section in edit mode */}
                <Form.Item name="notifications_url" label="Notifications">
                  <Input
                    prefix={<BellOutlined />}
                    placeholder="Notifications"
                    variant="borderless"
                    style={{ backgroundColor: "#fafafa" }}
                  />
                </Form.Item>

                <Form.Item name="public_note" label="Public Note">
                  <TextArea
                    rows={2}
                    placeholder="Public information about this contact"
                    variant="borderless"
                    style={{ backgroundColor: "#fafafa" }}
                  />
                </Form.Item>

                {contact.permission_previews.includes(
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
                <Divider />
                <Form.Item name="delete">
                  <Popconfirm
                    title="Are you sure you want to delete this contact?"
                    okText="Yes"
                    cancelText="No"
                    onConfirm={() => {
                      dispatch(deleteContactAction({ id: contact.id }));
                      message.success(
                        isOnline
                          ? "Deleting contact..."
                          : "Queued contact delete for when you're back online"
                      );
                      if (onDelete) {
                        onDelete(contact.id);
                      }
                    }}
                  >
                    <Button
                      disabled={
                        !contact.permission_previews.includes(
                          SystemPermissionType.DELETE
                        ) && !contact._isOptimistic
                      }
                      ghost
                      type="primary"
                      danger
                    >
                      Delete Contact
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
                          icon={<UserOutlined />}
                          src={contact.avatar || undefined}
                          style={{ backgroundColor: "#1890ff" }}
                        >
                          {contact.name.charAt(0).toUpperCase()}
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
                              {contact.name}
                            </Title>
                            <Tag
                              color="blue"
                              onClick={() => {
                                const userstring = `${contact.name.replace(" ", "_")}@${contact.id}`;
                                navigator.clipboard
                                  .writeText(userstring)
                                  .then(() => {
                                    message.success("Copied to clipboard!");
                                  })
                                  .catch(() => {
                                    message.error(
                                      "Failed to copy to clipboard."
                                    );
                                  });
                              }}
                              style={{
                                cursor: "pointer",
                                marginTop: "24px",
                              }}
                            >
                              {shortenAddress(contact.icp_principal)}
                            </Tag>
                          </div>
                          <Space>
                            <Badge
                              // @ts-ignore
                              status={lastOnlineStatus.status}
                            />
                            <Text type="secondary">
                              {lastOnlineStatus.text}
                            </Text>
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
                        {contact.labels.map((label, index) => (
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
                          : contact.labels.length > 0
                            ? 0
                            : 32,
                      }}
                    >
                      <Card size="small" style={{ marginTop: 8 }}>
                        <GlobalOutlined style={{ marginRight: 8 }} />
                        {contact.public_note || "Add a public note"}
                      </Card>
                    </div>

                    {screenType.isMobile && (
                      <div
                        style={{
                          marginTop: 4,
                          display: "flex",
                          justifyContent: "flex-start",
                          flexWrap: "wrap",
                        }}
                      >
                        {contact.labels.map((label, index) => (
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
                          "User ID",
                          contact.id,
                          <UserOutlined />
                        )}

                        {renderReadOnlyField(
                          "Email",
                          contact.email,
                          <MailOutlined />
                        )}

                        {contact.notifications_url &&
                          renderReadOnlyField(
                            "Notifications",
                            contact.notifications_url,
                            <BellOutlined />
                          )}

                        {contact.evm_public_address &&
                          renderReadOnlyField(
                            "EVM Wallet",
                            contact.evm_public_address,
                            <WalletOutlined />
                          )}

                        {contact.icp_principal &&
                          renderReadOnlyField(
                            "ICP Wallet",
                            contact.icp_principal,
                            <WalletOutlined />
                          )}

                        {renderReadOnlyField(
                          "Owner",
                          // @ts-ignore
                          contact.is_placeholder ||
                            contact.from_placeholder_user_id
                            ? "Self-Custodied Account"
                            : "Owned by Organization",
                          <WalletOutlined />
                        )}

                        {contact.private_note &&
                          contact.permission_previews.includes(
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
                                {contact.private_note}
                              </Card>
                            </div>
                          )}

                        <div style={{ marginTop: "16px" }}>
                          <Space align="center">
                            <ClockCircleOutlined />
                            <Text type="secondary">
                              Member since {formatDate(contact.created_at)}
                            </Text>
                          </Space>
                          {contact.external_id && (
                            <div style={{ marginTop: 8 }}>
                              <Text type="secondary">
                                External ID: {contact.external_id}
                              </Text>
                            </div>
                          )}
                        </div>
                      </div>
                    </details>
                  </Col>

                  {contact.group_previews.length > 0 && (
                    <Col span={24}>
                      <Title level={5}>Groups</Title>
                      {contact.group_previews.map((group, index) => (
                        <Card
                          key={index}
                          size="small"
                          style={{ marginBottom: 8 }}
                        >
                          <Space>
                            <Avatar
                              size="small"
                              icon={<TeamOutlined />}
                              src={group.group_avatar || undefined}
                            />
                            <Text>{group.group_name}</Text>
                            {group.is_admin && <Tag color="gold">Admin</Tag>}
                          </Space>
                        </Card>
                      ))}
                    </Col>
                  )}
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
      <InviteContactModal
        contact={contact}
        isVisible={isInviteModalOpen}
        onClose={() => setIsInviteModalOpen(false)}
        organizationId="org-123"
      />
    </div>
  );
};

export default ContactTab;

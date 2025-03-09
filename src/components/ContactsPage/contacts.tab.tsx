import React, { useState } from "react";
import {
  Typography,
  Card,
  Button,
  Form,
  Input,
  Space,
  Divider,
  Tag,
  Avatar,
  Row,
  Col,
  Tooltip,
  Badge,
  Popover,
  message,
} from "antd";
import {
  EditOutlined,
  MailOutlined,
  LinkOutlined,
  TeamOutlined,
  TagOutlined,
  ClockCircleOutlined,
  UserOutlined,
  GlobalOutlined,
  FileTextOutlined,
  CopyOutlined,
  WalletOutlined,
  InfoCircleOutlined,
} from "@ant-design/icons";
import { ContactFE } from "@officexapp/types";

const { Title, Paragraph, Text } = Typography;
const { TextArea } = Input;

// Define the props for the ContactTab component
interface ContactTabProps {
  contact: ContactFE;
  onSave?: (updatedContact: Partial<ContactFE>) => void;
}

const ContactTab: React.FC<ContactTabProps> = ({ contact, onSave }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [form] = Form.useForm();

  const toggleEdit = () => {
    if (isEditing) {
      form.resetFields();
    }
    setIsEditing(!isEditing);
  };

  const handleSave = () => {
    form.validateFields().then((values) => {
      if (onSave) {
        onSave(values);
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
    icon: React.ReactNode
  ) => {
    return (
      <Input
        readOnly
        value={value}
        style={{ marginBottom: 16 }}
        addonBefore={
          <div style={{ width: 90, display: "flex", alignItems: "center" }}>
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
    name: contact.name,
    email: contact.email,
    webhook_url: contact.webhook_url,
    public_note: contact.public_note,
    private_note: contact.private_note || "",
  };

  return (
    <div
      style={{ padding: "0", height: "100%", width: "100%", overflowY: "auto" }}
    >
      <Card
        bordered={false}
        style={{ boxShadow: "0 1px 2px rgba(0,0,0,0.03)" }}
        title={
          <Row justify="end" align="middle">
            <Col>
              {isEditing ? (
                <Space>
                  <Button onClick={toggleEdit} type="default">
                    Cancel
                  </Button>
                  <Button onClick={handleSave} type="primary">
                    Save Changes
                  </Button>
                </Space>
              ) : (
                <Button
                  icon={<EditOutlined />}
                  onClick={toggleEdit}
                  type="primary"
                  ghost
                >
                  Edit
                </Button>
              )}
            </Col>
          </Row>
        }
      >
        {isEditing ? (
          <Form form={form} layout="vertical" initialValues={initialValues}>
            <Form.Item
              name="name"
              label="Name"
              rules={[{ required: true, message: "Please enter name" }]}
            >
              <Input placeholder="Contact name" />
            </Form.Item>

            <Form.Item
              name="email"
              label="Email"
              rules={[{ type: "email", message: "Please enter a valid email" }]}
            >
              <Input prefix={<MailOutlined />} placeholder="Email address" />
            </Form.Item>

            <Form.Item name="webhook_url" label="Webhook URL">
              <Input prefix={<LinkOutlined />} placeholder="Webhook URL" />
            </Form.Item>

            <Form.Item name="public_note" label="Public Note">
              <TextArea
                rows={2}
                placeholder="Public information about this contact"
              />
            </Form.Item>

            <Form.Item
              name="private_note"
              label="Private Note"
              extra="Only organization owners and editors can view this note"
            >
              <TextArea
                rows={3}
                placeholder="Private notes (only visible to owners and editors)"
              />
            </Form.Item>
          </Form>
        ) : (
          <>
            <Row gutter={[16, 16]}>
              <Col span={24}>
                <Space align="center" size={16}>
                  <Avatar
                    size={64}
                    icon={<UserOutlined />}
                    src={contact.avatar || undefined}
                    style={{ backgroundColor: "#1890ff" }}
                  >
                    {contact.name.charAt(0).toUpperCase()}
                  </Avatar>
                  <div>
                    <Title level={3} style={{ marginBottom: 0 }}>
                      {contact.name}
                    </Title>
                    <Space>
                      <Badge status="success" />
                      <Text type="secondary">
                        Last online {formatDate(contact.last_online_at)}
                      </Text>
                    </Space>
                    <div style={{ marginTop: 4 }}>
                      {contact.tags.map((tag, index) => (
                        <Tag
                          key={index}
                          color="blue"
                          style={{ marginBottom: 4 }}
                        >
                          {tag}
                        </Tag>
                      ))}
                    </div>
                  </div>
                </Space>
              </Col>
            </Row>

            <Divider />

            <Row gutter={[16, 16]}>
              <Col span={24}>
                {renderReadOnlyField("User ID", contact.id, <UserOutlined />)}

                {contact.email &&
                  renderReadOnlyField("Email", contact.email, <MailOutlined />)}

                {contact.webhook_url &&
                  renderReadOnlyField(
                    "Webhook",
                    contact.webhook_url,
                    <LinkOutlined />
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
              </Col>

              <Col span={24}>
                {contact.public_note && (
                  <div style={{ marginBottom: 16 }}>
                    <Text strong>Public Note:</Text>
                    <Card size="small" style={{ marginTop: 8 }}>
                      <GlobalOutlined style={{ marginRight: 8 }} />
                      {contact.public_note}
                    </Card>
                  </div>
                )}

                {contact.private_note && (
                  <div>
                    <Space align="center">
                      <Text strong>Private Note:</Text>
                      <Popover
                        content="Only organization owners and editors can view this note"
                        trigger="hover"
                      >
                        <InfoCircleOutlined style={{ color: "#1890ff" }} />
                      </Popover>
                    </Space>
                    <Card
                      size="small"
                      style={{ marginTop: 8, backgroundColor: "#fafafa" }}
                    >
                      <FileTextOutlined style={{ marginRight: 8 }} />
                      {contact.private_note}
                    </Card>
                  </div>
                )}
              </Col>

              <Col span={24}>
                <Title level={5}>Teams</Title>
                {contact.team_previews.map((team, index) => (
                  <Card key={index} size="small" style={{ marginBottom: 8 }}>
                    <Space>
                      <Avatar
                        size="small"
                        icon={<TeamOutlined />}
                        src={team.team_avatar || undefined}
                      />
                      <Text>{team.team_name}</Text>
                      {team.is_admin && <Tag color="gold">Admin</Tag>}
                    </Space>
                  </Card>
                ))}
              </Col>

              <Col span={24}>
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
              </Col>
            </Row>
          </>
        )}
      </Card>
    </div>
  );
};

export default ContactTab;

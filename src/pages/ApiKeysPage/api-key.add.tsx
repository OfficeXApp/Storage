import React, { useState, useEffect } from "react";
import {
  Button,
  Drawer,
  Typography,
  Input,
  Form,
  Space,
  Tag,
  Tooltip,
  Switch,
  message,
  DatePicker,
  Divider,
} from "antd";
import {
  KeyOutlined,
  InfoCircleOutlined,
  ReloadOutlined,
  TagOutlined,
  ClockCircleOutlined,
  UserOutlined,
  GlobalOutlined,
  FileTextOutlined,
} from "@ant-design/icons";
import { useDispatch, useSelector } from "react-redux";
import { v4 as uuidv4 } from "uuid";
import { IRequestCreateApiKey, ApiKeyID } from "@officexapp/types";
import { ReduxAppState } from "../../redux-offline/ReduxProvider";
import { createApiKeyAction } from "../../redux-offline/api-keys/api-keys.actions";
import dayjs from "dayjs";
import { useIdentitySystem } from "../../framework/identity";

const { Text, Paragraph } = Typography;
const { TextArea } = Input;

interface ApiKeyAddDrawerProps {
  open: boolean;
  onClose: () => void;
  onAddApiKey: (apiKeyData: IRequestCreateApiKey) => void;
}

const ApiKeyAddDrawer: React.FC<ApiKeyAddDrawerProps> = ({
  open,
  onClose,
  onAddApiKey,
}) => {
  const dispatch = useDispatch();
  const isOnline = useSelector((state: ReduxAppState) => state.offline?.online);
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);
  const [displayedName, setDisplayedName] = useState("");
  const [neverExpires, setNeverExpires] = useState(true);
  const [expiryDate, setExpiryDate] = useState<dayjs.Dayjs | null>(null);
  const [labels, setLabels] = useState<string[]>([]);
  const [inputVisible, setInputVisible] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [formChanged, setFormChanged] = useState(false);
  const { currentProfile } = useIdentitySystem();

  // Reset form when drawer opens
  useEffect(() => {
    if (open) {
      form.resetFields();
      setIsAdvancedOpen(false);
      setNeverExpires(true);
      setExpiryDate(null);
      setDisplayedName(`${currentProfile?.nickname} API Key`);
      setLabels([]);
      setInputVisible(false);
      setInputValue("");
      setFormChanged(false);
    }
  }, [open, form]);

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setDisplayedName(value);
    form.setFieldsValue({ name: value });
    setFormChanged(true);
  };

  // Labels management
  const handleClose = (removedLabel: string) => {
    const newLabels = labels.filter((label) => label !== removedLabel);
    setLabels(newLabels);
    setFormChanged(true);
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
    setFormChanged(true);
  };

  const handleAddApiKey = () => {
    form
      .validateFields()
      .then((values) => {
        const expiresAt = neverExpires
          ? -1
          : expiryDate
            ? expiryDate.valueOf()
            : -1;

        const apiKeyData: IRequestCreateApiKey = {
          id: `ApiKeyID_${uuidv4()}`,
          name: values.name,
          expires_at: expiresAt,
          external_id: values.externalId || undefined,
          external_payload: values.externalPayload || undefined,
        };

        setLoading(true);

        // Dispatch the create API key action
        dispatch(createApiKeyAction(apiKeyData));

        message.success(
          isOnline
            ? "Creating API key..."
            : "Queued API key creation for when you're back online"
        );

        // Call the parent's onAddApiKey for any additional handling
        onAddApiKey(apiKeyData);

        // Close the drawer
        onClose();

        setLoading(false);
      })
      .catch((error) => {
        console.error("Validation failed:", error);
        setLoading(false);
      });
  };

  const shortenApiKey = (key: string) => {
    if (!key || key.length < 10) return key;
    return `${key.slice(0, 6)}...${key.slice(-4)}`;
  };

  return (
    <Drawer
      title="Add New API Key"
      placement="right"
      onClose={onClose}
      open={open}
      width={500}
      mask={false}
      footer={
        <div style={{ textAlign: "right" }}>
          <Button size="large" onClick={onClose} style={{ marginRight: 8 }}>
            Cancel
          </Button>
          <Button
            onClick={handleAddApiKey}
            type="primary"
            size="large"
            loading={loading}
            disabled={!displayedName || loading}
          >
            Create API Key
          </Button>
        </div>
      }
    >
      <Form
        form={form}
        layout="vertical"
        initialValues={{
          name: `${currentProfile?.nickname} API Key`,
          externalId: "",
          externalPayload: "",
        }}
      >
        <Form.Item
          name="name"
          label={
            <Tooltip title="Name for this API key">
              <Space>
                Nickname <InfoCircleOutlined style={{ color: "#aaa" }} />
              </Space>
            </Tooltip>
          }
          required
        >
          <Input
            prefix={<KeyOutlined />}
            size="large"
            placeholder="Enter API key name (anything)"
            onChange={handleNameChange}
            variant="borderless"
            style={{ backgroundColor: "#fafafa" }}
          />
        </Form.Item>

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
            Advanced Details
          </summary>

          <div style={{ padding: "12px 0" }}>
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
                <Switch
                  checked={neverExpires}
                  onChange={(checked) => {
                    setNeverExpires(checked);
                    setFormChanged(true);
                  }}
                />
                <span style={{ marginLeft: 8 }}>Never Expires</span>
              </div>

              {!neverExpires && (
                <DatePicker
                  showTime
                  placeholder="Select expiry date and time"
                  onChange={(value) => {
                    setExpiryDate(value);
                    setFormChanged(true);
                  }}
                  style={{ width: "100%" }}
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
                    variant="borderless"
                    style={{ width: 78, backgroundColor: "#fafafa" }}
                  />
                ) : (
                  <Tag onClick={showInput} style={{ cursor: "pointer" }}>
                    <TagOutlined /> New Label
                  </Tag>
                )}
              </div>
            </Form.Item>

            <Form.Item
              name="externalId"
              label={
                <Tooltip title="External identifier for integration with other systems">
                  <Space>
                    External ID <InfoCircleOutlined style={{ color: "#aaa" }} />
                  </Space>
                </Tooltip>
              }
            >
              <Input
                prefix={<GlobalOutlined />}
                placeholder="External identifier"
                onChange={() => setFormChanged(true)}
                variant="borderless"
                style={{ backgroundColor: "#fafafa" }}
              />
            </Form.Item>

            <Form.Item
              name="externalPayload"
              label={
                <Tooltip title="Additional data for external systems">
                  <Space>
                    External Payload{" "}
                    <InfoCircleOutlined style={{ color: "#aaa" }} />
                  </Space>
                </Tooltip>
              }
            >
              <TextArea
                placeholder="Additional data for external systems (JSON, etc.)"
                rows={3}
                onChange={() => setFormChanged(true)}
                style={{ backgroundColor: "#fafafa" }}
              />
            </Form.Item>
          </div>
        </details>
      </Form>
    </Drawer>
  );
};

export default ApiKeyAddDrawer;

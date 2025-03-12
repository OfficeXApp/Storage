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
  Select,
} from "antd";
import {
  LinkOutlined,
  TagOutlined,
  InfoCircleOutlined,
  BellOutlined,
  ApiOutlined,
  GlobalOutlined,
  CodeOutlined,
} from "@ant-design/icons";
import { useDispatch, useSelector } from "react-redux";
import { v4 as uuidv4 } from "uuid";
import { IRequestCreateWebhook, WebhookEventLabel } from "@officexapp/types";
import { createWebhookAction } from "../../redux-offline/webhooks/webhooks.actions";
import { ReduxAppState } from "../../redux-offline/ReduxProvider";

const { Text, Paragraph } = Typography;
const { TextArea } = Input;
const { Option } = Select;

// Use the WebhookEventLabel enum for dropdown options
const WEBHOOK_EVENT_OPTIONS = Object.entries(WebhookEventLabel).map(
  ([key, value]) => ({
    value,
    label: key
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(" "),
  })
);

interface WebhooksAddDrawerProps {
  open: boolean;
  onClose: () => void;
  onAddWebhook: (webhookData: IRequestCreateWebhook) => void;
}

const WebhooksAddDrawer: React.FC<WebhooksAddDrawerProps> = ({
  open,
  onClose,
  onAddWebhook,
}) => {
  const dispatch = useDispatch();
  const isOnline = useSelector((state: ReduxAppState) => state.offline?.online);
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);
  const [isActive, setIsActive] = useState(true);
  const [tags, setTags] = useState<string[]>([]);
  const [inputVisible, setInputVisible] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [urlError, setUrlError] = useState<string | null>(null);
  const [formChanged, setFormChanged] = useState(false);

  // Reset form when drawer opens
  useEffect(() => {
    if (open) {
      form.resetFields();
      setIsAdvancedOpen(false);
      setIsActive(true);
      setTags([]);
      setInputVisible(false);
      setInputValue("");
      setUrlError(null);
      setFormChanged(false);

      // Set default alt_index based on initial event type selection
      const initialEvent = form.getFieldValue("event");
      setDefaultAltIndex(initialEvent);
    }
  }, [open, form]);

  // Set default alt_index based on event type
  const setDefaultAltIndex = (eventType: string) => {
    let defaultAltIndex = "";

    // Map event types to default alt_index values
    switch (eventType) {
      case WebhookEventLabel.FILE_CREATED:
        defaultAltIndex = "FILE_CREATED";
        break;
      case WebhookEventLabel.FOLDER_CREATED:
        defaultAltIndex = "FOLDER_CREATED";
        break;
      case WebhookEventLabel.DRIVE_RESTORE_TRASH:
        defaultAltIndex = "RESTORE_TRASH";
        break;
      case WebhookEventLabel.DRIVE_STATE_DIFFS:
        defaultAltIndex = "STATE_DIFFS";
        break;
      // Add SUPERSWAP_USER for a specific event type
      // You may need to add the corresponding enum value if it exists
      case "team.invite.created": // Assuming this matches with a SUPERSWAP_USER case
        defaultAltIndex = "SUPERSWAP_USER";
        break;
      default:
        defaultAltIndex = uuidv4().substring(0, 8);
    }

    form.setFieldsValue({ alt_index: defaultAltIndex });
  };

  // Handle URL validation
  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    form.setFieldsValue({ url: value });
    setFormChanged(true);

    try {
      new URL(value);
      setUrlError(null);
    } catch (error) {
      setUrlError("Invalid URL format");
    }
  };

  // Tags management
  const handleClose = (removedTag: string) => {
    const newTags = tags.filter((tag) => tag !== removedTag);
    setTags(newTags);
    setFormChanged(true);
  };

  const showInput = () => {
    setInputVisible(true);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  const handleInputConfirm = () => {
    if (inputValue && !tags.includes(inputValue)) {
      setTags([...tags, inputValue]);
    }
    setInputVisible(false);
    setInputValue("");
    setFormChanged(true);
  };

  const handleAddWebhook = () => {
    console.log("Adding webhook...");
    form
      .validateFields()
      .then((values) => {
        console.log("Form values:", values);

        // Validate URL
        if (!values.url || urlError) {
          console.log(`Invalid URL: ${values.url}, ${urlError}`);
          setUrlError("Valid URL is required");
          return;
        }

        const webhookData: IRequestCreateWebhook = {
          url: values.url,
          name: values.name || "",
          alt_index: values.alt_index || uuidv4().substring(0, 8),
          event: values.event,
          signature: values.signature || "",
          description: values.description || "",
          filters: values.filters || "",
          external_id: values.external_id,
          external_payload: values.external_payload,
        };

        console.log("Webhook data:", webhookData);

        setLoading(true);

        // Dispatch the create webhook action
        dispatch(createWebhookAction(webhookData));

        message.success(
          isOnline
            ? "Creating webhook..."
            : "Queued webhook creation for when you're back online"
        );

        // Call the parent's onAddWebhook for any additional handling
        onAddWebhook(webhookData);

        // Close the drawer and show success message
        onClose();

        setLoading(false);
      })
      .catch((error) => {
        console.error("Validation failed:", error);
        setLoading(false);
      });
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

  return (
    <Drawer
      title="Add New Webhook"
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
            onClick={handleAddWebhook}
            type="primary"
            size="large"
            loading={loading}
            disabled={
              !form.getFieldValue("event") ||
              !form.getFieldValue("url") ||
              urlError !== null ||
              loading
            }
          >
            Add Webhook
          </Button>
        </div>
      }
    >
      <Form
        form={form}
        layout="vertical"
        initialValues={{
          event: WebhookEventLabel.FILE_CREATED,
          url: "",
          name: "",
          alt_index: "",
          signature: "",
          description: "",
          filters: "",
          external_id: "",
          external_payload: "",
        }}
      >
        <Form.Item
          name="event"
          label={
            <Tooltip title="Event type to trigger the webhook">
              <Space>
                Event Type <InfoCircleOutlined style={{ color: "#aaa" }} />
              </Space>
            </Tooltip>
          }
          required
        >
          <Select
            placeholder="Select event type"
            size="large"
            onChange={(value) => {
              setFormChanged(true);
              setDefaultAltIndex(value);
            }}
            variant="borderless"
            style={{ backgroundColor: "#fafafa" }}
          >
            {WEBHOOK_EVENT_OPTIONS.map((event) => (
              <Option key={event.value} value={event.value}>
                {event.label}
              </Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item
          name="url"
          label={
            <Tooltip title="URL to send webhook events to">
              <Space>
                Endpoint URL <InfoCircleOutlined style={{ color: "#aaa" }} />
              </Space>
            </Tooltip>
          }
          required
          validateStatus={urlError ? "error" : ""}
          help={urlError}
        >
          <Input
            prefix={<LinkOutlined />}
            size="large"
            placeholder="https://example.com/webhook"
            onChange={handleUrlChange}
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
              name="name"
              label={
                <Tooltip title="Name of this webhook">
                  <Space>
                    Name <InfoCircleOutlined style={{ color: "#aaa" }} />
                  </Space>
                </Tooltip>
              }
            >
              <Input
                placeholder="Give this webhook a name"
                onChange={() => setFormChanged(true)}
                variant="borderless"
                style={{ backgroundColor: "#fafafa" }}
              />
            </Form.Item>

            <Form.Item
              name="description"
              label={
                <Tooltip title="Description of this webhook">
                  <Space>
                    Description <InfoCircleOutlined style={{ color: "#aaa" }} />
                  </Space>
                </Tooltip>
              }
            >
              <Input
                prefix={<InfoCircleOutlined />}
                placeholder="Add a description for this webhook"
                onChange={() => setFormChanged(true)}
                variant="borderless"
                style={{ backgroundColor: "#fafafa" }}
              />
            </Form.Item>

            <Form.Item
              name="alt_index"
              label={
                <Tooltip title="Alternative index for the webhook (auto-generated if empty)">
                  <Space>
                    Alternative Index{" "}
                    <InfoCircleOutlined style={{ color: "#aaa" }} />
                  </Space>
                </Tooltip>
              }
            >
              <Input
                prefix={<CodeOutlined />}
                placeholder="custom-index-123"
                onChange={() => setFormChanged(true)}
                variant="borderless"
                style={{ backgroundColor: "#fafafa" }}
              />
            </Form.Item>

            <Form.Item
              name="signature"
              label={
                <Tooltip title="Signature for webhook verification">
                  <Space>
                    Signature <InfoCircleOutlined style={{ color: "#aaa" }} />
                  </Space>
                </Tooltip>
              }
            >
              <Input
                prefix={<ApiOutlined />}
                placeholder="Webhook signature for verification"
                onChange={() => setFormChanged(true)}
                variant="borderless"
                style={{ backgroundColor: "#fafafa" }}
              />
            </Form.Item>

            <Form.Item
              label={
                <Tooltip title="Whether the webhook is active">
                  <Space>
                    Active <InfoCircleOutlined style={{ color: "#aaa" }} />
                  </Space>
                </Tooltip>
              }
            >
              <Switch
                checked={isActive}
                onChange={(checked) => {
                  setIsActive(checked);
                  setFormChanged(true);
                }}
              />
            </Form.Item>

            <Form.Item
              name="filters"
              label={
                <Tooltip title="Filter string for events (JSON format)">
                  <Space>
                    Filters <InfoCircleOutlined style={{ color: "#aaa" }} />
                  </Space>
                </Tooltip>
              }
            >
              <TextArea
                placeholder='{"key": "value"}'
                rows={2}
                onChange={() => setFormChanged(true)}
              />
            </Form.Item>

            <Form.Item
              label={
                <Tooltip title="Tags to categorize this webhook">
                  <Space>
                    Tags <InfoCircleOutlined style={{ color: "#aaa" }} />
                  </Space>
                </Tooltip>
              }
            >
              <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                {tags.map((tag) => (
                  <Tag
                    key={tag}
                    closable
                    onClose={() => handleClose(tag)}
                    style={{ marginRight: 3 }}
                  >
                    {tag}
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
                    <TagOutlined /> New Tag
                  </Tag>
                )}
              </div>
            </Form.Item>

            <Form.Item
              name="external_id"
              label={
                <Tooltip title="External identifier for integration with other systems">
                  <Space>
                    External ID <InfoCircleOutlined style={{ color: "#aaa" }} />
                  </Space>
                </Tooltip>
              }
            >
              <Input
                placeholder="External identifier"
                onChange={() => setFormChanged(true)}
                variant="borderless"
                style={{ backgroundColor: "#fafafa" }}
              />
            </Form.Item>

            <Form.Item
              name="external_payload"
              label={
                <Tooltip title="Additional data for external integrations (JSON format)">
                  <Space>
                    External Payload{" "}
                    <InfoCircleOutlined style={{ color: "#aaa" }} />
                  </Space>
                </Tooltip>
              }
            >
              <TextArea
                placeholder='{"key": "value"}'
                rows={2}
                onChange={() => setFormChanged(true)}
              />
            </Form.Item>
          </div>
        </details>
      </Form>
    </Drawer>
  );
};

export default WebhooksAddDrawer;

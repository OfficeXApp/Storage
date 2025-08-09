import React, { useState, useEffect } from "react";
import {
  Button,
  Drawer,
  Typography,
  Input,
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
  ApiOutlined,
} from "@ant-design/icons";
import { useDispatch, useSelector } from "react-redux";
import { v4 as uuidv4 } from "uuid";
import { IRequestCreateWebhook, WebhookEventLabel } from "@officexapp/types";
import { createWebhookAction } from "../../redux-offline/webhooks/webhooks.actions";
import { ReduxAppState } from "../../redux-offline/ReduxProvider";

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

const ALL_OR_ONLY_ALTINDEX_OPERATIONS = [
  WebhookEventLabel.FILE_VIEWED,
  WebhookEventLabel.FILE_CREATED,
  WebhookEventLabel.FILE_UPDATED,
  WebhookEventLabel.FILE_DELETED,
  WebhookEventLabel.FILE_SHARED,
  WebhookEventLabel.FOLDER_VIEWED,
  WebhookEventLabel.FOLDER_CREATED,
  WebhookEventLabel.FOLDER_UPDATED,
  WebhookEventLabel.FOLDER_DELETED,
  WebhookEventLabel.FOLDER_SHARED,
  WebhookEventLabel.ORG_INBOX_NEW_MAIL,
];

const MANDATORY_ONLY_ALTINDEX_OPERATIONS = [
  WebhookEventLabel.SUBFILE_VIEWED,
  WebhookEventLabel.SUBFILE_CREATED,
  WebhookEventLabel.SUBFILE_UPDATED,
  WebhookEventLabel.SUBFILE_DELETED,
  WebhookEventLabel.SUBFILE_SHARED,
  WebhookEventLabel.SUBFOLDER_VIEWED,
  WebhookEventLabel.SUBFOLDER_CREATED,
  WebhookEventLabel.SUBFOLDER_UPDATED,
  WebhookEventLabel.SUBFOLDER_DELETED,
  WebhookEventLabel.SUBFOLDER_SHARED,
  WebhookEventLabel.LABEL_ADDED,
  WebhookEventLabel.LABEL_REMOVED,
  WebhookEventLabel.GROUP_INVITE_CREATED,
  WebhookEventLabel.GROUP_INVITE_UPDATED,
];

const MANDATORY_ALL_ALTINDEX_OPERATIONS = [
  WebhookEventLabel.DRIVE_RESTORE_TRASH,
  WebhookEventLabel.DRIVE_STATE_DIFFS,
  WebhookEventLabel.ORG_SUPERSWAP_USER,
];

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
  const [topicValue, setTopicValue] = useState("");

  // Form field states
  const [url, setUrl] = useState("");
  const [name, setName] = useState("");
  const [eventType, setEventType] = useState<WebhookEventLabel>(
    WebhookEventLabel.FILE_CREATED
  );
  const [altIndex, setAltIndex] = useState("");
  const [signature, setSignature] = useState("");
  const [note, setNote] = useState("");
  const [filters, setFilters] = useState("");
  const [externalId, setExternalId] = useState("");
  const [externalPayload, setExternalPayload] = useState("");

  // UI states
  const [loading, setLoading] = useState(false);
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);
  const [isActive, setIsActive] = useState(true);
  const [labels, setLabels] = useState<string[]>([]);
  const [inputVisible, setInputVisible] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [urlError, setUrlError] = useState<string | null>(null);
  const [formChanged, setFormChanged] = useState(false);
  const [toggleSpecificResourceId, setToggleSpecificResourceId] =
    useState(false);

  // Reset form when drawer opens
  useEffect(() => {
    if (open) {
      // Reset all form fields
      setUrl("");
      setName("");
      setEventType(WebhookEventLabel.FILE_CREATED);
      setAltIndex("");
      setSignature("");
      setNote("");
      setFilters("");
      setExternalId("");
      setExternalPayload("");

      // Reset UI states
      setIsAdvancedOpen(false);
      setIsActive(true);
      setLabels([]);
      setInputVisible(false);
      setInputValue("");
      setUrlError(null);
      setFormChanged(false);
      setToggleSpecificResourceId(false);

      // Set default event type and handle its change
      handleEventTypeChange(WebhookEventLabel.FILE_CREATED);
    }
  }, [open]);

  // Handle hardcoded alt_index based on event type
  const getHardcodedAltIndex = (
    eventType: WebhookEventLabel,
    isAll: boolean
  ): string => {
    // For ALL mode with specific event types
    if (isAll) {
      // File operations use ALL_FILES
      if (
        eventType === WebhookEventLabel.FILE_CREATED ||
        eventType === WebhookEventLabel.FILE_VIEWED ||
        eventType === WebhookEventLabel.FILE_UPDATED ||
        eventType === WebhookEventLabel.FILE_DELETED ||
        eventType === WebhookEventLabel.FILE_SHARED
      ) {
        return "ALL_FILES";
      }

      // Folder operations use ALL_FOLDERS
      if (
        eventType === WebhookEventLabel.FOLDER_CREATED ||
        eventType === WebhookEventLabel.FOLDER_VIEWED ||
        eventType === WebhookEventLabel.FOLDER_UPDATED ||
        eventType === WebhookEventLabel.FOLDER_DELETED ||
        eventType === WebhookEventLabel.FOLDER_SHARED
      ) {
        return "ALL_FOLDERS";
      }

      if (eventType === WebhookEventLabel.ORG_SUPERSWAP_USER) {
        return "ALL_USERS";
      }
    }

    // For mandatory specific alt_index types regardless of ALL/ONLY switch
    if (eventType === WebhookEventLabel.DRIVE_RESTORE_TRASH)
      return "RESTORE_TRASH";
    if (eventType === WebhookEventLabel.DRIVE_STATE_DIFFS) return "STATE_DIFFS";
    if (eventType === WebhookEventLabel.ORG_SUPERSWAP_USER)
      return "SUPERSWAP_USER";

    if (eventType === WebhookEventLabel.ORG_INBOX_NEW_MAIL) {
      return "INBOX_NEW_MAIL";
    }
    // Default case for ONLY mode
    return "";
  };

  // Set default alt_index based on event type
  const handleEventTypeChange = (newEventType: WebhookEventLabel) => {
    setEventType(newEventType);
    setFormChanged(true);

    // Set toggle state based on event type category
    let newToggleState = false;

    if (MANDATORY_ALL_ALTINDEX_OPERATIONS.includes(newEventType)) {
      // These operations are locked to ALL
      newToggleState = true;
    } else if (MANDATORY_ONLY_ALTINDEX_OPERATIONS.includes(newEventType)) {
      // These operations are locked to ONLY
      newToggleState = false;
    } else {
      // These operations can be either ALL or ONLY, default to ONLY
      newToggleState = false;
    }

    setToggleSpecificResourceId(newToggleState);

    // Set the appropriate alt_index based on the event type and toggle state
    setAltIndex(getHardcodedAltIndex(newEventType, newToggleState));
  };

  // Handle URL validation
  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setUrl(value);
    setFormChanged(true);

    try {
      new URL(value);
      setUrlError(null);
    } catch (error) {
      setUrlError("Invalid URL format");
    }
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

  const handleAddWebhook = () => {
    // Validate required fields
    if (!url) {
      setUrlError("URL is required");
      return;
    }

    if (urlError) {
      return;
    }

    const webhookData: IRequestCreateWebhook = {
      url,
      name,
      alt_index: altIndex,
      event: eventType,
      signature,
      note,
      filters,
      external_id: externalId,
      external_payload: externalPayload,
    };

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
  };

  const handleSwitchToggle = (checked: boolean) => {
    // Don't allow toggle for operations that have mandatory ALL or ONLY settings
    if (
      MANDATORY_ALL_ALTINDEX_OPERATIONS.includes(eventType) ||
      MANDATORY_ONLY_ALTINDEX_OPERATIONS.includes(eventType)
    ) {
      return;
    }

    setToggleSpecificResourceId(checked);

    // Update alt_index based on the new toggle state and event type
    setAltIndex(getHardcodedAltIndex(eventType, checked));

    if (eventType === WebhookEventLabel.ORG_INBOX_NEW_MAIL && checked) {
      setFilters("");
    }

    setFormChanged(true);
  };

  // Render the appropriate Alt Index field based on the selected event type
  const renderAltIndexField = () => {
    // Determine if the switch is disabled and in which state it should be locked
    const isSwitchDisabled =
      MANDATORY_ALL_ALTINDEX_OPERATIONS.includes(eventType) ||
      MANDATORY_ONLY_ALTINDEX_OPERATIONS.includes(eventType);

    // Determine if the input field should be read-only
    const isInputReadOnly =
      toggleSpecificResourceId ||
      MANDATORY_ALL_ALTINDEX_OPERATIONS.includes(eventType);

    // Determine if the input field should be disabled entirely
    const isInputDisabled =
      MANDATORY_ALL_ALTINDEX_OPERATIONS.includes(eventType);

    const isInboxEvent = eventType === WebhookEventLabel.ORG_INBOX_NEW_MAIL;

    if (isInboxEvent) {
      return (
        <div style={{ marginBottom: 24 }}>
          <label
            style={{
              display: "block",
              marginBottom: 8,
              color: "rgba(0, 0, 0, 0.88)",
              fontSize: "14px",
            }}
          >
            <Tooltip title="Filter inbox notifications by topic">
              <Space>
                Topic Filter <InfoCircleOutlined style={{ color: "#aaa" }} />
              </Space>
            </Tooltip>
          </label>
          <Space direction="vertical" style={{ width: "100%" }}>
            <Input
              prefix={
                <Switch
                  checkedChildren="ALL"
                  unCheckedChildren="TOPIC"
                  checked={toggleSpecificResourceId}
                  disabled={isSwitchDisabled}
                  onChange={handleSwitchToggle}
                  style={{ marginRight: 8 }}
                />
              }
              placeholder="Enter topic name"
              value={
                toggleSpecificResourceId
                  ? ""
                  : filters.length > 0
                    ? JSON.parse(filters).topic || ""
                    : ""
              }
              onChange={(e) => {
                // Only allow changes if in TOPIC mode (not ALL)
                if (!toggleSpecificResourceId) {
                  // Store the topic in filters as JSON
                  setFilters(JSON.stringify({ topic: e.target.value }));
                  setFormChanged(true);
                }
              }}
              disabled={toggleSpecificResourceId}
              readOnly={toggleSpecificResourceId}
              variant="borderless"
              style={{ backgroundColor: "#fafafa" }}
            />
          </Space>
        </div>
      );
    }

    return (
      <div style={{ marginBottom: 24 }}>
        <label
          style={{
            display: "block",
            marginBottom: 8,
            color: "rgba(0, 0, 0, 0.88)",
            fontSize: "14px",
          }}
        >
          <Tooltip title={"Alternative index for the webhook"}>
            <Space>
              Listen To
              <InfoCircleOutlined style={{ color: "#aaa" }} />
            </Space>
          </Tooltip>
        </label>
        <Space direction="vertical" style={{ width: "100%" }}>
          <Input
            prefix={
              <Switch
                checkedChildren="ALL"
                unCheckedChildren="ONLY"
                checked={toggleSpecificResourceId}
                disabled={isSwitchDisabled}
                onChange={handleSwitchToggle}
                style={{ marginRight: 8 }}
              />
            }
            placeholder="Resource ID"
            value={altIndex}
            onChange={(e) => {
              // Only allow changes if not in ALL mode
              if (
                !toggleSpecificResourceId &&
                !MANDATORY_ALL_ALTINDEX_OPERATIONS.includes(eventType)
              ) {
                setAltIndex(e.target.value);
                setFormChanged(true);
              }
            }}
            disabled={isInputDisabled}
            readOnly={isInputReadOnly}
            variant="borderless"
            style={{ backgroundColor: "#fafafa" }}
          />
        </Space>
      </div>
    );
  };

  return (
    <Drawer
      title="Add New Webhook"
      placement="right"
      onClose={onClose}
      open={open}
      width={500}
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
            disabled={!eventType || !url || urlError !== null || loading}
          >
            Add Webhook
          </Button>
        </div>
      }
    >
      <div>
        <div style={{ marginBottom: 24 }}>
          <label
            style={{
              display: "block",
              marginBottom: 8,
              color: "rgba(0, 0, 0, 0.88)",
              fontSize: "14px",
            }}
          >
            <Tooltip title="URL to send webhook events to">
              <Space>
                Endpoint URL <InfoCircleOutlined style={{ color: "#aaa" }} />{" "}
                <span style={{ color: "#ff4d4f" }}>*</span>
              </Space>
            </Tooltip>
          </label>
          <Input
            prefix={<LinkOutlined />}
            size="large"
            placeholder="https://example.com/webhook"
            value={url}
            onChange={handleUrlChange}
            variant="borderless"
            style={{ backgroundColor: "#fafafa" }}
            status={urlError ? "error" : ""}
          />
          {urlError && (
            <div
              style={{ color: "#ff4d4f", fontSize: "14px", marginTop: "4px" }}
            >
              {urlError}
            </div>
          )}
        </div>

        <div style={{ marginBottom: 24 }}>
          <label
            style={{
              display: "block",
              marginBottom: 8,
              color: "rgba(0, 0, 0, 0.88)",
              fontSize: "14px",
            }}
          >
            <Tooltip title="Event type to trigger the webhook">
              <Space>
                Event Type <InfoCircleOutlined style={{ color: "#aaa" }} />{" "}
                <span style={{ color: "#ff4d4f" }}>*</span>
              </Space>
            </Tooltip>
          </label>
          <Select
            placeholder="Select event type"
            size="large"
            value={eventType}
            onChange={handleEventTypeChange}
            variant="borderless"
            style={{ backgroundColor: "#fafafa", width: "100%" }}
            showSearch
            filterOption={(input, option) =>
              (((option?.label as string) || "").toLowerCase() ?? "").includes(
                input.toLowerCase()
              )
            }
            optionFilterProp="label"
          >
            {WEBHOOK_EVENT_OPTIONS.map((event) => (
              <Option key={event.value} value={event.value} label={event.label}>
                {event.label}
              </Option>
            ))}
          </Select>
        </div>

        {/* Dynamic Alt Index field that changes based on event type */}
        {renderAltIndexField()}

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
            <div style={{ marginBottom: 24 }}>
              <label
                style={{
                  display: "block",
                  marginBottom: 8,
                  color: "rgba(0, 0, 0, 0.88)",
                  fontSize: "14px",
                }}
              >
                <Tooltip title="Name of this webhook">
                  <Space>
                    Name <InfoCircleOutlined style={{ color: "#aaa" }} />
                  </Space>
                </Tooltip>
              </label>
              <Input
                placeholder="Give this webhook a name"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  setFormChanged(true);
                }}
                variant="borderless"
                style={{ backgroundColor: "#fafafa" }}
              />
            </div>

            <div style={{ marginBottom: 24 }}>
              <label
                style={{
                  display: "block",
                  marginBottom: 8,
                  color: "rgba(0, 0, 0, 0.88)",
                  fontSize: "14px",
                }}
              >
                <Tooltip title="Description of this webhook">
                  <Space>
                    Description <InfoCircleOutlined style={{ color: "#aaa" }} />
                  </Space>
                </Tooltip>
              </label>
              <Input
                prefix={<InfoCircleOutlined />}
                placeholder="Add a note for this webhook"
                value={note}
                onChange={(e) => {
                  setNote(e.target.value);
                  setFormChanged(true);
                }}
                variant="borderless"
                style={{ backgroundColor: "#fafafa" }}
              />
            </div>

            <div style={{ marginBottom: 24 }}>
              <label
                style={{
                  display: "block",
                  marginBottom: 8,
                  color: "rgba(0, 0, 0, 0.88)",
                  fontSize: "14px",
                }}
              >
                <Tooltip title="Signature for webhook verification">
                  <Space>
                    Signature <InfoCircleOutlined style={{ color: "#aaa" }} />
                  </Space>
                </Tooltip>
              </label>
              <Input
                prefix={<ApiOutlined />}
                placeholder="Webhook signature for verification"
                value={signature}
                onChange={(e) => {
                  setSignature(e.target.value);
                  setFormChanged(true);
                }}
                variant="borderless"
                style={{ backgroundColor: "#fafafa" }}
              />
            </div>

            <div style={{ marginBottom: 24 }}>
              <label
                style={{
                  display: "block",
                  marginBottom: 8,
                  color: "rgba(0, 0, 0, 0.88)",
                  fontSize: "14px",
                }}
              >
                <Tooltip title="Whether the webhook is active">
                  <Space>
                    Active <InfoCircleOutlined style={{ color: "#aaa" }} />
                  </Space>
                </Tooltip>
              </label>
              <Switch
                checked={isActive}
                onChange={(checked) => {
                  setIsActive(checked);
                  setFormChanged(true);
                }}
              />
            </div>

            <div style={{ marginBottom: 24 }}>
              <label
                style={{
                  display: "block",
                  marginBottom: 8,
                  color: "rgba(0, 0, 0, 0.88)",
                  fontSize: "14px",
                }}
              >
                <Tooltip title="Labels to categorize this webhook">
                  <Space>
                    Labels <InfoCircleOutlined style={{ color: "#aaa" }} />
                  </Space>
                </Tooltip>
              </label>
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
            </div>

            <div style={{ marginBottom: 24 }}>
              <label
                style={{
                  display: "block",
                  marginBottom: 8,
                  color: "rgba(0, 0, 0, 0.88)",
                  fontSize: "14px",
                }}
              >
                <Tooltip title="External identifier for integration with other systems">
                  <Space>
                    External ID <InfoCircleOutlined style={{ color: "#aaa" }} />
                  </Space>
                </Tooltip>
              </label>
              <Input
                placeholder="External identifier"
                value={externalId}
                onChange={(e) => {
                  setExternalId(e.target.value);
                  setFormChanged(true);
                }}
                variant="borderless"
                style={{ backgroundColor: "#fafafa" }}
              />
            </div>

            <div style={{ marginBottom: 24 }}>
              <label
                style={{
                  display: "block",
                  marginBottom: 8,
                  color: "rgba(0, 0, 0, 0.88)",
                  fontSize: "14px",
                }}
              >
                <Tooltip title="Additional data for external integrations (JSON format)">
                  <Space>
                    External Payload{" "}
                    <InfoCircleOutlined style={{ color: "#aaa" }} />
                  </Space>
                </Tooltip>
              </label>
              <TextArea
                placeholder='{"key": "value"}'
                rows={2}
                value={externalPayload}
                onChange={(e) => {
                  setExternalPayload(e.target.value);
                  setFormChanged(true);
                }}
              />
            </div>
          </div>
        </details>
      </div>
    </Drawer>
  );
};

export default WebhooksAddDrawer;

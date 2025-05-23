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
  Select,
  message,
  Switch,
  Divider,
  Popover,
} from "antd";
import {
  DatabaseOutlined,
  TagOutlined,
  InfoCircleOutlined,
  GlobalOutlined,
  FileTextOutlined,
  KeyOutlined,
  CopyOutlined,
} from "@ant-design/icons";
import { useDispatch, useSelector } from "react-redux";
import { v4 as uuidv4 } from "uuid";
import {
  IRequestCreateDisk,
  DiskTypeEnum,
  GenerateID,
} from "@officexapp/types";
import {
  createDiskAction,
  listDisksAction,
} from "../../redux-offline/disks/disks.actions";
import { ReduxAppState } from "../../redux-offline/ReduxProvider";
import { generateRedeemDiskGiftCardURL } from "./disk.redeem";

const { Text, Paragraph } = Typography;
const { TextArea } = Input;
const { Option } = Select;

interface DisksAddDrawerProps {
  open: boolean;
  onClose: () => void;
  onAddDisk: (diskData: IRequestCreateDisk) => void;
}

const DisksAddDrawer: React.FC<DisksAddDrawerProps> = ({
  open,
  onClose,
  onAddDisk,
}) => {
  const dispatch = useDispatch();
  const isOnline = useSelector((state: ReduxAppState) => state.offline?.online);
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);
  const [displayedName, setDisplayedName] = useState("");
  const [diskType, setDiskType] = useState<DiskTypeEnum>(
    DiskTypeEnum.AwsBucket
  );
  const [labels, setLabels] = useState<string[]>([]);
  const [inputVisible, setInputVisible] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [formChanged, setFormChanged] = useState(false);
  const [giftLink, setGiftLink] = useState("");

  // Reset form when drawer opens
  useEffect(() => {
    if (open) {
      form.resetFields();
      setIsAdvancedOpen(false);
      setDisplayedName("");
      setDiskType(DiskTypeEnum.AwsBucket);
      setLabels([]);
      setInputVisible(false);
      setInputValue("");
      setFormChanged(false);
    }
  }, [open, form]);

  // Handle name change
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setDisplayedName(value);
    form.setFieldsValue({ name: value });
    setFormChanged(true);
  };

  // Handle disk type change
  const handleDiskTypeChange = (value: DiskTypeEnum) => {
    setDiskType(value);
    setFormChanged(true);
  };

  // Check if auth JSON field should be shown
  const shouldShowAuthJson = () => {
    return (
      diskType === DiskTypeEnum.StorjWeb3 || diskType === DiskTypeEnum.AwsBucket
    );
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

  const handleAddDisk = () => {
    form
      .validateFields()
      .then((values) => {
        // Create disk data from form values
        const diskData: IRequestCreateDisk = {
          id: GenerateID.Disk(),
          name: values.name,
          disk_type: values.diskType,
          public_note: values.publicNote || "",
          private_note: values.privateNote || "",
          auth_json: values.authJson || undefined,
          external_id: values.externalId || undefined,
          external_payload: values.externalPayload || undefined,
          endpoint: values.endpoint || undefined,
        };

        setLoading(true);

        // Dispatch the create disk action
        dispatch(createDiskAction(diskData));

        message.success(
          isOnline
            ? "Creating disk..."
            : "Queued disk creation for when you're back online"
        );

        message.success(`Page will refresh upon successful disk creation...`);

        // Call the parent's onAddDisk for any additional handling
        onAddDisk(diskData);

        // Close the drawer
        onClose();

        setLoading(false);
      })
      .catch((error) => {
        console.error("Validation failed:", error);
        setLoading(false);
      });
  };

  const generateGiftLink = async () => {
    try {
      // Get current form values
      const formValues = await form.validateFields();

      // Construct the gift card parameters from form values
      const giftParams = {
        name: formValues.name || displayedName,
        disk_type: formValues.diskType || diskType,
        public_note: formValues.publicNote || "",
        auth_json: formValues.authJson || "",
        endpoint: formValues.endpoint || "",
      };

      // Generate the URL
      const url = generateRedeemDiskGiftCardURL(giftParams);

      // Copy to clipboard
      await navigator.clipboard.writeText(url);
      message.success(`Gift link copied to clipboard!`);
      setGiftLink(url);
    } catch (error) {
      console.error("Error generating gift link:", error);
      message.error("Please fill in at least the name and disk type fields");
    }
  };

  return (
    <Drawer
      title="Add New Disk"
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
            onClick={handleAddDisk}
            type="primary"
            size="large"
            loading={loading}
            disabled={!displayedName || loading}
          >
            Add Disk
          </Button>
        </div>
      }
    >
      <Form
        form={form}
        layout="vertical"
        initialValues={{
          name: "",
          diskType: DiskTypeEnum.AwsBucket,
          publicNote: "",
          privateNote: "",
          authJson: "",
          externalId: "",
          externalPayload: "",
          endpoint: "",
        }}
      >
        <Form.Item
          name="diskType"
          label={
            <Tooltip title="Type of disk storage">
              <Space>
                Disk Type <InfoCircleOutlined style={{ color: "#aaa" }} />
              </Space>
            </Tooltip>
          }
          required
        >
          <Select
            placeholder="Select disk type"
            onChange={handleDiskTypeChange}
            value={diskType}
            variant="borderless"
            style={{ backgroundColor: "#fafafa" }}
          >
            <Option value={DiskTypeEnum.LocalSSD}>Physical SSD</Option>
            <Option value={DiskTypeEnum.StorjWeb3}>StorjWeb3 Bucket</Option>
            <Option value={DiskTypeEnum.AwsBucket}>Amazon Bucket</Option>
          </Select>
        </Form.Item>

        <Form.Item
          name="name"
          label={
            <Tooltip title="Name for the disk">
              <Space>
                Name <InfoCircleOutlined style={{ color: "#aaa" }} />
              </Space>
            </Tooltip>
          }
          required
        >
          <Input
            prefix={<DatabaseOutlined />}
            size="large"
            placeholder="Enter disk name"
            onChange={handleNameChange}
            variant="borderless"
            style={{ backgroundColor: "#fafafa" }}
          />
        </Form.Item>

        {shouldShowAuthJson() && (
          <Form.Item
            name="authJson"
            label={
              <Tooltip title="Authentication JSON for cloud storage">
                <Space>
                  Auth JSON <InfoCircleOutlined style={{ color: "#aaa" }} />
                </Space>
              </Tooltip>
            }
          >
            <TextArea
              placeholder='{"key": "value", ...}'
              rows={4}
              onChange={() => setFormChanged(true)}
              variant="borderless"
              style={{ backgroundColor: "#fafafa" }}
            />
          </Form.Item>
        )}

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

          <Form.Item
            name="publicNote"
            label={
              <Tooltip title="Public information about this disk">
                <Space>
                  Public Note <InfoCircleOutlined style={{ color: "#aaa" }} />
                </Space>
              </Tooltip>
            }
          >
            <TextArea
              placeholder="Public information about this disk"
              rows={2}
              onChange={() => setFormChanged(true)}
              variant="borderless"
              style={{ backgroundColor: "#fafafa" }}
            />
          </Form.Item>

          <div style={{ padding: "12px 0" }}>
            <Form.Item
              name="privateNote"
              label={
                <Tooltip title="Private notes for this disk (only visible to you)">
                  <Space>
                    Private Note{" "}
                    <InfoCircleOutlined style={{ color: "#aaa" }} />
                  </Space>
                </Tooltip>
              }
            >
              <TextArea
                placeholder="Private notes (only visible to you)"
                rows={2}
                onChange={() => setFormChanged(true)}
                variant="borderless"
                style={{ backgroundColor: "#fafafa" }}
              />
            </Form.Item>

            <Form.Item
              label={
                <Tooltip title="Labels to categorize this disk">
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
              name="endpoint"
              label={
                <Tooltip title="URL for info about this disk, including billing">
                  <Space>
                    Endpoint URL{" "}
                    <InfoCircleOutlined style={{ color: "#aaa" }} />
                  </Space>
                </Tooltip>
              }
            >
              <Input
                prefix={<GlobalOutlined />}
                placeholder="Service endpoint URL"
                onChange={() => setFormChanged(true)}
                variant="borderless"
                style={{ backgroundColor: "#fafafa" }}
              />
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
                placeholder="JSON payload for external systems"
                rows={2}
                onChange={() => setFormChanged(true)}
                variant="borderless"
                style={{ backgroundColor: "#fafafa" }}
              />
            </Form.Item>
            <Divider />
            <Popover
              content={`You can share this link with a friend for them to redeem the disk. You do not need to click "Add Disk"`}
            >
              <p style={{ color: "rgba(0, 0, 0, 0.4)" }}>
                Optional: Instead of adding this disk to your organization, you
                can gift it to a friend with a magic link to redeem.
              </p>
              <Input
                value={giftLink}
                readOnly
                suffix={
                  <CopyOutlined
                    onClick={() => {
                      navigator.clipboard.writeText(giftLink);
                      message.success("Copied to clipboard");
                    }}
                  />
                }
                prefix={
                  <Button size="small" type="dashed" onClick={generateGiftLink}>
                    Generate Gift Link
                  </Button>
                }
              />
            </Popover>
          </div>
        </details>
      </Form>
    </Drawer>
  );
};

export default DisksAddDrawer;

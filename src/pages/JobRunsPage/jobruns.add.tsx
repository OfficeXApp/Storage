// src/pages/JobRunsPage/jobruns.add.tsx

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
  RocketOutlined, // Changed icon
  TagOutlined,
  InfoCircleOutlined,
  GlobalOutlined,
  FileTextOutlined,
  UserOutlined,
  DollarOutlined,
  LinkOutlined,
} from "@ant-design/icons";
import { useDispatch, useSelector } from "react-redux";
import {
  IRequestCreateJobRun,
  JobRunStatus, // Import JobRunStatus
  GenerateID,
  UserID, // Assuming UserID is used for vendor_id
} from "@officexapp/types";
import { createJobRunAction } from "../../redux-offline/job-runs/job-runs.actions";
import { ReduxAppState } from "../../redux-offline/ReduxProvider";
import { useIdentitySystem } from "../../framework/identity"; // To get current user ID

const { Text, Paragraph } = Typography;
const { TextArea } = Input;
const { Option } = Select;

interface JobRunsAddDrawerProps {
  open: boolean;
  onClose: () => void;
  onAddJobRun: (jobRunData: IRequestCreateJobRun) => void;
}

const JobRunsAddDrawer: React.FC<JobRunsAddDrawerProps> = ({
  open,
  onClose,
  onAddJobRun,
}) => {
  const dispatch = useDispatch();
  const isOnline = useSelector((state: ReduxAppState) => state.offline?.online);
  const { currentProfile } = useIdentitySystem();
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);
  const [labels, setLabels] = useState<string[]>([]);
  const [inputVisible, setInputVisible] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [formChanged, setFormChanged] = useState(false);

  // Reset form when drawer opens
  useEffect(() => {
    if (open) {
      form.resetFields();
      setIsAdvancedOpen(false);
      setLabels([]);
      setInputVisible(false);
      setInputValue("");
      setFormChanged(false);
      form.setFieldsValue({
        status: JobRunStatus.REQUESTED, // Default status
        vendor_id: currentProfile?.userID, // Prefill with current user's ID
      });
    }
  }, [open, form, currentProfile?.userID]);

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

  const handleAddJobRun = () => {
    form
      .validateFields()
      .then((values) => {
        // Create job run data from form values
        const jobRunData: IRequestCreateJobRun = {
          id: GenerateID.JobRunID(), // Generate a new ID
          template_id: values.template_id || undefined,
          title: values.title,
          vendor_name: values.vendor_name,
          vendor_id: values.vendor_id || undefined, // Fallback to current user ID
          status: values.status,
          description: values.description || undefined,
          about_url: values.about_url,
          run_url: values.run_url || undefined,
          billing_url: values.billing_url || undefined,
          support_url: values.support_url || undefined,
          delivery_url: values.delivery_url || undefined,
          verification_url: values.verification_url || undefined,
          auth_installation_url: values.auth_installation_url || undefined,
          subtitle: values.subtitle || undefined,
          pricing: values.pricing || undefined,
          vendor_notes: values.vendor_notes || undefined,
          notes: values.notes || undefined, // This is an internal note, not directly updatable by vendor
          related_resources: values.related_resources || [],
          tracer: values.tracer || undefined,
          labels: values.labels || [], // Use the labels state
          external_id: values.external_id || undefined,
          external_payload: values.external_payload || undefined,
        };

        setLoading(true);

        // Dispatch the create job run action
        dispatch(createJobRunAction(jobRunData));

        message.info(
          isOnline
            ? "Creating job run..."
            : "Queued job run creation for when you're back online"
        );

        // Call the parent's onAddJobRun for any additional handling
        onAddJobRun(jobRunData);

        // Close the drawer
        onClose();

        setLoading(false);
      })
      .catch((error) => {
        console.error("Validation failed:", error);
        setLoading(false);
      });
  };

  return (
    <Drawer
      title="Create New Job Run"
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
            onClick={handleAddJobRun}
            type="primary"
            size="large"
            loading={loading}
            disabled={!formChanged || loading} // Disable save button if no changes
          >
            Create Job Run
          </Button>
        </div>
      }
    >
      <Form
        form={form}
        layout="vertical"
        initialValues={{
          status: JobRunStatus.REQUESTED, // Default status
          vendor_id: currentProfile?.userID, // Prefill with current user's ID
          labels: [],
          related_resources: [],
        }}
        onValuesChange={() => setFormChanged(true)} // Mark form as changed on any value change
      >
        <Form.Item
          name="title"
          label={
            <Tooltip title="Title of the job run">
              <Space>
                Title <InfoCircleOutlined style={{ color: "#aaa" }} />
              </Space>
            </Tooltip>
          }
          rules={[{ required: true, message: "Please enter a title" }]}
        >
          <Input
            prefix={<RocketOutlined />}
            size="large"
            placeholder="Enter job run title"
            variant="borderless"
            style={{ backgroundColor: "#fafafa" }}
          />
        </Form.Item>

        <Form.Item
          name="status"
          label={
            <Tooltip title="Current status of the job run">
              <Space>
                Status <InfoCircleOutlined style={{ color: "#aaa" }} />
              </Space>
            </Tooltip>
          }
          rules={[{ required: true, message: "Please select a status" }]}
        >
          <Select
            placeholder="Select job run status"
            variant="borderless"
            style={{ backgroundColor: "#fafafa" }}
          >
            {Object.values(JobRunStatus).map((status) => (
              <Option key={status} value={status}>
                {status}
              </Option>
            ))}
          </Select>
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

          <Form.Item
            name="vendor_name"
            label={
              <Tooltip title="Name of the vendor providing this job run">
                <Space>
                  Vendor Name <InfoCircleOutlined style={{ color: "#aaa" }} />
                </Space>
              </Tooltip>
            }
            rules={[{ message: "Please enter vendor name" }]}
          >
            <Input
              prefix={<UserOutlined />}
              placeholder="Vendor's Name"
              variant="borderless"
              style={{ backgroundColor: "#fafafa" }}
            />
          </Form.Item>

          <Form.Item
            name="about_url"
            label={
              <Tooltip title="URL with more information about this job run">
                <Space>
                  About URL <InfoCircleOutlined style={{ color: "#aaa" }} />
                </Space>
              </Tooltip>
            }
          >
            <Input
              prefix={<LinkOutlined />}
              placeholder="e.g., https://your-service.com/about-job"
              variant="borderless"
              style={{ backgroundColor: "#fafafa" }}
            />
          </Form.Item>

          <Form.Item
            name="template_id"
            label={
              <Tooltip title="ID of the job template this run is based on">
                <Space>
                  Template ID <InfoCircleOutlined style={{ color: "#aaa" }} />
                </Space>
              </Tooltip>
            }
          >
            <Input
              placeholder="Optional: Template ID"
              variant="borderless"
              style={{ backgroundColor: "#fafafa" }}
            />
          </Form.Item>

          <Form.Item
            name="description"
            label={
              <Tooltip title="Detailed description of the job run">
                <Space>
                  Description <InfoCircleOutlined style={{ color: "#aaa" }} />
                </Space>
              </Tooltip>
            }
          >
            <TextArea
              placeholder="Detailed description of the job run"
              rows={2}
              variant="borderless"
              style={{ backgroundColor: "#fafafa" }}
            />
          </Form.Item>

          <Form.Item
            name="subtitle"
            label={
              <Tooltip title="A short subtitle for the job run">
                <Space>
                  Subtitle <InfoCircleOutlined style={{ color: "#aaa" }} />
                </Space>
              </Tooltip>
            }
          >
            <Input
              placeholder="Optional: Subtitle"
              variant="borderless"
              style={{ backgroundColor: "#fafafa" }}
            />
          </Form.Item>

          <Form.Item
            name="pricing"
            label={
              <Tooltip title="Pricing information for the job run">
                <Space>
                  Pricing <InfoCircleOutlined style={{ color: "#aaa" }} />
                </Space>
              </Tooltip>
            }
          >
            <Input
              prefix={<DollarOutlined />}
              placeholder="e.g., $10/month, One-time payment of $50"
              variant="borderless"
              style={{ backgroundColor: "#fafafa" }}
            />
          </Form.Item>

          <Form.Item
            name="vendor_notes"
            label={
              <Tooltip title="Notes visible only to the vendor (you)">
                <Space>
                  Vendor Notes <InfoCircleOutlined style={{ color: "#aaa" }} />
                </Space>
              </Tooltip>
            }
          >
            <TextArea
              placeholder="Private notes for the vendor"
              rows={2}
              variant="borderless"
              style={{ backgroundColor: "#fafafa" }}
            />
          </Form.Item>

          <Form.Item
            name="notes"
            label={
              <Tooltip title="Internal notes, not viewable by vendor">
                <Space>
                  Internal Notes{" "}
                  <InfoCircleOutlined style={{ color: "#aaa" }} />
                </Space>
              </Tooltip>
            }
          >
            <TextArea
              placeholder="Internal notes (only visible to your organization)"
              rows={2}
              variant="borderless"
              style={{ backgroundColor: "#fafafa" }}
            />
          </Form.Item>

          <Form.Item
            name="run_url"
            label={
              <Tooltip title="URL to run or access the job">
                <Space>
                  Run URL <InfoCircleOutlined style={{ color: "#aaa" }} />
                </Space>
              </Tooltip>
            }
          >
            <Input
              prefix={<LinkOutlined />}
              placeholder="URL to initiate or access the job"
              variant="borderless"
              style={{ backgroundColor: "#fafafa" }}
            />
          </Form.Item>

          <Form.Item
            name="billing_url"
            label={
              <Tooltip title="URL for billing details related to this job run">
                <Space>
                  Billing URL <InfoCircleOutlined style={{ color: "#aaa" }} />
                </Space>
              </Tooltip>
            }
          >
            <Input
              prefix={<LinkOutlined />}
              placeholder="URL for billing"
              variant="borderless"
              style={{ backgroundColor: "#fafafa" }}
            />
          </Form.Item>

          <Form.Item
            name="support_url"
            label={
              <Tooltip title="URL for support related to this job run">
                <Space>
                  Support URL <InfoCircleOutlined style={{ color: "#aaa" }} />
                </Space>
              </Tooltip>
            }
          >
            <Input
              prefix={<LinkOutlined />}
              placeholder="URL for support"
              variant="borderless"
              style={{ backgroundColor: "#fafafa" }}
            />
          </Form.Item>

          <Form.Item
            name="delivery_url"
            label={
              <Tooltip title="URL for delivery status or output of the job">
                <Space>
                  Delivery URL <InfoCircleOutlined style={{ color: "#aaa" }} />
                </Space>
              </Tooltip>
            }
          >
            <Input
              prefix={<LinkOutlined />}
              placeholder="URL for delivery"
              variant="borderless"
              style={{ backgroundColor: "#fafafa" }}
            />
          </Form.Item>

          <Form.Item
            name="verification_url"
            label={
              <Tooltip title="URL for verifying job completion or output">
                <Space>
                  Verification URL{" "}
                  <InfoCircleOutlined style={{ color: "#aaa" }} />
                </Space>
              </Tooltip>
            }
          >
            <Input
              prefix={<LinkOutlined />}
              placeholder="URL for verification"
              variant="borderless"
              style={{ backgroundColor: "#fafafa" }}
            />
          </Form.Item>

          <Form.Item
            name="auth_installation_url"
            label={
              <Tooltip title="URL to the script or instructions for installing the job">
                <Space>
                  Installation URL{" "}
                  <InfoCircleOutlined style={{ color: "#aaa" }} />
                </Space>
              </Tooltip>
            }
          >
            <Input
              prefix={<LinkOutlined />}
              placeholder="URL for installation script"
              variant="borderless"
              style={{ backgroundColor: "#fafafa" }}
            />
          </Form.Item>

          <Form.Item
            name="related_resources"
            label={
              <Tooltip title="IDs of resources related to this job run">
                <Space>
                  Related Resources (IDs){" "}
                  <InfoCircleOutlined style={{ color: "#aaa" }} />
                </Space>
              </Tooltip>
            }
          >
            <Select
              mode="tags"
              placeholder="Add related resource IDs"
              variant="borderless"
              style={{ backgroundColor: "#fafafa" }}
            />
          </Form.Item>

          <Form.Item
            name="tracer"
            label={
              <Tooltip title="An optional tracer string for tracking">
                <Space>
                  Tracer <InfoCircleOutlined style={{ color: "#aaa" }} />
                </Space>
              </Tooltip>
            }
          >
            <Input
              placeholder="Optional: Tracer string"
              variant="borderless"
              style={{ backgroundColor: "#fafafa" }}
            />
          </Form.Item>

          <Form.Item
            name="labels"
            label={
              <Tooltip title="Labels to categorize this job run">
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
              variant="borderless"
              style={{ backgroundColor: "#fafafa" }}
            />
          </Form.Item>

          <Form.Item
            name="external_payload"
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
              variant="borderless"
              style={{ backgroundColor: "#fafafa" }}
            />
          </Form.Item>
        </details>
      </Form>
    </Drawer>
  );
};

export default JobRunsAddDrawer;

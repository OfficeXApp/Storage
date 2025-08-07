// src/components/DrivesPage/drive.add.tsx

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
  message,
} from "antd";
import {
  DatabaseOutlined,
  GlobalOutlined,
  InfoCircleOutlined,
  TagOutlined,
  WalletOutlined,
  FileTextOutlined,
  LinkOutlined,
} from "@ant-design/icons";
import { useDispatch, useSelector } from "react-redux";
import { v4 as uuidv4 } from "uuid";
import {
  IRequestCreateDrive,
  DriveID,
  ICPPrincipalString,
} from "@officexapp/types";
import { isValidIcpAddress } from "../../api/icp";
import { createDriveAction } from "../../redux-offline/drives/drives.actions";
import { ReduxAppState } from "../../redux-offline/ReduxProvider";

const { Text, Paragraph } = Typography;
const { TextArea } = Input;

interface DrivesAddDrawerProps {
  open: boolean;
  onClose: () => void;
  onAddDrive: (driveData: IRequestCreateDrive) => void;
}

const DrivesAddDrawer: React.FC<DrivesAddDrawerProps> = ({
  open,
  onClose,
  onAddDrive,
}) => {
  const dispatch = useDispatch();
  const isOnline = useSelector((state: ReduxAppState) => state.offline?.online);
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);
  const [shareLink, setShareLink] = useState("");
  const [shareLinkError, setShareLinkError] = useState<string | null>(null);
  const [displayedName, setDisplayedName] = useState("");
  const [icpAddress, setIcpAddress] = useState("");
  const [endpointUrl, setEndpointUrl] = useState("");
  const [labels, setLabels] = useState<string[]>([]);
  const [inputVisible, setInputVisible] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [formChanged, setFormChanged] = useState(false);

  // Reset form when drawer opens
  useEffect(() => {
    if (open) {
      form.resetFields();
      setIsAdvancedOpen(false);
      setShareLink("");
      setShareLinkError(null);
      setDisplayedName("");
      setIcpAddress("");
      setEndpointUrl("");
      setLabels([]);
      setInputVisible(false);
      setInputValue("");
      setFormChanged(false);
    }
  }, [open, form]);

  // Parse organization share link
  const handleShareLinkChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setShareLink(value);
    setFormChanged(true);

    // Clear previous values
    setShareLinkError(null);

    // Format: {org_name}:{drive_id}@{endpoint}
    if (value && value.includes(":") && value.includes("@")) {
      try {
        // Parse organization share link
        const [orgWithDriveId, endpoint] = value.split("@");
        const [orgName, driveId] = orgWithDriveId.split(":");

        // Clean up the organization name
        const cleanedOrgName = orgName.replace(/_/g, " ").trim();

        // Clean up the drive ID to get ICP principal
        const icpPrincipal = driveId.startsWith("DriveID_")
          ? driveId.substring(8)
          : driveId;

        // Validate ICP principal
        if (!isValidIcpAddress(icpPrincipal)) {
          setShareLinkError(
            `Invalid DriveID format in share link. ${icpPrincipal}`
          );
          return;
        }

        // Set extracted values
        setDisplayedName(cleanedOrgName);
        setIcpAddress(icpPrincipal);
        setEndpointUrl(endpoint);

        // Update form values
        form.setFieldsValue({
          name: cleanedOrgName,
          icpPrincipal: icpPrincipal,
          endpointUrl: endpoint,
        });

        setShareLinkError("Share link parsed successfully");
      } catch (error) {
        setShareLinkError(
          "Invalid format. Expected: {org_name}:{drive_id}@{endpoint}"
        );
      }
    } else if (value) {
      setShareLinkError(
        "Invalid format. Expected: {org_name}:{drive_id}@{endpoint}"
      );
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

  const handleAddDrive = () => {
    console.log("Adding drive...");
    form
      .validateFields()
      .then((values) => {
        console.log("Form values:", values);

        // Use either extracted values from share link or form values
        const driveName = displayedName || values.name;
        const driveIcpPrincipal = icpAddress || values.icpPrincipal;
        const driveEndpoint = endpointUrl || values.endpointUrl;

        if (!driveName) {
          message.error("Drive name is required");
          return;
        }

        if (!driveIcpPrincipal || !isValidIcpAddress(driveIcpPrincipal)) {
          message.error("Valid ICP principal is required");
          return;
        }

        const driveData: IRequestCreateDrive = {
          name: driveName,
          icp_principal: driveIcpPrincipal,
          host_url: driveEndpoint || undefined,
          public_note: values.publicNote || "",
          private_note: values.privateNote || "",
          external_id: values.externalId || undefined,
          external_payload: values.externalPayload || undefined,
        };

        console.log("Drive data:", driveData);

        setLoading(true);

        // Dispatch the create drive action
        dispatch(createDriveAction(driveData));

        message.info(
          isOnline
            ? "Creating drive..."
            : "Queued drive creation for when you're back online"
        );

        // Call the parent's onAddDrive for any additional handling
        onAddDrive(driveData);

        // Close the drawer and show success message
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
      title="Add New Drive"
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
            onClick={handleAddDrive}
            type="primary"
            size="large"
            loading={loading}
            disabled={loading}
          >
            Add Server
          </Button>
        </div>
      }
    >
      <Form
        form={form}
        layout="vertical"
        initialValues={{
          shareLink: "",
          name: "",
          icpPrincipal: "",
          endpointUrl: "",
          publicNote: "",
          privateNote: "",
          externalId: "",
          externalPayload: "",
        }}
      >
        <Form.Item
          name="shareLink"
          label={
            <Tooltip title="Organization share link format: {org_name}:{drive_id}@{endpoint}">
              <Space>
                Organization Share Link{" "}
                <InfoCircleOutlined style={{ color: "#aaa" }} />
              </Space>
            </Tooltip>
          }
          validateStatus={
            shareLinkError
              ? shareLinkError.includes("parsed successfully")
                ? "success"
                : "error"
              : ""
          }
          help={
            shareLinkError && (
              <span
                style={{
                  color: shareLinkError.includes("parsed successfully")
                    ? "#52c41a" // Green color for success
                    : "#ff4d4f", // Red color for error
                }}
              >
                {shareLinkError}
              </span>
            )
          }
        >
          <Input
            prefix={<LinkOutlined />}
            size="large"
            placeholder="OrgName:DriveID_abc123@https://example.com"
            onChange={handleShareLinkChange}
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
                <Tooltip title="Drive name">
                  <Space>
                    Name <InfoCircleOutlined style={{ color: "#aaa" }} />
                  </Space>
                </Tooltip>
              }
            >
              <Input
                prefix={<DatabaseOutlined />}
                placeholder="Enter drive name"
                value={displayedName}
                onChange={(e) => {
                  setDisplayedName(e.target.value);
                  setFormChanged(true);
                }}
                variant="borderless"
                style={{ backgroundColor: "#fafafa" }}
              />
            </Form.Item>

            <Form.Item
              name="icpPrincipal"
              label={
                <Tooltip title="ICP principal for this drive">
                  <Space>
                    ICP Principal{" "}
                    <InfoCircleOutlined style={{ color: "#aaa" }} />
                  </Space>
                </Tooltip>
              }
            >
              <Input
                prefix={<WalletOutlined />}
                placeholder="Enter ICP principal"
                value={icpAddress}
                onChange={(e) => {
                  setIcpAddress(e.target.value);
                  setFormChanged(true);
                }}
                variant="borderless"
                style={{ backgroundColor: "#fafafa" }}
              />
            </Form.Item>

            <Form.Item
              name="endpointUrl"
              label={
                <Tooltip title="Endpoint URL for this drive">
                  <Space>
                    Endpoint URL{" "}
                    <InfoCircleOutlined style={{ color: "#aaa" }} />
                  </Space>
                </Tooltip>
              }
            >
              <Input
                prefix={<GlobalOutlined />}
                placeholder="https://example.com/endpoint"
                value={endpointUrl}
                onChange={(e) => {
                  setEndpointUrl(e.target.value);
                  setFormChanged(true);
                }}
                variant="borderless"
                style={{ backgroundColor: "#fafafa" }}
              />
            </Form.Item>

            <Form.Item
              name="publicNote"
              label={
                <Tooltip title="Public information about this drive">
                  <Space>
                    Public Note <InfoCircleOutlined style={{ color: "#aaa" }} />
                  </Space>
                </Tooltip>
              }
            >
              <TextArea
                placeholder="Public information about this drive"
                rows={2}
                onChange={() => setFormChanged(true)}
              />
            </Form.Item>

            <Form.Item
              name="privateNote"
              label={
                <Tooltip title="Private information about this drive (only visible to you)">
                  <Space>
                    Private Note{" "}
                    <InfoCircleOutlined style={{ color: "#aaa" }} />
                  </Space>
                </Tooltip>
              }
            >
              <TextArea
                placeholder="Private information about this drive"
                rows={2}
                onChange={() => setFormChanged(true)}
              />
            </Form.Item>

            <Form.Item
              label={
                <Tooltip title="Labels to categorize this drive">
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
              <Input.TextArea
                placeholder="Additional data for external systems"
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

export default DrivesAddDrawer;

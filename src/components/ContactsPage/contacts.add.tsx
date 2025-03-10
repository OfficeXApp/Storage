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
  Popover,
  Switch,
  message,
  Divider,
} from "antd";
import {
  UserOutlined,
  MailOutlined,
  BellOutlined,
  TagOutlined,
  InfoCircleOutlined,
  ReloadOutlined,
  FileTextOutlined,
  GlobalOutlined,
  WalletOutlined,
} from "@ant-design/icons";
import { generate } from "random-words";
import { v4 as uuidv4 } from "uuid";
import { IRequestCreateContact, UserID } from "@officexapp/types";
import { useIdentitySystem } from "../../framework/identity";
import { Principal } from "@dfinity/principal";

const { Text, Paragraph } = Typography;
const { TextArea } = Input;

// Helper function to validate ICP address (placeholder implementation)
const isValidIcpAddress = (address: string): boolean => {
  try {
    // Try to create a Principal object
    // This will throw an error if the format is invalid
    const principal = Principal.fromText(address);
    return true;
  } catch (error) {
    console.error("Invalid Principal ID:", error);
    return false;
  }
};

// Helper function to generate a random seed phrase
const generateRandomSeed = (): string => {
  return (generate(12) as string[]).join(" ");
};

interface ContactsAddDrawerProps {
  open: boolean;
  onClose: () => void;
  onAddContact: (contactData: IRequestCreateContact) => void;
}

const ContactsAddDrawer: React.FC<ContactsAddDrawerProps> = ({
  open,
  onClose,
  onAddContact,
}) => {
  const [form] = Form.useForm();
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);
  const [seedPhrase, setSeedPhrase] = useState(generateRandomSeed());
  const [isOwned, setIsOwned] = useState(false);
  const [icpAddress, setIcpAddress] = useState("");
  const [evmAddress, setEvmAddress] = useState("");
  const [userStringError, setUserStringError] = useState<string | null>(null);
  const [icpAddressError, setIcpAddressError] = useState<string | null>(null);
  const [tags, setTags] = useState<string[]>([]);
  const [inputVisible, setInputVisible] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [formChanged, setFormChanged] = useState(false);
  const { deriveProfileFromSeed } = useIdentitySystem();

  // Reset form when drawer opens
  useEffect(() => {
    if (open) {
      form.resetFields();
      setIsAdvancedOpen(false);
      setSeedPhrase(generateRandomSeed());
      setIsOwned(false);
      setIcpAddress("");
      setEvmAddress("");
      setUserStringError(null);
      setIcpAddressError(null);
      setTags([]);
      setInputVisible(false);
      setInputValue("");
      setFormChanged(false);
    }
  }, [open, form]);

  // Generate wallet addresses based on seed phrase
  useEffect(() => {
    const generateAddresses = async () => {
      if (isOwned && seedPhrase) {
        try {
          const tempProfile = await deriveProfileFromSeed(seedPhrase);
          setIcpAddress(tempProfile.icpPublicAddress);
          setEvmAddress(tempProfile.evmPublicAddress);
        } catch (error) {
          console.error("Error generating addresses:", error);
        }
      }
    };

    generateAddresses();
  }, [seedPhrase, isOwned]);

  // Parse user string if present
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    form.setFieldsValue({ name: value });
    setFormChanged(true);

    if (value.includes("@")) {
      try {
        const [nameWithUnderscores, userIdWithPrefix] = value.split("@");
        const name = nameWithUnderscores.replace(/_/g, " ");
        const userId = userIdWithPrefix.startsWith("UserID_")
          ? userIdWithPrefix.substring(7)
          : userIdWithPrefix;

        console.log("userId", userId);

        if (isValidIcpAddress(userId)) {
          form.setFieldsValue({ name });
          setIcpAddress(userId);
          setIsOwned(false);
          setUserStringError(null);
          setUserStringError("Userstring verified successfully");
        } else {
          setUserStringError("Invalid UserID format");
        }
      } catch (error) {
        setUserStringError(
          "Invalid format. Expected: Name_With_Underscores@UserID_xyz"
        );
      }
    } else {
      setUserStringError(null);
    }
  };

  // Handle ICP address change when not using seed phrase
  const handleIcpAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setIcpAddress(value);
    setFormChanged(true);

    if (value && !isValidIcpAddress(value)) {
      setIcpAddressError("Invalid ICP address format");
    } else {
      setIcpAddressError(null);
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

  const regenerateSeed = () => {
    setSeedPhrase(generateRandomSeed());
    setFormChanged(true);
  };

  const handleAddContact = () => {
    form
      .validateFields()
      .then((values) => {
        // Validate ICP address if not owned
        if (!isOwned && (!icpAddress || icpAddressError)) {
          setIcpAddressError("Valid ICP address is required");
          return;
        }

        const contactData: IRequestCreateContact = {
          action: "CREATE",
          nickname: values.name,
          icp_principal: icpAddress || `principal_${uuidv4()}`,
          evm_public_address: evmAddress || undefined,
          public_note: values.publicNote || "",
          external_id: values.externalId || undefined,
        };

        onAddContact(contactData);
        onClose();
        message.success(`Contact ${values.name} added successfully!`);
      })
      .catch((error) => {
        console.error("Validation failed:", error);
      });
  };

  const renderReadOnlyField = (
    label: string,
    value: string,
    icon: React.ReactNode,
    tooltip: string
  ) => {
    return (
      <Form.Item
        label={
          <Tooltip title={tooltip}>
            <Space>
              {label} <InfoCircleOutlined style={{ color: "#aaa" }} />
            </Space>
          </Tooltip>
        }
      >
        <Input
          prefix={icon}
          value={value}
          readOnly
          variant="borderless"
          style={{ backgroundColor: "#fafafa" }}
          suffix={
            <Typography.Text
              copyable={{ text: value }}
              style={{ color: "#8c8c8c" }}
            />
          }
        />
      </Form.Item>
    );
  };

  return (
    <Drawer
      title="Add New Contact"
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
            onClick={handleAddContact}
            type="primary"
            size="large"
            disabled={
              !formChanged ||
              !form.getFieldValue("name") ||
              (icpAddressError !== null && !isOwned)
            }
          >
            Add Contact
          </Button>
        </div>
      }
    >
      <Form
        form={form}
        layout="vertical"
        initialValues={{
          name: "",
          email: "",
          notificationsUrl: "",
          publicNote: "",
          externalId: "",
        }}
      >
        <Form.Item
          name="name"
          label={
            <Tooltip title="Contact name or user string (format: Name_With_Underscores@UserID_xyz)">
              <Space>
                Name <InfoCircleOutlined style={{ color: "#aaa" }} />
              </Space>
            </Tooltip>
          }
          required
          validateStatus={
            userStringError
              ? userStringError.includes("verified successfully")
                ? "success"
                : "error"
              : ""
          }
          help={
            userStringError && (
              <span
                style={{
                  color: userStringError.includes("verified successfully")
                    ? "#52c41a" // Green color for success
                    : "#ff4d4f", // Red color for error
                }}
              >
                {userStringError}
              </span>
            )
          }
          style={{ marginBottom: userStringError ? 48 : 0 }}
        >
          <Input
            prefix={<UserOutlined />}
            size="large"
            placeholder="Enter name or userstring"
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
              name="email"
              label={
                <Tooltip title="Email address for contact">
                  <Space>
                    Email <InfoCircleOutlined style={{ color: "#aaa" }} />
                  </Space>
                </Tooltip>
              }
            >
              <Input
                prefix={<MailOutlined />}
                placeholder="Enter email"
                onChange={() => setFormChanged(true)}
                variant="borderless"
                style={{ backgroundColor: "#fafafa" }}
              />
            </Form.Item>

            <Form.Item
              name="notificationsUrl"
              label={
                <Tooltip title="URL for sending notifications to this contact">
                  <Space>
                    Notifications URL{" "}
                    <InfoCircleOutlined style={{ color: "#aaa" }} />
                  </Space>
                </Tooltip>
              }
            >
              <Input
                prefix={<BellOutlined />}
                placeholder="https://example.com/notifications"
                onChange={() => setFormChanged(true)}
                variant="borderless"
                style={{ backgroundColor: "#fafafa" }}
              />
            </Form.Item>

            <Form.Item
              label={
                <Tooltip title="Control whether you own this contact's wallet with a seed phrase">
                  <Space>
                    Own this profile with seed phrase{" "}
                    <InfoCircleOutlined style={{ color: "#aaa" }} />
                  </Space>
                </Tooltip>
              }
            >
              <Switch
                checked={isOwned}
                onChange={(checked) => {
                  setIsOwned(checked);
                  setFormChanged(true);
                  if (!checked) {
                    setIcpAddress("");
                    setEvmAddress("");
                  } else {
                    // Generate new addresses when switching to owned mode
                    const generateAddresses = async () => {
                      try {
                        const tempProfile =
                          await deriveProfileFromSeed(seedPhrase);
                        setIcpAddress(tempProfile.icpPublicAddress);
                        setEvmAddress(tempProfile.evmPublicAddress);
                      } catch (error) {
                        console.error("Error generating addresses:", error);
                      }
                    };
                    generateAddresses();
                  }
                }}
              />
            </Form.Item>

            {isOwned ? (
              <>
                <Form.Item
                  label={
                    <Tooltip title="12-word seed phrase to generate wallet addresses">
                      <Space>
                        Seed Phrase{" "}
                        <InfoCircleOutlined style={{ color: "#aaa" }} />
                      </Space>
                    </Tooltip>
                  }
                >
                  <Input.TextArea
                    value={seedPhrase}
                    onChange={(e) => {
                      setSeedPhrase(e.target.value);
                      setFormChanged(true);
                    }}
                    rows={2}
                  />
                  <div style={{ textAlign: "right", marginTop: "4px" }}>
                    <Button
                      type="text"
                      icon={<ReloadOutlined />}
                      onClick={regenerateSeed}
                      size="small"
                    >
                      Regenerate
                    </Button>
                  </div>
                </Form.Item>

                {renderReadOnlyField(
                  "ICP Address",
                  icpAddress,
                  <WalletOutlined />,
                  "ICP wallet address derived from seed phrase"
                )}

                {renderReadOnlyField(
                  "EVM Address",
                  evmAddress,
                  <WalletOutlined />,
                  "Ethereum wallet address derived from seed phrase"
                )}
              </>
            ) : (
              <>
                <Form.Item
                  label={
                    <Tooltip title="ICP wallet address for this contact">
                      <Space>
                        ICP Address{" "}
                        <InfoCircleOutlined style={{ color: "#aaa" }} />
                      </Space>
                    </Tooltip>
                  }
                  validateStatus={icpAddressError ? "error" : ""}
                  help={icpAddressError}
                  required
                >
                  <Input
                    prefix={<WalletOutlined />}
                    placeholder="xyz123..."
                    value={icpAddress}
                    onChange={handleIcpAddressChange}
                    variant="borderless"
                    style={{ backgroundColor: "#fafafa" }}
                  />
                </Form.Item>
              </>
            )}

            <Form.Item
              name="publicNote"
              label={
                <Tooltip title="Public information about this contact">
                  <Space>
                    Public Note <InfoCircleOutlined style={{ color: "#aaa" }} />
                  </Space>
                </Tooltip>
              }
            >
              <TextArea
                placeholder="Public information about this contact"
                rows={2}
                onChange={() => setFormChanged(true)}
              />
            </Form.Item>

            <Form.Item
              label={
                <Tooltip title="Tags to categorize this contact">
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
          </div>
        </details>
      </Form>
    </Drawer>
  );
};

export default ContactsAddDrawer;

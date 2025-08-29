// src/components/ContactsPage/contact.add.tsx

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
import toast from "react-hot-toast";
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
import { useDispatch, useSelector } from "react-redux";
import { generate } from "random-words";
import { v4 as uuidv4 } from "uuid";
import { IRequestCreateContact, UserID } from "@officexapp/types";
import { useIdentitySystem } from "../../framework/identity";
import { Principal } from "@dfinity/principal";
import { generateRandomSeed, isValidIcpAddress } from "../../api/icp";
import { createContactAction } from "../../redux-offline/contacts/contacts.actions";
import { ReduxAppState } from "../../redux-offline/ReduxProvider";

const { Text, Paragraph } = Typography;
const { TextArea } = Input;

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
  const dispatch = useDispatch();
  const isOnline = useSelector((state: ReduxAppState) => state.offline?.online);
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);
  const [seedPhrase, setSeedPhrase] = useState(generateRandomSeed());
  const [displayedName, setDisplayedName] = useState("");
  const [isOwned, setIsOwned] = useState(false);
  const [icpAddress, setIcpAddress] = useState("");
  const [evmAddress, setEvmAddress] = useState("");
  const [userStringError, setUserStringError] = useState<string | null>(null);
  const [icpAddressError, setIcpAddressError] = useState<string | null>(null);
  const [labels, setLabels] = useState<string[]>([]);
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
      generateRandomIcpAddress();
      setIsOwned(false);
      setIcpAddress("");
      setEvmAddress("");
      setUserStringError(null);
      setIcpAddressError(null);
      setLabels([]);
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
    setDisplayedName(value);
    form.setFieldsValue({ name: value });
    setFormChanged(true);

    if (value.includes("@")) {
      try {
        const [nameWithUnderscores, userIdWithPrefix] = value.split("@");
        const name = nameWithUnderscores.replace(/_/g, " ");
        const userId = userIdWithPrefix.startsWith("UserID_")
          ? userIdWithPrefix.substring(7)
          : userIdWithPrefix;

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
          name: values.name,
          id: `UserID_${icpAddress}`,
          evm_public_address: evmAddress || undefined,
          public_note: values.publicNote || "",
          external_id: values.externalId || undefined,
          is_placeholder: !isOwned,
          seed_phrase: isOwned ? seedPhrase : undefined,
        };

        setLoading(true);

        // Dispatch the create contact action
        dispatch(createContactAction(contactData));

        toast.success(
          isOnline ? (
            <span>Creating contact...</span>
          ) : (
            <span>Queued contact creation for when you're back online</span>
          )
        );

        // Call the parent's onAddContact for any additional handling
        onAddContact(contactData);

        // Close the drawer and show success message
        onClose();

        setLoading(false);
      })
      .catch((error) => {
        console.error("Validation failed:", error);
        setLoading(false);
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

  const generateRandomIcpAddress = async () => {
    try {
      // Generate a temporary seed phrase just to get an ICP address
      const tempSeed = generateRandomSeed();
      const tempProfile = await deriveProfileFromSeed(tempSeed);
      setIcpAddress(tempProfile.icpPublicAddress);
      setIcpAddressError(null);
      setFormChanged(true);
    } catch (error) {
      console.error("Error generating random ICP address:", error);
      setIcpAddressError("Failed to generate ICP address");
    }
  };

  const renderIcpAddressField = () => {
    return (
      <Form.Item
        label={
          <Tooltip title="ICP wallet address for this contact">
            <Space>
              ICP Address <InfoCircleOutlined style={{ color: "#aaa" }} />
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
          suffix={
            <Tooltip title="Generate random ICP address">
              <Button
                type="text"
                icon={<ReloadOutlined />}
                onClick={generateRandomIcpAddress}
                size="small"
              />
            </Tooltip>
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
      footer={
        <div style={{ textAlign: "right" }}>
          <Button size="large" onClick={onClose} style={{ marginRight: 8 }}>
            Cancel
          </Button>
          <Button
            onClick={handleAddContact}
            type="primary"
            size="large"
            loading={loading}
            disabled={
              !displayedName ||
              (icpAddressError !== null && !isOwned) ||
              loading
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
                    <Typography.Text
                      copyable={{ text: seedPhrase }}
                      style={{ color: "#8c8c8c" }}
                    />
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
              renderIcpAddressField()
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
                <Tooltip title="Labels to categorize this contact">
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
          </div>
        </details>
      </Form>
    </Drawer>
  );
};

export default ContactsAddDrawer;

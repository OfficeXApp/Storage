import React, { useState, useEffect } from "react";
import {
  Button,
  Drawer,
  Typography,
  Input,
  Form,
  Space,
  Tooltip,
  message,
  Select,
  DatePicker,
  Avatar,
  Tag,
  Spin,
  Radio,
} from "antd";
import {
  InfoCircleOutlined,
  UserOutlined,
  CopyOutlined,
  LinkOutlined,
  SearchOutlined,
  GlobalOutlined,
  UserSwitchOutlined,
  FormOutlined,
} from "@ant-design/icons";
import { useDispatch, useSelector } from "react-redux";
import { v4 as uuidv4 } from "uuid";
import {
  IRequestCreateGroupInvite,
  GroupID,
  GroupRole,
  ContactFE,
  UserID,
  GenerateID,
} from "@officexapp/types";
import { createGroupInviteAction } from "../../redux-offline/group-invites/group-invites.actions";
import { ReduxAppState } from "../../redux-offline/ReduxProvider";
import { shortenAddress } from "../../framework/identity/constants";
import { useIdentitySystem } from "../../framework/identity";
import { GroupFEO } from "../../redux-offline/groups/groups.reducer";
import { urlSafeBase64Encode } from "../../api/helpers";
import { generateRedeemGroupInviteURL } from "./invite.redeem";
import dayjs from "dayjs";

const { Text, Title } = Typography;
const { TextArea } = Input;
const { Option } = Select;
const { RangePicker } = DatePicker;

interface AddGroupInviteDrawerProps {
  open: boolean;
  onClose: () => void;
  group: GroupFEO;
}

enum InviteType {
  PUBLIC = "PUBLIC",
  SELECT_CONTACT = "SELECT_CONTACT",
  ENTER_USERLABEL = "ENTER_USERLABEL",
  MAGIC_LINK = "MAGIC_LINK",
}

// Helper function to extract user ID from various formats
const extractUserID = (input: string): string | null => {
  // Case: Full format with @
  if (input.includes("@")) {
    const parts = input.split("@");
    if (parts.length > 1 && parts[1].startsWith("UserID_")) {
      return parts[1];
    }
  }

  // Case: Just UserID_xxx
  if (input.startsWith("UserID_")) {
    return input;
  }

  // Case: Raw principal without UserID_ prefix
  if (/^[a-z0-9-]+$/.test(input) && input.includes("-")) {
    return `UserID_${input}`;
  }

  return null;
};

const AddGroupInviteDrawer: React.FC<AddGroupInviteDrawerProps> = ({
  open,
  onClose,
  group,
}) => {
  const dispatch = useDispatch();
  const isOnline = useSelector((state: ReduxAppState) => state.offline?.online);
  const contacts = useSelector(
    (state: ReduxAppState) => state.contacts.contacts
  );
  const {
    currentProfile,
    wrapOrgCode,
    currentOrg,
    currentAPIKey,
    generateSignature,
  } = useIdentitySystem();

  const [dateRange, setDateRange] = useState<
    [dayjs.Dayjs | null, dayjs.Dayjs | null] | null
  >(null);
  const [selectedRole, setSelectedRole] = useState<GroupRole>(GroupRole.MEMBER);
  const [note, setNote] = useState("");

  const [form] = Form.useForm();
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);
  const [inviteType, setInviteType] = useState<InviteType>(
    InviteType.MAGIC_LINK
  );
  const [inviteLink, setInviteLink] = useState("");
  const [linkGenerated, setLinkGenerated] = useState(false);
  const [generatingLink, setGeneratingLink] = useState(false);
  const [selectedContact, setSelectedContact] = useState<ContactFE | null>(
    null
  );
  const [userInput, setUserInput] = useState("");
  const [validUserID, setValidUserID] = useState<string | null>(null);
  const [searchResults, setSearchResults] = useState<ContactFE[]>([]);
  const [formChanged, setFormChanged] = useState(false);

  // Reset form when drawer opens
  useEffect(() => {
    if (open) {
      form.resetFields();
      setIsAdvancedOpen(false);
      setInviteLink("");
      setLinkGenerated(false);
      setInviteType(InviteType.MAGIC_LINK);
      setSelectedContact(null);
      setUserInput("");
      setValidUserID(null);
      setFormChanged(false);
      setDateRange(null);
      setNote("");
      setSelectedRole(GroupRole.MEMBER);
    }
  }, [open, form]);

  // Process user input for contact search and validation
  useEffect(() => {
    if (inviteType !== InviteType.ENTER_USERLABEL || !userInput) {
      setValidUserID(null);
      return;
    }

    const extractedID = extractUserID(userInput);
    setValidUserID(extractedID);
  }, [userInput, inviteType]);

  // Filter contacts for search results
  useEffect(() => {
    if (inviteType !== InviteType.SELECT_CONTACT || !userInput) {
      setSearchResults([]);
      return;
    }

    if (userInput.length > 1) {
      const filtered = contacts.filter(
        (contact) =>
          (contact.name || "")
            .toLowerCase()
            .includes(userInput.toLowerCase()) ||
          (contact.email || "")
            .toLowerCase()
            .includes(userInput.toLowerCase()) ||
          contact.id.toLowerCase().includes(userInput.toLowerCase())
      );
      setSearchResults(filtered);
    } else {
      setSearchResults([]);
    }
  }, [userInput, contacts, inviteType]);

  const handleContactSelect = (contactId: string) => {
    const contact = contacts.find((c) => c.id === contactId);
    if (contact) {
      setSelectedContact(contact);
      setUserInput(contact.name);
      setValidUserID(contact.id);
      setFormChanged(true);
    }
  };

  const generateMagicLink = async () => {
    if (!currentOrg || !currentAPIKey) return;

    setGeneratingLink(true);

    let activeFrom = 0; // Default value if not set
    let expiresAt = -1; // Default value if not set (never expires)

    if (dateRange && dateRange[0] && dateRange[1]) {
      activeFrom = dateRange[0].valueOf();
      expiresAt = dateRange[1].valueOf();
    } else if (!dateRange || !dateRange[0]) {
      // If no start date is set, use current time
      activeFrom = Date.now();
    }

    // Create a group invite with blank invitee_id
    const groupInviteID = GenerateID.GroupInvite();
    const groupInviteData: IRequestCreateGroupInvite = {
      id: groupInviteID,
      group_id: group.id,
      role: selectedRole,
      active_from: activeFrom,
      expires_at: expiresAt,
    };

    console.log(`generating invite link...`);

    const auth_token = currentAPIKey?.value || (await generateSignature());
    const create_group_response = await fetch(
      `${currentOrg.endpoint}/v1/${currentOrg.driveID}/groups/invites/create`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${auth_token}`,
        },
        body: JSON.stringify(groupInviteData),
      }
    );
    const res = await create_group_response.json();

    if (res.ok.data.redeem_code) {
      const groupInviteRedeemLink = generateRedeemGroupInviteURL(
        {
          invite_id: groupInviteID,
          redeem_code: res.ok.data.redeem_code,
          redirect_url: `${window.location.origin}${wrapOrgCode(`/resources/groups/${group.id}`)}`,
          group_name: group.name,
          org_name: currentOrg.nickname,
          role: selectedRole,
          daterange: {
            begins_at: activeFrom,
            expires_at: expiresAt,
          },
        },
        wrapOrgCode
      );
      console.log(`groupInviteRedeemLink`, groupInviteRedeemLink);
      setInviteLink(groupInviteRedeemLink);
      setLinkGenerated(true);
      setGeneratingLink(false);

      message.success(
        isOnline
          ? "Magic invite link generated!"
          : "Queued invite creation for when you're back online"
      );
    }
  };

  const handleInviteTypeChange = (value: InviteType) => {
    setInviteType(value);
    setSelectedContact(null);
    setUserInput("");
    setValidUserID(null);
  };

  const handleCreateInvite = () => {
    form
      .validateFields()
      .then((values) => {
        let inviteeId: string | undefined;

        switch (inviteType) {
          case InviteType.PUBLIC:
            inviteeId = "PUBLIC";
            break;
          case InviteType.SELECT_CONTACT:
            if (!selectedContact) {
              message.error("Please select a contact");
              return;
            }
            inviteeId = selectedContact.id;
            break;
          case InviteType.ENTER_USERLABEL:
            if (!validUserID) {
              message.error("Please enter a valid user ID");
              return;
            }
            inviteeId = validUserID;
            break;
          case InviteType.MAGIC_LINK:
            // For magic link, we'll use the same flow as generateMagicLink
            generateMagicLink();
            onClose();
            return;
        }

        // Get date values from dateRange
        let activeFrom = 0; // Default value if not set
        let expiresAt = -1; // Default value if not set (never expires)

        if (dateRange && dateRange[0] && dateRange[1]) {
          activeFrom = dateRange[0].valueOf();
          expiresAt = dateRange[1].valueOf();
        } else if (!dateRange || !dateRange[0]) {
          // If no start date is set, use current time
          activeFrom = Date.now();
        }

        const groupInviteData: IRequestCreateGroupInvite = {
          id: GenerateID.GroupInvite(),
          group_id: group.id,
          invitee_id: inviteeId,
          role: selectedRole,
          active_from: activeFrom,
          expires_at: expiresAt,
          note: note,
        };

        // Dispatch action to create group invite
        dispatch(createGroupInviteAction(groupInviteData));

        message.success(
          isOnline
            ? `Creating ${inviteType === InviteType.PUBLIC ? "public" : ""} group invite...`
            : `Queued ${inviteType === InviteType.PUBLIC ? "public" : ""} group invite creation for when you're back online`
        );

        // Close the drawer
        onClose();
      })
      .catch((error) => {
        console.error("Validation failed:", error);
      });
  };

  const renderContactOption = (contact: ContactFE) => ({
    value: contact.id,
    label: (
      <Space align="center">
        <Avatar src={contact.avatar} size="small" icon={<UserOutlined />} />
        <span>{contact.name}</span>
        <Tag>{shortenAddress(contact.id.replace("UserID_", ""))}</Tag>
      </Space>
    ),
  });

  return (
    <Drawer
      title={
        <div>
          <Title level={4} style={{ margin: 0 }}>
            Invite to Group
          </Title>
          <Text type="secondary">{group.name}</Text>
        </div>
      }
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
          {inviteType !== InviteType.MAGIC_LINK && (
            <Button
              onClick={handleCreateInvite}
              type="primary"
              size="large"
              disabled={!isAdvancedOpen}
            >
              {inviteType === InviteType.PUBLIC
                ? "Create Public Invite"
                : "Create Invite"}
            </Button>
          )}
        </div>
      }
    >
      <Form
        form={form}
        layout="vertical"
        initialValues={{
          role: GroupRole.MEMBER,
          inviteType: InviteType.MAGIC_LINK,
        }}
      >
        <Form.Item label="Magic Invite Link">
          <Input
            prefix={
              <span
                onClick={() => {
                  navigator.clipboard.writeText(inviteLink);
                  message.success(`Copied link`);
                }}
                style={{ cursor: "pointer", paddingRight: "8px" }}
              >
                <CopyOutlined style={{ marginRight: "4px" }} />
                Copy
              </span>
            }
            value={inviteLink}
            placeholder="Click button to generate magic invite link"
            readOnly
            suffix={
              <Button
                type="primary"
                onClick={generateMagicLink}
                loading={generatingLink}
                disabled={
                  isAdvancedOpen && inviteType !== InviteType.MAGIC_LINK
                }
              >
                {linkGenerated ? "Generate Another" : "Generate Magic Link"}
              </Button>
            }
          />
          {linkGenerated && (
            <Text type="success" style={{ display: "block", marginTop: "8px" }}>
              Success! Share this link with anyone you want to invite to the
              group.
            </Text>
          )}
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
            Advanced
          </summary>

          <div style={{ padding: "12px 0" }}>
            <Form.Item
              name="inviteType"
              label={
                <Tooltip title="Choose how to invite people to this group">
                  <Space>
                    <InfoCircleOutlined style={{ color: "#aaa" }} /> Invite Type
                  </Space>
                </Tooltip>
              }
            >
              <Select
                value={inviteType}
                onChange={handleInviteTypeChange}
                style={{ width: "100%" }}
              >
                <Option value={InviteType.PUBLIC}>
                  <Space>
                    <GlobalOutlined />
                    Public Invite
                  </Space>
                </Option>
                <Option value={InviteType.SELECT_CONTACT}>
                  <Space>
                    <UserSwitchOutlined />
                    Select from Contacts
                  </Space>
                </Option>
                <Option value={InviteType.ENTER_USERLABEL}>
                  <Space>
                    <FormOutlined />
                    Enter Userlabel
                  </Space>
                </Option>
                <Option value={InviteType.MAGIC_LINK}>
                  <Space>
                    <LinkOutlined />
                    Magic Link
                  </Space>
                </Option>
              </Select>
            </Form.Item>

            {/* Conditional rendering based on invite type */}
            {inviteType === InviteType.SELECT_CONTACT && (
              <Form.Item
                name="contact"
                label={
                  <Tooltip title="Select a contact to invite">
                    <Space>
                      <InfoCircleOutlined style={{ color: "#aaa" }} /> Select
                      Contact
                    </Space>
                  </Tooltip>
                }
              >
                <Select
                  showSearch
                  value={selectedContact?.id}
                  placeholder="Search and select a contact"
                  style={{ width: "100%" }}
                  optionFilterProp="label"
                  onChange={(value) => {
                    const contact = contacts.find((c) => c.id === value);
                    if (contact) {
                      setSelectedContact(contact);
                      setValidUserID(contact.id);
                      setFormChanged(true);
                    } else {
                      setSelectedContact(null);
                      setValidUserID(null);
                    }
                  }}
                  filterOption={(input, option) =>
                    (option?.title || "")
                      ?.toLowerCase()
                      .includes(input.toLowerCase()) ||
                    (option?.value || "").includes(input.toLowerCase())
                  }
                  options={contacts.map((contact) => ({
                    value: contact.id,
                    title: contact.name,
                    label: (
                      <Space align="center">
                        <Avatar
                          src={contact.avatar}
                          size="small"
                          icon={<UserOutlined />}
                        />
                        <span>{contact.name}</span>
                        <span style={{ color: "#888", fontSize: "12px" }}>
                          {contact.email}
                        </span>
                        <Tag>
                          {shortenAddress(contact.id.replace("UserID_", ""))}
                        </Tag>
                      </Space>
                    ),
                    // Include searchable fields for filtering
                    searchLabels: [contact.name, contact.email, contact.id]
                      .join(" ")
                      .toLowerCase(),
                  }))}
                  optionRender={(option) => option.label}
                  notFoundContent={
                    <div style={{ padding: "8px", textAlign: "center" }}>
                      No contacts found
                    </div>
                  }
                  allowClear
                />
              </Form.Item>
            )}

            {inviteType === InviteType.ENTER_USERLABEL && (
              <Form.Item
                name="userlabel"
                label={
                  <Tooltip title="Enter a user ID to invite">
                    <Space>
                      <InfoCircleOutlined style={{ color: "#aaa" }} /> User ID
                    </Space>
                  </Tooltip>
                }
              >
                <Input
                  placeholder="Enter Userlabel (e.g., UserID_abc123 or username@UserID_abc123)"
                  value={userInput}
                  onChange={(e) => setUserInput(e.target.value)}
                />
                {userInput && (
                  <div style={{ marginTop: "8px" }}>
                    {validUserID ? (
                      <Text type="success">
                        Valid User ID:{" "}
                        <code>
                          {shortenAddress(validUserID.replace("UserID_", ""))}
                        </code>
                      </Text>
                    ) : (
                      <Text type="warning">
                        Please enter a valid user ID format
                      </Text>
                    )}
                  </div>
                )}
              </Form.Item>
            )}

            {inviteType === InviteType.PUBLIC && (
              <div style={{ margin: "12px 0" }}>
                <Text type="success">
                  <GlobalOutlined style={{ marginRight: "8px" }} />
                  This will create a public invite that anyone can use to join
                  the group.
                </Text>
              </div>
            )}

            {inviteType === InviteType.MAGIC_LINK && (
              <div style={{ margin: "12px 0" }}>
                <Text style={{ color: "gray" }}>
                  <LinkOutlined style={{ marginRight: "8px" }} />
                  Configure settings for the magic invite link. Anyone with this
                  link can join the group, and it can only be used once.
                </Text>
              </div>
            )}

            <Form.Item
              label={
                <Tooltip title="Role to assign to the invited user">
                  <Space>
                    <InfoCircleOutlined style={{ color: "#aaa" }} /> Role
                  </Space>
                </Tooltip>
              }
            >
              <Select
                value={selectedRole}
                onChange={(value: GroupRole) => setSelectedRole(value)}
              >
                <Option value={GroupRole.MEMBER}>Regular Member</Option>
                <Option value={GroupRole.ADMIN}>Admin</Option>
              </Select>
            </Form.Item>

            <Form.Item
              label={
                <Tooltip title="When this invite becomes active and expires">
                  <Space>
                    <InfoCircleOutlined style={{ color: "#aaa" }} /> Date Range
                  </Space>
                </Tooltip>
              }
            >
              <RangePicker
                showTime
                style={{ width: "100%" }}
                placeholder={["Start Date", "End Date"]}
                value={dateRange}
                onChange={(dates) => setDateRange(dates)}
              />
              <div style={{ marginTop: 4, fontSize: 12, color: "#888" }}>
                Leave start empty for immediate activation. Leave end empty for
                no expiration.
              </div>
            </Form.Item>

            <Form.Item
              name="note"
              label={
                <Tooltip title="Note to include with this invitation">
                  <Space>
                    <InfoCircleOutlined style={{ color: "#aaa" }} /> Note
                  </Space>
                </Tooltip>
              }
            >
              <TextArea
                placeholder="Add a personal note to this invitation"
                rows={3}
              />
            </Form.Item>
          </div>
        </details>
      </Form>
    </Drawer>
  );
};

export default AddGroupInviteDrawer;

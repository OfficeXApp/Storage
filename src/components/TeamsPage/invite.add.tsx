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
  IRequestCreateTeamInvite,
  TeamID,
  TeamRole,
  ContactFE,
  UserID,
  GenerateID,
} from "@officexapp/types";
import { createTeamInviteAction } from "../../redux-offline/team-invites/team-invites.actions";
import { ReduxAppState } from "../../redux-offline/ReduxProvider";
import { shortenAddress } from "../../framework/identity/constants";
import { useIdentitySystem } from "../../framework/identity";
import { TeamFEO } from "../../redux-offline/teams/teams.reducer";

const { Text, Title } = Typography;
const { TextArea } = Input;
const { Option } = Select;

interface AddTeamInviteDrawerProps {
  open: boolean;
  onClose: () => void;
  team: TeamFEO;
}

enum InviteType {
  PUBLIC = "PUBLIC",
  SELECT_CONTACT = "SELECT_CONTACT",
  ENTER_USERTAG = "ENTER_USERTAG",
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

const AddTeamInviteDrawer: React.FC<AddTeamInviteDrawerProps> = ({
  open,
  onClose,
  team,
}) => {
  const dispatch = useDispatch();
  const isOnline = useSelector((state: ReduxAppState) => state.offline?.online);
  const contacts = useSelector(
    (state: ReduxAppState) => state.contacts.contacts
  );
  const { currentProfile } = useIdentitySystem();

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
    }
  }, [open, form]);

  // Process user input for contact search and validation
  useEffect(() => {
    if (inviteType !== InviteType.ENTER_USERTAG || !userInput) {
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
    }
  };

  const generateMagicLink = () => {
    setGeneratingLink(true);

    // Create a team invite with blank invitee_id
    const teamInviteData: IRequestCreateTeamInvite = {
      id: GenerateID.TeamInvite(),
      team_id: team.id,
      role: TeamRole.MEMBER,
      active_from: Date.now(),
      expires_at: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 days from now
    };

    // Simulate API call
    setTimeout(() => {
      // Generate a mock invite link
      const mockInviteLink = `https://officex.app/invite/${teamInviteData.id}`;
      setInviteLink(mockInviteLink);
      setLinkGenerated(true);
      setGeneratingLink(false);

      // Dispatch createTeamInviteAction
      dispatch(createTeamInviteAction(teamInviteData));

      message.success(
        isOnline
          ? "Magic invite link generated!"
          : "Queued invite creation for when you're back online"
      );
    }, 1500);
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
        const role = values.role || TeamRole.MEMBER;
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
          case InviteType.ENTER_USERTAG:
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

        const teamInviteData: IRequestCreateTeamInvite = {
          id: GenerateID.TeamInvite(),
          team_id: team.id,
          invitee_id: inviteeId,
          role: role,
          active_from: values.activeFrom
            ? values.activeFrom.valueOf()
            : undefined,
          expires_at: values.expiresAt ? values.expiresAt.valueOf() : undefined,
          note: values.note,
        };

        // Dispatch action to create team invite
        dispatch(createTeamInviteAction(teamInviteData));

        message.success(
          isOnline
            ? `Creating ${inviteType === InviteType.PUBLIC ? "public" : ""} team invite...`
            : `Queued ${inviteType === InviteType.PUBLIC ? "public" : ""} team invite creation for when you're back online`
        );

        // Close the drawer
        onClose();
      })
      .catch((error) => {
        console.error("Validation failed:", error);
      });
  };

  const copyToClipboard = () => {
    if (inviteLink) {
      navigator.clipboard
        .writeText(inviteLink)
        .then(() => {
          message.success("Invite link copied to clipboard");
        })
        .catch((err) => {
          message.error("Failed to copy invite link");
          console.error("Could not copy text: ", err);
        });
    }
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
            Invite to Team
          </Title>
          <Text type="secondary">{team.name}</Text>
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
          role: TeamRole.MEMBER,
          inviteType: InviteType.MAGIC_LINK,
        }}
      >
        <Form.Item label="Magic Invite Link">
          <Input
            prefix={
              <span style={{ cursor: "pointer", paddingRight: "8px" }}>
                <CopyOutlined
                  onClick={copyToClipboard}
                  style={{ marginRight: "4px" }}
                />
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
              team.
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
                <Tooltip title="Choose how to invite people to this team">
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
                <Option value={InviteType.ENTER_USERTAG}>
                  <Space>
                    <FormOutlined />
                    Enter Usertag
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
                <div>
                  <Input
                    prefix={<SearchOutlined />}
                    value={userInput}
                    onChange={(e) => setUserInput(e.target.value)}
                    placeholder="Search contacts by name or email"
                  />
                  {userInput && searchResults.length > 0 && (
                    <div
                      style={{
                        maxHeight: "200px",
                        overflowY: "auto",
                        border: "1px solid #f0f0f0",
                        borderRadius: "4px",
                        marginTop: "8px",
                      }}
                    >
                      {searchResults.map((contact) => (
                        <div
                          key={contact.id}
                          onClick={() => handleContactSelect(contact.id)}
                          style={{
                            padding: "8px 12px",
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            gap: "8px",
                            borderBottom: "1px solid #f0f0f0",
                            backgroundColor:
                              selectedContact?.id === contact.id
                                ? "#f0f7ff"
                                : "transparent",
                          }}
                        >
                          <Avatar
                            src={contact.avatar}
                            size="small"
                            icon={<UserOutlined />}
                          />
                          <div style={{ flex: 1 }}>
                            <div>{contact.name}</div>
                            <div style={{ color: "#888", fontSize: "12px" }}>
                              {contact.email}
                            </div>
                          </div>
                          <Tag>
                            {shortenAddress(contact.id.replace("UserID_", ""))}
                          </Tag>
                        </div>
                      ))}
                    </div>
                  )}
                  {selectedContact && (
                    <div
                      style={{
                        marginTop: "8px",
                        padding: "8px 12px",
                        border: "1px solid #d9d9d9",
                        borderRadius: "4px",
                        backgroundColor: "#f0f7ff",
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                      }}
                    >
                      <Avatar
                        src={selectedContact.avatar}
                        size="small"
                        icon={<UserOutlined />}
                      />
                      <div style={{ flex: 1 }}>
                        <div>{selectedContact.name}</div>
                        <div style={{ color: "#888", fontSize: "12px" }}>
                          {selectedContact.email}
                        </div>
                      </div>
                      <Tag>
                        {shortenAddress(
                          selectedContact.id.replace("UserID_", "")
                        )}
                      </Tag>
                    </div>
                  )}
                </div>
              </Form.Item>
            )}

            {inviteType === InviteType.ENTER_USERTAG && (
              <Form.Item
                name="usertag"
                label={
                  <Tooltip title="Enter a user ID to invite">
                    <Space>
                      <InfoCircleOutlined style={{ color: "#aaa" }} /> User ID
                    </Space>
                  </Tooltip>
                }
              >
                <Input
                  placeholder="Enter Usertag (e.g., UserID_abc123 or username@UserID_abc123)"
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
                  the team.
                </Text>
              </div>
            )}

            {inviteType === InviteType.MAGIC_LINK && (
              <div style={{ margin: "12px 0" }}>
                <Text style={{ color: "gray" }}>
                  <LinkOutlined style={{ marginRight: "8px" }} />
                  Configure settings for the magic invite link. Anyone with this
                  link can join the team, and it can only be used once.
                </Text>
              </div>
            )}

            <Form.Item
              name="role"
              label={
                <Tooltip title="Role to assign to the invited user">
                  <Space>
                    <InfoCircleOutlined style={{ color: "#aaa" }} /> Role
                  </Space>
                </Tooltip>
              }
            >
              <Select defaultValue={TeamRole.MEMBER}>
                <Option value={TeamRole.MEMBER}>Regular Member</Option>
                <Option value={TeamRole.ADMIN}>Admin</Option>
              </Select>
            </Form.Item>

            <Form.Item
              name="activeFrom"
              label={
                <Tooltip title="When this invite becomes active">
                  <Space>
                    <InfoCircleOutlined style={{ color: "#aaa" }} /> Start Date
                  </Space>
                </Tooltip>
              }
            >
              <DatePicker
                placeholder="Starts Now"
                showTime
                style={{ width: "100%" }}
              />
            </Form.Item>

            <Form.Item
              name="expiresAt"
              label={
                <Tooltip title="When this invite expires">
                  <Space>
                    <InfoCircleOutlined style={{ color: "#aaa" }} /> End Date
                  </Space>
                </Tooltip>
              }
            >
              <DatePicker
                placeholder="Ongoing"
                showTime
                style={{ width: "100%" }}
              />
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

export default AddTeamInviteDrawer;

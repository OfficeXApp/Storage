import React, { useEffect, useState } from "react";
import {
  Typography,
  Card,
  Button,
  Form,
  Input,
  Space,
  Tag,
  Avatar,
  Row,
  Col,
  Tooltip,
  Badge,
  Popover,
  message,
  Tabs,
  FloatButton,
  Divider,
  Popconfirm,
  List,
} from "antd";
import {
  EditOutlined,
  TeamOutlined,
  TagOutlined,
  ClockCircleOutlined,
  UserOutlined,
  GlobalOutlined,
  FileTextOutlined,
  CopyOutlined,
  InfoCircleOutlined,
  DownOutlined,
  UpOutlined,
  CodeOutlined,
} from "@ant-design/icons";
import {
  TeamFE,
  TeamMemberPreview,
  IRequestUpdateTeam,
  SystemPermissionType,
  TeamID,
} from "@officexapp/types";
import {
  LOCAL_STORAGE_TOGGLE_REST_API_DOCS,
  shortenAddress,
} from "../../framework/identity/constants";
import CodeBlock from "../CodeBlock";
import useScreenType from "react-screentype-hook";
import { useDispatch, useSelector } from "react-redux";
import { ReduxAppState } from "../../redux-offline/ReduxProvider";
import {
  deleteTeamAction,
  updateTeamAction,
} from "../../redux-offline/teams/teams.actions";
import AddTeamInviteDrawer from "./invite.add";
import { getLastOnlineStatus } from "../../api/helpers";
import EditTeamInviteDrawer from "./invite.edit";

const { Title, Paragraph, Text } = Typography;
const { TextArea } = Input;

// Define the props for the TeamTab component
interface TeamTabProps {
  team: TeamFE;
  onSave?: (updatedTeam: Partial<TeamFE>) => void;
  onDelete?: (teamID: TeamID) => void;
}

const TeamTab: React.FC<TeamTabProps> = ({ team, onSave, onDelete }) => {
  const dispatch = useDispatch();
  const isOnline = useSelector((state: ReduxAppState) => state.offline?.online);
  const [isEditing, setIsEditing] = useState(false);
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);
  const [showCodeSnippets, setShowCodeSnippets] = useState(false);
  const [form] = Form.useForm();
  const screenType = useScreenType();
  const [inviteDrawerVisible, setInviteDrawerVisible] = useState(false);
  const [inviteForEdit, setInviteForEdit] = useState<TeamMemberPreview | null>(
    null
  );

  useEffect(() => {
    const _showCodeSnippets = localStorage.getItem(
      LOCAL_STORAGE_TOGGLE_REST_API_DOCS
    );
    if (_showCodeSnippets === "true") {
      setShowCodeSnippets(true);
    }
  }, []);

  const toggleEdit = () => {
    if (isEditing) {
      form.resetFields();
    }
    setIsEditing(!isEditing);
  };

  const handleSave = () => {
    form.validateFields().then((values) => {
      // Determine which fields have changed
      const changedFields: IRequestUpdateTeam = { id: team.id as TeamID };

      // Define the specific fields we care about
      const fieldsToCheck: (keyof IRequestUpdateTeam)[] = [
        "name",
        "public_note",
        "private_note",
        "endpoint_url",
        "external_id",
        "external_payload",
      ];

      // Only check the fields we care about
      fieldsToCheck.forEach((field) => {
        // Skip if the field isn't in values
        if (!(field in values)) return;

        const valueFromForm = values[field];
        const originalValue = team[field as keyof TeamFE];

        // Only include fields that have changed
        if (valueFromForm !== originalValue) {
          // Handle empty strings - don't include them if they're just empty strings replacing undefined/null
          if (valueFromForm === "" && !originalValue) {
            return;
          }

          changedFields[field] = valueFromForm;
        }
      });

      // Only proceed if there are actual changes
      if (Object.keys(changedFields).length > 1 && changedFields.id) {
        // More than just the ID
        // Dispatch the update action if we're online
        dispatch(
          updateTeamAction({
            ...changedFields,
          })
        );

        message.success(
          isOnline
            ? "Updating team..."
            : "Queued team update for when you're back online"
        );

        // Call the onSave prop if provided (for backward compatibility)
        if (onSave) {
          onSave(changedFields);
        }
      } else {
        message.info("No changes detected");
      }

      setIsEditing(false);
    });
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    message.success("Copied to clipboard");
  };

  const renderReadOnlyField = (
    label: string,
    value: string,
    icon: React.ReactNode
  ) => {
    return (
      <Input
        readOnly
        onClick={() => copyToClipboard(value)}
        value={value}
        style={{ marginBottom: 8, backgroundColor: "#fafafa" }}
        variant="borderless"
        addonBefore={
          <div
            style={{
              width: screenType.isMobile ? 120 : 90,
              display: "flex",
              alignItems: "center",
            }}
          >
            {icon}
            <span style={{ marginLeft: 8 }}>{label}</span>
          </div>
        }
        suffix={
          <Tooltip title="Copy to clipboard">
            <CopyOutlined
              onClick={() => copyToClipboard(value)}
              style={{ cursor: "pointer", color: "#1890ff" }}
            />
          </Tooltip>
        }
      />
    );
  };

  const initialValues = {
    name: team.name,
    public_note: team.public_note,
    private_note: team.private_note || "",
    endpoint_url: team.endpoint_url,
    external_id: team.external_id || "",
    external_payload: team.external_payload || "",
  };

  const renderCodeSnippets = () => {
    const jsCode_GET = `// GET Team
const response = await fetch(\`/teams/get/\${teamId}\`, {
  method: 'GET',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer YOUR_ACCESS_TOKEN'
  }
});
const data = await response.json();`;

    const jsCode_CREATE = `// CREATE Team
const response = await fetch('/teams/create', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer YOUR_ACCESS_TOKEN'
  },
  body: JSON.stringify({
    name: 'New Team Name',
    public_note: 'Public information about the team',
    private_note: 'Private information about the team',
    endpoint_url: 'https://example.com/api/webhook',
    external_id: 'external-id-123',
    external_payload: '{"custom":"data"}'
  })
});
const data = await response.json();`;

    const jsCode_UPDATE = `// UPDATE Team
const response = await fetch('/teams/update', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer YOUR_ACCESS_TOKEN'
  },
  body: JSON.stringify({
    id: '${team.id}',
    name: 'Updated Team Name',
    public_note: 'Updated public information'
    // Include only fields you want to update
  })
});
const data = await response.json();`;

    const jsCode_DELETE = `// DELETE Team
const response = await fetch('/teams/delete', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer YOUR_ACCESS_TOKEN'
  },
  body: JSON.stringify({
    id: '${team.id}'
  })
});
const data = await response.json();`;

    const jsCode_LIST = `// LIST Teams
const response = await fetch('/teams/list', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer YOUR_ACCESS_TOKEN'
  },
  body: JSON.stringify({
    page: 1,
    limit: 10,
    search: 'optional search term'
  })
});
const data = await response.json();`;

    return (
      <Card
        bordered={false}
        style={{
          boxShadow: "0 1px 2px rgba(0,0,0,0.03)",
          height: "100%",
        }}
        title="API Reference"
      >
        <Tabs defaultActiveKey="javascript">
          <Tabs.TabPane tab="JavaScript" key="javascript">
            <Space direction="vertical" size="large" style={{ width: "100%" }}>
              <CodeBlock
                code={jsCode_GET}
                language="javascript"
                title="GET Team"
              />
              <CodeBlock
                code={jsCode_CREATE}
                language="javascript"
                title="CREATE Team"
              />
              <CodeBlock
                code={jsCode_UPDATE}
                language="javascript"
                title="UPDATE Team"
              />
              <CodeBlock
                code={jsCode_DELETE}
                language="javascript"
                title="DELETE Team"
              />
              <CodeBlock
                code={jsCode_LIST}
                language="javascript"
                title="LIST Teams"
              />
            </Space>
          </Tabs.TabPane>
          <Tabs.TabPane tab="Prompt" key="prompt"></Tabs.TabPane>
          <Tabs.TabPane tab="Python" key="python"></Tabs.TabPane>
          <Tabs.TabPane tab="CURL" key="curl"></Tabs.TabPane>
        </Tabs>
      </Card>
    );
  };

  return (
    <div
      style={{
        padding: "0",
        height: "100%",
        width: "100%",
        overflowY: "auto",
        overflowX: "hidden",
        position: "relative",
      }}
    >
      <Row justify="space-between" align="middle" style={{ marginTop: 16 }}>
        <Col>
          {/* Empty col where buttons used to be */}
          <p></p>
        </Col>
        <Col>
          <Space>
            {isEditing ? (
              <>
                <Button
                  size={screenType.isMobile ? "small" : "middle"}
                  onClick={toggleEdit}
                  type="default"
                >
                  Cancel
                </Button>
                <Button
                  size={screenType.isMobile ? "small" : "middle"}
                  onClick={handleSave}
                  type="primary"
                >
                  Save Changes
                </Button>
              </>
            ) : (
              <>
                <Button
                  icon={<EditOutlined />}
                  onClick={toggleEdit}
                  type="primary"
                  size={screenType.isMobile ? "small" : "middle"}
                  ghost
                  disabled={
                    !team.permission_previews?.includes(
                      SystemPermissionType.EDIT
                    )
                  }
                >
                  Edit
                </Button>
                <Button
                  icon={<UserOutlined />}
                  onClick={() => setInviteDrawerVisible(true)}
                  type="primary"
                  size={screenType.isMobile ? "small" : "middle"}
                >
                  Invite Member
                </Button>
              </>
            )}
          </Space>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col span={showCodeSnippets && !screenType.isMobile ? 16 : 24}>
          <Card
            bordered={false}
            style={{ boxShadow: "0 1px 2px rgba(0,0,0,0.03)" }}
          >
            {isEditing ? (
              <Form form={form} layout="vertical" initialValues={initialValues}>
                <Form.Item
                  name="name"
                  label="Team Name"
                  rules={[
                    { required: true, message: "Please enter team name" },
                  ]}
                >
                  <Input
                    placeholder="Team name"
                    variant="borderless"
                    style={{ backgroundColor: "#fafafa" }}
                  />
                </Form.Item>

                <Form.Item name="endpoint_url" label="Endpoint">
                  <Input
                    prefix={<GlobalOutlined />}
                    placeholder="https://example.com/api/webhook"
                    variant="borderless"
                    style={{ backgroundColor: "#fafafa" }}
                  />
                </Form.Item>

                <Form.Item name="public_note" label="Public Note">
                  <TextArea
                    rows={2}
                    placeholder="Public information about this team"
                    variant="borderless"
                    style={{ backgroundColor: "#fafafa" }}
                  />
                </Form.Item>

                {team.permission_previews?.includes(
                  SystemPermissionType.EDIT
                ) && (
                  <Form.Item
                    name="private_note"
                    label="Private Note"
                    extra="Only team owners and editors can view this note"
                  >
                    <TextArea
                      rows={3}
                      placeholder="Private notes (only visible to owners and editors)"
                      variant="borderless"
                      style={{ backgroundColor: "#fafafa" }}
                    />
                  </Form.Item>
                )}

                <Form.Item name="external_id" label="External ID">
                  <Input
                    placeholder="External identifier"
                    variant="borderless"
                    style={{ backgroundColor: "#fafafa" }}
                  />
                </Form.Item>

                <Form.Item name="external_payload" label="External Payload">
                  <TextArea
                    rows={2}
                    placeholder="JSON or other data format"
                    variant="borderless"
                    style={{ backgroundColor: "#fafafa" }}
                  />
                </Form.Item>

                <Divider />
                <Form.Item name="delete">
                  <Popconfirm
                    title="Are you sure you want to delete this team?"
                    okText="Yes"
                    cancelText="No"
                    onConfirm={() => {
                      dispatch(deleteTeamAction({ id: team.id }));
                      message.success(
                        isOnline
                          ? "Deleting team..."
                          : "Queued team delete for when you're back online"
                      );
                      if (onDelete) {
                        onDelete(team.id);
                      }
                    }}
                  >
                    <Button
                      disabled={
                        !team.permission_previews?.includes(
                          SystemPermissionType.DELETE
                        )
                      }
                      ghost
                      type="primary"
                      danger
                    >
                      Delete Team
                    </Button>
                  </Popconfirm>
                </Form.Item>
              </Form>
            ) : (
              <>
                <Row gutter={[16, 16]}>
                  <Col span={24}>
                    <Space
                      align="center"
                      size={16}
                      style={{
                        width: "100%",
                        justifyContent: "space-between",
                      }}
                    >
                      <Space align="center" size={16}>
                        <Avatar
                          size={64}
                          icon={<TeamOutlined />}
                          src={team.avatar || undefined}
                          style={{ backgroundColor: "#1890ff" }}
                        >
                          {team.name.charAt(0).toUpperCase()}
                        </Avatar>
                        <div
                          style={{
                            display: "flex",
                            flexDirection: "column",
                            justifyContent: "center",
                            height: "64px",
                            marginTop: screenType.isMobile ? "-32px" : 0,
                          }}
                        >
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              marginBottom: "2px",
                            }}
                          >
                            <Title
                              level={3}
                              style={{ marginBottom: 0, marginRight: "12px" }}
                            >
                              {team.name}
                            </Title>
                            <Tag
                              color="blue"
                              onClick={() => {
                                const teamstring = `${team.name.replace(" ", "_")}@${team.id}`;
                                navigator.clipboard
                                  .writeText(teamstring)
                                  .then(() => {
                                    message.success("Copied to clipboard!");
                                  })
                                  .catch(() => {
                                    message.error(
                                      "Failed to copy to clipboard."
                                    );
                                  });
                              }}
                              style={{
                                cursor: "pointer",
                                marginTop: "24px",
                              }}
                            >
                              {shortenAddress(team.id.replace("TeamID_", ""))}
                            </Tag>
                          </div>
                          <Space>
                            <Badge status="processing" />
                            <Text type="secondary">
                              {team.member_previews.length || 0} Members
                            </Text>
                          </Space>
                        </div>
                      </Space>
                    </Space>
                  </Col>
                </Row>

                <Row gutter={[16, 16]}>
                  <Col span={24}>
                    {/* Always displayed fields */}

                    {!screenType.isMobile && team.tags && (
                      <div
                        style={{
                          marginTop: 4,
                          display: "flex",
                          justifyContent: "flex-end",
                          flexWrap: "wrap",
                        }}
                      >
                        {team.tags.map((tag, index) => (
                          <Tag
                            key={index}
                            style={{ marginBottom: 4, marginLeft: 4 }}
                          >
                            {tag}
                          </Tag>
                        ))}
                      </div>
                    )}

                    <div
                      style={{
                        marginBottom: screenType.isMobile ? 8 : 16,
                        marginTop: screenType.isMobile
                          ? 16
                          : team.tags && team.tags.length > 0
                            ? 0
                            : 32,
                      }}
                    >
                      <Card size="small" style={{ marginTop: 8 }}>
                        <GlobalOutlined style={{ marginRight: 8 }} />
                        {team.public_note || "No public note available"}
                      </Card>
                    </div>

                    {screenType.isMobile && team.tags && (
                      <div
                        style={{
                          marginTop: 4,
                          display: "flex",
                          justifyContent: "flex-start",
                          flexWrap: "wrap",
                        }}
                      >
                        {team.tags.map((tag, index) => (
                          <Tag
                            key={index}
                            style={{ marginBottom: 4, marginLeft: 4 }}
                          >
                            {tag}
                          </Tag>
                        ))}
                      </div>
                    )}

                    {/* Advanced section with details */}
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
                          display: "flex",
                          alignItems: "center",
                        }}
                      >
                        Advanced &nbsp;
                        {screenType.isMobile ? null : isAdvancedOpen ? (
                          <UpOutlined />
                        ) : (
                          <DownOutlined />
                        )}
                      </summary>

                      <div style={{ padding: "8px 0" }}>
                        {renderReadOnlyField(
                          "Team ID",
                          team.id,
                          <TeamOutlined />
                        )}

                        {team.endpoint_url &&
                          renderReadOnlyField(
                            "Endpoint",
                            team.endpoint_url,
                            <GlobalOutlined />
                          )}

                        {team.private_note &&
                          team.permission_previews?.includes(
                            SystemPermissionType.EDIT
                          ) && (
                            <div style={{ marginTop: "16px" }}>
                              <Space align="center">
                                <Text strong>Private Note:</Text>
                                <Popover
                                  content="Only team owners and editors can view this note"
                                  trigger="hover"
                                >
                                  <InfoCircleOutlined
                                    style={{ color: "#1890ff" }}
                                  />
                                </Popover>
                              </Space>
                              <Card
                                size="small"
                                style={{
                                  marginTop: 8,
                                  backgroundColor: "#fafafa",
                                }}
                              >
                                <FileTextOutlined style={{ marginRight: 8 }} />
                                {team.private_note}
                              </Card>
                            </div>
                          )}

                        <div style={{ marginTop: "16px" }}>
                          <Space align="center">
                            <ClockCircleOutlined />
                            <Text type="secondary">
                              Created on {formatDate(team.created_at)}
                            </Text>
                          </Space>
                          {team.external_id && (
                            <div style={{ marginTop: 8 }}>
                              <Text type="secondary">
                                External ID: {team.external_id}
                              </Text>
                            </div>
                          )}
                          {team.external_payload && (
                            <div style={{ marginTop: 8 }}>
                              <Text type="secondary">
                                External Payload: {team.external_payload}
                              </Text>
                            </div>
                          )}
                        </div>
                      </div>
                    </details>
                  </Col>

                  {team.member_previews && team.member_previews.length > 0 && (
                    <Col span={24}>
                      <Title level={5} style={{ marginTop: 16 }}>
                        Members
                      </Title>
                      <List
                        itemLayout="horizontal"
                        dataSource={[
                          // Sort members to show admins first
                          ...team.member_previews.filter(
                            (member: TeamMemberPreview) => member.is_admin
                          ),
                          ...team.member_previews.filter(
                            (member: TeamMemberPreview) => !member.is_admin
                          ),
                        ]}
                        renderItem={(member: TeamMemberPreview) => {
                          const lastOnlineStatus = getLastOnlineStatus(
                            member.last_online_ms
                          );

                          return (
                            <List.Item
                              key={member.user_id || String(Math.random())}
                              style={{
                                padding: "8px 16px",
                                border: "1px solid #f0f0f0",
                                borderRadius: "4px",
                                marginBottom: 8,
                              }}
                              actions={[
                                <div>
                                  {member.is_admin && (
                                    <Tag
                                      color="red"
                                      style={{ marginRight: "16px" }}
                                    >
                                      Admin
                                    </Tag>
                                  )}
                                  <EditOutlined
                                    key="edit"
                                    onClick={() => setInviteForEdit(member)}
                                    style={{ color: "#1890ff" }}
                                  />
                                </div>,
                              ]}
                            >
                              <Space>
                                <Avatar
                                  icon={<UserOutlined />}
                                  src={
                                    member.avatar
                                      ? String(member.avatar)
                                      : undefined
                                  }
                                />
                                <Text>{member.name || "Unknown Pending"}</Text>
                                {member.user_id.startsWith(
                                  "PlaceholderTeamInviteeID_"
                                ) && (
                                  <Popover
                                    content={member.note || "No notes attached"}
                                  >
                                    <InfoCircleOutlined
                                      style={{ color: "#aaa" }}
                                    />
                                  </Popover>
                                )}
                                <Tag>
                                  {member.user_id.startsWith(
                                    "PlaceholderTeamInviteeID_"
                                  )
                                    ? "magic link"
                                    : shortenAddress(
                                        member.user_id.replace("UserID_", "")
                                      )}
                                </Tag>

                                <Badge
                                  // @ts-ignore
                                  status={lastOnlineStatus.status}
                                />
                                <Text type="secondary">
                                  {lastOnlineStatus.text}
                                </Text>
                              </Space>
                            </List.Item>
                          );
                        }}
                      />
                    </Col>
                  )}
                </Row>
              </>
            )}
          </Card>
        </Col>

        {/* Conditional rendering of code snippets column */}
        {showCodeSnippets && !screenType.isMobile && (
          <Col span={8}>{renderCodeSnippets()}</Col>
        )}
      </Row>

      {/* FloatButton for View Code at bottom right corner */}
      {!screenType.isMobile && (
        <FloatButton
          icon={<CodeOutlined />}
          type={showCodeSnippets ? "primary" : "default"}
          tooltip={showCodeSnippets ? "Hide Code" : "View Code"}
          onClick={() => {
            setShowCodeSnippets(!showCodeSnippets);
            localStorage.setItem(
              LOCAL_STORAGE_TOGGLE_REST_API_DOCS,
              JSON.stringify(!showCodeSnippets)
            );
          }}
          style={{ right: 24, bottom: 64 }}
        />
      )}
      <AddTeamInviteDrawer
        open={inviteDrawerVisible}
        onClose={() => setInviteDrawerVisible(false)}
        team={team}
      />
      {inviteForEdit && (
        <EditTeamInviteDrawer
          open={Boolean(inviteForEdit)}
          onClose={() => setInviteForEdit(null)}
          member={inviteForEdit}
        />
      )}
      <br />
      <br />
    </div>
  );
};

export default TeamTab;

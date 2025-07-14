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
  Dropdown,
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
  LockOutlined,
  SisternodeOutlined,
  MoreOutlined,
  LoadingOutlined,
  SyncOutlined,
} from "@ant-design/icons";
import {
  GroupFE,
  GroupMemberPreview,
  IRequestUpdateGroup,
  SystemPermissionType,
  GroupID,
} from "@officexapp/types";
import {
  LOCAL_STORAGE_TOGGLE_REST_API_DOCS,
  shortenAddress,
} from "../../framework/identity/constants";
import CodeBlock from "../../components/CodeBlock";
import useScreenType from "react-screentype-hook";
import { useDispatch, useSelector } from "react-redux";
import { ReduxAppState } from "../../redux-offline/ReduxProvider";
import {
  deleteGroupAction,
  getGroupAction,
  updateGroupAction,
} from "../../redux-offline/groups/groups.actions";
import AddGroupInviteDrawer from "./invite.add";
import { getLastOnlineStatus, wrapAuthStringOrHeader } from "../../api/helpers";
import EditGroupInviteDrawer from "./invite.edit";
import PermissionsManager from "../../components/PermissionsManager";
import WebhookManager from "../../components/WebhookManager";
import { useNavigate } from "react-router-dom";
import { useIdentitySystem } from "../../framework/identity";
import { generateRedeemGroupInviteURL } from "./invite.redeem";
import { GroupFEO } from "../../redux-offline/groups/groups.reducer";
import TagCopy from "../../components/TagCopy";

const { Title, Paragraph, Text } = Typography;
const { TextArea } = Input;

// Define the props for the GroupTab component
interface GroupTabProps {
  groupCache: GroupFEO;
  onSave?: (updatedGroup: Partial<GroupFEO>) => void;
  onDelete?: (groupID: GroupID) => void;
}

const GroupTab: React.FC<GroupTabProps> = ({
  groupCache,
  onSave,
  onDelete,
}) => {
  const dispatch = useDispatch();
  const isOnline = useSelector((state: ReduxAppState) => state.offline?.online);
  const group =
    useSelector(
      (state: ReduxAppState) => state.groups.groupMap[groupCache.id]
    ) || groupCache;
  const [viewMode, setViewMode] = useState<
    "view" | "edit" | "permissions" | "webhooks"
  >("view");
  const navigate = useNavigate();
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);
  const [showCodeSnippets, setShowCodeSnippets] = useState(false);
  const [form] = Form.useForm();
  const screenType = useScreenType();
  const [permissionsVisible, setPermissionsVisible] = useState(false);
  const [webhooksVisible, setWebhooksVisible] = useState(false);
  const [inviteDrawerVisible, setInviteDrawerVisible] = useState(false);
  const [inviteForEdit, setInviteForEdit] = useState<GroupMemberPreview | null>(
    null
  );
  const { currentAPIKey, currentOrg, generateSignature, wrapOrgCode } =
    useIdentitySystem();
  const [searchTerm, setSearchTerm] = useState("");
  useEffect(() => {
    const _showCodeSnippets = localStorage.getItem(
      LOCAL_STORAGE_TOGGLE_REST_API_DOCS
    );
    if (_showCodeSnippets === "true") {
      setShowCodeSnippets(true);
    }
  }, []);

  const toggleEdit = () => {
    if (viewMode === "edit") {
      form.resetFields();
      setViewMode("view");
    } else {
      setViewMode("edit");
    }
  };

  const handleSave = () => {
    form.validateFields().then((values) => {
      // Determine which fields have changed
      const changedFields: IRequestUpdateGroup = { id: group.id as GroupID };

      // Define the specific fields we care about
      const fieldsToCheck: (keyof IRequestUpdateGroup)[] = [
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
        const originalValue = group[field as keyof GroupFE];

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
          updateGroupAction({
            ...changedFields,
          })
        );

        message.success(
          isOnline
            ? "Updating group..."
            : "Queued group update for when you're back online"
        );

        // Call the onSave prop if provided (for backward compatibility)
        if (onSave) {
          onSave(changedFields);
        }
      } else {
        message.info("No changes detected");
      }

      setViewMode("view");
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
    icon: React.ReactNode,
    navigationRoute?: string
  ) => {
    const handleClick = (e: React.MouseEvent) => {
      if (navigationRoute) {
        if (e.ctrlKey || e.metaKey) {
          // Open in a new tab with the full URL
          const url = `${window.location.origin}${navigationRoute}`;
          window.open(url, "_blank");
        } else {
          // Navigate using React Router
          navigate(navigationRoute);
        }
      } else {
        // Default behavior if no navigation route is provided
        copyToClipboard(value);
      }
    };
    return (
      <Input
        readOnly
        onClick={handleClick}
        value={value}
        style={{
          marginBottom: 8,
          backgroundColor: "#fafafa",
          cursor: "pointer",
        }}
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

  if (!group) return null;

  const initialValues = {
    name: group.name,
    public_note: group.public_note,
    private_note: group.private_note || "",
    endpoint_url: group.endpoint_url,
    external_id: group.external_id || "",
    external_payload: group.external_payload || "",
  };

  const renderCodeSnippets = () => {
    const jsCode_GET = `// GET Group
const response = await fetch(\`/groups/get/\${groupId}\`, {
  method: 'GET',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer YOUR_ACCESS_TOKEN'
  }
});
const data = await response.json();`;

    const jsCode_CREATE = `// CREATE Group
const response = await fetch('/groups/create', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer YOUR_ACCESS_TOKEN'
  },
  body: JSON.stringify({
    name: 'New Group Name',
    public_note: 'Public information about the group',
    private_note: 'Private information about the group',
    endpoint_url: 'https://example.com/api/webhook',
    external_id: 'external-id-123',
    external_payload: '{"custom":"data"}'
  })
});
const data = await response.json();`;

    const jsCode_UPDATE = `// UPDATE Group
const response = await fetch('/groups/update', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer YOUR_ACCESS_TOKEN'
  },
  body: JSON.stringify({
    id: '${group.id}',
    name: 'Updated Group Name',
    public_note: 'Updated public information'
    // Include only fields you want to update
  })
});
const data = await response.json();`;

    const jsCode_DELETE = `// DELETE Group
const response = await fetch('/groups/delete', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer YOUR_ACCESS_TOKEN'
  },
  body: JSON.stringify({
    id: '${group.id}'
  })
});
const data = await response.json();`;

    const jsCode_LIST = `// LIST Groups
const response = await fetch('/groups/list', {
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
                title="GET Group"
              />
              <CodeBlock
                code={jsCode_CREATE}
                language="javascript"
                title="CREATE Group"
              />
              <CodeBlock
                code={jsCode_UPDATE}
                language="javascript"
                title="UPDATE Group"
              />
              <CodeBlock
                code={jsCode_DELETE}
                language="javascript"
                title="DELETE Group"
              />
              <CodeBlock
                code={jsCode_LIST}
                language="javascript"
                title="LIST Groups"
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

  const manageMenuItems = [
    {
      key: "edit-details",
      icon: <EditOutlined />,
      label: "Edit Details",
      onClick: () => setViewMode("edit"),
      disabled: !group.permission_previews?.includes(SystemPermissionType.EDIT),
    },
    {
      key: "permissions",
      icon: <LockOutlined />,
      label: "Permissions",
      onClick: () => setViewMode("permissions"),
      disabled: true,
    },
    {
      key: "webhooks",
      icon: <SisternodeOutlined />,
      label: "Webhooks",
      onClick: () => setViewMode("webhooks"),
      disabled: true,
    },
    {
      key: "invite-member",
      icon: <UserOutlined />,
      label: "Invite Member",
      onClick: () => setInviteDrawerVisible(true),
      disabled: !group.permission_previews?.includes(SystemPermissionType.EDIT),
    },
  ];

  const syncLatest = () => {
    dispatch(getGroupAction(group.id));
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
            {viewMode !== "view" ? (
              <>
                <Button
                  size={screenType.isMobile ? "small" : "middle"}
                  onClick={() => setViewMode("view")}
                  type="default"
                >
                  Cancel
                </Button>
                {viewMode === "edit" && (
                  <Button
                    size={screenType.isMobile ? "small" : "middle"}
                    onClick={handleSave}
                    type="primary"
                  >
                    Save Changes
                  </Button>
                )}
              </>
            ) : (
              <>
                <Dropdown menu={{ items: manageMenuItems }}>
                  <Button
                    type="primary"
                    size={screenType.isMobile ? "small" : "middle"}
                    ghost
                  >
                    Manage <DownOutlined />
                  </Button>
                </Dropdown>

                <Button
                  icon={<UserOutlined />}
                  onClick={() => setInviteDrawerVisible(true)}
                  type="primary"
                  size={screenType.isMobile ? "small" : "middle"}
                  disabled={
                    !group.permission_previews?.includes(
                      SystemPermissionType.EDIT
                    )
                  }
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
            {viewMode === "edit" ? (
              <Form form={form} layout="vertical" initialValues={initialValues}>
                <Form
                  form={form}
                  layout="vertical"
                  initialValues={initialValues}
                >
                  <Form.Item
                    name="name"
                    label="Group Name"
                    rules={[
                      { required: true, message: "Please enter group name" },
                    ]}
                  >
                    <Input
                      placeholder="Group name"
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
                      placeholder="Public information about this group"
                      variant="borderless"
                      style={{ backgroundColor: "#fafafa" }}
                    />
                  </Form.Item>

                  {group.permission_previews?.includes(
                    SystemPermissionType.EDIT
                  ) && (
                    <Form.Item
                      name="private_note"
                      label="Private Note"
                      extra="Only group owners and editors can view this note"
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
                      title="Are you sure you want to delete this group?"
                      okText="Yes"
                      cancelText="No"
                      onConfirm={() => {
                        dispatch(deleteGroupAction({ id: group.id }));
                        message.success(
                          isOnline
                            ? "Deleting group..."
                            : "Queued group delete for when you're back online"
                        );
                        if (onDelete) {
                          onDelete(group.id);
                        }
                      }}
                    >
                      <Button
                        disabled={
                          !group.permission_previews?.includes(
                            SystemPermissionType.DELETE
                          )
                        }
                        ghost
                        type="primary"
                        danger
                      >
                        Delete Group
                      </Button>
                    </Popconfirm>
                  </Form.Item>
                </Form>
              </Form>
            ) : viewMode === "permissions" ? (
              <PermissionsManager
                title="Group Permissions"
                // group={group}
                // onCancel={() => setViewMode("view")}
              />
            ) : viewMode === "webhooks" ? (
              <WebhookManager
              // group={group}
              // onCancel={() => setViewMode("view")}
              />
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
                          src={group.avatar || undefined}
                          style={{ backgroundColor: "#1890ff" }}
                        >
                          {group.name.charAt(0).toUpperCase()}
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
                              {group.name}
                            </Title>
                            <TagCopy id={group.id} />
                            <div style={{ marginTop: "0px" }}>
                              {group.isLoading ? (
                                <span>
                                  <LoadingOutlined />
                                  <i
                                    style={{
                                      marginLeft: 8,
                                      color: "rgba(0,0,0,0.2)",
                                    }}
                                  >
                                    Syncing
                                  </i>
                                </span>
                              ) : (
                                <SyncOutlined
                                  onClick={() => {
                                    message.info("Syncing latest...");
                                    syncLatest();
                                  }}
                                  style={{ color: "rgba(0,0,0,0.2)" }}
                                />
                              )}
                            </div>
                          </div>
                          <Space>
                            <Badge status="processing" />
                            <Text type="secondary">
                              {group.member_previews.length || 0} Members
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

                    {!screenType.isMobile && group.labels && (
                      <div
                        style={{
                          marginTop: 4,
                          display: "flex",
                          justifyContent: "flex-end",
                          flexWrap: "wrap",
                        }}
                      >
                        {group.labels.map((label, index) => (
                          <Tag
                            key={index}
                            style={{ marginBottom: 4, marginLeft: 4 }}
                          >
                            {label}
                          </Tag>
                        ))}
                      </div>
                    )}

                    <div
                      style={{
                        marginBottom: screenType.isMobile ? 8 : 16,
                        marginTop: screenType.isMobile
                          ? 16
                          : group.labels && group.labels.length > 0
                            ? 0
                            : 32,
                      }}
                    >
                      <Card size="small" style={{ marginTop: 8 }}>
                        <GlobalOutlined style={{ marginRight: 8 }} />
                        {group.public_note || "No public note available"}
                      </Card>
                    </div>

                    {screenType.isMobile && group.labels && (
                      <div
                        style={{
                          marginTop: 4,
                          display: "flex",
                          justifyContent: "flex-start",
                          flexWrap: "wrap",
                        }}
                      >
                        {group.labels.map((label, index) => (
                          <Tag
                            key={index}
                            style={{ marginBottom: 4, marginLeft: 4 }}
                          >
                            {label}
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
                          "Group ID",
                          group.id,
                          <TeamOutlined />
                        )}

                        {group.endpoint_url &&
                          renderReadOnlyField(
                            "Endpoint",
                            group.endpoint_url,
                            <GlobalOutlined />
                          )}

                        {group.private_note &&
                          group.permission_previews?.includes(
                            SystemPermissionType.EDIT
                          ) && (
                            <div style={{ marginTop: "16px" }}>
                              <Space align="center">
                                <Text strong>Private Note:</Text>
                                <Popover
                                  content="Only group owners and editors can view this note"
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
                                {group.private_note}
                              </Card>
                            </div>
                          )}

                        <div style={{ marginTop: "16px" }}>
                          <Space align="center">
                            <ClockCircleOutlined />
                            <Text type="secondary">
                              Created on {formatDate(group.created_at)}
                            </Text>
                          </Space>
                          {group.external_id && (
                            <div style={{ marginTop: 8 }}>
                              <Text type="secondary">
                                External ID: {group.external_id}
                              </Text>
                            </div>
                          )}
                          {group.external_payload && (
                            <div style={{ marginTop: 8 }}>
                              <Text type="secondary">
                                External Payload: {group.external_payload}
                              </Text>
                            </div>
                          )}
                        </div>
                      </div>
                    </details>
                  </Col>

                  {group.member_previews &&
                    group.member_previews.length > 0 && (
                      <Col span={24}>
                        <div
                          style={{
                            display: "flex",
                            flexDirection: "row",
                            justifyContent: "space-between",
                          }}
                        >
                          <Title level={5} style={{ marginTop: 16 }}>
                            {`${group.member_previews.length} Members`}
                          </Title>
                          <Button
                            size="small"
                            onClick={() => setInviteDrawerVisible(true)}
                            style={{ marginTop: "16px" }}
                            disabled={
                              !group.permission_previews?.includes(
                                SystemPermissionType.EDIT
                              )
                            }
                          >
                            Invite
                          </Button>
                        </div>
                        <Input
                          placeholder={`Search all invites`}
                          prefix={<UserOutlined />}
                          style={{ marginBottom: 16 }}
                          onChange={(e) =>
                            setSearchTerm(e.target.value.toLowerCase())
                          }
                          allowClear
                        />
                        <List
                          itemLayout="horizontal"
                          dataSource={[
                            // Sort members to show admins first, but also filter by search term
                            ...group.member_previews.filter(
                              (member: GroupMemberPreview) => {
                                let alt_display_name = "";
                                if (
                                  member.user_id.startsWith(
                                    "PlaceholderGroupInviteeID_"
                                  )
                                ) {
                                  alt_display_name = "Awaiting Anon";
                                } else if (member.user_id === "PUBLIC") {
                                  alt_display_name = "Public Invite Link";
                                } else if (!member.name) {
                                  alt_display_name = "Unnamed Contact";
                                }
                                return (
                                  member.is_admin &&
                                  (member.name
                                    ?.toLowerCase()
                                    .includes(searchTerm) ||
                                    member.user_id
                                      .toLowerCase()
                                      .includes(searchTerm) ||
                                    alt_display_name
                                      .toLowerCase()
                                      .includes(searchTerm))
                                );
                              }
                            ),
                            ...group.member_previews.filter(
                              (member: GroupMemberPreview) => {
                                let alt_display_name = "";
                                if (
                                  member.user_id.startsWith(
                                    "PlaceholderGroupInviteeID_"
                                  )
                                ) {
                                  alt_display_name = "Awaiting Anon";
                                }
                                return (
                                  !member.is_admin &&
                                  (member.name
                                    ?.toLowerCase()
                                    .includes(searchTerm) ||
                                    member.user_id
                                      .toLowerCase()
                                      .includes(searchTerm) ||
                                    alt_display_name
                                      .toLowerCase()
                                      .includes(searchTerm))
                                );
                              }
                            ),
                          ]}
                          renderItem={(member: GroupMemberPreview) => {
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
                                    {group.permission_previews?.includes(
                                      SystemPermissionType.EDIT
                                    ) && (
                                      <EditOutlined
                                        key="edit"
                                        onClick={() => setInviteForEdit(member)}
                                        style={{ color: "#1890ff" }}
                                      />
                                    )}
                                    {group.permission_previews?.includes(
                                      SystemPermissionType.EDIT
                                    ) && (
                                      <Dropdown
                                        menu={{
                                          items: [
                                            {
                                              key: "copy-invite",
                                              label: "Copy Invite",
                                              disabled:
                                                member.user_id !== "PUBLIC" &&
                                                !member.user_id.startsWith(
                                                  "PlaceholderGroupInviteeID_"
                                                ),
                                              onClick: async () => {
                                                console.log("Copy invite");
                                                if (!currentOrg) return;
                                                // we must make a REST call to /v1/driveid/team-invites/get/{invite_id}
                                                message.info(
                                                  "Getting invite link..."
                                                );
                                                const auth_token =
                                                  currentAPIKey?.value ||
                                                  (await generateSignature());
                                                const { url, headers } =
                                                  wrapAuthStringOrHeader(
                                                    `${currentOrg.endpoint}/v1/drive/${currentOrg.driveID}/groups/invites/get/${member.invite_id}`,
                                                    {
                                                      "Content-Type":
                                                        "application/json",
                                                    },
                                                    auth_token
                                                  );
                                                try {
                                                  const get_invite_response =
                                                    await fetch(url, {
                                                      method: "GET",
                                                      headers,
                                                    });
                                                  const res =
                                                    await get_invite_response.json();
                                                  console.log(
                                                    "get_invite_response",
                                                    res
                                                  );
                                                  const invite = res.ok.data;
                                                  // and then create the magic link from FileRecordFE/FolderRecordFE data
                                                  const groupInviteRedeemLink =
                                                    generateRedeemGroupInviteURL(
                                                      {
                                                        invite_id: invite.id,
                                                        redeem_code:
                                                          invite.redeem_code,
                                                        redirect_url: `${window.location.origin}${wrapOrgCode(`/resources/groups/${invite.group_id}`)}`,
                                                        group_name:
                                                          invite.group_name,
                                                        org_name:
                                                          currentOrg.nickname,
                                                        role: invite.role,
                                                        daterange: {
                                                          begins_at:
                                                            invite.active_from,
                                                          expires_at:
                                                            invite.expires_at,
                                                        },
                                                      },
                                                      wrapOrgCode
                                                    );
                                                  console.log(
                                                    `groupInviteRedeemLink`,
                                                    groupInviteRedeemLink
                                                  );
                                                  // and auto-copy to clipboard with ant message.success()
                                                  navigator.clipboard.writeText(
                                                    groupInviteRedeemLink
                                                  );
                                                  message.success(
                                                    "Copied invite link"
                                                  );
                                                } catch (e) {
                                                  message.error(
                                                    "Failed to get invite link"
                                                  );
                                                }
                                              },
                                            },
                                            {
                                              key: "delete",
                                              label: "Delete",
                                              onClick: () => {
                                                setInviteForEdit(member);
                                              },
                                            },
                                          ],
                                        }}
                                        trigger={["click"]}
                                      >
                                        <Button
                                          type="link"
                                          icon={<MoreOutlined />}
                                          size="large"
                                          style={{ color: "gray" }}
                                        />
                                      </Dropdown>
                                    )}
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
                                  <Popover content={member.note || ""}>
                                    <Text>
                                      {member.name
                                        ? member.name
                                        : member.user_id.startsWith(
                                              "PlaceholderGroupInviteeID_"
                                            )
                                          ? "Awaiting Anon"
                                          : member.user_id === "PUBLIC"
                                            ? "Public Invite Link"
                                            : "Unnamed Contact"}
                                    </Text>
                                  </Popover>
                                  {member.user_id.startsWith(
                                    "PlaceholderGroupInviteeID_"
                                  ) && (
                                    <Popover
                                      content={
                                        member.note ||
                                        "Add notes to keep track of who received magic links"
                                      }
                                    >
                                      <InfoCircleOutlined
                                        style={{ color: "#aaa" }}
                                      />
                                    </Popover>
                                  )}

                                  {member.user_id.startsWith(
                                    "PlaceholderGroupInviteeID_"
                                  ) ? (
                                    <Tag>unclaimed magic link</Tag>
                                  ) : (
                                    <TagCopy id={member.user_id} />
                                  )}

                                  {!member.user_id.startsWith(
                                    "PlaceholderGroupInviteeID_"
                                  ) && (
                                    <Badge
                                      // @ts-ignore
                                      status={lastOnlineStatus.status}
                                    />
                                  )}
                                  {!member.user_id.startsWith(
                                    "PlaceholderGroupInviteeID_"
                                  ) && (
                                    <Text type="secondary">
                                      {lastOnlineStatus.text}
                                    </Text>
                                  )}
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
      <AddGroupInviteDrawer
        open={inviteDrawerVisible}
        onClose={() => setInviteDrawerVisible(false)}
        group={group}
      />
      {inviteForEdit && (
        <EditGroupInviteDrawer
          open={Boolean(inviteForEdit)}
          onClose={() => setInviteForEdit(null)}
          member={inviteForEdit}
          group_name={group.name}
        />
      )}
      <br />
      <br />
    </div>
  );
};

export default GroupTab;

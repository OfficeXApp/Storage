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
  Popconfirm,
} from "antd";
import {
  InfoCircleOutlined,
  UserOutlined,
  DeleteOutlined,
  ClockCircleOutlined,
  FormOutlined,
  SaveOutlined,
} from "@ant-design/icons";
import { useDispatch, useSelector } from "react-redux";
import dayjs from "dayjs";
import {
  GroupMemberPreview,
  GroupID,
  GroupRole,
  GroupInviteID,
  GroupInviteFE,
  IRequestUpdateGroupInvite,
  IRequestDeleteGroupInvite,
  SystemPermissionType,
} from "@officexapp/types";
import {
  updateGroupInviteAction,
  deleteGroupInviteAction,
  getGroupInviteAction,
} from "../../redux-offline/group-invites/group-invites.actions";
import { ReduxAppState } from "../../redux-offline/ReduxProvider";
import { shortenAddress } from "../../framework/identity/constants";

const { Text, Title } = Typography;
const { TextArea } = Input;
const { Option } = Select;

interface EditGroupInviteDrawerProps {
  open: boolean;
  onClose: () => void;
  member: GroupMemberPreview;
  group_name: string;
}

const EditGroupInviteDrawer: React.FC<EditGroupInviteDrawerProps> = ({
  open,
  onClose,
  member,
  group_name,
}) => {
  const dispatch = useDispatch();
  const isOnline = useSelector((state: ReduxAppState) => state.offline?.online);
  const groupInvites = useSelector(
    (state: ReduxAppState) => state.groupInvites.invites
  );

  const [form] = Form.useForm();
  const [loading, setLoading] = useState(true);
  const [currentInvite, setCurrentInvite] = useState<GroupInviteFE | null>(
    null
  );
  const [formChanged, setFormChanged] = useState(false);

  // Fetch the full invite details when the drawer opens
  useEffect(() => {
    if (open && member.invite_id) {
      setLoading(true);

      // Check if we already have the invite in our Redux store
      const existingInvite = groupInvites.find(
        (invite) => invite.id === member.invite_id
      );

      if (existingInvite) {
        setCurrentInvite(existingInvite);
        setLoading(false);
      } else {
        // Fetch the invite if not in store
        dispatch(getGroupInviteAction(member.invite_id));
        // This will update the Redux store, and the next useEffect will catch it
      }
    }
  }, [open, member.invite_id, dispatch, groupInvites]);

  // Watch for changes in the groupInvites Redux store
  useEffect(() => {
    if (member.invite_id) {
      const invite = groupInvites.find((inv) => inv.id === member.invite_id);
      if (invite) {
        setCurrentInvite(invite);
        setLoading(false);
      }
    }
  }, [groupInvites, member.invite_id]);

  // Set form values when invite data is available
  useEffect(() => {
    if (currentInvite) {
      form.setFieldsValue({
        role: currentInvite.role,
        note: currentInvite.note,
        activeFrom: currentInvite.active_from
          ? dayjs(currentInvite.active_from)
          : undefined,
        expiresAt: currentInvite.expires_at
          ? dayjs(currentInvite.expires_at)
          : undefined,
        external_id: currentInvite.external_id,
        external_payload: currentInvite.external_payload,
      });
      setFormChanged(false);
    }
  }, [currentInvite, form]);

  // Reset form when drawer opens
  useEffect(() => {
    if (open) {
      form.resetFields();
      setFormChanged(false);
    }
  }, [open, form]);

  const handleFormChange = () => {
    setFormChanged(true);
  };

  const handleDeleteInvite = () => {
    if (!currentInvite) return;

    const deletePayload: IRequestDeleteGroupInvite = {
      id: currentInvite.id,
    };

    dispatch(deleteGroupInviteAction(deletePayload));

    message.success(
      isOnline
        ? "Deleting group invite..."
        : "Queued group invite deletion for when you're back online"
    );

    onClose();
  };

  const handleUpdateInvite = () => {
    if (!currentInvite) return;

    form.validateFields().then((values) => {
      // Determine which fields have changed
      const changedFields: IRequestUpdateGroupInvite = { id: currentInvite.id };

      // Define the specific fields we care about
      const fieldsToCheck: (keyof IRequestUpdateGroupInvite)[] = [
        "role",
        "note",
        "active_from",
        "expires_at",
        "external_id",
        "external_payload",
      ];

      // Only check the fields we care about
      fieldsToCheck.forEach((field) => {
        // Skip if the field isn't in values
        if (!(field in values)) return;

        let valueFromForm = values[field];
        const originalValue = currentInvite[field as keyof GroupInviteFE];

        // Convert dates to timestamps
        if (field === "active_from" && valueFromForm) {
          valueFromForm = valueFromForm.valueOf();
        }
        if (field === "expires_at" && valueFromForm) {
          valueFromForm = valueFromForm.valueOf();
        }

        // Only include fields that have changed
        if (valueFromForm !== originalValue) {
          // Handle empty strings - don't include them if they're just empty strings replacing undefined/null
          if (valueFromForm === "" && !originalValue) {
            return;
          }
          // @ts-ignore
          changedFields[field] = valueFromForm;
        }
      });

      // Only proceed if there are actual changes
      if (Object.keys(changedFields).length > 1) {
        // More than just the ID
        // Dispatch the update action
        dispatch(
          updateGroupInviteAction({
            ...changedFields,
          })
        );

        message.success(
          isOnline
            ? "Updating group invite..."
            : "Queued group invite update for when you're back online"
        );

        onClose();
      } else {
        message.info("No changes detected");
      }
    });
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <Drawer
      title={
        <div>
          <Title level={4} style={{ margin: 0 }}>
            Edit Group Invite
          </Title>
          <Text type="secondary">{group_name}</Text>
        </div>
      }
      placement="right"
      onClose={onClose}
      open={open}
      width={500}
      mask={false}
      footer={
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            justifyContent: "space-between",
          }}
        >
          <Popconfirm
            title="Are you sure you want to delete this invite?"
            onConfirm={handleDeleteInvite}
            okText="Yes"
            cancelText="No"
            disabled={
              !currentInvite?.permission_previews?.includes(
                SystemPermissionType.DELETE
              )
            }
          >
            <Button
              size="large"
              type="primary"
              ghost
              danger
              icon={<DeleteOutlined />}
              style={{ marginRight: 8 }}
              disabled={
                !currentInvite?.permission_previews?.includes(
                  SystemPermissionType.DELETE
                )
              }
            >
              Delete
            </Button>
          </Popconfirm>
          <Space direction="horizontal">
            <Button size="large" onClick={onClose}>
              Cancel
            </Button>

            <Button
              onClick={handleUpdateInvite}
              type="primary"
              size="large"
              icon={<SaveOutlined />}
              disabled={
                !formChanged ||
                !currentInvite?.permission_previews?.includes(
                  SystemPermissionType.EDIT
                )
              }
            >
              Save Changes
            </Button>
          </Space>
        </div>
      }
    >
      {loading ? (
        <div style={{ textAlign: "center", padding: "40px 0" }}>
          <Spin size="large" />
          <div style={{ marginTop: 16 }}>
            <Text type="secondary">Loading invite details...</Text>
          </div>
        </div>
      ) : !currentInvite ? (
        <div style={{ textAlign: "center", padding: "40px 0" }}>
          <Text type="warning">Invite not found</Text>
        </div>
      ) : (
        <Form form={form} layout="vertical" onValuesChange={handleFormChange}>
          <div style={{ marginBottom: 24 }}>
            <Space align="center">
              <Avatar
                src={member.avatar}
                size="large"
                icon={<UserOutlined />}
              />
              <div>
                <Text strong style={{ fontSize: 16 }}>
                  {member.name
                    ? member.name
                    : member.user_id.startsWith("PlaceholderGroupInviteeID_")
                      ? "Awaiting Anon"
                      : "Unnamed Contact"}
                </Text>
                <div>
                  <Tag>
                    {shortenAddress(
                      member.user_id
                        .replace("UserID_", "")
                        .replace("PlaceholderGroupInviteeID_", "")
                    )}
                  </Tag>
                  <Tag color={member.is_admin ? "red" : "blue"}>
                    {member.is_admin ? "Admin" : "Member"}
                  </Tag>
                </div>
              </div>
            </Space>
          </div>

          <div style={{ marginBottom: 16 }}>
            <Space>
              <ClockCircleOutlined />
              <Text type="secondary">
                Created: {formatDate(currentInvite.created_at)}
              </Text>
            </Space>
          </div>

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
            <Select
              disabled={
                !currentInvite.permission_previews?.includes(
                  SystemPermissionType.EDIT
                )
              }
            >
              <Option value={GroupRole.MEMBER}>Regular Member</Option>
              <Option value={GroupRole.ADMIN}>Admin</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="activeFrom"
            label={
              <Tooltip title="When this invite becomes active">
                <Space>
                  <InfoCircleOutlined style={{ color: "#aaa" }} /> Active From
                </Space>
              </Tooltip>
            }
          >
            <DatePicker
              showTime
              style={{ width: "100%" }}
              disabled={
                !currentInvite.permission_previews?.includes(
                  SystemPermissionType.EDIT
                )
              }
            />
          </Form.Item>

          <Form.Item
            name="expiresAt"
            label={
              <Tooltip title="When this invite expires">
                <Space>
                  <InfoCircleOutlined style={{ color: "#aaa" }} /> Expires At
                </Space>
              </Tooltip>
            }
          >
            <DatePicker
              showTime
              style={{ width: "100%" }}
              disabled={
                !currentInvite.permission_previews?.includes(
                  SystemPermissionType.EDIT
                )
              }
            />
          </Form.Item>

          <Form.Item
            name="note"
            label={
              <Tooltip title="Note included with this invitation">
                <Space>
                  <InfoCircleOutlined style={{ color: "#aaa" }} /> Note
                </Space>
              </Tooltip>
            }
          >
            <TextArea
              rows={3}
              placeholder="No note attached"
              disabled={
                !currentInvite.permission_previews?.includes(
                  SystemPermissionType.EDIT
                )
              }
            />
          </Form.Item>

          {currentInvite.external_id && (
            <Form.Item
              name="external_id"
              label={
                <Tooltip title="External identifier for this invite">
                  <Space>
                    <InfoCircleOutlined style={{ color: "#aaa" }} /> External ID
                  </Space>
                </Tooltip>
              }
            >
              <Input
                disabled={
                  !currentInvite.permission_previews?.includes(
                    SystemPermissionType.EDIT
                  )
                }
              />
            </Form.Item>
          )}

          {currentInvite.external_payload && (
            <Form.Item
              name="external_payload"
              label={
                <Tooltip title="External data payload">
                  <Space>
                    <InfoCircleOutlined style={{ color: "#aaa" }} /> External
                    Payload
                  </Space>
                </Tooltip>
              }
            >
              <TextArea
                rows={3}
                disabled={
                  !currentInvite.permission_previews?.includes(
                    SystemPermissionType.EDIT
                  )
                }
              />
            </Form.Item>
          )}
        </Form>
      )}
    </Drawer>
  );
};

export default EditGroupInviteDrawer;

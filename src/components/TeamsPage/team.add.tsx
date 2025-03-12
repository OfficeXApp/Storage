// src/components/TeamsPage/team.add.tsx

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
  Switch,
  message,
} from "antd";
import {
  UserOutlined,
  MailOutlined,
  BellOutlined,
  TagOutlined,
  InfoCircleOutlined,
  GlobalOutlined,
  FileTextOutlined,
} from "@ant-design/icons";
import { useDispatch, useSelector } from "react-redux";
import { v4 as uuidv4 } from "uuid";
import { IRequestCreateTeam, TeamID } from "@officexapp/types";
import { createTeamAction } from "../../redux-offline/teams/teams.actions";
import { ReduxAppState } from "../../redux-offline/ReduxProvider";

const { Text } = Typography;
const { TextArea } = Input;

interface TeamsAddDrawerProps {
  open: boolean;
  onClose: () => void;
  onAddTeam: (teamData: IRequestCreateTeam) => void;
}

const TeamsAddDrawer: React.FC<TeamsAddDrawerProps> = ({
  open,
  onClose,
  onAddTeam,
}) => {
  const dispatch = useDispatch();
  const isOnline = useSelector((state: ReduxAppState) => state.offline?.online);
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);
  const [tags, setTags] = useState<string[]>([]);
  const [inputVisible, setInputVisible] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [formChanged, setFormChanged] = useState(false);

  // Reset form when drawer opens
  useEffect(() => {
    if (open) {
      form.resetFields();
      setIsAdvancedOpen(false);
      setTags([]);
      setInputVisible(false);
      setInputValue("");
      setFormChanged(false);
    }
  }, [open, form]);

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

  const handleAddTeam = () => {
    console.log("Adding team...");
    form
      .validateFields()
      .then((values) => {
        console.log("Form values:", values);

        const teamData: IRequestCreateTeam = {
          name: values.name,
          public_note: values.publicNote || "",
          private_note: values.privateNote || "",
          endpoint_url: values.endpointUrl || undefined,
          external_id: values.externalId || undefined,
          external_payload: values.externalPayload || undefined,
        };

        console.log("Team data:", teamData);

        setLoading(true);

        // Dispatch the create team action
        dispatch(createTeamAction(teamData));

        message.success(
          isOnline
            ? "Creating team..."
            : "Queued team creation for when you're back online"
        );

        // Call the parent's onAddTeam for any additional handling
        onAddTeam(teamData);

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
      title="Add New Team"
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
            onClick={handleAddTeam}
            type="primary"
            size="large"
            loading={loading}
            disabled={!form.getFieldValue("name") || loading}
          >
            Add Team
          </Button>
        </div>
      }
    >
      <Form
        form={form}
        layout="vertical"
        initialValues={{
          name: "",
          publicNote: "",
          privateNote: "",
          endpointUrl: "",
          externalId: "",
          externalPayload: "",
        }}
      >
        <Form.Item
          name="name"
          label={
            <Tooltip title="Team name">
              <Space>
                Name <InfoCircleOutlined style={{ color: "#aaa" }} />
              </Space>
            </Tooltip>
          }
          required
        >
          <Input
            prefix={<UserOutlined />}
            size="large"
            placeholder="Enter team name"
            onChange={() => setFormChanged(true)}
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
              name="publicNote"
              label={
                <Tooltip title="Public information about this team">
                  <Space>
                    Public Note <InfoCircleOutlined style={{ color: "#aaa" }} />
                  </Space>
                </Tooltip>
              }
            >
              <TextArea
                placeholder="Public information about this team"
                rows={2}
                onChange={() => setFormChanged(true)}
              />
            </Form.Item>

            <Form.Item
              name="privateNote"
              label={
                <Tooltip title="Private information about this team (only visible to you)">
                  <Space>
                    Private Note{" "}
                    <InfoCircleOutlined style={{ color: "#aaa" }} />
                  </Space>
                </Tooltip>
              }
            >
              <TextArea
                placeholder="Private information about this team"
                rows={2}
                onChange={() => setFormChanged(true)}
              />
            </Form.Item>

            <Form.Item
              name="endpointUrl"
              label={
                <Tooltip title="URL endpoint for this team">
                  <Space>
                    Endpoint URL{" "}
                    <InfoCircleOutlined style={{ color: "#aaa" }} />
                  </Space>
                </Tooltip>
              }
            >
              <Input
                prefix={<GlobalOutlined />}
                placeholder="https://example.com/api/teams"
                onChange={() => setFormChanged(true)}
                variant="borderless"
                style={{ backgroundColor: "#fafafa" }}
              />
            </Form.Item>

            <Form.Item
              label={
                <Tooltip title="Tags to categorize this team">
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
                placeholder="JSON or other data format"
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

export default TeamsAddDrawer;

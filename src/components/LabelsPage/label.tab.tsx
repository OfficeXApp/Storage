// src/components/LabelsPage/label.tab.tsx

import React, { useEffect, useState } from "react";
import {
  Typography,
  Card,
  Button,
  Form,
  Input,
  Space,
  Tag as AntTag,
  Row,
  Col,
  Tooltip,
  Popover,
  message,
  Tabs,
  FloatButton,
  Divider,
  Popconfirm,
  ColorPicker,
} from "antd";
import {
  EditOutlined,
  TagOutlined,
  ClockCircleOutlined,
  UserOutlined,
  GlobalOutlined,
  CopyOutlined,
  InfoCircleOutlined,
  DownOutlined,
  UpOutlined,
  CodeOutlined,
  AppstoreOutlined,
} from "@ant-design/icons";
import {
  LabelFE,
  IRequestUpdateLabel,
  SystemPermissionType,
  LabelID,
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
  deleteLabelAction,
  updateLabelAction,
} from "../../redux-offline/labels/labels.actions";
import TagCopy from "../TagCopy";
import { useNavigate } from "react-router-dom";

const { Title, Paragraph, Text } = Typography;
const { TextArea } = Input;

// Define the props for the LabelTab component
interface LabelTabProps {
  label: LabelFE;
  onSave?: (updatedLabel: Partial<LabelFE>) => void;
  onDelete?: (labelID: LabelID) => void;
}

const LabelTab: React.FC<LabelTabProps> = ({ label, onSave, onDelete }) => {
  const dispatch = useDispatch();
  const isOnline = useSelector((state: ReduxAppState) => state.offline?.online);
  const [isEditing, setIsEditing] = useState(false);
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);
  const [showCodeSnippets, setShowCodeSnippets] = useState(false);
  const [form] = Form.useForm();
  const screenType = useScreenType();
  const navigate = useNavigate();

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
      const changedFields: IRequestUpdateLabel = { id: label.id as LabelID };

      // Define the specific fields we care about
      const fieldsToCheck: (keyof IRequestUpdateLabel)[] = [
        "value",
        "description",
        "color",
        "external_id",
        "external_payload",
      ];

      // Only check the fields we care about
      fieldsToCheck.forEach((field) => {
        // Skip if the field isn't in values
        if (!(field in values)) return;

        let valueFromForm = values[field];
        // Handle color picker value
        if (field === "color" && valueFromForm) {
          valueFromForm = valueFromForm.toHexString
            ? valueFromForm.toHexString()
            : valueFromForm;
        }

        const originalValue = label[field as keyof LabelFE];

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
          updateLabelAction({
            ...changedFields,
          })
        );

        message.success(
          isOnline
            ? "Updating label..."
            : "Queued label update for when you're back online"
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

  const initialValues = {
    value: label.value,
    description: label.description || "",
    color: label.color,
    external_id: label.external_id || "",
    external_payload: label.external_payload || "",
  };

  const renderCodeSnippets = () => {
    const jsCode_GET = `function getLabel(id) {\n  return fetch(\`/labels/get/\${id}\`, {\n    method: 'GET',\n    headers: { 'Content-Type': 'application/json' }\n  });\n}`;
    const jsCode_CREATE = `function createLabel(labelData) {\n  return fetch('/labels/create', {\n    method: 'POST',\n    headers: { 'Content-Type': 'application/json' },\n    body: JSON.stringify(labelData)\n  });\n}`;
    const jsCode_UPDATE = `function updateLabel(labelData) {\n  return fetch('/labels/update', {\n    method: 'POST',\n    headers: { 'Content-Type': 'application/json' },\n    body: JSON.stringify(labelData)\n  });\n}`;
    const jsCode_DELETE = `function deleteLabel(id) {\n  return fetch('/labels/delete', {\n    method: 'POST',\n    headers: { 'Content-Type': 'application/json' },\n    body: JSON.stringify({ id })\n  });\n}`;
    const jsCode_LIST = `function listLabels(filters = {}) {\n  return fetch('/labels/list', {\n    method: 'POST',\n    headers: { 'Content-Type': 'application/json' },\n    body: JSON.stringify(filters)\n  });\n}`;

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
                title="GET Label"
              />
              <CodeBlock
                code={jsCode_CREATE}
                language="javascript"
                title="CREATE Label"
              />
              <CodeBlock
                code={jsCode_UPDATE}
                language="javascript"
                title="UPDATE Label"
              />
              <CodeBlock
                code={jsCode_DELETE}
                language="javascript"
                title="DELETE Label"
              />
              <CodeBlock
                code={jsCode_LIST}
                language="javascript"
                title="LIST Labels"
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
                    !label.permission_previews.includes(
                      SystemPermissionType.EDIT
                    )
                  }
                >
                  Edit
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
                  name="value"
                  label="Label Name"
                  rules={[
                    { required: true, message: "Please enter label name" },
                  ]}
                >
                  <Input
                    placeholder="Label name"
                    variant="borderless"
                    style={{ backgroundColor: "#fafafa" }}
                  />
                </Form.Item>

                <Form.Item name="description" label="Description">
                  <TextArea
                    rows={3}
                    placeholder="Description of this label"
                    variant="borderless"
                    style={{ backgroundColor: "#fafafa" }}
                  />
                </Form.Item>

                <Form.Item name="color" label="Color">
                  <ColorPicker />
                </Form.Item>

                <Form.Item name="external_id" label="External ID">
                  <Input
                    placeholder="External system identifier"
                    variant="borderless"
                    style={{ backgroundColor: "#fafafa" }}
                  />
                </Form.Item>

                <Form.Item name="external_payload" label="External Payload">
                  <TextArea
                    rows={2}
                    placeholder="Additional data for external systems"
                    variant="borderless"
                    style={{ backgroundColor: "#fafafa" }}
                  />
                </Form.Item>

                <Divider />
                <Form.Item name="delete">
                  <Popconfirm
                    title="Are you sure you want to delete this label?"
                    okText="Yes"
                    cancelText="No"
                    onConfirm={() => {
                      dispatch(deleteLabelAction({ id: label.id }));
                      message.success(
                        isOnline
                          ? "Deleting label..."
                          : "Queued label delete for when you're back online"
                      );
                      if (onDelete) {
                        onDelete(label.id);
                      }
                    }}
                  >
                    <Button
                      disabled={
                        !label.permission_previews.includes(
                          SystemPermissionType.DELETE
                        )
                      }
                      ghost
                      type="primary"
                      danger
                    >
                      Delete Label
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
                        <div
                          style={{
                            width: 64,
                            height: 64,
                            borderRadius: "50%",
                            backgroundColor: label.color || "#1890ff",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          <TagOutlined
                            style={{ fontSize: 32, color: "white" }}
                          />
                        </div>
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
                              {label.value}
                            </Title>
                            <TagCopy id={label.id} />
                          </div>
                          <Space>
                            <Text type="secondary">
                              {label.resources
                                ? `Used in ${label.resources.length} resources`
                                : "Not used in any resources"}
                            </Text>
                          </Space>
                        </div>
                      </Space>
                    </Space>
                  </Col>
                </Row>

                <Row gutter={[16, 16]}>
                  <Col span={24}>
                    <div
                      style={{
                        marginBottom: screenType.isMobile ? 8 : 16,
                        marginTop: 24,
                      }}
                    >
                      <Card size="small" style={{ marginTop: 8 }}>
                        <GlobalOutlined style={{ marginRight: 8 }} />
                        {label.description || "No description provided"}
                      </Card>
                    </div>

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
                          "Label ID",
                          label.id,
                          <TagOutlined />
                        )}

                        {renderReadOnlyField(
                          "Color",
                          label.color || "",
                          <div
                            style={{
                              width: 16,
                              height: 16,
                              backgroundColor: label.color || "#1890ff",
                              borderRadius: "4px",
                            }}
                          />
                        )}

                        {label.external_id &&
                          renderReadOnlyField(
                            "External ID",
                            label.external_id,
                            <InfoCircleOutlined />
                          )}

                        {label.external_payload &&
                          renderReadOnlyField(
                            "Ext. Payload",
                            label.external_payload,
                            <InfoCircleOutlined />
                          )}

                        <div style={{ marginTop: "16px" }}>
                          <Space align="center">
                            <ClockCircleOutlined />
                            <Text type="secondary">
                              Created {formatDate(label.created_at)}
                            </Text>
                          </Space>
                          <div style={{ marginTop: 8 }}>
                            <Space align="center">
                              <ClockCircleOutlined />
                              <Text type="secondary">
                                Last updated {formatDate(label.last_updated_at)}
                              </Text>
                            </Space>
                          </div>
                          <div style={{ marginTop: 8 }}>
                            <Space align="center">
                              <UserOutlined />
                              <Text
                                type="secondary"
                                onClick={(e) => {
                                  if (e.ctrlKey || e.metaKey) {
                                    const url = `${window.location.origin}/resources/contacts/${label.created_by}`;
                                    window.open(url, "_blank");
                                  } else {
                                    // Navigate using React Router
                                    navigate(
                                      `/resources/contacts/${label.created_by}`
                                    );
                                  }
                                }}
                              >
                                Created by {label.created_by}
                              </Text>
                            </Space>
                          </div>
                        </div>
                      </div>
                    </details>
                  </Col>

                  {label.resources && label.resources.length > 0 && (
                    <Col span={24}>
                      <Title level={5}>Resources</Title>
                      {label.resources.map((resource, index) => (
                        <Card
                          key={index}
                          size="small"
                          style={{ marginBottom: 8 }}
                        >
                          <Space>
                            <AppstoreOutlined />
                            <Text>{resource.id}</Text>
                            <Text type="secondary">{resource.type}</Text>
                          </Space>
                        </Card>
                      ))}
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
      <br />
      <br />
    </div>
  );
};

export default LabelTab;

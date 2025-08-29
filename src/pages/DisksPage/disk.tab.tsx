import React, { useEffect, useState } from "react";
import {
  Typography,
  Card,
  Button,
  Form,
  Input,
  Space,
  Tag,
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
  Select,
  Switch,
} from "antd";
import toast from "react-hot-toast";
import {
  EditOutlined,
  TagOutlined,
  ClockCircleOutlined,
  DatabaseOutlined,
  GlobalOutlined,
  FileTextOutlined,
  CopyOutlined,
  InfoCircleOutlined,
  DownOutlined,
  UpOutlined,
  CodeOutlined,
  KeyOutlined,
  LoadingOutlined,
  SyncOutlined,
} from "@ant-design/icons";
import {
  IRequestUpdateDisk,
  SystemPermissionType,
  DiskID,
  DiskTypeEnum,
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
  deleteDiskAction,
  getDiskAction,
  updateDiskAction,
} from "../../redux-offline/disks/disks.actions";
import { DiskFEO } from "../../redux-offline/disks/disks.reducer";
import { useNavigate } from "react-router-dom";
import {
  defaultBrowserCacheDiskID,
  defaultTempCloudSharingDiskID,
} from "../../api/dexie-database";
import TagCopy from "../../components/TagCopy";
import { generateRedeemDiskGiftCardURL } from "./disk.redeem";

const { Title, Paragraph, Text } = Typography;
const { TextArea } = Input;
const { Option } = Select;

// Define the props for the DiskTab component
interface DiskTabProps {
  diskCache: DiskFEO;
  onSave?: (updatedDisk: Partial<DiskFEO>) => void;
  onDelete?: (diskID: DiskID) => void;
}

const DiskTab: React.FC<DiskTabProps> = ({ diskCache, onSave, onDelete }) => {
  const dispatch = useDispatch();
  const isOnline = useSelector((state: ReduxAppState) => state.offline?.online);
  const [isEditing, setIsEditing] = useState(false);
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);
  const [showCodeSnippets, setShowCodeSnippets] = useState(false);
  const [form] = Form.useForm();
  const screenType = useScreenType();
  const navigate = useNavigate();
  const [giftLink, setGiftLink] = useState("");
  const disk =
    useSelector((state: ReduxAppState) => state.disks.diskMap[diskCache.id]) ||
    diskCache;

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
      const changedFields: IRequestUpdateDisk = { id: disk.id as DiskID };

      // Define the specific fields we care about
      const fieldsToCheck: (keyof IRequestUpdateDisk)[] = [
        "name",
        "public_note",
        "private_note",
        "auth_json",
        "external_id",
        "external_payload",
        "billing_url",
      ];

      // Only check the fields we care about
      fieldsToCheck.forEach((field) => {
        // Skip if the field isn't in values
        if (!(field in values)) return;

        const valueFromForm = values[field];
        const originalValue = disk[field as keyof DiskFEO];

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
      if (Object.keys(changedFields).length > 1 && changedFields.id) {
        // More than just the ID
        // Dispatch the update action if we're online
        dispatch(
          updateDiskAction({
            ...changedFields,
          })
        );

        toast(
          isOnline ? (
            <span>Updating disk...</span>
          ) : (
            <span>Queued disk update for when you're back online</span>
          )
        );

        // Call the onSave prop if provided (for backward compatibility)
        if (onSave) {
          onSave(changedFields);
        }
      } else {
        toast(<span>No changes detected</span>);
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
    toast.success(<span>Copied to clipboard</span>);
  };

  const renderReadOnlyField = (
    label: React.ReactNode,
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
    if (label === "Auth JSON") {
      return (
        <Input.Password
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
            <Tooltip title={<span>Copy to clipboard</span>}>
              <CopyOutlined
                onClick={() => copyToClipboard(value)}
                style={{ cursor: "pointer", color: "#1890ff" }}
              />
            </Tooltip>
          }
        />
      );
    }
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
          <Tooltip title={<span>Copy to clipboard</span>}>
            <CopyOutlined
              onClick={() => copyToClipboard(value)}
              style={{ cursor: "pointer", color: "#1890ff" }}
            />
          </Tooltip>
        }
      />
    );
  };

  const getDiskTypeLabel = (type: DiskTypeEnum) => {
    switch (type) {
      case DiskTypeEnum.LocalSSD:
        return "Physical SSD";
      case DiskTypeEnum.AwsBucket:
        return "Amazon Bucket";
      case DiskTypeEnum.StorjWeb3:
        return "StorjWeb3 Bucket";
      case DiskTypeEnum.BrowserCache:
        return "Offline Browser";
      case DiskTypeEnum.IcpCanister:
        return "ICP Canister";
      default:
        return "Unknown";
    }
  };

  if (!disk) return null;

  const initialValues = {
    name: disk.name,
    disk_type: disk.disk_type,
    auth_json: disk.auth_json || "",
    public_note: disk.public_note || "",
    private_note: disk.private_note || "",
    external_id: disk.external_id || "",
    external_payload: disk.external_payload || "",
    billing_url: disk.billing_url || "",
  };

  const renderCodeSnippets = () => {
    const jsCode_GET = `function getDisk(id) {\n  return fetch(\`/disks/get/\${id}\`, {\n    method: 'GET',\n    headers: {\n      'Content-Type': 'application/json',\n    },\n  }).then(response => response.json());\n}`;
    const jsCode_CREATE = `function createDisk(diskData) {\n  return fetch('/disks/create', {\n    method: 'POST',\n    headers: {\n      'Content-Type': 'application/json',\n    },\n    body: JSON.stringify(diskData),\n  }).then(response => response.json());\n}`;
    const jsCode_UPDATE = `function updateDisk(diskData) {\n  return fetch('/disks/update', {\n    method: 'POST',\n    headers: {\n      'Content-Type': 'application/json',\n    },\n    body: JSON.stringify(diskData),\n  }).then(response => response.json());\n}`;
    const jsCode_DELETE = `function deleteDisk(id) {\n  return fetch('/disks/delete', {\n    method: 'POST',\n    headers: {\n      'Content-Type': 'application/json',\n    },\n    body: JSON.stringify({ id }),\n  }).then(response => response.json());\n}`;
    const jsCode_LIST = `function listDisks(params) {\n  return fetch('/disks/list', {\n    method: 'POST',\n    headers: {\n      'Content-Type': 'application/json',\n    },\n    body: JSON.stringify(params),\n  }).then(response => response.json());\n}`;

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
                title="GET Disk"
              />
              <CodeBlock
                code={jsCode_CREATE}
                language="javascript"
                title="CREATE Disk"
              />
              <CodeBlock
                code={jsCode_UPDATE}
                language="javascript"
                title="UPDATE Disk"
              />
              <CodeBlock
                code={jsCode_DELETE}
                language="javascript"
                title="DELETE Disk"
              />
              <CodeBlock
                code={jsCode_LIST}
                language="javascript"
                title="LIST Disks"
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

  const syncLatest = () => {
    dispatch(getDiskAction(disk.id));
  };

  const generateGiftLink = async () => {
    try {
      // Construct the gift card parameters from form values
      const giftParams = {
        name: `Gift - ${disk.name}`,
        disk_type: disk.disk_type,
        public_note: disk.public_note || "",
        auth_json: disk.auth_json || "",
        billing_url: disk.billing_url || "",
      };

      // Generate the URL
      const url = generateRedeemDiskGiftCardURL(giftParams);

      // Copy to clipboard
      await navigator.clipboard.writeText(url);
      toast.success(<span>Gift link copied to clipboard!</span>);
      setGiftLink(url);
    } catch (error) {
      console.error("Error generating gift link:", error);
      toast.error(
        <span>Please fill in at least the name and disk type fields</span>
      );
    }
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
          {/* Empty col for spacing */}
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
                    !disk.permission_previews.includes(
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
                  name="name"
                  label={<span>Name</span>}
                  rules={[{ required: true, message: "Please enter name" }]}
                >
                  <Input
                    placeholder="Disk name"
                    variant="borderless"
                    style={{ backgroundColor: "#fafafa" }}
                  />
                </Form.Item>

                <Form.Item
                  name="disk_type"
                  label={<span>Disk Type</span>}
                  rules={[
                    { required: true, message: "Please select disk type" },
                  ]}
                >
                  <Select
                    disabled
                    variant="borderless"
                    style={{ backgroundColor: "#fafafa" }}
                  >
                    <Option value={DiskTypeEnum.BrowserCache}>
                      Offline Browser
                    </Option>
                    <Option value={DiskTypeEnum.AwsBucket}>Amazon S3</Option>
                    <Option value={DiskTypeEnum.LocalSSD}>Physical SSD</Option>
                    <Option value={DiskTypeEnum.AwsBucket}>
                      Amazon Bucket
                    </Option>
                    <Option value={DiskTypeEnum.StorjWeb3}>
                      StorjWeb3 Bucket
                    </Option>
                  </Select>
                </Form.Item>

                <Form.Item name="public_note" label={<span>Public Note</span>}>
                  <TextArea
                    rows={6}
                    placeholder="Public information about this disk"
                    variant="borderless"
                    style={{ backgroundColor: "#fafafa" }}
                  />
                </Form.Item>

                {disk.permission_previews.includes(
                  SystemPermissionType.EDIT
                ) && (
                  <>
                    <Form.Item
                      name="endpoint"
                      label={<span>Endpoint URL</span>}
                    >
                      <Input
                        prefix={<GlobalOutlined />}
                        placeholder="URL for disk billing and info"
                        variant="borderless"
                        style={{ backgroundColor: "#fafafa" }}
                      />
                    </Form.Item>
                    <Form.Item
                      name="private_note"
                      label={<span>Private Note</span>}
                      extra={
                        <span>
                          Only organization owners and editors can view this note
                        </span>
                      }
                    >
                      <TextArea
                        rows={6}
                        placeholder="Private notes (only visible to owners and editors)"
                        variant="borderless"
                        style={{ backgroundColor: "#fafafa" }}
                      />
                    </Form.Item>

                    {disk.disk_type !== DiskTypeEnum.BrowserCache && (
                      <Form.Item
                        name="auth_json"
                        label={<span>Authentication JSON</span>}
                        extra={
                          <span>
                            Authentication information for cloud storage
                          </span>
                        }
                      >
                        <TextArea
                          rows={4}
                          placeholder='{"key": "value", ...}'
                          variant="borderless"
                          style={{ backgroundColor: "#fafafa" }}
                        />
                      </Form.Item>
                    )}

                    <Form.Item
                      name="external_id"
                      label={<span>External ID</span>}
                    >
                      <Input
                        placeholder="External identifier"
                        variant="borderless"
                        style={{ backgroundColor: "#fafafa" }}
                      />
                    </Form.Item>

                    <Form.Item
                      name="external_payload"
                      label={<span>External Payload</span>}
                    >
                      <TextArea
                        rows={2}
                        placeholder="Additional data for external systems"
                        variant="borderless"
                        style={{ backgroundColor: "#fafafa" }}
                      />
                    </Form.Item>
                  </>
                )}

                <Divider />
                <Form.Item name="delete">
                  <Popconfirm
                    title={
                      <span>Are you sure you want to delete this disk?</span>
                    }
                    okText={<span>Yes</span>}
                    cancelText={<span>No</span>}
                    onConfirm={() => {
                      dispatch(deleteDiskAction({ id: disk.id }));
                      toast(
                        isOnline ? (
                          <span>Deleting disk...</span>
                        ) : (
                          <span>
                            Queued disk delete for when you're back online
                          </span>
                        )
                      );
                      if (onDelete) {
                        onDelete(disk.id);
                      }
                    }}
                  >
                    <Button
                      disabled={
                        !disk.permission_previews.includes(
                          SystemPermissionType.DELETE
                        )
                      }
                      ghost
                      type="primary"
                      danger
                    >
                      Delete Disk
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
                            backgroundColor: "#1890ff",
                            borderRadius: "50%",
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                            color: "white",
                            fontSize: "28px",
                          }}
                        >
                          <DatabaseOutlined />
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
                              {disk.name}
                            </Title>
                            {disk.id === defaultBrowserCacheDiskID ||
                            disk.id === defaultTempCloudSharingDiskID ? (
                              <Tag color="blue">Temp</Tag>
                            ) : (
                              <TagCopy id={disk.id} />
                            )}
                            <div style={{ marginTop: "0px" }}>
                              {disk.isLoading ? (
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
                                    toast(<span>Syncing latest...</span>);
                                    syncLatest();
                                  }}
                                  style={{ color: "rgba(0,0,0,0.2)" }}
                                />
                              )}
                            </div>
                          </div>
                          <Space>
                            <Text type="secondary">
                              {getDiskTypeLabel(disk.disk_type)}
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

                    {!screenType.isMobile && (
                      <div
                        style={{
                          marginTop: 4,
                          display: "flex",
                          justifyContent: "flex-end",
                          flexWrap: "wrap",
                        }}
                      >
                        {disk.labels &&
                          disk.labels.map((label, index) => (
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
                          : disk.labels && disk.labels.length > 0
                            ? 0
                            : 32,
                      }}
                    >
                      <Card size="small" style={{ marginTop: 8 }}>
                        <GlobalOutlined style={{ marginRight: 8 }} />
                        {disk.public_note || "No public note available"}
                      </Card>
                    </div>

                    {screenType.isMobile && disk.labels && (
                      <div
                        style={{
                          marginTop: 4,
                          display: "flex",
                          justifyContent: "flex-start",
                          flexWrap: "wrap",
                        }}
                      >
                        {disk.labels.map((label, index) => (
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
                          <span>Disk ID</span>,
                          disk.id,
                          <DatabaseOutlined />
                        )}

                        {disk.auth_json &&
                          disk.permission_previews.includes(
                            SystemPermissionType.EDIT
                          ) &&
                          renderReadOnlyField(
                            <span>Auth JSON</span>,
                            disk.auth_json,
                            <KeyOutlined />
                          )}

                        {disk.billing_url &&
                          renderReadOnlyField(
                            <span>Billing</span>,
                            disk.billing_url,
                            <GlobalOutlined />
                          )}

                        {disk.private_note &&
                          disk.permission_previews.includes(
                            SystemPermissionType.EDIT
                          ) && (
                            <div style={{ marginTop: "16px" }}>
                              <Space align="center">
                                <Text strong>Private Note:</Text>
                                <Popover
                                  content={
                                    <span>
                                      Only organization owners and editors can
                                      view this note
                                    </span>
                                  }
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
                                {disk.private_note}
                              </Card>
                            </div>
                          )}

                        {disk.auth_json &&
                          disk.permission_previews.includes(
                            SystemPermissionType.EDIT
                          ) && (
                            <Input
                              value={giftLink}
                              readOnly
                              suffix={
                                <span
                                  onClick={() => {
                                    navigator.clipboard.writeText(giftLink);
                                    toast.success(
                                      <span>Copied to clipboard</span>
                                    );
                                  }}
                                  style={{ cursor: "pointer" }}
                                >
                                  <CopyOutlined
                                    style={{
                                      cursor: "pointer",
                                      margin: "0px 8px",
                                    }}
                                  />
                                  Copy
                                </span>
                              }
                              prefix={
                                <Button
                                  size="small"
                                  type="dashed"
                                  onClick={generateGiftLink}
                                >
                                  Share Gift Link
                                </Button>
                              }
                              style={{ marginTop: 8, marginBottom: 8 }}
                            />
                          )}

                        <div style={{ marginTop: "16px" }}>
                          <Space align="center">
                            <ClockCircleOutlined />
                            <Text type="secondary">
                              Created on {formatDate(disk.created_at)}
                            </Text>
                          </Space>
                          {disk.external_id && (
                            <div style={{ marginTop: 8 }}>
                              <Text type="secondary">
                                External ID: {disk.external_id}
                              </Text>
                            </div>
                          )}
                          {disk.external_payload && (
                            <div style={{ marginTop: 8 }}>
                              <Text type="secondary">
                                External Payload: {disk.external_payload}
                              </Text>
                            </div>
                          )}
                        </div>
                      </div>
                    </details>
                  </Col>
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
      {!screenType.isMobile && !showCodeSnippets && (
        <FloatButton
          icon={<CodeOutlined />}
          type="default"
          tooltip="View Code"
          onClick={() => {
            setShowCodeSnippets(true);
            localStorage.setItem(
              LOCAL_STORAGE_TOGGLE_REST_API_DOCS,
              JSON.stringify(true)
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

export default DiskTab;

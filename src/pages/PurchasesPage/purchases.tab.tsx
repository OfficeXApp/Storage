// src/pages/PurchasesPage/purchases.tab.tsx

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
  RocketOutlined, // Changed icon
  GlobalOutlined,
  FileTextOutlined,
  CopyOutlined,
  InfoCircleOutlined,
  DownOutlined,
  UpOutlined,
  CodeOutlined,
  LoadingOutlined,
  SyncOutlined,
  UserOutlined, // For Vendor ID
  DollarOutlined, // For Pricing
  LinkOutlined,
  GiftFilled, // For URLs
} from "@ant-design/icons";
import {
  IRequestUpdatePurchase,
  SystemPermissionType,
  PurchaseID,
  PurchaseStatus, // Import PurchaseStatus
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
  deletePurchaseAction,
  getPurchaseAction,
  updatePurchaseAction,
} from "../../redux-offline/purchases/purchases.actions";
import { PurchaseFEO } from "../../redux-offline/purchases/purchases.reducer";
import { useNavigate } from "react-router-dom";
import TagCopy from "../../components/TagCopy";

const { Title, Paragraph, Text } = Typography;
const { TextArea } = Input;
const { Option } = Select;

// Define the props for the PurchaseTab component
interface PurchaseTabProps {
  purchaseCache: PurchaseFEO;
  onSave?: (updatedPurchase: Partial<PurchaseFEO>) => void;
  onDelete?: (purchaseID: PurchaseID) => void;
}

const PurchaseTab: React.FC<PurchaseTabProps> = ({
  purchaseCache,
  onSave,
  onDelete,
}) => {
  const dispatch = useDispatch();
  const isOnline = useSelector((state: ReduxAppState) => state.offline?.online);
  const [isEditing, setIsEditing] = useState(false);
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);
  const [showCodeSnippets, setShowCodeSnippets] = useState(false);
  const [form] = Form.useForm();
  const screenType = useScreenType();
  const navigate = useNavigate();

  const purchase =
    useSelector(
      (state: ReduxAppState) => state.purchases.purchaseMap[purchaseCache.id]
    ) || purchaseCache;

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
      const changedFields: IRequestUpdatePurchase = {
        id: purchase.id as PurchaseID,
      };

      // Define the specific fields we care about
      const fieldsToCheck: (keyof IRequestUpdatePurchase)[] = [
        "status",
        "subtitle",
        "pricing",
        "vendor_notes",
        "about_url",
        "billing_url",
        "support_url",
        "delivery_url",
        "verification_url",
        "related_resources",
        "tracer",
        "labels",
        "external_id",
        "external_payload",
      ];

      // Only check the fields we care about
      fieldsToCheck.forEach((field) => {
        // Skip if the field isn't in values
        if (!(field in values)) return;

        const valueFromForm = values[field];

        // @ts-ignore
        const originalValue = purchase[field as keyof PurchaseFEO];

        // Special handling for array fields like labels or related_resources
        if (Array.isArray(valueFromForm) && Array.isArray(originalValue)) {
          // Check if arrays are different (order-independent)
          if (
            JSON.stringify([...valueFromForm].sort()) !==
            JSON.stringify([...originalValue].sort())
          ) {
            // @ts-ignore
            changedFields[field] = valueFromForm as any;
          }
        }
        // Handle empty strings - don't include them if they're just empty strings replacing undefined/null
        else if (
          valueFromForm === "" &&
          (originalValue === undefined || originalValue === null)
        ) {
          return;
        }
        // Only include fields that have changed for non-array types
        else if (valueFromForm !== originalValue) {
          // @ts-ignore
          changedFields[field] = valueFromForm;
        }
      });

      // Only proceed if there are actual changes
      if (Object.keys(changedFields).length > 1 && changedFields.id) {
        // More than just the ID
        // Dispatch the update action if we're online
        dispatch(
          updatePurchaseAction({
            ...changedFields,
          })
        );

        toast.success(
          isOnline ? (
            <span>Updating purchase...</span>
          ) : (
            <span>Queued purchase update for when you're back online</span>
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
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success(<span>Copied to clipboard</span>);
  };

  const renderReadOnlyField = (
    label: React.ReactNode,
    value: string | undefined | null,
    icon: React.ReactNode,
    navigationRoute?: string,
    isPassword?: boolean
  ) => {
    if (!value) return null; // Don't render if value is null or undefined

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

    const InputComponent = isPassword ? Input.Password : Input;

    return (
      <InputComponent
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
              width: screenType.isMobile ? 120 : 120, // Adjusted width
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

  if (!purchase) return null;

  const initialValues = {
    title: purchase.title,
    subtitle: purchase.subtitle || "",
    description: purchase.description || "",
    vendor_name: purchase.vendor_name,
    vendor_id: purchase.vendor_id,
    status: purchase.status,
    pricing: purchase.pricing || "",
    vendor_notes: purchase.vendor_notes || "",
    notes: purchase.notes || "",
    about_url: purchase.about_url || "",
    billing_url: purchase.billing_url || "",
    support_url: purchase.support_url || "",
    delivery_url: purchase.delivery_url || "",
    verification_url: purchase.verification_url || "",
    auth_installation_url: purchase.auth_installation_url || "",
    related_resources: purchase.related_resources || [],
    tracer: purchase.tracer || "",
    labels: purchase.labels || [],
    external_id: purchase.external_id || "",
    external_payload: purchase.external_payload || "",
  };

  const renderCodeSnippets = () => {
    const jsCode_GET = `function getPurchase(id) {\n  return fetch(\`/purchases/get/\${id}\`, {\n    method: 'GET',\n    headers: {\n      'Content-Type': 'application/json',\n    },\n  }).then(response => response.json());\n}`;
    const jsCode_CREATE = `function createPurchase(purchaseData) {\n  return fetch('/purchases/create', {\n    method: 'POST',\n    headers: {\n      'Content-Type': 'application/json',\n    },\n    body: JSON.stringify(purchaseData),\n  }).then(response => response.json());\n}`;
    const jsCode_UPDATE = `function updatePurchase(purchaseData) {\n  return fetch('/purchases/update', {\n    method: 'POST',\n    headers: {\n      'Content-Type': 'application/json',\n    },\n    body: JSON.stringify(purchaseData),\n  }).then(response => response.json());\n}`;
    const jsCode_DELETE = `function deletePurchase(id) {\n  return fetch('/purchases/delete', {\n    method: 'POST',\n    headers: {\n      'Content-Type': 'application/json',\n    },\n    body: JSON.stringify({ id }),\n  }).then(response => response.json());\n}`;
    const jsCode_LIST = `function listPurchases(params) {\n  return fetch('/purchases/list', {\n    method: 'POST',\n    headers: {\n      'Content-Type': 'application/json',\n    },\n    body: JSON.stringify(params),\n  }).then(response => response.json());\n}`;

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
                title="GET Purchase"
              />
              <CodeBlock
                code={jsCode_CREATE}
                language="javascript"
                title="CREATE Purchase"
              />
              <CodeBlock
                code={jsCode_UPDATE}
                language="javascript"
                title="UPDATE Purchase"
              />
              <CodeBlock
                code={jsCode_DELETE}
                language="javascript"
                title="DELETE Purchase"
              />
              <CodeBlock
                code={jsCode_LIST}
                language="javascript"
                title="LIST Purchases"
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
    dispatch(getPurchaseAction(purchase.id));
  };

  // Function to get appropriate tag color for PurchaseStatus
  const getStatusTagColor = (status: PurchaseStatus) => {
    switch (status) {
      case PurchaseStatus.COMPLETED:
        return "success";
      case PurchaseStatus.RUNNING:
        return "processing";
      case PurchaseStatus.FAILED:
        return "error";
      case PurchaseStatus.CANCELED:
      case PurchaseStatus.REFUNDED:
        return "default";
      case PurchaseStatus.REQUESTED:
      case PurchaseStatus.AWAITING:
        return "warning";
      case PurchaseStatus.BLOCKED:
        return "red";
      default:
        return "default";
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
                    !purchase.permission_previews.includes(
                      SystemPermissionType.EDIT
                    )
                  }
                >
                  Edit
                </Button>

                <Button
                  icon={<GiftFilled />}
                  href={purchase.delivery_url}
                  target="_blank"
                  type="primary"
                  size={screenType.isMobile ? "small" : "middle"}
                  disabled={!purchase.delivery_url}
                >
                  View Delivery
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
                <Form.Item name="title" label={<span>Title</span>}>
                  <Input
                    placeholder="Purchase Title"
                    variant="borderless"
                    style={{ backgroundColor: "#fafafa" }}
                  />
                </Form.Item>
                <Form.Item name="subtitle" label={<span>Subtitle</span>}>
                  <Input
                    placeholder="Purchase Subtitle"
                    variant="borderless"
                    style={{ backgroundColor: "#fafafa" }}
                  />
                </Form.Item>
                <Form.Item name="description" label={<span>Description</span>}>
                  <TextArea
                    rows={4}
                    placeholder="Detailed description of the purchase"
                    variant="borderless"
                  />
                </Form.Item>
                <Form.Item name="status" label={<span>Status</span>}>
                  <Select
                    placeholder="Select Status"
                    variant="borderless"
                    style={{ backgroundColor: "#fafafa" }}
                  >
                    {Object.values(PurchaseStatus).map((status) => (
                      <Option key={status} value={status}>
                        {status}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
                <Form.Item name="pricing" label={<span>Pricing</span>}>
                  <Input
                    placeholder="Pricing information"
                    prefix={<DollarOutlined />}
                    variant="borderless"
                    style={{ backgroundColor: "#fafafa" }}
                  />
                </Form.Item>
                <Form.Item
                  name="vendor_notes"
                  label={<span>Vendor Notes</span>}
                >
                  <TextArea
                    rows={3}
                    placeholder="Notes from the vendor"
                    variant="borderless"
                    style={{ backgroundColor: "#fafafa" }}
                  />
                </Form.Item>
                <Form.Item name="about_url" label={<span>About URL</span>}>
                  <Input
                    prefix={<LinkOutlined />}
                    placeholder="URL for more info about this purchase"
                    variant="borderless"
                    style={{ backgroundColor: "#fafafa" }}
                  />
                </Form.Item>
                <Form.Item name="run_url" label={<span>Run URL</span>}>
                  <Input
                    prefix={<LinkOutlined />}
                    placeholder="URL to run or access the purchase"
                    variant="borderless"
                    style={{ backgroundColor: "#fafafa" }}
                  />
                </Form.Item>
                <Form.Item name="billing_url" label={<span>Billing URL</span>}>
                  <Input
                    prefix={<LinkOutlined />}
                    placeholder="URL for billing details"
                    variant="borderless"
                    style={{ backgroundColor: "#fafafa" }}
                  />
                </Form.Item>
                <Form.Item name="support_url" label={<span>Support URL</span>}>
                  <Input
                    prefix={<LinkOutlined />}
                    placeholder="URL for support"
                    variant="borderless"
                    style={{ backgroundColor: "#fafafa" }}
                  />
                </Form.Item>
                <Form.Item
                  name="delivery_url"
                  label={<span>Delivery URL</span>}
                >
                  <Input
                    prefix={<LinkOutlined />}
                    placeholder="URL for delivery status/info"
                    variant="borderless"
                    style={{ backgroundColor: "#fafafa" }}
                  />
                </Form.Item>
                <Form.Item
                  name="verification_url"
                  label={<span>Verification URL</span>}
                >
                  <Input
                    prefix={<LinkOutlined />}
                    placeholder="URL for verification"
                    variant="borderless"
                    style={{ backgroundColor: "#fafafa" }}
                  />
                </Form.Item>
                <Form.Item
                  name="auth_installation_url"
                  label={<span>Installation URL</span>}
                >
                  <Input
                    prefix={<LinkOutlined />}
                    placeholder="URL to install the purchase script"
                    variant="borderless"
                    style={{ backgroundColor: "#fafafa" }}
                  />
                </Form.Item>
                <Form.Item
                  name="related_resources"
                  label={<span>Related Resources (IDs)</span>}
                >
                  <Select
                    mode="tags"
                    placeholder="Add related resource IDs"
                    variant="borderless"
                    style={{ backgroundColor: "#fafafa" }}
                  />
                </Form.Item>
                <Form.Item name="labels" label={<span>Labels</span>}>
                  <Select
                    mode="tags"
                    placeholder="Add labels"
                    variant="borderless"
                    style={{ backgroundColor: "#fafafa" }}
                  />
                </Form.Item>
                <Form.Item name="tracer" label={<span>Tracer</span>}>
                  <Input
                    placeholder="Tracer string"
                    variant="borderless"
                    style={{ backgroundColor: "#fafafa" }}
                  />
                </Form.Item>
                <Form.Item name="external_id" label={<span>External ID</span>}>
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
                <Divider />
                <Form.Item name="delete">
                  <Popconfirm
                    title={
                      <span>
                        Are you sure you want to delete this purchase?
                      </span>
                    }
                    okText={<span>Yes</span>}
                    cancelText={<span>No</span>}
                    onConfirm={() => {
                      dispatch(deletePurchaseAction({ id: purchase.id }));
                      toast.success(
                        isOnline ? (
                          <span>Deleting purchase...</span>
                        ) : (
                          <span>
                            Queued purchase delete for when you're back online
                          </span>
                        )
                      );
                      if (onDelete) {
                        onDelete(purchase.id);
                      }
                    }}
                  >
                    <Button
                      disabled={
                        !purchase.permission_previews.includes(
                          SystemPermissionType.DELETE
                        )
                      }
                      ghost
                      type="primary"
                      danger
                    >
                      Delete Purchase
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
                          <RocketOutlined />
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
                              {purchase.title}
                            </Title>
                            <TagCopy id={purchase.id} />
                            <Tag color={getStatusTagColor(purchase.status)}>
                              {purchase.status}
                            </Tag>
                            <div style={{ marginTop: "0px" }}>
                              {purchase.isLoading ? (
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
                              {purchase.subtitle || "No subtitle"}
                            </Text>
                          </Space>
                        </div>
                      </Space>
                    </Space>
                  </Col>
                </Row>

                <Row gutter={[16, 16]}>
                  <Col span={24}>
                    {!screenType.isMobile && (
                      <div
                        style={{
                          marginTop: 4,
                          display: "flex",
                          justifyContent: "flex-end",
                          flexWrap: "wrap",
                        }}
                      >
                        {purchase.labels &&
                          purchase.labels.map((label, index) => (
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
                          : purchase.labels && purchase.labels.length > 0
                            ? 0
                            : 32,
                      }}
                    >
                      <Card size="small" style={{ marginTop: 8 }}>
                        <InfoCircleOutlined style={{ marginRight: 8 }} />
                        {purchase.description || "No description available"}
                      </Card>
                    </div>

                    {screenType.isMobile && purchase.labels && (
                      <div
                        style={{
                          marginTop: 4,
                          display: "flex",
                          justifyContent: "flex-start",
                          flexWrap: "wrap",
                        }}
                      >
                        {purchase.labels.map((label, index) => (
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
                          <span>Vendor Name</span>,
                          purchase.vendor_name,
                          <UserOutlined />
                        )}
                        {renderReadOnlyField(
                          <span>Vendor ID</span>,
                          purchase.vendor_id,
                          <UserOutlined />
                        )}
                        {renderReadOnlyField(
                          <span>Status</span>,
                          purchase.status,
                          <Tag color={getStatusTagColor(purchase.status)} />
                        )}
                        {renderReadOnlyField(
                          <span>Pricing</span>,
                          purchase.pricing,
                          <DollarOutlined />
                        )}
                        {purchase.permission_previews.includes(
                          SystemPermissionType.EDIT
                        ) &&
                          renderReadOnlyField(
                            <span>Vendor Notes</span>,
                            purchase.vendor_notes,
                            <FileTextOutlined />
                          )}
                        {renderReadOnlyField(
                          <span>About URL</span>,
                          purchase.about_url,
                          <LinkOutlined />
                        )}
                        {renderReadOnlyField(
                          <span>Billing URL</span>,
                          purchase.billing_url,
                          <LinkOutlined />
                        )}
                        {renderReadOnlyField(
                          <span>Support URL</span>,
                          purchase.support_url,
                          <LinkOutlined />
                        )}
                        {renderReadOnlyField(
                          <span>Delivery URL</span>,
                          purchase.delivery_url,
                          <LinkOutlined />
                        )}
                        {renderReadOnlyField(
                          <span>Verification URL</span>,
                          purchase.verification_url,
                          <LinkOutlined />
                        )}
                        {renderReadOnlyField(
                          <span>Installation URL</span>,
                          purchase.auth_installation_url,
                          <LinkOutlined />
                        )}
                        {renderReadOnlyField(
                          <span>Tracer</span>,
                          purchase.tracer,
                          <FileTextOutlined />
                        )}
                        {renderReadOnlyField(
                          <span>External ID</span>,
                          purchase.external_id,
                          <FileTextOutlined />
                        )}
                        {renderReadOnlyField(
                          <span>External Payload</span>,
                          purchase.external_payload,
                          <FileTextOutlined />
                        )}
                        <div style={{ marginTop: "16px" }}>
                          <Space align="center">
                            <ClockCircleOutlined />
                            <Text type="secondary">
                              Created on {formatDate(purchase.created_at)}
                            </Text>
                          </Space>
                          {purchase.updated_at && (
                            <div style={{ marginTop: 8 }}>
                              <Space align="center">
                                <ClockCircleOutlined />
                                <Text type="secondary">
                                  Last updated on{" "}
                                  {formatDate(purchase.updated_at)}
                                </Text>
                              </Space>
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

export default PurchaseTab;

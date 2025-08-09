import React, { useState, useEffect } from "react";
import {
  Button,
  Drawer,
  Typography,
  Input,
  Form,
  Space,
  Switch,
  message,
  Tabs,
  Radio,
  DatePicker,
  Tooltip,
  List,
  Checkbox,
  Avatar,
  Tag,
  Steps,
} from "antd";
import {
  InfoCircleOutlined,
  UserOutlined,
  TeamOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  UserAddOutlined,
  SearchOutlined,
  CheckCircleFilled,
  SettingOutlined,
  DatabaseOutlined,
  KeyOutlined,
  SolutionOutlined,
  MobileOutlined,
  DesktopOutlined,
  ReloadOutlined,
} from "@ant-design/icons";
import { useDispatch, useSelector } from "react-redux";
import {
  SystemResourceID,
  GranteeID,
  IRequestCreateSystemPermission,
  SystemPermissionType,
  SystemTableValueEnum,
} from "@officexapp/types";
import { GenerateID } from "@officexapp/types";
import { ReduxAppState } from "../../redux-offline/ReduxProvider";
import { createSystemPermissionAction } from "../../redux-offline/permissions/permissions.actions";
import dayjs from "dayjs";
import { shortenAddress } from "../../framework/identity/constants";
import { set } from "lodash";
import { listContactsAction } from "../../redux-offline/contacts/contacts.actions";
import { listGroupsAction } from "../../redux-offline/groups/groups.actions";

const { Text } = Typography;
const { TextArea } = Input;
const { TabPane } = Tabs;
const { RangePicker } = DatePicker;

interface SystemPermissionAddDrawerProps {
  open: boolean;
  onClose: () => void;
  onAddPermission: (permissionData: IRequestCreateSystemPermission) => void;
}

const SystemPermissionAddDrawer: React.FC<SystemPermissionAddDrawerProps> = ({
  open,
  onClose,
  onAddPermission,
}) => {
  const dispatch = useDispatch();
  const isOnline = useSelector((state: ReduxAppState) => state.offline?.online);
  const contacts = useSelector(
    (state: ReduxAppState) => state.contacts.contacts
  );
  const groups = useSelector((state: ReduxAppState) => state.groups.groups);

  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();
  const [resourceType, setResourceType] = useState<"table" | "record">("table");
  const [granteeTab, setGranteeTab] = useState<string>("contacts");
  const [targetResourceId, setTargetResourceId] = useState("");

  // Current step state
  const [currentStep, setCurrentStep] = useState(0);

  // Responsive design state
  const [isMobile, setIsMobile] = useState(false);

  // Update isMobile state on window resize
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile(); // Check on initial render
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Selected grantee state
  const [selectedGrantee, setSelectedGrantee] = useState<{
    id: string;
    type: "contact" | "group" | "userId";
    validated: boolean;
  } | null>(null);

  // Contact and group selection states
  const [contactSearchQuery, setContactSearchQuery] = useState<string>("");
  const [groupSearchQuery, setGroupSearchQuery] = useState<string>("");
  const [userIdInput, setUserIdInput] = useState("");
  const [isUserIdValid, setIsUserIdValid] = useState(false);
  const [extractedUserId, setExtractedUserId] = useState("");
  const [filteredContacts, setFilteredContacts] = useState(contacts);
  const [filteredGroups, setFilteredGroups] = useState(groups);
  const [permissionTypes, setPermissionTypes] = useState<
    SystemPermissionType[]
  >([]);

  // Form validation state
  const [formIsValid, setFormIsValid] = useState(false);

  // Step validation states
  const [stepsValidation, setStepsValidation] = useState({
    step0: false, // Who
    step1: false, // What
    step2: false, // Where
    step3: true, // Advanced (optional, so default to true)
  });

  // Handle permission type change with type parameter
  const handlePermissionTypeChange = (
    checked: boolean,
    type: SystemPermissionType
  ) => {
    let filtered = permissionTypes.filter((item) => item !== type);
    if (checked) {
      filtered.push(type);
    }
    setPermissionTypes(filtered);
    // Force update form validation after a short delay to ensure form state is updated
    setTimeout(() => {
      checkFormValidity();
    }, 0);
  };

  // Define steps content and validation requirements
  const steps = [
    {
      title: "Who",
      icon: <UserOutlined />,
      description: "Select who to grant permissions to",
      content: renderGranteeSelection,
      isValid: () => !!selectedGrantee?.id,
    },
    {
      title: "Can",
      icon: <KeyOutlined />,
      description: "Choose permission types",
      content: renderPermissionTypes,
      isValid: () => {
        return permissionTypes.length > 0;
      },
    },
    {
      title: "What",
      icon: <DatabaseOutlined />,
      description: "Select resource to access",
      content: renderResourceSelection,
      isValid: () => !!form.getFieldValue("resourceId"),
    },
    {
      title: "Advanced",
      icon: <SettingOutlined />,
      description: "Optional settings",
      content: renderAdvancedOptions,
      isValid: () => true, // Advanced options are optional
    },
  ];

  // Check if a step is valid
  const isStepValid = (stepIndex: number) => {
    return steps[stepIndex].isValid();
  };

  // Check if the whole form is valid
  const checkFormValidity = () => {
    try {
      const step0Valid = isStepValid(0);
      const step1Valid = permissionTypes.length > 0;

      setFormIsValid(step0Valid && step1Valid);
    } catch (error) {
      console.error("Form validation error:", error);
      setFormIsValid(false);
    }
  };

  // Reset form when drawer opens
  useEffect(() => {
    if (open) {
      form.resetFields();
      setResourceType("table");
      setSelectedGrantee(null);
      setGranteeTab("contacts");
      setUserIdInput("");
      setContactSearchQuery("");
      setGroupSearchQuery("");
      setIsUserIdValid(false);
      setExtractedUserId("");
      setCurrentStep(0);
      checkFormValidity();
    }
  }, [open, form]);

  // Check form validity when relevant state changes
  useEffect(() => {
    checkFormValidity();
  }, [selectedGrantee, resourceType, form]);

  // Update filtered contacts when contacts or search query changes
  useEffect(() => {
    if (!contactSearchQuery.trim()) {
      setFilteredContacts(contacts);
    } else {
      const lowerCaseQuery = contactSearchQuery.toLowerCase();
      setFilteredContacts(
        contacts.filter(
          (contact) =>
            contact.name.toLowerCase().includes(lowerCaseQuery) ||
            contact.email.toLowerCase().includes(lowerCaseQuery) ||
            contact.id.toLowerCase().includes(lowerCaseQuery)
        )
      );
    }
  }, [contacts, contactSearchQuery]);

  // Update filtered groups when groups or search query changes
  useEffect(() => {
    if (!groupSearchQuery.trim()) {
      setFilteredGroups(groups);
    } else {
      const lowerCaseQuery = groupSearchQuery.toLowerCase();
      setFilteredGroups(
        groups.filter(
          (group) =>
            group.name.toLowerCase().includes(lowerCaseQuery) ||
            group.id.toLowerCase().includes(lowerCaseQuery)
        )
      );
    }
  }, [groups, groupSearchQuery]);

  // Navigate to next step
  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  // Navigate to previous step
  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  // Navigate to a specific step when clicking on step item
  const goToStep = (stepIndex: number) => {
    // Only allow going to a step if all previous steps are valid
    const canGoToStep = Array.from({ length: stepIndex }, (_, i) => i).every(
      (i) => isStepValid(i)
    );

    if (canGoToStep || stepIndex < currentStep) {
      setCurrentStep(stepIndex);
    } else {
      message.warning("Please complete the current step first");
    }
  };

  // Handle resource type change
  const handleResourceTypeChange = (e: any) => {
    setResourceType(e.target.value);
    checkFormValidity();
  };

  // Validate and extract UserID from input
  const validateAndExtractUserId = (input: string) => {
    // Check if the input matches the format {nickname}@{userid}
    const userIdRegex = /^.+@([a-zA-Z0-9]+)$/;
    const match = input.match(userIdRegex);

    if (match && match[1]) {
      setExtractedUserId(match[1]);
      setIsUserIdValid(true);
      return match[1];
    } else if (input.trim()) {
      // If it doesn't match the format but has content, assume it's a direct userID
      setExtractedUserId(input.trim());
      setIsUserIdValid(true);
      return input.trim();
    } else {
      setExtractedUserId("");
      setIsUserIdValid(false);
      return "";
    }
  };

  // Handle grantee tab change without clearing selection
  const handleGranteeTabChange = (key: string) => {
    setGranteeTab(key);
  };

  // Handle contact selection
  const handleContactSelect = (contactId: string) => {
    setSelectedGrantee({
      id: contactId,
      type: "contact",
      validated: true,
    });
    form.setFieldsValue({ granteeId: contactId });
    checkFormValidity();
  };

  // Handle group selection
  const handleGroupSelect = (groupId: string) => {
    setSelectedGrantee({
      id: groupId,
      type: "group",
      validated: true,
    });
    form.setFieldsValue({ granteeId: groupId });
    checkFormValidity();
  };

  // Handle userID input
  const handleUserIdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setUserIdInput(value);

    const extractedId = validateAndExtractUserId(value);

    if (extractedId) {
      setSelectedGrantee({
        id: extractedId,
        type: "userId",
        validated: true,
      });
      form.setFieldsValue({ granteeId: extractedId });
    } else {
      setSelectedGrantee(null);
      form.setFieldsValue({ granteeId: undefined });
    }

    checkFormValidity();
  };

  // Get system table options
  const systemTableOptions = Object.values(SystemTableValueEnum).map(
    (value) => ({
      label: value,
      value: value,
    })
  );

  // Format placeholder text for contacts
  const getContactPlaceholderText = () => {
    return selectedGrantee?.type === "contact"
      ? "Contact selected"
      : "Search contacts";
  };

  // Format placeholder text for groups
  const getGroupPlaceholderText = () => {
    return selectedGrantee?.type === "group"
      ? "Group selected"
      : "Search groups";
  };

  // Handle form submission
  const handleAddPermission = () => {
    form
      .validateFields()
      .then((values) => {
        if (!selectedGrantee?.id) {
          message.error("Please select a grantee");
          return;
        }

        setLoading(true);

        const now = dayjs().valueOf();
        let beginDate = now;
        let expiryDate = -1; // Never expires by default

        if (values.dateRange && values.dateRange.length === 2) {
          beginDate = values.dateRange[0].valueOf();
          expiryDate = values.dateRange[1].valueOf();
        }

        // Create system permission

        const systemPermissionData: IRequestCreateSystemPermission = {
          id: GenerateID.SystemPermission(),
          resource_id: targetResourceId as unknown as SystemResourceID,
          granted_to: selectedGrantee.id,
          // @ts-ignore
          permission_types: permissionTypes,
          begin_date_ms: beginDate,
          expiry_date_ms: expiryDate,
          note: values.note || "",
          external_id: values.externalId,
          external_payload: values.externalPayload,
        };

        dispatch(createSystemPermissionAction(systemPermissionData));
        onAddPermission(systemPermissionData);

        message.success(
          isOnline
            ? "Creating system permission..."
            : "Queued system permission creation for when you're back online"
        );

        onClose();
        setLoading(false);
      })
      .catch((error) => {
        console.error("Validation failed:", error);
        setLoading(false);
      });
  };

  const isValidResourceID = (resourceId: string) => {
    return resourceId.includes("UserID_")
      ? resourceId.startsWith("UserID_")
      : resourceId.includes("_");
  };

  // Step 1: Grantee Selection (Who)
  function renderGranteeSelection() {
    return (
      <Form.Item
        label={
          <Tooltip title="User or group to grant this permission to">
            <Space>
              Granted To <InfoCircleOutlined style={{ color: "#aaa" }} />
            </Space>
          </Tooltip>
        }
        required
      >
        <Tabs activeKey={granteeTab} onChange={handleGranteeTabChange}>
          <TabPane
            tab={
              <span>
                <UserOutlined /> Contacts
              </span>
            }
            key="contacts"
          >
            <Input
              placeholder={getContactPlaceholderText()}
              prefix={<SearchOutlined />}
              value={contactSearchQuery}
              onChange={(e) => setContactSearchQuery(e.target.value)}
              style={{ marginBottom: 16 }}
              suffix={
                <ReloadOutlined
                  onClick={() => dispatch(listContactsAction({}))}
                  style={{ color: "gray" }}
                />
              }
            />

            <List
              dataSource={filteredContacts}
              renderItem={(contact) => {
                const isSelected =
                  selectedGrantee?.type === "contact" &&
                  selectedGrantee.id === contact.id;

                return (
                  <List.Item
                    key={contact.id}
                    onClick={() => handleContactSelect(contact.id)}
                    className={isSelected ? "selected-contact" : ""}
                    style={{
                      cursor: "pointer",
                      padding: "8px 16px",
                      background: isSelected ? "#f0f7ff" : "transparent",
                    }}
                  >
                    <Space
                      size="middle"
                      align="center"
                      style={{ width: "100%" }}
                    >
                      <Checkbox
                        checked={isSelected}
                        onChange={() => handleContactSelect(contact.id)}
                        onClick={(e) => e.stopPropagation()}
                      />
                      <Avatar src={contact.avatar} />
                      <div style={{ flex: 1 }}>
                        <div>{contact.name}</div>
                        <div style={{ color: "#888", fontSize: "12px" }}>
                          {contact.email}
                        </div>
                      </div>
                      <Tag>
                        {shortenAddress(contact.id.replace("UserID_", ""))}
                      </Tag>
                    </Space>
                  </List.Item>
                );
              }}
              style={{
                maxHeight: "40vh",
                overflow: "auto",
                border: "1px solid #f0f0f0",
                borderRadius: "4px",
              }}
            />
          </TabPane>
          <TabPane
            tab={
              <span>
                <TeamOutlined /> Groups
              </span>
            }
            key="groups"
          >
            <Input
              placeholder={getGroupPlaceholderText()}
              prefix={<SearchOutlined />}
              value={groupSearchQuery}
              onChange={(e) => setGroupSearchQuery(e.target.value)}
              style={{ marginBottom: 16 }}
              suffix={
                <ReloadOutlined
                  onClick={() => dispatch(listGroupsAction({}))}
                  style={{ color: "gray" }}
                />
              }
            />

            <List
              dataSource={filteredGroups}
              renderItem={(group) => {
                const isSelected =
                  selectedGrantee?.type === "group" &&
                  selectedGrantee.id === group.id;

                return (
                  <List.Item
                    key={group.id}
                    onClick={() => handleGroupSelect(group.id)}
                    className={isSelected ? "selected-group" : ""}
                    style={{
                      cursor: "pointer",
                      padding: "8px 16px",
                      background: isSelected ? "#f0f7ff" : "transparent",
                    }}
                  >
                    <Space
                      size="middle"
                      align="center"
                      style={{ width: "100%" }}
                    >
                      <Checkbox
                        checked={isSelected}
                        onChange={() => handleGroupSelect(group.id)}
                        onClick={(e) => e.stopPropagation()}
                      />
                      <Avatar src={group.avatar} />
                      <div style={{ flex: 1 }}>
                        <div>{group.name}</div>
                        <div style={{ color: "#888", fontSize: "12px" }}>
                          {group.member_previews?.length || 0} members
                        </div>
                      </div>
                      <Tag>
                        {shortenAddress(group.id.replace("GroupID_", ""))}
                      </Tag>
                    </Space>
                  </List.Item>
                );
              }}
              style={{
                maxHeight: "40vh",
                overflow: "auto",
                border: "1px solid #f0f0f0",
                borderRadius: "4px",
              }}
            />
          </TabPane>
          <TabPane
            tab={
              <span>
                <UserOutlined /> By UserID
              </span>
            }
            key="userid"
          >
            <Form.Item>
              <Input
                placeholder="Enter UserID"
                value={userIdInput}
                onChange={handleUserIdChange}
                suffix={
                  isUserIdValid ? (
                    <CheckCircleFilled style={{ color: "#52c41a" }} />
                  ) : (
                    <InfoCircleOutlined style={{ color: "#aaa" }} />
                  )
                }
              />
              {isUserIdValid && (
                <div style={{ color: "#52c41a", marginTop: 4 }}>
                  Valid User ID: {extractedUserId}
                </div>
              )}
            </Form.Item>
          </TabPane>
        </Tabs>

        {/* Hidden form field to store the grantee ID */}
        <Form.Item
          name="granteeId"
          hidden
          rules={[{ required: true, message: "Please select a grantee" }]}
        >
          <Input type="hidden" />
        </Form.Item>
      </Form.Item>
    );
  }

  // Step 2: Permission Types (What)
  function renderPermissionTypes() {
    return (
      <Form.Item
        label={
          <Tooltip title="Types of permissions to grant">
            <Space>
              Permission Types <InfoCircleOutlined style={{ color: "#aaa" }} />
            </Space>
          </Tooltip>
        }
        required
      >
        <Space direction="vertical" style={{ width: "100%" }}>
          <Form.Item
            name={["permissionTypes", SystemPermissionType.VIEW]}
            valuePropName="checked"
            noStyle
          >
            <Space style={{ display: "flex" }}>
              <Switch
                onChange={(checked) =>
                  handlePermissionTypeChange(checked, SystemPermissionType.VIEW)
                }
              />
              <span style={{ marginLeft: 8 }}>
                <EyeOutlined /> View
              </span>
              {form.getFieldValue([
                "permissionTypes",
                SystemPermissionType.VIEW,
              ]) && (
                <CheckCircleFilled
                  style={{ color: "#52c41a", marginLeft: 5 }}
                />
              )}
            </Space>
          </Form.Item>

          <Form.Item
            name={["permissionTypes", SystemPermissionType.CREATE]}
            valuePropName="checked"
            noStyle
          >
            <Space style={{ display: "flex" }}>
              <Switch
                value={permissionTypes.includes(SystemPermissionType.CREATE)}
                onChange={(checked) =>
                  handlePermissionTypeChange(
                    checked,
                    SystemPermissionType.CREATE
                  )
                }
              />
              <span style={{ marginLeft: 8 }}>
                <PlusOutlined /> Create
              </span>
              {form.getFieldValue([
                "permissionTypes",
                SystemPermissionType.CREATE,
              ]) && (
                <CheckCircleFilled
                  style={{ color: "#52c41a", marginLeft: 5 }}
                />
              )}
            </Space>
          </Form.Item>

          <Form.Item
            name={["permissionTypes", SystemPermissionType.EDIT]}
            valuePropName="checked"
            noStyle
          >
            <Space style={{ display: "flex" }}>
              <Switch
                onChange={(checked) =>
                  handlePermissionTypeChange(checked, SystemPermissionType.EDIT)
                }
                value={permissionTypes.includes(SystemPermissionType.EDIT)}
              />
              <span style={{ marginLeft: 8 }}>
                <EditOutlined /> Edit
              </span>
              {form.getFieldValue([
                "permissionTypes",
                SystemPermissionType.EDIT,
              ]) && (
                <CheckCircleFilled
                  style={{ color: "#52c41a", marginLeft: 5 }}
                />
              )}
            </Space>
          </Form.Item>

          <Form.Item
            name={["permissionTypes", SystemPermissionType.DELETE]}
            valuePropName="checked"
            noStyle
          >
            <Space style={{ display: "flex" }}>
              <Switch
                onChange={(checked) =>
                  handlePermissionTypeChange(
                    checked,
                    SystemPermissionType.DELETE
                  )
                }
                value={permissionTypes.includes(SystemPermissionType.DELETE)}
              />
              <span style={{ marginLeft: 8 }}>
                <DeleteOutlined /> Delete
              </span>
              {form.getFieldValue([
                "permissionTypes",
                SystemPermissionType.DELETE,
              ]) && (
                <CheckCircleFilled
                  style={{ color: "#52c41a", marginLeft: 5 }}
                />
              )}
            </Space>
          </Form.Item>

          <Form.Item
            name={["permissionTypes", SystemPermissionType.INVITE]}
            valuePropName="checked"
            noStyle
          >
            <Space style={{ display: "flex" }}>
              <Switch
                onChange={(checked) =>
                  handlePermissionTypeChange(
                    checked,
                    SystemPermissionType.INVITE
                  )
                }
                value={permissionTypes.includes(SystemPermissionType.INVITE)}
              />
              <span style={{ marginLeft: 8 }}>
                <UserAddOutlined /> Invite
              </span>
              {form.getFieldValue([
                "permissionTypes",
                SystemPermissionType.INVITE,
              ]) && (
                <CheckCircleFilled
                  style={{ color: "#52c41a", marginLeft: 5 }}
                />
              )}
            </Space>
          </Form.Item>
        </Space>
      </Form.Item>
    );
  }

  // Step 3: Resource Selection (Where)
  function renderResourceSelection() {
    return (
      <>
        <Form.Item label="Resource Type">
          <Radio.Group onChange={handleResourceTypeChange} value={resourceType}>
            <Radio value="table">Table Resource</Radio>
            <Radio value="record">Record Resource</Radio>
          </Radio.Group>
        </Form.Item>

        <Form.Item
          name="resourceId"
          label={
            <Tooltip
              title={
                resourceType === "table"
                  ? "System table to grant permissions for"
                  : "System record to grant permissions for"
              }
            >
              <Space>
                Resource {resourceType === "table" ? "Table" : "Record"}{" "}
                <InfoCircleOutlined style={{ color: "#aaa" }} />
              </Space>
            </Tooltip>
          }
          rules={[{ required: true, message: "Please select a resource" }]}
        >
          {resourceType === "table" ? (
            <Radio.Group
              options={systemTableOptions}
              onChange={(e) => setTargetResourceId(`TABLE_${e.target.value}`)}
              optionType="button"
              buttonStyle="solid"
            />
          ) : (
            <Input
              placeholder="Enter resource ID"
              status={isValidResourceID(targetResourceId) ? undefined : "error"}
              onChange={(e) => {
                setTargetResourceId(e.target.value);
                setStepsValidation((prev) => ({
                  ...prev,
                  step2: isValidResourceID(e.target.value),
                }));
              }}
              value={targetResourceId}
              suffix={
                <Tooltip title="Careful to only paste a valid ID. It should say UserID_... or FileID_..., no prefix or suffix">
                  <InfoCircleOutlined style={{ color: "#aaa" }} />
                </Tooltip>
              }
            />
          )}
        </Form.Item>
      </>
    );
  }

  // Step 4: Advanced Options
  function renderAdvancedOptions() {
    return (
      <div style={{ padding: "12px 0" }}>
        {/* Date Range */}
        <Form.Item
          name="dateRange"
          label={
            <Tooltip title="Set optional date range for when this permission is active">
              <Space>
                Date Range <InfoCircleOutlined style={{ color: "#aaa" }} />
              </Space>
            </Tooltip>
          }
        >
          <RangePicker
            showTime
            style={{ width: "100%" }}
            placeholder={["Begin Date", "Expiry Date"]}
            onChange={checkFormValidity}
          />
        </Form.Item>

        {/* Notes */}
        <Form.Item
          name="note"
          label={
            <Tooltip title="Optional notes about this permission">
              <Space>
                Notes <InfoCircleOutlined style={{ color: "#aaa" }} />
              </Space>
            </Tooltip>
          }
        >
          <TextArea
            placeholder="Additional information about this permission"
            rows={3}
            onChange={checkFormValidity}
          />
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
            onChange={checkFormValidity}
          />
        </Form.Item>

        <Form.Item
          name="externalPayload"
          label={
            <Tooltip title="Additional data for external systems (JSON)">
              <Space>
                External Payload{" "}
                <InfoCircleOutlined style={{ color: "#aaa" }} />
              </Space>
            </Tooltip>
          }
        >
          <TextArea
            placeholder='{"key": "value"}'
            rows={2}
            onChange={checkFormValidity}
          />
        </Form.Item>
      </div>
    );
  }

  // Get the next button text based on current step
  const getNextButtonText = () => {
    if (currentStep === steps.length - 1) {
      return "Add Permission";
    }
    return "Next";
  };

  // Get current step content
  const getCurrentStepContent = () => {
    return steps[currentStep].content();
  };

  // Handle next button click
  const handleNextButtonClick = () => {
    if (currentStep === steps.length - 1) {
      handleAddPermission();
    } else {
      nextStep();
    }
  };

  // Convert steps array to format needed by Ant Design Steps component
  const stepsItems = steps.map((step, index) => {
    // For mobile view - fourth step (Advanced) will only show icon, no text
    if (isMobile && index === 3) {
      return {
        title: " ", // Using a space instead of null to maintain proper layout
        status:
          currentStep > index
            ? "finish"
            : currentStep === index
              ? "process"
              : "wait",
        icon: step.icon,
        // @ts-ignore
        disabled: index > currentStep && !stepsValidation[`step${index - 1}`],
      };
    }

    return {
      title: step.title,
      description: isMobile ? null : step.description, // No descriptions on mobile
      status:
        currentStep > index
          ? "finish"
          : currentStep === index
            ? "process"
            : "wait",
      icon: step.icon,
      // @ts-ignore
      disabled: index > currentStep && !stepsValidation[`step${index - 1}`],
    };
  });

  return (
    <Drawer
      title="Add System Permission"
      placement="right"
      onClose={onClose}
      open={open}
      width={700}
      footer={
        <div style={{ textAlign: "right" }}>
          {currentStep > 0 && (
            <Button onClick={prevStep} style={{ marginRight: 8 }}>
              Previous
            </Button>
          )}
          <Button onClick={onClose} style={{ marginRight: 8 }}>
            Cancel
          </Button>
          <Button
            onClick={handleNextButtonClick}
            type="primary"
            loading={loading}
            disabled={
              (currentStep === steps.length - 1 && !formIsValid) ||
              !isStepValid(currentStep) ||
              loading
            }
          >
            {getNextButtonText()}
          </Button>
        </div>
      }
    >
      <Form
        form={form}
        layout="vertical"
        initialValues={{
          resourceType: "table",
          permissionTypes: {
            [SystemPermissionType.VIEW]: false,
            [SystemPermissionType.CREATE]: false,
            [SystemPermissionType.EDIT]: false,
            [SystemPermissionType.DELETE]: false,
            [SystemPermissionType.INVITE]: false,
          },
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: isMobile ? "column" : "row",
          }}
        >
          <div
            style={{
              width: isMobile ? "100%" : "200px",
              marginRight: isMobile ? 0 : "20px",
              marginBottom: isMobile ? "20px" : 0,
            }}
          >
            <Steps
              direction={isMobile ? "horizontal" : "vertical"}
              current={currentStep}
              // @ts-ignore
              items={stepsItems}
              onChange={goToStep}
              responsive={false}
              size={isMobile ? "small" : "default"}
              className={isMobile ? "mobile-steps" : ""}
            />
            {isMobile && (
              <style>{`
                :global(.mobile-steps .ant-steps-item-title) {
                  font-size: 12px !important;
                  padding-right: 5px !important;
                }
                :global(
                  .mobile-steps .ant-steps-item:last-child .ant-steps-item-title
                ) {
                  display: none !important;
                }
                :global(
                  .mobile-steps .ant-steps-item:last-child .ant-steps-icon
                ) {
                  margin-left: 0 !important;
                }
              `}</style>
            )}
          </div>
          <div style={{ flex: 1 }}>{getCurrentStepContent()}</div>
        </div>
      </Form>
    </Drawer>
  );
};

export default SystemPermissionAddDrawer;

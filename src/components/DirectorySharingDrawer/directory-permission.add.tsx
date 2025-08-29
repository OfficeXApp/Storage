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
  Tooltip,
  DatePicker,
  Radio,
  List,
  Checkbox,
  Avatar,
  Tag,
  Steps,
  Divider,
} from "antd";
import toast from "react-hot-toast";
import {
  InfoCircleOutlined,
  UserOutlined,
  TeamOutlined,
  FolderOutlined,
  FileOutlined,
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
  LinkOutlined,
  BarcodeOutlined,
  GlobalOutlined,
  UnlockOutlined,
  ReloadOutlined,
} from "@ant-design/icons";
import { useDispatch, useSelector } from "react-redux";
import {
  DirectoryResourceID,
  GranteeID,
  IRequestCreateDirectoryPermission,
  DirectoryPermissionType,
  IRequestUpdateDirectoryPermission,
  PermissionMetadataTypeEnum,
} from "@officexapp/types";
import { GenerateID } from "@officexapp/types";
import { ReduxAppState } from "../../redux-offline/ReduxProvider";
import {
  createDirectoryPermissionAction,
  updateDirectoryPermissionAction,
} from "../../redux-offline/permissions/permissions.actions";
import dayjs from "dayjs";
import { shortenAddress } from "../../framework/identity/constants";
import TagCopy from "../TagCopy";
import { areArraysEqual, wrapAuthStringOrHeader } from "../../api/helpers";
import { generateRedeemDirectoryPermitURL } from "./directory-permission.redeem";
import { useIdentitySystem } from "../../framework/identity";
import { listContactsAction } from "../../redux-offline/contacts/contacts.actions";
import { listGroupsAction } from "../../redux-offline/groups/groups.actions";
import { generateDeterministicMnemonic } from "../../api/icp";

const { Text } = Typography;
const { TextArea } = Input;
const { TabPane } = Tabs;
const { RangePicker } = DatePicker;

export interface PreExistingStateForEdit {
  id: string; // The permission ID
  resource_id: DirectoryResourceID; // The resource ID
  grantee_name: string; // The grantee's name
  granted_to: GranteeID; // The grantee's ID
  grantee_type: "contact" | "group" | "userId"; // Type of grantee
  permission_types: DirectoryPermissionType[]; // Array of permission types
  begin_date_ms: number; // Begin date timestamp
  expiry_date_ms: number; // Expiry date timestamp
  inheritable: boolean; // Whether permission is inheritable
  note: string; // Optional notes
  redeem_code?: string;
  external_id?: string; // Optional external ID
  external_payload?: string; // Optional external payload
  password?: string;
}

interface DirectoryPermissionAddDrawerProps {
  open: boolean;
  onClose: () => void;
  onSubmitCallback: () => void;
  resourceID: DirectoryResourceID;
  resourceName: string;
  preExistingStateForEdit?: PreExistingStateForEdit;
}

const DirectoryPermissionAddDrawer: React.FC<
  DirectoryPermissionAddDrawerProps
> = ({
  open,
  onClose,
  onSubmitCallback,
  resourceID,
  preExistingStateForEdit,
  resourceName,
}) => {
  const dispatch = useDispatch();
  const isOnline = useSelector((state: ReduxAppState) => state.offline?.online);
  const contacts = useSelector(
    (state: ReduxAppState) => state.contacts.contacts
  );
  const groups = useSelector((state: ReduxAppState) => state.groups.groups);
  const [isPublic, setIsPublic] = useState(false);
  const [isMagicLink, setIsMagicLink] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();
  const [directoryPermissionID, setDirectoryPermissionID] = useState("");
  const [resourceType, setResourceType] = useState<"file" | "folder">("folder");
  const [granteeTab, setGranteeTab] = useState<string>("public");
  const targetResourceId = resourceID;
  const [granteeId, setGranteeId] = useState("");
  const [inheritable, setInheritable] = useState(true);
  const [note, setNote] = useState("");
  const [externalId, setExternalId] = useState("");
  const [externalPayload, setExternalPayload] = useState("");
  const [dateRange, setDateRange] = useState<
    [dayjs.Dayjs | null, dayjs.Dayjs | null] | null
  >(null);
  const [shareableURL, setShareableURL] = useState("");
  const {
    currentOrg,
    wrapOrgCode,
    deriveProfileFromSeed,
    currentAPIKey,
    generateSignature,
  } = useIdentitySystem();

  // Current step state
  const [currentStep, setCurrentStep] = useState(
    preExistingStateForEdit ? 1 : 0
  );

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
  const [passwordForGrantee, setPasswordForGrantee] = useState("");
  const [filteredContacts, setFilteredContacts] = useState(contacts);
  const [filteredGroups, setFilteredGroups] = useState(groups);
  const [permissionTypes, setPermissionTypes] = useState<
    DirectoryPermissionType[]
  >([DirectoryPermissionType.VIEW]);

  // Form validation state
  const [formIsValid, setFormIsValid] = useState(false);

  // Step validation states
  const [stepsValidation, setStepsValidation] = useState({
    step0: false, // Who
    step1: false, // What
    step2: true, // Advanced (optional, so default to true)
  });

  // Debug form values function
  const debugFormValues = () => {
    console.log("Current form values:", form.getFieldsValue());
    console.log("Permission types:", permissionTypes);
  };

  // Handle permission type change with type parameter
  const handlePermissionTypeChange = (
    checked: boolean,
    type: DirectoryPermissionType
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

  // Add this useEffect hook to initialize edit mode
  useEffect(() => {
    if (preExistingStateForEdit && open) {
      // Set all state values directly
      setGranteeId(preExistingStateForEdit.granted_to);
      setInheritable(preExistingStateForEdit.inheritable);
      setNote(preExistingStateForEdit.note || "");
      setExternalId(preExistingStateForEdit.external_id || "");
      setExternalPayload(preExistingStateForEdit.external_payload || "");
      setPermissionTypes(preExistingStateForEdit.permission_types);
      setDirectoryPermissionID(preExistingStateForEdit.id);

      // Set selected grantee
      setSelectedGrantee({
        id: preExistingStateForEdit.granted_to,
        type: preExistingStateForEdit.grantee_type,
        validated: true,
      });

      // Set date range if provided
      if (
        preExistingStateForEdit.begin_date_ms > 0 &&
        preExistingStateForEdit.expiry_date_ms > 0
      ) {
        setDateRange([
          dayjs(preExistingStateForEdit.begin_date_ms),
          dayjs(preExistingStateForEdit.expiry_date_ms),
        ]);
      }

      // Check form validity after initialization
      setTimeout(() => {
        checkFormValidity();
      }, 0);
    }
  }, [preExistingStateForEdit, open]);

  // Define steps content and validation requirements
  const steps = [
    {
      title: <span>Who</span>,
      icon: <UserOutlined />,
      description: <span>Select who to grant permissions to</span>,
      content: renderGranteeSelection,
      isValid: () => !!selectedGrantee?.id,
    },
    {
      title: <span>Can</span>,
      icon: <KeyOutlined />,
      description: <span>Choose permission types</span>,
      content: renderPermissionTypes,
      isValid: () => {
        return permissionTypes.length > 0;
      },
    },
    {
      title: <span>Advanced</span>,
      icon: <SettingOutlined />,
      description: <span>Optional settings</span>,
      content: renderAdvancedOptions,
      isValid: () => true, // Advanced options are optional
    },
    {
      title: <span>Finish</span>,
      icon: <LinkOutlined />,
      description: <span>Share permission</span>,
      content: renderShareStep,
      isValid: () => true, // Share step is always valid
    },
  ];

  // Check if a step is valid
  const isStepValid = (stepIndex: number) => {
    if (preExistingStateForEdit && stepIndex === 0) return true;
    if (stepIndex === 0 && isMagicLink) return true;
    if (stepIndex === 0 && isPublic) return true;
    return steps[stepIndex].isValid();
  };

  // Check if the whole form is valid
  const checkFormValidity = () => {
    try {
      debugFormValues(); // For debugging

      const step0Valid = isPublic || isMagicLink || isStepValid(0);
      const step1Valid = permissionTypes.length > 0;
      const step2Valid = isStepValid(2);

      // For debugging

      setStepsValidation({
        step0: step0Valid,
        step1: step1Valid,
        step2: step2Valid,
      });

      setFormIsValid(step0Valid && step1Valid && step2Valid);
    } catch (error) {
      console.error("Form validation error:", error);
      setFormIsValid(false);
    }
  };

  // Reset form when drawer opens
  useEffect(() => {
    if (open) {
      if (!preExistingStateForEdit) {
        // Only reset if not in edit mode
        setDirectoryPermissionID("");
        setGranteeId("");
        setInheritable(true);
        setNote("");
        setExternalId("");
        setExternalPayload("");
        setDateRange(null);
        setResourceType("folder");
        setSelectedGrantee(null);
        setGranteeTab("public");
        setIsMagicLink(false);
        setIsPublic(true);
        setPasswordForGrantee("");
        setUserIdInput("");
        setContactSearchQuery("");
        setGroupSearchQuery("");
        setIsUserIdValid(false);
        setExtractedUserId("");
        setPermissionTypes([DirectoryPermissionType.VIEW]);
        setShareableURL(window.location.href);
      }
      setCurrentStep(preExistingStateForEdit ? 1 : 0);
      checkFormValidity();
    }
  }, [open, preExistingStateForEdit]);

  // Check form validity when relevant state changes
  useEffect(() => {
    checkFormValidity();
  }, [selectedGrantee, resourceType, form, permissionTypes]);

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
  // Navigate to a specific step when clicking on step item
  const goToStep = (stepIndex: number) => {
    // Disable clicking steps when on Share step
    if (currentStep === steps.length - 1) {
      return;
    }
    if (stepIndex === 3) {
      return;
    }

    // Only allow going to a step if all previous steps are valid
    const canGoToStep = Array.from({ length: stepIndex }, (_, i) => i).every(
      (i) => isStepValid(i)
    );

    if (canGoToStep || stepIndex < currentStep) {
      setCurrentStep(stepIndex);
    } else {
      message.warning(<span>Please complete the current step first</span>);
    }
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
    setIsMagicLink(false);
    setIsPublic(false);
    setPasswordForGrantee("");
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
    setIsMagicLink(false);
    setIsPublic(false);
    setPasswordForGrantee("");
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
      setIsMagicLink(false);
      setIsPublic(false);
      setPasswordForGrantee("");
    } else {
      setSelectedGrantee(null);
      form.setFieldsValue({ granteeId: undefined });
    }

    checkFormValidity();
  };

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
  const handleAddPermission = async () => {
    setLoading(true);

    const now = dayjs().valueOf();
    let beginDate = now;
    let expiryDate = -1; // Never expires by default

    if (dateRange && dateRange.length === 2 && dateRange[0] && dateRange[1]) {
      beginDate = dateRange[0].valueOf();
      expiryDate = dateRange[1].valueOf();
    }

    if (preExistingStateForEdit) {
      // We're in edit mode - only include fields that changed
      const updatePayload: IRequestUpdateDirectoryPermission = {
        id: preExistingStateForEdit.id,
      };

      // Check if permission_types changed
      const hasPermissionTypesChanged = !areArraysEqual(
        permissionTypes,
        preExistingStateForEdit.permission_types
      );

      if (hasPermissionTypesChanged) {
        updatePayload.permission_types = permissionTypes;
      }

      // Check if dates changed
      const hasBeginDateChanged =
        beginDate !== preExistingStateForEdit.begin_date_ms;
      const hasExpiryDateChanged =
        expiryDate !== preExistingStateForEdit.expiry_date_ms;

      if (hasBeginDateChanged) {
        updatePayload.begin_date_ms = beginDate;
      }

      if (hasExpiryDateChanged) {
        updatePayload.expiry_date_ms = expiryDate;
      }

      // Check if inheritable flag changed
      if (inheritable !== preExistingStateForEdit.inheritable) {
        updatePayload.inheritable = inheritable;
      }

      // Check if note changed
      if (note !== preExistingStateForEdit.note) {
        updatePayload.note = note;
      }

      // Check if external_id changed
      if (externalId !== preExistingStateForEdit.external_id) {
        updatePayload.external_id = externalId;
      }

      // Check if external_payload changed
      if (externalPayload !== preExistingStateForEdit.external_payload) {
        updatePayload.external_payload = externalPayload;
      }

      // Only dispatch if there are changes
      if (Object.keys(updatePayload).length > 1) {
        // More than just ID
        dispatch(updateDirectoryPermissionAction(updatePayload));
        onSubmitCallback();
        toast.success(
          isOnline ? (
            <span>Updating directory permission...</span>
          ) : (
            <span>
              Queued directory permission update for when you're back online
            </span>
          )
        );
        setLoading(false);
        if (isMagicLink && currentOrg) {
          const url = generateRedeemDirectoryPermitURL({
            fileURL: window.location.href,
            wrapOrgCode,
            permissionID: preExistingStateForEdit.id,
            resourceName: resourceName,
            orgName: currentOrg.nickname,
            redeemCode: preExistingStateForEdit.redeem_code || "",
            permissionTypes: preExistingStateForEdit.permission_types,
            resourceID: preExistingStateForEdit.resource_id,
            daterange: { begins_at: beginDate, expires_at: expiryDate },
          });
          setShareableURL(url);
        } else {
          setShareableURL(window.location.href);
        }
      } else {
        toast(<span>No changes detected</span>);
      }
    } else {
      // Create directory permission
      let _directoryPermissionID = GenerateID.DirectoryPermission();
      setDirectoryPermissionID(_directoryPermissionID);
      const directoryPermissionData: IRequestCreateDirectoryPermission = {
        id: _directoryPermissionID,
        resource_id: resourceID,
        permission_types: permissionTypes,
        begin_date_ms: beginDate,
        expiry_date_ms: expiryDate,
        inheritable: inheritable,
        note: note || "",
        external_id: externalId,
        external_payload: externalPayload,
      };
      if (passwordForGrantee) {
        const metadata = {
          metadata_type: PermissionMetadataTypeEnum.DIRECTORY_PASSWORD,
          content: {
            DirectoryPassword: passwordForGrantee,
          },
        };
        directoryPermissionData.metadata = metadata;
      }

      if (isMagicLink && currentOrg) {
        directoryPermissionData.granted_to = undefined;

        const auth_token = currentAPIKey?.value || (await generateSignature());
        const { url, headers } = wrapAuthStringOrHeader(
          `${currentOrg.host}/v1/drive/${currentOrg.driveID}/permissions/directory/create`,
          {
            "Content-Type": "application/json",
          },
          auth_token
        );
        const create_response = await fetch(url, {
          method: "POST",
          headers,
          body: JSON.stringify(directoryPermissionData),
        });

        const res = await create_response.json();

        if (res.ok.data.permission.redeem_code) {
          const url = generateRedeemDirectoryPermitURL({
            fileURL: window.location.href,
            wrapOrgCode,
            permissionID: _directoryPermissionID,
            resourceName: resourceName,
            orgName: currentOrg.nickname,
            permissionTypes,
            resourceID,
            redeemCode: res.ok.data.permission.redeem_code,
            daterange: { begins_at: beginDate, expires_at: expiryDate },
          });
          setShareableURL(url);
        }
      } else if (isPublic) {
        directoryPermissionData.granted_to = "PUBLIC";
        setShareableURL(window.location.href);
        dispatch(createDirectoryPermissionAction(directoryPermissionData));
      } else {
        if (!selectedGrantee?.id) {
          toast.error(<span>Please select a grantee</span>);
          return;
        }
        directoryPermissionData.granted_to = selectedGrantee.id;
        setShareableURL(window.location.href);
        dispatch(createDirectoryPermissionAction(directoryPermissionData));
      }

      onSubmitCallback();

      toast.success(
        isOnline ? (
          <span>Creating directory permission...</span>
        ) : (
          <span>
            Queued directory permission creation for when you're back online
          </span>
        )
      );

      setLoading(false);
    }
  };

  // Step 1: Grantee Selection (Who)
  function renderGranteeSelection() {
    const isEditMode = !!preExistingStateForEdit;
    return (
      <Form.Item
        label={
          <Tooltip
            title={<span>User or group to grant this permission to</span>}
          >
            <Space>
              Granted To <InfoCircleOutlined style={{ color: "#aaa" }} />
            </Space>
          </Tooltip>
        }
        required
      >
        {isEditMode ? (
          // Read-only view for edit mode
          <div style={{ padding: "8px 0" }}>
            <Text strong>{preExistingStateForEdit.grantee_name}</Text>
            <TagCopy
              id={preExistingStateForEdit.granted_to}
              style={{ marginLeft: 8 }}
            />
            {preExistingStateForEdit.password && (
              <Input.Password
                readOnly
                value={preExistingStateForEdit.password}
                style={{ marginTop: 16, padding: 8 }}
                prefix={
                  <Button
                    onClick={() => {
                      navigator.clipboard.writeText(
                        preExistingStateForEdit.password || ""
                      );
                      toast.success(<span>Copied Password</span>);
                    }}
                    size="small"
                    style={{ marginRight: 8 }}
                  >
                    Copy Password
                  </Button>
                }
              />
            )}
          </div>
        ) : (
          <Tabs
            activeKey={granteeTab}
            onChange={handleGranteeTabChange}
            style={{ maxWidth: "400px" }}
          >
            <TabPane
              tab={
                <span>
                  <GlobalOutlined /> Public
                </span>
              }
              key="public"
            >
              <Space>
                <Switch
                  checked={isPublic}
                  onChange={(checked) => {
                    setIsPublic(checked);
                    if (checked) {
                      setSelectedGrantee(null);
                      setIsMagicLink(false);
                      setPasswordForGrantee("");
                    }
                    checkFormValidity();
                  }}
                />
                <span>Public to Everyone</span>
              </Space>
              <p style={{ color: "rgba(0,0,0,0.4)" }}>
                Open to entire internet. Be careful setting to public.
              </p>
            </TabPane>
            <TabPane
              tab={
                <span>
                  <LinkOutlined /> Magic Link
                </span>
              }
              key="magiclink"
            >
              <Space>
                <Switch
                  checked={isMagicLink}
                  onChange={(checked) => {
                    setIsMagicLink(checked);
                    if (checked) {
                      setSelectedGrantee(null);
                      setIsPublic(false);
                      setPasswordForGrantee("");
                    }
                    checkFormValidity();
                  }}
                />
                <span>Use Magic Link</span>
              </Space>
              <p style={{ color: "rgba(0,0,0,0.4)" }}>
                Simply share this one-time magic link with anyone. Recipient
                will attach their profile to it. Convinient but less secure.
              </p>
            </TabPane>
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
                suffix={
                  <ReloadOutlined
                    onClick={() => dispatch(listContactsAction({}))}
                    style={{ color: "gray" }}
                  />
                }
                value={contactSearchQuery}
                onChange={(e) => setContactSearchQuery(e.target.value)}
                style={{ marginBottom: 16 }}
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
                  <BarcodeOutlined /> Address
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
            <TabPane
              tab={
                <span>
                  <UnlockOutlined /> Password
                </span>
              }
              key="password"
            >
              <Form.Item>
                <Input.Password
                  placeholder="Password"
                  value={passwordForGrantee}
                  onChange={async (e) => {
                    const password = e.target.value.replace(" ", "");
                    setPasswordForGrantee(password);
                    const deterministic_seed_phrase =
                      generateDeterministicMnemonic(
                        `${password}-${resourceID}`
                      );
                    const newProfile = await deriveProfileFromSeed(
                      deterministic_seed_phrase
                    );

                    setIsMagicLink(false);
                    setIsPublic(false);
                    setSelectedGrantee({
                      id: newProfile.userID,
                      type: "userId",
                      validated: true,
                    });
                  }}
                />
              </Form.Item>
              <span style={{ color: "rgba(0,0,0,0.4)", marginTop: 0 }}>
                Anyone with the password can share it with anyone.
              </span>
            </TabPane>
          </Tabs>
        )}

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

  // Step 2: Permission Types (Can)
  function renderPermissionTypes() {
    return (
      <Form.Item
        label={
          <Tooltip title={<span>Types of permissions to grant</span>}>
            <Space>
              Permission Types <InfoCircleOutlined style={{ color: "#aaa" }} />
            </Space>
          </Tooltip>
        }
        required
      >
        <Space direction="vertical" style={{ width: "100%" }}>
          <Space style={{ display: "flex" }}>
            <Switch
              onChange={(checked) =>
                handlePermissionTypeChange(
                  checked,
                  DirectoryPermissionType.VIEW
                )
              }
              checked={permissionTypes.includes(DirectoryPermissionType.VIEW)}
            />
            <span style={{ marginLeft: 8 }}>
              <EyeOutlined /> View
            </span>
          </Space>

          <Space style={{ display: "flex" }}>
            <Switch
              onChange={(checked) => {
                if (checked) {
                  setPermissionTypes([
                    DirectoryPermissionType.VIEW,
                    DirectoryPermissionType.EDIT,
                    DirectoryPermissionType.DELETE,
                    DirectoryPermissionType.UPLOAD,
                    DirectoryPermissionType.INVITE,
                  ]);
                } else {
                  setPermissionTypes((prev) => {
                    return prev.filter(
                      (type) => type === DirectoryPermissionType.VIEW
                    );
                  });
                }
                // Force update form validation after a short delay to ensure form state is updated
                setTimeout(() => {
                  checkFormValidity();
                }, 0);
              }}
              checked={
                permissionTypes.includes(DirectoryPermissionType.VIEW) &&
                permissionTypes.includes(DirectoryPermissionType.EDIT) &&
                permissionTypes.includes(DirectoryPermissionType.DELETE) &&
                permissionTypes.includes(DirectoryPermissionType.UPLOAD) &&
                permissionTypes.includes(DirectoryPermissionType.INVITE)
              }
            />
            <span style={{ marginLeft: 8 }}>
              <EditOutlined /> Manage
            </span>
          </Space>

          <Divider />

          <details
            open={
              (permissionTypes.includes(DirectoryPermissionType.EDIT) ||
                permissionTypes.includes(DirectoryPermissionType.DELETE) ||
                permissionTypes.includes(DirectoryPermissionType.UPLOAD) ||
                permissionTypes.includes(DirectoryPermissionType.INVITE)) &&
              !(
                permissionTypes.includes(DirectoryPermissionType.EDIT) &&
                permissionTypes.includes(DirectoryPermissionType.DELETE) &&
                permissionTypes.includes(DirectoryPermissionType.UPLOAD) &&
                permissionTypes.includes(DirectoryPermissionType.INVITE)
              )
            }
          >
            <summary
              style={{
                cursor: "pointer",
                color: "#595959",
                fontSize: "14px",
                marginBottom: "4px",
                userSelect: "none",
              }}
            >
              Advanced
            </summary>
            <div style={{ height: "8px" }}></div>
            {resourceID.startsWith("FolderID_") && (
              <Space style={{ display: "flex" }}>
                <Switch
                  onChange={(checked) =>
                    handlePermissionTypeChange(
                      checked,
                      DirectoryPermissionType.UPLOAD
                    )
                  }
                  checked={permissionTypes.includes(
                    DirectoryPermissionType.UPLOAD
                  )}
                />
                <span style={{ marginLeft: 8 }}>
                  <PlusOutlined /> Upload
                </span>
              </Space>
            )}
            <div style={{ height: "8px" }}></div>
            <Space style={{ display: "flex" }}>
              <Switch
                onChange={(checked) =>
                  handlePermissionTypeChange(
                    checked,
                    DirectoryPermissionType.EDIT
                  )
                }
                checked={permissionTypes.includes(DirectoryPermissionType.EDIT)}
              />
              <span style={{ marginLeft: 8 }}>
                <EditOutlined /> Edit
              </span>
            </Space>
            <div style={{ height: "8px" }}></div>
            <Space style={{ display: "flex" }}>
              <Switch
                onChange={(checked) =>
                  handlePermissionTypeChange(
                    checked,
                    DirectoryPermissionType.DELETE
                  )
                }
                checked={permissionTypes.includes(
                  DirectoryPermissionType.DELETE
                )}
              />
              <span style={{ marginLeft: 8 }}>
                <DeleteOutlined /> Delete
              </span>
            </Space>

            <div style={{ height: "8px" }}></div>
            <Space style={{ display: "flex" }}>
              <Switch
                onChange={(checked) =>
                  handlePermissionTypeChange(
                    checked,
                    DirectoryPermissionType.INVITE
                  )
                }
                checked={permissionTypes.includes(
                  DirectoryPermissionType.INVITE
                )}
              />
              <span style={{ marginLeft: 8 }}>
                <UserAddOutlined /> Invite
              </span>
            </Space>
          </details>

          {/* <Space style={{ display: "flex" }}>
            <Switch
              onChange={(checked) =>
                handlePermissionTypeChange(
                  checked,
                  DirectoryPermissionType.INVITE
                )
              }
              checked={permissionTypes.includes(DirectoryPermissionType.INVITE)}
            />
            <span style={{ marginLeft: 8 }}>
              <UserAddOutlined /> Invite
            </span>
          </Space> */}

          {/* <Space style={{ display: "flex" }}>
            <Switch
              onChange={(checked) =>
                handlePermissionTypeChange(
                  checked,
                  DirectoryPermissionType.MANAGE
                )
              }
              checked={permissionTypes.includes(DirectoryPermissionType.MANAGE)}
            />
            <span style={{ marginLeft: 8 }}>
              <SettingOutlined /> Manage
            </span>
          </Space> */}
        </Space>
      </Form.Item>
    );
  }

  // Step 3: Advanced Options
  function renderAdvancedOptions() {
    return (
      <div style={{ padding: "12px 0" }}>
        {/* Inheritable option */}
        {resourceID.startsWith("FolderID_") && (
          <div style={{ marginBottom: 24 }}>
            <label>
              <Tooltip
                title={
                  <span>
                    Whether this permission applies to subfolders and files
                  </span>
                }
              >
                <Space>
                  Inheritable <InfoCircleOutlined style={{ color: "#aaa" }} />
                </Space>
              </Tooltip>
            </label>
            <div style={{ marginTop: 8 }}>
              <Switch
                checked={inheritable}
                onChange={(checked) => {
                  setInheritable(checked);
                  checkFormValidity();
                }}
              />
            </div>
          </div>
        )}

        {/* Date Range */}
        <div style={{ marginBottom: 24 }}>
          <label>
            <Tooltip
              title={
                <span>
                  Set optional date range for when this permission is active
                </span>
              }
            >
              <Space>
                Date Range <InfoCircleOutlined style={{ color: "#aaa" }} />
              </Space>
            </Tooltip>
          </label>
          <div style={{ marginTop: 8 }}>
            <RangePicker
              showTime
              style={{ width: "100%" }}
              placeholder={["Begin Date", "Expiry Date"]}
              value={dateRange}
              onChange={(dates) => {
                setDateRange(dates);
                checkFormValidity();
              }}
            />
          </div>
        </div>

        {/* Notes */}
        <div style={{ marginBottom: 24 }}>
          <label>
            <Tooltip title={<span>Optional notes about this permission</span>}>
              <Space>
                Notes <InfoCircleOutlined style={{ color: "#aaa" }} />
              </Space>
            </Tooltip>
          </label>
          <div style={{ marginTop: 8 }}>
            <TextArea
              placeholder="Additional information about this permission"
              rows={3}
              value={note}
              onChange={(e) => {
                setNote(e.target.value);
                checkFormValidity();
              }}
            />
          </div>
        </div>
      </div>
    );
  }

  function renderShareStep() {
    return (
      <div style={{ padding: "12px 0" }}>
        <div style={{ marginBottom: 24 }}>
          <label>
            <Tooltip title={<span>Copy this link to share</span>}>
              <Space>
                Share This Link <InfoCircleOutlined style={{ color: "#aaa" }} />
              </Space>
            </Tooltip>
          </label>
          <div style={{ marginTop: 8 }}>
            <Input
              value={shareableURL}
              readOnly
              suffix={
                <Button
                  type="primary"
                  onClick={() => {
                    navigator.clipboard.writeText(shareableURL);
                    toast.success(<span>Link copied to clipboard</span>);
                  }}
                >
                  Copy
                </Button>
              }
            />
          </div>
          <p style={{ color: "rgba(0,0,0,0.3)" }}>
            Simply share this one-time magic link with anyone. Recipient will
            attach their profile to it. Convinient but be careful sharing.
            <br />
          </p>
        </div>
      </div>
    );
  }

  // Get the next button text based on current step
  const getNextButtonText = () => {
    if (currentStep === steps.length - 1) {
      return "Close";
    } else if (currentStep === steps.length - 2) {
      return preExistingStateForEdit ? "Update Permission" : "Add Permission";
    }
    return "Next";
  };

  // Get current step content
  const getCurrentStepContent = () => {
    return steps[currentStep].content();
  };

  // Handle next button click
  const handleNextButtonClick = async () => {
    if (currentStep === steps.length - 1) {
      // At Share step, close the drawer and call callback
      onClose();
      onSubmitCallback();
    } else if (currentStep === steps.length - 2) {
      await handleAddPermission();
      nextStep();
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
      title={
        preExistingStateForEdit ? (
          <span>
            {`Edit Directory Permission for ${preExistingStateForEdit.password ? "Password" : preExistingStateForEdit.grantee_name}`}{" "}
            <TagCopy
              id={preExistingStateForEdit.granted_to}
              style={{ marginLeft: 8 }}
            />
          </span>
        ) : (
          "Add Directory Permission"
        )
      }
      placement="right"
      onClose={onClose}
      open={open}
      width={700}
      footer={
        <div style={{ textAlign: "right" }}>
          {currentStep > 0 && currentStep < steps.length - 1 && (
            <Button onClick={onClose} style={{ marginRight: 8 }} size="large">
              Cancel
            </Button>
          )}
          {currentStep > 0 && currentStep < steps.length - 1 && (
            <Button onClick={prevStep} style={{ marginRight: 8 }} size="large">
              Previous
            </Button>
          )}
          <Button
            onClick={handleNextButtonClick}
            type={
              currentStep > 0 && currentStep === steps.length - 1
                ? "default"
                : "primary"
            }
            loading={loading}
            disabled={
              (currentStep === steps.length - 2 && !formIsValid) ||
              !isStepValid(currentStep) ||
              loading
            }
            size="large"
          >
            {getNextButtonText()}
          </Button>
          {currentStep > 0 && currentStep === steps.length - 1 ? (
            <Button
              type="primary"
              onClick={() => {
                navigator.clipboard.writeText(shareableURL);
                toast.success(<span>Link copied to clipboard</span>);
              }}
              style={{ marginLeft: 8 }}
              size="large"
            >
              Copy Magic Link
            </Button>
          ) : null}
        </div>
      }
    >
      <Form
        form={form}
        layout="vertical"
        initialValues={{
          inheritable: true,
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

export default DirectoryPermissionAddDrawer;

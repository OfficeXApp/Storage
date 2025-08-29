import React, { useEffect, useState } from "react";
import {
  Modal,
  Switch,
  DatePicker,
  Input,
  Button,
  Form,
  Typography,
  message,
} from "antd";
import toast from "react-hot-toast";
import {
  UserOutlined,
  KeyOutlined,
  LinkOutlined,
  CalendarOutlined,
  InfoCircleOutlined,
  CopyOutlined,
} from "@ant-design/icons";
import { Tooltip } from "antd";
import { ContactFEO } from "../../redux-offline/contacts/contacts.reducer";
import {
  ApiKey,
  IRequestCreateApiKey,
  OrgOwnedContactApiKeyLogin_BTOA,
  SelfCustodySuperswapLogin_BTOA,
  SovereignStrangerLogin_BTOA,
  SystemPermissionType,
} from "@officexapp/types";
import { useMultiUploader } from "../../framework/uploader/hook";
import { useIdentitySystem } from "../../framework/identity";
import TagCopy from "../../components/TagCopy";
import { urlSafeBase64Encode, wrapAuthStringOrHeader } from "../../api/helpers";
import { generateAutoLoginBTOA } from "../AutoLoginPage";

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;

interface InviteContactModalProps {
  contact: ContactFEO;
  isVisible: boolean;
  onClose: () => void;
  organizationId: string;
}

const InviteContactModal: React.FC<InviteContactModalProps> = ({
  contact,
  isVisible,
  onClose,
  organizationId,
}) => {
  const isOwnedUser = !Boolean(
    // @ts-ignore
    contact.is_placeholder || contact.from_placeholder_user_id
  );
  const [initialCheckLoading, setInitialCheckLoading] = useState<boolean>(true);
  const [enableAutoLogin, setEnableAutoLogin] = useState<boolean>(false);
  const [hasApiCreationAuth, setHasApiCreationAuth] = useState<boolean>(false);
  const [redirectUrl, setRedirectUrl] = useState<string>("");
  const [keyName, setKeyName] = useState<string>("");
  const [apiKeyDates, setApiKeyDates] = useState<any[] | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isAdvancedOpen, setIsAdvancedOpen] = useState<boolean>(false);
  const [generatedLink, setGeneratedLink] = useState<string>("");
  const {
    currentProfile,
    currentOrg,
    currentAPIKey,
    generateSignature,
    wrapOrgCode,
  } = useIdentitySystem();

  // Check permissions on component mount
  useEffect(() => {
    if (isVisible && currentProfile?.userID) {
      checkApiKeyPermissions();
    }
  }, [isVisible, currentProfile]);

  // Function to check API key permissions
  const checkApiKeyPermissions = async () => {
    try {
      const auth_token = currentAPIKey?.value || (await generateSignature());

      // Prepare the request payload
      const permissionCheckPayload = {
        resource_id: "TABLE_API_KEYS",
        grantee_id: currentProfile?.userID,
      };

      // Make the API call to check permissions
      const { url, headers } = wrapAuthStringOrHeader(
        `${currentOrg?.host}/v1/drive/${currentOrg?.driveID}/permissions/system/check`,
        {
          "Content-Type": "application/json",
        },
        auth_token
      );

      const response = await fetch(url, {
        method: "POST",
        headers,
        body: JSON.stringify(permissionCheckPayload),
      });

      if (!response.ok) {
        setInitialCheckLoading(false);
      }

      const data = await response.json();

      if (
        data &&
        data.ok &&
        data.ok.data &&
        data.ok.data.permissions &&
        data.ok.data.permissions.includes(SystemPermissionType.CREATE)
      ) {
        setEnableAutoLogin(true);
        setHasApiCreationAuth(true);
      }
      setInitialCheckLoading(false);
    } catch (error) {
      console.error("Error checking API key permissions:", error);
      setInitialCheckLoading(false);
    }
  };

  // Prepare API key request payload
  const createApiKeyRequest = (): IRequestCreateApiKey => {
    return {
      name: keyName || `Auto-login key for ${contact.name}`,
      user_id: contact.id,
      begins_at:
        apiKeyDates && apiKeyDates[0] ? apiKeyDates[0].valueOf() : Date.now(),
      expires_at: apiKeyDates && apiKeyDates[1] ? apiKeyDates[1].valueOf() : -1, // -1 means never expires
      external_id: `auto-login-${organizationId}-${contact.id}`,
      external_payload: JSON.stringify({
        created_for: "organization-invite",
        organization_id: organizationId,
      }),
    };
  };

  // Real API call for creating an API key
  const createApiKey = async (): Promise<ApiKey> => {
    setIsLoading(true);
    try {
      const request = createApiKeyRequest();
      const auth_token = currentAPIKey?.value || (await generateSignature());
      // Make the actual API call to create an API key
      const { url, headers } = wrapAuthStringOrHeader(
        `${currentOrg?.host}/v1/drive/${currentOrg?.driveID}/api_keys/create`,
        {
          "Content-Type": "application/json",
        },
        auth_token
      );
      const response = await fetch(url, {
        method: "POST",
        headers,
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        throw new Error(`API request failed with status: ${response.status}`);
      }

      const data = await response.json();

      if (data && data.ok && data.ok.data) {
        const apiKey = data.ok.data as ApiKey;
        return apiKey;
      } else {
        throw new Error("Failed to create API key. Invalid response format.");
      }
    } catch (error) {
      console.error("Error creating API key:", error);
      toast.error(<span>Failed to create API key. Please try again.</span>);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Create the invite payload
  const createInvitePayload = async () => {
    try {
      if (enableAutoLogin) {
        const apiKey = await createApiKey();

        if (isOwnedUser) {
          // For owned users, create OrgOwnedContactApiKeyLogin_BTOA
          const autoLoginPayload: OrgOwnedContactApiKeyLogin_BTOA = {
            type: "OrgOwnedContactApiKeyLogin_BTOA",
            org_name: currentOrg?.nickname || "",
            profile_name: contact.name,
            profile_id: contact.id,
            api_key: apiKey.value,
            redirect_url: redirectUrl || undefined,
            daterange: {
              begins_at: apiKey.begins_at,
              expires_at: apiKey.expires_at,
            },
          };
          return autoLoginPayload;
        } else if (contact.redeem_code) {
          // For not owned users, create SelfCustodySuperswapLogin_BTOA
          const redeemPayload: SelfCustodySuperswapLogin_BTOA = {
            type: "SelfCustodySuperswapLogin_BTOA",
            current_user_id: contact.id,
            new_user_id: contact.id, // This would be adjusted in a real scenario
            redeem_code: contact.redeem_code || "",
            redirect_url: redirectUrl || undefined,
            org_name: currentOrg?.nickname || "",
            profile_name: contact.name,
          };
          return redeemPayload;
        } else {
          // Simple invite without auto-login
          const simplePayload: SovereignStrangerLogin_BTOA = {
            type: "SovereignStrangerLogin_BTOA",
            profile_id: contact.id,
            org_name: currentOrg?.nickname || "",
            profile_name: contact.name,
            api_key: apiKey.value,
            redirect_url: redirectUrl || undefined,
          };
          return simplePayload;
        }
      } else {
        // Simple invite without auto-login
        const simplePayload: SovereignStrangerLogin_BTOA = {
          type: "SovereignStrangerLogin_BTOA",
          profile_id: contact.id,
          org_name: currentOrg?.nickname || "",
          profile_name: contact.name,
          redirect_url: redirectUrl || undefined,
        };

        return simplePayload;
      }
    } catch (error) {
      console.error("Error creating invite payload:", error);
      toast.error(<span>Failed to create invite. Please try again.</span>);
      throw error;
    }
  };

  const handleGenerateLink = async () => {
    try {
      if (contact.last_online_ms > 0) {
        if (!currentOrg) return;
        const apiKey = await createApiKey();
        const link = generateAutoLoginBTOA({
          org_name: currentOrg.nickname,
          org_id: currentOrg.driveID,
          org_host: currentOrg.host,
          profile_id: contact.id,
          profile_name: contact.name,
          profile_api_key: apiKey.value,
        });
        setGeneratedLink(link);
      } else {
        setIsLoading(true);
        const payload = await createInvitePayload();

        // Create a properly encoded URL with the payload
        const baseUrl = `${window.location.origin}${wrapOrgCode(`/resources/contacts/redeem`)}`;
        const encodedPayload = urlSafeBase64Encode(JSON.stringify(payload));
        const link = `${baseUrl}?redeem=${encodedPayload}`;

        setGeneratedLink(link);
      }
      toast.success(
        <span>Invitation link for {contact.name} generated successfully!</span>
      );
    } catch (err) {
      console.error("Error generating invitation link:", err);
      toast.error(
        <span>Failed to generate invitation link. Please try again.</span>
      );
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = () => {
    if (generatedLink) {
      navigator.clipboard
        .writeText(generatedLink)
        .then(() => toast.success(<span>Link copied to clipboard!</span>))
        .catch((err) => {
          console.error("Failed to copy link:", err);
          toast.error(<span>Failed to copy link. Please try again.</span>);
        });
    }
  };

  return (
    <Modal
      title={
        <span style={{ fontSize: "1.3rem" }}>
          Invite {contact.name} {` `}
          <TagCopy id={contact?.id || ""} />
        </span>
      }
      open={isVisible}
      onCancel={onClose}
      width={600}
      footer={null}
    >
      <div style={{ marginTop: 0 }}>
        <Form layout="vertical">
          <span>
            To join your organization {currentOrg?.nickname}
            {` `}
            <TagCopy id={currentOrg?.driveID || ""} />
          </span>

          {/* Added Input with Generate Link button */}
          <Form.Item style={{ marginTop: 20 }}>
            <Input
              value={generatedLink}
              readOnly
              disabled={!generatedLink}
              placeholder="Click 'Generate Link' to create an invitation link"
              suffix={
                generatedLink ? (
                  <Button
                    icon={<CopyOutlined />}
                    type="primary"
                    onClick={copyToClipboard}
                  >
                    Copy Link
                  </Button>
                ) : (
                  <Button
                    type="primary"
                    disabled={initialCheckLoading}
                    loading={isLoading}
                    onClick={handleGenerateLink}
                  >
                    Generate Link
                  </Button>
                )
              }
            />
            <span
              style={{
                marginTop: 16,
                fontSize: "0.8rem",
                color: "rgba(0,0,0,0.3)",
              }}
            >
              {isOwnedUser ? (
                <span>Your organization owns this profile</span>
              ) : (
                <span>Contact will link their own identity</span>
              )}
            </span>
          </Form.Item>

          {/* Advanced Section with details/summary toggle */}
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
              Advanced Options
            </summary>

            <div style={{ padding: "12px 0" }}>
              <Form.Item
                label={
                  <span>
                    Login with API Key{" "}
                    <Tooltip
                      title={
                        <span>
                          This will generate a new API key for the user.
                          Disabled if you don't have authorization to create API
                          keys on behalf of other users. Speak with your org
                          admin.
                        </span>
                      }
                    >
                      <InfoCircleOutlined style={{ color: "#aaa" }} />
                    </Tooltip>
                  </span>
                }
              >
                <Switch
                  checked={enableAutoLogin}
                  onChange={setEnableAutoLogin}
                  checkedChildren="Auto-Login"
                  unCheckedChildren="Manual Login"
                  disabled={!hasApiCreationAuth}
                />
              </Form.Item>
              {enableAutoLogin && (
                <Form.Item
                  label={
                    <span>
                      API Key Validity Period{" "}
                      <Tooltip
                        title={
                          <span>
                            If not specified, the API key will never expire
                          </span>
                        }
                      >
                        <InfoCircleOutlined style={{ color: "#aaa" }} />
                      </Tooltip>
                    </span>
                  }
                >
                  <RangePicker
                    showTime
                    format="YYYY-MM-DD HH:mm:ss"
                    placeholder={["Start Time", "End Time"]}
                    onChange={(dates) => setApiKeyDates(dates)}
                    style={{ width: "100%" }}
                  />
                </Form.Item>
              )}
              <Form.Item
                label={
                  <span>
                    Redirect URL{" "}
                    <Tooltip
                      title={
                        <span>
                          Where to redirect the user after successful login
                        </span>
                      }
                    >
                      <InfoCircleOutlined style={{ color: "#aaa" }} />
                    </Tooltip>
                  </span>
                }
              >
                <Input
                  prefix={<LinkOutlined />}
                  placeholder="https://app.example.com/welcome"
                  value={redirectUrl}
                  onChange={(e) => setRedirectUrl(e.target.value)}
                  variant="borderless"
                  style={{ backgroundColor: "#fafafa" }}
                />
              </Form.Item>
              <Form.Item
                label={
                  <span>
                    API Key Nickname{" "}
                    <Tooltip title={<span>A nickname for the API key</span>}>
                      <InfoCircleOutlined style={{ color: "#aaa" }} />
                    </Tooltip>
                  </span>
                }
              >
                <Input
                  prefix={<LinkOutlined />}
                  placeholder="API Key Nickname"
                  value={keyName}
                  onChange={(e) => setKeyName(e.target.value)}
                  variant="borderless"
                  style={{ backgroundColor: "#fafafa" }}
                />
              </Form.Item>
            </div>
          </details>
        </Form>
      </div>
    </Modal>
  );
};

export default InviteContactModal;

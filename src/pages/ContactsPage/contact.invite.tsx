import React, { useState } from "react";
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
import { ApiKey, IRequestCreateApiKey } from "@officexapp/types";
import { useMultiUploader } from "../../framework/uploader/hook";
import { useIdentitySystem } from "../../framework/identity";
import TagCopy from "../../components/TagCopy";
import {
  AutoLoginContactBtoaBody,
  RedeemContactBtoaBody,
  SimpleOrgContactInviteBody,
} from "./contact.redeem";
import { urlSafeBase64Encode } from "../../api/helpers";

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
  const isOwnedUser = !Boolean(contact.from_placeholder_user_id);
  const [enableAutoLogin, setEnableAutoLogin] = useState<boolean>(true);
  const [redirectUrl, setRedirectUrl] = useState<string>("");
  const [apiKeyDates, setApiKeyDates] = useState<[Date, Date] | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isAdvancedOpen, setIsAdvancedOpen] = useState<boolean>(false);
  const [generatedLink, setGeneratedLink] = useState<string>("");
  const { currentOrg, currentAPIKey, generateSignature, wrapOrgCode } =
    useIdentitySystem();

  // Prepare API key request payload
  const createApiKeyRequest = (): IRequestCreateApiKey => {
    return {
      name: `Auto-login key for ${contact.name}`,
      user_id: contact.id,
      begins_at: apiKeyDates?.[0]?.getTime() ?? Date.now(),
      expires_at: apiKeyDates?.[1]?.getTime() ?? -1, // -1 means never expires
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
      console.log("Creating API key with request:", request);

      // Make the actual API call to create an API key
      const response = await fetch(
        `${currentOrg?.endpoint}/v1/${currentOrg?.driveID}/api_keys/create`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${currentAPIKey?.value || generateSignature()}`,
          },
          body: JSON.stringify(request),
        }
      );

      if (!response.ok) {
        throw new Error(`API request failed with status: ${response.status}`);
      }

      const data = await response.json();

      if (data && data.ok && data.ok.data) {
        const apiKey = data.ok.data as ApiKey;
        console.log("API Key created successfully:", apiKey);
        return apiKey;
      } else {
        throw new Error("Failed to create API key. Invalid response format.");
      }
    } catch (error) {
      console.error("Error creating API key:", error);
      message.error("Failed to create API key. Please try again.");
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
          // For owned users, create AutoLoginContactBtoaBody
          const autoLoginPayload: AutoLoginContactBtoaBody = {
            type: "AutoLoginContactBtoaBody",
            org_name: currentOrg?.nickname || "",
            profile_name: contact.name,
            current_user_id: contact.id,
            api_key: apiKey.value,
            redirect_url: redirectUrl || undefined,
          };
          console.log("Created AutoLoginContactBtoaBody:", autoLoginPayload);
          return autoLoginPayload;
        } else {
          // For not owned users, create RedeemContactBtoaBody
          const redeemPayload: RedeemContactBtoaBody = {
            type: "RedeemContactBtoaBody",
            current_user_id: contact.id,
            new_user_id: contact.id, // This would be adjusted in a real scenario
            redeem_code: contact.redeem_code || "",
            api_key: apiKey.value,
            redirect_url: redirectUrl || undefined,
            org_name: currentOrg?.nickname || "",
            profile_name: contact.name,
          };
          console.log("Created RedeemContactBtoaBody:", redeemPayload);
          return redeemPayload;
        }
      } else {
        // Simple invite without auto-login
        const simplePayload: SimpleOrgContactInviteBody = {
          type: "SimpleOrgContactInviteBody",
          current_user_id: contact.id,
          org_name: currentOrg?.nickname || "",
          profile_name: contact.name,
        };
        console.log("Created simple invite payload:", simplePayload);
        return simplePayload;
      }
    } catch (error) {
      console.error("Error creating invite payload:", error);
      message.error("Failed to create invite. Please try again.");
      throw error;
    }
  };

  const handleGenerateLink = async () => {
    try {
      setIsLoading(true);
      const payload = await createInvitePayload();

      // Create a properly encoded URL with the payload
      const baseUrl = `${window.location.origin}${wrapOrgCode(`/resources/contacts/redeem`)}`;
      const encodedPayload = urlSafeBase64Encode(JSON.stringify(payload));
      const link = `${baseUrl}?redeem=${encodedPayload}`;

      setGeneratedLink(link);
      message.success(
        `Invitation link for ${contact.name} generated successfully!`
      );
    } catch (err) {
      console.error("Error generating invitation link:", err);
      message.error("Failed to generate invitation link. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = () => {
    if (generatedLink) {
      navigator.clipboard
        .writeText(generatedLink)
        .then(() => message.success("Link copied to clipboard!"))
        .catch((err) => {
          console.error("Failed to copy link:", err);
          message.error("Failed to copy link. Please try again.");
        });
    }
  };

  console.log(`target invite isOwnedUser=${isOwnedUser}`, contact);

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
          <br />
          <Switch
            checked={enableAutoLogin}
            onChange={setEnableAutoLogin}
            checkedChildren="Auto-Login"
            unCheckedChildren="Manual Login"
            style={{ marginTop: 32 }}
          />

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
                    Redirect URL{" "}
                    <Tooltip title="Where to redirect the user after successful login">
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

              {enableAutoLogin && (
                <Form.Item
                  label={
                    <span>
                      API Key Validity Period{" "}
                      <Tooltip title="If not specified, the API key will never expire">
                        <InfoCircleOutlined style={{ color: "#aaa" }} />
                      </Tooltip>
                    </span>
                  }
                >
                  <RangePicker
                    showTime
                    format="YYYY-MM-DD HH:mm:ss"
                    placeholder={["Start Time", "End Time"]}
                    onChange={(dates) =>
                      setApiKeyDates(dates as [Date, Date] | null)
                    }
                    style={{ width: "100%" }}
                  />
                </Form.Item>
              )}
            </div>
          </details>

          {/* Added Input with Generate Link button */}
          <Form.Item label="Invitation Link" style={{ marginTop: 20 }}>
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
              {isOwnedUser
                ? `Your organization owns this profile`
                : `Contact will link their own identity`}
            </span>
          </Form.Item>
        </Form>
      </div>
    </Modal>
  );
};

export default InviteContactModal;

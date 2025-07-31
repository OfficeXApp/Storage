import React, { useEffect, useState } from "react";
import {
  Button,
  Layout,
  message,
  Select,
  Space,
  Spin,
  Tag,
  Tooltip,
  Typography,
} from "antd";
import {
  GroupInviteID,
  GroupRole,
  RedeemGroupInvite_BTOA,
} from "@officexapp/types";
import {
  urlSafeBase64Decode,
  urlSafeBase64Encode,
  wrapAuthStringOrHeader,
} from "../../api/helpers";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { IndexDB_Profile, useIdentitySystem } from "../../framework/identity";
import { sleep } from "../../api/helpers";
import {
  CheckCircleOutlined,
  QuestionCircleOutlined,
  UserOutlined,
} from "@ant-design/icons";
import TagCopy from "../../components/TagCopy";
import { shortenAddress } from "../../framework/identity/constants";

const { Content } = Layout;
const { Title, Paragraph, Text } = Typography;

const RedeemGroupInvite = () => {
  const params = useParams();
  const orgcode = params.orgcode;
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [redeemData, setRedeemData] = useState<RedeemGroupInvite_BTOA | null>(
    null
  );
  const [selectedProfile, setSelectedProfile] =
    useState<IndexDB_Profile | null>(null);

  const {
    currentOrg,
    currentProfile,
    currentAPIKey,
    wrapOrgCode,
    generateSignature,
    listOfProfiles,
    updateOrganization,
  } = useIdentitySystem();

  console.log(`redeemData`, redeemData);
  console.log(`orgcode`, orgcode);
  console.log(`currentOrg`, currentOrg);
  console.log(`currentProfile`, currentProfile);

  useEffect(() => {
    const getRedeemParam = async () => {
      setLoading(true);
      const searchParams = new URLSearchParams(location.search);
      const redeemParam = searchParams.get("redeem");

      if (redeemParam) {
        try {
          const decodedData = JSON.parse(urlSafeBase64Decode(redeemParam));
          console.log(`decodedData`, decodedData);
          setRedeemData(decodedData);
        } catch (error) {
          console.error("Error decoding redeem parameter:", error);
          message.error("Invalid group invite link");
        }
      } else {
        message.error("No group invite data found");
      }
      setLoading(false);
    };

    getRedeemParam();
  }, [location]);

  // Set the current profile as the selected profile when component loads
  useEffect(() => {
    if (currentProfile && !selectedProfile) {
      setSelectedProfile({
        userID: currentProfile.userID,
        nickname: currentProfile.nickname || "",
        icpPublicAddress: currentProfile.icpAccount?.principal.toString() || "",
        evmPublicAddress: currentProfile.evmPublicKey || "",
        seedPhrase: "",
        note: "",
        avatar: "",
      });
    }
  }, [currentProfile, selectedProfile]);

  const handleRedeem = async () => {
    if (!redeemData || !currentOrg || !selectedProfile) {
      message.error("Missing required data for redemption");
      return;
    }

    setIsProcessing(true);
    try {
      await processGroupInviteRedeem(redeemData);
    } catch (error) {
      console.error("Error processing group invite:", error);
      message.error("Failed to process group invite");
    } finally {
      setIsProcessing(false);
    }
  };

  const processGroupInviteRedeem = async (data: RedeemGroupInvite_BTOA) => {
    console.log("Processing redeem group invite", data);

    if (!currentOrg || !selectedProfile) {
      console.error("No current organization or selected profile found");
      return;
    }

    const auth_token = currentAPIKey?.value || (await generateSignature());

    // Prepare redemption payload
    const redeem_payload = {
      invite_id: data.invite_id,
      user_id: selectedProfile.userID,
      redeem_code: data.redeem_code || "",
      note: `Redeemed by "${selectedProfile.nickname || "Anon"}" on ${new Date().toLocaleString()}`,
    };

    // Call the API to redeem the group invite
    const { url, headers } = wrapAuthStringOrHeader(
      `${currentOrg.endpoint}/v1/drive/${currentOrg.driveID}/groups/invites/redeem`,
      {
        "Content-Type": "application/json",
      },
      auth_token
    );
    const redeem_response = await fetch(url, {
      method: "POST",
      headers,
      body: JSON.stringify(redeem_payload),
    });

    const redeem_data = await redeem_response.json();

    console.log(`>> res`, redeem_data);

    if (!redeem_data.invite) {
      console.error("Redeem group invite error");
      throw new Error(`Failed to redeem group invite`);
      return;
    }

    // Verify the redemption was successful
    if (redeem_data.invite) {
      // Redirect to the specified URL or groups page
      console.log(`redeem_data`, redeem_data);
      message.success(`Successfully joined the group! Redirecting...`);
      if (redeemData && redeemData.org_name) {
        updateOrganization({
          ...currentOrg,
          nickname: redeemData.org_name,
        });
      }
      await sleep(1000);
      if (data.redirect_url) {
        window.location.href = data.redirect_url;
      } else {
        navigate(wrapOrgCode(`/groups`));
      }
      await sleep(1000);
      window.location.reload();
    } else {
      throw new Error("Failed to redeem group invite: Invalid response format");
    }
  };

  // Check if invite is within valid time range
  const isInTimeRange = () => {
    if (!redeemData?.daterange) return true;

    const now = Date.now();
    const isAfterStart = now >= redeemData.daterange.begins_at;
    const isBeforeExpiry =
      redeemData.daterange.expires_at === -1 ||
      now <= redeemData.daterange.expires_at;

    return isAfterStart && isBeforeExpiry;
  };

  return (
    <Layout style={{ minHeight: "100vh", backgroundColor: "white" }}>
      <Content
        style={{
          padding: "48px 24px",
          maxWidth: "800px",
          margin: "0 auto",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "flex-start",
        }}
      >
        {loading ? (
          <div style={{ textAlign: "center", padding: "50px 0" }}>
            <Spin size="large" />
            <Paragraph style={{ marginTop: 16 }}>
              Processing group invite...
            </Paragraph>
          </div>
        ) : (
          <>
            <div style={{ textAlign: "center", marginBottom: 48 }}>
              <Title level={1} style={{ marginBottom: 24 }}>
                Accept Group Invite
              </Title>
              <Paragraph>
                You've been invited to join a group. Please review the details
                before continuing.
              </Paragraph>
            </div>

            {redeemData && (
              <div
                style={{
                  width: "100%",
                  maxWidth: "500px",
                  background: "#f8f8f8",
                  padding: "24px",
                  borderRadius: "8px",
                  boxShadow: "0 4px 12px rgba(0, 0, 0, 0.05)",
                }}
              >
                <div style={{ marginBottom: 24 }}>
                  <Text type="secondary">
                    Join Group in {` `}
                    {redeemData.org_name || "Organization"}
                    {currentOrg && (
                      <TagCopy
                        id={currentOrg.driveID || ""}
                        style={{ fontSize: "0.7rem", marginLeft: 8 }}
                      />
                    )}
                  </Text>

                  <Paragraph
                    style={{
                      fontSize: "18px",
                      fontWeight: 500,
                      marginBottom: 16,
                      marginTop: 8,
                    }}
                  >
                    {redeemData.group_name || "Unnamed Group"}
                  </Paragraph>
                </div>

                <div style={{ marginBottom: 24 }}>
                  <Text type="secondary">Role</Text>
                  <div style={{ marginTop: 8 }}>
                    <Tag
                      color="blue"
                      icon={<CheckCircleOutlined />}
                      style={{ marginBottom: "4px" }}
                    >
                      {redeemData.role || "Member"}
                    </Tag>
                    <Tooltip title="This determines what actions you can perform within this group.">
                      <QuestionCircleOutlined
                        style={{ marginLeft: 8, color: "#1890ff" }}
                      />
                    </Tooltip>
                  </div>
                </div>

                <div style={{ marginBottom: 24 }}>
                  <Text type="secondary">User Profile</Text>
                  <Select
                    showSearch
                    placeholder="Select Profile"
                    style={{ width: "100%", marginTop: "8px" }}
                    value={selectedProfile?.userID || currentProfile?.userID}
                    onChange={(value) => {
                      const profile = listOfProfiles.find(
                        (p) => p.userID === value
                      );
                      if (profile) {
                        setSelectedProfile(profile);
                      }
                    }}
                    filterOption={(input, option) => {
                      const profile = listOfProfiles.find(
                        (p) => p.userID === option?.value
                      );
                      if (profile) {
                        const nickname = (
                          profile.nickname || "Anon"
                        ).toLowerCase();
                        const icpAddress =
                          profile.icpPublicAddress.toLowerCase();
                        const inputLower = input.toLowerCase();
                        return (
                          nickname.includes(inputLower) ||
                          icpAddress.includes(inputLower)
                        );
                      }
                      return false;
                    }}
                    optionRender={(option) => {
                      const profile = listOfProfiles.find(
                        (p) => p.userID === option.value
                      );
                      if (!profile) return option.label;

                      return (
                        <Space
                          style={{
                            width: "100%",
                            justifyContent: "space-between",
                          }}
                        >
                          <Space>
                            <UserOutlined />
                            <span>{profile.nickname || "Anon"}</span>
                          </Space>
                          <Tag>{shortenAddress(profile.icpPublicAddress)}</Tag>
                        </Space>
                      );
                    }}
                  >
                    {listOfProfiles.map((profile) => (
                      <Select.Option
                        key={profile.userID}
                        value={profile.userID}
                      >
                        {profile.nickname || "Anon"}{" "}
                        <Tag>{shortenAddress(profile.icpPublicAddress)}</Tag>
                      </Select.Option>
                    ))}
                  </Select>
                </div>

                <Button
                  type="primary"
                  size="large"
                  loading={isProcessing}
                  onClick={handleRedeem}
                  disabled={!selectedProfile || !currentOrg || !isInTimeRange()}
                  block
                >
                  {!selectedProfile || !currentOrg
                    ? "Please select a profile first"
                    : redeemData?.daterange &&
                        Date.now() < redeemData.daterange.begins_at
                      ? `Available from ${formatDate(redeemData.daterange.begins_at)}`
                      : redeemData?.daterange &&
                          redeemData.daterange.expires_at !== -1 &&
                          Date.now() > redeemData.daterange.expires_at
                        ? `Expired on ${formatDate(redeemData.daterange.expires_at)}`
                        : "Accept and Join Group"}
                </Button>

                {redeemData?.daterange && (
                  <div
                    style={{
                      marginTop: 8,
                      fontSize: "0.8rem",
                      color: "rgba(0,0,0,0.3)",
                      textAlign: "center",
                      width: "100%",
                      fontStyle: "italic",
                    }}
                  >
                    {Date.now() < redeemData.daterange.begins_at
                      ? `Available from ${formatDate(redeemData.daterange.begins_at)} to ${formatDate(redeemData.daterange.expires_at)}`
                      : redeemData.daterange.expires_at !== -1
                        ? `Valid until ${formatDate(redeemData.daterange.expires_at)}`
                        : `No expiration date`}
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </Content>
    </Layout>
  );
};

export default RedeemGroupInvite;

const formatDate = (timestamp: number) => {
  if (timestamp === -1) return "no expiry date";
  return new Date(timestamp).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

// Export the helper function to generate redemption URLs
export const generateRedeemGroupInviteURL = (
  {
    invite_id,
    redeem_code,
    redirect_url,
    group_name,
    org_name,
    role,
    daterange,
  }: RedeemGroupInvite_BTOA,
  wrapOrgCode: (route: string) => string
) => {
  const payload: RedeemGroupInvite_BTOA = {
    invite_id,
    redeem_code,
    redirect_url,
    group_name,
    org_name,
    role,
    daterange,
  };

  const finalUrl = `${window.location.origin}${wrapOrgCode("/redeem/group-invite")}?redeem=${urlSafeBase64Encode(JSON.stringify(payload))}`;
  return finalUrl;
};

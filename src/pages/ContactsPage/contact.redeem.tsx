import React, { useEffect, useState } from "react";
import {
  Button,
  Form,
  Input,
  Layout,
  message,
  Select,
  Space,
  Spin,
  Tag,
  Typography,
} from "antd";
import { IRequestRedeemContact, UserID } from "@officexapp/types";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { IndexDB_Profile, useIdentitySystem } from "../../framework/identity";
import { urlSafeBase64Decode } from "../../api/helpers";
import {
  CheckCircleOutlined,
  EditOutlined,
  TeamOutlined,
  UserOutlined,
} from "@ant-design/icons";
import TagCopy from "../../components/TagCopy";
import { shortenAddress } from "../../framework/identity/constants";

const { Content, Footer } = Layout;
const { Title, Paragraph, Text } = Typography;

export interface RedeemContactBtoaBody extends IRequestRedeemContact {
  type: "RedeemContactBtoaBody";
  api_key?: string;
  org_name: string;
  profile_name: string;
  redirect_url?: string;
}

export interface AutoLoginContactBtoaBody {
  type: "AutoLoginContactBtoaBody";
  api_key?: string;
  org_name: string;
  profile_name: string;
  current_user_id: UserID;
  redirect_url?: string;
}

export interface SimpleOrgContactInviteBody {
  type: "SimpleOrgContactInviteBody";
  org_name: string;
  profile_name: string;
  redirect_url?: string;
  api_key?: string;
  current_user_id: UserID;
}

const ContactRedeem = () => {
  const params = useParams();
  const orgcode = params.orgcode;
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [redeemData, setRedeemData] = useState<
    | RedeemContactBtoaBody
    | AutoLoginContactBtoaBody
    | SimpleOrgContactInviteBody
    | null
  >(null);
  const [selectedProfile, setSelectedProfile] =
    useState<IndexDB_Profile | null>(null);
  const { listOfProfiles } = useIdentitySystem();

  console.log(`redeemData`, redeemData);

  // State for editable fields and edit modes
  const [profileName, setProfileName] = useState("");
  const [orgName, setOrgName] = useState("");
  const [editingProfile, setEditingProfile] = useState(false);
  const [editingOrg, setEditingOrg] = useState(false);

  const {
    currentOrg,
    currentProfile,
    createOrganization,
    switchOrganization,
    createProfile,
    switchProfile,
    createApiKey,
  } = useIdentitySystem();

  useEffect(() => {
    if (currentProfile && !selectedProfile) {
      setSelectedProfile({
        userID: currentProfile.userID,
        nickname: currentProfile.nickname,
        icpPublicAddress: currentProfile.icpAccount?.principal.toString() || "",
        evmPublicAddress: currentProfile.evmPublicKey || "",
        seedPhrase: "",
        note: "",
        avatar: "",
      });
      if (currentProfile.nickname) {
        setProfileName(currentProfile.nickname);
      }
    }
  }, [currentProfile]);

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
          setProfileName(decodedData.profile_name || "");
          setOrgName(decodedData.org_name || "");
        } catch (error) {
          console.error("Error decoding redeem parameter:", error);
          message.error("Invalid invitation link");
        }
      } else {
        message.error("No invitation data found");
      }
      setLoading(false);
    };

    getRedeemParam();
  }, [location]);

  const handleContinue = async () => {
    if (!redeemData) return;

    setIsProcessing(true);
    try {
      if (redeemData.type === "RedeemContactBtoaBody") {
        await processRedeemContact(redeemData);
      } else if (redeemData.type === "AutoLoginContactBtoaBody") {
        await processAutoLoginContact(redeemData);
      } else if (redeemData.type === "SimpleOrgContactInviteBody") {
        await processSimpleInvite(redeemData);
      }

      message.success("Successfully joined organization!");

      if (redeemData.redirect_url) {
        window.location.href = redeemData.redirect_url;
      } else {
        navigate(orgcode ? `/${orgcode}/dashboard` : "/dashboard");
      }
    } catch (error) {
      console.error("Error processing invitation:", error);
      message.error("Failed to process invitation");
    } finally {
      setIsProcessing(false);
    }
  };

  const processRedeemContact = async (data: RedeemContactBtoaBody) => {
    console.log("Processing redeem contact", data);
    if (data.api_key) {
      console.log("Using API key for authentication");
    }

    // Use the selected profile if available
    if (selectedProfile) {
      console.log(
        "Using selected profile:",
        selectedProfile.nickname,
        selectedProfile.userID
      );
      // Here you would add your logic to use the selected profile
      // For example, you might want to switch to this profile
      try {
        await switchProfile(selectedProfile);
      } catch (error) {
        console.error("Error switching to profile:", error);
        throw error;
      }
    } else {
      console.log("No profile selected, using default values");
    }
  };

  const processAutoLoginContact = async (data: AutoLoginContactBtoaBody) => {
    console.log("Processing auto login contact", data);
  };

  const processSimpleInvite = async (data: SimpleOrgContactInviteBody) => {
    console.log("Processing simple invite", data);
  };

  const getInvitationType = () => {
    if (!redeemData) return "Unknown";

    switch (redeemData.type) {
      case "RedeemContactBtoaBody":
        return "Self-Custody Profile";
      case "AutoLoginContactBtoaBody":
        return "Organization-Owned Profile";
      case "SimpleOrgContactInviteBody":
        return "Accept with Existing Profile";
      default:
        return "Unknown";
    }
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
              Processing invitation...
            </Paragraph>
          </div>
        ) : (
          <>
            <div style={{ textAlign: "center", marginBottom: 48 }}>
              <Title level={1} style={{ marginBottom: 24 }}>
                Join Organization
              </Title>
              <Paragraph>
                You've been invited to join an organization. Please review the
                details before continuing.
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
                  <Text type="secondary">Invitation Type</Text>
                  <Paragraph style={{ fontSize: "16px", marginBottom: 0 }}>
                    {getInvitationType()}
                  </Paragraph>
                </div>

                <div style={{ marginBottom: 24 }}>
                  <Text type="secondary">Organization</Text>
                  {editingOrg ? (
                    <Input
                      value={orgName || redeemData.org_name}
                      onChange={(e) => setOrgName(e.target.value)}
                      onBlur={() => setEditingOrg(false)}
                      onPressEnter={() => setEditingOrg(false)}
                      autoFocus
                      suffix={
                        <EditOutlined
                          style={{ color: "#1890ff", cursor: "pointer" }}
                        />
                      }
                    />
                  ) : (
                    <Paragraph
                      style={{
                        fontSize: "18px",
                        fontWeight: 500,
                        marginBottom: 0,
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                      }}
                    >
                      {orgName || redeemData.org_name || "Unnamed Organization"}
                      <TagCopy id={currentOrg?.driveID || ""} />
                      <EditOutlined
                        style={{
                          color: "#1890ff",
                          cursor: "pointer",
                          fontSize: "14px",
                        }}
                        onClick={() => setEditingOrg(true)}
                      />
                    </Paragraph>
                  )}
                </div>

                <div style={{ marginBottom: 24 }}>
                  <Text type="secondary">Profile</Text>
                  {redeemData.type === "RedeemContactBtoaBody" ? (
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
                          setProfileName(profile.nickname || "Unnamed Profile");
                        }
                      }}
                      filterOption={(input, option) => {
                        const profile = listOfProfiles.find(
                          (p) => p.userID === option?.value
                        );
                        if (profile) {
                          const nickname = (
                            profile.nickname || "Anonymous"
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
                              <span>{profile.nickname || "Anonymous"}</span>
                            </Space>
                            <Tag>
                              {shortenAddress(profile.icpPublicAddress)}
                            </Tag>
                          </Space>
                        );
                      }}
                    >
                      {listOfProfiles.map((profile) => (
                        <Select.Option
                          key={profile.userID}
                          value={profile.userID}
                        >
                          {profile.nickname || "Anonymous"}{" "}
                          <Tag>{shortenAddress(profile.icpPublicAddress)}</Tag>
                        </Select.Option>
                      ))}
                    </Select>
                  ) : // Original code for other types
                  editingProfile ? (
                    <Input
                      value={profileName || redeemData.profile_name}
                      onChange={(e) => setProfileName(e.target.value)}
                      onBlur={() => setEditingProfile(false)}
                      onPressEnter={() => setEditingProfile(false)}
                      autoFocus
                      suffix={
                        <EditOutlined
                          style={{ color: "#1890ff", cursor: "pointer" }}
                        />
                      }
                    />
                  ) : (
                    <Paragraph
                      style={{
                        fontSize: "18px",
                        fontWeight: 500,
                        marginBottom: 0,
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                      }}
                    >
                      {profileName ||
                        redeemData.profile_name ||
                        "Unnamed Profile"}
                      <TagCopy id={redeemData.current_user_id || ""} />
                      <EditOutlined
                        style={{
                          color: "#1890ff",
                          cursor: "pointer",
                          fontSize: "14px",
                        }}
                        onClick={() => setEditingProfile(true)}
                      />
                    </Paragraph>
                  )}
                </div>

                <Button
                  type="primary"
                  size="large"
                  loading={isProcessing}
                  onClick={handleContinue}
                  disabled={
                    redeemData.type === "SimpleOrgContactInviteBody" &&
                    redeemData.current_user_id !== currentProfile?.userID
                  }
                  block
                >
                  {redeemData.type === "SimpleOrgContactInviteBody" &&
                  redeemData.current_user_id !== currentProfile?.userID
                    ? `Switch to User ${shortenAddress(redeemData.current_user_id.replace("UserID_", ""))} to Join`
                    : `Join Organization`}
                </Button>
              </div>
            )}
          </>
        )}
      </Content>
    </Layout>
  );
};

export default ContactRedeem;

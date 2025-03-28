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
  Tooltip,
  Typography,
} from "antd";
import {
  GenerateID,
  IRequestRedeemContact,
  IResponseRedeemContact,
  IResponseWhoAmI,
  UserID,
} from "@officexapp/types";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { IndexDB_Profile, useIdentitySystem } from "../../framework/identity";
import { urlSafeBase64Decode } from "../../api/helpers";
import {
  CheckCircleOutlined,
  EditOutlined,
  QuestionCircleFilled,
  QuestionCircleOutlined,
  TeamOutlined,
  UserOutlined,
} from "@ant-design/icons";
import TagCopy from "../../components/TagCopy";
import { shortenAddress } from "../../framework/identity/constants";

const { Content, Footer } = Layout;
const { Title, Paragraph, Text } = Typography;

export interface SelfCustodySuperswapLogin_BTOA extends IRequestRedeemContact {
  type: "SelfCustodySuperswapLogin_BTOA";
  org_name: string;
  profile_name: string;
  redirect_url?: string;
}

export interface OrgOwnedContactApiKeyLogin_BTOA {
  type: "OrgOwnedContactApiKeyLogin_BTOA";
  api_key: string;
  org_name: string;
  profile_name: string;
  profile_id: UserID;
  redirect_url?: string;
  daterange: { begins_at: number; expires_at: number };
}

export interface SovereignStrangerLogin_BTOA {
  type: "SovereignStrangerLogin_BTOA";
  org_name: string;
  profile_name: string;
  profile_id: UserID;
  redirect_url?: string;
  api_key?: string;
}

const formatDate = (timestamp: number) => {
  if (timestamp === -1) return "no expiry date";
  return new Date(timestamp).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

const ContactRedeem = () => {
  const params = useParams();
  const orgcode = params.orgcode;
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [redeemData, setRedeemData] = useState<
    | SelfCustodySuperswapLogin_BTOA
    | OrgOwnedContactApiKeyLogin_BTOA
    | SovereignStrangerLogin_BTOA
    | null
  >(null);
  const [selectedProfile, setSelectedProfile] =
    useState<IndexDB_Profile | null>(null);
  const { listOfProfiles } = useIdentitySystem();

  // State for editable fields and edit modes
  const [profileName, setProfileName] = useState("");
  const [orgName, setOrgName] = useState("");
  const [editingProfile, setEditingProfile] = useState(false);
  const [editingOrg, setEditingOrg] = useState(false);

  const {
    currentOrg,
    currentProfile,
    currentAPIKey,
    createOrganization,
    switchOrganization,
    createProfile,
    switchProfile,
    createApiKey,
    wrapOrgCode,
    generateSignature,
  } = useIdentitySystem();

  console.log(`redeemData`, redeemData);
  console.log(`orgcode`, orgcode);
  console.log(`currentOrg`, currentOrg);

  useEffect(() => {
    if (redeemData && currentProfile && !selectedProfile) {
      const autoMatchedProfile = listOfProfiles.find(
        (p) =>
          p.userID ===
          (redeemData as SelfCustodySuperswapLogin_BTOA).current_user_id
      );
      if (autoMatchedProfile) {
        setSelectedProfile({
          userID: autoMatchedProfile.userID,
          nickname: autoMatchedProfile.nickname,
          icpPublicAddress: autoMatchedProfile.icpPublicAddress,
          evmPublicAddress: autoMatchedProfile.evmPublicAddress,
          seedPhrase: autoMatchedProfile.seedPhrase,
          note: autoMatchedProfile.note,
          avatar: autoMatchedProfile.avatar,
        });
        if (autoMatchedProfile.nickname) {
          setProfileName(autoMatchedProfile.nickname);
        }
      } else {
        setSelectedProfile({
          userID: currentProfile.userID,
          nickname: currentProfile.nickname,
          icpPublicAddress:
            currentProfile.icpAccount?.principal.toString() || "",
          evmPublicAddress: currentProfile.evmPublicKey || "",
          seedPhrase: "",
          note: "",
          avatar: "",
        });
        if (currentProfile.nickname) {
          setProfileName(currentProfile.nickname);
        }
      }
    }
  }, [currentProfile, redeemData, listOfProfiles]);

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
      if (redeemData.type === "SelfCustodySuperswapLogin_BTOA") {
        await processSelfCustodySuperswapLogin(redeemData);
      } else if (redeemData.type === "OrgOwnedContactApiKeyLogin_BTOA") {
        await processOrgOwnedContactApiKeyLogin(redeemData);
      } else if (redeemData.type === "SovereignStrangerLogin_BTOA") {
        await processSovereignStrangerLogin(redeemData);
      }

      message.success("Successfully joined organization!");
    } catch (error) {
      console.error("Error processing invitation:", error);
      message.error("Failed to process invitation");
    } finally {
      setIsProcessing(false);
    }
  };

  const processSelfCustodySuperswapLogin = async (
    data: SelfCustodySuperswapLogin_BTOA
  ) => {
    console.log("Processing redeem contact", data);

    // Use the selected profile if available
    if (selectedProfile && currentOrg) {
      console.log(
        "Using selected profile:",
        selectedProfile.nickname,
        selectedProfile.userID
      );
      const superswap_payload: IRequestRedeemContact = {
        current_user_id: data.current_user_id,
        new_user_id: selectedProfile.userID,
        redeem_code: data.redeem_code,
      };
      const auth_token = currentAPIKey?.value || (await generateSignature());
      const redeem_response = await fetch(
        `${currentOrg?.endpoint}/v1/${currentOrg?.driveID}/contacts/redeem`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${auth_token}`,
          },
          body: JSON.stringify(superswap_payload),
        }
      );
      console.log(`redeem_response`, redeem_response);

      const redeem_data: IResponseRedeemContact = await redeem_response.json();

      const check = await fetch(
        `${currentOrg.endpoint}/v1/${currentOrg.driveID}/organization/whoami`,
        {
          headers: {
            Authorization: `Bearer ${redeem_data.ok.data.api_key}`,
          },
        }
      );
      const checkData: IResponseWhoAmI = (await check.json()).ok.data;

      console.log("checkData", checkData);

      if (
        checkData.userID !== selectedProfile.userID ||
        checkData.driveID !== currentOrg.driveID
      ) {
        throw new Error("Invalid userid or driveID");
        return;
      }

      const apiKey = {
        apiKeyID: GenerateID.ApiKey(),
        userID: selectedProfile.userID,
        driveID: currentOrg?.driveID || "",
        note: `API Key for ${orgName}`,
        value: redeem_data.ok.data.api_key,
        endpoint: currentOrg?.endpoint || "",
      };
      await createApiKey(apiKey);

      const org = {
        driveID: currentOrg?.driveID || "",
        nickname: orgName,
        icpPublicAddress: currentOrg?.icpPublicAddress || "",
        endpoint: currentOrg?.endpoint || "",
        note: `Organization owned by ${orgName}`,
        defaultProfile: selectedProfile.userID,
      };
      await createOrganization(org);
      await switchOrganization(org);
      const profile: IndexDB_Profile = {
        userID: selectedProfile.userID,
        nickname: selectedProfile.nickname,
        icpPublicAddress: selectedProfile.userID.replace("UserID_", ""),
        evmPublicAddress: selectedProfile.evmPublicAddress,
        seedPhrase: selectedProfile.seedPhrase,
        note: `Self-custody profile for ${data.org_name}`,
        avatar: selectedProfile.avatar,
      };
      await createProfile(profile);
      await switchProfile(profile);
      message.success("Successfully joined organization!");
      if (data.redirect_url) {
        window.location.href = data.redirect_url;
      } else {
        navigate(wrapOrgCode(`/drive`));
      }
    } else {
      console.log("No profile selected, using default values");
    }
  };

  const processOrgOwnedContactApiKeyLogin = async (
    data: OrgOwnedContactApiKeyLogin_BTOA
  ) => {
    if (!currentOrg) {
      console.error("No current organization found");
      return;
    }
    console.log("Processing auto login contact", data);

    const check = await fetch(
      `${currentOrg.endpoint}/v1/${currentOrg.driveID}/organization/whoami`,
      {
        headers: {
          Authorization: `Bearer ${data.api_key}`,
        },
      }
    );
    const checkData: IResponseWhoAmI = (await check.json()).ok.data;

    console.log("checkData", checkData);

    if (
      checkData.userID !== data.profile_id ||
      checkData.driveID !== currentOrg.driveID
    ) {
      throw new Error("Invalid userid or driveID");
      return;
    }
    const profile: IndexDB_Profile = {
      userID: data.profile_id,
      nickname: profileName,
      icpPublicAddress: data.profile_id.replace("UserID_", ""),
      evmPublicAddress: "",
      seedPhrase: "",
      note: `Organization owned profile for ${orgName}`,
      avatar: "",
    };
    await createProfile(profile);
    const org = {
      driveID: currentOrg?.driveID || "",
      nickname: orgName,
      icpPublicAddress: currentOrg?.icpPublicAddress || "",
      endpoint: currentOrg?.endpoint || "",
      note: `Organization owned by ${orgName}`,
      defaultProfile: data.profile_id,
    };
    await createOrganization(org);
    const apiKey = {
      apiKeyID: GenerateID.ApiKey(),
      userID: data.profile_id,
      driveID: currentOrg?.driveID || "",
      note: `API Key for ${orgName}`,
      value: data.api_key,
      endpoint: currentOrg?.endpoint || "",
    };
    await createApiKey(apiKey);
    await switchOrganization(org);
    await switchProfile(profile);
    message.success("Successfully joined organization!");
    console.log(`wrapOrgCode(/drive)`, wrapOrgCode(`/drive`));
    if (data.redirect_url) {
      window.location.href = data.redirect_url;
    } else {
      navigate(wrapOrgCode(`/drive`));
    }
  };

  const processSovereignStrangerLogin = async (
    data: SovereignStrangerLogin_BTOA
  ) => {
    console.log("Processing simple invite", data);
    if (!currentOrg || currentProfile?.userID !== data.profile_id) {
      console.error("No current organization found or invalid profile");
      return;
    }
    const auth_token = data.api_key || (await generateSignature());
    const check = await fetch(
      `${currentOrg.endpoint}/v1/${currentOrg.driveID}/organization/whoami`,
      {
        headers: {
          Authorization: `Bearer ${auth_token}`,
        },
      }
    );
    const checkData: IResponseWhoAmI = (await check.json()).ok.data;

    console.log("checkData", checkData);

    if (
      checkData.userID !== data.profile_id ||
      checkData.driveID !== currentOrg.driveID
    ) {
      throw new Error("Invalid userid or driveID");
      return;
    }
    const profile: IndexDB_Profile = {
      userID: data.profile_id,
      nickname: profileName,
      icpPublicAddress: data.profile_id.replace("UserID_", ""),
      evmPublicAddress: "",
      seedPhrase: "",
      note: `Organization owned profile for ${orgName}`,
      avatar: "",
    };
    await createProfile(profile);
    const org = {
      driveID: currentOrg?.driveID || "",
      nickname: orgName,
      icpPublicAddress: currentOrg?.icpPublicAddress || "",
      endpoint: currentOrg?.endpoint || "",
      note: `Organization owned by ${orgName}`,
      defaultProfile: data.profile_id,
    };
    await createOrganization(org);
    if (data.api_key) {
      const apiKey = {
        apiKeyID: GenerateID.ApiKey(),
        userID: data.profile_id,
        driveID: currentOrg?.driveID || "",
        note: `API Key for ${orgName}`,
        value: data.api_key,
        endpoint: currentOrg?.endpoint || "",
      };
      await createApiKey(apiKey);
    }
    await switchOrganization(org);
    await switchProfile(profile);
    message.success("Successfully joined organization!");
    if (data.redirect_url) {
      window.location.href = data.redirect_url;
    } else {
      navigate(wrapOrgCode(`/drive`));
    }
  };

  const getInvitationType = () => {
    if (!redeemData) return "Unknown";

    switch (redeemData.type) {
      case "SelfCustodySuperswapLogin_BTOA":
        return (
          <span>
            Self-Custody Profile{" "}
            <Tooltip title="You own this profile and its keys are stored on your device.">
              <QuestionCircleOutlined />
            </Tooltip>
          </span>
        );
      case "OrgOwnedContactApiKeyLogin_BTOA":
        return (
          <span>
            Assigned Profile{" "}
            <Tooltip title="This profile is owned by the organization and you are being granted access.">
              <QuestionCircleOutlined />
            </Tooltip>
          </span>
        );
      case "SovereignStrangerLogin_BTOA":
        return (
          <span>
            Invitee{" "}
            <Tooltip title="You are being invited to join the organization with your existing profile.">
              <QuestionCircleOutlined />
            </Tooltip>
          </span>
        );
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
                  <Text type="secondary">{getInvitationType()}</Text>
                  {redeemData.type === "SelfCustodySuperswapLogin_BTOA" ? (
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
                      <TagCopy id={redeemData.profile_id || ""} />
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
                    (redeemData.type === "SovereignStrangerLogin_BTOA" &&
                      redeemData.profile_id !== currentProfile?.userID) ||
                    (redeemData.type === "OrgOwnedContactApiKeyLogin_BTOA" &&
                      redeemData.daterange &&
                      (Date.now() < redeemData.daterange.begins_at ||
                        (redeemData.daterange.expires_at !== -1 &&
                          Date.now() > redeemData.daterange.expires_at)))
                  }
                  block
                >
                  {redeemData.type === "SovereignStrangerLogin_BTOA" &&
                  redeemData.profile_id !== currentProfile?.userID
                    ? `Switch to User ${shortenAddress(redeemData.profile_id.replace("UserID_", ""))} to Join`
                    : redeemData.type === "OrgOwnedContactApiKeyLogin_BTOA" &&
                        redeemData.daterange &&
                        Date.now() < redeemData.daterange.begins_at
                      ? `Not Available Yet`
                      : `Join Organization`}
                </Button>

                {redeemData.type === "OrgOwnedContactApiKeyLogin_BTOA" &&
                  redeemData.daterange && (
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
                        ? `Available soon, from ${formatDate(redeemData.daterange.begins_at)} to ${formatDate(redeemData.daterange.expires_at)}`
                        : `Available now, from ${formatDate(redeemData.daterange.begins_at)} to ${formatDate(redeemData.daterange.expires_at)}`}
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

export default ContactRedeem;

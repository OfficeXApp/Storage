import React, { useEffect, useState } from "react";
import {
  Button,
  Form,
  Layout,
  message,
  Select,
  Space,
  Spin,
  Tag,
  Tooltip,
  Typography,
} from "antd";
import toast from "react-hot-toast";
import {
  DirectoryPermissionFE,
  DirectoryPermissionID,
  DirectoryPermissionType,
  DirectoryResourceID,
  DriveID,
  IRequestRedeemDirectoryPermission,
  IResponseRedeemDirectoryPermission,
  IResponseWhoAmI,
  RedeemDirectoryPermission_BTOA,
  UserID,
} from "@officexapp/types";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { IndexDB_Profile, useIdentitySystem } from "../../framework/identity";
import {
  sleep,
  urlSafeBase64Decode,
  urlSafeBase64Encode,
  wrapAuthStringOrHeader,
} from "../../api/helpers";
import {
  CheckCircleOutlined,
  QuestionCircleOutlined,
  TeamOutlined,
  UserOutlined,
} from "@ant-design/icons";
import TagCopy from "../../components/TagCopy";
import { shortenAddress } from "../../framework/identity/constants";

const { Content } = Layout;
const { Title, Paragraph, Text } = Typography;

const RedeemDirectoryPermitPage = () => {
  const params = useParams();
  const orgcode = params.orgcode;
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [redeemData, setRedeemData] =
    useState<RedeemDirectoryPermission_BTOA | null>(null);
  const [selectedProfile, setSelectedProfile] =
    useState<IndexDB_Profile | null>(null);

  const {
    currentOrg,
    currentProfile,
    currentAPIKey,
    wrapOrgCode,
    generateSignature,
    listOfProfiles,
  } = useIdentitySystem();

  useEffect(() => {
    const getRedeemParam = async () => {
      setLoading(true);
      const searchParams = new URLSearchParams(location.search);
      const redeemParam = searchParams.get("redeem");

      if (redeemParam) {
        try {
          const decodedData = JSON.parse(urlSafeBase64Decode(redeemParam));
          setRedeemData(decodedData);
        } catch (error) {
          console.error("Error decoding redeem parameter:", error);
          toast.error(<span>Invalid resource access link</span>);
        }
      } else {
        toast.error(<span>No resource access data found</span>);
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
      toast.error(<span>Missing required data for redemption</span>);
      return;
    }

    setIsProcessing(true);
    try {
      await processDirectoryPermissionRedeem(redeemData);
      toast.success(<span>Successfully gained access to resource!</span>);
    } catch (error) {
      console.error("Error processing resource access:", error);
      toast.error(<span>Failed to process resource access</span>);
    } finally {
      setIsProcessing(false);
    }
  };

  const processDirectoryPermissionRedeem = async (
    data: RedeemDirectoryPermission_BTOA
  ) => {
    if (!currentOrg || !selectedProfile) {
      console.error("No current organization or selected profile found");
      return;
    }

    const auth_token = currentAPIKey?.value || (await generateSignature());

    // Prepare redemption payload
    const redeem_payload: IRequestRedeemDirectoryPermission = {
      permission_id: data.permission_id,
      user_id: selectedProfile.userID,
      redeem_code: data.redeem_code,
      note: `Redeemed by ${selectedProfile.nickname || "user"} on ${new Date().toLocaleString()}`,
    };

    // Call the API to redeem the directory permission
    const { url, headers } = wrapAuthStringOrHeader(
      `${currentOrg.host}/v1/drive/${currentOrg.driveID}/permissions/directory/redeem`,
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

    if (!redeem_response.ok) {
      const errorData = await redeem_response.json();
      console.error("Redeem directory permission error:", errorData);
      throw new Error(
        `Failed to redeem directory permission: ${errorData.err?.message || "Unknown error"}`
      );
    }

    const redeem_data: IResponseRedeemDirectoryPermission =
      await redeem_response.json();

    // Verify the redemption was successful
    if (
      redeem_data.ok &&
      redeem_data.ok.data &&
      redeem_data.ok.data.permission
    ) {
      // Redirect to the resource page
      toast.success(
        <span>
          Successfully accepted file sharing! Redirecting to the file...
        </span>
      );
      await sleep(2000);
      if (data.redirect_url) {
        window.location.href = data.redirect_url;
      } else {
        navigate(wrapOrgCode(`/drive`));
      }
    } else {
      throw new Error(
        "Failed to redeem directory permission: Invalid response format"
      );
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
              Processing resource access...
            </Paragraph>
          </div>
        ) : (
          <>
            <div style={{ textAlign: "center", marginBottom: 48 }}>
              <Title level={1} style={{ marginBottom: 24 }}>
                {redeemData?.resource_id.startsWith("FolderID_")
                  ? `Accept Folder Permit`
                  : `Accept File Permit`}
              </Title>
              <Paragraph>
                You've been invited to access a resource. Please review the
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
                  <Text type="secondary">
                    {redeemData.resource_id.startsWith("FolderID_")
                      ? "Folder"
                      : "File"}{" "}
                    from {` `}
                    {redeemData.org_name || "Organization"}
                    {currentOrg && (
                      <TagCopy
                        id={currentOrg.driveID || ""}
                        style={{ fontSize: "0.7rem" }}
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
                    {redeemData.resource_name || "Unnamed Resource"}
                  </Paragraph>
                </div>

                <div style={{ marginBottom: 24 }}>
                  <Text type="secondary">Permissions</Text>
                  <div style={{ marginTop: 8 }}>
                    {redeemData.permissions &&
                    redeemData.permissions.length > 0 ? (
                      redeemData.permissions.map((permission) => (
                        <Tag
                          key={permission}
                          color="blue"
                          icon={<CheckCircleOutlined />}
                          style={{ marginBottom: "4px" }}
                        >
                          {permission}
                        </Tag>
                      ))
                    ) : (
                      <Tag color="blue">No specific permissions</Tag>
                    )}
                    <Tooltip title="This determines what actions you can perform with this resource.">
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
                  disabled={
                    !selectedProfile ||
                    !currentOrg ||
                    (redeemData?.daterange &&
                      (Date.now() < redeemData.daterange.begins_at ||
                        (redeemData.daterange.expires_at !== -1 &&
                          Date.now() > redeemData.daterange.expires_at)))
                  }
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
                        : "Accept and Access Resource"}
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

export default RedeemDirectoryPermitPage;

const formatDate = (timestamp: number) => {
  if (timestamp === -1) return "no expiry date";
  return new Date(timestamp).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

// Export the helper function to generate redemption URLs
export const generateRedeemDirectoryPermitURL = ({
  resourceID,
  fileURL,
  wrapOrgCode,
  permissionID,
  redeemCode,
  resourceName,
  orgName,
  permissionTypes,
  daterange,
}: {
  resourceID: DirectoryResourceID;
  fileURL: string;
  redeemCode: string;
  wrapOrgCode: (route: string) => string;
  permissionID: DirectoryPermissionID;
  resourceName: string;
  orgName: string;
  permissionTypes: DirectoryPermissionType[];
  daterange: { begins_at: number; expires_at: number };
}) => {
  const payload: RedeemDirectoryPermission_BTOA = {
    resource_id: resourceID,
    permission_id: permissionID,
    redeem_code: redeemCode,
    redirect_url: fileURL,
    resource_name: resourceName,
    org_name: orgName,
    permissions: permissionTypes,
    daterange,
  };

  const finalUrl = `${window.location.origin}${wrapOrgCode("/redeem/directory-permit")}?redeem=${urlSafeBase64Encode(JSON.stringify(payload))}`;
  return finalUrl;
};

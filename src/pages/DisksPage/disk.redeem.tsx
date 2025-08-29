import React, { useEffect, useState } from "react";
import {
  Button,
  Layout,
  message,
  Space,
  Spin,
  Tag,
  Tooltip,
  Typography,
} from "antd";
import toast from "react-hot-toast";
import {
  urlSafeBase64Decode,
  urlSafeBase64Encode,
  wrapAuthStringOrHeader,
} from "../../api/helpers";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useIdentitySystem } from "../../framework/identity";
import { sleep } from "../../api/helpers";
import {
  CheckCircleOutlined,
  QuestionCircleOutlined,
  DatabaseOutlined,
} from "@ant-design/icons";
import TagCopy from "../../components/TagCopy";
import {
  DiskTypeEnum,
  GenerateID,
  IRequestCreateDisk,
  RedeemDiskGiftCard_BTOA,
} from "@officexapp/types";

const { Content } = Layout;
const { Title, Paragraph, Text } = Typography;

const RedeemDiskGiftCard = () => {
  const params = useParams();
  const orgcode = params.orgcode;
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [redeemData, setRedeemData] = useState<RedeemDiskGiftCard_BTOA | null>(
    null
  );

  const {
    currentOrg,
    currentProfile,
    currentAPIKey,
    wrapOrgCode,
    generateSignature,
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
          toast.error(<span>Invalid disk gift card link</span>);
        }
      } else {
        toast.error(<span>No disk gift card data found</span>);
      }
      setLoading(false);
    };

    getRedeemParam();
  }, [location]);

  const handleRedeem = async () => {
    if (!currentOrg?.host) {
      toast.error(
        <span>
          Cannot redeem gift card unless you connect cloud. You are currently in
          an offline organization.
        </span>
      );
      return;
    }

    if (!redeemData || !currentOrg || !currentProfile) {
      toast.error(<span>Missing required data for redemption</span>);
      return;
    }

    setIsProcessing(true);
    toast(<span>Processing your disk claim request...</span>);

    try {
      // Prepare disk data from redeemData
      const diskId = GenerateID.Disk();
      const diskData: IRequestCreateDisk = {
        id: diskId,
        name: redeemData.name || "Gifted Disk",
        disk_type: redeemData.disk_type as DiskTypeEnum,
        public_note: redeemData.public_note || "",
        private_note: `Redeemed from gift card, claimed by ${currentProfile.userID}`,
        auth_json: redeemData.auth_json || "",
        billing_url: redeemData.billing_url || undefined,
      };

      // Get auth token
      const auth_token = currentAPIKey?.value || (await generateSignature());

      // Manually create the disk using fetch
      const { url, headers } = wrapAuthStringOrHeader(
        `${currentOrg.host}/v1/drive/${currentOrg.driveID}/disks/create`,
        {
          "Content-Type": "application/json",
        },
        auth_token
      );

      toast(<span>Creating your disk...</span>);

      const response = await fetch(url, {
        method: "POST",
        headers,
        body: JSON.stringify(diskData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Disk creation error:", errorData);
        throw new Error(
          `Failed to create disk: ${errorData.err?.message || "Unknown error"}`
        );
      }

      const responseData = await response.json();

      // Show success message
      toast.success(
        <span>Disk "${diskData.name}" has been successfully claimed!</span>
      );
      toast(<span>Redirecting to your disks page in 5 seconds...</span>);

      // Wait 5 seconds before redirecting
      await sleep(5000);

      // Redirect to disks page and force reload
      const disksPageUrl = wrapOrgCode(`/resources/disks`);
      window.location.href = disksPageUrl; // Using location.href to force a reload
    } catch (error) {
      console.error("Error claiming disk:", error);
      toast.error(
        <span>
          Failed to claim disk:{" "}
          {error instanceof Error ? error.message : "Unknown error"}
        </span>
      );
      setIsProcessing(false);
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
              Processing disk gift card...
            </Paragraph>
          </div>
        ) : (
          <>
            <div style={{ textAlign: "center", marginBottom: 16 }}>
              <Title level={1} style={{ marginBottom: 24 }}>
                Disk Gift Card
              </Title>
              <Paragraph>
                You've received a disk gift card. Please review the details
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
                    Add Disk to {` `}
                    {currentOrg?.nickname || "Current Organization"}
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
                    {redeemData.name || "Unnamed Disk"}
                  </Paragraph>
                </div>

                <div style={{ marginBottom: 24 }}>
                  <Text type="secondary">Disk Type</Text>
                  <div style={{ marginTop: 8 }}>
                    <Tag
                      color="blue"
                      icon={<DatabaseOutlined />}
                      style={{ marginBottom: "4px" }}
                    >
                      {redeemData.disk_type || "Standard"}
                    </Tag>
                    <Tooltip
                      title={
                        <span>
                          This determines the capabilities and limitations of
                          the disk.
                        </span>
                      }
                    >
                      <QuestionCircleOutlined
                        style={{ marginLeft: 8, color: "#1890ff" }}
                      />
                    </Tooltip>
                  </div>
                </div>

                {redeemData.public_note && (
                  <div style={{ marginBottom: 24 }}>
                    <Text type="secondary">Note</Text>
                    <Paragraph
                      style={{
                        background: "#f0f0f0",
                        padding: "12px",
                        borderRadius: "4px",
                        marginTop: "8px",
                      }}
                    >
                      {redeemData.public_note}
                    </Paragraph>
                  </div>
                )}

                <div style={{ marginBottom: 24 }}>
                  <Text type="secondary">Endpoint</Text>
                  <div style={{ marginTop: 8 }}>
                    <Tag color="green" style={{ marginBottom: "4px" }}>
                      {redeemData.billing_url || "Billing URL"}
                    </Tag>
                  </div>
                </div>

                <Button
                  type="primary"
                  size="large"
                  loading={isProcessing}
                  onClick={handleRedeem}
                  disabled={!currentProfile || !currentOrg}
                  block
                >
                  {!currentProfile || !currentOrg
                    ? "Please log in first"
                    : "Claim This Disk"}
                </Button>
              </div>
            )}
          </>
        )}
      </Content>
    </Layout>
  );
};

export default RedeemDiskGiftCard;

// Export the helper function to generate redemption URLs
export const generateRedeemDiskGiftCardURL = ({
  name,
  disk_type,
  public_note,
  auth_json,
  billing_url,
}: RedeemDiskGiftCard_BTOA) => {
  const payload: RedeemDiskGiftCard_BTOA = {
    name,
    disk_type,
    public_note,
    auth_json,
    billing_url,
  };

  const finalUrl = `${window.location.origin}/org/current/redeem/disk-giftcard?redeem=${urlSafeBase64Encode(JSON.stringify(payload))}`;
  return finalUrl;
};

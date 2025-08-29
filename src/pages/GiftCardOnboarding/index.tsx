import {
  CloudUploadOutlined,
  HomeOutlined,
  LoadingOutlined,
  SmileOutlined,
  SolutionOutlined,
  UserOutlined,
} from "@ant-design/icons";
import {
  Button,
  Input,
  Layout,
  Steps,
  Typography,
  message,
  notification,
  theme,
} from "antd";
import toast from "react-hot-toast";
import { Content } from "antd/es/layout/layout";
import React, { useState } from "react";
import useScreenType from "react-screentype-hook";
import SwitchProfile from "../../components/SwitchProfile";
import { useIdentitySystem } from "../../framework/identity";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import mixpanel from "mixpanel-browser";
import { FACTORY_CANISTER_ENDPOINT } from "../../framework/identity/constants";
import { sleep, wrapAuthStringOrHeader } from "../../api/helpers";
import { v4 as uuidv4 } from "uuid";
import { BundleDefaultDisk, DiskTypeEnum } from "@officexapp/types";

interface GiftCardOnboardingProps {}

// sample url
// https://officex.app/gift-card-onboarding?gas_cycles_included=4T&gift_card_id=GiftcardSpawnOrgID_fe3fd0f8-665e-435c-a0d3-2ffa3bd8d363
const GiftCardOnboarding: React.FC<GiftCardOnboardingProps> = () => {
  const screenType = useScreenType();
  const [searchParams] = useSearchParams();
  const gift_card_id = searchParams.get("gift_card_id");
  const gas_cycles_included = searchParams.get("gas_cycles_included");
  const { token } = theme.useToken();
  const [current, setCurrent] = useState(0);
  const [orgName, setOrgName] = useState("");
  const [giftCardID, setGiftCardID] = useState(gift_card_id || "");
  const { currentProfile } = useIdentitySystem();
  const [apiNotifs, contextHolder] = notification.useNotification();
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const {
    createOrganization,
    switchOrganization,
    switchProfile,
    createApiKey,
    listOfProfiles,
    currentOrg,
  } = useIdentitySystem();

  const next = () => {
    setCurrent(current + 1);
  };

  const prev = () => {
    setCurrent(current - 1);
  };

  // Define steps with content
  const steps = [
    {
      title: <span>Owner</span>,
      icon: <UserOutlined />,
      content: (
        <div
          style={{
            width: "100%",
            padding: screenType.isMobile
              ? "16px 16px 8px 16px"
              : "24px 24px 48px 24px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            color: token.colorText,
            backgroundColor: token.colorFillAlter,
            borderRadius: token.borderRadiusLG,
            border: `1px dashed ${token.colorBorder}`,
            minHeight: screenType.isMobile ? "350px" : "500px",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              maxWidth: "600px",
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-start",
              gap: "16px",
              width: "100%",
            }}
          >
            <Typography.Title
              level={2}
              style={{ alignSelf: "left", width: "100%" }}
            >
              Welcome to OfficeX
            </Typography.Title>
            <Typography.Paragraph
              style={{ alignSelf: "left", textAlign: "left" }}
            >
              Anonymous OfficeX is where freedom works. Documents, Spreadsheets
              & Cloud Storage. 100% sovereign owned by you. To get started,
              select an owner profile or create a new one.
            </Typography.Paragraph>
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                width: "100%",
              }}
            >
              <div
                style={{ marginTop: "16px", width: "100%", marginLeft: -32 }}
              >
                <Typography.Text style={{ marginLeft: 16 }}>
                  Owner Profile
                </Typography.Text>
                <div style={{ marginTop: "8px" }}>
                  <SwitchProfile />
                </div>
              </div>
            </div>
          </div>
        </div>
      ),
    },
    {
      title: <span>Organization</span>,
      icon: <HomeOutlined />,
      content: (
        <div
          style={{
            width: "100%",
            padding: screenType.isMobile
              ? "16px 16px 8px 16px"
              : "24px 24px 48px 24px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            color: token.colorText,
            backgroundColor: token.colorFillAlter,
            borderRadius: token.borderRadiusLG,
            border: `1px dashed ${token.colorBorder}`,
            minHeight: screenType.isMobile ? "350px" : "500px",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              maxWidth: "600px",
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-start",
              gap: "16px",
              width: "100%",
            }}
          >
            <Typography.Title
              level={2}
              style={{ alignSelf: "left", width: "100%" }}
            >
              Your Organization
            </Typography.Title>
            <div style={{ marginBottom: "16px", width: "100%" }}>
              <Typography.Text
                strong
                style={{ display: "block", marginBottom: "8px" }}
              >
                Organization Name
              </Typography.Text>
              <Input
                placeholder="Organization Name"
                defaultValue="Sovereign Org"
                value={orgName}
                onChange={(e) => setOrgName(e.target.value)}
              />
            </div>
            <div style={{ marginBottom: "16px", width: "100%" }}>
              <Typography.Text
                strong
                style={{ display: "block", marginBottom: "8px" }}
              >
                Gift Card ID
              </Typography.Text>

              <Input
                value={giftCardID}
                onChange={(e) => setGiftCardID(e.target.value)}
                suffix={`${gas_cycles_included ? `${gas_cycles_included} gas included` : ""}`}
                disabled={!!gift_card_id}
              />
            </div>
            <Typography.Paragraph>
              Give your organization a name that reflects its purpose. After
              creation, you'll be able to invite team members and collaborate on
              documents while maintaining complete sovereignty over your data.
            </Typography.Paragraph>
          </div>
        </div>
      ),
    },
    {
      title: <span>Create</span>,
      icon: <CloudUploadOutlined />,
      content: (
        <div
          style={{
            width: "100%",
            padding: screenType.isMobile
              ? "16px 16px 8px 16px"
              : "24px 24px 48px 24px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            color: token.colorText,
            backgroundColor: token.colorFillAlter,
            borderRadius: token.borderRadiusLG,
            border: `1px dashed ${token.colorBorder}`,
            minHeight: screenType.isMobile ? "350px" : "500px",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              maxWidth: "600px",
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-start",
              gap: "24px",
              width: "100%",
            }}
          >
            <Typography.Title level={2} style={{ alignSelf: "left" }}>
              Summary
            </Typography.Title>
            <div style={{ width: "100%" }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: "16px",
                }}
              >
                <Input
                  value={giftCardID}
                  suffix={`${gas_cycles_included ? `${gas_cycles_included} gas included` : ""}`}
                  disabled
                />
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: "8px",
                }}
              >
                <Typography.Text>Organization:</Typography.Text>
                <Typography.Text strong>{orgName}</Typography.Text>
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: "8px",
                }}
              >
                <Typography.Text>Owner:</Typography.Text>
                <Typography.Text strong>
                  {currentProfile?.nickname || "Current Profile"}
                </Typography.Text>
              </div>
            </div>
            <Typography.Paragraph
              style={{ alignSelf: "left", textAlign: "left" }}
            >
              Your organization will be deployed to the world computer, an
              anonymous blockchain owned by no one. You'll have complete
              sovereignty over your data and documents.
            </Typography.Paragraph>
            <Typography.Paragraph
              type="secondary"
              style={{ alignSelf: "left", textAlign: "left" }}
            >
              The creation process may take up to 2 minutes to complete.
            </Typography.Paragraph>
          </div>
        </div>
      ),
    },
  ];

  // Convert steps to items for the Steps component
  const items = steps.map((item, index) => ({
    key: item.title,
    title: item.title,
    status: index < current ? "finish" : index === current ? "process" : "wait",
    icon: item.icon,
  }));

  const connectICP = async () => {
    try {
      if (!currentProfile) return;
      setLoading(true);
      mixpanel.track("Connect Cloud With GiftCard");

      apiNotifs.open({
        message: <span>Creating Organization</span>,
        description: (
          <span>
            Please allow up to 2 minutes to deploy to the World Computer. You
            will be redirected to the new organization once it is ready.
          </span>
        ),
        icon: <LoadingOutlined />,
        duration: 0,
      });

      // Extract ICP principal from profile UserID
      const icpPrincipal = currentProfile.userID.replace("UserID_", "");

      toast(<span>Redeeming Gift Card...</span>);

      // Make the POST request to redeem the voucher
      const redeemResponse = await fetch(
        `${FACTORY_CANISTER_ENDPOINT}/v1/factory/giftcards/spawnorg/redeem`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            giftcard_id: giftCardID,
            owner_user_id: currentProfile.userID,
            organization_name: orgName,
            owner_name: currentProfile.nickname || "Anon Owner",
          }),
        }
      );

      if (!redeemResponse.ok) {
        throw new Error(
          `Failed to redeem gift card: ${redeemResponse.statusText}`
        );
      }

      const redeemData = await redeemResponse.json();

      if (!redeemData.ok || !redeemData.ok.data) {
        throw new Error("Invalid response from voucher redemption");
      }

      await sleep(5000);
      toast(<span>Minting Anonymous Blockchain...</span>);
      await sleep(5000);
      toast(<span>Promoting you to Admin...</span>);
      await sleep(5000);

      const { drive_id, host, redeem_code, bundled_default_disk } =
        redeemData.ok.data;

      // Complete the organization setup
      const completeRedeemUrl = `${host}/v1/drive/${drive_id}/organization/redeem`;
      const completeRedeemResponse = await fetch(completeRedeemUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          redeem_code: redeem_code,
        }),
      });

      if (!completeRedeemResponse.ok) {
        throw new Error(
          `Failed to complete organization setup: ${completeRedeemResponse.statusText}`
        );
      }

      const completeRedeemData = await completeRedeemResponse.json();

      if (!completeRedeemData.ok || !completeRedeemData.ok.data) {
        toast.error(<span>Error deploying organization - {redeem_code}</span>);
        localStorage.setItem("FACTORY_REDEEM_CODE", redeem_code);
        throw new Error("Invalid response from organization setup");
      }

      // Extract the admin login password
      const { admin_login_password } = completeRedeemData.ok.data;

      // Parse the admin login password
      const colonIndex = admin_login_password.indexOf(":");
      const atSymbolIndex = admin_login_password.lastIndexOf("@");

      if (
        colonIndex === -1 ||
        atSymbolIndex === -1 ||
        atSymbolIndex === admin_login_password.length - 1
      ) {
        throw new Error("Invalid admin login password format");
      }

      // Extract driveID, password and endpoint
      const driveID = admin_login_password.substring(0, colonIndex).trim();
      const password = admin_login_password
        .substring(colonIndex + 1, atSymbolIndex)
        .trim();
      let adminEndpoint = admin_login_password
        .substring(atSymbolIndex + 1)
        .trim();

      // Remove trailing slash from endpoint if present
      if (adminEndpoint.endsWith("/")) {
        adminEndpoint = adminEndpoint.slice(0, -1);
      }

      // Create the new organization
      const newOrg = await createOrganization({
        driveID: driveID,
        nickname: orgName,
        icpPublicAddress: driveID.replace("DriveID_", ""),
        host: adminEndpoint,
        note: `Organization created with gift card ${giftCardID}`,
        defaultProfile: currentProfile.userID,
      });

      // Store the API key
      await createApiKey({
        apiKeyID: `ApiKey_${uuidv4()}`,
        userID: currentProfile.userID,
        driveID: driveID,
        note: `Auto-generated from gift card for ${orgName} (${adminEndpoint})`,
        value: password,
        host: adminEndpoint,
      });

      // Switch to this organization with the profile
      await switchOrganization(newOrg, currentProfile.userID);

      toast.success(
        <span>
          Successfully Created Organization "${orgName}" with Gift Card
        </span>
      );

      if (bundled_default_disk) {
        try {
          toast.success(<span>Setting up cloud storage...</span>);

          // Make POST request to create disk
          const { url, headers } = wrapAuthStringOrHeader(
            `${adminEndpoint}/v1/drive/${driveID}/disks/create`,
            {},
            password
          );
          const _bundled_default_disk =
            bundled_default_disk as BundleDefaultDisk;
          const createDiskResponse = await fetch(url, {
            method: "POST",
            headers,
            body: JSON.stringify({
              name: _bundled_default_disk.name,
              disk_type: _bundled_default_disk.disk_type,
              public_note: _bundled_default_disk.public_note,
              auth_json: _bundled_default_disk.auth_json,
              autoexpire_ms: _bundled_default_disk.autoexpire_ms,
              billing_url: _bundled_default_disk.billing_url,
            }),
          });

          if (!createDiskResponse.ok) {
            console.error(
              "Failed to create disk:",
              await createDiskResponse.text()
            );
          } else {
            toast.success(<span>Cloud storage configured successfully!</span>);
          }
        } catch (error) {
          console.error("Error creating disk:", error);
        }
      }

      // Refresh the page
      toast.success(<span>Syncing... please wait</span>);
      await sleep(3000);
      toast.success(<span>Success! Entering new organization...</span>);
      navigate("/org/current/welcome");
      window.location.reload();
    } catch (error) {
      console.error("Error connecting to cloud:", error);
      toast.error(
        <span>
          Failed to connect:{" "}
          {error instanceof Error ? error.message : "Unknown error"}
        </span>
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout style={{ height: "100%", backgroundColor: "white" }}>
      {contextHolder}
      <Content
        style={{
          padding: screenType.isMobile ? "16px" : "32px",
          width: "100%",
          gap: 16,
        }}
      >
        <Steps
          size="small"
          responsive={false}
          labelPlacement="horizontal"
          current={current}
          // @ts-ignore
          items={items}
        />

        <div style={{ marginTop: 16 }}>{steps[current].content}</div>

        <div
          style={{ marginTop: 24, display: "flex", justifyContent: "flex-end" }}
        >
          {current > 0 && (
            <Button size="large" style={{ margin: "0 8px" }} onClick={prev}>
              Previous
            </Button>
          )}
          {current < steps.length - 1 && (
            <Button
              size="large"
              type="primary"
              onClick={next}
              disabled={
                current === 1 && (!orgName.trim() || !giftCardID.trim())
              }
            >
              Next
            </Button>
          )}
          {current === steps.length - 1 && (
            <Button
              type="primary"
              size="large"
              onClick={connectICP}
              loading={loading}
            >
              Create Organization
            </Button>
          )}
        </div>
        <br />
        <br />
        <br />
        <br />
        <br />
        <br />
        <br />
      </Content>
    </Layout>
  );
};

export default GiftCardOnboarding;

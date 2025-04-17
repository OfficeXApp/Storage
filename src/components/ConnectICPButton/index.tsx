import React, { useState, useEffect } from "react";
import {
  Button,
  message,
  Modal,
  Input,
  Typography,
  Space,
  Select,
  Divider,
} from "antd";
import {
  CloudSyncOutlined,
  LinkOutlined,
  UserOutlined,
} from "@ant-design/icons";

import { generateRandomSeed } from "../../api/icp";
import { v4 as uuidv4 } from "uuid";
import mixpanel from "mixpanel-browser";
import {
  FACTORY_CANISTER_ENDPOINT,
  shortenAddress,
} from "../../framework/identity/constants";
import { useIdentitySystem } from "../../framework/identity";
import { sleep, wrapAuthStringOrHeader } from "../../api/helpers";
import { DiskTypeEnum } from "@officexapp/types";
import { useNavigate } from "react-router-dom";

const { Text, Title } = Typography;

const ConnectICPButton = () => {
  const navigate = useNavigate();
  const {
    createOrganization,
    switchOrganization,
    switchProfile,
    createApiKey,
    listOfProfiles,
    currentOrg,
  } = useIdentitySystem();

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [giftCardValue, setGiftCardValue] = useState("");
  const [orgName, setOrgName] = useState("");
  const [selectedProfileId, setSelectedProfileId] = useState("");
  const [errors, setErrors] = useState({
    giftCard: "",
    orgName: "",
    profile: "",
  });

  // Set default selected profile when profiles list changes
  useEffect(() => {
    if (listOfProfiles.length > 0) {
      setSelectedProfileId(listOfProfiles[0].userID);
    }
  }, [listOfProfiles]);

  const validateInputs = () => {
    const newErrors = {
      giftCard: "",
      orgName: "",
      profile: "",
    };

    let isValid = true;

    if (!giftCardValue.trim()) {
      newErrors.giftCard = "Gift Card ID is required";
      isValid = false;
    }

    if (!orgName.trim()) {
      newErrors.orgName = "Organization name is required";
      isValid = false;
    }

    if (!selectedProfileId) {
      newErrors.profile = "Profile selection is required";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const renderProfileOptions = () => {
    return listOfProfiles.map((profile) => ({
      value: profile.userID,
      label: (
        <Space style={{ width: "100%", justifyContent: "space-between" }}>
          <Space>
            <UserOutlined />
            <span>{profile.nickname || "Anon"}</span>
          </Space>
          <span style={{ color: "#8c8c8c" }}>
            {shortenAddress(profile.icpPublicAddress)}
          </span>
        </Space>
      ),
    }));
  };

  const connectICP = async () => {
    if (!validateInputs()) return;

    try {
      setLoading(true);
      mixpanel.track("Connect Cloud With GiftCard");

      // Get selected profile
      const profile = listOfProfiles.find(
        (profile) => profile.userID === selectedProfileId
      );

      if (!profile) {
        throw new Error("Selected profile not found");
      }

      // Extract ICP principal from profile UserID
      const icpPrincipal = profile.userID.replace("UserID_", "");

      message.info("Redeeming Gift Card...", 0);

      // Make the POST request to redeem the voucher
      const redeemResponse = await fetch(
        `${FACTORY_CANISTER_ENDPOINT}/v1/default/giftcards/spawnorg/redeem`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            giftcard_id: giftCardValue,
            owner_icp_principal: icpPrincipal,
            organization_name: orgName,
            owner_name: profile.nickname || "Anon Owner",
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
      message.info("Minting Anonymous Blockchain...", 0);
      await sleep(5000);
      message.info("Promoting you to Admin...", 0);
      await sleep(5000);

      const { drive_id, endpoint, redeem_code, disk_auth_json } =
        redeemData.ok.data;

      // Complete the organization setup
      const completeRedeemUrl = `${endpoint}/v1/${drive_id}/organization/redeem`;
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
        message.error(`Error deploying organization - ${redeem_code}`);
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
        endpoint: adminEndpoint,
        note: `Organization created with gift card ${giftCardValue}`,
        defaultProfile: profile.userID,
      });

      // Store the API key
      await createApiKey({
        apiKeyID: `ApiKey_${uuidv4()}`,
        userID: profile.userID,
        driveID: driveID,
        note: `Auto-generated from gift card for ${orgName} (${adminEndpoint})`,
        value: password,
        endpoint: adminEndpoint,
      });

      // Switch to this organization with the profile
      await switchProfile(profile);
      await switchOrganization(newOrg, profile.userID);

      message.success(
        `Successfully Created Organization "${orgName}" with Gift Card`,
        0
      );
      setGiftCardValue("");

      if (disk_auth_json) {
        try {
          message.success("Setting up cloud storage...", 0);

          // Make POST request to create disk
          const { url, headers } = wrapAuthStringOrHeader(
            `${adminEndpoint}/v1/${driveID}/disks/create`,
            {},
            password
          );
          const createDiskResponse = await fetch(url, {
            method: "POST",
            headers,
            body: JSON.stringify({
              name: "Cloud Filesharing",
              disk_type: DiskTypeEnum.StorjWeb3,
              public_note:
                "Default Cloud Filesharing. Use for everything by default.",
              private_note: "",
              auth_json: disk_auth_json,
            }),
          });

          if (!createDiskResponse.ok) {
            console.error(
              "Failed to create disk:",
              await createDiskResponse.text()
            );
          } else {
            message.success("Cloud storage configured successfully!", 0);
          }
        } catch (error) {
          console.error("Error creating disk:", error);
        }
      }
      await sleep(3000);

      // Refresh the page
      message.success("Refreshing Page...", 0);
      navigate("/");
      window.location.reload();
    } catch (error) {
      console.error("Error connecting to cloud:", error);
      message.error(
        `Failed to connect: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    } finally {
      setLoading(false);
      setIsModalVisible(false);
    }
  };

  if (currentOrg?.endpoint) {
    return null;
  }

  return (
    <>
      <Button
        block
        type="primary"
        onClick={() => {
          setIsModalVisible(true);
          mixpanel.track("Connect Cloud Button Click");
        }}
        style={{ marginBottom: "5px" }}
      >
        Connect Cloud
      </Button>

      <Modal
        title={
          <div style={{ textAlign: "center", padding: "12px 0" }}>
            <CloudSyncOutlined
              style={{
                fontSize: "24px",
                color: "#1890ff",
                marginBottom: "8px",
              }}
            />
            <Title level={4} style={{ margin: "8px 0 0" }}>
              Connect World Computer
            </Title>
          </div>
        }
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
        width={400}
      >
        <div style={{ padding: "0 12px 24px" }}>
          <Text
            type="secondary"
            style={{
              display: "block",
              marginBottom: "16px",
              textAlign: "center",
            }}
          >
            The world computer is an Encrypted Cloud owned by nobody. No
            corporation or government can access your private files - only you.{" "}
            <a
              href="https://internetcomputer.org/what-is-the-ic"
              target="_blank"
              rel="noopener noreferrer"
            >
              Learn more
            </a>
          </Text>

          <Space
            direction="vertical"
            style={{ width: "100%", marginBottom: "20px" }}
          >
            <div>
              <Input
                value={orgName}
                onChange={(e) => setOrgName(e.target.value)}
                placeholder="Organization Name"
                style={{ marginBottom: "4px" }}
              />
              {errors.orgName && (
                <Text type="danger" style={{ fontSize: "12px" }}>
                  {errors.orgName}
                </Text>
              )}
            </div>

            <div>
              <Input
                value={giftCardValue}
                onChange={(e) => setGiftCardValue(e.target.value)}
                placeholder="Gift Card ID"
                prefix={<LinkOutlined />}
                style={{ marginBottom: "4px" }}
              />
              {errors.giftCard && (
                <Text type="danger" style={{ fontSize: "12px" }}>
                  {errors.giftCard}
                </Text>
              )}
            </div>

            <span style={{ fontWeight: "normal", color: "rgba(0,0,0,0.3)" }}>
              Owner
            </span>

            <div>
              <Select
                style={{ width: "100%", marginBottom: "4px" }}
                options={renderProfileOptions()}
                value={selectedProfileId}
                onChange={setSelectedProfileId}
                placeholder="Select Profile"
              />
              {errors.profile && (
                <Text type="danger" style={{ fontSize: "12px" }}>
                  {errors.profile}
                </Text>
              )}
            </div>
          </Space>

          <Button
            loading={loading}
            type="primary"
            onClick={connectICP}
            style={{ width: "100%" }}
            disabled={!giftCardValue || !orgName || !selectedProfileId}
          >
            Connect Cloud
          </Button>
          <div style={{ textAlign: "center", marginTop: "16px" }}>
            <Text type="secondary">Powered by ICP Dfinity</Text>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default ConnectICPButton;

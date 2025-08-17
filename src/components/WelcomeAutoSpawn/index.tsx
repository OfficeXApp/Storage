import Layout, { Content } from "antd/es/layout/layout";
import useScreenType from "react-screentype-hook";
import { message, Result, Typography } from "antd";
import {
  CloudOutlined,
  CloudServerOutlined,
  CodeOutlined,
  LoadingOutlined,
} from "@ant-design/icons";
import { useEffect, useState } from "react";
import {
  GiftCardOption,
  initialGiftCardOptions,
  LOCAL_DEV_MODE,
} from "../../framework/identity/constants";
import { AuthProfile, useIdentitySystem } from "../../framework/identity";
import { useNavigate } from "react-router-dom";
import { sleep, wrapAuthStringOrHeader } from "../../api/helpers";
import { BundleDefaultDisk, DiskTypeEnum } from "@officexapp/types";
import { v4 as uuidv4 } from "uuid";

const { Text } = Typography;

const WelcomeAutoSpawn = () => {
  const screenType = useScreenType();
  const navigate = useNavigate();

  const {
    currentProfile,
    listOfProfiles,
    switchProfile,
    switchOrganization,
    createOrganization,
    createApiKey,
  } = useIdentitySystem();

  // Set default selected profile when profiles list changes
  useEffect(() => {
    const selectedFactoryEndpoint = initialGiftCardOptions[0];
    if (selectedFactoryEndpoint && currentProfile) {
      spawnAnonymousCloud(currentProfile, selectedFactoryEndpoint);
    } else {
      navigate("/");
    }
  }, []);

  const spawnAnonymousCloud = async (
    adminProfile: AuthProfile,
    selectedFactoryEndpoint: GiftCardOption
  ) => {
    const orgName = "Anonymous Org";
    const profile = listOfProfiles.find(
      (profile) => profile.userID === adminProfile.userID
    );
    if (!profile) {
      throw new Error("Selected profile not found");
    }
    // Extract ICP principal from profile UserID
    const icpPrincipal = profile.userID.replace("UserID_", "");

    let targetFactoryEndpoint = selectedFactoryEndpoint?.value;
    let giftcardRedeemID = "";

    if (!targetFactoryEndpoint) {
      throw new Error("Selected factory endpoint not found");
    }

    if (!selectedFactoryEndpoint?.buyLink) {
      // assumes its a free server and thus we can create a gift card ourselves
      const giftcardSpawnOrgResponse = await fetch(
        `${selectedFactoryEndpoint?.value}/v1/factory/giftcards/spawnorg/create`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            usd_revenue_cents: 0,
            note: `Free User | ${profile.userID}`,
            gas_cycles_included: 3500000000000,
          }),
        }
      );

      const giftcardSpawnOrgData = await giftcardSpawnOrgResponse.json();

      if (!giftcardSpawnOrgData.ok || !giftcardSpawnOrgData.ok.data) {
        throw new Error("Invalid response from voucher redemption");
      }

      giftcardRedeemID = giftcardSpawnOrgData.ok.data.id;
    }

    // Make the POST request to redeem the voucher
    const redeemResponse = await fetch(
      `${targetFactoryEndpoint}/v1/factory/giftcards/spawnorg/redeem`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          giftcard_id: giftcardRedeemID,
          owner_user_id: profile.userID,
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

    const isWeb3 = LOCAL_DEV_MODE
      ? selectedFactoryEndpoint?.value.includes("localhost:8000")
      : selectedFactoryEndpoint?.value.includes("icp0.io");

    await sleep(isWeb3 ? 5000 : 0);

    await sleep(isWeb3 ? 5000 : 0);

    await sleep(isWeb3 ? 5000 : 0);

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
      host: adminEndpoint,
      note: `Organization auto-spawned at /welcome`,
      defaultProfile: profile.userID,
    });

    // Store the API key
    await createApiKey({
      apiKeyID: `ApiKey_${uuidv4()}`,
      userID: profile.userID,
      driveID: driveID,
      note: `Auto-generated from gift card for ${orgName} (${adminEndpoint})`,
      value: password,
      host: adminEndpoint,
    });

    // Switch to this organization with the profile
    await switchProfile(profile);
    await switchOrganization(newOrg, profile.userID);

    message.success(
      `Successfully Created Organization "${orgName}" with Gift Card`
    );

    if (bundled_default_disk) {
      try {
        message.success("Setting up cloud storage...");

        // Make POST request to create disk
        const { url, headers } = wrapAuthStringOrHeader(
          `${adminEndpoint}/v1/drive/${driveID}/disks/create`,
          {},
          password
        );
        const _bundled_default_disk = bundled_default_disk as BundleDefaultDisk;
        const createDiskResponse = await fetch(url, {
          method: "POST",
          headers,
          body: JSON.stringify({
            name: _bundled_default_disk.name,
            disk_type: _bundled_default_disk.disk_type,
            public_note: _bundled_default_disk.public_note,
            auth_json: _bundled_default_disk.auth_json,
            autoexpire_ms: _bundled_default_disk.autoexpire_ms,
            endpoint: _bundled_default_disk.endpoint,
          }),
        });

        if (!createDiskResponse.ok) {
          console.error(
            "Failed to create disk:",
            await createDiskResponse.text()
          );
        } else {
          message.success("Cloud storage configured successfully!");
        }
      } catch (error) {
        console.error("Error creating disk:", error);
      }
    }

    // Refresh the page
    message.success("Syncing... please wait");
    await sleep(isWeb3 ? 3000 : 0);
    message.success(`Success! Entering new organization...`);
    navigate("/org/current/welcome");
    window.location.reload();
  };

  return (
    <Layout
      style={{
        minHeight: "90vh",
        backgroundColor: "#f5f7fa",
      }}
    >
      <Content
        style={{
          padding: screenType.isMobile ? "24px 16px" : "60px 24px",
          maxWidth: "800px",
          margin: "0 auto",
          width: "100%",
          textAlign: "center",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Result
          icon={<CloudOutlined style={{ color: "#1677ff" }} />}
          //   icon={<CodeOutlined style={{ color: "#1677ff" }} />}
          status="success"
          title={
            <span>
              <LoadingOutlined style={{ marginRight: "8px" }} /> Creating
              Anonymous Cloud...
            </span>
          }
          subTitle="You will automatically be redirected to your new organization..."
        />
      </Content>
    </Layout>
  );
};

export default WelcomeAutoSpawn;

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
  notification,
  Popover,
  AutoComplete,
} from "antd";
import toast from "react-hot-toast";
import {
  CloudSyncOutlined,
  DownOutlined,
  LinkOutlined,
  LoadingOutlined,
  UserOutlined,
} from "@ant-design/icons";

import { generateRandomSeed } from "../../api/icp";
import { v4 as uuidv4 } from "uuid";
import mixpanel from "mixpanel-browser";
import {
  FACTORY_CANISTER_ENDPOINT,
  GiftCardOption,
  initialGiftCardOptions,
  LOCAL_DEV_MODE,
  shortenAddress,
} from "../../framework/identity/constants";
import { useIdentitySystem } from "../../framework/identity";
import { sleep, wrapAuthStringOrHeader } from "../../api/helpers";
import { DiskTypeEnum } from "@officexapp/types";
import { useNavigate } from "react-router-dom";
import { listDisksAction } from "../../redux-offline/disks/disks.actions";
import { useDispatch } from "react-redux";
import { fromLocale } from "../../locales";

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
  const dispatch = useDispatch();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [giftCardValue, setGiftCardValue] = useState("");
  const [orgName, setOrgName] = useState("Anonymous Org");
  const [selectedProfileId, setSelectedProfileId] = useState("");
  const [errors, setErrors] = useState({
    giftCard: "",
    orgName: "",
    profile: "",
  });
  const [apiNotifs, contextHolder] = notification.useNotification();
  const [selectedFactoryEndpoint, setSelectedFactoryEndpoint] =
    useState<GiftCardOption>();
  const [filteredGiftCardOptions, setFilteredGiftCardOptions] = useState(
    initialGiftCardOptions
  );

  useEffect(() => {
    setOrgName(fromLocale().default_orgs.anon_org.org_name);
  }, []);

  // Set default selected profile when profiles list changes
  useEffect(() => {
    if (listOfProfiles.length > 0) {
      setSelectedProfileId(listOfProfiles[0].userID);
      setSelectedFactoryEndpoint(initialGiftCardOptions[0]);
    }
  }, [listOfProfiles]);

  const validateInputs = () => {
    const newErrors = {
      giftCard: "",
      orgName: "",
      profile: "",
    };

    let isValid = true;

    if (selectedFactoryEndpoint?.buyLink && !giftCardValue.trim()) {
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
            <span>
              {profile.nickname ||
                fromLocale().default_orgs.anon_org.profile_name}
            </span>
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
      const icpPrincipal = profile.userID.replace("UserID_", "");

      toast(<span>Redeeming Gift Card...</span>);

      let targetFactoryEndpoint = selectedFactoryEndpoint?.value;
      let giftcardRedeemID = giftCardValue;

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
      toast(<span>Minting Anonymous Blockchain...</span>);
      await sleep(isWeb3 ? 5000 : 0);
      toast(<span>Promoting you to Admin...</span>);
      await sleep(isWeb3 ? 5000 : 0);

      const { drive_id, host, redeem_code, disk_auth_json } =
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
        host: adminEndpoint,
      });

      // Switch to this organization with the profile
      await switchProfile(profile);
      await switchOrganization(newOrg, profile.userID);

      toast.success(
        <span>
          Successfully Created Organization "${orgName}" with Gift Card
        </span>
      );
      setGiftCardValue("");

      if (disk_auth_json) {
        try {
          toast.success(<span>Setting up cloud storage...</span>);

          // Make POST request to create disk
          const { url, headers } = wrapAuthStringOrHeader(
            `${adminEndpoint}/v1/drive/${driveID}/disks/create`,
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
            toast.success(<span>Cloud storage configured successfully!</span>);
          }
        } catch (error) {
          console.error("Error creating disk:", error);
        }
      }

      // Refresh the page
      toast.success(<span>Syncing... please wait</span>);
      await sleep(isWeb3 ? 3000 : 0);
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

  const handleGiftCardSearch = (searchText: string) => {
    if (searchText) {
      // Filter the initial hardcoded options based on title or value
      const filtered = initialGiftCardOptions.filter(
        (option) =>
          option.title.toLowerCase().includes(searchText.toLowerCase()) ||
          option.value.toLowerCase().includes(searchText.toLowerCase())
      );
      setFilteredGiftCardOptions(filtered); // Update the state for options shown in dropdown
    } else {
      // If search text is empty, show all initial options
      setFilteredGiftCardOptions(initialGiftCardOptions);
    }
  };

  const renderGiftCardOption = (item: GiftCardOption) => {
    return {
      value: item.value, // This is the value that will be set when selected or typed
      label: (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            maxWidth: "250px",
          }}
        >
          <Text strong>{item.title}</Text>
          {/* Optionally show a truncated subtext directly in the dropdown item */}
          <Text type="secondary" style={{ fontSize: "0.85em" }}>
            {item.subtext.length > 50
              ? `${item.subtext.substring(0, 50)}...`
              : item.subtext}
          </Text>
        </div>
      ),
      key: item.value,
      title: item.title, // Keep title for filterOption
    };
  };

  const getFactoryEndpointFromValue = (value: string) => {
    return initialGiftCardOptions.find((option) => option.value === value);
  };

  if (currentOrg?.host) {
    return null;
  }

  return (
    <>
      {contextHolder}
      <Button
        block
        type="primary"
        onClick={() => {
          setIsModalVisible(true);
          mixpanel.track("Connect Cloud");
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

            {selectedFactoryEndpoint?.buyLink && (
              <div>
                <Input
                  value={giftCardValue}
                  onChange={(e) => setGiftCardValue(e.target.value)}
                  placeholder="Gift Card ID"
                  suffix={
                    <a
                      href="https://nowpayments.io/payment/?iid=4444542097"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Buy Now
                    </a>
                  }
                  style={{ marginBottom: "4px" }}
                />
                {errors.giftCard && (
                  <Text type="danger" style={{ fontSize: "12px" }}>
                    {errors.giftCard}
                  </Text>
                )}
              </div>
            )}

            <div>
              <AutoComplete
                // Use the filtered options state
                options={filteredGiftCardOptions.map(renderGiftCardOption)}
                value={selectedFactoryEndpoint?.value} // Binds to the input field's text
                onChange={(value) => {
                  setSelectedFactoryEndpoint(
                    getFactoryEndpointFromValue(value)
                  );
                }}
                onSelect={(value, option) => {
                  setSelectedFactoryEndpoint(
                    getFactoryEndpointFromValue(value)
                  );
                }}
                onSearch={handleGiftCardSearch} // Handles filtering the options list
                placeholder="Factory Endpoint"
                style={{ width: "100%", marginBottom: "4px" }}
              >
                <Input suffix={<DownOutlined />} />
              </AutoComplete>
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
            disabled={
              selectedFactoryEndpoint?.buyLink
                ? !giftCardValue || !orgName || !selectedProfileId
                : !orgName || !selectedProfileId
            }
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

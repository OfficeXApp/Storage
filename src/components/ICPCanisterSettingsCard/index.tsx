import React, { useEffect, useState } from "react";
import {
  Modal,
  Form,
  Input,
  Button,
  Typography,
  Card,
  message,
  Col,
  Statistic,
  Space,
  Tooltip,
  Divider,
} from "antd";
import {
  CopyOutlined,
  EyeInvisibleOutlined,
  EyeTwoTone,
  HomeFilled,
  LinkOutlined,
  LoadingOutlined,
  QuestionCircleOutlined,
  ReloadOutlined,
  SyncOutlined,
} from "@ant-design/icons";
import toast from "react-hot-toast";

import { formatCycles } from "../../api/icp.js";
import ConnectICPButton from "../ConnectICPButton/index.js";
import { useIdentitySystem } from "../../framework/identity/index.js";
import EarnProgressOverview from "../EarnProgressOverview/index.js";
import { wrapAuthStringOrHeader } from "../../api/helpers.js";
import TagCopy from "../TagCopy/index.js";
import Title from "antd/es/skeleton/Title.js";
import { DEFAULT_GIFTCARD_REFUEL_VENDOR } from "../../framework/identity/constants.js";
const { Text, Link } = Typography;

const ICPCanisterSettingsCard = () => {
  const [gasBalance, setGasBalance] = useState(0n);
  const { currentOrg, generateSignature, currentAPIKey } = useIdentitySystem();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [giftCardId, setGiftCardId] = useState("");
  const [vendorEndpoint, setVendorEndpoint] = useState(
    DEFAULT_GIFTCARD_REFUEL_VENDOR
  );
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [canisterAddress, setCanisterAddress] = useState("");
  const [isRedeeming, setIsRedeeming] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [driveAbout, setDriveAbout] = useState({
    canister_id: "",
    host: "",
    gas_cycles: "0",
    organization_id: "",
    organization_name: "",
    owner: "",
    daily_idle_cycle_burn_rate: "1",
    controllers: [],
    version: "",
  });

  useEffect(() => {
    if (currentOrg?.host) {
      checkGasBalance();
    }
  }, [currentOrg]);

  const checkGasBalance = async () => {
    if (!currentOrg) return;
    setIsLoading(true);
    let auth_token = currentAPIKey?.value || (await generateSignature());
    const { url, headers } = wrapAuthStringOrHeader(
      `${currentOrg.host}/v1/drive/${currentOrg.driveID}/organization/about`,
      {
        "Content-Type": "application/json",
      },
      auth_token
    );
    const about_response = await fetch(url, {
      method: "GET",
      headers,
    });
    const res = await about_response.json();
    const data = res.ok.data;

    const billion = BigInt(1_000_000_000);
    setGasBalance(BigInt(data.gas_cycles) / billion);
    setCanisterAddress(data.canister_id);
    setDriveAbout({
      ...data,
      daily_idle_cycle_burn_rate: data.daily_idle_cycle_burn_rate.replace(
        /_/g,
        ""
      ),
    });
    setIsLoading(false);
  };

  const showModal = () => {
    setIsModalVisible(true);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
  };

  const copyToClipboard = () => {
    navigator.clipboard
      .writeText(canisterAddress)
      .then(() => {
        toast.success(<span>Canister address copied to clipboard!</span>);
      })
      .catch((err) => {
        toast.error(<span>Failed to copy: {err}</span>);
      });
  };

  const handleRedeemGiftCard = async () => {
    if (!giftCardId.trim() || !driveAbout.canister_id) {
      toast.error(<span>Gift card ID and canister address are required</span>);
      return;
    }

    setIsRedeeming(true);
    toast(<span>Redeeming Gift Card...</span>);

    try {
      // Prepare the request payload
      const payload = {
        giftcard_id: giftCardId,
        icp_principal: driveAbout.canister_id,
      };

      // Call the refuel endpoint
      const redeemResponse = await fetch(
        `${vendorEndpoint}/v1/factory/giftcards/refuel/redeem`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
          // timeout: 120000 // Uncomment if you want to add a timeout
        }
      );

      if (!redeemResponse.ok) {
        throw new Error(
          `Failed to redeem gift card: ${redeemResponse.statusText}`
        );
      }

      const redeemData = await redeemResponse.json();

      if (!redeemData.ok || !redeemData.ok.data) {
        throw new Error("Invalid response from gift card redemption");
      }

      toast.success(<span>Gift card redeemed successfully!</span>);

      // Clear the form fields
      setGiftCardId("");

      // Refresh the gas balance
      await checkGasBalance();

      setIsModalVisible(false);
    } catch (error) {
      console.error("Error redeeming gift card:", error);
      toast.error(
        <span>
          Failed to redeem gift card:{" "}
          {error instanceof Error ? error.message : "Unknown error"}
        </span>
      );
    } finally {
      setIsRedeeming(false);
    }
  };

  const renderAdvancedDetails = () => {
    return (
      <details style={{ marginBottom: "12px", marginTop: "8px" }}>
        <summary
          style={{
            cursor: "pointer",
            color: "#595959",
            fontSize: "14px",
            marginBottom: "4px",
            userSelect: "none",
          }}
        >
          Advanced
        </summary>
        <Form.Item
          label={
            <Space>
              Vendor Endpoint URL
              <Tooltip
                title={
                  <span>
                    Enter the endpoint URL of the vendor who will deposit gas
                    for you. You can buy gift cards from any vendor that
                    supports the Internet Computer.
                  </span>
                }
              >
                <QuestionCircleOutlined />
              </Tooltip>
            </Space>
          }
          style={{ marginTop: "8px" }}
        >
          <Input
            value={vendorEndpoint}
            onChange={(e) => setVendorEndpoint(e.target.value)}
            placeholder="https://vendor-endpoint.example.com"
            style={{ flex: 1, color: "#8c8c8c" }}
            prefix={<LinkOutlined />}
          />
        </Form.Item>
      </details>
    );
  };

  return (
    <Card title="About Organization" type="inner">
      <Space align="center">
        <Typography.Title level={4} style={{ margin: 0 }}>
          {currentOrg?.nickname}
        </Typography.Title>
        <TagCopy id={currentOrg?.driveID || ""} />
        <i style={{ fontSize: "0.8rem", color: "rgba(0,0,0,0.2)" }}>
          {driveAbout?.version}
        </i>
      </Space>
      <br />
      <br />
      <Space direction="vertical" style={{ width: "100%" }}>
        <Input
          value={driveAbout.organization_id || currentOrg?.driveID || ""}
          readOnly
          addonBefore={<span>Drive ID</span>}
          addonAfter={
            <Button
              type="text"
              icon={<CopyOutlined />}
              onClick={() => {
                navigator.clipboard
                  .writeText(
                    driveAbout?.organization_id || currentOrg?.driveID || ""
                  )
                  .then(() => {
                    toast.success(
                      <span>Organization DriveID copied to clipboard</span>
                    );
                  })
                  .catch((err) => {
                    toast.error(<span>Failed to copy: {err}</span>);
                  });
              }}
              style={{ border: "none", background: "transparent", padding: 0 }}
            />
          }
        />
        <Input
          value={
            driveAbout.host ||
            currentOrg?.host ||
            "Offline Organization has no endpoint url"
          }
          readOnly
          addonBefore={<span>Host</span>}
          addonAfter={
            <Button
              type="text"
              icon={<CopyOutlined />}
              onClick={() => {
                navigator.clipboard
                  .writeText(driveAbout?.host || "")
                  .then(() => {
                    toast.success(
                      <span>Organization Endpoint URL copied to clipboard</span>
                    );
                  })
                  .catch((err) => {
                    toast.error(<span>Failed to copy: {err}</span>);
                  });
              }}
              style={{
                border: "none",
                background: "transparent",
                padding: 0,
              }}
            />
          }
        />

        <Input
          value={driveAbout.owner || "Offline Organization has no owner"}
          readOnly
          addonBefore={<span>Owner</span>}
          addonAfter={
            <Button
              type="text"
              icon={<CopyOutlined />}
              onClick={() => {
                navigator.clipboard
                  .writeText(driveAbout?.owner || "")
                  .then(() => {
                    toast.success(
                      <span>Organization OwnerID copied to clipboard</span>
                    );
                  })
                  .catch((err) => {
                    toast.error(<span>Failed to copy: {err}</span>);
                  });
              }}
              style={{ border: "none", background: "transparent", padding: 0 }}
            />
          }
        />
      </Space>
      <br />
      <br />
      <Text>
        OfficeX uses ICP (Internet Computer Protocol) for sovereign private
        cloud. No corporation or government can access your private files - only
        you. OfficeX has no subscription fees, but you have to pay gas to use
        the Internet Computer.{" "}
        <a href="https://internetcomputer.org/what-is-the-ic" target="_blank">
          Learn more
        </a>
      </Text>
      <br />
      <br />
      <div style={{ maxWidth: "300px" }}>
        <ConnectICPButton />
      </div>
      {currentOrg && currentOrg.host && currentOrg.icpPublicAddress && (
        <Space direction="vertical">
          <Statistic
            title={
              <span>
                <Tooltip
                  title={
                    <span>
                      Gas cycles power your canister on the Internet World
                      Computer, guaranteeing computational sovereignty and
                      keeping your data private.
                    </span>
                  }
                >
                  Canister Gas Balance{" "}
                  <QuestionCircleOutlined style={{ marginRight: 8 }} />
                  {isLoading ? (
                    <span>
                      <LoadingOutlined />
                      <i style={{ marginLeft: 8, color: "rgba(0,0,0,0.2)" }}>
                        Syncing
                      </i>
                    </span>
                  ) : (
                    <SyncOutlined
                      onClick={() => {
                        toast(<span>Syncing latest...</span>);
                        checkGasBalance();
                      }}
                      style={{ color: "rgba(0,0,0,0.2)" }}
                    />
                  )}
                </Tooltip>
              </span>
            }
            value={Number(gasBalance)}
            precision={0}
            suffix={
              <Tooltip
                title={
                  gasBalance === 0n ? (
                    <span>Daily idle burn rate stats will appear here</span>
                  ) : (
                    <span>
                      Daily idle burn rate of $
                      {(
                        BigInt(
                          driveAbout.daily_idle_cycle_burn_rate.replace(
                            /_/g,
                            ""
                          ) || "1"
                        ) / 1_000_000n
                      ).toString()}{" "}
                      million gas cycles. Approximately $
                      {(
                        (gasBalance * BigInt(1_000_000_000)) /
                        BigInt(driveAbout.daily_idle_cycle_burn_rate || 1)
                      ).toString()}{" "}
                      days remaining.
                    </span>
                  )
                }
              >
                <i style={{ fontSize: "0.8rem", color: "rgba(0,0,0,0.3)" }}>
                  Billion Cycles <QuestionCircleOutlined />
                </i>
              </Tooltip>
            }
          />

          <Button onClick={showModal} style={{ marginTop: 16 }} type="primary">
            Deposit Gas
          </Button>

          {/* <EarnProgressOverview /> */}
        </Space>
      )}
      <Modal
        title="Deposit Gas"
        open={isModalVisible}
        onCancel={handleCancel}
        footer={null}
      >
        <Text type="secondary">
          To deposit gas into your canister, transfer cycles to the address
          below. Learn how to deposit gas with{" "}
          <a href="https://internetcomputer.org/what-is-the-ic" target="_blank">
            instructions here
          </a>
        </Text>
        <div style={{ marginTop: 16, marginBottom: 16 }}>
          <Input
            readOnly
            value={canisterAddress}
            addonAfter={
              <Button
                type="text"
                icon={<CopyOutlined />}
                onClick={copyToClipboard}
                style={{
                  border: "none",
                  background: "transparent",
                  padding: 0,
                }}
              />
            }
          />
        </div>

        <div style={{ marginTop: 16 }}>
          <Text type="secondary">
            Or you can also redeem a gift card from a vendor to deposit gas into
            your canister. Click here to{" "}
            <a
              href="https://internetcomputer.org/what-is-the-ic"
              target="_blank"
            >
              buy gas from vendor
            </a>
          </Text>
          <div style={{ marginTop: 16 }}>
            <Form layout="vertical">
              <Form.Item label="Gift Card ID">
                <Input
                  value={giftCardId}
                  onChange={(e) => setGiftCardId(e.target.value)}
                  placeholder="Enter gift card ID"
                />
              </Form.Item>

              {renderAdvancedDetails()}

              <Form.Item>
                <Button
                  type="primary"
                  onClick={handleRedeemGiftCard}
                  disabled={!giftCardId || (showAdvanced && !vendorEndpoint)}
                  loading={isRedeeming}
                >
                  Redeem Gift Card
                </Button>
              </Form.Item>
            </Form>
          </div>
        </div>
      </Modal>
    </Card>
  );
};

export default ICPCanisterSettingsCard;

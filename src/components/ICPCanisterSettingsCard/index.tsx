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
  QuestionCircleOutlined,
  ReloadOutlined,
} from "@ant-design/icons";

import { Actor } from "@dfinity/agent";
import { idlFactory as idlFactory_Drive } from "../../declarations/officex-canisters-backend/officex-canisters-backend.did.js";
import { formatCycles } from "../../api/icp.js";
import ConnectICPButton from "../ConnectICPButton/index.js";
import { useIdentitySystem } from "../../framework/identity/index.js";
import EarnProgressOverview from "../EarnProgressOverview/index.js";
import { wrapAuthStringOrHeader } from "../../api/helpers.js";
import TagCopy from "../TagCopy/index.js";
import Title from "antd/es/skeleton/Title.js";
const { Text, Link } = Typography;

const ICPCanisterSettingsCard = () => {
  const [gasBalance, setGasBalance] = useState(0n);
  const { currentOrg, generateSignature, currentAPIKey } = useIdentitySystem();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [giftCardId, setGiftCardId] = useState("");
  const [vendorEndpoint, setVendorEndpoint] = useState("");
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [canisterAddress, setCanisterAddress] = useState("");
  const [driveAbout, setDriveAbout] = useState({
    canister_id: "",
    endpoint: "",
    gas_cycles: 0,
    organization_id: "",
    organization_name: "",
    owner: "",
  });

  useEffect(() => {
    if (currentOrg?.endpoint) {
      checkGasBalance();
    }
  }, [currentOrg]);

  const checkGasBalance = async () => {
    if (!currentOrg) return;
    let auth_token = currentAPIKey?.value || (await generateSignature());
    const { url, headers } = wrapAuthStringOrHeader(
      `${currentOrg.endpoint}/v1/${currentOrg.driveID}/organization/about`,
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
    console.log("about org:", data);

    const billion = BigInt(1_000_000_000);
    setGasBalance(BigInt(data.gas_cycles) / billion);
    setCanisterAddress(data.canister_id);
    setDriveAbout(data);
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
        message.success("Canister address copied to clipboard!");
      })
      .catch((err) => {
        message.error("Failed to copy: " + err);
      });
  };

  const handleRedeemGiftCard = () => {
    console.log("Redeeming gift card with ID:", giftCardId);
    console.log("Vendor endpoint:", vendorEndpoint);
    // Logic to be implemented later
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
              <Tooltip title="Enter the endpoint URL of the vendor who will deposit gas for you. You can buy gift cards from any vendor that supports the Internet Computer.">
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
      </Space>
      <br />
      <br />
      <Space direction="vertical" style={{ width: "100%" }}>
        <Input
          value={driveAbout.organization_id || currentOrg?.driveID || ""}
          readOnly
          addonBefore={driveAbout?.organization_name || "Organization"}
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
                    message.success("Organization DriveID copied to clipboard");
                  })
                  .catch((err) => {
                    message.error("Failed to copy: " + err);
                  });
              }}
              style={{ border: "none", background: "transparent", padding: 0 }}
            />
          }
        />
        <Input
          value={
            driveAbout.endpoint ||
            currentOrg?.endpoint ||
            "Offline Organization has no endpoint url"
          }
          readOnly
          addonBefore={"Endpoint"}
          addonAfter={
            <Button
              type="text"
              icon={<CopyOutlined />}
              onClick={() => {
                navigator.clipboard
                  .writeText(driveAbout?.endpoint || "")
                  .then(() => {
                    message.success(
                      "Organization Endpoint URL copied to clipboard"
                    );
                  })
                  .catch((err) => {
                    message.error("Failed to copy: " + err);
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
          addonBefore={"Owner"}
          addonAfter={
            <Button
              type="text"
              icon={<CopyOutlined />}
              onClick={() => {
                navigator.clipboard
                  .writeText(driveAbout?.owner || "")
                  .then(() => {
                    message.success("Organization OwnerID copied to clipboard");
                  })
                  .catch((err) => {
                    message.error("Failed to copy: " + err);
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
      {currentOrg && currentOrg.endpoint && currentOrg.icpPublicAddress && (
        <Space direction="vertical">
          <Statistic
            title={
              <span>
                <Tooltip title="Gas cycles power your canister on the Internet World Computer, guaranteeing computational sovereignty and keeping your data private.">
                  Canister Gas Balance <QuestionCircleOutlined />
                </Tooltip>
              </span>
            }
            value={Number(gasBalance)}
            precision={0}
            suffix={
              <i style={{ fontSize: "0.8rem", color: "rgba(0,0,0,0.3)" }}>
                Billion Cycles
              </i>
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

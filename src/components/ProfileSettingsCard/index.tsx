import React, { useEffect, useState } from "react";
import {
  Card,
  Typography,
  Input,
  Button,
  message,
  Space,
  Modal,
  Form,
  DatePicker,
  Switch,
  Tooltip,
  Divider,
} from "antd";
import {
  EditOutlined,
  CloseCircleOutlined,
  CheckOutlined,
  CopyOutlined,
  InfoCircleOutlined,
  LinkOutlined,
  KeyOutlined,
} from "@ant-design/icons";
import { useIdentitySystem } from "../../framework/identity";
import TagCopy from "../TagCopy";
import { urlSafeBase64Encode, wrapAuthStringOrHeader } from "../../api/helpers";
import { Link } from "react-router-dom";

const { Text, Title } = Typography;
const { RangePicker } = DatePicker;

const ProfileSettingsCard = () => {
  const {
    currentProfile,
    currentAPIKey,
    currentOrg,
    generateSignature,
    wrapOrgCode,
  } = useIdentitySystem();
  const [isEditingApiKey, setIsEditingApiKey] = useState(false);
  const [apiKeyValue, setApiKeyValue] = useState(currentAPIKey?.value || "");
  const [originalApiKeyValue, setOriginalApiKeyValue] = useState(
    currentAPIKey?.value || ""
  );
  const [testingApiKey, setTestingApiKey] = useState(false);
  const [testResult, setTestResult] = useState({ status: "", message: "" });

  // For login modal
  const [expirationTime, setExpirationTime] = useState<number>(0);

  const [showModalGenSig, setShowModalGenSig] = useState(false);
  const [signature, setSignature] = useState("");
  const [isGeneratingSignature, setIsGeneratingSignature] = useState(false);
  const [sigLoopCounter, setSigLoopCounter] = useState(0);

  useEffect(() => {
    setInterval(() => {
      setSigLoopCounter((prev) => prev + 1);
    }, 1000);
  }, []);

  const handleEditClick = () => {
    setOriginalApiKeyValue(apiKeyValue);
    setIsEditingApiKey(true);
  };

  const testApiKey = async () => {
    setTestingApiKey(true);
    setTestResult({ status: "", message: "" });

    try {
      if (!currentOrg || !currentOrg.driveID) {
        throw new Error("Organization information is missing");
      }

      const whoamiUrl = `${currentOrg.endpoint}/v1/${currentOrg.driveID}/organization/whoami`;

      // Use the new API key value for the test
      const { url, headers } = wrapAuthStringOrHeader(
        whoamiUrl,
        { "Content-Type": "application/json" },
        apiKeyValue
      );

      const response = await fetch(url, {
        method: "GET",
        headers,
      });

      if (!response.ok) {
        throw new Error(`API key test failed with status: ${response.status}`);
      }

      const data = await response.json();

      if (data && data.ok && data.ok.data) {
        setTestResult({
          status: "success",
          message: `Authenticated as: ${data.ok.data.name || "User"}`,
        });
      } else {
        throw new Error("Invalid response format from server");
      }
    } catch (error: any) {
      console.error("Error testing API key:", error);
      setTestResult({
        status: "error",
        message: `Test failed: ${error.message}`,
      });
    } finally {
      setTestingApiKey(false);
    }
  };

  const handleSaveApiKey = () => {
    // Here you would update the API key in the identity system
    // This is a placeholder - you'll need to implement the actual update
    message.success("API Key updated successfully");
    setIsEditingApiKey(false);
    setTestResult({ status: "", message: "" });
  };

  const copyToClipboard = (value: string) => {
    navigator.clipboard
      .writeText(value)
      .then(() => message.success("Copied to clipboard!"))
      .catch((err) => {
        console.error("Failed to copy:", err);
        message.error("Failed to copy");
      });
  };

  const handleGenerateSignature = async () => {
    setIsGeneratingSignature(true);
    try {
      if (!currentProfile?.icpAccount) {
        message.error("This profile doesn't have a seed phrase");
        return;
      }

      const sig = await generateSignature();
      setSignature(sig);
      copyToClipboard(sig);
      message.success("Signature generated successfully");
      setExpirationTime(Date.now() + 30 * 1000);
    } catch (error) {
      console.error("Error generating signature:", error);
      message.error("Failed to generate signature");
    } finally {
      setIsGeneratingSignature(false);
    }
  };

  return (
    <Card title="Current Profile" type="inner">
      <Space direction="vertical" style={{ width: "100%" }}>
        <Space align="center">
          <Title level={4} style={{ margin: 0 }}>
            {currentProfile?.nickname}
          </Title>
          <TagCopy id={currentProfile?.userID || ""} />
        </Space>
        <Text>
          Use API keys for secure login without risking your seed phrase, and
          generate links for access from other devices. Click here to{" "}
          <a href="https://internetcomputer.org/what-is-the-ic" target="_blank">
            learn more
          </a>
        </Text>

        <div style={{ marginTop: 16 }}>
          <Text strong>Local API Key</Text>
          <div style={{ marginTop: 8 }}>
            <Input.Password
              value={apiKeyValue}
              onChange={(e) => setApiKeyValue(e.target.value)}
              prefix={
                isEditingApiKey ? (
                  <CloseCircleOutlined
                    onClick={() => setIsEditingApiKey(false)}
                  />
                ) : (
                  <CopyOutlined onClick={() => copyToClipboard(apiKeyValue)} />
                )
              }
              readOnly={!isEditingApiKey}
              style={{
                backgroundColor: isEditingApiKey ? "#fff" : "#f5f5f5",
                ...(testResult.status === "success"
                  ? { borderColor: "#52c41a" }
                  : {}),
                ...(testResult.status === "error"
                  ? { borderColor: "#ff4d4f" }
                  : {}),
              }}
              addonAfter={
                isEditingApiKey ? (
                  <Space>
                    {testResult.status !== "success" && (
                      <Button
                        type="text"
                        onClick={testApiKey}
                        loading={testingApiKey}
                        style={{
                          border: "none",
                          background: "transparent",
                          padding: 0,
                        }}
                      >
                        Test
                      </Button>
                    )}
                    <Button
                      type="text"
                      onClick={handleSaveApiKey}
                      disabled={testResult.status !== "success"}
                      style={{
                        border: "none",
                        background: "transparent",
                        padding: 0,
                      }}
                    >
                      Save
                    </Button>
                  </Space>
                ) : (
                  <Button
                    type="text"
                    icon={<EditOutlined />}
                    onClick={handleEditClick}
                    style={{
                      border: "none",
                      background: "transparent",
                      padding: 0,
                    }}
                  >
                    Replace API Key
                  </Button>
                )
              }
            />
            {testResult.status && (
              <Text
                type={testResult.status === "success" ? "success" : "danger"}
                style={{ display: "block", marginTop: 4 }}
              >
                {testResult.message}
              </Text>
            )}
          </div>
        </div>

        <Divider />

        <Text>
          Generate links to login from other devices. Or generate a
          cryptographic signature for short-lived authentication of 30 seconds.
          Click here to{" "}
          <a href="https://internetcomputer.org/what-is-the-ic" target="_blank">
            learn more
          </a>
        </Text>

        <Space direction="horizontal" style={{ marginTop: 8 }}>
          <Link
            to={wrapOrgCode(`/resources/contacts/${currentProfile?.userID}`)}
          >
            <Button type="primary">Generate Login</Button>
          </Link>
          <Button onClick={() => setShowModalGenSig(true)}>
            Generate Signature
          </Button>
        </Space>
      </Space>
      <Modal
        title="Generate Signature"
        open={showModalGenSig}
        onCancel={() => setShowModalGenSig(false)}
        footer={[
          <Button key="close" onClick={() => setShowModalGenSig(false)}>
            Close
          </Button>,
          <Button
            type="primary"
            icon={<KeyOutlined />}
            onClick={handleGenerateSignature}
            loading={isGeneratingSignature}
            disabled={!currentProfile?.icpAccount}
          >
            Generate Fresh Signature
          </Button>,
        ]}
      >
        <Space direction="vertical" style={{ width: "100%" }}>
          <Text>
            Generate a cryptographic signature that can be used for secure API
            authentication. This signature is valid for 30 seconds and can be
            used safely in API requests.
          </Text>

          {!currentProfile?.icpAccount && (
            <Text type="warning">
              This profile doesn't have a seed phrase. Please use an API key
              instead.
            </Text>
          )}

          <Input.Password
            value={signature}
            readOnly
            placeholder="Your signature will appear here"
            prefix={
              <span
                onClick={() => copyToClipboard(signature)}
                style={{ cursor: "pointer" }}
              >
                <CopyOutlined />
                <span style={{ margin: "0px 8px" }}>Copy</span>
              </span>
            }
          />
          {expirationTime && (
            <span
              style={{
                color: "#8c8c8c",
                display: "block",
                textAlign: "left",
                marginBottom: 8,
              }}
            >
              {expirationTime > Date.now()
                ? `Expires in ${Math.ceil((expirationTime - Date.now()) / 1000)} seconds`
                : "Expired, please regenerate signature"}
            </span>
          )}
        </Space>
      </Modal>
    </Card>
  );
};

export default ProfileSettingsCard;

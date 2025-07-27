// RunAppDrawer.tsx
import React, { useState, useEffect } from "react";
import {
  Drawer,
  Button,
  Typography,
  Space,
  Select,
  Input,
  Card,
  Divider,
  QRCode,
  Tooltip,
  Avatar,
  Row,
  Col,
  Popover,
  Alert,
  message,
} from "antd";
import {
  CopyOutlined,
  LinkOutlined,
  InfoCircleOutlined,
  CloseOutlined,
} from "@ant-design/icons";
import { useDispatch, useSelector } from "react-redux";
import { ReduxAppState } from "../../redux-offline/ReduxProvider";
import {
  listApiKeysAction,
  getApiKeyAction,
} from "../../redux-offline/api-keys/api-keys.actions";
import { useIdentitySystem } from "../../framework/identity";
import {
  ApiKeyFE,
  CheckoutRun,
  IRequestCheckoutPayload,
  IResponseCheckoutPayload,
  VendorDepositForOffer,
} from "@officexapp/types";
import useScreenType from "react-screentype-hook";
import { Link } from "react-router-dom";

const { Title, Paragraph, Text } = Typography;
const { Option } = Select;

interface RunAppDrawerProps {
  isDrawerVisible: boolean;
  onCloseDrawer: () => void;
  checkoutRun: CheckoutRun;
}

const RunAppDrawer: React.FC<RunAppDrawerProps> = ({
  isDrawerVisible,
  onCloseDrawer,
  checkoutRun,
}) => {
  const screenType = useScreenType();
  const [selectedDepositOption, setSelectedDepositOption] =
    useState<VendorDepositForOffer | null>(
      checkoutRun.depositOptions.length > 0
        ? checkoutRun.depositOptions[0]
        : null
    );
  const [apiKeyInputValue, setApiKeyInputValue] = useState<string>("");
  const [txProofInputValue, setTxProofInputValue] = useState<string>("");
  const [preferenceInputs, setPreferenceInputs] = useState<
    Record<string, string>
  >({}); // For dynamic requirement inputs
  const [isRunButtonDisabled, setIsRunButtonDisabled] = useState<boolean>(true);
  const [finishedCheckoutRedirectUrl, setFinishedCheckoutRedirectUrl] =
    useState<string>("");
  const [redirectCta, setRedirectCta] = useState<string>("");

  const dispatch = useDispatch();
  const {
    currentProfile,
    generateSignature,
    currentAPIKey,
    currentOrg,
    wrapOrgCode,
  } = useIdentitySystem();

  useEffect(() => {
    if (isDrawerVisible) {
      const initialPreferenceInputs: Record<string, string> = {};
      checkoutRun.requirements.forEach((req) => {
        if (req.defaultValue !== undefined && req.defaultValue !== null) {
          initialPreferenceInputs[req.id] = String(req.defaultValue);
        }
      });
      setPreferenceInputs(initialPreferenceInputs);
    }
  }, [isDrawerVisible, checkoutRun.requirements]);

  useEffect(() => {
    if (isDrawerVisible && currentProfile) {
      dispatch(listApiKeysAction(currentProfile.userID));
      if (currentAPIKey && currentAPIKey.value) {
        setApiKeyInputValue(currentAPIKey.value);
      }
    }
  }, [isDrawerVisible, currentProfile, dispatch, currentAPIKey]);

  // Effect to manage the disabled state of the Run Job button
  useEffect(() => {
    const checkFormValidity = () => {
      let allRequiredFieldsFilled = true;

      // Check API Key
      // Assuming API key is optional or handled by signature generation
      // For now, we'll only consider it required if a custom value is expected.
      // If it's empty, the signature generation will handle it.

      // Check Deposit Proof (txProof) if deposit options exist
      if (checkoutRun.depositOptions.length > 0 && selectedDepositOption) {
        if (!txProofInputValue.trim()) {
          allRequiredFieldsFilled = false;
        }
      }

      // Check dynamic requirement fields
      checkoutRun.requirements.forEach((req) => {
        if (req.required && !preferenceInputs[req.id]?.trim()) {
          allRequiredFieldsFilled = false;
        }
      });

      setIsRunButtonDisabled(!allRequiredFieldsFilled);
    };

    checkFormValidity();
  }, [
    apiKeyInputValue,
    txProofInputValue,
    preferenceInputs,
    selectedDepositOption,
    checkoutRun.depositOptions,
    checkoutRun.requirements,
  ]);

  const handleDepositOptionChange = (value: string) => {
    const selected = checkoutRun.depositOptions.find(
      (option) => option.title === value
    );
    setSelectedDepositOption(selected || null);
    setTxProofInputValue(""); // Clear txProof when deposit option changes
  };

  const handlePreferenceInputChange = (id: string, value: string) => {
    setPreferenceInputs((prev) => ({ ...prev, [id]: value }));
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    message.success("Copied to clipboard!");
  };

  const handleSubmit = async () => {
    // Manual validation before submission
    let isValid = true;

    // Validate Transaction Proof if required
    if (checkoutRun.depositOptions.length > 0 && selectedDepositOption) {
      if (!txProofInputValue.trim()) {
        message.error("Please enter the transaction proof!");
        isValid = false;
      }
    }

    // Validate dynamic requirement fields
    checkoutRun.requirements.forEach((req) => {
      if (req.required && !preferenceInputs[req.id]?.trim()) {
        message.error(`Please provide ${req.title}`);
        isValid = false;
      }
    });

    if (!isValid) {
      return;
    }

    try {
      let finalApiKey = apiKeyInputValue;

      if (!finalApiKey) {
        message.loading("Generating quick signature...", 0);
        finalApiKey = await generateSignature();
        message.destroy();
        message.success("Signature generated!");
      }

      const payload: IRequestCheckoutPayload = {
        checkoutRun,
        selectedDepositOption,
        requirements: preferenceInputs, // All dynamic form fields go here
        grantedApiKey: finalApiKey,
        txProof: txProofInputValue,
        orgID: currentOrg?.driveID,
        orgEndpoint: currentOrg?.endpoint,
      };

      console.log("Final Checkout Payload:", payload);

      const response = await fetch(checkoutRun.installationUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        // Handle HTTP errors
        const errorData = await response.json(); // Attempt to parse error message from response body
        throw new Error(errorData.message || "Network response was not ok.");
      }

      const data: IResponseCheckoutPayload = await response.json();
      console.log(`Checkout Response:`, data);

      message.success(
        <span>
          Checkout successful! View your{" "}
          <Link to={wrapOrgCode(`/resources/job_runs`)}>purchase history</Link>
        </span>
      );
      setRedirectCta(data.redirect_cta || "");

      if (data.redirect_url) {
        setFinishedCheckoutRedirectUrl(data.redirect_url);
      } else {
        setFinishedCheckoutRedirectUrl(
          `${window.location.origin}${wrapOrgCode(`/resources/job-runs`)}`
        );
      }
    } catch (error: any) {
      console.error("Submission failed:", error);
      // Display the error message from the caught error, or a generic one
      message.error(
        `Submission failed: ${error.message || "An unexpected error occurred."}`
      );
    }
  };

  const DepositInfoPopoverContent = (explanation: string) => (
    <div>
      <Paragraph style={{ margin: 0 }}>{explanation}</Paragraph>
    </div>
  );

  const SecurityDisclaimerPopoverContent = (
    <div>
      <Paragraph style={{ marginBottom: "8px" }}>
        When you grant an API key, the vendor's application running in a Trusted
        Execution Environment (TEE) will have temporary access to your API key
        for setup and execution.
      </Paragraph>
      <Paragraph style={{ marginBottom: "8px" }}>
        For enhanced security, we recommend:
      </Paragraph>
      <ol style={{ paddingLeft: "20px", margin: 0 }}>
        <li>Creating a **separate API key** specifically for this vendor.</li>
        <li>
          Creating a **new profile** with the same name as the vendor and exact
          security scopes, then installing the app using that profile.
        </li>
      </ol>
      <Paragraph
        style={{ marginTop: "8px", fontStyle: "italic", fontSize: "12px" }}
      >
        This ensures that even in the unlikely event of a compromise within the
        TEE, the scope of potential damage is minimized.
      </Paragraph>
    </div>
  );

  console.log(
    `checkoutRun.needsCloudOfficeX=${checkoutRun.needsCloudOfficeX} && !currentOrg?.endpoint=${currentOrg?.endpoint}`
  );

  return (
    <Drawer
      title={
        <div
          style={{
            display: "flex",
            alignItems: "space-between",
            justifyContent: "space-between",
            width: "100%",
          }}
        >
          <Space>
            <Avatar src={checkoutRun.vendorAvatar} size="small" />
            <Text strong>{checkoutRun.vendorName}</Text>
          </Space>
          <span
            style={{
              fontWeight: "lighter",
              fontSize: "0.8rem",
              color: "#8c8c8c",
            }}
          >
            Purchase Checkout
          </span>
        </div>
      }
      placement="right"
      closable={true}
      onClose={onCloseDrawer}
      open={isDrawerVisible}
      width={
        screenType.isMobile ? "100%" : screenType.isTablet ? "70%" : "600px"
      }
      destroyOnClose={true}
      closeIcon={<CloseOutlined />}
      bodyStyle={{ paddingBottom: 80 }}
      footerStyle={{
        position: "sticky",
        bottom: 0,
        width: "100%",
        padding: "16px 24px",
        background: "#fff",
        borderTop: "1px solid #f0f0f0",
        zIndex: 10,
        display: "flex",
        justifyContent: "space-between",
      }}
      footer={
        <Space style={{ width: "100%", justifyContent: "space-between" }}>
          <Button onClick={onCloseDrawer}>Close</Button>
          {finishedCheckoutRedirectUrl ? (
            <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
              <span style={{ color: "#16af16" }}>Success</span>
              <Button
                type="primary"
                onClick={() => {
                  // open in new tab
                  window.open(finishedCheckoutRedirectUrl, "_blank");
                }}
                disabled={isRunButtonDisabled}
              >
                {redirectCta || "View Purchase History"}
              </Button>
            </div>
          ) : (
            <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
              {checkoutRun.needsCloudOfficeX && !currentOrg?.endpoint && (
                <span style={{ color: "#ff0000" }}>Connect Cloud</span>
              )}
              <Button
                type="primary"
                onClick={handleSubmit}
                disabled={isRunButtonDisabled}
              >
                {checkoutRun.callToAction || "Run App"}
              </Button>
            </div>
          )}
        </Space>
      }
    >
      <div>
        {/* First Section: Offer Name and Description */}
        <div style={{ marginBottom: 20 }}>
          <Title level={4} style={{ margin: 0 }}>
            {checkoutRun.offerName}
          </Title>
          <div
            dangerouslySetInnerHTML={{ __html: checkoutRun.offerDescription }}
            style={{ marginTop: 10 }}
          />
        </div>

        {/* --- Security Section --- */}
        <Card
          size="small"
          style={{ marginBottom: 20, backgroundColor: "#fbfbfb" }}
        >
          <Title level={5} style={{ marginBottom: 16 }}>
            1. Security & Verification
          </Title>
          {checkoutRun.needsAuth ? (
            <>
              <Paragraph>
                This application requires certain permissions to function.
                Please review the permission scopes below.
              </Paragraph>
              <Alert
                message="Vendor Verification & API Key Best Practices"
                description={
                  <>
                    <Paragraph style={{ marginBottom: "8px" }}>
                      It's crucial to verify that this vendor offer is who they
                      claim to be. Always check their credentials and the code
                      being executed.
                    </Paragraph>
                    <Paragraph>
                      <Tooltip title="View vendor's terms and conditions or general information.">
                        <a
                          href={checkoutRun.aboutUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{
                            borderBottom: "1px dashed #999",
                            color: "inherit",
                          }}
                        >
                          About this vendor{" "}
                          <LinkOutlined style={{ fontSize: "12px" }} />
                        </a>
                      </Tooltip>
                      <Divider type="vertical" />
                      <Tooltip title="Verify the code to be executed on checkout, usually pointing to a Trusted Execution Environment (TEE).">
                        <a
                          href={checkoutRun.verificationUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{
                            borderBottom: "1px dashed #999",
                            color: "inherit",
                          }}
                        >
                          Verify execution code{" "}
                          <LinkOutlined style={{ fontSize: "12px" }} />
                        </a>
                      </Tooltip>
                      <Divider type="vertical" />
                      <Tooltip title="OfficeX is a permissionless platform and thus does not verify 3rd party apps. Appstore list providers and users to be responsible for their own security.">
                        <a
                          href="#" // Replace with actual link to "Learn more about verification"
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{
                            borderBottom: "1px dashed #999",
                            color: "inherit",
                          }}
                        >
                          Learn more about 3rd party app verification on OfficeX{" "}
                          <LinkOutlined style={{ fontSize: "12px" }} />
                        </a>
                      </Tooltip>
                    </Paragraph>
                  </>
                }
                type="warning"
                showIcon
                style={{ marginBottom: 20 }}
              />

              {/* API Key Password Input */}
              <div style={{ marginBottom: 24 }}>
                <label style={{ display: "block", marginBottom: 8 }}>
                  <Space size={4}>
                    Grant API Key Scope
                    <Popover
                      content={SecurityDisclaimerPopoverContent}
                      title="API Key Security Hygiene"
                      trigger="hover"
                    >
                      <InfoCircleOutlined
                        style={{ color: "rgba(0,0,0,.45)" }}
                      />
                    </Popover>
                  </Space>
                </label>
                <Input.Password
                  placeholder="Enter API key or leave empty to use 30 second signatures if available"
                  value={apiKeyInputValue}
                  onChange={(e) => setApiKeyInputValue(e.target.value)}
                />
              </div>
            </>
          ) : (
            <>
              <Paragraph>
                This application does not require any permissions to function.
              </Paragraph>
            </>
          )}
        </Card>

        {/* --- Deposit Details Section --- */}
        {checkoutRun.depositOptions.length > 0 ? (
          <Card
            size="small"
            style={{ marginBottom: 20, backgroundColor: "#fbfbfb" }}
          >
            <b>2. Deposit Details</b>
            <br />
            <span style={{ fontSize: "13px", color: "#666" }}>
              The vendor may require a deposit or payment to run the app.
            </span>
            <br />
            <br />
            {selectedDepositOption && (
              <>
                {selectedDepositOption.depositUrlCheckout ? (
                  // Non-crypto payment rail: Show button only
                  <>
                    <div style={{ marginBottom: 16 }}>
                      <label style={{ display: "block", marginBottom: 8 }}>
                        <Space size={4}>
                          Select Deposit Option
                          <Popover
                            content={DepositInfoPopoverContent(
                              "Choose your preferred method for depositing funds to run the app."
                            )}
                            title="Deposit Option Explanation"
                            trigger="hover"
                          >
                            <InfoCircleOutlined
                              style={{ color: "rgba(0,0,0,.45)" }}
                            />
                          </Popover>
                        </Space>
                      </label>
                      <Select
                        value={selectedDepositOption?.title}
                        onChange={handleDepositOptionChange}
                        style={{ width: "100%" }}
                      >
                        {checkoutRun.depositOptions.map((option) => (
                          <Option key={option.title} value={option.title}>
                            {option.title}
                          </Option>
                        ))}
                      </Select>
                    </div>
                    <div style={{ textAlign: "center", marginBottom: 24 }}>
                      <Button
                        type="primary"
                        size="large"
                        onClick={() =>
                          window.open(
                            selectedDepositOption.depositUrlCheckout,
                            "_blank"
                          )
                        }
                        icon={<LinkOutlined />}
                      >
                        Open Payment Link
                      </Button>
                      {selectedDepositOption.explanation && (
                        <Paragraph
                          type="secondary"
                          style={{ fontSize: "13px", marginTop: "12px" }}
                        >
                          {selectedDepositOption.explanation}
                        </Paragraph>
                      )}
                    </div>
                  </>
                ) : (
                  // Crypto payment rails: Show QR and crypto details
                  <Row gutter={[8, 16]} align="top" justify="start">
                    {/* Left Column: QR Code and Instructions */}
                    <Col xs={24} md={8} style={{ textAlign: "center" }}>
                      <Paragraph style={{ marginBottom: "8px" }}>
                        Send{" "}
                        <Text
                          strong
                          style={{
                            borderBottom: "1px dashed #999",
                            cursor: "pointer",
                          }}
                          onClick={() =>
                            window.open(
                              `${selectedDepositOption.chainExplorerUrl}token/${selectedDepositOption.tokenAddress}`,
                              "_blank"
                            )
                          }
                        >
                          {selectedDepositOption.tokenSymbol}
                        </Text>{" "}
                        on{" "}
                        <Text
                          strong
                          style={{
                            borderBottom: "1px dashed #999",
                            cursor: "pointer",
                          }}
                          onClick={() =>
                            window.open(
                              selectedDepositOption.chainExplorerUrl,
                              "_blank"
                            )
                          }
                        >
                          {selectedDepositOption.chain}
                        </Text>
                        :
                      </Paragraph>
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "center",
                          padding: "0px 0",
                        }}
                      >
                        <QRCode
                          value={selectedDepositOption.depositAddress || "-"}
                          size={180}
                          errorLevel="H"
                        />
                      </div>
                    </Col>

                    {/* Right Column: Deposit Input Fields & Select Deposit Option */}
                    <Col xs={24} md={16}>
                      <div style={{ marginBottom: 16 }}>
                        <label style={{ display: "block", marginBottom: 8 }}>
                          <Space size={4}>
                            Select Deposit Option
                            <Popover
                              content={DepositInfoPopoverContent(
                                "Choose your preferred method for depositing funds to run the app."
                              )}
                              title="Deposit Option Explanation"
                              trigger="hover"
                            >
                              <InfoCircleOutlined
                                style={{ color: "rgba(0,0,0,.45)" }}
                              />
                            </Popover>
                          </Space>
                        </label>
                        <Select
                          value={selectedDepositOption?.title}
                          onChange={handleDepositOptionChange}
                          style={{ width: "100%" }}
                        >
                          {checkoutRun.depositOptions.map((option) => (
                            <Option key={option.title} value={option.title}>
                              {option.title}
                            </Option>
                          ))}
                        </Select>
                      </div>

                      <div style={{ marginBottom: 12 }}>
                        <Input
                          readOnly
                          value={selectedDepositOption.depositAddress}
                          addonBefore={
                            <Space size={4}>
                              <Text strong>Deposit Address</Text>{" "}
                              <Popover
                                content={DepositInfoPopoverContent(
                                  "The unique address for the deposit on the selected chain. Click to view on chain explorer."
                                )}
                                title="Deposit Address Explanation"
                                trigger="hover"
                              >
                                <InfoCircleOutlined
                                  style={{ color: "rgba(0,0,0,.45)" }}
                                />
                              </Popover>
                            </Space>
                          }
                          suffix={
                            <Space size={4}>
                              <LinkOutlined
                                style={{ cursor: "pointer", color: "#666" }}
                                onClick={() =>
                                  window.open(
                                    `${selectedDepositOption.chainExplorerUrl}address/${selectedDepositOption.depositAddress}`,
                                    "_blank"
                                  )
                                }
                              />
                              <CopyOutlined
                                style={{ cursor: "pointer", color: "#666" }}
                                onClick={() =>
                                  handleCopy(
                                    selectedDepositOption.depositAddress
                                  )
                                }
                              />
                            </Space>
                          }
                        />
                      </div>

                      <div style={{ marginBottom: 12 }}>
                        <Input
                          readOnly
                          value={`${
                            selectedDepositOption.amount /
                            Math.pow(10, selectedDepositOption.tokenDecimals)
                          } ${selectedDepositOption.tokenSymbol}`}
                          addonBefore={
                            <Space size={4}>
                              <Text strong>Amount</Text>
                              <Popover
                                content={DepositInfoPopoverContent(
                                  "The exact amount of tokens required for this deposit."
                                )}
                                title="Amount Explanation"
                                trigger="hover"
                              >
                                <InfoCircleOutlined
                                  style={{ color: "rgba(0,0,0,.45)" }}
                                />
                              </Popover>
                            </Space>
                          }
                          suffix={
                            <CopyOutlined
                              style={{ cursor: "pointer", color: "#666" }}
                              onClick={() =>
                                handleCopy(
                                  `${
                                    selectedDepositOption.amount /
                                    Math.pow(
                                      10,
                                      selectedDepositOption.tokenDecimals
                                    )
                                  } ${selectedDepositOption.tokenSymbol}`
                                )
                              }
                            />
                          }
                        />
                      </div>

                      {selectedDepositOption.explanation && (
                        <Paragraph
                          type="secondary"
                          style={{ fontSize: "13px", marginTop: "4px" }}
                        >
                          {selectedDepositOption.explanation}
                        </Paragraph>
                      )}
                    </Col>
                    <Col xs={24}>
                      <div style={{ marginBottom: 0 }}>
                        <label style={{ display: "block", marginBottom: 8 }}>
                          <Space size={4}>
                            Transaction Proof
                            <Popover
                              content={DepositInfoPopoverContent(
                                "Enter the transaction hash or a link to the chain explorer for your deposit. This verifies your payment."
                              )}
                              title="Transaction Proof Explanation"
                              trigger="hover"
                            >
                              <InfoCircleOutlined
                                style={{ color: "rgba(0,0,0,.45)" }}
                              />
                            </Popover>
                          </Space>
                          {checkoutRun.depositOptions.length > 0 &&
                            selectedDepositOption && (
                              <Text type="danger">*</Text>
                            )}
                        </label>
                        <Input
                          placeholder="Enter transaction hash or chain explorer link"
                          value={txProofInputValue}
                          onChange={(e) => setTxProofInputValue(e.target.value)}
                        />
                      </div>
                    </Col>
                  </Row>
                )}

                {/* For non-crypto, tx proof is called receipt proof */}
                {selectedDepositOption.depositUrlCheckout && (
                  <div style={{ marginBottom: 0, marginTop: 16 }}>
                    <label style={{ display: "block", marginBottom: 8 }}>
                      <Space size={4}>
                        Receipt Proof
                        <Popover
                          content={DepositInfoPopoverContent(
                            "Enter the receipt details or a link to your payment confirmation for non-crypto transactions."
                          )}
                          title="Receipt Proof Explanation"
                          trigger="hover"
                        >
                          <InfoCircleOutlined
                            style={{ color: "rgba(0,0,0,.45)" }}
                          />
                        </Popover>
                      </Space>
                      {checkoutRun.depositOptions.length > 0 &&
                        selectedDepositOption && <Text type="danger">*</Text>}
                    </label>
                    <Input
                      placeholder="Enter receipt details or payment link"
                      value={txProofInputValue}
                      onChange={(e) => setTxProofInputValue(e.target.value)}
                    />
                  </div>
                )}
              </>
            )}
          </Card>
        ) : (
          <Card
            size="small"
            style={{ marginBottom: 20, backgroundColor: "#fbfbfb" }}
          >
            <b>2. Deposit Details</b>
            <br />
            <span style={{ fontSize: "13px", color: "#666" }}>
              No deposit required.
            </span>
          </Card>
        )}

        {/* Third Section: Preferences (formerly App Requirements) */}
        <Card
          size="small"
          style={{ marginBottom: 20, backgroundColor: "#fbfbfb" }}
        >
          <b>3. Preferences</b>
          <br />
          <span style={{ fontSize: "13px", color: "#666" }}>
            The vendor may require additional information to run the app.
          </span>
          <br />
          <br />
          {checkoutRun.requirements.length > 0 ? (
            checkoutRun.requirements.map((req) => (
              <div key={req.id} style={{ marginBottom: 12 }}>
                <label style={{ display: "block", marginBottom: 8 }}>
                  <Space size={4}>
                    <Text>{req.title}</Text>
                    <Popover
                      content={DepositInfoPopoverContent(req.explanation)}
                      title={`${req.title} Explanation`}
                      trigger="hover"
                    >
                      <InfoCircleOutlined
                        style={{ color: "rgba(0,0,0,.45)" }}
                      />
                    </Popover>
                  </Space>
                  {req.required && <Text type="danger">*</Text>}
                </label>
                {/* Placeholder: Later implement specific input fields based on req.type */}
                <Input
                  placeholder={
                    req.placeholder ||
                    `Enter value for ${req.title} (${req.type})`
                  }
                  value={preferenceInputs[req.id] || ""}
                  onChange={(e) =>
                    handlePreferenceInputChange(req.id, e.target.value)
                  }
                  suffix={req.suffix}
                />
              </div>
            ))
          ) : (
            <Paragraph>No specific preferences for this app.</Paragraph>
          )}
        </Card>

        {/* --- What happens next section --- */}
        <Card
          size="small"
          style={{ marginBottom: 20, backgroundColor: "#fbfbfb" }}
        >
          <Title level={5} style={{ marginBottom: 16 }}>
            What happens next
          </Title>
          <Paragraph>
            After you click "Run App", your request will be securely sent to the
            vendor. The vendor will then process the job based on the details
            you've provided. You'll be able to monitor the status and see the
            progress of your job on the "Job Runs" page, where updates will be
            provided until the goods or services are delivered.
          </Paragraph>
        </Card>
      </div>
    </Drawer>
  );
};

export default RunAppDrawer;

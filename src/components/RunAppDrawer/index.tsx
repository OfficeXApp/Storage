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
import toast from "react-hot-toast";
import {
  CopyOutlined,
  LinkOutlined,
  InfoCircleOutlined,
  CloseOutlined,
  CheckCircleFilled,
  CheckCircleOutlined,
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
  IRequestAuthInstallation,
  IResponseAuthInstallation,
  CheckoutOption,
  IResponseCheckoutInit_Base,
  IResponseCheckoutInit,
  IRequestCheckoutInit,
  IResponseCheckoutInit_Crypto,
  VendorOfferReqField,
  IRequestCheckoutFinalize,
  GenerateID,
  PurchaseStatus,
  IResponseCheckoutFinalize,
  IRequestCheckoutValidate,
  IResponseCheckoutValidate,
  PurchaseID,
} from "@officexapp/types";
import useScreenType from "react-screentype-hook";
import { Link, useNavigate } from "react-router-dom";
import { isValidEmail } from "../../api/helpers";
import { parseUnits } from "viem";
import { createPurchaseAction } from "../../redux-offline/purchases/purchases.actions";
import mixpanel from "mixpanel-browser";

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
    useState<CheckoutOption | null>(
      checkoutRun.checkoutOptions.length > 0
        ? checkoutRun.checkoutOptions[0]
        : null
    );
  const [apiKeyInputValue, setApiKeyInputValue] = useState<string>("");
  const [txProofInputValue, setTxProofInputValue] = useState<string>("");
  const [preferenceInputs, setPreferenceInputs] = useState<
    Record<string, string>
  >({}); // For dynamic requirement inputs
  const [isFinishButtonDisabled, setIsFinishButtonDisabled] =
    useState<boolean>(true);
  const [finalRedirectUrl, setFinalRedirectUrl] = useState<string>("");
  const [finalRedirectCta, setFinalRedirectCta] = useState<string>("");
  const [purchaseId, setPurchaseId] = useState<PurchaseID>("");
  const [isFinalizedCheckout, setIsFinalizedCheckout] =
    useState<boolean>(false);
  const [checkoutInitResponse, setCheckoutInitResponse] =
    useState<IResponseCheckoutInit | null>(null);
  const [email, setEmail] = useState<string>("");
  const [isValidatingLoading, setIsValidatingLoading] =
    useState<boolean>(false);
  const [isFinalizingLoading, setIsFinalizingLoading] =
    useState<boolean>(false);
  const navigate = useNavigate();

  const dispatch = useDispatch();
  const {
    currentProfile,
    generateSignature,
    currentAPIKey,
    currentOrg,
    wrapOrgCode,
  } = useIdentitySystem();
  const [validatedPayment, setValidatedPayment] = useState<boolean>(false);

  useEffect(() => {
    mixpanel.track("Initiate Checkout");
  }, []);

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

      // Check dynamic requirement fields
      checkoutInitResponse?.requirements?.forEach((req) => {
        if (req.required && !preferenceInputs[req.id]?.trim()) {
          allRequiredFieldsFilled = false;
        }
      });

      if (!selectedDepositOption) {
        allRequiredFieldsFilled = false;
      }
      if (!email.trim()) {
        allRequiredFieldsFilled = false;
      }
      if (checkoutInitResponse?.validation_endpoint && !validatedPayment) {
        allRequiredFieldsFilled = false;
      }

      setIsFinishButtonDisabled(!allRequiredFieldsFilled);
    };

    checkFormValidity();
  }, [
    apiKeyInputValue,
    txProofInputValue,
    preferenceInputs,
    checkoutInitResponse,
    validatedPayment,
  ]);

  const handleDepositOptionChange = (value: string) => {
    const selected = checkoutRun.checkoutOptions.find(
      (option) => option.title === value
    );
    setSelectedDepositOption(selected || null);
    setCheckoutInitResponse(null);
    setTxProofInputValue(""); // Clear txProof when deposit option changes
  };

  const handlePreferenceInputChange = (id: string, value: string) => {
    setPreferenceInputs((prev) => ({ ...prev, [id]: value }));
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success(<span>Copied to clipboard!</span>);
  };

  const handleSubmit = async () => {
    if (!checkoutInitResponse) return;
    setIsFinalizingLoading(true);
    toast(<span>Finalizing checkout... This can take up to 2 mins...</span>);
    try {
      // create the purchase record
      const purchase_id = GenerateID.PurchaseID();

      const payload_finalize_checkout: IRequestCheckoutFinalize = {
        checkout_flow_id: checkoutInitResponse?.checkout_flow_id || "",
        checkout_session_id: checkoutInitResponse?.checkout_session_id || "",
        officex_purchase_id: purchase_id,
        note: "", // depends on vendor server,
        tracer: checkoutInitResponse.tracer || "",
        proxy_buyer_data: {
          org_id: currentOrg?.driveID || "",
          org_host: currentOrg?.host || "",
          user_id: currentProfile?.userID || "",
        },
        sweep_tokens: (checkoutInitResponse as IResponseCheckoutInit_Crypto)
          .crypto_checkout.token_address
          ? [
              (checkoutInitResponse as IResponseCheckoutInit_Crypto)
                .crypto_checkout.token_address,
            ]
          : [],
      };
      const response_finalize_checkout = await fetch(
        checkoutInitResponse?.finalization_endpoint || "",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload_finalize_checkout),
        }
      );
      const data_finalize_checkout: IResponseCheckoutFinalize =
        await response_finalize_checkout.json();

      if (!data_finalize_checkout.success) {
        toast.error(
          <span>
            Failed to finalize checkout | {data_finalize_checkout.message}
          </span>
        );
        setIsFinalizingLoading(false);
        return;
      }
      const receipt = data_finalize_checkout.receipt;
      dispatch(
        createPurchaseAction({
          id: purchase_id,
          title: receipt?.title || checkoutRun.offerName,
          vendor_name: receipt?.vendor_name || checkoutRun.vendorName,
          vendor_id: receipt?.vendor_id || checkoutRun.vendorID,
          about_url:
            receipt?.about_url ||
            checkoutRun.aboutUrl ||
            "https://google.com?search=officex",
          status: receipt?.status || PurchaseStatus.PAID,
          description: receipt?.description || checkoutRun.offerDescription,
          pricing: receipt?.pricing || checkoutRun.priceLine,
          notes: `From checkout init route ${selectedDepositOption?.checkout_init_endpoint} with checkout session id ${checkoutInitResponse?.checkout_session_id}`,
          tracer: checkoutInitResponse?.tracer || "",
          labels: [],
          delivery_url:
            receipt?.delivery_url || receipt?.skip_to_final_redirect || "",
          billing_url:
            receipt?.billing_url ||
            checkoutRun.aboutUrl ||
            "https://google.com?search=officex",
          support_url:
            receipt?.support_url ||
            checkoutRun.aboutUrl ||
            "https://google.com?search=officex",
          subtitle: receipt?.subtitle || "",
          vendor_notes: receipt?.vendor_notes || "",
        })
      );

      let finalApiKey = apiKeyInputValue;
      if (checkoutInitResponse?.post_payment.auth_installation_url) {
        if (!finalApiKey) {
          message.loading(<span>Generating quick signature...</span>, 0);
          finalApiKey = await generateSignature();
          if (finalApiKey) {
            message.destroy();
            toast.success(<span>Signature generated!</span>);
          } else {
            toast.error(
              <span>
                Did not provide API key and failed to generate signature
              </span>
            );
            setIsFinalizingLoading(false);
            return;
          }
        }
      }

      if (
        checkoutInitResponse.post_payment.auth_installation_url &&
        finalApiKey
      ) {
        const payload: IRequestAuthInstallation = {
          checkout_session_id: checkoutInitResponse.checkout_session_id,
          requirements: preferenceInputs, // All dynamic form fields go here
          org_id: currentOrg?.driveID,
          org_host: currentOrg?.host,
          org_api_key: finalApiKey,
          user_id: currentProfile?.userID,
        };
        const response = await fetch(
          checkoutInitResponse?.post_payment?.auth_installation_url || "",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(payload),
          }
        );
        if (!response.ok) {
          // Handle HTTP errors
          const errorData = await response.json(); // Attempt to parse error message from response body
          setIsFinalizingLoading(false);
          throw new Error(errorData.message || "Network response was not ok.");
        }
        const data: IResponseAuthInstallation = await response.json();
      }

      toast.success(
        <span>
          Checkout successful! View your{" "}
          <Link to={wrapOrgCode(`/resources/purchases`)}>purchase history</Link>
        </span>
      );
      setFinalRedirectUrl(
        data_finalize_checkout.receipt?.skip_to_final_redirect ||
          `${window.location.origin}/org/current/resources/purchases`
      );
      setFinalRedirectCta(
        data_finalize_checkout.receipt?.skip_to_final_cta ||
          checkoutInitResponse.final_cta ||
          "View Purchase History"
      );
      setPurchaseId(purchase_id);
      setIsFinalizedCheckout(true);
      setIsFinalizingLoading(false);
    } catch (error: any) {
      console.error("Submission failed:", error);
      // Display the error message from the caught error, or a generic one
      toast.error(
        <span>
          Submission failed: {error.message || "An unexpected error occurred."}
        </span>
      );
      setIsFinalizingLoading(false);
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

  const renderVideo = () => {
    if (!checkoutRun.checkoutVideo) return null;
    const videoUrl = checkoutRun.checkoutVideo;
    if (videoUrl.includes("youtube.com") || videoUrl.includes("youtu.be")) {
      return (
        <div style={{ marginBottom: 16 }}>
          <iframe
            width="100%"
            height="315"
            src={videoUrl}
            title="YouTube video player"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            referrerPolicy="strict-origin-when-cross-origin"
            allowFullScreen
          ></iframe>
        </div>
      );
    } else {
      return (
        <div style={{ marginBottom: 16 }}>
          <video
            src={checkoutRun.checkoutVideo}
            controls
            style={{ width: "100%" }}
          />
        </div>
      );
    }
  };

  const initiateCheckout = async () => {
    if (
      !selectedDepositOption ||
      !selectedDepositOption.checkout_init_endpoint
    ) {
      toast.error(<span>Error | No checkout init endpoint found</span>);
      return;
    }
    try {
      const payload: IRequestCheckoutInit = {
        checkout_flow_id: selectedDepositOption.checkout_flow_id,
        org_id: currentOrg?.driveID || "",
        user_id: currentProfile?.userID || "",
        host: currentOrg?.host || "",
        email,
      };
      const response = await fetch(
        selectedDepositOption.checkout_init_endpoint,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }
      );
      const data = await response.json();
      if (data) {
        setCheckoutInitResponse(data);
        const initialPreferenceInputs: Record<string, string> = {};
        data.requirements.forEach((req: VendorOfferReqField) => {
          if (req.defaultValue !== undefined && req.defaultValue !== null) {
            initialPreferenceInputs[req.id] = String(req.defaultValue);
          }
        });
        setPreferenceInputs(initialPreferenceInputs);
        toast(<span>Checkout has begun, please proceed with payment</span>);
      }
    } catch (error) {
      console.error("Error initiating checkout:", error);
    }
  };

  const validatePayment = async () => {
    mixpanel.track("Validate Payment");
    setIsValidatingLoading(true);
    try {
      const payload: IRequestCheckoutValidate = {
        checkout_flow_id: checkoutInitResponse?.checkout_flow_id || "",
        checkout_session_id: checkoutInitResponse?.checkout_session_id || "",
        note: "", // depends on vendor server,
        tracer: checkoutInitResponse?.tracer || "",
      };
      const response = await fetch(
        checkoutInitResponse?.validation_endpoint || "",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }
      );
      const data: IResponseCheckoutValidate = await response.json();
      if (data.success) {
        setValidatedPayment(true);
        toast.success(
          <span>
            Validated | You may now proceed to finalizing the purchase
          </span>
        );
      } else {
        toast.error(<span>{data.message}</span>);
        setValidatedPayment(false);
      }
    } catch (error) {
      console.error("Error validating payment:", error);
      toast.error(<span>Error validating payment</span>);
    } finally {
      setIsValidatingLoading(false);
    }
  };

  const handleFinalRedirect = () => {
    // open in new tab
    if (finalRedirectUrl) {
      window.open(finalRedirectUrl, "_blank");
    }
  };

  const shouldShowAuthSection =
    checkoutInitResponse &&
    checkoutInitResponse.post_payment.auth_installation_url;

  const shouldShowWhatHappensNext =
    (checkoutInitResponse &&
      checkoutInitResponse?.validation_endpoint &&
      validatedPayment) ||
    (checkoutInitResponse &&
      !checkoutInitResponse?.validation_endpoint &&
      checkoutInitResponse?.finalization_endpoint) ||
    (checkoutInitResponse &&
      !checkoutInitResponse?.validation_endpoint &&
      !checkoutInitResponse?.finalization_endpoint);

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
      styles={{
        body: { paddingBottom: 80 },
        footer: {
          position: "sticky",
          bottom: 0,
          width: "100%",
          padding: "16px 24px",
          background: "#fff",
          borderTop: "1px solid #f0f0f0",
          zIndex: 10,
          display: "flex",
          justifyContent: "space-between",
        },
      }}
      footer={
        <Space style={{ width: "100%", justifyContent: "space-between" }}>
          <Button onClick={onCloseDrawer}>Close</Button>

          <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
            <span
              onClick={() => {
                // open in new tab aboutUrl
                window.open(checkoutRun.aboutUrl, "_blank");
              }}
              style={{
                cursor: "pointer",
                color: "rgba(0,0,0,0.3)",
              }}
            >
              Customer Support
            </span>
            {checkoutInitResponse?.post_payment?.needs_cloud_officex &&
              !currentOrg?.host && (
                <span style={{ color: "#ff0000" }}>Connect Cloud</span>
              )}
            {finalRedirectUrl && finalRedirectCta && isFinalizedCheckout ? (
              <Button
                type="primary"
                onClick={() => {
                  window.open(
                    `${window.location.origin}${wrapOrgCode(`/resources/purchases/${purchaseId}`)}`,
                    "_blank"
                  );
                }}
                disabled={isFinishButtonDisabled}
                ghost
              >
                View Purchase History
              </Button>
            ) : shouldShowWhatHappensNext ? (
              <Button
                type="primary"
                ghost
                onClick={handleSubmit}
                disabled={isFinishButtonDisabled}
                loading={isFinalizingLoading}
              >
                {checkoutInitResponse?.final_cta || "Finish"}
              </Button>
            ) : null}
          </div>
        </Space>
      }
    >
      <div>
        {/* First Section: Offer Name and Description */}
        <div style={{ marginBottom: 20 }}>
          <Title level={4} style={{ margin: 0 }}>
            {checkoutRun.offerName}
          </Title>
          <Text color="blue" italic>
            {checkoutRun.priceLine}
          </Text>
          <div
            dangerouslySetInnerHTML={{ __html: checkoutRun.offerDescription }}
            style={{ marginTop: 10 }}
          />
        </div>

        {renderVideo()}

        {/* --- Deposit Details Section --- */}
        {checkoutRun.checkoutOptions.length > 0 ? (
          <Card
            size="small"
            style={{ marginBottom: 20, backgroundColor: "#fbfbfb" }}
          >
            <b>1. Payment Method</b>
            <br />
            <span style={{ fontSize: "13px", color: "#666" }}>
              The vendor may require a deposit or payment to run the app.
            </span>
            <br />
            <br />
            <div style={{ marginBottom: 0 }}>
              <label style={{ display: "block", marginBottom: 8 }}>
                <Space size={4}>
                  Select Payment Option
                  <Popover
                    content={DepositInfoPopoverContent(
                      "Choose your preferred method for depositing funds to run the app."
                    )}
                    trigger="hover"
                  >
                    <InfoCircleOutlined style={{ color: "rgba(0,0,0,.45)" }} />
                  </Popover>
                </Space>
              </label>
              <Select
                value={selectedDepositOption?.title}
                onChange={handleDepositOptionChange}
                style={{ width: "100%" }}
                disabled={validatedPayment}
              >
                {checkoutRun.checkoutOptions.map((option) => (
                  <Option key={option.title} value={option.title}>
                    <Popover
                      content={
                        <span
                          style={{ maxWidth: "200px", whiteSpace: "pre-wrap" }}
                        >
                          {option.vendor_notes ||
                            option.vendor_disclaimer ||
                            ""}
                        </span>
                      }
                    >
                      <InfoCircleOutlined
                        style={{
                          color: "rgba(0,0,0,.45)",
                          marginRight: "8px",
                        }}
                      />
                    </Popover>
                    {option.title}
                  </Option>
                ))}
              </Select>
              {selectedDepositOption?.vendor_disclaimer &&
                !checkoutInitResponse && (
                  <Alert
                    message={
                      <div>
                        <span>
                          {selectedDepositOption?.vendor_disclaimer || ""}
                        </span>
                        <br />

                        {selectedDepositOption?.requires_email_for_init && (
                          <>
                            <br />
                            <Input
                              type="email"
                              onChange={(e) => setEmail(e.target.value)}
                              placeholder="Enter your email"
                              value={email}
                              bordered={false}
                              style={{
                                width: "100%",
                                backgroundColor: "#f6fbff",
                              }}
                            />
                          </>
                        )}
                      </div>
                    }
                    type="info"
                    style={{ marginTop: 8 }}
                  />
                )}
              {((selectedDepositOption &&
                selectedDepositOption.requires_email_for_init &&
                isValidEmail(email) &&
                !checkoutInitResponse) ||
                (selectedDepositOption &&
                  !selectedDepositOption.requires_email_for_init)) && (
                <div
                  style={{ width: "100%", textAlign: "center", marginTop: 8 }}
                >
                  <Button
                    block
                    size="large"
                    type="primary"
                    onClick={initiateCheckout}
                  >
                    Begin Checkout
                  </Button>
                  <i
                    style={{
                      fontSize: "0.7rem",
                      color: "#b1b1b1",
                    }}
                  >
                    By clicking "Begin Checkout", you agree to the vendor's{" "}
                    <a
                      href={checkoutRun.terms_of_service_url}
                      target="_blank"
                      style={{
                        color: "rgb(177, 177, 177)",
                        textDecoration: "dashed underline",
                      }}
                    >
                      terms and conditions.
                    </a>
                  </i>
                </div>
              )}
              {checkoutInitResponse && (
                <div style={{ marginTop: 16 }}>
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
                          `${(checkoutInitResponse as IResponseCheckoutInit_Crypto).crypto_checkout.chain_explorer_url}/token/${(checkoutInitResponse as IResponseCheckoutInit_Crypto).crypto_checkout.token_address}`,
                          "_blank"
                        )
                      }
                    >
                      {
                        (checkoutInitResponse as IResponseCheckoutInit_Crypto)
                          .crypto_checkout.token_symbol
                      }
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
                          (checkoutInitResponse as IResponseCheckoutInit_Crypto)
                            .crypto_checkout.chain_explorer_url,
                          "_blank"
                        )
                      }
                    >
                      {
                        (checkoutInitResponse as IResponseCheckoutInit_Crypto)
                          .crypto_checkout.chain
                      }
                    </Text>
                    :
                  </Paragraph>
                  <Row gutter={[8, 16]} align="top" justify="start">
                    {/* Left Column: QR Code and Instructions */}
                    <Col xs={24} md={8} style={{ textAlign: "center" }}>
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "center",
                          padding: "0px 0",
                        }}
                      >
                        <QRCode
                          value={
                            (
                              checkoutInitResponse as IResponseCheckoutInit_Crypto
                            ).crypto_checkout.receiving_address || "-"
                          }
                          size={180}
                          errorLevel="H"
                          icon={checkoutRun.vendorAvatar}
                        />
                      </div>
                    </Col>

                    {/* Right Column: Deposit Input Fields & Select Deposit Option */}
                    <Col xs={24} md={16}>
                      <div style={{ marginTop: 4, marginBottom: 12 }}>
                        <Input
                          readOnly
                          disabled={validatedPayment}
                          value={
                            (
                              checkoutInitResponse as IResponseCheckoutInit_Crypto
                            ).crypto_checkout.receiving_address
                          }
                          addonBefore={
                            <Space size={4}>
                              <Text strong>Receiver</Text>{" "}
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
                                    `${
                                      (
                                        checkoutInitResponse as IResponseCheckoutInit_Crypto
                                      ).crypto_checkout.chain_explorer_url
                                    }/address/${
                                      (
                                        checkoutInitResponse as IResponseCheckoutInit_Crypto
                                      ).crypto_checkout.receiving_address
                                    }`,
                                    "_blank"
                                  )
                                }
                              />
                              <CopyOutlined
                                style={{ cursor: "pointer", color: "#666" }}
                                onClick={() =>
                                  handleCopy(
                                    (
                                      checkoutInitResponse as IResponseCheckoutInit_Crypto
                                    ).crypto_checkout.receiving_address
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
                          disabled={validatedPayment}
                          value={`${
                            (
                              checkoutInitResponse as IResponseCheckoutInit_Crypto
                            ).crypto_checkout.suggested_amount_decimals
                          }`}
                          min={
                            (
                              checkoutInitResponse as IResponseCheckoutInit_Crypto
                            ).crypto_checkout.minimum_amount_decimals
                          }
                          max={
                            (
                              checkoutInitResponse as IResponseCheckoutInit_Crypto
                            ).crypto_checkout.maximum_amount_decimals
                          }
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
                            <span>
                              {
                                (
                                  checkoutInitResponse as IResponseCheckoutInit_Crypto
                                ).crypto_checkout.token_symbol
                              }
                              <CopyOutlined
                                style={{
                                  cursor: "pointer",
                                  color: "#666",
                                  marginLeft: 4,
                                }}
                                onClick={() =>
                                  handleCopy(
                                    (
                                      checkoutInitResponse as IResponseCheckoutInit_Crypto
                                    ).crypto_checkout.suggested_amount_decimals.toString()
                                  )
                                }
                              />
                            </span>
                          }
                        />
                      </div>

                      {(checkoutInitResponse as IResponseCheckoutInit_Crypto)
                        .vendor_disclaimer && (
                        <Paragraph
                          type="secondary"
                          style={{ fontSize: "13px", marginTop: "4px" }}
                        >
                          {
                            (
                              checkoutInitResponse as IResponseCheckoutInit_Crypto
                            ).vendor_disclaimer
                          }
                        </Paragraph>
                      )}
                    </Col>
                    {/* <Col xs={24}>
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
                          {checkoutRun.checkoutOptions.length > 0 &&
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
                    </Col> */}
                  </Row>
                </div>
              )}
              {checkoutInitResponse &&
                checkoutInitResponse.validation_endpoint && (
                  <div
                    style={{
                      marginTop: 16,
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                    }}
                  >
                    {validatedPayment ? (
                      <Button block type="default" disabled size="large">
                        <CheckCircleOutlined /> Successful Payment
                      </Button>
                    ) : (
                      <Button
                        block
                        type="primary"
                        size="large"
                        onClick={validatePayment}
                        loading={isValidatingLoading}
                      >
                        Validate Transaction
                      </Button>
                    )}
                    <i
                      style={{
                        fontSize: "0.7rem",
                        color: "#b1b1b1",
                        marginTop: 4,
                      }}
                    >
                      {validatedPayment
                        ? `Click "${checkoutInitResponse.final_cta || "Finish"}" to complete the checkout`
                        : `Click "Validate Transaction" to check if your payment
                      succeeded`}
                    </i>
                  </div>
                )}
            </div>
          </Card>
        ) : (
          <Card
            size="small"
            style={{ marginBottom: 20, backgroundColor: "#fbfbfb" }}
          >
            <b>1. Payment Method</b>
            <br />
            <span style={{ fontSize: "13px", color: "#666" }}>
              No payment required.
            </span>
          </Card>
        )}

        {/* --- Security Section --- */}
        {shouldShowAuthSection && (
          <Card
            size="small"
            style={{ marginBottom: 20, backgroundColor: "#fbfbfb" }}
          >
            <b>2. Security & Verification</b>
            <br />
            {checkoutInitResponse?.post_payment?.auth_installation_url ? (
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
                        It's crucial to verify that this vendor offer is who
                        they claim to be. Always check their credentials and the
                        code being executed.
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
                            href={
                              checkoutInitResponse?.post_payment
                                ?.verify_installation_url || ""
                            }
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
                            Learn more about 3rd party app verification on
                            OfficeX{" "}
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
                <span style={{ fontSize: "13px", color: "#666" }}>
                  This application does not require any permissions to function.
                </span>
              </>
            )}
          </Card>
        )}

        {/* Third Section: Preferences (formerly App Requirements) */}
        {checkoutInitResponse?.requirements?.length &&
        checkoutInitResponse?.requirements?.length > 0 ? (
          <Card
            size="small"
            style={{ marginBottom: 20, backgroundColor: "#fbfbfb" }}
          >
            <b>3. Additional Details</b>
            <br />
            <span style={{ fontSize: "13px", color: "#666" }}>
              The vendor may require additional information to run the app.
            </span>
            <br />
            <br />
            {checkoutInitResponse?.requirements?.length > 0 ? (
              checkoutInitResponse?.requirements?.map((req) => (
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
              <Paragraph>No additional details required.</Paragraph>
            )}
          </Card>
        ) : null}

        {checkoutInitResponse?.validation_endpoint && !validatedPayment ? (
          <Divider>
            <span
              style={{
                fontSize: "0.8rem",
                color: "#999",
                fontWeight: "normal",
                fontStyle: "italic",
              }}
            >
              Please validate your payment before finalizing checkout
            </span>
          </Divider>
        ) : null}

        {/* --- What happens next section --- */}
        {shouldShowWhatHappensNext ? (
          <Card
            size="small"
            style={{ marginBottom: 20, backgroundColor: "#fbfbfb" }}
          >
            <Title level={5} style={{ marginBottom: 16 }}>
              What happens next
            </Title>
            <Paragraph>
              After you click{" "}
              {`"${checkoutInitResponse?.final_cta}"` || "Finish"}, your request
              will be securely sent to the vendor. The vendor will then process
              the purchase based on the details you've provided. You'll be able
              to monitor the status and see the progress of your purchase on the{" "}
              <Link to={wrapOrgCode(`/resources/purchases`)} target="_blank">
                Purchase History Page
              </Link>
              , where updates will be provided until the goods or services are
              delivered.
            </Paragraph>
          </Card>
        ) : null}
        {shouldShowWhatHappensNext && !isFinalizedCheckout && (
          <div
            style={{
              width: "100%",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <Button
              block
              type="primary"
              size="large"
              disabled={isFinishButtonDisabled}
              onClick={handleSubmit}
              loading={isFinalizingLoading}
            >
              {checkoutInitResponse?.final_cta || "Finish"}
            </Button>
            <i
              style={{
                fontSize: "0.7rem",
                color: "#b1b1b1",
                marginTop: 8,
              }}
            >
              {`Fill in all required fields to complete the checkout`}
            </i>
          </div>
        )}
        {finalRedirectUrl && finalRedirectCta && isFinalizedCheckout && (
          <>
            <Alert
              message="🎉 Checkout Completed - View Your Purchase"
              type="success"
              style={{ textAlign: "center" }}
            />
            <Button
              block
              type="primary"
              size="large"
              disabled={isFinishButtonDisabled}
              onClick={handleFinalRedirect}
              loading={isFinalizingLoading}
              style={{ marginTop: 8 }}
            >
              {finalRedirectCta}
            </Button>
          </>
        )}
      </div>
    </Drawer>
  );
};

export default RunAppDrawer;

// {
//   selectedDepositOption && (
//     <>
//       {selectedDepositOption.depositUrlCheckout ? (
//         // Non-crypto payment rail: Show button only
//         <>
//           <div style={{ marginBottom: 16 }}>
//             <label style={{ display: "block", marginBottom: 8 }}>
//               <Space size={4}>
//                 Select Deposit Option
//                 <Popover
//                   content={DepositInfoPopoverContent(
//                     "Choose your preferred method for depositing funds to run the app."
//                   )}
//                   title="Deposit Option Explanation"
//                   trigger="hover"
//                 >
//                   <InfoCircleOutlined style={{ color: "rgba(0,0,0,.45)" }} />
//                 </Popover>
//               </Space>
//             </label>
//             <Select
//               value={selectedDepositOption?.title}
//               onChange={handleDepositOptionChange}
//               style={{ width: "100%" }}
//             >
//               {checkoutRun.checkoutOptions.map((option) => (
//                 <Option key={option.title} value={option.title}>
//                   {option.title}
//                 </Option>
//               ))}
//             </Select>
//           </div>
//           <div style={{ textAlign: "center", marginBottom: 24 }}>
//             <Button
//               type="primary"
//               size="large"
//               onClick={() =>
//                 window.open(selectedDepositOption.depositUrlCheckout, "_blank")
//               }
//               block
//               icon={<LinkOutlined />}
//             >
//               Open Payment Link
//             </Button>
//             {selectedDepositOption.vendor_disclaimer && (
//               <Paragraph
//                 type="secondary"
//                 style={{ fontSize: "13px", marginTop: "12px" }}
//               >
//                 {selectedDepositOption.vendor_disclaimer}
//               </Paragraph>
//             )}
//           </div>
//         </>
//       ) : (
//         // Crypto payment rails: Show QR and crypto details
//         <Row gutter={[8, 16]} align="top" justify="start">
//           {/* Left Column: QR Code and Instructions */}
//           <Col xs={24} md={8} style={{ textAlign: "center" }}>
//             <Paragraph style={{ marginBottom: "8px" }}>
//               Send{" "}
//               <Text
//                 strong
//                 style={{
//                   borderBottom: "1px dashed #999",
//                   cursor: "pointer",
//                 }}
//                 onClick={() =>
//                   window.open(
//                     `${selectedDepositOption.chainExplorerUrl}token/${selectedDepositOption.tokenAddress}`,
//                     "_blank"
//                   )
//                 }
//               >
//                 {selectedDepositOption.tokenSymbol}
//               </Text>{" "}
//               on{" "}
//               <Text
//                 strong
//                 style={{
//                   borderBottom: "1px dashed #999",
//                   cursor: "pointer",
//                 }}
//                 onClick={() =>
//                   window.open(selectedDepositOption.chainExplorerUrl, "_blank")
//                 }
//               >
//                 {selectedDepositOption.chain}
//               </Text>
//               :
//             </Paragraph>
//             <div
//               style={{
//                 display: "flex",
//                 justifyContent: "center",
//                 padding: "0px 0",
//               }}
//             >
//               <QRCode
//                 value={selectedDepositOption.depositAddress || "-"}
//                 size={180}
//                 errorLevel="H"
//                 icon={checkoutRun.vendorAvatar}
//               />
//             </div>
//           </Col>

//           {/* Right Column: Deposit Input Fields & Select Deposit Option */}
//           <Col xs={24} md={16}>
//             <div style={{ marginBottom: 16 }}>
//               <label style={{ display: "block", marginBottom: 8 }}>
//                 <Space size={4}>
//                   Select Deposit Option
//                   <Popover
//                     content={DepositInfoPopoverContent(
//                       "Choose your preferred method for depositing funds to run the app."
//                     )}
//                     title="Deposit Option Explanation"
//                     trigger="hover"
//                   >
//                     <InfoCircleOutlined style={{ color: "rgba(0,0,0,.45)" }} />
//                   </Popover>
//                 </Space>
//               </label>
//               <Select
//                 value={selectedDepositOption?.title}
//                 onChange={handleDepositOptionChange}
//                 style={{ width: "100%" }}
//               >
//                 {checkoutRun.checkoutOptions.map((option) => (
//                   <Option key={option.title} value={option.title}>
//                     {option.title}
//                   </Option>
//                 ))}
//               </Select>
//             </div>

//             <div style={{ marginBottom: 12 }}>
//               <Input
//                 readOnly
//                 value={selectedDepositOption.depositAddress}
//                 addonBefore={
//                   <Space size={4}>
//                     <Text strong>Deposit Address</Text>{" "}
//                     <Popover
//                       content={DepositInfoPopoverContent(
//                         "The unique address for the deposit on the selected chain. Click to view on chain explorer."
//                       )}
//                       title="Deposit Address Explanation"
//                       trigger="hover"
//                     >
//                       <InfoCircleOutlined
//                         style={{ color: "rgba(0,0,0,.45)" }}
//                       />
//                     </Popover>
//                   </Space>
//                 }
//                 suffix={
//                   <Space size={4}>
//                     <LinkOutlined
//                       style={{ cursor: "pointer", color: "#666" }}
//                       onClick={() =>
//                         window.open(
//                           `${selectedDepositOption.chainExplorerUrl}address/${selectedDepositOption.depositAddress}`,
//                           "_blank"
//                         )
//                       }
//                     />
//                     <CopyOutlined
//                       style={{ cursor: "pointer", color: "#666" }}
//                       onClick={() =>
//                         handleCopy(selectedDepositOption.depositAddress)
//                       }
//                     />
//                   </Space>
//                 }
//               />
//             </div>

//             <div style={{ marginBottom: 12 }}>
//               <Input
//                 readOnly
//                 value={`${
//                   selectedDepositOption.amount /
//                   Math.pow(10, selectedDepositOption.tokenDecimals)
//                 }`}
//                 addonBefore={
//                   <Space size={4}>
//                     <Text strong>Amount</Text>
//                     <Popover
//                       content={DepositInfoPopoverContent(
//                         "The exact amount of tokens required for this deposit."
//                       )}
//                       title="Amount Explanation"
//                       trigger="hover"
//                     >
//                       <InfoCircleOutlined
//                         style={{ color: "rgba(0,0,0,.45)" }}
//                       />
//                     </Popover>
//                   </Space>
//                 }
//                 suffix={
//                   <span>
//                     {selectedDepositOption.tokenSymbol}
//                     <CopyOutlined
//                       style={{
//                         cursor: "pointer",
//                         color: "#666",
//                         marginLeft: 4,
//                       }}
//                       onClick={() =>
//                         handleCopy(
//                           `${
//                             selectedDepositOption.amount /
//                             Math.pow(10, selectedDepositOption.tokenDecimals)
//                           }`
//                         )
//                       }
//                     />
//                   </span>
//                 }
//               />
//             </div>

//             {selectedDepositOption.vendor_disclaimer && (
//               <Paragraph
//                 type="secondary"
//                 style={{ fontSize: "13px", marginTop: "4px" }}
//               >
//                 {selectedDepositOption.vendor_disclaimer}
//               </Paragraph>
//             )}
//           </Col>
//           <Col xs={24}>
//             <div style={{ marginBottom: 0 }}>
//               <label style={{ display: "block", marginBottom: 8 }}>
//                 <Space size={4}>
//                   Transaction Proof
//                   <Popover
//                     content={DepositInfoPopoverContent(
//                       "Enter the transaction hash or a link to the chain explorer for your deposit. This verifies your payment."
//                     )}
//                     title="Transaction Proof Explanation"
//                     trigger="hover"
//                   >
//                     <InfoCircleOutlined style={{ color: "rgba(0,0,0,.45)" }} />
//                   </Popover>
//                 </Space>
//                 {checkoutRun.checkoutOptions.length > 0 &&
//                   selectedDepositOption && <Text type="danger">*</Text>}
//               </label>
//               <Input
//                 placeholder="Enter transaction hash or chain explorer link"
//                 value={txProofInputValue}
//                 onChange={(e) => setTxProofInputValue(e.target.value)}
//               />
//             </div>
//           </Col>
//         </Row>
//       )}

//       {selectedDepositOption.depositUrlCheckout && (
//         <div style={{ marginBottom: 0, marginTop: 16 }}>
//           <label style={{ display: "block", marginBottom: 8 }}>
//             <Space size={4}>
//               Receipt Proof
//               <Popover
//                 content={DepositInfoPopoverContent(
//                   "Enter the receipt details or a link to your payment confirmation for non-crypto transactions."
//                 )}
//                 title="Receipt Proof Explanation"
//                 trigger="hover"
//               >
//                 <InfoCircleOutlined style={{ color: "rgba(0,0,0,.45)" }} />
//               </Popover>
//             </Space>
//             {checkoutRun.checkoutOptions.length > 0 &&
//               selectedDepositOption && <Text type="danger">*</Text>}
//           </label>
//           <Input
//             placeholder="Provide verification text"
//             value={txProofInputValue}
//             onChange={(e) => setTxProofInputValue(e.target.value)}
//           />
//         </div>
//       )}
//     </>
//   );
// }

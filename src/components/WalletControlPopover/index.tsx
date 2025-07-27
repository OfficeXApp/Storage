import {
  CopyOutlined,
  EyeInvisibleOutlined,
  EyeOutlined,
  SettingOutlined,
  LinkOutlined, // For the chain explorer link
  InfoCircleOutlined,
  CloseOutlined, // For the tooltip icon
} from "@ant-design/icons";
import TagCopy from "../TagCopy";
import {
  Card,
  Input,
  Popover,
  QRCode,
  Space,
  Statistic,
  Tabs,
  Button,
  Select,
  Popconfirm,
  message, // For success/error messages
  Tooltip, // For the balance tooltip
} from "antd";
import { useIdentitySystem } from "../../framework/identity";
import { useState } from "react";

const { Option } = Select;
const { TextArea } = Input; // For the signed note

const WalletControlPopover = () => {
  const { currentProfile, currentOrg, currentAPIKey } = useIdentitySystem();
  const [showBalance, setShowBalance] = useState(false);
  const [receiverAddress, setReceiverAddress] = useState("");
  const [amount, setAmount] = useState(0);
  const [currency, setCurrency] = useState("ETH");
  const [customTokenAddress, setCustomTokenAddress] = useState(""); // New state for custom token address
  const [signedNote, setSignedNote] = useState("");
  const [rpcProviderUrl, setRpcProviderUrl] = useState("");
  const [privateKeyPassword, setPrivateKeyPassword] = useState("");
  const [seedPhrasePassword, setSeedPhrasePassword] = useState("");
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);

  const handleSend = () => {
    // Implement your sending logic here
    console.log({
      receiverAddress,
      amount,
      currency,
      signedNote,
      customTokenAddress,
    });
    message.success("Transaction initiated (simulated)");
    // Reset form fields after sending
    setReceiverAddress("");
    setAmount(0);
    setSignedNote("");
    setCustomTokenAddress("");
  };

  // Mock token balances - replace with actual fetched data
  const tokenBalances = [
    { name: "Ethereum", value: 1.234567, symbol: "ETH", contract: "0x..." },
    {
      name: "USD Coin",
      value: 500.75,
      symbol: "USDC",
      contract: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
    },
    {
      name: "Tether USD",
      value: 250.0,
      symbol: "USDT",
      contract: "0xdAC17F958D2ee523a2206206994597C13D831ec7",
    },
  ];

  const getBalanceForSelectedCurrency = () => {
    if (currency === "Other") {
      // You would fetch the balance for the custom token address here
      return 0.0; // Placeholder
    }
    const token = tokenBalances.find((t) => t.symbol === currency);
    return token ? token.value : 0.0;
  };

  const tabItems = [
    {
      key: "receive",
      label: "Receive",
      children: (
        <div
          style={{
            width: "100%",
            minWidth: "100%",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "8px",
          }}
        >
          <b>Receive Money</b>
          <Button
            type="text"
            icon={<CloseOutlined />}
            size="small"
            onClick={() => setIsPopoverOpen(false)}
            style={{
              position: "absolute",
              top: "0px", // Adjust as needed
              right: "0px", // Adjust as needed
              fontSize: "12px",
              padding: "0",
              height: "auto",
              color: "rgba(0,0,0,0.3)",
            }}
          />
          <QRCode
            value={currentProfile?.evmPublicKey || "-"}
            icon="https://strapi.mewapi.io/uploads/large_Base_Symbol_Blue_ee3f3fb0a5.png"
          />
          <Input
            placeholder="-"
            value={currentProfile?.evmPublicKey}
            addonBefore={
              <span style={{ fontSize: "0.8rem" }}>
                <LinkOutlined style={{ marginRight: "8px" }} />
                BaseL2
              </span>
            }
            suffix={
              <CopyOutlined
                onClick={() => {
                  navigator.clipboard.writeText(
                    currentProfile?.evmPublicKey || ""
                  );
                }}
              />
            }
            style={{ width: "100%" }}
          />
        </div>
      ),
    },
    {
      key: "send",
      label: "Send",
      children: (
        <div
          style={{
            width: "100%",
            minWidth: "100%",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "8px",
          }}
        >
          <b style={{ width: "100%", textAlign: "center" }}>Send Money</b>
          <Button
            type="text"
            icon={<CloseOutlined />}
            size="small"
            onClick={() => setIsPopoverOpen(false)}
            style={{
              position: "absolute",
              top: "0px", // Adjust as needed
              right: "0px", // Adjust as needed
              fontSize: "12px",
              padding: "0",
              height: "auto",
              color: "rgba(0,0,0,0.3)",
            }}
          />
          <Input
            placeholder="Receiver Address"
            value={receiverAddress}
            onChange={(e) => setReceiverAddress(e.target.value)}
            addonBefore="BaseL2"
          />
          {currency === "Other" && (
            <Input
              placeholder="Token Address"
              value={customTokenAddress}
              onChange={(e) => setCustomTokenAddress(e.target.value)}
              style={{ width: "100%" }}
            />
          )}
          <Input
            type="number"
            placeholder="Amount"
            value={amount}
            onChange={(e) =>
              setAmount(e.target.value ? parseFloat(e.target.value) : 0)
            }
            addonBefore={
              <Select
                defaultValue="ETH"
                style={{ width: 80 }}
                onChange={(value) => setCurrency(value)}
              >
                <Option value="ETH">ETH</Option>
                <Option value="USDC">USDC</Option>
                <Option value="USDT">USDT</Option>
                <Option value="Other">Other</Option> {/* Custom option */}
              </Select>
            }
            addonAfter={
              <Tooltip
                title={
                  <Space>
                    Balance: {getBalanceForSelectedCurrency()} {currency}
                    <CopyOutlined
                      onClick={() => {
                        navigator.clipboard.writeText(
                          getBalanceForSelectedCurrency().toString()
                        );
                        message.success("Balance copied!");
                      }}
                    />
                  </Space>
                }
              >
                <InfoCircleOutlined />
              </Tooltip>
            }
          />
          <TextArea
            rows={2}
            placeholder="Signed Note (Optional)"
            value={signedNote}
            onChange={(e) => setSignedNote(e.target.value)}
          />
          <Popconfirm
            title="Are you sure to send this transaction?"
            onConfirm={handleSend}
            okText="Yes"
            cancelText="No"
          >
            <Button type="primary" style={{ width: "100%" }}>
              Send
            </Button>
          </Popconfirm>
        </div>
      ),
    },
    {
      key: "balance",
      label: "Balance",
      children: (
        <div
          style={{
            width: "100%",
            minWidth: "100%",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "8px",
          }}
        >
          <b style={{ width: "100%", textAlign: "center" }}>Wallet Balance</b>
          <Button
            type="text"
            icon={<CloseOutlined />}
            size="small"
            onClick={() => setIsPopoverOpen(false)}
            style={{
              position: "absolute",
              top: "0px", // Adjust as needed
              right: "0px", // Adjust as needed
              fontSize: "12px",
              padding: "0",
              height: "auto",
              color: "rgba(0,0,0,0.3)",
            }}
          />
          <Input
            placeholder="-"
            value={currentProfile?.evmPublicKey}
            prefix={
              <span style={{ fontSize: "0.8rem" }}>
                <LinkOutlined style={{ marginRight: "8px" }} />
                BaseL2
              </span>
            }
            suffix={
              <CopyOutlined
                onClick={() => {
                  navigator.clipboard.writeText(
                    currentProfile?.evmPublicKey || ""
                  );
                }}
              />
            }
            style={{ width: "100%" }}
          />
          {tokenBalances.map((token) => (
            <div
              key={token.symbol}
              style={{
                width: "100%",
                border: "1px solid #f0f0f0", // Subtle border
                boxShadow: "none", // No shadow
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "4px",
                }}
              >
                <span style={{ fontSize: "0.75rem", color: "#888" }}>
                  <Button
                    type="text" // Subtle button style
                    icon={<LinkOutlined />}
                    href={`https://etherscan.io/address/${token.contract || currentProfile?.evmPublicKey}`} // Use token contract if available
                    target="_blank"
                    size="small"
                    rel="noopener noreferrer"
                    style={{ fontSize: "0.8rem", color: "#888" }}
                  />
                  {token.name} ({token.symbol})
                </span>
                <Statistic
                  value={token.value}
                  precision={4} // More precision for crypto amounts
                  valueStyle={{
                    fontWeight: "normal", // More subtle font weight
                    color: "#333", // Darker for better visibility
                    fontSize: "0.8rem",
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      ),
    },
    {
      key: "settings",
      label: <SettingOutlined />,
      children: (
        <div
          style={{
            width: "100%",
            minWidth: "100%",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "8px",
          }}
        >
          <b>Settings</b>
          <Button
            type="text"
            icon={<CloseOutlined />}
            size="small"
            onClick={() => setIsPopoverOpen(false)}
            style={{
              position: "absolute",
              top: "0px", // Adjust as needed
              right: "0px", // Adjust as needed
              fontSize: "12px",
              padding: "0",
              height: "auto",
              color: "rgba(0,0,0,0.3)",
            }}
          />
          <Input
            placeholder="RPC Provider URL"
            value={rpcProviderUrl}
            onChange={(e) => setRpcProviderUrl(e.target.value)}
          />
          <Input.Password
            placeholder="Password for Private Key"
            value={privateKeyPassword}
            onChange={(e) => setPrivateKeyPassword(e.target.value)}
          />
          <Input.Password
            placeholder="Password for Seed Phrase"
            value={seedPhrasePassword}
            onChange={(e) => setSeedPhrasePassword(e.target.value)}
          />
          <Button type="primary" style={{ width: "100%" }}>
            Save Settings
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div style={{ padding: "0 10px 10px 10px" }}>
      <Popover
        content={
          <div style={{ paddingBottom: 0, width: "250px" }}>
            {" "}
            {/* Reduced bottom padding */}
            <Tabs
              defaultActiveKey="receive"
              items={tabItems}
              centered
              tabPosition="bottom"
              tabBarStyle={{ fontSize: "0.8rem", marginBottom: 0 }}
            />
          </div>
        }
        trigger="click"
        placement="bottomRight"
        open={isPopoverOpen}
      >
        <Card
          bordered={false}
          hoverable={true}
          style={{
            width: "100%",
            borderRadius: "8px",
            background: "#FFF",
          }}
          onClick={() => setIsPopoverOpen(!isPopoverOpen)}
        >
          <Statistic
            title={
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                }}
              >
                <span>Wallet Balance</span>

                <div
                  onClick={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                  }}
                >
                  {/* Top Up */}
                  <TagCopy
                    id={currentProfile?.evmPublicKey || ""}
                    style={{ fontSize: "0.65rem" }}
                  />
                </div>
              </div>
            }
            value={showBalance ? 1280.52 : "******"} // Mask value if not shown
            precision={2}
            valueStyle={{
              color: "rgba(0, 0, 0, 0.6)",
              fontSize: "24px",
              fontWeight: "bold",
            }}
            prefix={showBalance ? "$" : ""} // Only show prefix if balance is visible
            suffix={
              <div
                style={{
                  padding: "0px 0px 0px 0px",
                  marginLeft: "8px",
                }}
              >
                {showBalance ? (
                  <EyeInvisibleOutlined
                    onClick={() => setShowBalance(!showBalance)}
                    size={8}
                    style={{ fontSize: "0.9rem" }}
                  />
                ) : (
                  <EyeOutlined
                    onClick={() => setShowBalance(!showBalance)}
                    size={8}
                    style={{ fontSize: "0.9rem" }}
                  />
                )}
              </div>
            }
          />
        </Card>
      </Popover>
    </div>
  );
};

export default WalletControlPopover;

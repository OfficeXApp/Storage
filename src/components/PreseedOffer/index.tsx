import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import useScreenType from "react-screentype-hook";
import {
  Layout,
  Card,
  Button,
  Timeline,
  Typography,
  Row,
  Col,
  Collapse,
  Input,
  Space,
  Divider,
  message,
  TabsProps,
  Tabs,
} from "antd";
import { CopyOutlined } from "@ant-design/icons";
import toast from "react-hot-toast";
import "./PreseedOffer.css";

// Import images
import logosImage from "../../assets/logo-sliders.png";
import driveImage from "../../assets/drive.png";
import slidesImage from "../../assets/slides.png";
import sheetsImage from "../../assets/sheets.png";
import docsImage from "../../assets/docs.png";
import mixpanel from "mixpanel-browser";

const { Content, Footer } = Layout;
const { Title, Paragraph, Text } = Typography;
const { Panel } = Collapse;

const ETH_PRESALE_WALLET = "0xed75933Fc4Ebb1284833549443BF184531C0A6ac";
const SOLANA_PRESALE_WALLET = "6TSUB6YbubYs8kcxoB2KDF3N84ReG2aaaFZyZL3zq6nY";
const BINANCE_PRESALE_WALLET = "0xed75933Fc4Ebb1284833549443BF184531C0A6ac";

const cardStyle: React.CSSProperties = {
  width: "100%",
  margin: "0 0 20px 0",
  height: 400,
  display: "flex",
  flexDirection: "column",
  justifyContent: "flex-start",
};

const listStyle: React.CSSProperties = {
  display: "flex",
  padding: "20px 0",
  flexDirection: "column",
  justifyContent: "flex-start",
  alignItems: "stretch",
};

const grayParagraphStyle: React.CSSProperties = {
  color: "#666",
};

const manifestoTitleStyle: React.CSSProperties = {
  fontFamily: "'Times New Roman', serif",
  fontStyle: "italic",
  fontWeight: "normal",
  color: "#000",
};

const OfficeXCardList: React.FC = () => {
  return (
    <Row gutter={[24, 24]} justify="start" align="stretch">
      {[
        {
          title: <span>Storage</span>,
          image: driveImage,
          description:
            "Keep your files safe & organized on your computer, or shared on a secure decentralized cloud. Private file storage.",
          button: (
            <Link to="/drive">
              <Button type="primary" ghost>
                Launch App
              </Button>
            </Link>
          ),
        },
        {
          title: <span>Documents</span>,
          image: docsImage,
          description:
            "Write and edit documents with ease. No signup required, realtime collaboration & a professional author experience.",
          button: (
            <Button type="primary" disabled>
              Coming Soon
            </Button>
          ),
        },
        {
          title: <span>Spreadsheets</span>,
          image: sheetsImage,
          description:
            "Calculate powerful models & rich volume of data, on a smooth infinite spreadsheet. Simple and expressive.",
          button: (
            <Button type="primary" disabled>
              Coming Soon
            </Button>
          ),
        },
        {
          title: <span>Presentations</span>,
          image: slidesImage,
          description:
            "Deliver rich presentations with confidence. Easy to design, or clone from pre-built templates.",
          button: (
            <Button type="primary" disabled>
              Coming Soon
            </Button>
          ),
        },
      ].map((item, index) => (
        <Col xs={24} sm={12} lg={6} key={index}>
          <Card
            hoverable
            cover={
              <img
                src={item.image}
                style={{ height: 200, objectFit: "cover" }}
              />
            }
            style={{ height: "100%", display: "flex", flexDirection: "column" }}
          >
            <Card.Meta
              title={item.title}
              description={item.description}
              style={{ flex: 1 }}
            />
            <div style={{ marginTop: "auto", paddingTop: 16 }}>
              {item.button}
            </div>
          </Card>
        </Col>
      ))}
    </Row>
  );
};

const items: TabsProps["items"] = [
  {
    key: "eth",
    label: "Ethereum",
    children: (
      <>
        <Paragraph style={grayParagraphStyle}>
          To buy $OFFICEX at floor presale price $0.01 USDC per token:
        </Paragraph>
        <ol>
          <li>
            Ensure you have{" "}
            <a
              href="https://etherscan.io/address/0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48"
              target="_blank"
            >
              USDC on the Ethereum network.
            </a>
          </li>
          <li>Copy the wallet address below.</li>
          <li>
            Send your desired amount of USDC to this address. Only send from a
            wallet you control, so that $OFFICEX can be airdropped to you.
            Careful when sending from CEX wallet.
          </li>
          <li>
            Verify your transfer in the{" "}
            <a
              href="https://etherscan.io/address/0xed75933Fc4Ebb1284833549443BF184531C0A6ac#tokentxns"
              target="_blank"
            >
              etherscan history.
            </a>
          </li>
          <li>
            Wait for the Official Fundraiser to send. Follow us on Twitter (X){" "}
            <a href="https://x.com/officexapp" target="_blank">
              @officexapp
            </a>{" "}
            for updates
          </li>
        </ol>
        <Space direction="vertical" style={{ width: "100%" }}>
          <Text strong>Send USDC on Ethereum to:</Text>
          <Input
            addonAfter={
              <CopyOutlined
                onClick={() => {
                  navigator.clipboard.writeText(ETH_PRESALE_WALLET);
                  toast.success(
                    <span>Wallet Address copied to clipboard!</span>
                  );
                }}
              />
            }
            defaultValue={ETH_PRESALE_WALLET}
            value={ETH_PRESALE_WALLET}
          />
        </Space>
        <p style={{ fontSize: "0.7rem", color: "gray", fontStyle: "italic" }}>
          Presale price limited to first $15k usd across all chains. Excess will
          be refunded.
        </p>
      </>
    ),
  },
  {
    key: "base",
    label: "Base",
    children: (
      <>
        <Paragraph style={grayParagraphStyle}>
          To buy $OFFICEX at floor presale price $0.01 USDC per token:
        </Paragraph>
        <ol>
          <li>
            Ensure you have{" "}
            <a
              href="https://basescan.org/address/0x833589fcd6edb6e08f4c7c32d4f71b54bda02913"
              target="_blank"
            >
              USDC on the Base L2 network.
            </a>
          </li>
          <li>Copy the wallet address below.</li>
          <li>
            Send your desired amount of USDC to this address. Only send from a
            wallet you control, so that $OFFICEX can be airdropped to you.
            Careful when sending from CEX wallet.
          </li>
          <li>
            Verify your transfer in the{" "}
            <a
              href="https://basescan.org/address/0xed75933Fc4Ebb1284833549443BF184531C0A6ac#tokentxns"
              target="_blank"
            >
              basescan history.
            </a>
          </li>
          <li>
            Wait for the Official Fundraiser to send. Follow us on Twitter (X){" "}
            <a href="https://x.com/officexapp" target="_blank">
              @officexapp
            </a>{" "}
            for updates
          </li>
        </ol>
        <Space direction="vertical" style={{ width: "100%" }}>
          <Text strong>Send USDC on Base L2 to:</Text>
          <Input
            addonAfter={
              <CopyOutlined
                onClick={() => {
                  navigator.clipboard.writeText(BINANCE_PRESALE_WALLET);
                  toast.success(
                    <span>Wallet Address copied to clipboard!</span>
                  );
                }}
              />
            }
            defaultValue={BINANCE_PRESALE_WALLET}
            value={BINANCE_PRESALE_WALLET}
          />
        </Space>
        <p style={{ fontSize: "0.7rem", color: "gray", fontStyle: "italic" }}>
          Presale price limited to first $15k usd across all chains. Excess will
          be refunded.
        </p>
      </>
    ),
  },
  {
    key: "binance",
    label: "Binance",
    children: (
      <>
        <Paragraph style={grayParagraphStyle}>
          To buy $OFFICEX at floor presale price $0.01 USDC per token:
        </Paragraph>
        <ol>
          <li>
            Ensure you have{" "}
            <a
              href="https://bscscan.com/address/0x8ac76a51cc950d9822d68b83fe1ad97b32cd580d"
              target="_blank"
            >
              USDC on the Binance smart chain network.
            </a>
          </li>
          <li>Copy the wallet address below.</li>
          <li>
            Send your desired amount of USDC to this address. Only send from a
            wallet you control, so that $OFFICEX can be airdropped to you.
            Careful when sending from CEX wallet.
          </li>
          <li>
            Verify your transfer in the{" "}
            <a
              href="https://bscscan.com/address/0xed75933Fc4Ebb1284833549443BF184531C0A6ac#tokentxns"
              target="_blank"
            >
              bscscan history.
            </a>
          </li>
          <li>
            Wait for the Official Fundraiser to send. Follow us on Twitter (X){" "}
            <a href="https://x.com/officexapp" target="_blank">
              @officexapp
            </a>{" "}
            for updates
          </li>
        </ol>
        <Space direction="vertical" style={{ width: "100%" }}>
          <Text strong>Send USDC on Binance Smart Chain to:</Text>
          <Input
            addonAfter={
              <CopyOutlined
                onClick={() => {
                  navigator.clipboard.writeText(BINANCE_PRESALE_WALLET);
                  toast.success(
                    <span>Wallet Address copied to clipboard!</span>
                  );
                }}
              />
            }
            defaultValue={BINANCE_PRESALE_WALLET}
            value={BINANCE_PRESALE_WALLET}
          />
        </Space>
        <p style={{ fontSize: "0.7rem", color: "gray", fontStyle: "italic" }}>
          Presale price limited to first $15k usd across all chains. Excess will
          be refunded.
        </p>
      </>
    ),
  },
  {
    key: "solana",
    label: "Solana",
    disabled: true,
    children: (
      <>
        <Paragraph style={grayParagraphStyle}>
          To buy $OFFICEX at floor presale price $0.01 USDC per token:
        </Paragraph>
        <ol>
          <li>
            Ensure you have{" "}
            <a
              href="https://explorer.solana.com/address/Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB"
              target="_blank"
            >
              USDC on the Solana network.
            </a>
          </li>
          <li>Copy the wallet address below.</li>
          <li>
            Send your desired amount of USDC to this address. Only send from a
            wallet you control, so that $OFFICEX can be airdropped to you.
            Careful when sending from CEX wallet.
          </li>
          <li>
            Verify your transfer in the{" "}
            <a
              href="https://explorer.solana.com/address/6TSUB6YbubYs8kcxoB2KDF3N84ReG2aaaFZyZL3zq6nY"
              target="_blank"
            >
              solana block history.
            </a>
          </li>
          <li>
            Wait for the Official Fundraiser to send. Follow us on Twitter (X){" "}
            <a href="https://x.com/officexapp" target="_blank">
              @officexapp
            </a>{" "}
            for updates
          </li>
        </ol>
        <Space direction="vertical" style={{ width: "100%" }}>
          <Text strong>Send USDC on Solana to:</Text>
          <Input
            addonAfter={
              <CopyOutlined
                onClick={() => {
                  navigator.clipboard.writeText(SOLANA_PRESALE_WALLET);
                  toast.success(
                    <span>Wallet Address copied to clipboard!</span>
                  );
                }}
              />
            }
            defaultValue={SOLANA_PRESALE_WALLET}
            value={SOLANA_PRESALE_WALLET}
          />
        </Space>
        <p style={{ fontSize: "0.7rem", color: "gray", fontStyle: "italic" }}>
          Presale price limited to first $15k usd across all chains. Excess will
          be refunded.
        </p>
      </>
    ),
  },
  {
    key: "icp",
    label: "Internet Computer",
    children: "Content of Tab Pane 1",
    disabled: true,
  },
];

const PreseedOffer: React.FC = () => {
  const screenType = useScreenType();
  useEffect(() => {
    mixpanel.track("View Token Sale");
  }, []);
  return (
    <Layout style={{ minHeight: "100vh", backgroundColor: "white" }}>
      <Content style={{ padding: "0 32px" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "24px 0" }}>
          <i
            className="highlighted-text"
            style={{
              backgroundColor: "#2684fc",
              fontSize: "3rem",
              fontWeight: "bold",
            }}
          >
            $OFFICEX
          </i>
          <Title level={1} style={{ fontWeight: "bold" }}>
            Token Presale
          </Title>
          <Paragraph
            style={{
              ...grayParagraphStyle,
              maxWidth: screenType.isMobile ? "none" : "600px",
              textWrap: "wrap",
            }}
          >
            Official Fundraiser has started, you can{" "}
            <a
              href="https://buy.indiecrypto.club/fund/8453/0x9916a602b99d61fb43E79678F3630d479E3194ca"
              target="_blank"
            >
              buy $OFFICEX on IndieCrypto.
            </a>{" "}
            <br />
            <br />
            Buy $OFFICEX to own a piece of OfficeX Protocol before 100,000x user
            growth. Open source powered by crypto.{" "}
            <a
              href="https://x.com/officexapp/status/1862459322946724026?s=46&t=5lZijnKkxLN53Dcu6LTCWw"
              target="_blank"
            >
              Read the Whitepaper
            </a>
            .
          </Paragraph>

          <Title level={2}>How To Buy</Title>
          <br />
          <Row gutter={48}>
            <Col xs={24} lg={12}>
              <Card className="glowing-card" style={{ marginBottom: 24 }}>
                <Tabs defaultActiveKey="eth" items={items} />
              </Card>
            </Col>
            <Col xs={24} lg={12}>
              <Title level={4}>
                <span style={{ color: "rgba(0, 0, 0, 0.88)" }}>
                  Path to 1 Billion Users
                </span>
              </Title>
              <br />
              <Timeline>
                <Timeline.Item color="green">
                  <Text strong>
                    $0.01 USDC - Pre-Seed Price, First 1000 Users
                  </Text>
                </Timeline.Item>
                <Timeline.Item color="gray">
                  <Text disabled>
                    10k Users - Private Seed, 10x User Growth
                  </Text>
                </Timeline.Item>
                <Timeline.Item color="gray">
                  <Text disabled>
                    100k Users - Public Coin Offering, 100x User Growth
                  </Text>
                </Timeline.Item>
                <Timeline.Item color="gray">
                  <Text disabled>
                    1M Users - Early Adopters, 1000x User Growth
                  </Text>
                </Timeline.Item>
                <Timeline.Item color="gray">
                  <Text disabled>
                    10M Users - Crossing the Chasm, 10,000x User Growth
                  </Text>
                </Timeline.Item>
                <Timeline.Item color="gray">
                  <Text disabled>
                    100M Users - Mainstream, 100,000x User Growth
                  </Text>
                </Timeline.Item>
              </Timeline>
            </Col>
          </Row>
          <Divider style={{ margin: "70px 0px" }} />
          <img
            alt="Logos"
            src={logosImage}
            style={
              {
                width: 150,
                objectFit: "cover",
                margin: "0px",
              } as React.CSSProperties
            }
          />
          <Title level={2}>Meet the OfficeX Ecosystem</Title>
          <Paragraph style={grayParagraphStyle}>
            Discover our suite of decentralized office solutions designed for
            permissionless liberty. OfficeX is where freedom works.
          </Paragraph>
          <br />
          <OfficeXCardList />
          <Divider style={{ margin: "70px 0px" }} />

          <Title level={2} style={{ marginTop: 50 }}>
            Token Sale FAQ
          </Title>

          <Paragraph>
            For any inquiries, please contact us at:{" "}
            <a href="mailto:admin@officex.app">admin@officex.app</a> or reach us
            on Twitter X{" "}
            <a href="https://twitter.com/officexapp" target="_blank">
              @officexapp
            </a>
          </Paragraph>
          <Collapse accordion>
            <Panel header="How do I buy $OFFICEX?" key="1">
              <Paragraph>
                Send USDC on Ethereum to the wallet address and you will receive
                $OFFICEX airdrop to the same wallet you send from. Airdrop is
                tentatively set for Oct 31st 2024 and will be announced on our
                official X account{" "}
                <a href="https://twitter.com/officexapp" target="_blank">
                  @officexapp
                </a>
              </Paragraph>
              <Paragraph>
                Send USDC on Ethereum to:
                0xed75933Fc4Ebb1284833549443BF184531C0A6ac
              </Paragraph>
              <Paragraph>Announcements on X (Twitter) @officexapp</Paragraph>
            </Panel>
            <Panel header="Explain the Growth Potential" key="2">
              <Paragraph>
                2 billion people pay $65B per year for Google Suite & Microsoft
                Office. 300M people use cracked versions due to expensive
                enterprise pricing or government sanctions. This is 100,000x
                user growth potential for a Flagship DApp (currently less than
                1k users). Timing akin to Bitcoin at $0.60 USD. Pre-seed round
                closes at $500k raised. Not financial advice.
              </Paragraph>
            </Panel>
            <Panel header="Is OfficeX Legit? Why Open Source" key="3">
              <Paragraph>
                OfficeX is legitimate because it's 100% open source and built in
                public. We ship code daily and lead the charge. Beware of
                imposters - anyone can fork our code, but great software is a
                continuous improvement. We lead, they follow.
              </Paragraph>
              <a href="https://github.com/officexapp" target="_blank">
                https://github.com/officexapp
              </a>
            </Panel>
            <Panel header="Pre-Seed Perks" key="4">
              <Paragraph>
                Pre-Seed offers $OFFICEX at the best floor price of ~$0.01 USD
                at a $2M FDV. Early holders have the most potential for 1000x
                user growth, as well as prestige ownership of a flagship dapp.
                See growth potential explanation for more details.
              </Paragraph>
            </Panel>
            <Panel header="What are the Tokenomics?" key="5">
              <Paragraph>
                $OFFICEX is a fixed supply token representing ownership in
                OfficeX Protocol. It appreciates in value from hardcoded profit
                margins at the smart contract level. When OfficeX users pay for
                gas, the protocol fees auto-buy $OFFICEX on decentralized
                exchanges. $OFFICEX also offers utility in the form of
                "gas-gated knowledge", DDoS protection & governance voting
                power. Pre-seed buyers receive frozen $OFFICEX to be unlocked at
                public token offering. $OFFICEX is a pre-seed token, not a
                production token. Pre-seed $OFFICEX is auto-exchanged for
                production $OFFICEX on the release date of OfficeX v1.0-prod
                (currently v0.1-alpha). Read Tokenomics Offer Letter for full
                details.
              </Paragraph>
            </Panel>
            <Panel header="When does the Token Sale End?" key="6">
              <Paragraph>
                $OFFICEX Pre-seed at $0.01 USD ends at $500k USD raised or
                earlier subject to momentum. Estimated end date is Oct 2024.
              </Paragraph>
            </Panel>
          </Collapse>

          <Divider style={{ margin: "70px 0px" }} />

          <Row
            justify="center"
            style={{ margin: screenType.isMobile ? "50px 0px" : "100px 0px" }}
          >
            <Col xs={24} md={18} lg={12}>
              <Title level={2} style={manifestoTitleStyle}>
                Manifesto Freedom
              </Title>
              <Paragraph style={grayParagraphStyle}>
                OfficeX is an entrepreneurial status symbol.
              </Paragraph>
              <Paragraph style={grayParagraphStyle}>
                <span
                  className="highlighted-text"
                  style={{ backgroundColor: "#2684fc" }}
                >
                  Superior quality
                </span>{" "}
                at an unbeatable price - free unlimited forever. It's immortal
                software on the blockchain.
              </Paragraph>
              <Paragraph style={grayParagraphStyle}>
                2 billion people pay $65B per year to Google & Microsoft for
                workspace software but don't own anything. They can{" "}
                <span
                  className="highlighted-text"
                  style={{ backgroundColor: "#d45230" }}
                >
                  freeze your life
                </span>
                .
              </Paragraph>
              <Paragraph style={grayParagraphStyle}>
                <span
                  className="highlighted-text"
                  style={{ backgroundColor: "#dead1c" }}
                >
                  OfficeX is sovereign
                </span>{" "}
                because no one controls your digital life except you (guaranteed
                by cryptography). Every file shared is a fashion statement for
                freedom.
              </Paragraph>
              <Paragraph style={grayParagraphStyle}>
                Join people who{" "}
                <span
                  className="highlighted-text"
                  style={{ backgroundColor: "#00ae45" }}
                >
                  forge their own path
                </span>{" "}
                - OfficeX was made for you.
              </Paragraph>
              <Paragraph style={grayParagraphStyle}>Be Untouchable.</Paragraph>
              <Paragraph strong style={grayParagraphStyle}>
                Terran
              </Paragraph>
              <Paragraph style={grayParagraphStyle}>Founder OfficeX</Paragraph>
            </Col>
          </Row>

          <Divider />
        </div>
      </Content>
      <Footer style={{ textAlign: "center" }}>OfficeX ©2025</Footer>
    </Layout>
  );
};

export default PreseedOffer;

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

const ETH_PRESALE_WALLET = "0x86E87DB7Ecc260eCC6EE91C5352F98997e6c4ac4";
const SOLANA_PRESALE_WALLET = "6TSUB6YbubYs8kcxoB2KDF3N84ReG2aaaFZyZL3zq6nY";
const BINANCE_PRESALE_WALLET = "0x5d2e6EE80d7B460AC3Ed4249b2b4D86E6670Ca63";

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
          title: "Storage",
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
          title: "Documents",
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
          title: "Spreadsheets",
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
          title: "Presentations",
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
                alt={item.title}
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
          To buy $OFX at floor presale price $0.01 USDT per token:
        </Paragraph>
        <ol>
          <li>
            Ensure you have{" "}
            <a
              href="https://etherscan.io/address/0xdac17f958d2ee523a2206206994597c13d831ec7"
              target="_blank"
            >
              USDT on the Ethereum network.
            </a>
          </li>
          <li>Copy the wallet address below.</li>
          <li>Send your desired amount of USDT to this address. Only send from a wallet you control, so that $OFX can be airdropped to you. Careful when sending from CEX wallet.</li>
          <li>
            Verify your transfer in the{" "}
            <a
              href="https://etherscan.io/address/0x86E87DB7Ecc260eCC6EE91C5352F98997e6c4ac4#tokentxns"
              target="_blank"
            >
              etherscan history.
            </a>
          </li>
          <li>
            Wait for the Airdrop on Oct 31st 2024. Follow us on Twitter (X){" "}
            <a href="https://x.com/officexapp" target="_blank">
              @officexapp
            </a>{" "}
            for updates
          </li>
        </ol>
        <Space direction="vertical" style={{ width: "100%" }}>
          <Text strong>Send USDT on Ethereum to:</Text>
          <Input
            addonAfter={
              <CopyOutlined
                onClick={() => {
                  navigator.clipboard.writeText(ETH_PRESALE_WALLET);
                  message.success("Wallet Address copied to clipboard!");
                }}
              />
            }
            defaultValue={ETH_PRESALE_WALLET}
            value={ETH_PRESALE_WALLET}
          />
        </Space>
        <p style={{ fontSize: "0.7rem", color: "gray", fontStyle: "italic" }}>
          Presale price limited to first $100k usd across all chains. Excess
          will be refunded.
        </p>
      </>
    ),
  },
  {
    key: "solana",
    label: "Solana",
    children: (
      <>
        <Paragraph style={grayParagraphStyle}>
          To buy $OFX at floor presale price $0.01 USDT per token:
        </Paragraph>
        <ol>
          <li>
            Ensure you have{" "}
            <a
              href="https://explorer.solana.com/address/Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB"
              target="_blank"
            >
              USDT on the Solana network.
            </a>
          </li>
          <li>Copy the wallet address below.</li>
          <li>Send your desired amount of USDT to this address. Only send from a wallet you control, so that $OFX can be airdropped to you. Careful when sending from CEX wallet.</li>
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
            Wait for the Airdrop on Oct 31st 2024. Follow us on Twitter (X){" "}
            <a href="https://x.com/officexapp" target="_blank">
              @officexapp
            </a>{" "}
            for updates
          </li>
        </ol>
        <Space direction="vertical" style={{ width: "100%" }}>
          <Text strong>Send USDT on Solana to:</Text>
          <Input
            addonAfter={
              <CopyOutlined
                onClick={() => {
                  navigator.clipboard.writeText(SOLANA_PRESALE_WALLET);
                  message.success("Wallet Address copied to clipboard!");
                }}
              />
            }
            defaultValue={SOLANA_PRESALE_WALLET}
            value={SOLANA_PRESALE_WALLET}
          />
        </Space>
        <p style={{ fontSize: "0.7rem", color: "gray", fontStyle: "italic" }}>
          Presale price limited to first $100k usd across all chains. Excess
          will be refunded.
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
          To buy $OFX at floor presale price $0.01 USDT per token:
        </Paragraph>
        <ol>
          <li>
            Ensure you have{" "}
            <a
              href="https://bscscan.com/address/0x55d398326f99059ff775485246999027b3197955"
              target="_blank"
            >
              USDT on the Binance smart chain network.
            </a>
          </li>
          <li>Copy the wallet address below.</li>
          <li>Send your desired amount of USDT to this address. Only send from a wallet you control, so that $OFX can be airdropped to you. Careful when sending from CEX wallet.</li>
          <li>
            Verify your transfer in the{" "}
            <a
              href="https://bscscan.com/address/0x5d2e6EE80d7B460AC3Ed4249b2b4D86E6670Ca63#tokentxns"
              target="_blank"
            >
              bscscan history.
            </a>
          </li>
          <li>
            Wait for the Airdrop on Oct 31st 2024. Follow us on Twitter (X){" "}
            <a href="https://x.com/officexapp" target="_blank">
              @officexapp
            </a>{" "}
            for updates
          </li>
        </ol>
        <Space direction="vertical" style={{ width: "100%" }}>
          <Text strong>Send USDT on Binance Smart Chain to:</Text>
          <Input
            addonAfter={
              <CopyOutlined
                onClick={() => {
                  navigator.clipboard.writeText(BINANCE_PRESALE_WALLET);
                  message.success("Wallet Address copied to clipboard!");
                }}
              />
            }
            defaultValue={BINANCE_PRESALE_WALLET}
            value={BINANCE_PRESALE_WALLET}
          />
        </Space>
        <p style={{ fontSize: "0.7rem", color: "gray", fontStyle: "italic" }}>
          Presale price limited to first $100k usd across all chains. Excess
          will be refunded.
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
    mixpanel.track('View Token Sale')
  }, [])
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
            $OFX
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
            Buy $OFX to own a piece of OfficeX Protocol before 100,000x user
            growth. Open source powered by crypto.{" "}
            <a
              href="https://docs.google.com/document/d/1J565dlAKY6dNPBZbXnxUezsTJGQBDKcO6vuklZ94BC0/edit?usp=sharing"
              target="_blank"
            >
              Read the Whitepaper
            </a>
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
                    $0.01 USDT - Pre-Seed Price, First 1000 Users
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
            <Panel header="How do I buy $OFX?" key="1">
              <Paragraph>
                Send USDT on Ethereum to the wallet address and you will receive
                $OFX airdrop to the same wallet you send from. Airdrop is
                tentatively set for Oct 31st 2024 and will be announced on our
                official X account{" "}
                <a href="https://twitter.com/officexapp" target="_blank">
                  @officexapp
                </a>
              </Paragraph>
              <Paragraph>
                Send USDT on Ethereum to:
                0x86E87DB7Ecc260eCC6EE91C5352F98997e6c4ac4
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
                Pre-Seed offers $OFX at the best floor price of ~$0.01 USD at a
                $2M FDV. Early holders have the most potential for 1000x user
                growth, as well as prestige ownership of a flagship dapp. See
                growth potential explanation for more details.
              </Paragraph>
            </Panel>
            <Panel header="What are the Tokenomics?" key="5">
              <Paragraph>
                $OFX is a fixed supply token representing ownership in OfficeX
                Protocol. It appreciates in value from hardcoded profit margins
                at the smart contract level. When OfficeX users pay for gas, the
                protocol fees auto-buy $OFX on decentralized exchanges. $OFX
                also offers utility in the form of "gas-gated knowledge", DDoS
                protection & governance voting power. Pre-seed buyers receive
                frozen $OFX to be unlocked at public token offering. $OFX is a
                pre-seed token, not a production token. Pre-seed $OFX is
                auto-exchanged for production $OFX on the release date of
                OfficeX v1.0-prod (currently v0.1-alpha). Read Tokenomics Offer
                Letter for full details.
              </Paragraph>
            </Panel>
            <Panel header="When does the Token Sale End?" key="6">
              <Paragraph>
                $OFX Pre-seed at $0.01 USD ends at $500k USD raised or earlier
                subject to momentum. Estimated end date is Oct 2024.
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
      <Footer style={{ textAlign: "center" }}>OfficeX ©2024</Footer>
    </Layout>
  );
};

export default PreseedOffer;

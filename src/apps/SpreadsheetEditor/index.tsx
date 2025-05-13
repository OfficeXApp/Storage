import SlimAppHeader from "../../components/SlimAppHeader";
import sheetsLogo from "../../assets/sheets-logo.png";
import { SPREADSHEET_APP_ENDPOINT } from "../../framework/identity/constants";
import { Link, useNavigate } from "react-router-dom";
import { Alert } from "antd";
import Marquee from "react-fast-marquee";
import { Helmet } from "react-helmet";

const SpreadsheetEditor = () => {
  const navigate = useNavigate();
  return (
    <div>
      <Helmet>
        <meta charSet="utf-8" />
        <title>Sheets | OfficeX</title>
        <link rel="icon" href="/sheets-favicon.ico" />
      </Helmet>
      <Alert
        message={
          <Marquee pauseOnHover gradient={false}>
            <div
              style={{
                display: "flex",
                flexDirection: "row",
                justifyContent: "space-around",
              }}
            >
              <span>
                OfficeX Spreadsheets are in Beta Preview
                <a
                  href="https://officex.app"
                  target="_blank"
                  style={{ padding: "0px 10px" }}
                >
                  Learn More
                </a>
                <span>
                  Anonymous Workspace | Instant Access | No Signup Required
                  <a
                    href="https://t.me/officex_armybot"
                    target="_blank"
                    style={{ padding: "0px 10px" }}
                  >
                    Join Community
                  </a>
                </span>{" "}
              </span>
              <span>
                #OfficeX - Where Freedom Works | 100% Decentralized | 100% Open
                Source{" "}
                <a
                  href="https://officex.app"
                  target="_blank"
                  style={{ padding: "0px 10px" }}
                >
                  Learn More
                </a>
              </span>
            </div>
          </Marquee>
        }
        type="info"
        banner
        closable
      />
      <SlimAppHeader
        title={
          <div
            onClick={() => {
              navigate("/");
            }}
            style={{
              display: "flex",
              justifyContent: "flex-start",
              alignItems: "center",
              // backgroundColor: "#f0f0f0",
              backgroundColor: "#ffffff",
              cursor: "pointer",
            }}
          >
            <img
              alt="Sheets"
              src={sheetsLogo}
              style={
                {
                  width: 30,
                  objectFit: "cover",
                  margin: "0px",
                } as React.CSSProperties
              }
            />
            <span style={{ fontFamily: "sans-serif", marginLeft: 8 }}>
              Sheets | OfficeX
            </span>
          </div>
        }
      />
      <iframe
        src={SPREADSHEET_APP_ENDPOINT}
        allow="clipboard-read; clipboard-write"
        sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
        style={{ width: "100%", height: "100vh", border: "none" }}
      />
    </div>
  );
};
export default SpreadsheetEditor;

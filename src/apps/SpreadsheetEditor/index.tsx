import SlimAppHeader from "../../components/SlimAppHeader";
import sheetsLogo from "../../assets/sheets-logo.png";
import { SPREADSHEET_APP_ENDPOINT } from "../../framework/identity/constants";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Alert, message } from "antd";
import Marquee from "react-fast-marquee";
import { Helmet } from "react-helmet";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  Connection,
  Methods,
  RemoteProxy,
  WindowMessenger,
  connect,
} from "penpal";
import { DiskID, DiskTypeEnum, FileID, FolderID } from "@officexapp/types";
import { useIdentitySystem } from "../../framework/identity";
import { urlSafeBase64Decode } from "../../api/helpers";
import { v4 as uuidv4 } from "uuid";

export interface SpreadsheetFile_BTOA {
  file_id?: FileID;
  file_name?: string;
  parent_folder_id?: FolderID;
  disk_type?: DiskTypeEnum;
  disk_id?: DiskID;
}

const SpreadsheetEditor = () => {
  const { currentOrg, currentProfile } = useIdentitySystem();
  const navigate = useNavigate();
  const location = useLocation();
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const penpalRef = useRef<RemoteProxy<Methods>>(null);

  const [fileData, setFileData] = useState<SpreadsheetFile_BTOA | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    console.log("SpreadsheetEditor mounted");
    const getFileParam = async () => {
      setLoading(true);
      const searchParams = new URLSearchParams(location.search);
      const fileParam = searchParams.get("file");
      console.log(`fileParam`, fileParam);
      if (fileParam) {
        try {
          const decodedData = JSON.parse(urlSafeBase64Decode(fileParam || ""));
          console.log(`Decoded SpreadsheetFile_BTOA:`, decodedData);
          const readyData = {
            ...decodedData,
          };
          if (decodedData.file_id) {
            setFileData(decodedData);
            setLoading(false);
            return;
          }
        } catch (error) {
          console.error("Error decoding file parameter:", error);
          message.error("Invalid spreadsheet file data");
        }
      }
      console.log("No file data found in URL, creating new spreadsheet");
      setFileData({
        file_id: uuidv4() as FileID,
        file_name: "Draft Spreadsheet",
      });
      setLoading(false);
    };

    getFileParam();
  }, [location]);

  const parentMethods = {
    getFileData: useCallback(() => {
      console.log("Fetching file data from parent");
      return fileData;
    }, [fileData]),
    downloadFile: useCallback(
      (fileContent: string) => {
        console.log("Downloading file with content:", fileContent);
        const blob = new Blob([fileContent], { type: "text/plain" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        const _fileName = `${fileData?.file_name}.officex-spreadsheet.json`;
        a.download = _fileName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        return `File ${_fileName} downloaded successfully.`;
      },
      [fileData]
    ),
    saveFile: useCallback((fileContent: string) => {
      console.log("Saving file with content:", fileContent);
      // Implement your save logic here
      return `File ${"fileName"} saved successfully.`;
    }, []),
    logMessage: useCallback((message: string) => {
      console.log("Message from iframe:", message);
      return `Parent received: ${message}`;
    }, []),
  };

  const setupPenpal = useCallback(async () => {
    // Ensure iframeRef.current and its contentWindow exist before proceeding
    if (iframeRef.current && iframeRef.current.contentWindow) {
      let connection: Connection | undefined;

      try {
        const messenger = new WindowMessenger({
          remoteWindow: iframeRef.current.contentWindow,
          // Dynamically get the origin from your SPREADSHEET_APP_ENDPOINT
          allowedOrigins: [new URL(SPREADSHEET_APP_ENDPOINT).origin],
        });

        connection = connect({
          messenger,
          methods: parentMethods, // Expose parent methods to the iframe
        });

        // Wait for the connection to be established and remote methods to be available
        const remote = await connection.promise;
        console.log(
          "Penpal connection established. Remote methods from iframe:",
          remote
        );
        // @ts-ignore
        penpalRef.current = remote;

        // Example: Call a remote method from the iframe
        // You would typically call these based on user interactions or other logic
        // const multiplicationResult = await remote.multiply(2, 6);
        // console.log('Multiplication Result from iframe:', multiplicationResult);

        // The cleanup function for this specific setup
        return () => {
          if (connection) {
            connection.destroy(); // Disconnect penpal when the iframe or component unmounts
            console.log("Penpal connection destroyed.");
          }
        };
      } catch (error) {
        console.error(
          "Failed to establish Penpal connection with iframe:",
          error
        );
      }
    } else {
      console.warn(
        "Iframe ref or contentWindow not available to set up Penpal."
      );
    }
  }, [parentMethods, SPREADSHEET_APP_ENDPOINT]); // Depend on parentMethods and the endpoint URL

  return (
    <div>
      <Helmet>
        <meta charSet="utf-8" />
        <title>
          {fileData?.file_name
            ? fileData?.file_name?.replace(".officex-spreadsheet.json", "")
            : "Sheets | OfficeX"}
        </title>
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
              onClick={() => {
                navigate("/");
              }}
              style={
                {
                  width: 30,
                  objectFit: "cover",
                  margin: "0px",
                } as React.CSSProperties
              }
            />
            <span
              onClick={() => {
                // @ts-ignore
                penpalRef.current?.checkstatus(
                  "To support multiple iframes, you can use a unique identifier for each iframe instance."
                );
              }}
              style={{ fontFamily: "sans-serif", marginLeft: 8 }}
            >
              {fileData?.file_name
                ? fileData?.file_name?.replace(".officex-spreadsheet.json", "")
                : "Sheets | OfficeX"}
            </span>
          </div>
        }
      />
      {/* <iframe
        src={SPREADSHEET_APP_ENDPOINT}
        allow="clipboard-read; clipboard-write"
        sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
        style={{ width: "100%", height: "90vh", border: "none" }}
      /> */}
      <iframe
        ref={iframeRef} // Attach the ref here
        src={SPREADSHEET_APP_ENDPOINT}
        allow="clipboard-read; clipboard-write"
        sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
        style={{ width: "100%", height: "90vh", border: "none" }}
        onLoad={setupPenpal} // Trigger Penpal setup when the iframe content loads
      />
    </div>
  );
};
export default SpreadsheetEditor;

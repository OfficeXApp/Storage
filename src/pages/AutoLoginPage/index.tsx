import {
  ApiKeyValue,
  AutoLogin_BTOA,
  DriveID,
  UserID,
} from "@officexapp/types";
import { useEffect, useState } from "react";
import {
  sleep,
  urlSafeBase64Decode,
  urlSafeBase64Encode,
} from "../../api/helpers";
import {
  Card,
  Descriptions,
  message,
  Result,
  Space,
  Spin,
  Typography,
} from "antd";
import { v4 as uuidv4 } from "uuid";
import { LoadingOutlined } from "@ant-design/icons";
import useScreenType from "react-screentype-hook";
import { useNavigate } from "react-router-dom";
import { useIdentitySystem } from "../../framework/identity";

const { Title, Paragraph, Text } = Typography;

export const generateAutoLoginBTOA = (data: AutoLogin_BTOA) => {
  const token = urlSafeBase64Encode(JSON.stringify(data));
  const url = `${window.location.origin}/auto-login?token=${token}`;
  return url;
};

const AutoLoginPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [autoLoginData, setAutoLoginData] = useState<AutoLogin_BTOA | null>(
    null
  );
  const screenType = useScreenType();
  const {
    listOfProfiles,
    listOfOrgs,
    createProfile,
    updateProfile,
    deleteProfile,
    switchProfile,
    createOrganization,
    createApiKey,
    switchOrganization,
    wrapOrgCode,
  } = useIdentitySystem();

  useEffect(() => {
    const getAutoLoginData = async () => {
      setLoading(true);
      const searchParams = new URLSearchParams(location.search);
      const tokenParam = searchParams.get("token");

      if (tokenParam) {
        try {
          const decodedData = JSON.parse(urlSafeBase64Decode(tokenParam));
          console.log(`decodedData`, decodedData);
          setAutoLoginData(decodedData);
          proceedAutoLogin(decodedData);
        } catch (error) {
          console.error("Error decoding auto-login parameter:", error);
          message.error("Invalid auto-login data");
        }
      } else {
        message.error("No auto-login data found");
      }
      setLoading(false);
    };

    getAutoLoginData();
  }, [location]);

  const proceedAutoLogin = async (data: AutoLogin_BTOA) => {
    try {
      // Create a new profile using the data from the token
      const newProfile = await createProfile({
        icpPublicAddress: data.profile_id.replace("UserID_", ""), // Use profile_id as the ICP address
        evmPublicAddress: "", // No EVM address available without seed phrase
        seedPhrase: data.profile_seed_phrase || "", // Use seed phrase if available, otherwise empty string
        note: "Recovered Profile",
        avatar: "",
        nickname: data.profile_name || "Recovered Profile",
      });

      // Switch to the new profile
      await switchProfile(newProfile);

      message.success(
        `Successfully logged in as ${data.profile_name || "Recovered Profile"}`
      );

      // Create organization with the provided data
      const newOrg = await createOrganization({
        driveID: data.org_id,
        nickname: data.org_name || "Recovered Organization",
        icpPublicAddress: data.org_id.replace("DriveID_", ""), // Use profile_id as ICP address
        endpoint: data.org_endpoint,
        note: `Recovered organization for ${data.profile_name || "user"}`,
        defaultProfile: newProfile.userID,
      });

      // Switch to the new organization with the current profile
      await switchOrganization(newOrg, newProfile.userID);

      message.success(
        `Successfully added organization ${data.org_name || "Recovered Organization"}`
      );

      // Create API key
      await createApiKey({
        apiKeyID: `ApiKey_${uuidv4()}`,
        userID: newProfile.userID,
        driveID: data.org_id,
        note: `Auto-generated during auto-login for ${data.profile_name || "user"} (${data.org_endpoint})`,
        value: data.profile_api_key,
        endpoint: data.org_endpoint,
      });
      message.success("Redirecting... please wait");

      await sleep(4000);

      // Redirect to home page after successful login
      navigate("/org/current/welcome");
      await sleep(1000);
      window.location.reload();
    } catch (error) {
      console.error("Auto-login failed:", error);
      message.error("Failed to auto-login. Please contact your administrator.");
    }
  };

  if (!autoLoginData) {
    return (
      <Result
        status="warning"
        title="Invalid Login Link"
        subTitle="The login link is invalid or has expired. Please contact your administrator for a new link."
      />
    );
  }

  return (
    <div
      style={{
        textAlign: "center",
        padding: screenType.isMobile ? "10px 10px" : "40px 20px",
        maxWidth: "1000px",
        margin: "0 auto",
      }}
    >
      <Result
        icon={
          <Spin indicator={<LoadingOutlined style={{ fontSize: 24 }} spin />} />
        }
        title="Logging you in..."
        subTitle={
          <div>
            <Space direction="vertical" size={4}>
              <table
                style={{
                  margin: "16px auto",
                  fontSize: "12px",
                  color: "rgba(0,0,0,0.65)",
                  backgroundColor: "#f5f5f5",
                  border: "1px solid #e8e8e8",
                  borderCollapse: "collapse",
                  width: "100%",
                  maxWidth: "1000px",
                }}
              >
                <tbody>
                  <tr>
                    <td
                      style={{
                        padding: "4px 8px",
                        textAlign: "right",
                        fontWeight: "500",
                        width: "100px",
                      }}
                    >
                      Profile ID
                    </td>
                    <td
                      style={{
                        padding: "4px 8px",
                        textAlign: "left",
                        fontFamily: "monospace",
                      }}
                    >
                      {autoLoginData.profile_id}
                    </td>
                  </tr>
                  <tr>
                    <td
                      style={{
                        padding: "4px 8px",
                        textAlign: "right",
                        fontWeight: "500",
                      }}
                    >
                      Organization ID
                    </td>
                    <td
                      style={{
                        padding: "4px 8px",
                        textAlign: "left",
                        fontFamily: "monospace",
                      }}
                    >
                      {autoLoginData.org_id}
                    </td>
                  </tr>
                  <tr>
                    <td
                      style={{
                        padding: "4px 8px",
                        textAlign: "right",
                        fontWeight: "500",
                      }}
                    >
                      Endpoint
                    </td>
                    <td
                      style={{
                        padding: "4px 8px",
                        textAlign: "left",
                        fontFamily: "monospace",
                      }}
                    >
                      {autoLoginData.org_endpoint}
                    </td>
                  </tr>

                  <tr>
                    <td
                      style={{
                        padding: "4px 8px",
                        textAlign: "right",
                        fontWeight: "500",
                      }}
                    >
                      Organization
                    </td>
                    <td
                      style={{
                        padding: "4px 8px",
                        textAlign: "left",
                        fontFamily: "monospace",
                      }}
                    >
                      {autoLoginData.org_name}
                    </td>
                  </tr>
                  <tr>
                    <td
                      style={{
                        padding: "4px 8px",
                        textAlign: "right",
                        fontWeight: "500",
                      }}
                    >
                      Profile Name
                    </td>
                    <td
                      style={{
                        padding: "4px 8px",
                        textAlign: "left",
                        fontFamily: "monospace",
                      }}
                    >
                      {autoLoginData.profile_name}
                    </td>
                  </tr>
                </tbody>
              </table>

              <Paragraph
                type="secondary"
                style={{ fontSize: "13px", marginTop: 16 }}
              >
                If not redirected within 30 seconds, try refreshing the page or
                contact your administrator.
              </Paragraph>
            </Space>
          </div>
        }
      />
    </div>
  );
};

export default AutoLoginPage;

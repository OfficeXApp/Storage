import React, { useState } from "react";
import { Result, Input, Button, Space, Typography, message } from "antd";
import { LockOutlined } from "@ant-design/icons";
import { useIdentitySystem } from "../../framework/identity";
import { passwordToSeedPhrase } from "../../api/icp";

const { Text } = Typography;
const { Password } = Input;

interface DirectoryGuardProps {
  onPasswordSubmit?: (password: string) => void;
  resourceID: string;
}

const DirectoryGuard: React.FC<DirectoryGuardProps> = ({ resourceID }) => {
  const [password, setPassword] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const {
    currentOrg,
    wrapOrgCode,
    deriveProfileFromSeed,
    hydrateFullAuthProfile,
    generateSignature,
    createProfile,
    switchProfile,
  } = useIdentitySystem();

  const handleSubmit = async () => {
    console.log(`submitting...`, password, currentOrg);
    if (!password || !currentOrg) return;
    setIsLoading(true);
    const deterministic_seed_phrase = passwordToSeedPhrase(
      `${password}-${resourceID}`
    );
    const newProfile = await deriveProfileFromSeed(deterministic_seed_phrase);
    console.log(`newProfile`, newProfile.userID);
    const auth_profile = await hydrateFullAuthProfile(newProfile, true);
    const auth_token = await generateSignature(auth_profile);
    console.log(`auth_token`, auth_token);
    try {
      const action = {
        action: resourceID.startsWith("FolderID_") ? "GET_FOLDER" : "GET_FILE",
        payload: {
          id: resourceID,
        },
      };
      const check_response = await fetch(
        `${currentOrg.endpoint}/v1/${currentOrg.driveID}/directory/action`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${auth_token}`,
          },
          body: JSON.stringify({
            actions: [action],
          }),
        }
      );
      const res = await check_response.json();
      console.log("Check get file response:", res);
      if (!res || !res[0].response.result) {
        message.error(`Invalid password`);
      } else {
        message.success(`Valid password, redirecting...`);
        // Create the profile
        const newProfile = await createProfile({
          icpPublicAddress: auth_profile.icpPublicKey,
          evmPublicAddress: auth_profile.evmPublicKey,
          seedPhrase: deterministic_seed_phrase,
          note: `Password temp login for ${currentOrg.driveID}`,
          avatar: "",
          nickname: "Temp Password",
        });
        // Switch to the new profile
        await switchProfile(newProfile);
        // refresh page
        window.location.reload();
      }
      setIsLoading(false);
    } catch (e) {
      console.log(`err`, e);
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSubmit();
    }
  };

  return (
    <div style={{ marginTop: 48 }}>
      <Result
        status="403"
        title="Unauthorized"
        subTitle={`You do not have permission to view this ${resourceID.startsWith("FolderID_") ? "folder" : "file"}`}
        extra={
          <div style={{ maxWidth: 400, margin: "0 auto" }}>
            <Space direction="vertical" size="large" style={{ width: "100%" }}>
              <Text>If you have a temporary password you can try it below</Text>

              <Space.Compact style={{ width: "100%" }}>
                <Password
                  prefix={<LockOutlined />}
                  placeholder="Enter temporary password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyPress={handleKeyPress}
                  allowClear
                />
                <Button
                  type="primary"
                  loading={isLoading}
                  onClick={handleSubmit}
                  disabled={!password}
                >
                  Enter
                </Button>
              </Space.Compact>
            </Space>
          </div>
        }
      />
    </div>
  );
};

export default DirectoryGuard;

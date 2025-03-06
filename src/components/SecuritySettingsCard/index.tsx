import React, { useEffect, useState } from "react";
import {
  Button,
  Card,
  Divider,
  Input,
  message,
  Modal,
  Popconfirm,
  Popover,
  Space,
  Typography,
} from "antd";
import {
  CopyOutlined,
  EyeInvisibleOutlined,
  EyeTwoTone,
} from "@ant-design/icons";
import useScreenType from "react-screentype-hook";
import mixpanel from "mixpanel-browser";
import { CONSTANTS } from "../../framework/identity/constants";
import { useIdentitySystem } from "../../framework/identity";

const { Text, Link } = Typography;
const SecuritySettingsCard = () => {
  const {
    currentProfile,
    currentOrg,
    deriveProfileFromSeed,
    createProfile,
    switchProfile,
  } = useIdentitySystem();
  const icpCanisterId = currentOrg?.driveID;
  const { icpAccount, evmPublicKey } = currentProfile || {};
  const [showICPSeedPhrase, setShowICPSeedPhrase] = useState(false);
  const [icpSeedPhrase, setICPSeedPhrase] = useState("");
  const [showEVMSeedPhrase, setShowEVMSeedPhrase] = useState(false);
  const [evmSeedPhrase, setEVMSeedPhrase] = useState("");
  const screenType = useScreenType();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);
  const [restoreSeedPhrase, setRestoreSeedPhrase] = useState("");

  useEffect(() => {
    const _seedICPPhrase = localStorage.getItem(
      CONSTANTS.LOCAL_STORAGE_SEED_PHRASE
    );
    if (_seedICPPhrase) {
      setICPSeedPhrase(_seedICPPhrase);
    }
    const _seedEVMPhrase = localStorage.getItem(
      CONSTANTS.LOCAL_STORAGE_SEED_PHRASE
    );
    if (_seedEVMPhrase) {
      setEVMSeedPhrase(_seedEVMPhrase);
    }
  }, [icpCanisterId]);

  const handleCopy = (text: string = "") => {
    navigator.clipboard
      .writeText(text)
      .then(() => {
        message.success("Copied to clipboard!");
      })
      .catch(() => {
        message.error("Failed to copy seed phrase.");
      });
  };

  const handleRestore = async () => {
    setIsRestoring(true);
    console.log("Attempting to restore from seed phrase:", restoreSeedPhrase);
    const profile = await deriveProfileFromSeed(restoreSeedPhrase);
    profile.nickname = `Restored User`;
    profile.note = "Restored from seed phrase";
    console.log("Restored profile:", profile);
    await createProfile(profile);
    await switchProfile(profile);
    setIsRestoring(false);
    setIsModalVisible(false);
    message.success("Account restored successfully!");
    // Reset the restore seed phrase
    setRestoreSeedPhrase("");
    setICPSeedPhrase(restoreSeedPhrase);

    mixpanel.track("Restore Account from Seed Phrase");
    // window.location.reload();
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    // Reset the restore seed phrase
    setRestoreSeedPhrase("");
  };

  const downloadAccount = async () => {
    // Step 1: Create the text content
    const textContent = `---- OfficeX Account Backup ----

EVM Public Key: ${evmPublicKey}
ICP Public Key: ${icpAccount?.principal.toText()}

1. Open the webapp and scroll down to "Restore Account"
https://drive.officex.app/settings

2. Restore your account using the seed phrases below:
- EVM: ${evmSeedPhrase}
- ICP: ${icpSeedPhrase}
    
3. You should see your account restored, with same EVM & ICP public keys seen above.

If you need help, message us at https://officex.app or email admin@officex.app or DM on TwitterX @officexapp
`;

    // Step 2: Create a Blob with the text content
    const blob = new Blob([textContent], { type: "text/plain" });

    // Step 3: Create a download link
    const downloadLink = document.createElement("a");
    downloadLink.href = URL.createObjectURL(blob);
    downloadLink.download = `OfficeX_AccountBackup_${evmPublicKey}.txt`; // Set the file name for the download

    // Step 4: Simulate a click on the download link to trigger the download
    downloadLink.click();

    // Step 5: Clean up by revoking the object URL (optional, but good practice)
    URL.revokeObjectURL(downloadLink.href);
  };

  return (
    <Card title="Security Settings" type="inner" id="security-settings-card">
      <Text color="gray">
        OfficeX has no login except a password. Cloud accounts are powered by
        ICP (Internet Computer Protocol).{" "}
        <a href="https://internetcomputer.org/what-is-the-ic" target="_blank">
          Learn more
        </a>
      </Text>

      <br />
      <br />
      <Space direction="vertical" style={{ maxWidth: "800px" }}>
        <label style={{ color: "gray" }}>EVM Public Address</label>
        <Space direction="horizontal">
          <Input readOnly value={evmPublicKey} />
          <Button
            type="text"
            icon={<CopyOutlined />}
            onClick={() => handleCopy(evmPublicKey)}
            aria-label="Copy public address"
          />
        </Space>
      </Space>
      <br />
      <br />
      {showEVMSeedPhrase ? (
        <Space direction="vertical" style={{ maxWidth: "800px" }}>
          <label style={{ color: "gray" }}>Seed Phrase</label>
          <Space direction="horizontal">
            <Input.Password
              placeholder="Restore from Seed Phrase"
              iconRender={(visible) =>
                visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />
              }
              value={evmSeedPhrase}
              onChange={(e) => setEVMSeedPhrase(e.target.value)}
            />
            <Button
              type="text"
              icon={<CopyOutlined />}
              onClick={() => handleCopy(evmSeedPhrase)}
              aria-label="Copy seed phrase"
            />
          </Space>
          {/* <Button style={{ width: 80 }} onClick={() => console.log("Attempting to restore from seed phrase")}>
                     Restore
                    </Button> */}
        </Space>
      ) : (
        <Popconfirm
          title="Are you sure you want to show your seed phrase?"
          description="Your seed phrase is the master key to your account. Do not share it with anyone."
          onConfirm={() => {
            setShowEVMSeedPhrase(true);
            mixpanel.track("Reveal Seed Phrase");
          }}
          okText="Reveal"
          cancelText="Cancel"
        >
          <Button block={screenType.isMobile}>Show Seed Phrase</Button>
        </Popconfirm>
      )}
      <Divider />
      <Space direction="vertical" style={{ maxWidth: "800px" }}>
        <label style={{ color: "gray" }}>ICP Public Address</label>
        <Space direction="horizontal">
          <Input readOnly value={icpAccount?.principal.toText()} />
          <Button
            type="text"
            icon={<CopyOutlined />}
            onClick={() => handleCopy(icpAccount?.principal.toText())}
            aria-label="Copy public address"
          />
        </Space>
      </Space>
      <br />
      <br />
      {showICPSeedPhrase ? (
        <Space direction="vertical" style={{ maxWidth: "800px" }}>
          <label style={{ color: "gray" }}>Seed Phrase</label>
          <Space direction="horizontal">
            <Input.Password
              placeholder="Restore from Seed Phrase"
              iconRender={(visible) =>
                visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />
              }
              value={icpSeedPhrase}
              onChange={(e) => setICPSeedPhrase(e.target.value)}
            />
            <Button
              type="text"
              icon={<CopyOutlined />}
              onClick={() => handleCopy(icpSeedPhrase)}
              aria-label="Copy seed phrase"
            />
          </Space>
          {/* <Button style={{ width: 80 }} onClick={() => console.log("Attempting to restore from seed phrase")}>
                     Restore
                    </Button> */}
        </Space>
      ) : (
        <Popconfirm
          title="Are you sure you want to show your seed phrase?"
          description="Your seed phrase is the master key to your account. Do not share it with anyone."
          onConfirm={() => {
            setShowICPSeedPhrase(true);
            mixpanel.track("Reveal Seed Phrase");
          }}
          okText="Reveal"
          cancelText="Cancel"
        >
          <Button block={screenType.isMobile}>Show Seed Phrase</Button>
        </Popconfirm>
      )}

      <Divider />
      <Text color="gray">
        You can restore a different account if you have the seed phrase.{" "}
        <a href="https://www.lcx.com/seed-phrase-explained/" target="_blank">
          Learn more
        </a>
      </Text>
      <br />
      <br />

      <Button
        block={screenType.isMobile}
        onClick={() => setIsModalVisible(true)}
      >
        Restore Account
      </Button>
      <br />
      <br />

      <Popconfirm
        title="Are you sure you want to download your account?"
        description="You will receieve a text file with all your seed phrases, which are the master keys to your account. Do not share it with anyone."
        onConfirm={() => {
          mixpanel.track("Reveal Seed Phrase");
          downloadAccount();
        }}
        okText="Download"
        cancelText="Cancel"
      >
        <Button block={screenType.isMobile} danger>
          Download Account
        </Button>
      </Popconfirm>

      <Modal
        title="Restore Account"
        open={isModalVisible}
        onOk={handleRestore}
        onCancel={handleCancel}
        footer={[
          <Button key="cancel" onClick={handleCancel}>
            Cancel
          </Button>,
          <Button
            key="restore"
            type="primary"
            loading={isRestoring}
            onClick={handleRestore}
          >
            Restore
          </Button>,
        ]}
      >
        <Text color="gray">
          OfficeX has no login except a password. Cloud accounts are powered by
          ICP (Internet Computer Protocol).{" "}
          <a href="https://internetcomputer.org/what-is-the-ic" target="_blank">
            Learn more
          </a>
        </Text>
        <br />
        <br />
        <Input.Password
          placeholder="Enter your ICP seed phrase"
          value={restoreSeedPhrase}
          onChange={(e) => setRestoreSeedPhrase(e.target.value)}
          style={{ marginBottom: "16px" }}
        />
      </Modal>
    </Card>
  );
};
export default SecuritySettingsCard;

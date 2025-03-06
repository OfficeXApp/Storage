import { Button, message, Modal, Result, Typography } from "antd";
import { useEffect, useState } from "react";
import { CloudSyncOutlined } from "@ant-design/icons";
import { checkShouldAllowWorldComputer } from "../../api/helpers";
import mixpanel from "mixpanel-browser";
// import useCloudSync from "../../api/cloud-sync";

const { Text } = Typography;

const ConnectICPButton = () => {
  // const { icpCanisterId, deployIcpCanister } = useIdentity();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);

  const connectICP = async () => {
    setLoading(true);
    // await deployIcpCanister();
    setLoading(false);
    setIsModalVisible(false);
    message.success("Successfully Enabled Cloud");
    // refresh the page
    setTimeout(() => {
      window.location.reload();
    }, 1000);
  };

  // if (icpCanisterId) return null;
  return (
    <>
      <Button
        block
        type="primary"
        onClick={() => {
          setIsModalVisible(true);
          mixpanel.track("Connect Cloud");
        }}
        style={{ marginBottom: "5px" }}
      >
        Connect Cloud
      </Button>
      <Modal
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
        width={400}
      >
        <Result
          icon={<CloudSyncOutlined style={{ color: "#1890ff" }} />}
          title="Connect World Computer?"
          subTitle={
            <Text type="secondary">
              The world computer is a Public Cloud owned by nobody. No
              corporation or government can access your private files - only
              you.{" "}
              <a
                href="https://internetcomputer.org/what-is-the-ic"
                target="_blank"
                rel="noopener noreferrer"
              >
                Learn more
              </a>
            </Text>
          }
          extra={[
            checkShouldAllowWorldComputer() ? (
              <Button
                loading={loading}
                type="primary"
                key="connect"
                onClick={connectICP}
                style={{ width: "100%" }}
              >
                Yes, Enable Cloud
              </Button>
            ) : (
              <Button
                disabled
                type="primary"
                key="connect"
                style={{ width: "100%" }}
              >
                Coming Soon
              </Button>
            ),
            <div
              key="powered"
              style={{ textAlign: "center", marginTop: "8px" }}
            >
              <Text type="secondary">Powered by ICP Dfinity</Text>
            </div>,
          ]}
        />
      </Modal>
    </>
  );
};

export default ConnectICPButton;

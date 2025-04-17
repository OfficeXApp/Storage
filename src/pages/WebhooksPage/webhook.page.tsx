import { useNavigate, useParams } from "react-router-dom";
import WebhookTab from "./webhook.tab";
import { useDispatch, useSelector } from "react-redux";
import { ReduxAppState } from "../../redux-offline/ReduxProvider";
import { useEffect } from "react";
import { getWebhookAction } from "../../redux-offline/webhooks/webhooks.actions";
import { Button, Layout } from "antd";
import { Content } from "antd/es/layout/layout";
import useScreenType from "react-screentype-hook";
import { LeftOutlined } from "@ant-design/icons";
import { useIdentitySystem } from "../../framework/identity";

const WebhookPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { wrapOrgCode } = useIdentitySystem();
  const screenType = useScreenType();
  const params = useParams();
  const webhookID = params.webhookID;
  const webhook = useSelector(
    (state: ReduxAppState) => state.webhooks.webhookMap[webhookID || ""]
  );

  useEffect(() => {
    if (webhookID) {
      dispatch(getWebhookAction(webhookID));
    }
  }, []);

  if (!webhook) {
    return null;
  }

  return (
    <Layout
      style={{
        height: "100%",
        width: "100%",
        display: "flex",
        flexDirection: "column",
        backgroundColor: "white",
        overflowX: "hidden",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          padding: "12px 16px",
          borderBottom: "1px solid #f0f0f0",
        }}
      >
        <Button
          type="text"
          icon={<LeftOutlined />}
          onClick={() => navigate(wrapOrgCode("/resources/webhooks"))}
          style={{
            display: "flex",
            alignItems: "center",
            fontSize: "14px",
          }}
        >
          Search Webhooks
        </Button>
      </div>
      <Content
        style={{
          padding: screenType.isMobile ? "0px" : "0 16px",
          flex: 1,
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
      >
        <WebhookTab
          webhookCache={webhook}
          onDelete={() => {
            navigate(wrapOrgCode(`/resources/webhooks`));
          }}
        />
      </Content>
    </Layout>
  );
};

export default WebhookPage;

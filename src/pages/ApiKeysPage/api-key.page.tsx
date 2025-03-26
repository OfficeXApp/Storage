import { useNavigate, useParams } from "react-router-dom";
import ApiKeyTab from "./api-key.tab";
import { useDispatch, useSelector } from "react-redux";
import { ReduxAppState } from "../../redux-offline/ReduxProvider";
import { useEffect } from "react";
import { getApiKeyAction } from "../../redux-offline/api-keys/api-keys.actions";
import { Button, Layout } from "antd";
import { Content } from "antd/es/layout/layout";
import useScreenType from "react-screentype-hook";
import { LeftOutlined } from "@ant-design/icons";
import { useIdentitySystem } from "../../framework/identity";

const ApiKeyPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { wrapOrgCode } = useIdentitySystem();
  const screenType = useScreenType();
  const params = useParams();
  const apiKeyID = params.apiKeyID;
  const apiKey = useSelector(
    (state: ReduxAppState) => state.apikeys.apikeyMap[apiKeyID || ""]
  );

  useEffect(() => {
    if (apiKeyID) {
      dispatch(getApiKeyAction(apiKeyID));
    }
  }, []);

  if (!apiKey) {
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
          onClick={() => navigate(wrapOrgCode("/resources/api-keys"))}
          style={{
            display: "flex",
            alignItems: "center",
            fontSize: "14px",
          }}
        >
          Search API Keys
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
        <ApiKeyTab
          apiKey={apiKey}
          onDelete={() => {
            navigate(wrapOrgCode(`/resources/apikeys`));
          }}
        />
      </Content>
    </Layout>
  );
};

export default ApiKeyPage;

import Layout, { Content } from "antd/es/layout/layout";
import { useParams } from "react-router-dom";
import useScreenType from "react-screentype-hook";
import { message, Typography } from "antd";
import { useEffect } from "react";
import { useIdentitySystem } from "../../framework/identity";
import { IResponseShortLink } from "@officexapp/types";

const { Text } = Typography;

const PrettyUrlShortener = () => {
  const { shortlink_slug } = useParams();
  const { currentOrg, currentAPIKey, generateSignature } = useIdentitySystem();
  const screenType = useScreenType();
  console.log(`shortlink_slug`, shortlink_slug);

  useEffect(() => {
    if (shortlink_slug) {
      proceedToShortLink(shortlink_slug);
    }
  }, []);

  const proceedToShortLink = async (slug: string) => {
    if (!currentOrg?.host) {
      message.error("Organization host not found");
      return;
    }

    try {
      const auth_token = currentAPIKey?.value || (await generateSignature());
      const response = await fetch(
        `${currentOrg?.host}/v1/drive/${currentOrg?.driveID}/organization/shortlink`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${auth_token}`,
          },
          body: JSON.stringify({
            slug,
          }),
        }
      );
      const data: IResponseShortLink = await response.json();
      const original_url = data.ok.data.original_url;
      // redirect to original_url
      window.location.href = original_url;
    } catch (error) {
      console.error("Error generating short link:", error);
      message.error(`Failed to generate short link: ${error}`);
      return null;
    }
  };

  return (
    <Layout
      style={{
        minHeight: "90vh",
        backgroundColor: "#f5f7fa",
      }}
    >
      <Content
        style={{
          padding: screenType.isMobile ? "24px 16px" : "60px 24px",
          maxWidth: "800px",
          margin: "0 auto",
          width: "100%",
          textAlign: "center",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Text>Redirecting...</Text>
      </Content>
    </Layout>
  );
};

export default PrettyUrlShortener;

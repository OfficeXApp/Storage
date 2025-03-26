import React, { useEffect, useState } from "react";
import { Layout, Typography } from "antd";
import { IRequestRedeemContact, UserID } from "@officexapp/types";
import { useLocation, useParams } from "react-router-dom";
import { useIdentitySystem } from "../../framework/identity";
import { urlSafeBase64Decode } from "../../api/helpers";

const { Content, Footer } = Layout;
const { Title, Paragraph, Text } = Typography;

/**
 * Contact Sharing Modes
 * 1. Owned contacts (admin owns seed phrase) --> use RedeemContactBtoaBody
 * 2. Wild contacts (end user self-custody seed phrase) --> use AutoLoginContactBtoaBody
 * 3. Pure Invite to join org, without api key --> use SimpleOrgContactInviteBody
 *
 * Both may optionally include api_key, but definately will have preset for profile name and org name for readability
 * Both may also have redirect_url for easy onboarding
 */

export interface RedeemContactBtoaBody extends IRequestRedeemContact {
  type: "RedeemContactBtoaBody";
  api_key?: string;
  org_name: string;
  profile_name: string;
  redirect_url?: string;
}

export interface AutoLoginContactBtoaBody {
  type: "AutoLoginContactBtoaBody";
  api_key?: string;
  org_name: string;
  profile_name: string;
  profile_user_id: UserID;
  redirect_url?: string;
}

export interface SimpleOrgContactInviteBody {
  type: "SimpleOrgContactInviteBody";
  org_name: string;
  profile_name: string;
  redirect_url?: string;
  profile_user_id: UserID;
}

const ContactRedeem = () => {
  const params = useParams();
  const orgcode = params.orgcode;
  console.log(`>> orgcode`, orgcode);
  const location = useLocation();
  const [redeemData, setRedeemData] = useState(null);
  const { currentOrg, currentProfile } = useIdentitySystem();

  console.log(`location`, location);

  useEffect(() => {
    // Extract redeem parameter from URL
    const getRedeemParam = () => {
      const searchParams = new URLSearchParams(location.search);
      const redeemParam = searchParams.get("redeem");

      if (redeemParam) {
        try {
          // Decode the base64 string
          const decodedData = JSON.parse(urlSafeBase64Decode(redeemParam));
          console.log(`decodedData`, decodedData);
          setRedeemData(decodedData);
        } catch (error) {
          console.error("Error decoding redeem parameter:", error);
        }
      }
    };

    getRedeemParam();
  }, [location]);

  return (
    <Layout style={{ minHeight: "100vh", backgroundColor: "white" }}>
      <Content style={{ padding: "0 16px", maxWidth: "800px", gap: 16 }}>
        <Title level={1} style={{ fontWeight: "bold" }}>
          ContactRedeem
        </Title>
        <br />
        {JSON.stringify(redeemData, null, 2)}
      </Content>
    </Layout>
  );
};

export default ContactRedeem;

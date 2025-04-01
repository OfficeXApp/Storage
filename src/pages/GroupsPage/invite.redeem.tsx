import { GroupInviteID, GroupRole } from "@officexapp/types";
import { urlSafeBase64Decode, urlSafeBase64Encode } from "../../api/helpers";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { IndexDB_Profile, useIdentitySystem } from "../../framework/identity";
import { message } from "antd";

export interface RedeemGroupInvite_BTOA {
  invite_id: GroupInviteID;
  redeem_code: string;
  redirect_url: string;
  group_name: string;
  role: GroupRole;
  org_name: string;
  daterange: { begins_at: number; expires_at: number };
}

const RedeemGroupInvite = () => {
  const params = useParams();
  const orgcode = params.orgcode;
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [redeemData, setRedeemData] = useState<RedeemGroupInvite_BTOA | null>(
    null
  );
  const [selectedProfile, setSelectedProfile] =
    useState<IndexDB_Profile | null>(null);

  const {
    currentOrg,
    currentProfile,
    currentAPIKey,
    wrapOrgCode,
    generateSignature,
    listOfProfiles,
  } = useIdentitySystem();

  console.log(`redeemData`, redeemData);
  console.log(`orgcode`, orgcode);
  console.log(`currentOrg`, currentOrg);
  console.log(`currentProfile`, currentProfile);

  useEffect(() => {
    const getRedeemParam = async () => {
      setLoading(true);
      const searchParams = new URLSearchParams(location.search);
      const redeemParam = searchParams.get("redeem");

      if (redeemParam) {
        try {
          const decodedData = JSON.parse(urlSafeBase64Decode(redeemParam));
          console.log(`decodedData`, decodedData);
          setRedeemData(decodedData);
        } catch (error) {
          console.error("Error decoding redeem parameter:", error);
          message.error("Invalid resource access link");
        }
      } else {
        message.error("No resource access data found");
      }
      setLoading(false);
    };

    getRedeemParam();
  }, [location]);

  return <div>RedeemGroupInvite</div>;
};

export default RedeemGroupInvite;

// Export the helper function to generate redemption URLs
export const generateRedeemGroupInviteURL = (
  {
    invite_id,
    redeem_code,
    redirect_url,
    group_name,
    org_name,
    role,
    daterange,
  }: RedeemGroupInvite_BTOA,
  wrapOrgCode: (route: string) => string
) => {
  const payload: RedeemGroupInvite_BTOA = {
    invite_id,
    redeem_code,
    redirect_url,
    group_name,
    org_name,
    role,
    daterange,
  };

  const finalUrl = `${window.location.origin}${wrapOrgCode("/redeem/group-invite")}?redeem=${urlSafeBase64Encode(JSON.stringify(payload))}`;
  return finalUrl;
};

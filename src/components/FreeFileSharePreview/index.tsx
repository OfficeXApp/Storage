import { FileID, FileRecordFE, FolderID } from "@officexapp/types";
import { useIdentitySystem } from "../../framework/identity";
import { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { urlSafeBase64Decode } from "../../api/helpers";
import { message, Typography } from "antd";
import FilePage from "../FilePage";
import Title from "antd/es/skeleton/Title";

export interface fileRawUrl_BTOA {
  note: string;
  original: FileRecordFE;
}

const FreeFileSharePreview = () => {
  const params = useParams();
  const orgcode = params.orgcode;
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [redeemData, setRedeemData] = useState<fileRawUrl_BTOA | null>(null);

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

      console.log(`redeemParam`, redeemParam);

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

  if (!redeemData?.original) {
    return null;
  }

  return (
    <div style={{ padding: 32 }}>
      <Typography.Title style={{ fontSize: "1.3rem" }}>
        Free Anonymous Filesharing
      </Typography.Title>
      <FilePage file={redeemData.original} />
    </div>
  );
};

export default FreeFileSharePreview;

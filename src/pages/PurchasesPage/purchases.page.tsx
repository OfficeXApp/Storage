import { useNavigate, useParams } from "react-router-dom";
import PurchaseTab from "./purchases.tab";
import { useDispatch, useSelector } from "react-redux";
import { ReduxAppState } from "../../redux-offline/ReduxProvider";
import { useEffect } from "react";
import { getPurchaseAction } from "../../redux-offline/purchases/purchases.actions";
import { Button, Layout } from "antd";
import { Content } from "antd/es/layout/layout";
import useScreenType from "react-screentype-hook";
import { LeftOutlined } from "@ant-design/icons";
import { useIdentitySystem } from "../../framework/identity";

const PurchasePage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { wrapOrgCode } = useIdentitySystem();
  const screenType = useScreenType();
  const params = useParams();
  const purchaseID = params.purchaseID; // Changed from diskID to purchaseID
  const purchase = useSelector(
    (state: ReduxAppState) => state.purchases.purchaseMap[purchaseID || ""] // Changed from disks.diskMap to purchases.purchaseMap
  );

  useEffect(() => {
    if (purchaseID) {
      dispatch(getPurchaseAction(purchaseID));
    }
  }, [purchaseID, dispatch]); // Added dispatch to dependency array

  if (!purchase) {
    return null; // Or a loading spinner
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
          onClick={() => navigate(wrapOrgCode("/resources/purchases"))} // Changed route
          style={{
            display: "flex",
            alignItems: "center",
            fontSize: "14px",
          }}
        >
          Search Purchases
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
        <PurchaseTab
          purchaseCache={purchase}
          onDelete={() => {
            navigate(wrapOrgCode(`/resources/purchases`)); // Changed route
          }}
        />
      </Content>
    </Layout>
  );
};

export default PurchasePage;

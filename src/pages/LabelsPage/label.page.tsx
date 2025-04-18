import { useNavigate, useParams } from "react-router-dom";
import LabelTab from "./label.tab";
import { useDispatch, useSelector } from "react-redux";
import { ReduxAppState } from "../../redux-offline/ReduxProvider";
import { useEffect } from "react";
import { getLabelAction } from "../../redux-offline/labels/labels.actions";
import { Button, Layout } from "antd";
import { Content } from "antd/es/layout/layout";
import useScreenType from "react-screentype-hook";
import { LeftOutlined } from "@ant-design/icons";
import { useIdentitySystem } from "../../framework/identity";

const LabelPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { wrapOrgCode } = useIdentitySystem();
  const screenType = useScreenType();
  const params = useParams();
  const labelID = params.labelID;
  const label = useSelector(
    (state: ReduxAppState) => state.labels.labelMap[labelID || ""]
  );
  useEffect(() => {
    if (labelID) {
      dispatch(getLabelAction(labelID));
    }
  }, []);
  if (!label) {
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
          onClick={() => navigate(wrapOrgCode("/resources/labels"))}
          style={{
            display: "flex",
            alignItems: "center",
            fontSize: "14px",
          }}
        >
          Search Labels
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
        <LabelTab
          labelCache={label}
          onDelete={() => {
            navigate(wrapOrgCode(`/resources/labels`));
          }}
        />
      </Content>
    </Layout>
  );
};

export default LabelPage;

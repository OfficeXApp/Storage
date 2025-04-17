import { useNavigate, useParams } from "react-router-dom";
import GroupTab from "./group.tab";
import { useDispatch, useSelector } from "react-redux";
import { ReduxAppState } from "../../redux-offline/ReduxProvider";
import { useEffect } from "react";
import { getGroupAction } from "../../redux-offline/groups/groups.actions";
import { Button, Layout } from "antd";
import { Content } from "antd/es/layout/layout";
import useScreenType from "react-screentype-hook";
import { LeftOutlined } from "@ant-design/icons";
import { useIdentitySystem } from "../../framework/identity";

const GroupPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { wrapOrgCode } = useIdentitySystem();
  const screenType = useScreenType();
  const params = useParams();
  const groupID = params.groupID;
  const group = useSelector(
    (state: ReduxAppState) => state.groups.groupMap[groupID || ""]
  );

  console.log(`groupID`, groupID, params);

  useEffect(() => {
    if (groupID) {
      dispatch(getGroupAction(groupID));
    }
  }, [groupID, dispatch]);

  if (!group) {
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
          onClick={() => navigate(wrapOrgCode("/resources/groups"))}
          style={{
            display: "flex",
            alignItems: "center",
            fontSize: "14px",
          }}
        >
          Back to Groups
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
        <GroupTab
          groupCache={group}
          onDelete={() => {
            navigate(wrapOrgCode(`/resources/groups`));
          }}
        />
      </Content>
    </Layout>
  );
};

export default GroupPage;

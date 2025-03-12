import { useNavigate, useParams } from "react-router-dom";
import TeamTab from "./team.tab";
import { useDispatch, useSelector } from "react-redux";
import { ReduxAppState } from "../../redux-offline/ReduxProvider";
import { useEffect } from "react";
import { getTeamAction } from "../../redux-offline/teams/teams.actions";
import { Button, Layout } from "antd";
import { Content } from "antd/es/layout/layout";
import useScreenType from "react-screentype-hook";
import { LeftOutlined } from "@ant-design/icons";

const TeamPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const screenType = useScreenType();
  const params = useParams();
  const teamID = params.teamID;
  const team = useSelector(
    (state: ReduxAppState) => state.teams.teamMap[teamID || ""]
  );

  useEffect(() => {
    if (teamID) {
      dispatch(getTeamAction(teamID));
    }
  }, [teamID, dispatch]);

  if (!team) {
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
          onClick={() => navigate("/resources/teams")}
          style={{
            display: "flex",
            alignItems: "center",
            fontSize: "14px",
          }}
        >
          Back to Teams
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
        <TeamTab
          team={team}
          onDelete={() => {
            navigate(`/resources/teams`);
          }}
        />
      </Content>
    </Layout>
  );
};

export default TeamPage;

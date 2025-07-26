import { useNavigate, useParams } from "react-router-dom";
import JobRunTab from "./jobruns.tab";
import { useDispatch, useSelector } from "react-redux";
import { ReduxAppState } from "../../redux-offline/ReduxProvider";
import { useEffect } from "react";
import { getJobRunAction } from "../../redux-offline/job-runs/job-runs.actions";
import { Button, Layout } from "antd";
import { Content } from "antd/es/layout/layout";
import useScreenType from "react-screentype-hook";
import { LeftOutlined } from "@ant-design/icons";
import { useIdentitySystem } from "../../framework/identity";

const JobRunPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { wrapOrgCode } = useIdentitySystem();
  const screenType = useScreenType();
  const params = useParams();
  const jobRunID = params.jobRunID; // Changed from diskID to jobRunID
  const jobRun = useSelector(
    (state: ReduxAppState) => state.jobRuns.jobRunMap[jobRunID || ""] // Changed from disks.diskMap to jobRuns.jobRunMap
  );

  useEffect(() => {
    if (jobRunID) {
      dispatch(getJobRunAction(jobRunID));
    }
  }, [jobRunID, dispatch]); // Added dispatch to dependency array

  if (!jobRun) {
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
          onClick={() => navigate(wrapOrgCode("/resources/job-runs"))} // Changed route
          style={{
            display: "flex",
            alignItems: "center",
            fontSize: "14px",
          }}
        >
          Search Job Runs
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
        <JobRunTab
          jobRunCache={jobRun}
          onDelete={() => {
            navigate(wrapOrgCode(`/resources/job-runs`)); // Changed route
          }}
        />
      </Content>
    </Layout>
  );
};

export default JobRunPage;

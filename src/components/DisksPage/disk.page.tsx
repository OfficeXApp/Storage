import { useNavigate, useParams } from "react-router-dom";
import DiskTab from "./disk.tab";
import { useDispatch, useSelector } from "react-redux";
import { ReduxAppState } from "../../redux-offline/ReduxProvider";
import { useEffect } from "react";
import { getDiskAction } from "../../redux-offline/disks/disks.actions";
import { Button, Layout } from "antd";
import { Content } from "antd/es/layout/layout";
import useScreenType from "react-screentype-hook";
import { LeftOutlined } from "@ant-design/icons";

const DiskPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const screenType = useScreenType();
  const params = useParams();
  const diskID = params.diskID;
  const disk = useSelector(
    (state: ReduxAppState) => state.disks.diskMap[diskID || ""]
  );
  useEffect(() => {
    if (diskID) {
      dispatch(getDiskAction(diskID));
    }
  }, []);
  if (!disk) {
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
          onClick={() => navigate("/resources/disks")}
          style={{
            display: "flex",
            alignItems: "center",
            fontSize: "14px",
          }}
        >
          Search Disks
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
        <DiskTab
          disk={disk}
          onDelete={() => {
            navigate(`/resources/disks`);
          }}
        />
      </Content>
    </Layout>
  );
};

export default DiskPage;

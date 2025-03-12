import { useNavigate, useParams } from "react-router-dom";
import TagTab from "./tag.tab";
import { useDispatch, useSelector } from "react-redux";
import { ReduxAppState } from "../../redux-offline/ReduxProvider";
import { useEffect } from "react";
import { getTagAction } from "../../redux-offline/tags/tags.actions";
import { Button, Layout } from "antd";
import { Content } from "antd/es/layout/layout";
import useScreenType from "react-screentype-hook";
import { LeftOutlined } from "@ant-design/icons";

const TagPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const screenType = useScreenType();
  const params = useParams();
  const tagID = params.tagID;
  const tag = useSelector(
    (state: ReduxAppState) => state.tags.tagMap[tagID || ""]
  );
  useEffect(() => {
    if (tagID) {
      dispatch(getTagAction(tagID));
    }
  }, []);
  if (!tag) {
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
          onClick={() => navigate("/resources/tags")}
          style={{
            display: "flex",
            alignItems: "center",
            fontSize: "14px",
          }}
        >
          Search Tags
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
        <TagTab
          tag={tag}
          onDelete={() => {
            navigate(`/resources/tags`);
          }}
        />
      </Content>
    </Layout>
  );
};

export default TagPage;

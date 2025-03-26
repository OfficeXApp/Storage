import { useNavigate, useParams } from "react-router-dom";
import ContactTab from "./contact.tab";
import { useDispatch, useSelector } from "react-redux";
import { ReduxAppState } from "../../redux-offline/ReduxProvider";
import { useEffect } from "react";
import { getContactAction } from "../../redux-offline/contacts/contacts.actions";
import { Button, Layout } from "antd";
import { Content } from "antd/es/layout/layout";
import useScreenType from "react-screentype-hook";
import { LeftOutlined } from "@ant-design/icons";
import { useIdentitySystem } from "../../framework/identity";

const ContactPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { wrapOrgCode } = useIdentitySystem();
  const screenType = useScreenType();
  const params = useParams();
  const userID = params.userID;
  const contact = useSelector(
    (state: ReduxAppState) => state.contacts.contactMap[userID || ""]
  );
  useEffect(() => {
    if (userID) {
      dispatch(getContactAction(userID));
    }
  }, []);
  if (!contact) {
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
          onClick={() => navigate(wrapOrgCode("/resources/contacts"))}
          style={{
            display: "flex",
            alignItems: "center",
            fontSize: "14px",
          }}
        >
          Search Contacts
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
        <ContactTab
          contact={contact}
          onDelete={() => {
            navigate(wrapOrgCode(`/resources/contacts`));
          }}
        />
      </Content>
    </Layout>
  );
};

export default ContactPage;

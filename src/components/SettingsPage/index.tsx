import React from "react";
import { Button, Input, Layout, message, Typography } from "antd";
import ICPCanisterSettingsCard from "../ICPCanisterSettingsCard";
import { useIdentitySystem } from "../../framework/identity";
import { CopyOutlined, HomeFilled } from "@ant-design/icons";
import ProfileSettingsCard from "../ProfileSettingsCard";

const { Content, Footer } = Layout;
const { Title, Paragraph, Text } = Typography;

const SettingsPage = () => {
  const { currentOrg } = useIdentitySystem();
  return (
    <Layout style={{ minHeight: "100vh", backgroundColor: "white" }}>
      <Content style={{ padding: "0 16px", maxWidth: "800px", gap: 16 }}>
        <Title level={1} style={{ fontWeight: "bold" }}>
          Settings
        </Title>

        <ICPCanisterSettingsCard />
        <br />
        <br />
        <ProfileSettingsCard />
        <br />
        <br />
      </Content>
      <Footer style={{ textAlign: "center" }}>OfficeX ©2025</Footer>
    </Layout>
  );
};

export default SettingsPage;

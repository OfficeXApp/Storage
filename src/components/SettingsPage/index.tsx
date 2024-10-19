import React from 'react'
import {
    Layout,
    Typography,
} from "antd";
import StorjSettingsCard from '../StorjSettingsCard';
import ICPCanisterSettingsCard from '../ICPCanisterSettingsCard';
import SecuritySettingsCard from '../SecuritySettingsCard';

const { Content, Footer } = Layout;
const { Title, Paragraph, Text } = Typography;

const SettingsPage = () => {
    return (
        <Layout style={{ minHeight: "100vh", backgroundColor: "white" }}>
            <Content style={{ padding: "0 16px", maxWidth: '800px', gap: 16 }}>
                <Title level={1} style={{ fontWeight: "bold" }}>Settings</Title>
                <br />
                <ICPCanisterSettingsCard />
                <br />
                <StorjSettingsCard />
                <br />
                <SecuritySettingsCard />
                <br /><br />
            </Content>
            <Footer style={{ textAlign: "center" }}>OfficeX ©2024</Footer>
        </Layout>
    )
}

export default SettingsPage
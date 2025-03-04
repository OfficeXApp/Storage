import React, { useState } from "react";
import { Button, Input, Layout, Typography, message } from "antd";
import type {
  Disk,
  IRequestCreateDisk,
  IRequestListDisks,
  IResponseCreateDisk,
  IResponseListDisks,
} from "@officexapp/types";
import { DiskTypeEnum } from "@officexapp/types";
import { useDispatch, useSelector } from "react-redux";
import { AppState } from "../../store/store";
import { createDisk, fetchDisks } from "../../store/disks/disks.actions";
const { Content, Footer } = Layout;
const { Title, Paragraph, Text } = Typography;

const WebhooksPage = () => {
  return (
    <Layout style={{ minHeight: "100vh", backgroundColor: "white" }}>
      <Content style={{ padding: "0 16px", maxWidth: "800px", gap: 16 }}>
        <Title level={1} style={{ fontWeight: "bold" }}>
          WebhooksPage
        </Title>
      </Content>
      <Footer style={{ textAlign: "center" }}>OfficeX ©2024</Footer>
    </Layout>
  );
};

export default WebhooksPage;

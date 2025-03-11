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
import { AppState } from "../../redux-offline/ReduxProvider";
import {
  createDisk,
  fetchDisks,
} from "../../redux-offline/disks/disks.actions";
const { Content, Footer } = Layout;
const { Title, Paragraph, Text } = Typography;

const TeamsPage = () => {
  return (
    <Layout style={{ minHeight: "100vh", backgroundColor: "white" }}>
      <Content style={{ padding: "0 16px", maxWidth: "800px", gap: 16 }}>
        <Title level={1} style={{ fontWeight: "bold" }}>
          Teams
        </Title>
      </Content>
    </Layout>
  );
};

export default TeamsPage;

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
import { useIdentitySystem } from "../../framework/identity";
const { Content, Footer } = Layout;
const { Title, Paragraph, Text } = Typography;

const SandboxPage = () => {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [sig, setSig] = useState("");
  const { generateSignature, currentOrg, currentAPIKey } = useIdentitySystem();
  const [apiKey, setApiKey] = React.useState<string>(
    "" // currentAPIKey?.value || ""
  );

  const isOnline = useSelector((state: AppState) => state.offline?.online);
  const disks = useSelector((state: AppState) => state.disks.disks);

  const handleCreateDisk = () => {
    dispatch(
      createDisk({
        name: "Project Cloud Storage",
        disk_type: DiskTypeEnum.LocalSSD,
        public_note: "Storage for team project files",
        private_note: "Contains sensitive project data",
        auth_json: JSON.stringify({
          access_key: "AKIAIOSFODNN7EXAMPLE",
          secret_key: "redacted",
          region: "us-west-2",
          bucket: "my-project-files",
        }),
        external_id: "ext-disk-001",
        external_payload: JSON.stringify({
          department: "engineering",
          cost_center: "cc-12345",
          project_id: "p-987654",
        }),
      })
    );

    message.success(
      isOnline
        ? "Creating disk..."
        : "Queued disk creation for when you're back online"
    );
  };
  const handleListDisks = () => {
    console.log(`currentOrg`, currentOrg);
    console.log(`apiKey`, apiKey);
    dispatch(fetchDisks());
  };

  return (
    <Layout style={{ minHeight: "100vh", backgroundColor: "white" }}>
      <Content style={{ padding: "0 16px", maxWidth: "800px", gap: 16 }}>
        <Title level={1} style={{ fontWeight: "bold" }}>
          Sandbox Page
        </Title>
        <br />
        <p>{`${currentOrg?.endpoint}/v1/${currentOrg?.driveID}/*`}</p>
        <Button
          onClick={async () => {
            const _sig = await generateSignature();
            setSig(_sig || "");
          }}
        >
          Generate Signature
        </Button>
        <Input value={sig}></Input>
        <label>API Key Token</label>
        <Input
          value={apiKey}
          placeholder="Enter API key or signature"
          onChange={(e) => setApiKey(e.target.value)}
        ></Input>
        <br />
        <Button onClick={handleCreateDisk}>Create Disk</Button>
        <Button onClick={handleListDisks}>List Disks</Button>

        <br />
        {JSON.stringify(disks, null, 2)}
      </Content>
      <Footer style={{ textAlign: "center" }}>OfficeX ©2024</Footer>
    </Layout>
  );
};

export default SandboxPage;

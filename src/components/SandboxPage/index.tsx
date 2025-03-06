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

const SandboxPage = () => {
  const dispatch = useDispatch();
  const [apiKey, setApiKey] = React.useState<string>(
    "eyJhdXRoX3R5cGUiOiJBUElfX0tFWSIsInZhbHVlIjoiZGU5NGU1ZjNkMDExN2NjZmE0ZGIxOGY5MGUyMzhkYjAxNWNiMjRmMDhhZjBkZjQ0NGEzOTdjMDM1OTU3MzJiOSJ9"
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

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
    dispatch(fetchDisks());
  };

  // const createDisk = async () => {
  //   setLoading(true);
  //   setError(null);

  //   try {
  //     const payload: IRequestCreateDisk = {
  //       action: "CREATE",
  //       name: "Project Cloud Storage",
  //       disk_type: DiskTypeEnum.LocalSSD,
  //       public_note: "Storage for team project files",
  //       private_note: "Contains sensitive project data",
  //       auth_json: JSON.stringify({
  //         access_key: "AKIAIOSFODNN7EXAMPLE",
  //         secret_key: "redacted",
  //         region: "us-west-2",
  //         bucket: "my-project-files",
  //       }),
  //       external_id: "ext-disk-001",
  //       external_payload: JSON.stringify({
  //         department: "engineering",
  //         cost_center: "cc-12345",
  //         project_id: "p-987654",
  //       }),
  //     };

  //     const response = await fetch(
  //       "http://bkyz2-fmaaa-aaaaa-qaaaq-cai.localhost:8000/v1/default/disks/upsert",
  //       {
  //         method: "POST",
  //         headers: {
  //           "Content-Type": "application/json",
  //           Authorization: `Bearer ${apiKey}`,
  //         },
  //         body: JSON.stringify(payload),
  //       }
  //     );

  //     if (!response.ok) {
  //       throw new Error(`HTTP error! Status: ${response.status}`);
  //     }

  //     const data: IResponseCreateDisk = await response.json();
  //     message.success("Disk created successfully!");
  //     console.log("Disk created:", data.ok.data);
  //     // Optionally, you can update the disks state with the newly created disk
  //     // setDisks([...disks, data.ok.data]);
  //   } catch (err: any) {
  //     console.error("Error creating disk:", err);
  //     setError(err.message);
  //     message.error("Failed to create disk");
  //   } finally {
  //     setLoading(false);
  //   }
  // };
  // const listDisks = async () => {
  //   setLoading(true);
  //   setError(null);

  //   try {
  //     const body: IRequestListDisks = {};
  //     const response = await fetch(
  //       "http://bkyz2-fmaaa-aaaaa-qaaaq-cai.localhost:8000/v1/default/disks/list",
  //       {
  //         method: "POST",
  //         headers: {
  //           "Content-Type": "application/json",
  //           Authorization: `Bearer ${apiKey}`,
  //         },
  //         body: JSON.stringify(body),
  //       }
  //     );

  //     if (!response.ok) {
  //       throw new Error(`HTTP error! Status: ${response.status}`);
  //     }

  //     const data: IResponseListDisks = await response.json();
  //     setDisks(data.ok.data.items);
  //     message.success("Disks fetched successfully!");
  //   } catch (err: any) {
  //     console.error("Error fetching disks:", err);
  //     setError(err.message);
  //     message.error("Failed to fetch disks list");
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  return (
    <Layout style={{ minHeight: "100vh", backgroundColor: "white" }}>
      <Content style={{ padding: "0 16px", maxWidth: "800px", gap: 16 }}>
        <Title level={1} style={{ fontWeight: "bold" }}>
          Sandbox Page
        </Title>
        <br />
        <label>API Key Token</label>
        <Input
          value={apiKey}
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

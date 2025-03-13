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
import { ReduxAppState } from "../../redux-offline/ReduxProvider";
import {
  createDiskAction,
  deleteDiskAction,
  listDisksAction,
  getDiskAction,
  updateDiskAction,
} from "../../redux-offline/disks/disks.actions";
import { useIdentitySystem } from "../../framework/identity";
import { listContactsAction } from "../../redux-offline/contacts/contacts.actions";
import ContactSelector from "../ContactSelector";
const { Content, Footer } = Layout;
const { Title, Paragraph, Text } = Typography;

const SandboxPage = () => {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [sig, setSig] = useState("");
  const { generateSignature, currentOrg, currentAPIKey } = useIdentitySystem();
  const [diskName, setDiskName] = React.useState<string>("");
  const [getDiskID, setGetDiskID] = React.useState<string>("");
  const [updateDiskID, setUpdateDiskID] = React.useState<string>("");
  const [deleteDiskID, setDeleteDiskID] = React.useState<string>("");

  const isOnline = useSelector((state: ReduxAppState) => state.offline?.online);
  const disks = useSelector((state: ReduxAppState) => state.disks.disks);

  const handleCreateDisk = () => {
    dispatch(
      createDiskAction({
        name: diskName,
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
    dispatch(listDisksAction({}));

    message.success(
      isOnline
        ? "Listing disk..."
        : "Queued disk listing for when you're back online"
    );
  };
  const handleUpdateDisk = () => {
    dispatch(
      updateDiskAction({
        id: updateDiskID,
        name: `${diskName} Updated`,
      })
    );
    message.success(
      isOnline
        ? "Updating disk..."
        : "Queued disk edit update for when you're back online"
    );
  };
  const handleDeleteDisk = () => {
    dispatch(deleteDiskAction({ id: deleteDiskID }));
    message.success(
      isOnline
        ? "Deleting disk..."
        : "Queued disk deletion for when you're back online"
    );
  };
  const handleGetDisk = () => {
    dispatch(getDiskAction(getDiskID));
    message.success(
      isOnline
        ? "Getting disk..."
        : "Queued disk read for when you're back online"
    );
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
        <br />
        <br />
        <Button type="primary" block onClick={handleListDisks}>
          List Disks
        </Button>
        <br />
        <br />
        <Input
          value={getDiskID}
          placeholder="DiskID"
          onChange={(e) => setGetDiskID(e.target.value)}
          suffix={
            <Button type="primary" onClick={handleGetDisk}>
              Get Disk
            </Button>
          }
        ></Input>
        <br />
        <Input
          value={diskName}
          placeholder="Disk Name"
          onChange={(e) => setDiskName(e.target.value)}
          suffix={
            <Button type="primary" onClick={handleCreateDisk}>
              Create Disk
            </Button>
          }
        ></Input>
        <br />
        <Input
          value={updateDiskID}
          placeholder="DiskID"
          onChange={(e) => setUpdateDiskID(e.target.value)}
          suffix={
            <Button type="primary" onClick={handleUpdateDisk}>
              Update Disk
            </Button>
          }
        ></Input>
        <br />
        <Input
          value={deleteDiskID}
          placeholder="DiskID"
          onChange={(e) => setDeleteDiskID(e.target.value)}
          suffix={
            <Button type="primary" onClick={handleDeleteDisk}>
              Delete Disk
            </Button>
          }
        ></Input>
        <br />

        <br />
        {/* JSON print pretty */}
        {
          <pre>
            <code>{JSON.stringify(disks, null, 2)}</code>
          </pre>
        }
      </Content>
      <ContactSelector />
      <br />
      <br />
      <br />
      <br />
      <br />
      <br />
      <br />
      <br />
      <br />
      <br />
      <br />
      <br />
      <Footer style={{ textAlign: "center" }}>OfficeX ©2024</Footer>
    </Layout>
  );
};

export default SandboxPage;

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

  const handleTestBackendRoute = async () => {
    const url = `https://is5sx-kqaaa-aaaak-apcoa-cai.icp0.io/v1/default/organization/snapshot`;
    console.log(`firing at url test backend`, url);
    const password = "123";
    // Only the password part should go in the Authorization header
    const response = await fetch(url, {
      method: "GET",
      mode: "cors",
      // credentials: "include",
      headers: {
        // Authorization: `Bearer ${password}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Error: ${response.status}`);
    }

    const data = await response.json();
    console.log("Received data:", data);
  };
  const handleWhoAmIRoute = async () => {
    const url = `https://is5sx-kqaaa-aaaak-apcoa-cai.icp0.io/v1/default/organization/whoami`;
    console.log(`firing at url test backend`, url);
    const password = "_______";
    // Only the password part should go in the Authorization header
    const response = await fetch(`${url}?auth=${password}`, {
      method: "GET",
      mode: "cors",
      // credentials: "include",
      headers: {
        // Authorization: `Bearer ${password}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Error: ${response.status}`);
    }

    const data = await response.json();
    console.log("Received data:", data);
  };
  const handleTestFactoryRoute = async () => {
    const url = `https://glvgj-aiaaa-aaaak-apdmq-cai.icp0.io/v1/default/factory/snapshot`;
    console.log(`firing at url test factory`, url);
    const password = "123";
    // Only the password part should go in the Authorization header
    const response = await fetch(url, {
      method: "GET",
      // mode: "no-cors",
      // credentials: "include",
      headers: {
        // Authorization: `Bearer ${password}`,
      },
    });

    console.log(`response`, response);

    if (!response.ok) {
      throw new Error(`Error: ${response.status}`);
    }

    const data = await response.json();
    console.log("Received data:", data);
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
        <p>{`${currentOrg?.endpoint}/v1/drive/${currentOrg?.driveID}/*`}</p>
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
        <Button type="primary" block onClick={handleWhoAmIRoute}>
          Who Am I
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
            <Button type="primary" onClick={handleTestBackendRoute}>
              Test Backend Route
            </Button>
          }
        ></Input>
        <br />
        <Input
          value={updateDiskID}
          placeholder="DiskID"
          onChange={(e) => setUpdateDiskID(e.target.value)}
          suffix={
            <Button type="primary" onClick={handleTestFactoryRoute}>
              Test Factory Route
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
      <Footer style={{ textAlign: "center" }}>OfficeX ©2025</Footer>
    </Layout>
  );
};

export default SandboxPage;

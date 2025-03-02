import React, { useEffect, useState } from "react";
import {
  Modal,
  Form,
  Input,
  Button,
  Typography,
  Card,
  message,
  Col,
  Statistic,
  Space,
} from "antd";
import {
  EyeInvisibleOutlined,
  EyeTwoTone,
  ReloadOutlined,
} from "@ant-design/icons";
import { Identity } from "../../framework";
import { Actor } from "@dfinity/agent";
import { idlFactory as idlFactory_Drive } from "../../declarations/officex-canisters-backend/officex-canisters-backend.did.js";
import { formatCycles } from "../../api/icp.js";
import ConnectICPButton from "../ConnectICPButton/index.js";
const { Text, Link } = Typography;
const { useIdentity } = Identity;

const ICPCanisterSettingsCard = () => {
  const { icpCanisterId, icpAgent } = useIdentity();
  const [gasBalance, setGasBalance] = useState(0n);

  useEffect(() => {
    setTimeout(() => {
      checkGasBalance();
    }, 500);
  }, [icpCanisterId]);

  const checkGasBalance = async () => {
    if (!icpAgent.current) {
      return;
    }
    if (!icpCanisterId) {
      return;
    }
    const actor = Actor.createActor(idlFactory_Drive, {
      agent: icpAgent.current,
      canisterID: icpCanisterId,
    });
    const res = await actor.ping();
    console.log(`Ping response: ${res}`);
    const gas = await actor.get_canister_balance();
    console.log(`Gas: `, gas);
    console.log("Gas Balance:", gas);
    setGasBalance(gas as bigint);
  };
  return (
    <Card title="Cloud Settings" type="inner">
      <Text>
        OfficeX uses ICP (Internet Computer Protocol) for sovereign private
        cloud. No corporation or government can access your private files - only
        you. OfficeX has no subscription fees, but you have to pay gas to use
        the Internet Computer.{" "}
        <a href="https://internetcomputer.org/what-is-the-ic" target="_blank">
          Learn more
        </a>
      </Text>
      <br />
      <br />
      {icpAgent.current && icpCanisterId ? (
        <>
          <Col span={12}>
            <Statistic
              title={
                <div style={{ display: "flex", alignItems: "center" }}>
                  <span>Gas Remaining</span>
                  <ReloadOutlined
                    style={{ marginLeft: 8, cursor: "pointer" }}
                    onClick={checkGasBalance}
                  />
                </div>
              }
              value={formatCycles(gasBalance)}
              precision={2}
            />
            <Button style={{ marginTop: 16 }} type="primary">
              Recharge
            </Button>
          </Col>
          <br />
          <Input
            prefix="Canister #"
            placeholder="Your ICP Canister ID"
            value={icpCanisterId}
            disabled
            style={{ textAlign: "center", marginBottom: "5px" }}
          />
        </>
      ) : (
        <>
          <div style={{ maxWidth: "300px" }}>
            <ConnectICPButton />
          </div>
        </>
      )}
    </Card>
  );
};

export default ICPCanisterSettingsCard;

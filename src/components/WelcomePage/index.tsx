import React, { useState } from "react";
import {
  Typography,
  Checkbox,
  Card,
  Space,
  Divider,
  Row,
  Col,
  Button,
} from "antd";
import { Link } from "react-router-dom";
import { useIdentitySystem } from "../../framework/identity";
import TagCopy from "../TagCopy";
import useScreenType from "react-screentype-hook";

const { Title, Paragraph } = Typography;

const WelcomePage = () => {
  const screenType = useScreenType();
  const { wrapOrgCode, currentOrg } = useIdentitySystem();
  const [tasks, setTasks] = useState([
    {
      id: "1",
      text: "Upload and share files",
      done: false,
      route: wrapOrgCode("/drive"),
    },
    {
      id: "2",
      text: "Invite your team (optional)",
      done: false,
      route: wrapOrgCode("/resources/groups"),
    },
    {
      id: "3",
      text: "Login on multiple devices (optional)",
      done: false,
      route: wrapOrgCode("/settings"),
    },
    {
      id: "4",
      text: "Setup advanced permissions (optional)",
      done: false,
      route: wrapOrgCode("/resources/permissions"),
    },
    {
      id: "5",
      text: "Automate with webhooks & REST API (optional)",
      done: false,
      route: wrapOrgCode("/resources/webhooks"),
    },
  ]);

  const handleTaskToggle = (id: string) => {
    setTasks(
      tasks.map((task) =>
        task.id === id ? { ...task, done: !task.done } : task
      )
    );
  };

  return (
    <div
      style={{
        padding: screenType.isMobile ? 8 : 32,
        maxWidth: "768px",
        margin: "0 auto",
      }}
    >
      <Card style={{ boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)" }}>
        <Typography>
          <Title level={2} style={{ textAlign: "center", marginBottom: 16 }}>
            {`Welcome to ${currentOrg?.nickname}`}{" "}
            <TagCopy
              id={currentOrg?.driveID || ""}
              style={{ marginLeft: 8, marginTop: -8 }}
            />
          </Title>
          <Divider />
          <Paragraph
            style={{ fontSize: 16, color: "#666666", marginBottom: 24 }}
          >
            Anonymous OfficeX is where freedom works. Documents, Spreadsheets &
            Cloud Storage for the sovereign individual. Enterprise open source &
            decentralized.{" "}
            <a href="https://youtube.com/@officexapp" target="_blank">
              Watch Tutorials
            </a>
          </Paragraph>
        </Typography>

        <div style={{ marginTop: 24 }}>
          <Title level={4} style={{ marginBottom: 16 }}>
            Getting Started
          </Title>
          <Space direction="vertical" style={{ width: "100%" }}>
            {tasks.map((task) => (
              <div
                key={task.id}
                onClick={() => handleTaskToggle(task.id)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  padding: 12,
                  border: "1px solid #e8e8e8",
                  borderRadius: 4,
                  cursor: "pointer",
                  justifyContent: "space-between",
                }}
              >
                <div>
                  <Checkbox
                    checked={task.done}
                    style={{ marginRight: 12 }}
                    onChange={() => handleTaskToggle(task.id)}
                  />
                  <span
                    style={{
                      marginLeft: 8,
                      textDecoration: task.done ? "line-through" : "none",
                      color: task.done ? "#bfbfbf" : "inherit",
                    }}
                  >
                    {task.text}
                  </span>
                </div>
                <Link to={task.route}>
                  <Button type="link">Open</Button>
                </Link>
              </div>
            ))}
          </Space>
        </div>

        <div style={{ marginTop: 24, textAlign: "center" }}>
          <Paragraph style={{ color: "#8c8c8c" }}>
            {tasks.filter((t) => t.done).length} of {tasks.length} tasks
            completed
          </Paragraph>
        </div>
      </Card>

      <br />
      <br />
      <br />
      <br />
      <br />
      <br />
      <br />
    </div>
  );
};

export default WelcomePage;

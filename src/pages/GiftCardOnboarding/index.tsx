import {
  CloudUploadOutlined,
  HomeOutlined,
  LoadingOutlined,
  SmileOutlined,
  SolutionOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { Button, Layout, Steps, message, theme } from "antd";
import { Content } from "antd/es/layout/layout";
import React, { useState } from "react";
import useScreenType from "react-screentype-hook";

interface GiftCardOnboardingProps {}

const GiftCardOnboarding: React.FC<GiftCardOnboardingProps> = () => {
  const screenType = useScreenType();
  const { token } = theme.useToken();
  const [current, setCurrent] = useState(0);

  const next = () => {
    setCurrent(current + 1);
  };

  const prev = () => {
    setCurrent(current - 1);
  };

  // Define steps with content
  const steps = [
    {
      title: "Owner",
      icon: <UserOutlined />,
      content: (
        <div
          style={{
            lineHeight: "260px",
            textAlign: "center",
            color: token.colorTextTertiary,
            backgroundColor: token.colorFillAlter,
            borderRadius: token.borderRadiusLG,
            border: `1px dashed ${token.colorBorder}`,
          }}
        >
          Owner Information Content
        </div>
      ),
    },
    {
      title: "Organization",
      icon: <HomeOutlined />,
      content: (
        <div
          style={{
            lineHeight: "260px",
            textAlign: "center",
            color: token.colorTextTertiary,
            backgroundColor: token.colorFillAlter,
            borderRadius: token.borderRadiusLG,
            border: `1px dashed ${token.colorBorder}`,
          }}
        >
          Organization Information Content
        </div>
      ),
    },
    {
      title: "Create",
      icon: <CloudUploadOutlined />,
      content: (
        <div
          style={{
            lineHeight: "260px",
            textAlign: "center",
            color: token.colorTextTertiary,
            backgroundColor: token.colorFillAlter,
            borderRadius: token.borderRadiusLG,
            border: `1px dashed ${token.colorBorder}`,
          }}
        >
          Create Gift Card Content
        </div>
      ),
    },
  ];

  // Convert steps to items for the Steps component
  const items = steps.map((item, index) => ({
    key: item.title,
    title: item.title,
    status: index < current ? "finish" : index === current ? "process" : "wait",
    icon: item.icon,
  }));

  return (
    <Layout style={{ height: "100%", backgroundColor: "white" }}>
      <Content
        style={{
          padding: screenType.isMobile ? "16px" : "32px",
          width: "100%",
          gap: 16,
        }}
      >
        <Steps
          size="small"
          responsive={false}
          labelPlacement="horizontal"
          current={current}
          // @ts-ignore
          items={items}
        />

        <div style={{ marginTop: 16 }}>{steps[current].content}</div>

        <div
          style={{ marginTop: 24, display: "flex", justifyContent: "flex-end" }}
        >
          {current > 0 && (
            <Button size="large" style={{ margin: "0 8px" }} onClick={prev}>
              Previous
            </Button>
          )}
          {current < steps.length - 1 && (
            <Button size="large" type="primary" onClick={next}>
              Next
            </Button>
          )}
          {current === steps.length - 1 && (
            <Button
              type="primary"
              size="large"
              onClick={() => message.success("Gift card setup complete!")}
            >
              Done
            </Button>
          )}
        </div>
      </Content>
    </Layout>
  );
};

export default GiftCardOnboarding;

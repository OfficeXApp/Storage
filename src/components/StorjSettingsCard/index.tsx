import React, { useState, useEffect } from "react";
import { Modal, Form, Input, Button, Typography, Card, message } from "antd";
import { EyeInvisibleOutlined, EyeTwoTone } from "@ant-design/icons";
import { S3Client, ListBucketsCommand } from "@aws-sdk/client-s3";
import {
  LOCAL_STORAGE_STORJ_ACCESS_KEY,
  LOCAL_STORAGE_STORJ_ENDPOINT,
  LOCAL_STORAGE_STORJ_SECRET_KEY,
  useDrive,
} from "../../framework";
import mixpanel from "mixpanel-browser";

const { Text, Link } = Typography;

interface StorjSettings {
  accessKey: string;
  secretKey: string;
  endpoint: string;
}

interface StorjSettingsCardProps {
  onSave?: (settings: StorjSettings) => void;
  onCancel?: () => void;
  showCancelButton?: boolean;
}

const StorjSettingsCard: React.FC<StorjSettingsCardProps> = ({
  onSave,
  onCancel,
}) => {
  const { initStorj } = useDrive();
  const [form] = Form.useForm();
  const [isTesting, setIsTesting] = useState(false);

  useEffect(() => {
    // Load saved values from localStorage
    form.setFieldsValue({
      accessKey: localStorage.getItem(LOCAL_STORAGE_STORJ_ACCESS_KEY) || "",
      secretKey: localStorage.getItem(LOCAL_STORAGE_STORJ_SECRET_KEY) || "",
      endpoint: localStorage.getItem(LOCAL_STORAGE_STORJ_ENDPOINT) || "",
    });
  }, [form]);

  const handleSave = async (values: StorjSettings) => {
    const isValid = await testStorjCredentials(values);
    if (isValid) {
      // Save to localStorage
      localStorage.setItem(LOCAL_STORAGE_STORJ_ACCESS_KEY, values.accessKey);
      localStorage.setItem(LOCAL_STORAGE_STORJ_SECRET_KEY, values.secretKey);
      localStorage.setItem(LOCAL_STORAGE_STORJ_ENDPOINT, values.endpoint);
      if (onSave) {
        onSave(values);
      }
      mixpanel.track("Valid Storj Creds");
    }
  };

  const showCancelButton = !!onCancel;

  const testStorjCredentials = async (values: StorjSettings) => {
    setIsTesting(true);
    try {
      const client = new S3Client({
        credentials: {
          accessKeyId: values.accessKey,
          secretAccessKey: values.secretKey,
        },
        endpoint: values.endpoint,
        region: "us-east-1", // Storj doesn't use regions, but S3 client requires one
      });

      const command = new ListBucketsCommand({});
      await client.send(command);

      message.success("Successfully connected to Storj!");
      await initStorj({
        accessKeyId: values.accessKey,
        secretAccessKey: values.secretKey,
        endpoint: values.endpoint,
      });
      return true;
    } catch (error) {
      console.error("Error invalid Storj credentials:", error);
      message.error(
        "Failed to validate Storj credentials. Please check and try again."
      );
      return false;
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <Card
      title="Storj Settings"
      {...(showCancelButton ? {} : { type: "inner" })}
      extra={
        <Link
          href="https://www.storj.io/signup?utm_source=officexapp&utm_medium=officexapp&utm_campaign=officexapp&utm_term=officexapp&utm_content=officexapp"
          target="_blank"
        >
          Get Started - Free 25GB
        </Link>
      }
      bordered={!showCancelButton}
    >
      <Text>
        OfficeX uses Storj.io for decentralized cloud storage. Get free 25GB
        storage when you{" "}
        <a
          href="https://www.storj.io/signup?utm_source=officexapp&utm_medium=officexapp&utm_campaign=officexapp&utm_term=officexapp&utm_content=officexapp"
          target="_blank"
        >
          signup here
        </a>
        . Then enter your credentials below.
      </Text>
      <Form
        form={form}
        onFinish={handleSave}
        layout="vertical"
        style={{ marginTop: 16 }}
      >
        <Form.Item
          name="accessKey"
          label="Access Key"
          rules={[{ required: true, message: "Please input your Access Key!" }]}
        >
          <Input.Password
            placeholder="Enter Access Key"
            iconRender={(visible) =>
              visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />
            }
          />
        </Form.Item>
        <Form.Item
          name="secretKey"
          label="Secret Key"
          rules={[{ required: true, message: "Please input your Secret Key!" }]}
        >
          <Input.Password
            placeholder="Enter Secret Key"
            iconRender={(visible) =>
              visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />
            }
          />
        </Form.Item>
        <Form.Item
          name="endpoint"
          label="Endpoint"
          rules={[{ required: true, message: "Please input your Endpoint!" }]}
        >
          <Input placeholder="Enter Endpoint" />
        </Form.Item>
        <br />
        <Form.Item>
          <Button
            type="primary"
            loading={isTesting}
            htmlType="submit"
            style={{ marginRight: 8 }}
          >
            Save
          </Button>
          {showCancelButton && <Button onClick={onCancel}>Cancel</Button>}
        </Form.Item>
      </Form>
    </Card>
  );
};

export default StorjSettingsCard;

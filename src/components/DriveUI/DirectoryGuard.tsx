import React, { useState } from "react";
import { Result, Input, Button, Space, Typography } from "antd";
import { LockOutlined } from "@ant-design/icons";

const { Text } = Typography;
const { Password } = Input;

interface DirectoryGuardProps {
  onPasswordSubmit?: (password: string) => void;
}

const DirectoryGuard: React.FC<DirectoryGuardProps> = ({
  onPasswordSubmit,
}) => {
  const [password, setPassword] = useState<string>("");

  const handleSubmit = () => {
    if (onPasswordSubmit && password.trim()) {
      onPasswordSubmit(password);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSubmit();
    }
  };

  return (
    <div style={{ marginTop: 48 }}>
      <Result
        status="403"
        title="Unauthorized"
        subTitle="You do not have permission to view this directory."
        extra={
          <div style={{ maxWidth: 400, margin: "0 auto" }}>
            <Space direction="vertical" size="large" style={{ width: "100%" }}>
              <Text>If you have a temporary password you can try it below</Text>

              <Space.Compact style={{ width: "100%" }}>
                <Password
                  prefix={<LockOutlined />}
                  placeholder="Enter temporary password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyPress={handleKeyPress}
                  allowClear
                />
                <Button type="primary" onClick={handleSubmit}>
                  Enter
                </Button>
              </Space.Compact>
            </Space>
          </div>
        }
      />
    </div>
  );
};

export default DirectoryGuard;

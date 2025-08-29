// src/components/ContactsPage/contacts.add.tsx

import React, { useState } from "react";
import { Button, Drawer, Typography, Input, Form } from "antd";
import { UserOutlined } from "@ant-design/icons";

const { Paragraph } = Typography;

// Define profile type
export type Profile = {
  id: string;
  name: string;
  email?: string;
  phone?: string;
};

interface TemplatesAddDrawerProps {
  open: boolean;
  onClose: () => void;
  onAddContact: (name: string) => void;
}

const TemplatesAddDrawer: React.FC<TemplatesAddDrawerProps> = ({
  open,
  onClose,
  onAddContact,
}) => {
  const [newContactName, setNewContactName] = useState<string>("");

  const handleAddContact = () => {
    if (newContactName.trim()) {
      onAddContact(newContactName);
      setNewContactName(""); // Reset the input field
    }
  };

  return (
    <Drawer
      title="Add New Template"
      placement="right"
      onClose={onClose}
      open={open}
      mask={false}
      maskClosable={true}
      width={400}
      footer={
        <div style={{ textAlign: "right" }}>
          <Button onClick={onClose} style={{ marginRight: 8 }}>
            Cancel
          </Button>
          <Button
            onClick={handleAddContact}
            type="primary"
            disabled={!newContactName.trim()}
          >
            Add
          </Button>
        </div>
      }
    >
      <Form layout="vertical">
        <Form.Item label={<span>Name</span>} required>
          <Input
            prefix={<UserOutlined />}
            placeholder="Enter name"
            value={newContactName}
            onChange={(e) => setNewContactName(e.target.value)}
          />
        </Form.Item>
        <Paragraph type="secondary">
          Email and phone will be generated automatically.
        </Paragraph>
      </Form>
    </Drawer>
  );
};

export default TemplatesAddDrawer;

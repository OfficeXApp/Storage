// src/components/ContactsPage/contacts.tab.tsx

import React from "react";
import { Typography } from "antd";

const { Title, Paragraph } = Typography;

export type TemplateItem = {
  id: string;
  name: string;
  avatar?: string;
  email?: string;
  phone?: string;
};

// Define the props for the ContactTab component
interface ContactTabProps {
  contact: TemplateItem;
}

const ContactTab: React.FC<ContactTabProps> = ({ contact }) => {
  const { name, email, phone } = contact;
  return (
    <div
      style={{
        padding: "16px",
        height: "100%",
        width: "100%",
        overflowY: "auto",
      }}
    >
      <Title level={4}>{name}</Title>
      {email && (
        <Paragraph>
          <strong>Email:</strong> {email}
        </Paragraph>
      )}
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
      <br />
      <br />
      <br />
      <br />
      <p>mid</p>
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
      <p>mid</p>
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
      <br />
      <br />
      {phone && (
        <Paragraph>
          <strong>Phone:</strong> {phone}
        </Paragraph>
      )}
    </div>
  );
};

export default ContactTab;

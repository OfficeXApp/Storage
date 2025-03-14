import React, { useState, useEffect } from "react";
import { Tabs, Input, List, Checkbox, Avatar, Tag, Space } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import { useSelector } from "react-redux";
import { ReduxAppState } from "../../redux-offline/ReduxProvider";
import { ContactFE, GroupFE } from "@officexapp/types";
import { shortenAddress } from "../../framework/identity/constants";

const { TabPane } = Tabs;

const ContactSelector: React.FC = () => {
  // Get contacts and groups from Redux store
  const contacts = useSelector(
    (state: ReduxAppState) => state.contacts.contacts
  );

  const groups = useSelector((state: ReduxAppState) => state.groups.groups);

  // State for selected contacts and groups
  const [selectedContactIds, setSelectedContactIds] = useState<string[]>([]);
  const [selectedGroupIds, setSelectedGroupIds] = useState<string[]>([]);

  // State for search queries
  const [contactSearchQuery, setContactSearchQuery] = useState<string>("");
  const [groupSearchQuery, setGroupSearchQuery] = useState<string>("");

  // Filtered contacts and groups based on search
  const [filteredContacts, setFilteredContacts] =
    useState<ContactFE[]>(contacts);
  const [filteredGroups, setFilteredGroups] = useState<GroupFE[]>(groups);

  // Update filtered contacts when contacts or search query changes
  useEffect(() => {
    if (!contactSearchQuery.trim()) {
      setFilteredContacts(contacts);
    } else {
      const lowerCaseQuery = contactSearchQuery.toLowerCase();
      setFilteredContacts(
        contacts.filter(
          (contact) =>
            contact.name.toLowerCase().includes(lowerCaseQuery) ||
            contact.email.toLowerCase().includes(lowerCaseQuery) ||
            contact.id.toLowerCase().includes(lowerCaseQuery)
        )
      );
    }
  }, [contacts, contactSearchQuery]);

  // Update filtered groups when groups or search query changes
  useEffect(() => {
    if (!groupSearchQuery.trim()) {
      setFilteredGroups(groups);
    } else {
      const lowerCaseQuery = groupSearchQuery.toLowerCase();
      setFilteredGroups(
        groups.filter(
          (group) =>
            group.name.toLowerCase().includes(lowerCaseQuery) ||
            group.id.toLowerCase().includes(lowerCaseQuery)
        )
      );
    }
  }, [groups, groupSearchQuery]);

  // Handle contact selection
  const handleContactSelect = (contactId: string) => {
    setSelectedContactIds((prevSelected) => {
      if (prevSelected.includes(contactId)) {
        return prevSelected.filter((id) => id !== contactId);
      } else {
        return [...prevSelected, contactId];
      }
    });
  };

  // Handle group selection
  const handleGroupSelect = (groupId: string) => {
    setSelectedGroupIds((prevSelected) => {
      if (prevSelected.includes(groupId)) {
        return prevSelected.filter((id) => id !== groupId);
      } else {
        return [...prevSelected, groupId];
      }
    });
  };

  // Handle contact checkbox change
  const handleContactCheckboxChange = (contactId: string, checked: boolean) => {
    if (checked) {
      setSelectedContactIds((prev) =>
        prev.includes(contactId) ? prev : [...prev, contactId]
      );
    } else {
      setSelectedContactIds((prev) => prev.filter((id) => id !== contactId));
    }
  };

  // Handle group checkbox change
  const handleGroupCheckboxChange = (groupId: string, checked: boolean) => {
    if (checked) {
      setSelectedGroupIds((prev) =>
        prev.includes(groupId) ? prev : [...prev, groupId]
      );
    } else {
      setSelectedGroupIds((prev) => prev.filter((id) => id !== groupId));
    }
  };

  // Format placeholder text for contacts
  const getContactPlaceholderText = () => {
    const count = selectedContactIds.length;
    return count > 0 ? `${count} contacts selected` : "Search contacts";
  };

  // Format placeholder text for groups
  const getGroupPlaceholderText = () => {
    const count = selectedGroupIds.length;
    return count > 0 ? `${count} groups selected` : "Search groups";
  };

  return (
    <div className="contact-selector">
      <Tabs defaultActiveKey="contacts">
        <TabPane tab="Contacts" key="contacts">
          <div className="contacts-container">
            <Input
              placeholder={getContactPlaceholderText()}
              prefix={<SearchOutlined />}
              value={contactSearchQuery}
              onChange={(e) => setContactSearchQuery(e.target.value)}
              style={{ marginBottom: 16 }}
            />

            <List
              dataSource={filteredContacts}
              renderItem={(contact) => {
                const isSelected = selectedContactIds.includes(contact.id);

                return (
                  <List.Item
                    key={contact.id}
                    onClick={() => handleContactSelect(contact.id)}
                    className={isSelected ? "selected-contact" : ""}
                    style={{
                      cursor: "pointer",
                      padding: "8px 16px",
                      background: isSelected ? "#f0f7ff" : "transparent",
                    }}
                  >
                    <Space
                      size="middle"
                      align="center"
                      style={{ width: "100%" }}
                    >
                      <Checkbox
                        checked={isSelected}
                        onChange={(e) =>
                          handleContactCheckboxChange(
                            contact.id,
                            e.target.checked
                          )
                        }
                        onClick={(e) => e.stopPropagation()}
                      />
                      <Avatar src={contact.avatar} />
                      <div style={{ flex: 1 }}>
                        <div>{contact.name}</div>
                        <div style={{ color: "#888", fontSize: "12px" }}>
                          {contact.email}
                        </div>
                      </div>
                      <Tag>
                        {shortenAddress(contact.id.replace("UserID_", ""))}
                      </Tag>
                    </Space>
                  </List.Item>
                );
              }}
              style={{
                maxHeight: "60vh",
                overflow: "auto",
                border: "1px solid #f0f0f0",
                borderRadius: "4px",
              }}
            />
          </div>
        </TabPane>
        <TabPane tab="Groups" key="groups">
          <div className="groups-container">
            <Input
              placeholder={getGroupPlaceholderText()}
              prefix={<SearchOutlined />}
              value={groupSearchQuery}
              onChange={(e) => setGroupSearchQuery(e.target.value)}
              style={{ marginBottom: 16 }}
            />

            <List
              dataSource={filteredGroups}
              renderItem={(group) => {
                const isSelected = selectedGroupIds.includes(group.id);

                return (
                  <List.Item
                    key={group.id}
                    onClick={() => handleGroupSelect(group.id)}
                    className={isSelected ? "selected-group" : ""}
                    style={{
                      cursor: "pointer",
                      padding: "8px 16px",
                      background: isSelected ? "#f0f7ff" : "transparent",
                    }}
                  >
                    <Space
                      size="middle"
                      align="center"
                      style={{ width: "100%" }}
                    >
                      <Checkbox
                        checked={isSelected}
                        onChange={(e) =>
                          handleGroupCheckboxChange(group.id, e.target.checked)
                        }
                        onClick={(e) => e.stopPropagation()}
                      />
                      <Avatar src={group.avatar} />
                      <div style={{ flex: 1 }}>
                        <div>{group.name}</div>
                        <div style={{ color: "#888", fontSize: "12px" }}>
                          {group.member_previews?.length || 0} members
                        </div>
                      </div>
                      <Tag>
                        {shortenAddress(group.id.replace("GroupID_", ""))}
                      </Tag>
                    </Space>
                  </List.Item>
                );
              }}
              style={{
                maxHeight: "60vh",
                overflow: "auto",
                border: "1px solid #f0f0f0",
                borderRadius: "4px",
              }}
            />
          </div>
        </TabPane>
      </Tabs>
    </div>
  );
};

export default ContactSelector;

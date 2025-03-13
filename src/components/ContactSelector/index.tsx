import React, { useState, useEffect } from "react";
import { Tabs, Input, List, Checkbox, Avatar, Tag, Space } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import { useSelector } from "react-redux";
import { ReduxAppState } from "../../redux-offline/ReduxProvider";
import { ContactFE, TeamFE } from "@officexapp/types";
import { shortenAddress } from "../../framework/identity/constants";

const { TabPane } = Tabs;

const ContactSelector: React.FC = () => {
  // Get contacts and teams from Redux store
  const contacts = useSelector(
    (state: ReduxAppState) => state.contacts.contacts
  );

  const teams = useSelector((state: ReduxAppState) => state.teams.teams);

  // State for selected contacts and teams
  const [selectedContactIds, setSelectedContactIds] = useState<string[]>([]);
  const [selectedTeamIds, setSelectedTeamIds] = useState<string[]>([]);

  // State for search queries
  const [contactSearchQuery, setContactSearchQuery] = useState<string>("");
  const [teamSearchQuery, setTeamSearchQuery] = useState<string>("");

  // Filtered contacts and teams based on search
  const [filteredContacts, setFilteredContacts] =
    useState<ContactFE[]>(contacts);
  const [filteredTeams, setFilteredTeams] = useState<TeamFE[]>(teams);

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

  // Update filtered teams when teams or search query changes
  useEffect(() => {
    if (!teamSearchQuery.trim()) {
      setFilteredTeams(teams);
    } else {
      const lowerCaseQuery = teamSearchQuery.toLowerCase();
      setFilteredTeams(
        teams.filter(
          (team) =>
            team.name.toLowerCase().includes(lowerCaseQuery) ||
            team.id.toLowerCase().includes(lowerCaseQuery)
        )
      );
    }
  }, [teams, teamSearchQuery]);

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

  // Handle team selection
  const handleTeamSelect = (teamId: string) => {
    setSelectedTeamIds((prevSelected) => {
      if (prevSelected.includes(teamId)) {
        return prevSelected.filter((id) => id !== teamId);
      } else {
        return [...prevSelected, teamId];
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

  // Handle team checkbox change
  const handleTeamCheckboxChange = (teamId: string, checked: boolean) => {
    if (checked) {
      setSelectedTeamIds((prev) =>
        prev.includes(teamId) ? prev : [...prev, teamId]
      );
    } else {
      setSelectedTeamIds((prev) => prev.filter((id) => id !== teamId));
    }
  };

  // Format placeholder text for contacts
  const getContactPlaceholderText = () => {
    const count = selectedContactIds.length;
    return count > 0 ? `${count} contacts selected` : "Search contacts";
  };

  // Format placeholder text for teams
  const getTeamPlaceholderText = () => {
    const count = selectedTeamIds.length;
    return count > 0 ? `${count} teams selected` : "Search teams";
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
        <TabPane tab="Teams" key="teams">
          <div className="teams-container">
            <Input
              placeholder={getTeamPlaceholderText()}
              prefix={<SearchOutlined />}
              value={teamSearchQuery}
              onChange={(e) => setTeamSearchQuery(e.target.value)}
              style={{ marginBottom: 16 }}
            />

            <List
              dataSource={filteredTeams}
              renderItem={(team) => {
                const isSelected = selectedTeamIds.includes(team.id);

                return (
                  <List.Item
                    key={team.id}
                    onClick={() => handleTeamSelect(team.id)}
                    className={isSelected ? "selected-team" : ""}
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
                          handleTeamCheckboxChange(team.id, e.target.checked)
                        }
                        onClick={(e) => e.stopPropagation()}
                      />
                      <Avatar src={team.avatar} />
                      <div style={{ flex: 1 }}>
                        <div>{team.name}</div>
                        <div style={{ color: "#888", fontSize: "12px" }}>
                          {team.member_previews?.length || 0} members
                        </div>
                      </div>
                      <Tag>
                        {shortenAddress(team.id.replace("TeamID_", ""))}
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

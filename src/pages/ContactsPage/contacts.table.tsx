import React, { useEffect, useState } from "react";
import {
  Button,
  Dropdown,
  Input,
  Space,
  Table,
  Avatar,
  Tag,
  Badge,
  Menu,
  List,
  message,
  Popover,
} from "antd";
import {
  BarsOutlined,
  ClockCircleOutlined,
  DownOutlined,
  SearchOutlined,
  SortAscendingOutlined,
  TeamOutlined,
  UserAddOutlined,
  MailOutlined,
  DeleteOutlined,
  RightOutlined,
} from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import { shortenAddress } from "../../framework/identity/constants";
import { ContactFE } from "@officexapp/types";
import useScreenType from "react-screentype-hook";
import { ReduxAppState } from "../../redux-offline/ReduxProvider";
import { useDispatch, useSelector } from "react-redux";
import { listContactsAction } from "../../redux-offline/contacts/contacts.actions";
import { formatUserString, getLastOnlineStatus } from "../../api/helpers";
import { useIdentitySystem } from "../../framework/identity";

interface ContactsTableListProps {
  isContentTabOpen: (id: string) => boolean;
  handleClickContentTab: (contact: ContactFE, focus_tab?: boolean) => void;
}

const ContactsTableList: React.FC<ContactsTableListProps> = ({
  isContentTabOpen,
  handleClickContentTab,
}) => {
  const dispatch = useDispatch();
  const isOnline = useSelector((state: ReduxAppState) => state.offline?.online);
  const contacts = useSelector(
    (state: ReduxAppState) => state.contacts.contacts
  );
  const { wrapOrgCode } = useIdentitySystem();
  console.log(`look at contacts`, contacts);
  const screenType = useScreenType();
  const [searchText, setSearchText] = useState("");
  const [filteredContacts, setFilteredContacts] = useState(contacts);
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);

  // Update filtered contacts whenever search text or contacts change
  useEffect(() => {
    const filtered = contacts.filter((contact) =>
      contact.name.toLowerCase().includes(searchText.toLowerCase())
    );
    setFilteredContacts(filtered);
  }, [searchText, contacts]);

  // Handle responsive layout
  useEffect(() => {
    try {
      dispatch(listContactsAction({}));
    } catch (e) {
      console.error(e);
    }

    // message.success(
    //   isOnline
    //     ? "Fetching contacts..."
    //     : "Queued fetch contacts for when you're back online"
    // );

    const handleResize = () => {
      const desktopView = document.getElementById("desktop-view");
      const mobileView = document.getElementById("mobile-view");

      if (desktopView && mobileView) {
        if (window.innerWidth <= 768) {
          desktopView.style.display = "none";
          mobileView.style.display = "flex";
        } else {
          desktopView.style.display = "flex";
          mobileView.style.display = "none";
        }
      }
    };

    // Initial call
    handleResize();

    // Add event listener
    window.addEventListener("resize", handleResize);

    // Cleanup
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Handle row selection
  const rowSelection = {
    selectedRowKeys,
    onChange: (newSelectedRowKeys: React.Key[]) => {
      setSelectedRowKeys(newSelectedRowKeys);

      // // Now clicking row just selects the checkbox
      // const key = record.id;
      // const newSelectedRowKeys = selectedRowKeys.includes(key)
      //     ? selectedRowKeys.filter((k) => k !== key)
      //     : [...selectedRowKeys, key];
      // setSelectedRowKeys(newSelectedRowKeys);
    },
  };

  // Dropdown menu items for the Manage button
  const manageMenuItems = [
    {
      key: "1",
      icon: <UserAddOutlined />,
      label: "Add to Group",
      disabled: true,
    },
    {
      key: "2",
      icon: <MailOutlined />,
      label: "Send Invites",
      disabled: true,
    },
    {
      key: "3",
      icon: <DeleteOutlined />,
      label: "Delete",
      disabled: true,
    },
  ];

  // Define table columns
  const columns: ColumnsType<ContactFE> = [
    {
      title: "Contact",
      dataIndex: "name",
      key: "name",
      render: (_: any, record: ContactFE) => {
        const lastOnlineStatus = getLastOnlineStatus(record.last_online_ms);
        return (
          <Space
            onClick={(e) => {
              e?.stopPropagation();
              handleClickContentTab(record);
            }}
          >
            <div
              onClick={(e) => {
                e.stopPropagation();
                handleClickContentTab(record, true);
                const newUrl = wrapOrgCode(`/resources/groups/${record.id}`);
                window.history.pushState({}, "", newUrl);
              }}
            >
              <Popover content={lastOnlineStatus.text}>
                <Badge
                  // @ts-ignore
                  status={lastOnlineStatus.status}
                  dot
                  offset={[-3, 3]}
                >
                  <Avatar
                    size="default"
                    src={
                      record.avatar
                        ? record.avatar
                        : `https://ui-avatars.com/api/?name=${record.name}`
                    }
                  />
                </Badge>
              </Popover>
              <span style={{ marginLeft: "8px" }}>{record.name}</span>
            </div>
            <Tag
              onClick={() => {
                // copy to clipboard
                formatUserString(record.name, record.id);
                message.success("Copied to clipboard");
              }}
              color="default"
            >
              {shortenAddress(record.icp_principal)}
            </Tag>
          </Space>
        );
      },
    },
    // {
    //   title: "ID",
    //   dataIndex: "id",
    //   key: "id",
    //   width: 120, // Reduced width for ID column
    //   ellipsis: true, // Add ellipsis to handle overflow
    //   render: (_: string, record: ContactFE) => (
    //     <Tag
    //       onClick={() => {
    //         // copy to clipboard
    //         formatUserString(record.name, record.id);
    //         message.success("Copied to clipboard");
    //       }}
    //       color="default"
    //     >
    //       {shortenAddress(record.icp_principal)}
    //     </Tag>
    //   ),
    // },
  ];

  // Example items for filter dropdowns
  const filterItems = [
    { key: "1", label: "Option 1" },
    { key: "2", label: "Option 2" },
    { key: "3", label: "Option 3" },
  ];

  const renderMobileList = () => {
    return (
      <List
        itemLayout="horizontal"
        dataSource={filteredContacts}
        renderItem={(contact: ContactFE) => (
          <List.Item
            style={{
              padding: "12px 16px",
              cursor: "pointer",
              backgroundColor: isContentTabOpen(contact.id)
                ? "#e6f7ff"
                : "transparent",
            }}
            onClick={() => handleClickContentTab(contact, true)}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                width: "100%",
                justifyContent: "space-between",
              }}
            >
              <div
                style={{ display: "flex", alignItems: "center", gap: "12px" }}
              >
                <Avatar
                  size="default"
                  src={
                    contact.avatar
                      ? contact.avatar
                      : `https://ui-avatars.com/api/?name=${contact.name}`
                  }
                />
                <div style={{ display: "flex", flexDirection: "column" }}>
                  <span style={{ fontWeight: "500" }}>{contact.name}</span>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                    }}
                  >
                    <Badge color="green" dot />
                    <span
                      style={{ fontSize: "10px", color: "rgba(0,0,0,0.45)" }}
                    >
                      <ClockCircleOutlined style={{ marginRight: 4 }} />
                      Active 2h ago
                    </span>
                  </div>
                </div>
              </div>
              <div
                style={{ display: "flex", alignItems: "center", gap: "12px" }}
              >
                <Tag color="default">{shortenAddress(contact.id)}</Tag>
                <RightOutlined style={{ color: "rgba(0,0,0,0.4)" }} />
              </div>
            </div>
          </List.Item>
        )}
      />
    );
  };

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Header section with search and filters */}
      <div style={{ padding: "16px 16px 0 16px" }}>
        {/* We'll use a useEffect to handle responsive layout */}
        <div style={{ marginBottom: "16px" }}>
          {/* For larger screens (desktop) */}
          <div
            className="desktop-view"
            id="desktop-view"
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            {/* Search input */}
            <Input
              placeholder="Search contacts..."
              prefix={<SearchOutlined />}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              style={{ width: "240px" }}
            />

            {/* Filter options and manage button */}
            <div style={{ display: "flex", gap: "20px", alignItems: "center" }}>
              <Dropdown menu={{ items: filterItems, onClick: () => {} }}>
                <a
                  onClick={(e) => e.preventDefault()}
                  style={{ color: "rgba(0,0,0,0.4)" }}
                >
                  <Space>
                    <SortAscendingOutlined /> Sort By <DownOutlined />
                  </Space>
                </a>
              </Dropdown>
              <Dropdown menu={{ items: filterItems, onClick: () => {} }}>
                <a
                  onClick={(e) => e.preventDefault()}
                  style={{ color: "rgba(0,0,0,0.4)" }}
                >
                  <Space>
                    <BarsOutlined /> Filter By <DownOutlined />
                  </Space>
                </a>
              </Dropdown>
              <Dropdown menu={{ items: filterItems, onClick: () => {} }}>
                <a
                  onClick={(e) => e.preventDefault()}
                  style={{ color: "rgba(0,0,0,0.4)" }}
                >
                  <Space>
                    <TeamOutlined /> Group By <DownOutlined />
                  </Space>
                </a>
              </Dropdown>
              <Dropdown
                menu={{ items: manageMenuItems }}
                disabled={selectedRowKeys.length === 0}
              >
                <Button>
                  Manage{" "}
                  {selectedRowKeys.length > 0
                    ? `(${selectedRowKeys.length})`
                    : ""}
                  <DownOutlined />
                </Button>
              </Dropdown>
            </div>
          </div>

          {/* For mobile screens */}
          <div
            className="mobile-view"
            id="mobile-view"
            style={{
              display: "none",
              flexDirection: "column",
              gap: "16px",
            }}
          >
            {/* Search input - always on top for mobile */}
            <Input
              placeholder="Search contacts..."
              prefix={<SearchOutlined />}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              style={{ width: "100%" }}
            />

            {/* Filter options and manage button */}
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: "12px",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <div style={{ display: "flex", flexWrap: "wrap", gap: "12px" }}>
                <Dropdown menu={{ items: filterItems, onClick: () => {} }}>
                  <a
                    onClick={(e) => e.preventDefault()}
                    style={{ color: "rgba(0,0,0,0.4)" }}
                  >
                    <Space>
                      <SortAscendingOutlined /> Sort By <DownOutlined />
                    </Space>
                  </a>
                </Dropdown>

                <Dropdown menu={{ items: filterItems, onClick: () => {} }}>
                  <a
                    onClick={(e) => e.preventDefault()}
                    style={{ color: "rgba(0,0,0,0.4)" }}
                  >
                    <Space>
                      <BarsOutlined /> Filter By <DownOutlined />
                    </Space>
                  </a>
                </Dropdown>

                {!screenType.isMobile && (
                  <Dropdown menu={{ items: filterItems, onClick: () => {} }}>
                    <a
                      onClick={(e) => e.preventDefault()}
                      style={{ color: "rgba(0,0,0,0.4)" }}
                    >
                      <Space>
                        <TeamOutlined /> Group By <DownOutlined />
                      </Space>
                    </a>
                  </Dropdown>
                )}
              </div>

              {!screenType.isMobile && (
                <Dropdown
                  menu={{ items: manageMenuItems }}
                  disabled={selectedRowKeys.length === 0}
                >
                  <Button>
                    Manage{" "}
                    {selectedRowKeys.length > 0
                      ? `(${selectedRowKeys.length})`
                      : ""}
                    <DownOutlined />
                  </Button>
                </Dropdown>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Contacts Table */}
      <div style={{ flex: 1, padding: "0 16px 16px 16px", overflowY: "auto" }}>
        {screenType.isMobile ? (
          renderMobileList()
        ) : (
          <Table
            rowSelection={{
              type: "checkbox",
              ...rowSelection,
              columnWidth: 50,
            }}
            columns={columns}
            dataSource={filteredContacts}
            rowKey="id"
            pagination={false}
            onRow={(record) => ({
              onClick: () => {
                handleClickContentTab(record, false);
              },
              style: {
                backgroundColor: isContentTabOpen(record.id)
                  ? "#e6f7ff"
                  : "transparent",
                cursor: "pointer",
              },
            })}
            size="middle"
          />
        )}
        <br />
        <br />
      </div>
    </div>
  );
};

export default ContactsTableList;

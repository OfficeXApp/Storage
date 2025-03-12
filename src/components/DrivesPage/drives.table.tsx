// src/components/DrivesPage/drives.table.tsx

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
  LinkOutlined,
  DeleteOutlined,
  RightOutlined,
  DatabaseOutlined,
  GlobalOutlined,
} from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import { shortenAddress } from "../DrivesPage";
import { DriveFE, Drive } from "@officexapp/types";
import useScreenType from "react-screentype-hook";
import { ReduxAppState } from "../../redux-offline/ReduxProvider";
import { useDispatch, useSelector } from "react-redux";
import { listDrivesAction } from "../../redux-offline/drives/drives.actions";
import { DriveFEO } from "../../redux-offline/drives/drives.reducer";

interface DrivesTableListProps {
  isDriveTabOpen: (id: string) => boolean;
  handleClickDriveTab: (drive: DriveFEO, focus_tab?: boolean) => void;
}

const DrivesTableList: React.FC<DrivesTableListProps> = ({
  isDriveTabOpen,
  handleClickDriveTab,
}) => {
  const dispatch = useDispatch();
  const isOnline = useSelector((state: ReduxAppState) => state.offline?.online);
  const drives = useSelector((state: ReduxAppState) => state.drives.drives);
  console.log(`look at drives`, drives);
  const screenType = useScreenType();
  const [searchText, setSearchText] = useState("");
  const [filteredDrives, setFilteredDrives] = useState(drives);
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);

  // Update filtered drives whenever search text or drives change
  useEffect(() => {
    const filtered = drives.filter((drive) =>
      drive.name.toLowerCase().includes(searchText.toLowerCase())
    );
    setFilteredDrives(filtered);
  }, [searchText, drives]);

  // Handle responsive layout
  useEffect(() => {
    try {
      dispatch(listDrivesAction({}));
    } catch (e) {
      console.error(e);
    }

    const handleResize = () => {
      const desktopView = document.getElementById("desktop-view-drives");
      const mobileView = document.getElementById("mobile-view-drives");

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
    },
  };

  // Dropdown menu items for the Manage button
  const manageMenuItems = [
    {
      key: "1",
      icon: <UserAddOutlined />,
      label: "Share Drive",
      disabled: true,
    },
    {
      key: "2",
      icon: <LinkOutlined />,
      label: "Copy URL",
      disabled: true,
    },
    {
      key: "3",
      icon: <DeleteOutlined />,
      label: "Delete",
      disabled: true,
    },
  ];

  // Format last indexed date
  const formatLastIndexed = (timestamp?: number) => {
    if (!timestamp) return { status: "default", text: "Never indexed" };

    const now = Date.now();
    const diff = now - timestamp;
    const hoursDiff = diff / (1000 * 60 * 60);

    if (hoursDiff < 24) {
      return { status: "success", text: "Indexed today" };
    } else if (hoursDiff < 72) {
      return { status: "processing", text: "Indexed recently" };
    } else {
      return {
        status: "warning",
        text: `Last indexed ${new Date(timestamp).toLocaleDateString()}`,
      };
    }
  };

  // Define table columns
  const columns: ColumnsType<DriveFEO> = [
    {
      title: "Drive",
      dataIndex: "name",
      key: "name",
      render: (_: any, record: DriveFEO) => {
        const indexStatus = formatLastIndexed(record.last_indexed_ms);
        return (
          <Space
            onClick={(e) => {
              e?.stopPropagation();
              handleClickDriveTab(record);
            }}
          >
            <Popover content={indexStatus.text}>
              <Badge status={indexStatus.status as any} dot offset={[-3, 3]}>
                <Avatar
                  size="default"
                  icon={<DatabaseOutlined />}
                  style={{ backgroundColor: "#1890ff" }}
                >
                  {record.name.charAt(0).toUpperCase()}
                </Avatar>
              </Badge>
            </Popover>
            <span style={{ marginLeft: "0px" }}>{record.name}</span>
            <Tag
              onClick={() => {
                // copy to clipboard
                const driveString = `${record.name.replace(/ /g, "_")}@${record.id}`;
                navigator.clipboard.writeText(driveString);
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
    {
      title: "Endpoint",
      dataIndex: "endpoint_url",
      key: "endpoint_url",
      render: (_: any, record: DriveFEO) =>
        record.endpoint_url ? (
          <a
            href={`${record.endpoint_url}/v1/${record.id}`}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
          >
            <GlobalOutlined />{" "}
            {shortenAddress(`${record.endpoint_url}/v1/${record.id}`, 10, 5)}
          </a>
        ) : (
          <span style={{ color: "#999" }}>No endpoint</span>
        ),
    },
    {
      title: "Actions",
      key: "actions",
      width: 150,
      render: (_: any, record: DriveFEO) => (
        <Button
          type="default"
          size="middle"
          style={{ width: "100%" }}
          onClick={(e) => {
            e.stopPropagation();
            handleClickDriveTab(record, true);
            const newUrl = `/resources/drives/${record.id}`;
            window.history.pushState({}, "", newUrl);
          }}
        >
          Open
        </Button>
      ),
    },
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
        dataSource={filteredDrives}
        renderItem={(drive: DriveFEO) => (
          <List.Item
            style={{
              padding: "12px 16px",
              cursor: "pointer",
              backgroundColor: isDriveTabOpen(drive.id)
                ? "#e6f7ff"
                : "transparent",
            }}
            onClick={() => handleClickDriveTab(drive, true)}
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
                  icon={<DatabaseOutlined />}
                  style={{ backgroundColor: "#1890ff" }}
                >
                  {drive.name.charAt(0).toUpperCase()}
                </Avatar>
                <div style={{ display: "flex", flexDirection: "column" }}>
                  <span style={{ fontWeight: "500" }}>{drive.name}</span>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                    }}
                  >
                    {drive.last_indexed_ms ? (
                      <>
                        <Badge
                          status={
                            formatLastIndexed(drive.last_indexed_ms)
                              .status as any
                          }
                          dot
                        />
                        <span
                          style={{
                            fontSize: "10px",
                            color: "rgba(0,0,0,0.45)",
                          }}
                        >
                          <ClockCircleOutlined style={{ marginRight: 4 }} />
                          {formatLastIndexed(drive.last_indexed_ms).text}
                        </span>
                      </>
                    ) : (
                      <>
                        <Badge status="default" dot />
                        <span
                          style={{
                            fontSize: "10px",
                            color: "rgba(0,0,0,0.45)",
                          }}
                        >
                          <ClockCircleOutlined style={{ marginRight: 4 }} />
                          Never indexed
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </div>
              <div
                style={{ display: "flex", alignItems: "center", gap: "12px" }}
              >
                <Tag color="default">{shortenAddress(drive.icp_principal)}</Tag>
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
            className="desktop-view-drives"
            id="desktop-view-drives"
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            {/* Search input */}
            <Input
              placeholder="Search drives..."
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
            className="mobile-view-drives"
            id="mobile-view-drives"
            style={{
              display: "none",
              flexDirection: "column",
              gap: "16px",
            }}
          >
            {/* Search input - always on top for mobile */}
            <Input
              placeholder="Search drives..."
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

      {/* Drives Table */}
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
            dataSource={filteredDrives}
            rowKey="id"
            pagination={false}
            onRow={(record) => ({
              onClick: () => {
                handleClickDriveTab(record, false);
              },
              style: {
                backgroundColor: isDriveTabOpen(record.id)
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

export default DrivesTableList;

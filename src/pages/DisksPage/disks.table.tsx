import React, { useEffect, useState } from "react";
import {
  Button,
  Dropdown,
  Input,
  Space,
  Table,
  Tag,
  Badge,
  List,
  message,
  Popover,
  Result,
} from "antd";
import {
  BarsOutlined,
  ClockCircleOutlined,
  DownOutlined,
  SearchOutlined,
  SortAscendingOutlined,
  TeamOutlined,
  DatabaseOutlined,
  DeleteOutlined,
  RightOutlined,
  CloudOutlined,
  LoadingOutlined,
  SyncOutlined,
  LockOutlined,
} from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import { shortenAddress } from "../../framework/identity/constants";
import { DiskTypeEnum, SystemPermissionType } from "@officexapp/types";
import useScreenType from "react-screentype-hook";
import { ReduxAppState } from "../../redux-offline/ReduxProvider";
import { useDispatch, useSelector } from "react-redux";
import {
  checkDiskTablePermissionsAction,
  listDisksAction,
} from "../../redux-offline/disks/disks.actions";
import { DiskFEO } from "../../redux-offline/disks/disks.reducer";
import {
  defaultBrowserCacheDiskID,
  defaultTempCloudSharingDiskID,
} from "../../api/dexie-database";
import TagCopy from "../../components/TagCopy";
import { useIdentitySystem } from "../../framework/identity";
import { pastLastCheckedCacheLimit } from "../../api/helpers";
import { Link } from "react-router-dom";

interface DisksTableListProps {
  isContentTabOpen: (id: string) => boolean;
  handleClickContentTab: (disk: DiskFEO, focus_tab?: boolean) => void;
}

const DisksTableList: React.FC<DisksTableListProps> = ({
  isContentTabOpen,
  handleClickContentTab,
}) => {
  const dispatch = useDispatch();
  const isOnline = useSelector((state: ReduxAppState) => state.offline?.online);
  const { disks, loading, tablePermissions } = useSelector(
    (state: ReduxAppState) => ({
      disks: state.disks.disks,
      loading: state.disks.loading,
      tablePermissions: state.disks.tablePermissions,
    })
  );
  const { wrapOrgCode, currentProfile } = useIdentitySystem();
  const screenType = useScreenType();
  const [searchText, setSearchText] = useState("");
  const [filteredDisks, setFilteredDisks] = useState(disks);
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const { lastChecked } = useSelector((state: ReduxAppState) => ({
    lastChecked: state.disks.lastChecked,
  }));

  // Update filtered disks whenever search text or disks change
  useEffect(() => {
    const filtered = disks.filter((disk) =>
      disk.name.toLowerCase().includes(searchText.toLowerCase())
    );
    setFilteredDisks(filtered);
  }, [searchText, disks]);

  // Handle responsive layout
  useEffect(() => {
    if (currentProfile && pastLastCheckedCacheLimit(lastChecked)) {
      try {
        dispatch(listDisksAction({}));
      } catch (e) {
        console.error(e);
      }
    }

    // message.success(
    //   isOnline
    //     ? "Fetching disks..."
    //     : "Queued fetch disks for when you're back online"
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
    },
  };

  // Dropdown menu items for the Manage button
  const manageMenuItems = [
    {
      key: "1",
      icon: <TeamOutlined />,
      label: "Share",
      disabled: true,
    },
    {
      key: "2",
      icon: <CloudOutlined />,
      label: "Sync",
      disabled: true,
    },
    {
      key: "3",
      icon: <DeleteOutlined />,
      label: "Delete",
      disabled: true,
    },
  ];

  const getDiskTypeLabel = (type: DiskTypeEnum) => {
    switch (type) {
      case DiskTypeEnum.LocalSSD:
        return "Physical SSD";
      case DiskTypeEnum.AwsBucket:
        return "Amazon Bucket";
      case DiskTypeEnum.StorjWeb3:
        return "StorjWeb3 Bucket";
      case DiskTypeEnum.BrowserCache:
        return "Offline Browser";
      case DiskTypeEnum.IcpCanister:
        return "ICP Canister";
      default:
        return "Unknown";
    }
  };

  // Define table columns
  const columns: ColumnsType<DiskFEO> = [
    {
      title: "Disk",
      dataIndex: "name",
      key: "name",
      render: (_: any, record: DiskFEO) => {
        return (
          <Space
            onClick={(e) => {
              e?.stopPropagation();
              handleClickContentTab(record);
            }}
          >
            <div
              style={{
                width: 30,
                height: 30,
                backgroundColor: "#1890ff",
                borderRadius: "50%",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                color: "white",
              }}
            >
              <DatabaseOutlined />
            </div>
            <div
              onClick={(e) => {
                e.stopPropagation();
                handleClickContentTab(record, true);
                const newUrl = wrapOrgCode(`/resources/disks/${record.id}`);
                window.history.pushState({}, "", newUrl);
              }}
            >
              <span style={{ marginLeft: "0px" }}>{record.name}</span>
            </div>
            {record.id === defaultBrowserCacheDiskID ||
            record.id === defaultTempCloudSharingDiskID ? (
              <Tag>Temp</Tag>
            ) : (
              <TagCopy id={record.id} />
            )}

            {record._syncWarning && <Badge status="error" />}
          </Space>
        );
      },
    },
    {
      title: "Type",
      dataIndex: "disk_type",
      key: "disk_type",
      width: 200,
      render: (_: any, record: DiskFEO) => (
        <span
          onClick={(e) => {
            e?.stopPropagation();
            handleClickContentTab(record);
          }}
        >
          {getDiskTypeLabel(record.disk_type)}
        </span>
      ),
    },
  ];

  // Example items for filter dropdowns
  const filterItems = [
    { key: "1", label: "Coming Soon" },
    { key: "2", label: "Coming Soon" },
    { key: "3", label: "Coming Soon" },
  ];

  const renderMobileList = () => {
    return (
      <List
        itemLayout="horizontal"
        dataSource={filteredDisks}
        renderItem={(disk: DiskFEO) => (
          <List.Item
            style={{
              padding: "12px 16px",
              cursor: "pointer",
              backgroundColor: isContentTabOpen(disk.id)
                ? "#e6f7ff"
                : "transparent",
            }}
            onClick={() => handleClickContentTab(disk, true)}
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
                <div
                  style={{
                    width: 40,
                    height: 40,
                    backgroundColor: "#1890ff",
                    borderRadius: "50%",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    color: "white",
                  }}
                >
                  <DatabaseOutlined />
                </div>
                <div style={{ display: "flex", flexDirection: "column" }}>
                  <span style={{ fontWeight: "500" }}>{disk.name}</span>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                    }}
                  >
                    <Tag>{shortenAddress(disk.id.replace("DiskID_", ""))}</Tag>
                    <span
                      style={{ fontSize: "12px", color: "rgba(0,0,0,0.65)" }}
                    >
                      {getDiskTypeLabel(disk.disk_type)}
                    </span>
                  </div>
                </div>
              </div>
              <div
                style={{ display: "flex", alignItems: "center", gap: "12px" }}
              >
                <RightOutlined style={{ color: "rgba(0,0,0,0.4)" }} />
              </div>
            </div>
          </List.Item>
        )}
      />
    );
  };

  const syncLatest = () => {
    if (!currentProfile) return;
    dispatch(listDisksAction({}));
    dispatch(checkDiskTablePermissionsAction(currentProfile.userID));
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

            <Space direction="horizontal">
              <Input
                placeholder="Search disks..."
                prefix={<SearchOutlined />}
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                style={{ width: "240px" }}
              />

              {loading ? (
                <span>
                  <LoadingOutlined />
                  <i style={{ marginLeft: 8, color: "rgba(0,0,0,0.2)" }}>
                    Syncing
                  </i>
                </span>
              ) : (
                <SyncOutlined
                  onClick={() => {
                    message.info("Syncing latest...");
                    syncLatest();
                  }}
                  style={{ color: "rgba(0,0,0,0.2)" }}
                />
              )}
            </Space>

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
              placeholder="Search disks..."
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

      {/* Disks Table */}
      {tablePermissions.includes(SystemPermissionType.VIEW) ||
      disks.length > 0 ? (
        <div
          style={{ flex: 1, padding: "0 16px 16px 16px", overflowY: "auto" }}
        >
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
              dataSource={filteredDisks}
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
      ) : (
        <Result
          icon={<LockOutlined />}
          title="Unauthorized"
          subTitle={
            <div>
              <span>Sorry, you are not authorized to view disks.</span>
              <br />
              <span>Contact your organization administrator.</span>
            </div>
          }
          extra={
            <Link to={wrapOrgCode("/welcome")}>
              <Button type="primary">Back Home</Button>
            </Link>
          }
          style={{
            marginTop: screenType.isMobile ? "0vh" : "10vh",
            marginBottom: "20vh",
          }}
        />
      )}
    </div>
  );
};

export default DisksTableList;

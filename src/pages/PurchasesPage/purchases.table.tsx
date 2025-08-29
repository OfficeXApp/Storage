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
  Result,
} from "antd";
import toast from "react-hot-toast";
import {
  BarsOutlined,
  ClockCircleOutlined,
  DownOutlined,
  SearchOutlined,
  SortAscendingOutlined,
  TeamOutlined,
  RocketOutlined, // Changed icon
  MailOutlined,
  DeleteOutlined,
  RightOutlined,
  SyncOutlined,
  LoadingOutlined,
  LockOutlined,
  CloudSyncOutlined,
} from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import { shortenAddress } from "../../framework/identity/constants";
import {
  PurchaseFE,
  PurchaseStatus,
  SystemPermissionType,
} from "@officexapp/types"; // Import PurchaseStatus
import useScreenType from "react-screentype-hook";
import { ReduxAppState } from "../../redux-offline/ReduxProvider";
import { useDispatch, useSelector } from "react-redux";
import {
  checkPurchasesTablePermissionsAction,
  listPurchasesAction,
} from "../../redux-offline/purchases/purchases.actions";
import { useIdentitySystem } from "../../framework/identity";
import { Link } from "react-router-dom";
import TagCopy from "../../components/TagCopy";
import ConnectICPButton from "../../components/ConnectICPButton";

interface PurchasesTableListProps {
  isContentTabOpen: (id: string) => boolean;
  handleClickContentTab: (purchase: PurchaseFE, focus_tab?: boolean) => void;
}

const PurchasesTableList: React.FC<PurchasesTableListProps> = ({
  isContentTabOpen,
  handleClickContentTab,
}) => {
  const dispatch = useDispatch();
  const isOnline = useSelector((state: ReduxAppState) => state.offline?.online);
  const { purchases, loading, tablePermissions } = useSelector(
    (state: ReduxAppState) => ({
      purchases: state.purchases.purchases,
      loading: state.purchases.loading,
      tablePermissions: state.purchases.tablePermissions,
    })
  );
  const { wrapOrgCode, currentProfile, currentOrg } = useIdentitySystem();

  const screenType = useScreenType();
  const [searchText, setSearchText] = useState("");
  const [filteredPurchases, setFilteredPurchases] = useState(purchases);
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);

  // Update filtered purchases whenever search text or purchases change
  useEffect(() => {
    const filtered = purchases
      .filter((j) => j)
      .filter(
        (purchase) =>
          purchase.title.toLowerCase().includes(searchText.toLowerCase()) ||
          purchase.description
            ?.toLowerCase()
            .includes(searchText.toLowerCase()) ||
          purchase.vendor_name
            .toLowerCase()
            .includes(searchText.toLowerCase()) ||
          purchase.status.toLowerCase().includes(searchText.toLowerCase())
      );
    setFilteredPurchases(filtered);
  }, [searchText, purchases]);

  // Handle responsive layout
  useEffect(() => {
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
      icon: <RocketOutlined />,
      label: <span>Update Status</span>,
      disabled: true,
    },
    {
      key: "2",
      icon: <DeleteOutlined />,
      label: <span>Delete</span>,
      disabled: true,
    },
  ];

  // Function to get appropriate tag color for PurchaseStatus
  const getStatusTagColor = (status: PurchaseStatus) => {
    switch (status) {
      case PurchaseStatus.COMPLETED:
        return "success";
      case PurchaseStatus.RUNNING:
        return "processing";
      case PurchaseStatus.FAILED:
        return "error";
      case PurchaseStatus.CANCELED:
      case PurchaseStatus.REFUNDED:
        return "default";
      case PurchaseStatus.REQUESTED:
      case PurchaseStatus.AWAITING:
        return "warning";
      case PurchaseStatus.BLOCKED:
        return "red";
      default:
        return "default";
    }
  };

  // Define table columns
  const columns: ColumnsType<PurchaseFE> = [
    {
      title: <span>Purchase</span>,
      dataIndex: "title",
      key: "title",
      render: (_, record: PurchaseFE) => (
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
              const newUrl = wrapOrgCode(`/resources/purchases/${record.id}`);
              window.history.pushState({}, "", newUrl);
            }}
          >
            <Avatar size="default" icon={<RocketOutlined />} />{" "}
            {/* Changed icon */}
            <span style={{ margin: "0px 8px" }}>{record.title}</span>
            <TagCopy id={record.id} />
          </div>
          <Tag color={getStatusTagColor(record.status)}>{record.status}</Tag>
        </Space>
      ),
    },
    {
      title: <span>Vendor</span>,
      dataIndex: "vendor_name",
      key: "vendor_name",
      render: (text: string, record: PurchaseFE) => (
        <Space>
          <span>{text}</span>
          {record.vendor_id && <TagCopy id={record.vendor_id} />}
        </Space>
      ),
    },
    {
      title: <span>Created At</span>,
      dataIndex: "created_at",
      key: "created_at",
      render: (timestamp: number) => new Date(timestamp).toLocaleDateString(),
    },
  ];

  // Example items for filter dropdowns
  const filterItems = [
    { key: "1", label: <span>Coming Soon</span> },
    { key: "2", label: <span>Coming Soon</span> },
    { key: "3", label: <span>Coming Soon</span> },
  ];

  const renderMobileList = () => {
    return (
      <List
        itemLayout="horizontal"
        dataSource={filteredPurchases}
        renderItem={(purchase: PurchaseFE) => (
          <List.Item
            style={{
              padding: "12px 16px",
              cursor: "pointer",
              backgroundColor: isContentTabOpen(purchase.id)
                ? "#e6f7ff"
                : "transparent",
            }}
            onClick={() => handleClickContentTab(purchase, true)}
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
                <Avatar size="default" icon={<RocketOutlined />} />
                <div style={{ display: "flex", flexDirection: "column" }}>
                  <span style={{ fontWeight: "500" }}>{purchase.title}</span>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                    }}
                  >
                    <Tag color={getStatusTagColor(purchase.status)}>
                      {purchase.status}
                    </Tag>
                    <span
                      style={{ fontSize: "10px", color: "rgba(0,0,0,0.45)" }}
                    >
                      <ClockCircleOutlined style={{ marginRight: 4 }} />
                      {new Date(purchase.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
              <div
                style={{ display: "flex", alignItems: "center", gap: "12px" }}
              >
                <Tag color="default">{shortenAddress(purchase.id)}</Tag>
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
    dispatch(listPurchasesAction({}));
    dispatch(checkPurchasesTablePermissionsAction(currentProfile.userID));
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
                placeholder="Search Purchases..."
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
                    toast(<span>Syncing latest...</span>);
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
              placeholder="Search purchases..."
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

      {/* Purchases Table */}
      {tablePermissions.includes(SystemPermissionType.VIEW) ||
      purchases.length > 0 ? (
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
              dataSource={filteredPurchases}
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
      ) : !currentOrg?.host ? (
        <Result
          icon={<CloudSyncOutlined />}
          title={<span>Connect Cloud</span>}
          subTitle={
            <div>
              <span>This is an offline organization</span>
              <br />
              <span>You need to connect to free cloud to use this feature</span>
            </div>
          }
          extra={
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                width: "100%",
              }}
            >
              <div style={{ width: "300px" }}>
                <ConnectICPButton />
              </div>
            </div>
          }
          style={{
            marginTop: screenType.isMobile ? "0vh" : "10vh",
            marginBottom: "20vh",
          }}
        />
      ) : (
        <Result
          icon={<LockOutlined />}
          title={<span>Unauthorized</span>}
          subTitle={
            <div>
              <span>Sorry, you are not authorized to view purchases.</span>
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

export default PurchasesTableList;

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
} from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import { shortenAddress } from "../../framework/identity/constants";
import {
  JobRunFE,
  JobRunStatus,
  SystemPermissionType,
} from "@officexapp/types"; // Import JobRunStatus
import useScreenType from "react-screentype-hook";
import { ReduxAppState } from "../../redux-offline/ReduxProvider";
import { useDispatch, useSelector } from "react-redux";
import {
  checkJobRunsTablePermissionsAction,
  listJobRunsAction,
} from "../../redux-offline/job-runs/job-runs.actions";
import { formatUserString, getLastOnlineStatus } from "../../api/helpers"; // Re-evaluate if needed for JobRuns
import { useIdentitySystem } from "../../framework/identity";
import { Link } from "react-router-dom";
import TagCopy from "../../components/TagCopy";

interface JobRunsTableListProps {
  isContentTabOpen: (id: string) => boolean;
  handleClickContentTab: (jobRun: JobRunFE, focus_tab?: boolean) => void;
}

const JobRunsTableList: React.FC<JobRunsTableListProps> = ({
  isContentTabOpen,
  handleClickContentTab,
}) => {
  const dispatch = useDispatch();
  const isOnline = useSelector((state: ReduxAppState) => state.offline?.online);
  const { jobRuns, loading, tablePermissions } = useSelector(
    (state: ReduxAppState) => ({
      jobRuns: state.jobRuns.jobRuns,
      loading: state.jobRuns.loading,
      tablePermissions: state.jobRuns.tablePermissions,
    })
  );
  const { wrapOrgCode, currentProfile } = useIdentitySystem();
  console.log(`look at job runs`, jobRuns);
  const screenType = useScreenType();
  const [searchText, setSearchText] = useState("");
  const [filteredJobRuns, setFilteredJobRuns] = useState(jobRuns);
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);

  // Update filtered job runs whenever search text or job runs change
  useEffect(() => {
    const filtered = jobRuns
      .filter((j) => j)
      .filter(
        (jobRun) =>
          jobRun.title.toLowerCase().includes(searchText.toLowerCase()) ||
          jobRun.description
            ?.toLowerCase()
            .includes(searchText.toLowerCase()) ||
          jobRun.vendor_name.toLowerCase().includes(searchText.toLowerCase()) ||
          jobRun.status.toLowerCase().includes(searchText.toLowerCase())
      );
    setFilteredJobRuns(filtered);
  }, [searchText, jobRuns]);

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
      label: "Update Status",
      disabled: true,
    },
    {
      key: "2",
      icon: <DeleteOutlined />,
      label: "Delete",
      disabled: true,
    },
  ];

  // Function to get appropriate tag color for JobRunStatus
  const getStatusTagColor = (status: JobRunStatus) => {
    switch (status) {
      case JobRunStatus.COMPLETED:
        return "success";
      case JobRunStatus.RUNNING:
        return "processing";
      case JobRunStatus.FAILED:
        return "error";
      case JobRunStatus.CANCELED:
      case JobRunStatus.REFUNDED:
        return "default";
      case JobRunStatus.REQUESTED:
      case JobRunStatus.AWAITING:
        return "warning";
      case JobRunStatus.BLOCKED:
        return "red";
      default:
        return "default";
    }
  };

  // Define table columns
  const columns: ColumnsType<JobRunFE> = [
    {
      title: "Job Run",
      dataIndex: "title",
      key: "title",
      render: (_, record: JobRunFE) => (
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
              const newUrl = wrapOrgCode(`/resources/job-runs/${record.id}`);
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
      title: "Vendor",
      dataIndex: "vendor_name",
      key: "vendor_name",
      render: (text: string, record: JobRunFE) => (
        <Space>
          <span>{text}</span>
          {record.vendor_id && <TagCopy id={record.vendor_id} />}
        </Space>
      ),
    },
    {
      title: "Created At",
      dataIndex: "created_at",
      key: "created_at",
      render: (timestamp: number) => new Date(timestamp).toLocaleDateString(),
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
        dataSource={filteredJobRuns}
        renderItem={(jobRun: JobRunFE) => (
          <List.Item
            style={{
              padding: "12px 16px",
              cursor: "pointer",
              backgroundColor: isContentTabOpen(jobRun.id)
                ? "#e6f7ff"
                : "transparent",
            }}
            onClick={() => handleClickContentTab(jobRun, true)}
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
                  <span style={{ fontWeight: "500" }}>{jobRun.title}</span>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                    }}
                  >
                    <Tag color={getStatusTagColor(jobRun.status)}>
                      {jobRun.status}
                    </Tag>
                    <span
                      style={{ fontSize: "10px", color: "rgba(0,0,0,0.45)" }}
                    >
                      <ClockCircleOutlined style={{ marginRight: 4 }} />
                      {new Date(jobRun.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
              <div
                style={{ display: "flex", alignItems: "center", gap: "12px" }}
              >
                <Tag color="default">{shortenAddress(jobRun.id)}</Tag>
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
    dispatch(listJobRunsAction({}));
    dispatch(checkJobRunsTablePermissionsAction(currentProfile.userID));
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
                placeholder="Search Job Runs..."
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
              placeholder="Search job runs..."
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

      {/* Job Runs Table */}
      {tablePermissions.includes(SystemPermissionType.VIEW) ||
      jobRuns.length > 0 ? (
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
              dataSource={filteredJobRuns}
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
              <span>Sorry, you are not authorized to view job runs.</span>
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

export default JobRunsTableList;

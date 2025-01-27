import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Table,
  Breadcrumb,
  Button,
  Dropdown,
  Space,
  MenuProps,
  message,
  Result,
  Input,
  Popconfirm,
  Breakpoint,
  Modal,
  notification,
  Spin,
} from "antd";
import {
  FolderOutlined,
  SortAscendingOutlined,
  TeamOutlined,
  ClockCircleOutlined,
  ArrowLeftOutlined,
  DownOutlined,
  PlusOutlined,
  BarsOutlined,
  ReloadOutlined,
  MoreOutlined,
  FileOutlined,
  SmileOutlined,
  FolderAddOutlined,
  CloudUploadOutlined,
  CheckOutlined,
  DeleteOutlined,
  FolderOpenFilled,
  FolderFilled,
  FolderOpenOutlined,
  StopOutlined,
  FileUnknownOutlined,
  PictureOutlined,
  VideoCameraOutlined,
  AudioOutlined,
  FilePdfOutlined,
  FieldTimeOutlined,
  CloudSyncOutlined,
} from "@ant-design/icons";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import {
  DriveFullFilePath,
  FileMetadata,
  FileUUID,
  FolderMetadata,
  FolderUUID,
  StorageLocationEnum,
  useDrive,
  UserID,
  LOCAL_STORAGE_STORJ_ACCESS_KEY,
  LOCAL_STORAGE_STORJ_SECRET_KEY,
  LOCAL_STORAGE_STORJ_ENDPOINT,
  Identity,
} from "../../framework";
import useScreenType from "react-screentype-hook";
import ActionMenuButton from "../ActionMenuButton";
import UploadDropZone from "../UploadDropZone";
import StorjSettingsCard from "../StorjSettingsCard";
import FilePage from "../FilePage";
import { isMobile } from "react-device-detect";
import { getFileType } from "../../api/helpers";
import { freeTrialStorjCreds } from "../../api/storj";
import mixpanel from "mixpanel-browser";
import useCloudSync from "../../api/cloud-sync";

const { useIdentity } = Identity;

interface DriveItemRow {
  id: FolderUUID | FileUUID;
  title: string;
  owner: string;
  isFolder: boolean;
  fullPath: DriveFullFilePath;
  isDisabled: boolean;
}

interface DriveUIProps {
  toggleUploadPanel: (bool: boolean) => void; // Callback to toggle UploadPanel visibility
}

interface FolderMetadataUI extends FolderMetadata {
  isDisabled?: boolean;
}
const DriveUI: React.FC<DriveUIProps> = ({ toggleUploadPanel }) => {
  const { "*": encodedPath } = useParams<{ "*": string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const screenType = useScreenType();
  const { icpCanisterId, deployIcpCanister } = useIdentity();
  const { syncOfflineWithCloud, exportSnapshots, isSyncing } = useCloudSync();
  const [currentPath, setCurrentPath] = useState<string[]>([]);
  const [content, setContent] = useState<{
    folders: FolderMetadataUI[];
    files: FileMetadata[];
  }>({ folders: [], files: [] });
  const {
    isInitialized,
    getFileByFullPath,
    fetchFilesAtFolderPath,
    renameFilePath,
    renameFolderPath,
    deleteFolder,
    deleteFile,
  } = useDrive();
  const [renamingItems, setRenamingItems] = useState<{ [key: string]: string }>(
    {}
  );
  const [isStorjModalVisible, setIsStorjModalVisible] = useState(false);
  const [singleFile, setSingleFile] = useState<FileMetadata>();
  const [is404NotFound, setIs404NotFound] = useState(false);
  const [apiNotifs, contextHolder] = notification.useNotification();

  useEffect(() => {
    if (window.location.pathname === "/drive/Web3Storj/") {
      const isFreeTrialStorjCreds =
        localStorage.getItem(LOCAL_STORAGE_STORJ_ACCESS_KEY) ===
        freeTrialStorjCreds.access_key;
      if (isFreeTrialStorjCreds) {
        apiNotifs.open({
          message: "Free Public Sharing",
          description:
            "Public files are deleted every 24 hours. Please upgrade OfficeX for your own private storage.",
          icon: <FieldTimeOutlined />,
          btn: (
            <Space>
              <Link to="/settings">
                <Button
                  onClick={() => {
                    mixpanel.track("Upgrade Intent");
                  }}
                  type="link"
                  size="small"
                >
                  Upgrade
                </Button>
              </Link>
              <Button
                type="primary"
                size="small"
                onClick={() => apiNotifs.destroy()}
              >
                Close
              </Button>
            </Space>
          ),
        });
      }
    }
  }, [window.location.pathname]);

  useEffect(() => {
    const path = encodedPath ? decodeURIComponent(encodedPath) : "";
    const pathParts = path.split("/").filter(Boolean);

    setCurrentPath(pathParts);
    fetchContent(pathParts); // Ensure this triggers the content fetch
    setSingleFile(undefined); // Reset singleFile state

    // Check if we're in the Web3Storj route and Storj settings are not set
    if (pathParts[0] === "Web3Storj" && !areStorjSettingsSet()) {
      setIsStorjModalVisible(true);
    }
  }, [encodedPath, fetchFilesAtFolderPath, location.search, isInitialized]); // Only listen to encodedPath and fetchFilesAtFolderPath

  const areStorjSettingsSet = () => {
    const isSet =
      localStorage.getItem(LOCAL_STORAGE_STORJ_ACCESS_KEY) &&
      localStorage.getItem(LOCAL_STORAGE_STORJ_SECRET_KEY) &&
      localStorage.getItem(LOCAL_STORAGE_STORJ_ENDPOINT)
        ? true
        : false;
    return isSet;
  };

  const handleStorjSettingsSave = () => {
    // Save settings to localStorage (this is already done in the StorjSettingsCard)
    setIsStorjModalVisible(false);
    // Optionally, you can refresh the content here if needed
    fetchContent(currentPath);
  };

  const fetchContent = useCallback(
    async (currentParts?: string[]) => {
      const pathParts = currentParts || currentPath;
      if (pathParts.length === 0) {
        // At root, show BrowserCache and HardDrive as folders
        setContent({
          folders: [
            {
              id: "Web3Storj" as FolderUUID,
              originalFolderName: "Cloud Storage",
              parentFolderUUID: null,
              subfolderUUIDs: [],
              fileUUIDs: [],
              fullFolderPath: "Web3Storj::",
              tags: [],
              owner: "userID" as UserID,
              createdDate: new Date(),
              storageLocation: StorageLocationEnum.Web3Storj,
              isDisabled: false,
              lastChangedUnixMs: 0,
            },
            {
              id: "BrowserCache" as FolderUUID,
              originalFolderName: "Browser Storage",
              parentFolderUUID: null,
              subfolderUUIDs: [],
              fileUUIDs: [],
              fullFolderPath: "BrowserCache::",
              tags: [],
              owner: "userID" as UserID,
              createdDate: new Date(),
              storageLocation: StorageLocationEnum.BrowserCache,
              isDisabled: false,
              lastChangedUnixMs: 0,
            },
            {
              id: "HardDrive" as FolderUUID,
              originalFolderName: "Hard Drive | Coming Soon",
              parentFolderUUID: null,
              subfolderUUIDs: [],
              fileUUIDs: [],
              fullFolderPath: "HardDrive::",
              tags: [],
              owner: "userID" as UserID,
              createdDate: new Date(),
              storageLocation: StorageLocationEnum.HardDrive,
              isDisabled: true,
              lastChangedUnixMs: 0,
            },
            {
              id: "AWS" as FolderUUID,
              originalFolderName: "AWS Bucket | Coming Soon",
              parentFolderUUID: null,
              subfolderUUIDs: [],
              fileUUIDs: [],
              fullFolderPath: "HardDrive::",
              tags: [],
              owner: "userID" as UserID,
              createdDate: new Date(),
              storageLocation: StorageLocationEnum.HardDrive,
              isDisabled: true,
              lastChangedUnixMs: 0,
            },
          ],
          files: [],
        });
      } else {
        const storageLocation = pathParts[0] as StorageLocationEnum;
        const fullPath =
          `${storageLocation}::${pathParts.slice(1).join("/")}` as DriveFullFilePath;
        let fullPathString = fullPath;
        if (
          fullPath[fullPath.length - 1] != "/" &&
          fullPath[fullPath.length - 1] != ":"
        ) {
          fullPathString += "/";
        }
        console.log("fetching content for", fullPathString);
        const result = await fetchFilesAtFolderPath(
          fullPathString as DriveFullFilePath,
          100,
          0
        );
        console.log(`>>>> result from ${fullPathString}`, result);
        const filteredDeleted = {
          ...result,
          folders: result.folders.filter((f) => !f.deleted),
          files: result.files.filter((f) => !f.deleted),
        };
        setContent(filteredDeleted);
        // this might be a file not a folder, so lets attempt to retrieve the file
        if (
          filteredDeleted.files.length === 0 &&
          filteredDeleted.folders.length === 0
        ) {
          // getFileByFullPath
          console.log("fetching file", fullPathString);
          let filePathString = fullPathString;

          // Check if the last character is a "/"
          if (filePathString.endsWith("/")) {
            filePathString = filePathString.slice(0, -1); // Remove the last character
          } else if (filePathString.endsWith("%2F")) {
            filePathString = filePathString.slice(0, -3); // Remove the last 3 characters
          }
          const file = await getFileByFullPath(
            filePathString as DriveFullFilePath
          );

          if (file) {
            setSingleFile(file);
          } else {
            if (
              window.location.pathname !== "/drive" &&
              !window.location.pathname.endsWith("/") &&
              !window.location.pathname.endsWith("%2F")
            ) {
              setIs404NotFound(true);
            }
          }
        }
      }
    },
    [fetchFilesAtFolderPath, currentPath]
  );

  const handleBack = () => {
    if (currentPath.length > 0) {
      navigate(
        `/drive/${encodeURIComponent(currentPath.slice(0, -1).join("/"))}`
      );
    } else {
      navigate("/drive");
    }
  };

  const handleFileFolderClick = (fullPath: DriveFullFilePath) => {
    const [storageLocation, ...pathParts] = fullPath.split("::");
    navigate(
      `/drive/${encodeURIComponent(storageLocation)}/${encodeURIComponent(pathParts.join("/"))}`
    );
  };

  const renderIconForFile = (fullPath: DriveFullFilePath) => {
    const fileType = getFileType(fullPath);
    switch (fileType) {
      // case "image":
      //   return <PictureOutlined />;
      // case "video":
      //   return <VideoCameraOutlined />;
      // case "audio":
      //   return <AudioOutlined />;
      // case "pdf":
      //   return <FilePdfOutlined />;
      default:
        return <FileOutlined />;
    }
  };

  const columns = useMemo(
    () => [
      {
        title: "Name",
        dataIndex: "title",
        key: "title",
        render: (text: string, record: DriveItemRow) => (
          <div
            onClick={() => {
              if (record.isDisabled) {
                return;
              } else {
                handleFileFolderClick(record.fullPath);
              }
            }}
            style={{
              cursor: record.isDisabled ? "not-allowed" : "pointer",
              width: "100%",
              color: record.isDisabled ? "gray" : "black",
              padding: "8px 0", // Add some padding for a larger clickable area
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {renamingItems[record.id] ? (
              <Input
                value={renamingItems[record.id]}
                onChange={(e) => handleRenameChange(record.id, e.target.value)}
                onPressEnter={() => handleRenameSubmit(record)}
                onBlur={() => handleRenameChange(record.id, "")}
                onClick={(e) => e.stopPropagation()}
                prefix={
                  record.isFolder ? (
                    <FolderOpenOutlined />
                  ) : (
                    renderIconForFile(record.fullPath)
                  )
                }
                suffix={
                  <CheckOutlined onClick={() => handleRenameSubmit(record)} />
                }
              />
            ) : (
              <>
                {record.isFolder ? (
                  <FolderOpenFilled />
                ) : (
                  renderIconForFile(record.fullPath)
                )}
                <span style={{ marginLeft: 8 }}>{text}</span>
              </>
            )}
          </div>
        ),
      },
      {
        title: "Owner",
        dataIndex: "owner",
        key: "owner",
        render: () => "me", // Mock data, replace with actual owner info when available
        responsive: ["md"] as Breakpoint[],
      },
      {
        title: "Actions",
        key: "actions",
        align: "right" as const,
        render: (_: any, record: DriveItemRow) => (
          <div style={{ display: "flex", justifyContent: "flex-end" }}>
            <Dropdown
              menu={{ items: getRowMenuItems(record) }}
              trigger={["click"]}
            >
              <Button
                type="link"
                icon={<MoreOutlined />}
                size="large"
                style={{ color: "gray" }}
              />
            </Dropdown>
          </div>
        ),
      },
    ],
    [renamingItems]
  );

  const getRowMenuItems = (record: DriveItemRow): MenuProps["items"] => [
    {
      key: "rename",
      label: "Rename",
      onClick: (e) => {
        console.log("rename", record.title);
        setRenamingItems((prev) => ({ ...prev, [record.id]: record.title }));
      },
    },
    {
      key: "move",
      label: "Move",
      onClick: () => message.info(`Move ${record.title}`),
      disabled: true,
    },
    {
      key: "delete",
      label: (
        <Popconfirm
          title={`Are you sure you want to delete this ${record.isFolder ? "folder" : "file"}?`}
          description="This action cannot be undone."
          onConfirm={() => handleDelete(record)}
          okText="Yes"
          cancelText="No"
        >
          Delete
        </Popconfirm>
      ),
    },
  ];

  const handleDelete = async (record: DriveItemRow) => {
    try {
      if (record.isFolder) {
        await deleteFolder(record.id as FolderUUID);
      } else {
        await deleteFile(record.id as FileUUID);
      }
      message.success(
        `${record.isFolder ? "Folder" : "File"} deleted successfully`
      );
      setContent((prev) => ({
        folders: prev.folders.filter((f) => f.id !== record.id),
        files: prev.files.filter((f) => f.id !== record.id),
      }));
    } catch (error) {
      message.error(`Failed to delete ${record.isFolder ? "folder" : "file"}`);
    }
  };

  const items: MenuProps["items"] = [
    {
      label: "Coming Soon",
      key: "1",
      disabled: true,
    },
    {
      label: "Coming Soon",
      key: "2",
      disabled: true,
    },
  ];

  const onClick: MenuProps["onClick"] = ({ key }) => {
    message.info(`Click on item ${key}`);
  };

  const breadcrumbItems = [
    { title: <Link to="/drive">Drive</Link> },
    ...currentPath.map((part, index) => ({
      title: (
        <Link
          to={`/drive/${encodeURIComponent(currentPath.slice(0, index + 1).join("/"))}/`}
          onClick={() => setIs404NotFound(false)}
        >
          {part}
        </Link>
      ),
    })),
  ];

  const tableRows: DriveItemRow[] = useMemo(() => {
    if (currentPath.length === 0) {
      return content.folders.map((f) => ({
        id: f.id,
        title: f.originalFolderName,
        owner: "System",
        isFolder: true,
        fullPath: f.fullFolderPath,
        isDisabled: f.isDisabled || false,
      }));
    }
    return [
      ...content.folders.map((f) => ({
        id: f.id,
        title: f.originalFolderName,
        owner: f.owner,
        isFolder: true,
        fullPath: f.fullFolderPath,
        isDisabled: false,
      })),
      ...content.files.map((f) => ({
        id: f.id,
        title: f.originalFileName,
        owner: f.owner,
        isFolder: false,
        fullPath: f.fullFilePath,
        isDisabled: false,
      })),
    ];
  }, [content, currentPath]);

  const handleRenameChange = (id: string, newName: string) => {
    setRenamingItems((prev) => ({ ...prev, [id]: newName }));
  };

  const handleRenameSubmit = async (record: DriveItemRow) => {
    const newName = renamingItems[record.id];
    if (newName && newName !== record.title) {
      try {
        if (record.isFolder) {
          await renameFolderPath(record.id as FolderUUID, newName);
        } else {
          await renameFilePath(record.id as FileUUID, newName);
        }
        message.success(
          `${record.isFolder ? "Folder" : "File"} renamed successfully`
        );
        fetchContent();
      } catch (error) {
        console.log(error);
        message.error(
          `Failed to rename ${record.isFolder ? "folder" : "file"}`
        );
      }
    }
    setRenamingItems((prev) => {
      const { [record.id]: _, ...rest } = prev;
      return rest;
    });
  };

  const handleStorjSettingsCancel = () => {
    if (!areStorjSettingsSet()) {
      navigate("/drive");
    }
    setIsStorjModalVisible(false);
  };

  const handleCloudSync = async () => {
    if (isSyncing) return;
    if (window.location.pathname.includes("Web3Storj")) {
      apiNotifs.open({
        message: "Syncing Cloud...",
        description:
          "Please wait while we sync your offline changes with the cloud",
        icon: <ReloadOutlined spin size={16} />,
      });
      await syncOfflineWithCloud({});
      await fetchContent();
    }
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "calc(100vh - 100px)",
        borderRadius: "16px 16px 0px 0px",
        overflow: "hidden",
        background: "#fff",
        flex: 1,
      }}
    >
      {contextHolder}
      <div
        style={{
          padding: "16px 24px",
          borderBottom: "1px solid #fbfbfb",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
        }}
      >
        <Breadcrumb items={breadcrumbItems} />
        <div style={{ display: "flex", flexDirection: "row" }}>
          {icpCanisterId && (
            <div
              style={{
                display: "flex",
                flexDirection: "row",
                justifyContent: "flex-start",
                alignItems: "center",
              }}
            >
              <span style={{ color: "gray", marginRight: "10px" }}>
                {isSyncing ? "Syncing..." : ""}
              </span>
              <ReloadOutlined
                onClick={handleCloudSync}
                size={32}
                style={{
                  color: "gray",
                  marginRight: "12px",
                  cursor: isSyncing ? "not-allowed" : "pointer",
                }}
                spin={isSyncing}
              />
            </div>
          )}

          {/* <p onClick={exportSnapshots}>Snapshot</p> */}

          <ActionMenuButton
            isBigButton={false}
            toggleUploadPanel={toggleUploadPanel}
          />
        </div>
      </div>
      <div
        style={{
          display: "flex",
          flexGrow: 1,
          overflowY: screenType.isMobile ? "scroll" : "visible",
        }}
      >
        <div style={{ flexGrow: 1, padding: 16, width: "100%" }}>
          <div
            className="invisible-scrollbar"
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginBottom: 16,
              overflowX: "scroll",
            }}
          >
            <Button
              onClick={handleBack}
              type="link"
              icon={<ArrowLeftOutlined />}
              style={{
                padding: 0,
                color: "inherit",
                textDecoration: "none",
                margin: "0px 8px 0px 0px",
              }}
            >
              Back
            </Button>
            <div style={{ display: "flex", gap: "20px", alignItems: "center" }}>
              <Dropdown menu={{ items, onClick }}>
                <a
                  onClick={(e) => e.preventDefault()}
                  style={{ color: "rgba(0,0,0,0.4)" }}
                >
                  <Space>
                    <SortAscendingOutlined />
                    Type
                    <DownOutlined />
                  </Space>
                </a>
              </Dropdown>

              <Dropdown menu={{ items, onClick }}>
                <a
                  onClick={(e) => e.preventDefault()}
                  style={{ color: "rgba(0,0,0,0.4)" }}
                >
                  <Space>
                    <TeamOutlined />
                    People
                    <DownOutlined />
                  </Space>
                </a>
              </Dropdown>

              <Dropdown menu={{ items, onClick }}>
                <a
                  onClick={(e) => e.preventDefault()}
                  style={{ color: "rgba(0,0,0,0.4)" }}
                >
                  <Space>
                    <ClockCircleOutlined />
                    Modified
                    <DownOutlined />
                  </Space>
                </a>
              </Dropdown>

              <Dropdown menu={{ items, onClick }}>
                <a
                  onClick={(e) => e.preventDefault()}
                  style={{ color: "rgba(0,0,0,0.4)" }}
                >
                  <Space>
                    <BarsOutlined />
                    Row View
                    <DownOutlined />
                  </Space>
                </a>
              </Dropdown>
            </div>
          </div>
          {is404NotFound ? (
            <div style={{ background: "rgba(0,0,0,0.02)" }}>
              <Result
                icon={<FileUnknownOutlined />}
                title="404 Not Found"
                subTitle="The file you are looking for does not exist or has been deleted."
                extra={[
                  <div key="home">
                    <Link to="/drive">
                      <Button
                        key="back"
                        onClick={() => setIs404NotFound(false)}
                      >
                        Home
                      </Button>
                    </Link>
                  </div>,
                ]}
                style={{ padding: isMobile ? "50px 0px" : "100px 0px" }}
              />
              <br />
              <br />
            </div>
          ) : singleFile ? (
            <FilePage file={singleFile} />
          ) : (
            <UploadDropZone toggleUploadPanel={toggleUploadPanel}>
              {tableRows.length === 0 ? (
                <div
                  style={{
                    display: "flex",
                    flexGrow: 1,
                    justifyContent: "center",
                    alignItems: "center",
                    background: "rgba(0,0,0,0.02)",
                    borderRadius: "10px",
                    flexDirection: "column",
                    height: "calc(80vh - 100px)",
                    width: "100%",
                  }}
                >
                  <Result
                    icon={
                      <CloudUploadOutlined
                        style={{ fontSize: "64px", color: "#8c8c8c" }}
                      />
                    } // Larger icon in gray
                    title={
                      <span
                        style={{
                          color: "#595959",
                          fontSize: "24px",
                          fontWeight: 500,
                        }}
                      >
                        Upload Files
                      </span>
                    }
                    subTitle={
                      <span
                        style={{
                          color: "#8c8c8c",
                          fontSize: "16px",
                          marginTop: "8px",
                          display: "block",
                        }}
                      >
                        This folder is empty. Drag and drop files here to
                        upload.
                      </span>
                    }
                    extra={
                      <ActionMenuButton
                        isBigButton={false}
                        toggleUploadPanel={toggleUploadPanel}
                        key="upload"
                      />
                    }
                    style={{
                      padding: "48px", // Add more padding for better spacing
                      borderRadius: "12px", // Slightly round the corners
                      textAlign: "center", // Center the text
                      // width: "80%", // Take up more horizontal space
                      maxWidth: "100%",
                      height: "100%",
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "center",
                      flex: 1,
                    }}
                  />
                </div>
              ) : (
                <Table
                  columns={columns}
                  dataSource={tableRows}
                  rowKey="id"
                  locale={{ emptyText: "This folder is empty" }}
                  pagination={false}
                  scroll={{ y: "calc(80vh - 150px)", x: "scroll" }} // Adjust this value as needed
                  sticky={true}
                  style={{ width: "100%" }}
                />
              )}
            </UploadDropZone>
          )}
        </div>
      </div>

      <Modal
        open={isStorjModalVisible}
        onCancel={() => setIsStorjModalVisible(false)}
        footer={null}
        width={600}
        maskClosable={areStorjSettingsSet()}
        closable={areStorjSettingsSet()}
      >
        <StorjSettingsCard
          onSave={handleStorjSettingsSave}
          onCancel={handleStorjSettingsCancel}
        />
      </Modal>
    </div>
  );
};

export default DriveUI;

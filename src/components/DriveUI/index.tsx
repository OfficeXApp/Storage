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
  FileUUID,
  FolderUUID,
  StorageLocationEnum,
  LOCAL_STORAGE_STORJ_ACCESS_KEY,
  LOCAL_STORAGE_STORJ_SECRET_KEY,
  LOCAL_STORAGE_STORJ_ENDPOINT,
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
import {
  DirectoryResourceID,
  DiskID,
  DriveFullFilePath,
  FileID,
  FileRecord,
  FolderID,
  FolderRecord,
  IRequestListDisks,
  UserID,
} from "@officexapp/types";
import { useDispatch, useSelector } from "react-redux";
import { ReduxAppState } from "../../redux-offline/ReduxProvider";
import { listDisksAction } from "../../redux-offline/disks/disks.actions";
import { useIdentitySystem } from "../../framework/identity";
import {
  createFileAction,
  createFolderAction,
  DELETE_FILE,
  DELETE_FOLDER,
  deleteFileAction,
  deleteFolderAction,
  UPDATE_FILE,
  UPDATE_FOLDER,
  updateFileAction,
  updateFolderAction,
  getFileAction,
  getFolderAction,
  GET_FILE,
} from "../../redux-offline/directory/directory.actions";

interface DriveItemRow {
  id: FolderID | FileID;
  title: string;
  owner: string;
  isFolder: boolean;
  fullPath: DriveFullFilePath;
  isDisabled: boolean;
}

interface DriveUIProps {
  toggleUploadPanel: (bool: boolean) => void; // Callback to toggle UploadPanel visibility
}

const mockFetchFilesAtFolderPath = (
  folderPath: string,
  limit: number,
  offset: number
) => {
  return {
    folders: [] as FolderRecord[],
    files: [] as FileRecord[],
    total_files: 0,
    total_folders: 0,
    cursor: undefined,
  };
};

const DriveUI: React.FC<DriveUIProps> = ({ toggleUploadPanel }) => {
  const { "*": encodedPath } = useParams<{ "*": string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const screenType = useScreenType();
  const dispatch = useDispatch();

  const { currentOrg } = useIdentitySystem();

  const disks = useSelector((state: ReduxAppState) => state.disks.disks);
  const filesFromRedux = useSelector(
    (state: ReduxAppState) => state.directory.files
  );
  const foldersFromRedux = useSelector(
    (state: ReduxAppState) => state.directory.folders
  );

  const [currentPath, setCurrentPath] = useState<string[]>([]);
  const [content, setContent] = useState<{
    folders: FolderRecord[];
    files: FileRecord[];
  }>({ folders: [], files: [] });
  const [renamingItems, setRenamingItems] = useState<{ [key: string]: string }>(
    {}
  );
  const [isStorjModalVisible, setIsStorjModalVisible] = useState(false);
  const [singleFile, setSingleFile] = useState<FileRecord | null>(null);
  const [is404NotFound, setIs404NotFound] = useState(false);
  const [apiNotifs, contextHolder] = notification.useNotification();

  // Initialize disks on component mount
  useEffect(() => {
    const listParams: IRequestListDisks = {};
    dispatch(listDisksAction(listParams));
  }, [dispatch]);

  // Show notification for Web3Storj free trial
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

  // REFACTORED: Handle path changes to work with the new URL format
  useEffect(() => {
    setIs404NotFound(false);
    setSingleFile(null);

    const path = encodedPath ? decodeURIComponent(encodedPath) : "";
    const pathParts = path.split("/").filter(Boolean);

    setCurrentPath(pathParts);

    // Check if this is a file request
    // In the new format, if last path segment contains "FileID_" it's a file
    if (pathParts.length > 0) {
      const lastSegment = pathParts[pathParts.length - 1];
      if (lastSegment.includes("FileID_")) {
        // Extract the FileID
        const fileId = lastSegment;
        fetchFileById(fileId);
      } else {
        // This is a folder request
        fetchContent(pathParts);
      }
    } else {
      // Root path - show disks
      fetchContent(pathParts);
    }

    // Check if we're in the Web3Storj route and Storj settings are not set
    if (
      pathParts[0]?.startsWith("DiskID_") &&
      pathParts[0].includes("Web3Storj") &&
      !areStorjSettingsSet()
    ) {
      setIsStorjModalVisible(true);
    }
  }, [encodedPath, location.search]);

  // Listen for changes in the Redux store for files
  useEffect(() => {
    // If we're looking for a specific file and the filesFromRedux has updated
    if (currentPath.length > 0) {
      const lastSegment = currentPath[currentPath.length - 1];
      if (lastSegment.includes("FileID_")) {
        const fileId = lastSegment;
        const file = filesFromRedux.find((f) => f.id === fileId);
        if (file) {
          setSingleFile(file);
          setIs404NotFound(false);
        }
      }
    }
  }, [filesFromRedux, currentPath]);

  // ADDED: New function to fetch file by ID using Redux action
  const fetchFileById = (fileId: string) => {
    try {
      // Check if the file is already in our Redux store
      const file = filesFromRedux.find((f) => f.id === fileId);
      if (file) {
        setSingleFile(file);
        return;
      }

      // Create the get file action
      const getAction = {
        action: GET_FILE as "GET_FILE",
        target: {
          resource_id: fileId as DirectoryResourceID,
        },
        payload: {},
      };

      // Dispatch the action
      dispatch(getFileAction(getAction));

      // We'll rely on the useEffect that watches filesFromRedux to set the file
      // when it arrives from the Redux store after the action completes

      // Set a timeout to show 404 if the file isn't found after a delay
      setTimeout(() => {
        if (!singleFile) {
          setIs404NotFound(true);
        }
      }, 3000);
    } catch (error) {
      console.error("Error fetching file by ID:", error);
      setIs404NotFound(true);
    }
  };

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
    setIsStorjModalVisible(false);
    fetchContent(currentPath);
  };

  // REFACTORED: Fetch content based on the new path format
  const fetchContent = useCallback(
    async (currentParts?: string[]) => {
      const pathParts = currentParts || currentPath;

      if (pathParts.length === 0) {
        // Root level showing disks from Redux
        setContent({
          folders: disks.map((disk) => ({
            id: disk.id as FolderID,
            name: disk.name,
            parent_folder_uuid: "",
            subfolder_uuids: [],
            file_uuids: [],
            full_folder_path: `${disk.disk_type}::` as DriveFullFilePath,
            labels: [],
            created_by: "Owner" as UserID,
            created_at: Date.now(),
            last_updated_date_ms: disk.created_at || 0,
            last_updated_by: "Owner" as UserID,
            disk_id: disk.id,
            deleted: false,
            expires_at: 0,
            drive_id: currentOrg?.driveID || "",
            has_sovereign_permissions: false,
          })),
          files: [],
        });
      } else {
        // Handle the folder/file structure based on the new format
        const diskId = pathParts[0]; // Now it's DiskID_abc123

        // For folders, maintain using the mock function for now
        // Assuming we want to continue to use the mockFetchFilesAtFolderPath
        // but adapt it to work with our new URL structure

        let fullPathString = "";

        // Determine storage location based on disk ID
        let storageLocation = "Local"; // Default
        if (diskId.includes("Web3Storj")) {
          storageLocation = "Web3Storj";
        }

        // Construct a path compatible with the mock function
        fullPathString = `${storageLocation}::${pathParts.slice(1).join("/")}`;

        if (!fullPathString.endsWith("/") && !fullPathString.endsWith(":")) {
          fullPathString += "/";
        }

        console.log("fetching content for", fullPathString);

        // Use mock function for fetching folder contents (keeping as requested)
        try {
          const result = await mockFetchFilesAtFolderPath(
            fullPathString as DriveFullFilePath,
            100,
            0
          );

          console.log(`>>>> result from ${fullPathString}`, result);

          // Convert folders to expected format
          const convertedFolders = result.folders
            .filter((f) => !f.deleted)
            .map((folder) => ({
              id: folder.id as FolderID,
              name: folder.name,
              parent_folder_uuid: folder.parent_folder_uuid as FolderID,
              subfolder_uuids: folder.subfolder_uuids as FolderID[],
              file_uuids: folder.file_uuids as FileID[],
              full_folder_path: folder.full_folder_path as DriveFullFilePath,
              labels: folder.labels || [],
              created_by: folder.created_by as UserID,
              created_at: folder.created_at || Date.now(),
              last_updated_date_ms: folder.last_updated_date_ms || 0,
              last_updated_by: folder.last_updated_by as UserID,
              disk_id: folder.id.split("-")[0] as DiskID,
              deleted: false,
              expires_at: 0,
              drive_id: currentOrg?.driveID || "",
              has_sovereign_permissions: false,
            }));

          // Set content with empty files for now
          setContent({
            folders: convertedFolders,
            files: [],
          });
        } catch (error) {
          console.error("Error fetching folder contents:", error);
          setContent({ folders: [], files: [] });
        }
      }
    },
    [currentPath, disks, currentOrg]
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

  // REFACTORED: Handle click based on new path structure
  const handleFileFolderClick = (item: DriveItemRow) => {
    if (item.isDisabled) return;

    // For the new format, we navigate based on IDs
    if (item.isFolder) {
      // If it's already a folder, just append the folder ID to the path
      navigate(`/drive/${currentPath.join("/")}/${item.id}`);
    } else {
      // If it's a file, we need to handle it differently
      // Since the file is in the current folder, we navigate to it
      navigate(`/drive/${currentPath.join("/")}/${item.id}`);
    }
  };

  const renderIconForFile = (fullPath: DriveFullFilePath) => {
    const fileType = getFileType(fullPath);
    switch (fileType) {
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
                handleFileFolderClick(record);
              }
            }}
            style={{
              cursor: record.isDisabled ? "not-allowed" : "pointer",
              width: "100%",
              color: record.isDisabled ? "gray" : "black",
              padding: "8px 0",
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
        render: () => "me",
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
      onClick: () => {
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

  // Handle delete using Redux actions
  const handleDelete = async (record: DriveItemRow) => {
    try {
      if (record.isFolder) {
        // Create the delete folder action
        const deleteAction = {
          action: DELETE_FOLDER as "DELETE_FOLDER",
          target: {
            resource_id: record.id as DirectoryResourceID,
          },
          payload: {
            permanent: true,
          },
        };

        dispatch(deleteFolderAction(deleteAction));
      } else {
        // Create the delete file action
        const deleteAction = {
          action: DELETE_FILE as "DELETE_FILE",
          target: {
            resource_id: record.id as DirectoryResourceID,
          },
          payload: {
            permanent: true,
          },
        };

        dispatch(deleteFileAction(deleteAction));
      }

      message.success(
        `${record.isFolder ? "Folder" : "File"} deleted successfully`
      );

      // Update the local state to remove the item
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

  // REFACTORED: Update breadcrumb to reflect new path structure
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
        title: f.name,
        owner: f.created_by,
        isFolder: true,
        fullPath: f.full_folder_path,
        isDisabled: false,
      }));
    }
    return [
      ...content.folders.map((f) => ({
        id: f.id,
        title: f.name,
        owner: f.created_by,
        isFolder: true,
        fullPath: f.full_folder_path,
        isDisabled: false,
      })),
      ...content.files.map((f) => ({
        id: f.id,
        title: f.name,
        owner: f.created_by,
        isFolder: false,
        fullPath: f.full_file_path,
        isDisabled: false,
      })),
    ];
  }, [content, currentPath]);

  const handleRenameChange = (id: string, newName: string) => {
    setRenamingItems((prev) => ({ ...prev, [id]: newName }));
  };

  // Handle rename using Redux actions
  const handleRenameSubmit = async (record: DriveItemRow) => {
    const newName = renamingItems[record.id];
    if (newName && newName !== record.title) {
      try {
        if (record.isFolder) {
          // Create update folder action
          const updateAction = {
            action: UPDATE_FOLDER as "UPDATE_FOLDER",
            target: {
              resource_id: record.id as DirectoryResourceID,
            },
            payload: {
              name: newName,
            },
          };

          dispatch(updateFolderAction(updateAction));
        } else {
          // Create update file action
          const updateAction = {
            action: UPDATE_FILE as "UPDATE_FILE",
            target: {
              resource_id: record.id as DirectoryResourceID,
            },
            payload: {
              name: newName,
            },
          };

          dispatch(updateFileAction(updateAction));
        }

        message.success(
          `${record.isFolder ? "Folder" : "File"} renamed successfully`
        );

        // Refresh content to show the update
        fetchContent();
      } catch (error) {
        console.log(error);
        message.error(
          `Failed to rename ${record.isFolder ? "folder" : "file"}`
        );
      }
    }

    // Clear the renaming state
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
            <div style={{ padding: "20px" }}>
              {/* <FilePage file={singleFile} /> */}
            </div>
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
                    }
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
                      padding: "48px",
                      borderRadius: "12px",
                      textAlign: "center",
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
                  scroll={{ y: "calc(80vh - 150px)", x: "scroll" }}
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

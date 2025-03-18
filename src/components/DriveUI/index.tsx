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
  DiskTypeEnum,
  DriveFullFilePath,
  DriveID,
  FileID,
  FileRecord,
  FolderID,
  FolderRecord,
  ICPPrincipalString,
  IRequestListDirectory,
  IRequestListDisks,
  SortDirection,
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
  listDirectoryAction,
  generateListQueryString,
} from "../../redux-offline/directory/directory.actions";
import { defaultTempCloudSharingRootFolderID } from "../../api/dexie-database";

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

const DriveUI: React.FC<DriveUIProps> = ({ toggleUploadPanel }) => {
  const { "*": encodedPath } = useParams<{ "*": string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const screenType = useScreenType();
  const dispatch = useDispatch();

  const { currentOrg } = useIdentitySystem();

  const [listDirectoryQueryString, setListDirectoryQueryString] = useState("");

  const disks = useSelector((state: ReduxAppState) => state.disks.disks);
  const listDirectoryResults = useSelector(
    (state: ReduxAppState) =>
      state.directory.listingDataMap[listDirectoryQueryString]
  );

  // const [currentDiskId, setCurrentDiskId] = useState<DiskID | null>(null);
  const [currentFolderId, setCurrentFolderId] = useState<FolderID | null>(null);
  const [currentFileId, setCurrentFileId] = useState<FileID | null>(null);

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

  useEffect(() => {
    if (listDirectoryResults) {
      const { folders, files } = listDirectoryResults;
      setContent({ folders, files });
    }
  }, [listDirectoryResults]);

  // Show notification for Web3Storj free trial
  useEffect(() => {
    const path = encodedPath ? decodeURIComponent(encodedPath) : "";
    const pathParts = path.split("/").filter(Boolean);

    console.log(`location.pathname`, location.pathname);

    if (location.pathname === "/drive" || pathParts.length === 0) {
      console.log(`fetching at base route`);
      setListDirectoryQueryString("");
      const listParams: IRequestListDisks = {};
      dispatch(listDisksAction(listParams));
    } else if (
      location.pathname === `/drive/${defaultTempCloudSharingRootFolderID}/`
    ) {
      console.log(`fetching content for temp cloud sharing folder`);
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
      let folderId = pathParts[0];
      setCurrentFolderId(folderId);
      setCurrentFileId(null);
      fetchContent({
        targetFolderId: folderId,
      });
    } else if (pathParts[0].startsWith("FolderID_")) {
      let folderId = pathParts[0];
      setCurrentFolderId(folderId);
      setCurrentFileId(null);
      fetchContent({
        targetFolderId: folderId,
      });
    } else if (pathParts[0].startsWith("FileID_")) {
      let fileId = pathParts[0];
      setCurrentFolderId(null);
      setCurrentFileId(fileId);
      fetchFileById(fileId);
    }

    // if (currentDisk.disk_type?.includes("Web3Storj") && !areStorjSettingsSet()) {
    //   setIsStorjModalVisible(true);
    // }
  }, [location, encodedPath]);

  useEffect(() => {
    if (disks && disks.length > 0 && location.pathname === "/drive") {
      fetchContent({});
    }
  }, [disks]);

  const fetchFileById = (fileId: FileID) => {
    try {
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
    if (currentFolderId) {
      fetchContent({
        targetFolderId: currentFolderId,
      });
    }
  };

  // Fetch content based on folder ID
  const fetchContent = useCallback(
    async ({
      targetFolderId,
      targetFileId,
    }: {
      targetFolderId?: FolderID;
      targetFileId?: FileID;
    }) => {
      console.log(`fetching content for folder ID`, targetFolderId);
      if (!targetFolderId) {
        // Root level showing disks from Redux
        console.log(`disks`, disks);
        setContent({
          folders: disks.map((disk) => ({
            id: disk.root_folder as FolderID,
            name: disk.name,
            parent_folder_uuid: "",
            subfolder_uuids: [],
            file_uuids: [],
            full_directory_path: `${disk.disk_type}::` as DriveFullFilePath,
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
        return;
      }

      // We're inside a folder, so we need to fetch its contents
      if (targetFolderId) {
        const listParams: IRequestListDirectory = {
          folder_id: targetFolderId,
          page_size: 100,
          direction: SortDirection.ASC,
        };
        const _listDirectoryQueryString = generateListQueryString(listParams);
        setListDirectoryQueryString(_listDirectoryQueryString);

        // Dispatch the action to fetch the directory listing
        dispatch(listDirectoryAction(listParams));
        // Redux will update filesFromRedux and foldersFromRedux, which we handle in a useEffect
        return;
      }

      if (targetFileId) {
        // Fetch the file
        fetchFileById(targetFileId);
      }
    },
    [currentFolderId, disks, currentOrg]
  );

  const handleBack = () => {
    navigate(-1);
    // if (currentFileId) {
    //   // If viewing a file, go back to its folder
    //   navigate(`/drive/${currentDiskId}/${currentFolderId}`);
    // } else if (currentFolderId) {
    //   // If in a folder, find its parent folder
    //   const currentFolder = foldersFromRedux.find(
    //     (f) => f.id === currentFolderId
    //   );
    //   if (currentFolder && currentFolder.parent_folder_uuid) {
    //     // If parent folder exists, navigate to it
    //     navigate(`/drive/${currentDiskId}/${currentFolder.parent_folder_uuid}`);
    //   } else {
    //     // If no parent folder (top-level folder), go back to disk
    //     navigate(`/drive/${currentDiskId}`);
    //   }
    // } else if (currentDiskId) {
    //   // If at a disk, go back to root
    //   navigate("/drive");
    // } else {
    //   // Already at root
    //   navigate("/drive");
    // }
  };

  const handleFileFolderClick = (item: DriveItemRow) => {
    if (item.isDisabled) return;
    console.log(`Clcked on item`, item);
    if (item.isFolder) {
      navigate(`/drive/${item.id}/`);
    } else {
      navigate(`/drive/${item.id}`);
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

  // Generate breadcrumb items
  const generateBreadcrumbItems = () => {
    const items = [{ title: <Link to="/drive">Drive</Link> }];

    // // Add disk if present
    // if (currentDiskId) {
    //   const disk = disks.find((d) => d.id === currentDiskId);
    //   const diskName = disk ? disk.name : currentDiskId.replace("DiskID_", "");

    //   items.push({
    //     title: <Link to={`/drive/${currentDiskId}`}>{diskName}</Link>,
    //   });

    //   // If we have a folder, add it
    //   if (currentFolderId) {
    //     const folder = foldersFromRedux.find((f) => f.id === currentFolderId);
    //     const folderName = folder
    //       ? folder.name
    //       : currentFolderId.replace("FolderID_", "");

    //     items.push({
    //       title: (
    //         <Link to={`/drive/${currentDiskId}/${currentFolderId}`}>
    //           {folderName}
    //         </Link>
    //       ),
    //     });

    //     // If we have a file, add it
    //     if (currentFileId) {
    //       const file = filesFromRedux.find((f) => f.id === currentFileId);
    //       const fileName = file
    //         ? file.name
    //         : currentFileId.replace("FileID_", "");

    //       items.push({
    //         title: <span>{fileName}</span>, // Not a link when viewing the file
    //       });
    //     }
    //   }
    // }

    return items;
  };

  const breadcrumbItems = generateBreadcrumbItems();

  const tableRows: DriveItemRow[] = useMemo(() => {
    if (!currentFolderId) {
      // At root, showing disks
      return content.folders.map((f) => ({
        id: f.id,
        title: f.name,
        owner: f.created_by,
        isFolder: true,
        fullPath: f.full_directory_path,
        isDisabled: false,
      }));
    }

    // In a folder, showing folders and files
    return [
      ...content.folders.map((f) => ({
        id: f.id,
        title: f.name,
        owner: f.created_by,
        isFolder: true,
        fullPath: f.full_directory_path,
        isDisabled: false,
      })),
      ...content.files.map((f) => ({
        id: f.id,
        title: f.name,
        owner: f.created_by,
        isFolder: false,
        fullPath: f.full_directory_path,
        isDisabled: false,
      })),
    ];
  }, [content, currentFolderId]);

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
        fetchContent({});
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

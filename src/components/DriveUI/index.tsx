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
  Checkbox,
  Spin,
} from "antd";
import { v4 as uuidv4 } from "uuid";
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
  LoadingOutlined,
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
import { getFileType, sleep } from "../../api/helpers";
import { freeTrialStorjCreds } from "../../api/storj";
import mixpanel from "mixpanel-browser";
import {
  DirectoryResourceID,
  DiskID,
  DiskTypeEnum,
  DriveClippedFilePath,
  DriveFullFilePath,
  DriveID,
  FileID,
  FileRecord,
  FolderID,
  FolderRecord,
  ICPPrincipalString,
  IRequestListDirectory,
  IRequestListDirectoryPermissions,
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
  generateListDirectoryKey,
  restoreTrashAction,
  RESTORE_TRASH,
} from "../../redux-offline/directory/directory.actions";
import dayjs from "dayjs";
import {
  defaultBrowserCacheDiskID,
  defaultTempCloudSharingDiskID,
  defaultTempCloudSharingRootFolderID,
} from "../../api/dexie-database";
import {
  FileFEO,
  FolderFEO,
  shouldBehaveOfflineDiskUIIntent,
} from "../../redux-offline/directory/directory.reducer";
import {
  LIST_DIRECTORY_PERMISSIONS,
  listDirectoryPermissionsAction,
} from "../../redux-offline/permissions/permissions.actions";
import DirectorySharingDrawer from "../DirectorySharingDrawer";
import DirectoryGuard from "./DirectoryGuard";
import { useMultiUploader } from "../../framework/uploader/hook";

interface DriveItemRow {
  id: FolderID | FileID;
  title: string;
  owner: string;
  isFolder: boolean;
  fullPath: DriveFullFilePath;
  diskID: DiskID;
  isDisabled: boolean;
  diskType: DiskTypeEnum;
  expires_at: number;
  hasDiskTrash?: FolderID;
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
  const isTrashBin = location.search.includes("isTrashBin=1");
  const { currentOrg, wrapOrgCode } = useIdentitySystem();
  const [showAncillary, setShowAncillary] = useState(false);

  const [listDirectoryKey, setListDirectoryKey] = useState("");

  const { disks, defaultDisk } = useSelector((state: ReduxAppState) => ({
    defaultDisk: state.disks.defaultDisk,
    disks: state.disks.disks,
  }));
  const listDirectoryResults = useSelector(
    (state: ReduxAppState) => state.directory.listingDataMap[listDirectoryKey]
  );

  const [currentDiskId, setCurrentDiskId] = useState<DiskID | null>(null);
  const [currentFolderId, setCurrentFolderId] = useState<FolderID | null>(null);
  const [currentFileId, setCurrentFileId] = useState<FileID | null>(null);

  const { uploadTargetDiskID } = useMultiUploader();

  const isOfflineDisk =
    uploadTargetDiskID === defaultTempCloudSharingDiskID ||
    uploadTargetDiskID === defaultBrowserCacheDiskID;

  const getFileResult: FileFEO | undefined = useSelector(
    (state: ReduxAppState) => state.directory.fileMap[currentFileId || ""]
  );

  const currentDisk = disks.find((d) => d.id === currentDiskId) || defaultDisk;

  const [content, setContent] = useState<{
    folders: FolderFEO[];
    files: FileFEO[];
  }>({ folders: [], files: [] });
  const [renamingItems, setRenamingItems] = useState<{ [key: string]: string }>(
    {}
  );
  const [shareFolderDrawerVisible, setShareFolderDrawerVisible] =
    useState(false);
  const [isStorjModalVisible, setIsStorjModalVisible] = useState(false);
  const [singleFile, setSingleFile] = useState<FileFEO | null>(null);
  const [is404NotFound, setIs404NotFound] = useState(false);
  const [apiNotifs, contextHolder] = notification.useNotification();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (
      !currentDiskId &&
      !currentFileId &&
      !currentFolderId &&
      disks.length > 0
    ) {
      fetchContent({});
    }
  }, [currentDiskId, currentFolderId, currentFileId, disks]);

  useEffect(() => {
    console.log(`listDirectoryResults`, listDirectoryResults);
    if (listDirectoryResults) {
      const { folders, files } = listDirectoryResults;
      setContent({ folders, files });
      setIsLoading(false);
      setIs404NotFound(false);
    }
  }, [listDirectoryResults]);

  useEffect(() => {
    if (currentFileId && !getFileResult) {
      setIs404NotFound(true);
      setIsLoading(false);
      setSingleFile(null);
    } else if (currentFileId && getFileResult) {
      console.log(`currentFileId=${currentFileId}`, getFileResult);
      setIs404NotFound(false);
      setIsLoading(false);
      setSingleFile(getFileResult);
    }
  }, [getFileResult, currentFileId]);

  // Show notification for Web3Storj free trial
  useEffect(() => {
    // const path = encodedPath ? decodeURIComponent(encodedPath) : "";
    const pathParts = location.pathname.split("/").filter(Boolean);
    console.log(`driveui pathParts`, pathParts);
    if (pathParts.length < 3) {
      return;
    }

    if (pathParts[2] === "drive" && pathParts.length === 3) {
      console.log(`we are in root`);
      setListDirectoryKey("");
      setCurrentFolderId(null);
      setCurrentFileId(null);
      setIsLoading(false);
      setIs404NotFound(false);
      fetchContent({});
      setSingleFile(null);
      return;
    }

    // console.log("Path parts:", pathParts);
    const diskType = pathParts[3];
    const diskID = pathParts[4];
    const folderFileID = pathParts[5];

    setCurrentDiskId(diskID);

    console.log(`====pathParts`, pathParts);
    console.log(`====location`, location);
    console.log(`====folderFileID`, folderFileID);

    if (folderFileID === defaultTempCloudSharingRootFolderID) {
      console.log(`we are in public sharing`);
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
      let folderId = folderFileID;
      setCurrentFolderId(folderId);
      setCurrentFileId(null);
      setSingleFile(null);
      fetchContent({
        targetFolderId: folderId,
      });
    } else if (folderFileID.startsWith("FolderID_")) {
      console.log(`we are in folder`, folderFileID);
      let folderId = folderFileID;
      setCurrentFolderId(folderId);
      setCurrentFileId(null);
      setSingleFile(null);
      setIsLoading(true);
      fetchContent({
        targetFolderId: folderId,
      });
    } else if (folderFileID.startsWith("FileID_")) {
      let fileId = folderFileID;
      console.log(
        `we are in file with fileId=${fileId}, currentFileId=${currentFileId}, and getFileResult.id=${getFileResult?.id}`
      );
      setCurrentFolderId(null);
      // Only set currentFileId if it's different
      if (fileId !== currentFileId) {
        setCurrentFileId(fileId);
        fetchFileById(fileId, diskID);
      }
      setIsLoading(true);
    } else {
      console.log(`we nowhere known`);
    }

    // if (currentDisk.disk_type?.includes("Web3Storj") && !areStorjSettingsSet()) {
    //   setIsStorjModalVisible(true);
    // }
  }, [location, showAncillary]);

  const fetchFileById = (fileId: FileID, diskID: DiskID) => {
    console.log("Fetching file by ID:", fileId);
    console.log(`currentDiskId`, currentDiskId);
    // return;
    if (!diskID) return;
    try {
      // Create the get file action
      const getAction = {
        action: GET_FILE as "GET_FILE",
        payload: {
          id: fileId,
        },
      };

      // Dispatch the action
      console.log(`currentDiskId=${diskID}`);
      console.log(`disk`, currentDisk);

      dispatch(
        getFileAction(getAction, shouldBehaveOfflineDiskUIIntent(diskID || ""))
      );

      const payload: IRequestListDirectoryPermissions = {
        filters: {
          resource_id: fileId as DirectoryResourceID,
        },
      };
      dispatch(listDirectoryPermissionsAction(payload));
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
      console.log(`fetchContent..`);

      if (!targetFolderId && !targetFileId) {
        // Root level showing disks from Redux

        setContent({
          folders: disks.map((disk) => {
            return {
              id: disk.root_folder as FolderID,
              name: disk.name,
              parent_folder_uuid: "",
              subfolder_uuids: [],
              file_uuids: [],
              full_directory_path: `${disk.disk_type}::/` as DriveFullFilePath,
              labels: [],
              created_by: "Owner" as UserID,
              created_at: Date.now(),
              last_updated_date_ms: disk.created_at || 0,
              last_updated_by: "Owner" as UserID,
              disk_id: disk.id,
              disk_type: disk.disk_type,
              deleted: false,
              expires_at: -1,
              drive_id: currentOrg?.driveID || "",
              has_sovereign_permissions: false,
              clipped_directory_path:
                `${disk.disk_type}::/` as DriveClippedFilePath,
              permission_previews: [],
              hasDiskTrash: disk.trash_folder,
              isAncillary:
                disks.length > 3
                  ? disk.id === defaultBrowserCacheDiskID ||
                    disk.id === defaultTempCloudSharingDiskID ||
                    disk.disk_type === DiskTypeEnum.IcpCanister
                  : disks.length === 3
                    ? disk.id === defaultBrowserCacheDiskID ||
                      disk.disk_type === DiskTypeEnum.IcpCanister
                    : false,
            };
          }),
          files: [],
        });
        setIsLoading(false);
        return;
      }

      console.log(`fetchContent targetFolderId`, targetFolderId);
      console.log(`currentDiskId`, currentDiskId);

      // We're inside a folder, so we need to fetch its contents
      if (targetFolderId) {
        const listParams: IRequestListDirectory = {
          folder_id: targetFolderId,
          page_size: 100,
          direction: SortDirection.ASC,
          permission_previews: [],
        };
        const _listDirectoryKey = generateListDirectoryKey(listParams);
        setListDirectoryKey(_listDirectoryKey);

        // Dispatch the action to fetch the directory listing
        console.log(
          `shouldBehaveOfflineDiskUIIntent(currentDiskId) = ${currentDiskId}`,
          shouldBehaveOfflineDiskUIIntent(currentDiskId || "")
        );
        dispatch(
          listDirectoryAction(
            listParams,
            currentDiskId
              ? shouldBehaveOfflineDiskUIIntent(currentDiskId)
              : false
          )
        );

        const payload: IRequestListDirectoryPermissions = {
          filters: {
            resource_id: targetFolderId as DirectoryResourceID,
          },
        };
        dispatch(listDirectoryPermissionsAction(payload));

        // Redux will update filesFromRedux and foldersFromRedux, which we handle in a useEffect
        return;
      }
      console.log(`targetFileId=${targetFileId}`);
      if (targetFileId) {
        // Fetch the file
        fetchFileById(targetFileId, currentDiskId || "");
      }
    },
    [currentFolderId, disks, currentOrg, currentDiskId]
  );

  const handleBack = () => {
    // console.log(`content`, content);
    // if (content.files.length > 0 && content.files[0]?.parent_folder_uuid) {
    //   navigate(
    //     `/drive/${content.files[0].disk_id}/${content.files[0].parent_folder_uuid}`
    //   );
    // }
    // if (content.folders.length > 0 && content.folders[0]?.parent_folder_uuid) {
    //   navigate(
    //     `/drive/${content.folders[0].disk_id}/${content.folders[0].parent_folder_uuid}`
    //   );
    // } else {
    // navigate(`/drive`);
    // }
    navigate(-1);
  };

  const appendRefreshParam = () => {
    const params = new URLSearchParams(location.search);
    params.set("refresh", uuidv4());
    navigate(`${location.pathname}?${params.toString()}`, { replace: true });
  };

  const handleFileFolderClick = (item: DriveItemRow) => {
    if (item.isDisabled) return;
    if (item.isFolder) {
      navigate(
        wrapOrgCode(`/drive/${item.diskType}/${item.diskID}/${item.id}/`)
      );
    } else {
      navigate(
        wrapOrgCode(`/drive/${item.diskType}/${item.diskID}/${item.id}`)
      );
    }
  };

  const renderIconForFile = (title: string) => {
    const fileType = getFileType(title);
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
        render: (text: string, record: DriveItemRow) => {
          return (
            <div
              onClick={() => {
                if (record.isDisabled) {
                  return;
                } else {
                  if (isTrashBin) {
                    message.error(
                      "You cannot access files in the Trash. Restore it first."
                    );
                  } else {
                    handleFileFolderClick(record);
                  }
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
                  onChange={(e) =>
                    handleRenameChange(record.id, e.target.value)
                  }
                  onPressEnter={() => handleRenameSubmit(record)}
                  onBlur={() => handleRenameChange(record.id, "")}
                  onClick={(e) => e.stopPropagation()}
                  prefix={
                    record.isFolder ? (
                      <FolderOpenOutlined />
                    ) : (
                      renderIconForFile(record.title)
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
                  ) : record ? (
                    renderIconForFile(record.title)
                  ) : null}
                  <span style={{ marginLeft: 8 }}>{text}</span>
                </>
              )}
            </div>
          );
        },
      },
      {
        title: "Status",
        dataIndex: "status",
        key: "status",
        render: (_: any, record: DriveItemRow) => {
          if (record.isDisabled) {
            return (
              <span style={{ color: "gray", cursor: "not-allowed" }}>
                Expired
              </span>
            );
          } else {
            return (
              <span style={{ color: "gray", cursor: "not-allowed" }}>
                {record.expires_at === -1
                  ? null
                  : `Expires ${dayjs(record.expires_at).fromNow()}`}
              </span>
            );
          }
        },
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
    [renamingItems, listDirectoryKey]
  );

  const getRowMenuItems = (record: DriveItemRow): MenuProps["items"] => {
    const menuItems = [
      {
        key: "rename",
        label: "Rename",
        onClick: () => {
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

    if (record.hasDiskTrash) {
      console.log(`inserting trash disk folder`);
      menuItems.unshift({
        key: "trash",
        label: "Open Trash",
        onClick: () => {
          navigate(
            wrapOrgCode(
              `/drive/${record.diskType}/${record.diskID}/${record.hasDiskTrash}?isTrashBin=1`
            )
          );
        },
      });
    }
    if (isTrashBin) {
      menuItems.unshift({
        key: "restore",
        label: (
          <Popconfirm
            title="Confirm Restore"
            description="Are you sure you want to restore trash?"
            onConfirm={() => handleRestore(record)}
          >
            Restore Trash
          </Popconfirm>
        ),
      });
    }
    return menuItems;
  };

  // Handle delete using Redux actions
  const handleDelete = async (record: DriveItemRow) => {
    try {
      if (record.isFolder) {
        // Create the delete folder action
        const deleteAction = {
          action: DELETE_FOLDER as "DELETE_FOLDER",
          payload: {
            id: record.id,
            permanent: isTrashBin,
          },
        };
        // console.log(`====listDirectoryKey`, listDirectoryKey);
        dispatch(
          deleteFolderAction(
            deleteAction,
            listDirectoryKey,
            shouldBehaveOfflineDiskUIIntent(record.diskID)
          )
        );
      } else {
        // Create the delete file action
        const deleteAction = {
          action: DELETE_FILE as "DELETE_FILE",
          payload: {
            id: record.id,
            permanent: isTrashBin,
          },
        };

        dispatch(
          deleteFileAction(
            deleteAction,
            listDirectoryKey,
            shouldBehaveOfflineDiskUIIntent(record.diskID)
          )
        );
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

  console.log(`listDirectoryKey`, listDirectoryKey);

  const handleRestore = async (record: DriveItemRow) => {
    try {
      const restoreAction = {
        action: RESTORE_TRASH as "RESTORE_TRASH",
        payload: {
          id: record.id,
        },
      };
      dispatch(
        restoreTrashAction(
          restoreAction,
          listDirectoryKey,
          shouldBehaveOfflineDiskUIIntent(record.diskID)
        )
      );
    } catch (e) {
      message.error(`Failed to restore ${record.isFolder ? "folder" : "file"}`);
      console.error(e);
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
    const items = [{ title: <Link to={wrapOrgCode("/drive")}>Drive</Link> }];

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
    return [
      ...content.folders
        .filter((f) => {
          if (showAncillary) return true;
          // @ts-ignore
          return !f.isAncillary;
        })
        .map((f) => ({
          id: f.id,
          title: f.name,
          owner: f.created_by,
          isFolder: true,
          fullPath: f.full_directory_path,
          diskID: f.disk_id,
          diskType: f.disk_type,
          isDisabled: f.expires_at === -1 ? false : f.expires_at < Date.now(),
          expires_at: f.expires_at,
          hasDiskTrash: (f as any).hasDiskTrash,
        })),
      ...content.files.map((f) => ({
        id: f.id,
        title: f.name,
        owner: f.created_by,
        isFolder: false,
        fullPath: f.full_directory_path,
        diskID: f.disk_id,
        diskType: f.disk_type,
        isDisabled: f.expires_at === -1 ? false : f.expires_at < Date.now(),
        expires_at: f.expires_at,
      })),
    ];
  }, [content, currentFolderId, disks]);

  const handleRenameChange = (id: string, newName: string) => {
    setRenamingItems((prev) => ({ ...prev, [id]: newName }));
  };

  // Handle rename using Redux actions
  const handleRenameSubmit = async (record: DriveItemRow) => {
    const newName = renamingItems[record.id];
    if (newName && newName !== record.title) {
      try {
        if (record.isFolder) {
          // update folder action
          const updateAction = {
            action: UPDATE_FOLDER as "UPDATE_FOLDER",
            payload: {
              id: record.id,
              name: newName,
            },
          };

          dispatch(
            updateFolderAction(
              updateAction,
              listDirectoryKey,
              shouldBehaveOfflineDiskUIIntent(currentDiskId || "")
            )
          );
          // Refresh content to show the update
          await sleep(1000);
          fetchContent({
            targetFolderId: currentFolderId || "",
          });
        } else {
          if (newName.split(".").length === 1) {
            message.error(`Filename must include extension`);
            return;
          }
          // update file action
          const updateAction = {
            action: UPDATE_FILE as "UPDATE_FILE",
            payload: {
              id: record.id,
              name: newName,
            },
          };

          dispatch(
            updateFileAction(
              updateAction,
              listDirectoryKey,
              shouldBehaveOfflineDiskUIIntent(currentDiskId || "")
            )
          );
        }

        message.success(
          `${record.isFolder ? "Folder" : "File"} renamed successfully`
        );
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
      navigate(wrapOrgCode("/drive"));
    }
    setIsStorjModalVisible(false);
  };

  // Unacceptable loading on every drive page view, would rather have first impact be jarry than every subsequent be frustrating slow
  if (
    !shouldBehaveOfflineDiskUIIntent(currentDiskId || "") &&
    listDirectoryResults?.isFirstTime
  ) {
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          height: "80vh",
        }}
      >
        <Spin
          size="large"
          indicator={
            <LoadingOutlined
              style={{
                fontSize: 36,
                color: "#1890ff",
              }}
              spin
            />
          }
        />
        <br />
        <span>Decrypting for first time...</span>
      </div>
    );
  }

  // unauthorized access to folder
  if (currentFolderId && listDirectoryResults && listDirectoryResults.error) {
    return <DirectoryGuard resourceID={currentFolderId} />;
  }

  // unauthorized access to file
  if (currentFileId && !getFileResult) {
    console.log(`currentFileID= ${currentFileId}`, getFileResult);
    return <DirectoryGuard resourceID={currentFileId} />;
  }

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
        {!currentFolderId && !currentFileId && disks.length > 2 ? (
          <div
            style={{
              display: "flex",
              flexDirection: "row",
              justifyContent: "flex-end",
              width: "100%",
            }}
          >
            <Checkbox
              checked={showAncillary}
              onChange={(e) => {
                setShowAncillary(e.target.checked);
              }}
              style={{ color: "rgba(0,0,0,0.3)", fontWeight: "normal" }}
            >
              Show All Disks
            </Checkbox>
          </div>
        ) : (
          <Breadcrumb items={breadcrumbItems} />
        )}
        {currentFolderId && !currentFileId && (
          <div style={{ display: "flex", flexDirection: "row", gap: 8 }}>
            <ActionMenuButton
              isBigButton={false}
              toggleUploadPanel={toggleUploadPanel}
              optimisticListDirectoryKey={listDirectoryKey}
            />

            <Button
              onClick={() => setShareFolderDrawerVisible(true)}
              type="primary"
              disabled={isOfflineDisk}
            >
              Share
            </Button>
          </div>
        )}
      </div>

      <div
        style={{
          display: "flex",
          flexGrow: 1,
          overflowY: screenType.isMobile ? "scroll" : "visible",
        }}
      >
        <div style={{ flexGrow: 1, padding: 16, width: "100%" }}>
          {currentFolderId && !currentFileId ? (
            <div
              className="invisible-scrollbar"
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: 16,
                overflowX: "scroll",
              }}
            >
              {
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
              }

              <div
                style={{ display: "flex", gap: "20px", alignItems: "center" }}
              >
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
          ) : !currentFileId && !currentFolderId ? null : (
            <Button
              onClick={handleBack}
              size="small"
              type="link"
              icon={<ArrowLeftOutlined />}
              style={{
                padding: 0,
                color: "inherit",
                textDecoration: "none",
                margin: "0px 8px 0px 24px",
              }}
            >
              Back
            </Button>
          )}
          {is404NotFound ? (
            <div style={{ background: "rgba(0,0,0,0.02)" }}>
              <Result
                icon={<FileUnknownOutlined />}
                title="404 Not Found"
                subTitle="The file you are looking for does not exist or has been deleted."
                extra={[
                  <div key="home">
                    <Link to={wrapOrgCode("/drive")}>
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
              <FilePage file={singleFile} />
            </div>
          ) : isTrashBin && tableRows.length === 0 ? (
            <Result
              icon={<DeleteOutlined style={{ fontSize: 64 }} />}
              title="Trash is Empty"
              subTitle="There are no items in your trash bin at the moment."
              extra={
                <Link to={wrapOrgCode("/drive")}>
                  <Button type="primary">Return to Drive</Button>
                </Link>
              }
              style={{ marginTop: "10vh" }}
            />
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

      {currentFolderId && (
        <DirectorySharingDrawer
          open={shareFolderDrawerVisible}
          onClose={() => setShareFolderDrawerVisible(false)}
          resourceID={currentFolderId as DirectoryResourceID}
          resourceName={"Placeholder Title"}
        />
      )}
    </div>
  );
};

export default DriveUI;

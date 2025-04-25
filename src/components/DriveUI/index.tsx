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
  Popover,
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
  CopyOutlined,
  DownloadOutlined,
  ScissorOutlined,
  SyncOutlined,
  CloudOutlined,
  SearchOutlined,
  AppstoreOutlined,
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

export const LOCAL_STORAGE_ROW_GRID_VIEW = "LOCAL_STORAGE_ROW_GRID_VIEW";

import FilePage from "../FilePage";
import { isMobile } from "react-device-detect";
import {
  getFileType,
  pastLastCheckedCacheLimit,
  sleep,
} from "../../api/helpers";
import { freeTrialStorjCreds } from "../../api/storj";
import mixpanel from "mixpanel-browser";
import {
  DirectoryPermissionType,
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
  fetchRecentDirectoryBumps,
  bumpRecentDirectory,
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
import MoveDirectorySelector from "../MoveDirectorySelection";

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
  isRecentShortcut?: boolean;
  permission_previews: DirectoryPermissionType[];
  key: string;
  thumbnail?: string;
}

interface DriveUIProps {
  toggleUploadPanel: (bool: boolean) => void; // Callback to toggle UploadPanel visibility
}

enum DiskUIDefaultAction {
  shared = "shared",
  trash = "trash",
  directory = "directory",
}

const DriveUI: React.FC<DriveUIProps> = ({ toggleUploadPanel }) => {
  const { "*": encodedPath } = useParams<{ "*": string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const screenType = useScreenType();
  const dispatch = useDispatch();
  const isTrashBin = location.search.includes("isTrashBin=1");
  const params = new URLSearchParams(location.search);
  const default_disk_action = params.get(
    "default_disk_action"
  ) as DiskUIDefaultAction;
  const { currentOrg, wrapOrgCode, currentProfile } = useIdentitySystem();
  const [refreshToken, setRefreshToken] = useState("");
  const [showAncillary, setShowAncillary] = useState(false);
  const [selectedRowKeys, setSelectedRowKeys] = useState<(FileID | FolderID)[]>(
    []
  );
  const [modalMoveCopyOperation, setModalMoveCopyOperation] = useState<
    "move" | "copy" | null
  >(null);
  const [viewRowTile, setViewRowTile] = useState<"row" | "grid">("grid");

  const [searchString, setSearchString] = useState("");

  const [listDirectoryKey, setListDirectoryKey] = useState("");

  const { disks, defaultDisk } = useSelector((state: ReduxAppState) => ({
    defaultDisk: state.disks.defaultDisk,
    disks: state.disks.disks,
  }));
  const listDirectoryResults = useSelector(
    (state: ReduxAppState) => state.directory.listingDataMap[listDirectoryKey]
  );

  const [isSharedWithMePage, setIsSharedWithMePage] = useState(false);
  const [isDiskRootPage, setIsDiskRootPage] = useState(false);
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
  const [isMoveDirectoryModalVisible, setIsMoveDirectoryModalVisible] =
    useState(false);
  const [singleFile, setSingleFile] = useState<FileFEO | null>(null);
  const [is404NotFound, setIs404NotFound] = useState(false);
  const [apiNotifs, contextHolder] = notification.useNotification();

  useEffect(() => {
    const rowGrid = localStorage.getItem(LOCAL_STORAGE_ROW_GRID_VIEW);
    if (rowGrid) {
      setViewRowTile(rowGrid === "grid" ? "grid" : "row");
    }
  }, []);

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

  function extractDiskInfo() {
    const url = window.location.href;
    // Split the URL into parts
    const parts = new URL(url).pathname.split("/");

    // Find the index of 'drive' in the path
    const driveIndex = parts.indexOf("drive");

    // If 'drive' is found and there are enough parts after it
    if (driveIndex !== -1 && parts.length > driveIndex + 2) {
      const diskTypeEnum = parts[driveIndex + 1];
      const diskID = parts[driveIndex + 2];

      return {
        diskTypeEnum,
        diskID,
      };
    }

    // Return null or throw an error if the URL doesn't match the expected format
    return {
      diskTypeEnum: "",
      diskID: "",
    };
  }
  const { diskTypeEnum: extractedDiskTypeEnum, diskID: extractedDiskID } =
    extractDiskInfo();

  useEffect(() => {
    if (listDirectoryResults) {
      const { folders, files, breadcrumbs } = listDirectoryResults;
      setContent({ folders, files });
      if (
        currentProfile &&
        currentOrg &&
        breadcrumbs &&
        breadcrumbs.length > 0 &&
        extractedDiskTypeEnum &&
        extractedDiskID
      ) {
        const title = breadcrumbs.at(-1)?.resource_name || "";
        const resource_id = (breadcrumbs.at(-1)?.resource_id ||
          "") as DirectoryResourceID;
        const last_opened = Date.now();
        // write description as breadcrumb names joined by "/" and omit last breadcrumb, also restrict to 50 chars with prefix `...` (cut off start not end)
        const pathDescription = breadcrumbs
          .slice(0, -1)
          .map((b) => b.resource_name)
          .join("/");

        const truncatedPathDescription =
          pathDescription.length > 50
            ? `...${pathDescription.slice(-47)}`
            : pathDescription;

        const description = `${truncatedPathDescription}`;
        const href = `${window.location.origin}${wrapOrgCode(`/drive/${extractedDiskTypeEnum}/${extractedDiskID}/${resource_id}${resource_id.startsWith("FolderID_") ? "/" : ""}`)}`;
        bumpRecentDirectory(
          {
            id: resource_id,
            title,
            disk_id: extractedDiskID,
            disk_type: extractedDiskTypeEnum as DiskTypeEnum,
            resource_id,
            href,
            last_opened,
            description,
          },
          currentProfile.userID || "",
          currentOrg.driveID || ""
        );
      }
      setIs404NotFound(false);
    }
  }, [
    listDirectoryResults,
    extractedDiskTypeEnum,
    extractedDiskID,
    currentProfile,
    currentOrg,
    window.location.origin,
  ]);

  useEffect(() => {
    if (getFileResult) {
      if (
        currentProfile &&
        currentOrg &&
        getFileResult.breadcrumbs &&
        getFileResult.breadcrumbs.length > 0 &&
        extractedDiskTypeEnum &&
        extractedDiskID
      ) {
        const title = getFileResult.breadcrumbs.at(-1)?.resource_name || "";
        const resource_id = (getFileResult.breadcrumbs.at(-1)?.resource_id ||
          "") as DirectoryResourceID;
        const last_opened = Date.now();
        // write description as breadcrumb names joined by "/" and omit last breadcrumb, also restrict to 50 chars with prefix `...` (cut off start not end)
        const pathDescription = getFileResult.breadcrumbs
          .slice(0, -1)
          .map((b) => b.resource_name)
          .join("/");

        const truncatedPathDescription =
          pathDescription.length > 50
            ? `...${pathDescription.slice(-47)}`
            : pathDescription;

        const description = ` ${truncatedPathDescription}`;
        const href = `${window.location.origin}${wrapOrgCode(`/drive/${extractedDiskTypeEnum}/${extractedDiskID}/${resource_id}${resource_id.startsWith("FolderID_") ? "/" : ""}`)}`;
        bumpRecentDirectory(
          {
            id: resource_id,
            title,
            disk_id: extractedDiskID,
            disk_type: extractedDiskTypeEnum as DiskTypeEnum,
            resource_id,
            href,
            last_opened,
            description,
          },
          currentProfile.userID || "",
          currentOrg.driveID || ""
        );
      }
      setIs404NotFound(false);
    }
  }, [
    getFileResult,
    extractedDiskTypeEnum,
    extractedDiskID,
    currentProfile,
    currentOrg,
    window.location.origin,
  ]);

  useEffect(() => {
    if (currentFileId && !getFileResult) {
      setIs404NotFound(true);

      setSingleFile(null);
    } else if (currentFileId && getFileResult) {
      setIs404NotFound(false);

      setSingleFile(getFileResult);
    }
  }, [getFileResult, currentFileId]);

  // Main Drive Trigger
  useEffect(() => {
    // const path = encodedPath ? decodeURIComponent(encodedPath) : "";
    const pathParts = location.pathname.split("/").filter(Boolean);

    if (pathParts.length < 3) {
      return;
    }

    if (pathParts[2] === "recent") {
      setListDirectoryKey("");
      setCurrentFolderId(null);
      setCurrentFileId(null);
      setIs404NotFound(false);
      setSingleFile(null);
    } else if (
      (pathParts[2] === "drive" ||
        pathParts[2] === "drive-shared" ||
        pathParts[2] === "drive-trash") &&
      pathParts.length === 3
    ) {
      setListDirectoryKey("");
      setCurrentFolderId(null);
      setCurrentFileId(null);
      setIs404NotFound(false);
      fetchContent({});
      setSingleFile(null);
      return;
    }

    const diskType = pathParts[3];
    const diskID = pathParts[4];
    const folderFileID = pathParts[5];

    setCurrentDiskId(diskID);

    console.log(`diskID`, diskID);
    console.log(`folderFileID`, folderFileID);

    if (pathParts[2] === "recent") {
      fetchRecentsGlobal();
    } else if (folderFileID === defaultTempCloudSharingRootFolderID) {
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
      let folderId = folderFileID;
      setCurrentFolderId(folderId);
      setCurrentFileId(null);
      setSingleFile(null);

      fetchContent({
        targetFolderId: folderId,
      });
    } else if (folderFileID.startsWith("FileID_")) {
      let fileId = folderFileID;
      setCurrentFolderId(null);
      // Only set currentFileId if it's different
      if (fileId !== currentFileId) {
        setCurrentFileId(fileId);
        fetchFileById(fileId, diskID);
      }
    } else if (folderFileID === "shared-with-me") {
      setCurrentFolderId(null);
      setCurrentFileId(null);
      setSingleFile(null);
      fetchContent({
        sharedWithMe: true,
      });
    } else {
      console.log(`we nowhere known`);
    }

    // if (currentDisk.disk_type?.includes("Web3Storj") && !areStorjSettingsSet()) {
    //   setIsStorjModalVisible(true);
    // }
  }, [location, showAncillary, refreshToken]);

  const fetchRecentsGlobal = async () => {
    if (!currentOrg || !currentProfile) return;
    if (!currentOrg.endpoint) {
      fetchContent({});
      return;
    }
    const { items: recents } = await fetchRecentDirectoryBumps(
      {
        start_ms: 0,
        end_ms: Date.now(),
        limit: 100,
      },
      currentProfile.userID,
      currentOrg.driveID
    );
    if (recents.length === 0) {
      fetchContent({});
      return;
    }
    setContent({
      folders: recents.map((recent) => {
        const timeAgo = dayjs().to(dayjs(recent.last_opened), true);
        return {
          id: recent.resource_id as FolderID,
          name: `${recent.title}${recent.resource_id.startsWith("FolderID_") ? " /" : ""}`,
          parent_folder_uuid: "",
          subfolder_uuids: [],
          file_uuids: [],
          full_directory_path: `${recent.disk_type}::/` as DriveFullFilePath,
          labels: [],
          created_by: "Owner" as UserID,
          created_at: Date.now(),
          last_updated_date_ms: recent.last_opened || 0,
          last_updated_by: "Owner" as UserID,
          disk_id: recent.disk_id,
          disk_type: recent.disk_type,
          deleted: false,
          expires_at: -1,
          drive_id: currentOrg?.driveID || "",
          has_sovereign_permissions: false,
          clipped_directory_path:
            `${recent.disk_type}::/` as DriveClippedFilePath,
          permission_previews: [],
          public_note: `Opened ${timeAgo} ago • ${recent.description}`,
          breadcrumbs: [],
          isRecentShortcut: true,
        };
      }),
      files: [],
    });
  };

  const fetchFileById = (fileId: FileID, diskID: DiskID) => {
    if (!diskID) return;
    try {
      // Create the get file action
      const getAction = {
        action: GET_FILE as "GET_FILE",
        payload: {
          id: fileId,
        },
      };

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

  // Fetch content based on folder ID
  const fetchContent = useCallback(
    async ({
      targetFolderId,
      targetFileId,
      sharedWithMe,
    }: {
      targetFolderId?: FolderID;
      targetFileId?: FileID;
      sharedWithMe?: boolean;
    }) => {
      if (!targetFolderId && !targetFileId && !sharedWithMe) {
        // Root level showing disks from Redux

        setContent({
          folders: disks.map((disk) => {
            let name = disk.name;
            let id = disk.root_folder as FolderID;

            if (default_disk_action === DiskUIDefaultAction.shared) {
              name = `${name}`;
              id = `shared-with-me` as FolderID;
            } else if (default_disk_action === DiskUIDefaultAction.trash) {
              name = `${name}`;
              id = disk.trash_folder as FolderID;
            }
            return {
              id: id as FolderID,
              name: name,
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
              public_note: disk.public_note,
              isAncillary:
                disks.length > 3
                  ? disk.id === defaultBrowserCacheDiskID ||
                    disk.id === defaultTempCloudSharingDiskID ||
                    disk.disk_type === DiskTypeEnum.IcpCanister
                  : disks.length === 3
                    ? disk.id === defaultBrowserCacheDiskID ||
                      disk.disk_type === DiskTypeEnum.IcpCanister
                    : false,
              breadcrumbs: [],
            };
          }),
          files: [],
        });
        setSelectedRowKeys([]);
        setIsDiskRootPage(true);
        setIsSharedWithMePage(false);
        return;
      }

      // We're inside a folder, so we need to fetch its contents
      if (targetFolderId) {
        const listParams: IRequestListDirectory = {
          folder_id: targetFolderId,
          page_size: 100,
          direction: SortDirection.ASC,
        };
        const _listDirectoryKey = generateListDirectoryKey(listParams);
        setListDirectoryKey(_listDirectoryKey);

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
        setIsDiskRootPage(false);
        setIsSharedWithMePage(false);

        // Redux will update filesFromRedux and foldersFromRedux, which we handle in a useEffect
        return;
      }
      if (targetFileId) {
        // Fetch the file
        fetchFileById(targetFileId, currentDiskId || "");
        setIsDiskRootPage(false);
        setIsSharedWithMePage(false);
      }
      if (sharedWithMe && currentDiskId) {
        setContent({
          folders: [],
          files: [],
        });
        setIsSharedWithMePage(true);
        setIsDiskRootPage(false);
        const listParams: IRequestListDirectory = {
          disk_id: currentDiskId,
          page_size: 100,
          direction: SortDirection.ASC,
        };
        const _listDirectoryKey = generateListDirectoryKey(listParams);
        setListDirectoryKey(_listDirectoryKey);

        dispatch(
          listDirectoryAction(
            listParams,
            currentDiskId
              ? shouldBehaveOfflineDiskUIIntent(currentDiskId)
              : false
          )
        );
      }
    },
    [currentFolderId, disks, currentOrg, currentDiskId, default_disk_action]
  );

  const handleBack = () => {
    // Generate breadcrumb items to find the parent folder
    const breadcrumbItems = generateBreadcrumbItems();
    setSelectedRowKeys([]);
    // If we have at least 2 breadcrumb items (Drive + at least one folder)
    if (breadcrumbItems.length >= 2) {
      // Get the second-to-last breadcrumb item (parent folder)
      const parentBreadcrumb = breadcrumbItems[breadcrumbItems.length - 2];

      // Extract the Link component's to prop to get the navigation path
      const parentLink = parentBreadcrumb.title.props.to;

      // Navigate to the parent folder path
      navigate(parentLink);
    } else {
      // If we don't have enough breadcrumbs, navigate to drive root
      navigate(wrapOrgCode("/drive"));
    }
  };

  const appendRefreshParam = () => {
    const params = new URLSearchParams(location.search);
    const refreshToken = uuidv4();
    params.set("refresh", refreshToken);
    setRefreshToken(refreshToken);
    navigate(`${location.pathname}?${params.toString()}`);
  };

  const handleFileFolderClick = (item: DriveItemRow) => {
    if (item.isDisabled) return;
    setSelectedRowKeys([]);
    if (item.isFolder) {
      navigate(
        wrapOrgCode(
          `/drive/${item.diskType}/${item.diskID}/${item.id}/${default_disk_action === DiskUIDefaultAction.trash ? "?isTrashBin=1" : ""}`
        )
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
        width: "60%",
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
                    setSearchString("");
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
                    (record as any).isRecentShortcut ? (
                      <ClockCircleOutlined />
                    ) : record.isFolder ? (
                      <FolderOpenOutlined />
                    ) : (
                      renderIconForFile(record.title)
                    )
                  }
                  suffix={
                    <CheckOutlined
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRenameSubmit(record);
                      }}
                    />
                  }
                />
              ) : (
                <>
                  {(record as any).isRecentShortcut ? (
                    <ClockCircleOutlined />
                  ) : (record as any).hasDiskTrash ? (
                    <CloudOutlined />
                  ) : record.isFolder ? (
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
              <span
                style={{ color: "gray", cursor: "not-allowed", width: "100%" }}
              >
                Expired
              </span>
            );
          } else {
            return (
              <span
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
                style={{ color: "gray", width: "100%" }}
              >
                {record.hasDiskTrash || (record as any).isRecentShortcut
                  ? (record as any).public_note
                  : record.expires_at === -1
                    ? `Active`
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
    [renamingItems, listDirectoryKey, default_disk_action]
  );

  const getRowMenuItems = (record: DriveItemRow): MenuProps["items"] => {
    const menuItems =
      isDiskRootPage || record.hasDiskTrash
        ? []
        : [
            {
              key: "rename",
              label: "Rename",
              onClick: () => {
                setRenamingItems((prev) => ({
                  ...prev,
                  [record.id]: record.title,
                }));
              },
            },
            {
              key: "move",
              label: "Move",
              onClick: () => {
                setIsMoveDirectoryModalVisible(true);
                setSelectedRowKeys([record.id]);
                setModalMoveCopyOperation("move");
              },
              disabled: !record.permission_previews?.includes(
                DirectoryPermissionType.EDIT
              ),
            },
            {
              key: "copy",
              label: "Copy",
              onClick: () => {
                setIsMoveDirectoryModalVisible(true);
                setSelectedRowKeys([record.id]);
                setModalMoveCopyOperation("copy");
              },
              disabled: !record.permission_previews?.includes(
                DirectoryPermissionType.EDIT
              ),
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
      menuItems.push({
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
      menuItems.push({
        key: "shared-with-me",
        label: "Shared With Me",
        onClick: () => {
          navigate(
            wrapOrgCode(
              `/drive/${record.diskType}/${record.diskID}/shared-with-me`
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
    if ((record as any).isRecentShortcut) {
      return [];
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

  const itemsRowGrid: MenuProps["items"] = [
    {
      label: "Row View",
      key: "row-view",
      onClick: () => {
        setViewRowTile("row");
        localStorage.setItem(LOCAL_STORAGE_ROW_GRID_VIEW, "row");
      },
    },
    {
      label: "Grid View",
      key: "grid-view",
      onClick: () => {
        setViewRowTile("grid");
        localStorage.setItem(LOCAL_STORAGE_ROW_GRID_VIEW, "grid");
      },
    },
  ];

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
    // message.info(`Click on item ${key}`);
  };

  // Generate breadcrumb items
  const generateBreadcrumbItems = () => {
    const items = [{ title: <Link to={wrapOrgCode("/drive")}>Drive</Link> }];

    // For files, use only the file's breadcrumbs
    if (currentFileId && getFileResult) {
      getFileResult.breadcrumbs?.forEach((b) => {
        items.push({
          title: (
            <Link
              to={wrapOrgCode(
                `/drive/${getFileResult.disk_type}/${getFileResult.disk_id}/${b.resource_id}/`
              )}
            >
              {b.resource_name}
            </Link>
          ),
        });
      });
      return items; // Return early to avoid using listDirectoryResults breadcrumbs
    }

    // For folders, use only the directory listing breadcrumbs
    if (listDirectoryResults) {
      listDirectoryResults.breadcrumbs?.forEach((b) => {
        items.push({
          title: (
            <Link
              to={wrapOrgCode(
                `/drive/${currentDisk?.disk_type}/${currentDisk?.id}/${b.resource_id}/`
              )}
            >
              {b.resource_name}
            </Link>
          ),
        });
      });
    }

    return items;
  };

  const breadcrumbItems = generateBreadcrumbItems();

  const tableRows: DriveItemRow[] = useMemo(() => {
    const rows = [
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
          permission_previews: f.permission_previews,
          public_note: (f as any).public_note,
          isRecentShortcut: (f as any).isRecentShortcut,
          key: `${f.id}-${f.disk_id}`,
          thumbnail: "",
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
        permission_previews: f.permission_previews,
        key: `${f.id}-${f.disk_id}`,
        thumbnail:
          getFileType(f.name) === "image" || getFileType(f.name) === "video"
            ? f.raw_url
            : "",
      })),
    ];
    const filteredRows = rows.filter((row) => {
      return (
        row.title.toLowerCase().includes(searchString.toLowerCase()) ||
        row.id.toLowerCase().includes(searchString.toLowerCase())
      );
    });
    return filteredRows;
  }, [content, currentFolderId, disks, searchString]);

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

  // unauthorized access to folder
  if (currentFolderId && listDirectoryResults && listDirectoryResults.error) {
    return (
      <DirectoryGuard
        resourceID={"currentFolderId"}
        loading={listDirectoryResults.isLoading}
        fetchResource={() => appendRefreshParam()}
      />
    );
  }

  // unauthorized access to file
  if (currentFileId && !getFileResult) {
    return (
      <DirectoryGuard
        resourceID={currentFileId}
        loading={(getFileResult as any)?.isLoading}
        fetchResource={() => {
          if (!currentFileId || !currentDiskId) return;
          fetchFileById(currentFileId, currentDiskId);
        }}
      />
    );
  }

  const manageMenuItems = [
    {
      key: "move",
      icon: <ScissorOutlined />,
      label: "Move",
      onClick: () => {
        setIsMoveDirectoryModalVisible(true);
        setModalMoveCopyOperation("move");
      },
    },
    {
      key: "copy",
      icon: <CopyOutlined />,
      label: "Copy",
      onClick: () => {
        setIsMoveDirectoryModalVisible(true);
        setModalMoveCopyOperation("copy");
      },
    },
    {
      key: "delete",
      icon: <DeleteOutlined />,
      label: "Delete",
      disabled: true,
    },
    {
      key: "download",
      icon: <DownloadOutlined />,
      label: "Download",
      disabled: true,
    },
  ];

  const renderViewTitle = () => {
    if (
      is404NotFound ||
      singleFile ||
      (isTrashBin && tableRows.length === 0) ||
      (isSharedWithMePage && tableRows.length === 0)
    ) {
      return null; // Don't show title for error states or empty states that already have messages
    }

    if (default_disk_action === "trash") {
      return (
        <div style={{ position: "relative", padding: "36px 0px 0px 36px" }}>
          <h2 style={{ margin: 0, fontSize: 24, fontWeight: 500 }}>
            Trashbins
          </h2>
          <p style={{ margin: 0, color: "rgba(0,0,0,0.45)", marginTop: 8 }}>
            Files and folders that have been deleted
          </p>
        </div>
      );
    }

    if (default_disk_action === "shared") {
      return (
        <div style={{ position: "relative", padding: "36px 0px 0px 36px" }}>
          <h2 style={{ margin: 0, fontSize: 24, fontWeight: 500 }}>
            Shared with Me
          </h2>
          <p style={{ margin: 0, color: "rgba(0,0,0,0.45)", marginTop: 8 }}>
            Files and folders that others have shared with you
          </p>
        </div>
      );
    }

    if (location.pathname.includes("/recent")) {
      return (
        <div style={{ position: "relative", padding: "36px 0px 0px 36px" }}>
          <h2 style={{ margin: 0, fontSize: 24, fontWeight: 500 }}>Recents</h2>
          <p style={{ margin: 0, color: "rgba(0,0,0,0.45)", marginTop: 8 }}>
            Files and folders you've accessed recently
          </p>
        </div>
      );
    }

    return null;
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
      {renderViewTitle()}
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
        {isDiskRootPage && disks.length > 2 ? (
          <div
            style={{
              display: "flex",
              flexDirection: "row",
              justifyContent: "flex-end",
              width: "100%",
            }}
          >
            {!location.pathname.includes("/recent") && (
              <Checkbox
                checked={showAncillary}
                onChange={(e) => {
                  setShowAncillary(e.target.checked);
                }}
                style={{ color: "rgba(0,0,0,0.3)", fontWeight: "normal" }}
              >
                Show All Disks
              </Checkbox>
            )}
          </div>
        ) : default_disk_action === "trash" ||
          default_disk_action === "shared" ||
          window.location.pathname.includes("/recent") ? null : (
          <Breadcrumb items={breadcrumbItems} />
        )}
        {selectedRowKeys.length > 0 ? (
          <Dropdown
            menu={{ items: manageMenuItems }}
            disabled={selectedRowKeys.length === 0}
          >
            <Button>
              Bulk Manage{" "}
              {selectedRowKeys.length > 0 ? `(${selectedRowKeys.length})` : ""}
              <DownOutlined />
            </Button>
          </Dropdown>
        ) : currentFolderId && !currentFileId ? (
          <div style={{ display: "flex", flexDirection: "row", gap: 8 }}>
            <ActionMenuButton
              isBigButton={false}
              toggleUploadPanel={toggleUploadPanel}
              optimisticListDirectoryKey={listDirectoryKey}
              disabled={
                listDirectoryResults?.isFirstTime ||
                !listDirectoryResults?.permission_previews.includes(
                  DirectoryPermissionType.UPLOAD
                )
              }
            />

            <Button
              onClick={() => setShareFolderDrawerVisible(true)}
              type="primary"
              disabled={isOfflineDisk || listDirectoryResults?.isFirstTime}
            >
              Share
            </Button>
          </div>
        ) : null}
      </div>

      <div
        style={{
          display: "flex",
          flexGrow: 1,
          overflowY: screenType.isMobile ? "scroll" : "visible",
        }}
      >
        <div style={{ flexGrow: 1, padding: 16, width: "100%" }}>
          {!isDiskRootPage && !currentFileId ? (
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
                type="link"
                icon={<ArrowLeftOutlined onClick={handleBack} />}
                style={{
                  padding: 0,
                  color: "inherit",
                  textDecoration: "none",
                  margin: "0px 8px 0px 0px",
                }}
              >
                <span onClick={handleBack}>Back </span>{" "}
                {listDirectoryResults && listDirectoryResults.isLoading ? (
                  <span>
                    <LoadingOutlined />
                    <i style={{ marginLeft: 8, color: "rgba(0,0,0,0.2)" }}>
                      Syncing
                    </i>
                  </span>
                ) : (
                  <SyncOutlined
                    onClick={() => {
                      message.info("Refetching directory...");
                      appendRefreshParam();
                    }}
                    style={{ color: "rgba(0,0,0,0.2)" }}
                  />
                )}
              </Button>

              <div
                style={{ display: "flex", gap: "20px", alignItems: "center" }}
              >
                <Dropdown menu={{ items: itemsRowGrid, onClick }}>
                  <a
                    onClick={(e) => e.preventDefault()}
                    style={{ color: "rgba(0,0,0,0.4)" }}
                  >
                    <Space>
                      {viewRowTile === "row" ? (
                        <BarsOutlined />
                      ) : (
                        <AppstoreOutlined />
                      )}
                      {viewRowTile === "row" ? "Row View" : "Grid View"}
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
              </div>
            </div>
          ) : !currentFileId && !currentFolderId ? null : (
            <Button
              size="small"
              type="link"
              icon={<ArrowLeftOutlined onClick={handleBack} />}
              style={{
                padding: 0,
                color: "inherit",
                textDecoration: "none",
                margin: "0px 8px 0px 24px",
              }}
            >
              <span onClick={handleBack}>Back </span>{" "}
              {getFileResult && (getFileResult as any).isLoading ? (
                <span>
                  <LoadingOutlined />
                  <i style={{ marginLeft: 8, color: "rgba(0,0,0,0.2)" }}>
                    Syncing
                  </i>
                </span>
              ) : (
                <SyncOutlined
                  onClick={() => {
                    message.info("Refetching file...");
                    if (currentFileId && currentDiskId) {
                      fetchFileById(currentFileId, currentDiskId);
                    }
                  }}
                  style={{ color: "rgba(0,0,0,0.2)" }}
                />
              )}
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
          ) : isSharedWithMePage && tableRows.length === 0 ? (
            <Result
              icon={<FolderOpenOutlined />}
              title="Nothing Shared Yet"
              subTitle="When the organization shares files with you, they can be found as shortcuts here"
              extra={
                <Link to={wrapOrgCode("/drive")}>
                  <Button type="primary">Back to Drive</Button>
                </Link>
              }
              style={{ marginTop: "10vh" }}
            />
          ) : !shouldBehaveOfflineDiskUIIntent(currentDiskId || "") &&
            listDirectoryResults?.isFirstTime ? (
            <Result
              icon={<LoadingOutlined />}
              title="Decrypting for first time..."
              subTitle="This may take a few seconds, but will be fast after that"
              style={{ marginTop: screenType.isMobile ? "10vh" : "20vh" }}
            />
          ) : (
            <UploadDropZone toggleUploadPanel={toggleUploadPanel}>
              {content.folders.length === 0 && content.files.length === 0 ? (
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
                        optimisticListDirectoryKey={listDirectoryKey}
                        disabled={
                          listDirectoryResults?.isFirstTime ||
                          !listDirectoryResults?.permission_previews.includes(
                            DirectoryPermissionType.UPLOAD
                          )
                        }
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
                <div>
                  <Input
                    placeholder="Filter Results"
                    value={searchString}
                    onChange={(e) => setSearchString(e.target.value)}
                    prefix={<SearchOutlined />}
                    style={{
                      marginBottom: 8,
                      border: "0px solid white",
                      backgroundColor: "rgba(0,0,0,0.01)",
                    }}
                  />
                  {viewRowTile === "row" ? (
                    <Table
                      {...(!isDiskRootPage && {
                        rowSelection: {
                          type: "checkbox",
                          selectedRowKeys,
                          onChange: (newSelectedRowKeys: React.Key[]) => {
                            setSelectedRowKeys(
                              newSelectedRowKeys as (FileID | FolderID)[]
                            );
                          },
                          columnWidth: 50,
                        },
                      })}
                      columns={columns}
                      dataSource={tableRows}
                      rowKey="key"
                      locale={{ emptyText: "No Matching Results" }}
                      pagination={false}
                      scroll={{ y: "calc(80vh - 150px)", x: "scroll" }}
                      sticky={true}
                      style={{ width: "100%" }}
                    />
                  ) : (
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns:
                          "repeat(auto-fill, minmax(180px, 1fr))",
                        gap: "24px",
                        padding: "16px",
                        width: "100%",
                        overflowY: "auto",
                        maxHeight: "calc(80vh - 150px)",
                      }}
                    >
                      {tableRows.map((item) => (
                        <div
                          key={item.key}
                          onClick={() => {
                            if (item.isDisabled) {
                              return;
                            } else {
                              if (isTrashBin) {
                                message.error(
                                  "You cannot access files in the Trash. Restore it first."
                                );
                              } else {
                                handleFileFolderClick(item);
                                setSearchString("");
                              }
                            }
                          }}
                          style={{
                            cursor: item.isDisabled ? "not-allowed" : "pointer",
                            opacity: item.isDisabled ? 0.5 : 1,
                            display: "flex",
                            flexDirection: "column",
                            justifyContent: "flex-start",
                            position: "relative",
                          }}
                        >
                          {/* Checkbox selection */}
                          {!isDiskRootPage && (
                            <div
                              style={{
                                position: "absolute",
                                top: "-4px",
                                left: "-4px",
                                zIndex: 2,
                                padding: "8px",
                              }}
                            >
                              <Checkbox
                                checked={selectedRowKeys.includes(item.id)}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  const newSelectedKeys =
                                    selectedRowKeys.includes(item.id)
                                      ? selectedRowKeys.filter(
                                          (key) => key !== item.id
                                        )
                                      : [...selectedRowKeys, item.id];
                                  setSelectedRowKeys(newSelectedKeys);
                                }}
                              />
                            </div>
                          )}

                          {/* Square tile with icon */}
                          <div
                            style={{
                              width: "100%",
                              paddingBottom: "100%" /* Makes it square */,
                              background: "#f5f5f5",
                              borderRadius: "8px",
                              border: "1px solid #f0f0f0",
                              position: "relative",
                            }}
                          >
                            {/* Icon based on item type */}
                            {item.thumbnail ? (
                              getFileType(item.title) === "video" ? (
                                <div
                                  style={{
                                    position: "absolute",
                                    top: "0",
                                    left: "0",
                                    width: "100%",
                                    height: "100%",
                                  }}
                                >
                                  <video
                                    src={item.thumbnail}
                                    preload="metadata"
                                    style={{
                                      position: "absolute",
                                      top: "0",
                                      left: "0",
                                      width: "100%",
                                      height: "100%",
                                      objectFit: "cover",
                                    }}
                                  />
                                  {/* Play button overlay */}
                                  <div
                                    style={{
                                      position: "absolute",
                                      inset: "0",
                                      display: "flex",
                                      alignItems: "center",
                                      justifyContent: "center",
                                      backgroundColor: "rgba(0,0,0,0.3)",
                                    }}
                                  >
                                    <div
                                      style={{
                                        width: "48px",
                                        height: "48px",
                                        borderRadius: "50%",
                                        background: "rgba(255,255,255,0.8)",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                      }}
                                    >
                                      <VideoCameraOutlined
                                        style={{
                                          fontSize: "20px",
                                          color: "#1890ff",
                                        }}
                                      />
                                    </div>
                                  </div>
                                </div>
                              ) : (
                                <img
                                  src={item.thumbnail}
                                  alt={item.title}
                                  style={{
                                    position: "absolute",
                                    top: "0",
                                    left: "0",
                                    width: "100%",
                                    height: "100%",
                                    objectFit: "cover",
                                  }}
                                />
                              )
                            ) : (
                              <div
                                style={{
                                  position: "absolute",
                                  top: "50%",
                                  left: "50%",
                                  transform: "translate(-50%, -50%)",
                                  fontSize: "48px",
                                  color: "#1890ff",
                                }}
                              >
                                {(item as any).isRecentShortcut ? (
                                  <ClockCircleOutlined />
                                ) : (item as any).hasDiskTrash ? (
                                  <CloudOutlined />
                                ) : item.isFolder ? (
                                  <FolderFilled />
                                ) : (
                                  renderIconForFile(item.title)
                                )}
                              </div>
                            )}

                            {/* Actions menu (three dots) */}
                            <div
                              style={{
                                position: "absolute",
                                top: "0",
                                right: "0",
                                padding: "8px",
                              }}
                            >
                              <Dropdown
                                menu={{
                                  items: getRowMenuItems(item),
                                  onClick: (e) => {
                                    e.domEvent.stopPropagation();
                                  },
                                }}
                                trigger={["click"]}
                              >
                                <Button
                                  type="text"
                                  icon={<MoreOutlined />}
                                  size="small"
                                  onClick={(e) => e.stopPropagation()}
                                  style={{ background: "transparent" }}
                                />
                              </Dropdown>
                            </div>
                          </div>

                          {/* Title at bottom */}
                          <Popover content={item.title}>
                            <div
                              style={{
                                marginTop: "8px",
                                width: "100%",
                                textAlign: "center",
                                whiteSpace: "nowrap",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                fontSize: "14px",
                                color: "#000",
                              }}
                            >
                              {item.title}
                            </div>
                          </Popover>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </UploadDropZone>
          )}
        </div>
      </div>

      {currentDisk && isMoveDirectoryModalVisible && (
        <MoveDirectorySelector
          visible={isMoveDirectoryModalVisible}
          setVisible={setIsMoveDirectoryModalVisible}
          initialFolderID={(currentFolderId as FolderID) || undefined}
          disk={currentDisk}
          onFinish={() => {
            setSelectedRowKeys([]);
            appendRefreshParam();
          }}
          onCancel={() => setIsMoveDirectoryModalVisible(false)}
          mode={modalMoveCopyOperation || "copy"}
          resource_ids={selectedRowKeys}
        />
      )}

      {currentFolderId && (
        <DirectorySharingDrawer
          open={shareFolderDrawerVisible}
          onClose={() => setShareFolderDrawerVisible(false)}
          resourceID={currentFolderId as DirectoryResourceID}
          resourceName={"Folder"}
          breadcrumbs={listDirectoryResults?.breadcrumbs || []}
          currentUserPermissions={
            listDirectoryResults?.permission_previews || []
          }
        />
      )}
    </div>
  );
};

export default DriveUI;

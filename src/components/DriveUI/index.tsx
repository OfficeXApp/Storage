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

// Mock data generator for folders and files
const mockFetchFilesAtFolderID = (
  folderID: FolderID,
  limit: number,
  offset: number
) => {
  // Generate a consistent set of mock files and folders based on the folderID
  // This ensures the same content is returned when visiting the same folder
  const folderIdNumber = parseInt(folderID.replace("FolderID_", "")) || 0;

  // Create mock folders
  const mockFolders: FolderRecord[] = Array.from({ length: 3 }, (_, i) => ({
    id: `FolderID_${folderIdNumber}${i + 1}` as FolderID,
    name: `Folder ${i + 1} in ${folderID}`,
    parent_folder_uuid: folderID as FolderID,
    subfolder_uuids: [] as FolderID[],
    file_uuids: [] as FileID[],
    full_directory_path:
      `mock::/${folderID}/${folderIdNumber}${i + 1}/` as DriveFullFilePath,
    labels: [`mock-${i}`, `level-${folderIdNumber}`],
    created_by: "User123" as UserID,
    created_at: Date.now() - 86400000 * (i + 1), // Different days
    last_updated_date_ms: Date.now() - 3600000 * (i + 1), // Different hours
    last_updated_by: "User123" as UserID,
    disk_id: `DiskID_${Math.floor(folderIdNumber / 100)}` as DiskID,
    deleted: false,
    expires_at: 0,
    drive_id: "DriveID_1" as DriveID,
    has_sovereign_permissions: false,
    clipped_directory_path: `mock::/${folderID}/${folderIdNumber}${i + 1}/`,
    permission_previews: [],
  }));

  // File types to use for mock data
  const fileTypes = [
    { ext: "pdf", type: "document", diskType: "document" },
    { ext: "docx", type: "document", diskType: "document" },
    { ext: "xlsx", type: "spreadsheet", diskType: "spreadsheet" },
    { ext: "pptx", type: "presentation", diskType: "presentation" },
    { ext: "txt", type: "text", diskType: "document" },
    { ext: "jpg", type: "image", diskType: "media" },
    { ext: "png", type: "image", diskType: "media" },
    { ext: "mp4", type: "video", diskType: "media" },
  ];

  // Create mock files
  const mockFiles: FileRecord[] = Array.from({ length: 5 }, (_, i) => {
    const fileTypeIndex = Math.floor(Math.random() * fileTypes.length);
    const fileType = fileTypes[fileTypeIndex];
    const fileSize = Math.floor(Math.random() * 1024 * 1024 * 10); // Random size up to 10MB

    return {
      id: `FileID_${folderIdNumber}${i + 1}` as FileID,
      name: `Sample ${fileType.ext.toUpperCase()} File ${i + 1}`,
      folder_uuid: folderID as FolderID,
      file_version: 1,
      extension: fileType.ext,
      full_directory_path:
        `${fileType.type}::/${folderID}/${folderIdNumber}${i + 1}.${fileType.ext}` as DriveFullFilePath,
      labels: [`mock-${i}`, `type-${fileType.ext}`],
      created_by: "User123" as UserID,
      created_at: Date.now() - 86400000 * (i + 1), // Different days
      disk_id: `DiskID_${Math.floor(folderIdNumber / 100)}` as DiskID,
      disk_type: fileType.diskType as DiskTypeEnum,
      file_size: fileSize,
      raw_url: `https://example.com/files/${folderIdNumber}${i + 1}.${fileType.ext}`,
      last_updated_date_ms: Date.now() - 3600000 * (i + 1), // Different hours
      last_updated_by: "User123" as UserID,
      deleted: false,
      expires_at: 0,
      drive_id: "DriveID_1" as ICPPrincipalString,
      has_sovereign_permissions: false,
      clipped_directory_path: `mock::/${folderID}/${folderIdNumber}${i + 1}.${fileType.ext}`,
      permission_previews: [],
    };
  });

  // Special case for root folder - add more folders with names that make sense as disks
  if (folderID === "FolderID_root" || folderID === "root") {
    mockFolders.push(
      {
        id: "FolderID_personal" as FolderID,
        name: "Personal Files",
        parent_folder_uuid: folderID as FolderID,
        subfolder_uuids: [] as FolderID[],
        file_uuids: [] as FileID[],
        full_directory_path: "mock::/personal/" as DriveFullFilePath,
        labels: ["personal"],
        created_by: "User123" as UserID,
        created_at: Date.now() - 86400000,
        last_updated_date_ms: Date.now() - 3600000,
        last_updated_by: "User123" as UserID,
        disk_id: "DiskID_personal" as DiskID,
        deleted: false,
        expires_at: 0,
        drive_id: "DriveID_1" as DriveID,
        has_sovereign_permissions: false,
      },
      {
        id: "FolderID_shared" as FolderID,
        name: "Shared With Me",
        parent_folder_uuid: folderID as FolderID,
        subfolder_uuids: [] as FolderID[],
        file_uuids: [] as FileID[],
        full_directory_path: "mock::/shared/" as DriveFullFilePath,
        labels: ["shared"],
        created_by: "User123" as UserID,
        created_at: Date.now() - 86400000 * 2,
        last_updated_date_ms: Date.now() - 3600000 * 2,
        last_updated_by: "User123" as UserID,
        disk_id: "DiskID_shared" as DiskID,
        deleted: false,
        expires_at: 0,
        drive_id: "DriveID_1" as DriveID,
        has_sovereign_permissions: false,
      },
      {
        id: "FolderID_team" as FolderID,
        name: "Team Drive",
        parent_folder_uuid: folderID as FolderID,
        subfolder_uuids: [] as FolderID[],
        file_uuids: [] as FileID[],
        full_directory_path: "mock::/team/" as DriveFullFilePath,
        labels: ["team"],
        created_by: "User123" as UserID,
        created_at: Date.now() - 86400000 * 3,
        last_updated_date_ms: Date.now() - 3600000 * 3,
        last_updated_by: "User123" as UserID,
        disk_id: "DiskID_team" as DiskID,
        deleted: false,
        expires_at: 0,
        drive_id: "DriveID_1" as DriveID,
        has_sovereign_permissions: false,
      }
    );
  }

  // Apply pagination
  const paginatedFolders = mockFolders.slice(offset, offset + limit);
  const paginatedFiles = mockFiles.slice(offset, offset + limit);

  return {
    folders: paginatedFolders,
    files: paginatedFiles,
    total_files: mockFiles.length,
    total_folders: mockFolders.length,
    cursor:
      offset + limit < mockFolders.length + mockFiles.length
        ? String(offset + limit)
        : undefined,
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

  const [currentDiskId, setCurrentDiskId] = useState<DiskID | null>(null);
  const [currentFolderId, setCurrentFolderId] = useState<FolderID | null>(null);
  const [currentFileId, setCurrentFileId] = useState<FileID | null>(null);

  const [pathSegments, setPathSegments] = useState<string[]>([]);

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
  // Parse the URL to set current IDs and update breadcrumb
  useEffect(() => {
    setIs404NotFound(false);
    setSingleFile(null);

    // Reset states
    setCurrentDiskId(null);
    setCurrentFolderId(null);
    setCurrentFileId(null);

    const path = encodedPath ? decodeURIComponent(encodedPath) : "";
    const pathParts = path.split("/").filter(Boolean);

    console.log(`pathParts`, pathParts);

    // Parse the path parts
    if (pathParts.length > 0) {
      // First part should be a DiskID
      if (pathParts[0].startsWith("DiskID_")) {
        const diskId = pathParts[0] as DiskID;
        setCurrentDiskId(diskId);

        // Second part (if exists) should be a FolderID
        if (pathParts.length > 1 && pathParts[1].startsWith("FolderID_")) {
          const folderId = pathParts[1] as FolderID;
          setCurrentFolderId(folderId);

          // Fetch folder contents
          fetchContent(folderId);

          // Third part (if exists) might be a FileID
          if (pathParts.length > 2 && pathParts[2].startsWith("FileID_")) {
            const fileId = pathParts[2] as FileID;
            setCurrentFileId(fileId);

            // We're viewing a file, fetch it
            fetchFileById(fileId);
          }
        } else {
          // Only disk ID, show contents of disk root
          fetchContent(null);
        }
      }
    } else {
      // Root path - just show disks
      fetchContent(null);
    }

    // Check if we're in the Web3Storj route and Storj settings are not set
    if (currentDiskId?.includes("Web3Storj") && !areStorjSettingsSet()) {
      setIsStorjModalVisible(true);
    }
  }, [encodedPath, location.search, disks]);

  useEffect(() => {
    // If we're looking for a specific file and the filesFromRedux has updated
    if (currentFileId) {
      const file = filesFromRedux.find((f) => f.id === currentFileId);
      if (file) {
        setSingleFile(file);
        setIs404NotFound(false);
      }
    }
  }, [filesFromRedux, currentFileId]);

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
    fetchContent(currentFolderId);
  };

  // Fetch content based on folder ID
  const fetchContent = useCallback(
    async (folderId?: FolderID | null) => {
      console.log(`fetching content for folder ID`, folderId);
      if (!folderId && !currentFolderId) {
        // Root level showing disks from Redux
        console.log(`disks`, disks);
        setContent({
          folders: disks.map((disk) => ({
            id: disk.id as FolderID,
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
      } else {
        const targetFolderId = folderId || currentFolderId;
        if (!targetFolderId) return;

        try {
          console.log(`mockFetchFilesAtFolderID`, targetFolderId);
          // Use mock function for fetching folder contents
          const result = await mockFetchFilesAtFolderID(targetFolderId, 100, 0);

          console.log(`>>>> result for folder ID ${targetFolderId}`, result);

          // Convert folders to expected format
          const convertedFolders = result.folders
            .filter((f) => !f.deleted)
            .map((folder) => ({
              id: folder.id as FolderID,
              name: folder.name,
              parent_folder_uuid: folder.parent_folder_uuid as FolderID,
              subfolder_uuids: folder.subfolder_uuids as FolderID[],
              file_uuids: folder.file_uuids as FileID[],
              full_directory_path:
                folder.full_directory_path as DriveFullFilePath,
              labels: folder.labels || [],
              created_by: folder.created_by as UserID,
              created_at: folder.created_at || Date.now(),
              last_updated_date_ms: folder.last_updated_date_ms || 0,
              last_updated_by: folder.last_updated_by as UserID,
              disk_id: currentDiskId || folder.disk_id || "",
              deleted: false,
              expires_at: 0,
              drive_id: currentOrg?.driveID || "",
              has_sovereign_permissions: false,
            }));

          // Set content
          setContent({
            folders: convertedFolders,
            files: result.files || [],
          });
        } catch (error) {
          console.error("Error fetching folder contents:", error);
          setContent({ folders: [], files: [] });
        }
      }
    },
    [currentFolderId, currentDiskId, disks, currentOrg]
  );

  // Listen for changes in the Redux store for files and folders
  useEffect(() => {
    // Update file information if we're viewing a file
    if (currentFileId) {
      const file = filesFromRedux.find((f) => f.id === currentFileId);
      if (file) {
        setSingleFile(file);
        setIs404NotFound(false);
      }
    }

    // If we have folders in Redux that match our current path, update the content
    if (currentFolderId) {
      const childFolders = foldersFromRedux.filter(
        (f) => f.parent_folder_uuid === currentFolderId && !f.deleted
      );

      const childFiles = filesFromRedux.filter(
        (f) => f.folder_uuid === currentFolderId && !f.deleted
      );

      if (childFolders.length > 0 || childFiles.length > 0) {
        setContent({
          folders: childFolders,
          files: childFiles,
        });
      }
    }
  }, [filesFromRedux, foldersFromRedux, currentFolderId, currentFileId]);

  const handleBack = () => {
    if (currentFileId) {
      // If viewing a file, go back to its folder
      navigate(`/drive/${currentDiskId}/${currentFolderId}`);
    } else if (currentFolderId) {
      // If in a folder, find its parent folder
      const currentFolder = foldersFromRedux.find(
        (f) => f.id === currentFolderId
      );
      if (currentFolder && currentFolder.parent_folder_uuid) {
        // If parent folder exists, navigate to it
        navigate(`/drive/${currentDiskId}/${currentFolder.parent_folder_uuid}`);
      } else {
        // If no parent folder (top-level folder), go back to disk
        navigate(`/drive/${currentDiskId}`);
      }
    } else if (currentDiskId) {
      // If at a disk, go back to root
      navigate("/drive");
    } else {
      // Already at root
      navigate("/drive");
    }
  };

  // Handle click based on ID structure
  const handleFileFolderClick = (item: DriveItemRow) => {
    if (item.isDisabled) return;

    if (item.isFolder) {
      if (currentDiskId) {
        // We're in a disk, navigate to the folder
        navigate(`/drive/${currentDiskId}/${item.id}`);
      } else {
        // Clicked on a disk from the root
        navigate(`/drive/${item.id}`);
      }
    } else {
      // Clicked on a file, navigate to it
      navigate(`/drive/${currentDiskId}/${currentFolderId}/${item.id}`);
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

    // Add disk if present
    if (currentDiskId) {
      const disk = disks.find((d) => d.id === currentDiskId);
      const diskName = disk ? disk.name : currentDiskId.replace("DiskID_", "");

      items.push({
        title: <Link to={`/drive/${currentDiskId}`}>{diskName}</Link>,
      });

      // If we have a folder, add it
      if (currentFolderId) {
        const folder = foldersFromRedux.find((f) => f.id === currentFolderId);
        const folderName = folder
          ? folder.name
          : currentFolderId.replace("FolderID_", "");

        items.push({
          title: (
            <Link to={`/drive/${currentDiskId}/${currentFolderId}`}>
              {folderName}
            </Link>
          ),
        });

        // If we have a file, add it
        if (currentFileId) {
          const file = filesFromRedux.find((f) => f.id === currentFileId);
          const fileName = file
            ? file.name
            : currentFileId.replace("FileID_", "");

          items.push({
            title: <span>{fileName}</span>, // Not a link when viewing the file
          });
        }
      }
    }

    return items;
  };

  const breadcrumbItems = generateBreadcrumbItems();

  const tableRows: DriveItemRow[] = useMemo(() => {
    if (!currentDiskId && !currentFolderId) {
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
  }, [content, currentDiskId, currentFolderId]);

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

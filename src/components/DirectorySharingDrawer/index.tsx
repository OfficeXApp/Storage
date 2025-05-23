import React, { useEffect, useMemo, useState } from "react";
import {
  Button,
  Checkbox,
  DatePicker,
  Drawer,
  Dropdown,
  Input,
  Space,
  Table,
  Tooltip,
  message,
  Typography,
  Popconfirm,
  Popover,
} from "antd";
import {
  CheckOutlined,
  CloseOutlined,
  CopyOutlined,
  EditOutlined,
  InfoCircleOutlined,
  LoadingOutlined,
  MoreOutlined,
  PlusOutlined,
  SaveOutlined,
  SyncOutlined,
} from "@ant-design/icons";
import type { MenuProps } from "antd";
import { Permission } from "@aws-sdk/client-s3";
import dayjs from "dayjs";
import { useDispatch, useSelector } from "react-redux";
import { ReduxAppState } from "../../redux-offline/ReduxProvider";
import {
  DirectoryPermissionID,
  DirectoryPermissionType,
  DirectoryResourceID,
  FilePathBreadcrumb,
  FileRecordFE,
  IRequestListDirectoryPermissions,
  FileID,
  UserID,
  DiskTypeEnum,
  FolderID,
  DriveFullFilePath,
  ICPPrincipalString,
  UploadStatus,
  DriveClippedFilePath,
  LabelValue,
  FileConflictResolutionEnum,
} from "@officexapp/types";
import DirectoryPermissionAddDrawer, {
  PreExistingStateForEdit,
} from "./directory-permission.add";
import { LOCAL_STORAGE_DIRECTORY_PERMISSIONS_ADVANCED_OPEN } from "../../framework/identity/constants";
import TagCopy from "../TagCopy";
import { set } from "lodash";
import {
  deleteDirectoryPermissionAction,
  listDirectoryPermissionsAction,
} from "../../redux-offline/permissions/permissions.actions";
import { DirectoryPermissionFEO } from "../../redux-offline/permissions/permissions.reducer";
import PermissionStatusMessage from "./directory-warning";
import { generateRedeemDirectoryPermitURL } from "./directory-permission.redeem";
import { useIdentitySystem } from "../../framework/identity";
import { useMultiUploader } from "../../framework/uploader/hook";
import {
  defaultBrowserCacheDiskID,
  defaultTempCloudSharingDefaultUploadFolderID,
  defaultTempCloudSharingDiskID,
  defaultTempCloudSharingTrashFolderID,
} from "../../api/dexie-database";
import { fileRawUrl_BTOA } from "../FreeFileSharePreview";
import {
  FileFEO,
  FolderFEO,
} from "../../redux-offline/directory/directory.reducer";
import {
  extractDiskInfo,
  getNextUtcMidnight,
  urlSafeBase64Encode,
} from "../../api/helpers";
import { v4 as uuidv4 } from "uuid";
import {
  FileUUID,
  LOCAL_STORAGE_STORJ_ACCESS_KEY,
  LOCAL_STORAGE_STORJ_SECRET_KEY,
  useDrive,
} from "../../framework";
import { generateListDirectoryKey } from "../../redux-offline/directory/directory.actions";
import { LocalS3Adapter } from "../../framework/uploader/adapters/locals3.adapter";
import {
  LocalS3AdapterConfig,
  UploadConfig,
  UploadProgressInfo,
  UploadState,
} from "../../framework/uploader/types";
import { freeTrialStorjCreds, uploadTempTrialSharing } from "../../api/storj";

interface DirectorySharingDrawerProps {
  open: boolean;
  onClose: () => void;
  resourceID: DirectoryResourceID;
  resourceName: string;
  resource?: FileFEO | FolderFEO;
  breadcrumbs: FilePathBreadcrumb[];
  currentUserPermissions: DirectoryPermissionType[];
}

const { RangePicker } = DatePicker;
const { Text } = Typography;

interface PermissionRecord {
  key: string;
  who: string;
  who_id: string;
  canView: boolean;
  canEdit: boolean;
  canDelete: boolean;
  canInvite: boolean;
  canUpload: boolean;
  whenStart: number | null;
  whenEnd: number | null;
  isEditing: boolean;
  original: DirectoryPermissionFEO;
}

const DirectorySharingDrawer: React.FC<DirectorySharingDrawerProps> = ({
  open,
  onClose,
  resourceID,
  resourceName,
  resource,
  breadcrumbs,
  currentUserPermissions,
}) => {
  console.log(`WOW_resource`, resource);

  const { currentProfile, currentOrg } = useIdentitySystem();
  const dbNameRef = React.useRef<string>(
    `OFFICEX-browser-cache-storage-${currentOrg?.driveID}-${currentProfile?.userID}`
  );
  const objectStoreNameRef = React.useRef<string>("files");

  React.useEffect(() => {
    if (currentOrg && currentProfile) {
      dbNameRef.current = `OFFICEX-browser-cache-storage-${currentOrg.driveID}-${currentProfile.userID}`;
    }
  }, [currentOrg, currentProfile]);

  const getFileType = ():
    | "image"
    | "video"
    | "audio"
    | "pdf"
    | "spreadsheet"
    | "officex-spreadsheet"
    | "officex-document"
    | "other" => {
    const name = resource?.name || "";
    let extension =
      (resource as FileFEO)?.extension?.toLowerCase() ||
      name.split(".").pop()?.toLowerCase();

    if (name.endsWith("officex-spreadsheet")) {
      extension = "officex-spreadsheet";
    } else if (name.endsWith("officex-document")) {
      extension = "officex-document";
    }

    switch (extension) {
      case "jpg":
      case "jpeg":
      case "png":
      case "gif":
      case "bmp":
      case "webp":
        return "image";
      case "mp4":
      case "webm":
      case "ogg":
      case "mov":
      case "avi":
        return "video";
      case "mp3":
      case "wav":
      case "flac":
      case "aac":
        return "audio";
      case "xlsx":
      case "xls":
      case "csv":
        return "spreadsheet";
      case "pdf":
        return "pdf";
      case "officex-spreadsheet":
        return "officex-spreadsheet";
      case "officex-document":
        return "officex-document";
      default:
        return "other";
    }
  };

  const fileType = getFileType();

  // Helper method to reconstruct a file from chunks
  const reconstructFileFromChunks = async (
    db: IDBDatabase,
    fileId: FileUUID
  ): Promise<Blob | null> => {
    return new Promise((resolve, reject) => {
      try {
        // First get the file metadata to determine chunks
        const filesTransaction = db.transaction(
          [objectStoreNameRef.current],
          "readonly"
        );
        const filesStore = filesTransaction.objectStore(
          objectStoreNameRef.current
        );
        const metadataRequest = filesStore.get(fileId);

        metadataRequest.onsuccess = async () => {
          if (!metadataRequest.result) {
            console.error("File metadata not found for reconstruction");
            return resolve(null);
          }

          const fileInfo = metadataRequest.result;
          const chunkSize = 1024 * 1024; // Default 1MB chunks
          const totalChunks = Math.ceil(fileInfo.size / chunkSize);

          // Start transaction for chunks
          const chunksTransaction = db.transaction(["file_chunks"], "readonly");
          const chunksStore = chunksTransaction.objectStore("file_chunks");

          const chunks: Uint8Array[] = [];
          let loadedChunks = 0;

          // Process each chunk
          for (let i = 0; i < totalChunks; i++) {
            const chunkId = `${fileId}_chunk_${i}`;
            const chunkRequest = chunksStore.get(chunkId);

            chunkRequest.onsuccess = (event) => {
              const result = (event.target as IDBRequest).result;
              if (result && result.data) {
                chunks[i] = result.data; // Store at correct position
                loadedChunks++;

                // Check if all chunks are loaded
                if (loadedChunks === totalChunks) {
                  const blob = new Blob(chunks, {
                    type: fileInfo.type || "application/octet-stream",
                  });
                  resolve(blob);
                }
              } else {
                console.warn(`Missing chunk ${i} for file ${fileId}`);
                loadedChunks++;

                // Even with missing chunks, try to construct partial file
                if (loadedChunks === totalChunks) {
                  if (chunks.length > 0) {
                    const blob = new Blob(chunks.filter(Boolean), {
                      type: fileInfo.type || "application/octet-stream",
                    });
                    resolve(blob);
                  } else {
                    resolve(null);
                  }
                }
              }
            };

            chunkRequest.onerror = (event) => {
              console.error(`Error loading chunk ${i}:`, event);
              loadedChunks++;

              // Continue with remaining chunks
              if (loadedChunks === totalChunks && chunks.length > 0) {
                const blob = new Blob(chunks.filter(Boolean), {
                  type: fileInfo.type || "application/octet-stream",
                });
                resolve(blob);
              }
            };
          }

          // Handle case with no chunks
          if (totalChunks === 0) {
            resolve(null);
          }
        };

        metadataRequest.onerror = (event) => {
          console.error("Error getting file metadata:", event);
          reject(new Error("Failed to get file metadata"));
        };
      } catch (error) {
        console.error("Error during file reconstruction:", error);
        reject(error);
      }
    });
  };

  const getFileFromIndexedDB = async (fileId: FileUUID): Promise<string> => {
    console.log(`getFileFromIndexedDB`, fileId);
    return new Promise((resolve, reject) => {
      const openRequest = indexedDB.open(dbNameRef.current, 1);

      openRequest.onerror = (event) => {
        console.error("Error opening IndexedDB:", event);
        reject(new Error("Failed to open IndexedDB"));
      };

      openRequest.onsuccess = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        // Try retrieving the file first
        const filesTransaction = db.transaction(
          [objectStoreNameRef.current],
          "readonly"
        );
        const filesStore = filesTransaction.objectStore(
          objectStoreNameRef.current
        );
        const fileRequest = filesStore.get(fileId);

        fileRequest.onsuccess = async () => {
          if (fileRequest.result) {
            // Check if we have the complete file
            if (fileRequest.result.uploadComplete) {
              console.log(
                "Found complete file in IndexedDB:",
                fileRequest.result
              );

              // For certain file types that need reconstruction from chunks
              if (
                [
                  "image",
                  "video",
                  "audio",
                  "pdf",
                  "spreadsheet",
                  "other",
                  "officex-spreadsheet",
                  "officex-document",
                ].includes(fileType)
              ) {
                try {
                  const fileBlob = await reconstructFileFromChunks(db, fileId);
                  if (fileBlob) {
                    const url = URL.createObjectURL(fileBlob);
                    resolve(url);
                  } else {
                    reject(new Error("Failed to reconstruct file from chunks"));
                  }
                } catch (error) {
                  console.error("Error reconstructing file:", error);
                  reject(error);
                }
              } else {
                // For other types where direct access may be enough
                resolve(fileRequest.result.url || "");
              }
            } else {
              reject(new Error("File upload is not complete"));
            }
          } else {
            reject(new Error("File not found in IndexedDB"));
          }
        };

        fileRequest.onerror = (event) => {
          console.error("Error retrieving file from IndexedDB:", event);
          reject(new Error("Failed to retrieve file from IndexedDB"));
        };
      };

      // Handle database version upgrade (first time)
      openRequest.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        // Create object stores if they don't exist
        if (!db.objectStoreNames.contains(objectStoreNameRef.current)) {
          db.createObjectStore(objectStoreNameRef.current, { keyPath: "id" });
        }
        if (!db.objectStoreNames.contains("file_chunks")) {
          db.createObjectStore("file_chunks", { keyPath: "id" });
        }
      };
    });
  };

  const [isAddDrawerOpen, setIsAddDrawerOpen] = useState(false);
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);
  const [onTheFlyShareUrl, setOnTheFlyShareUrl] = useState("");
  const [shareUrl, setShareUrl] = useState(window.location.href);
  const [searchText, setSearchText] = useState("");
  const [isGeneratingLink, setIsGeneratingLink] = useState(false);

  const { permissionMap, permissionIDs } = useSelector(
    (state: ReduxAppState) => ({
      permissionMap: state.directoryPermissions.permissionMap,
      permissionIDs:
        state.directoryPermissions.resourcePermissionsMap[resourceID] || [],
    })
  );
  const { permissionsLoading } = useSelector((state: ReduxAppState) => ({
    permissionsLoading: state.directoryPermissions.loading,
  }));

  const canInvite =
    currentUserPermissions.includes(DirectoryPermissionType.INVITE) ||
    currentUserPermissions.includes(DirectoryPermissionType.MANAGE);

  const permissions = useMemo(() => {
    return permissionIDs
      .map((pid) => permissionMap[pid])
      .filter((p) => p?.id.startsWith("DirectoryPermissionID_"));
  }, [permissionIDs, permissionMap]);

  const { wrapOrgCode } = useIdentitySystem();
  const [permissionForEdit, setPermissionForEdit] =
    useState<PreExistingStateForEdit>();
  const { uploadFiles } = useMultiUploader();

  const { diskID: uploadTargetDiskID } = extractDiskInfo();
  const isOfflineDisk =
    uploadTargetDiskID === defaultTempCloudSharingDiskID ||
    uploadTargetDiskID === defaultBrowserCacheDiskID;

  const dispatch = useDispatch();
  useEffect(() => {
    console.log("....uploadTargetDiskID", uploadTargetDiskID);
    if (uploadTargetDiskID === defaultTempCloudSharingDiskID && resource) {
      const _file = resource as FileRecordFE;
      const payload: fileRawUrl_BTOA = {
        note: `${currentProfile?.userID} shared a file with you`,
        original: _file,
      };
      setShareUrl(
        `${window.location.origin}${wrapOrgCode("/share/free-cloud-filesharing")}?redeem=${urlSafeBase64Encode(
          JSON.stringify(payload)
        )}`
      );
    } else {
      setShareUrl(window.location.href);
    }
  }, [resourceID]);

  useEffect(() => {
    const should_default_advanced_open = localStorage.getItem(
      LOCAL_STORAGE_DIRECTORY_PERMISSIONS_ADVANCED_OPEN
    );

    if (parseInt(should_default_advanced_open || "1")) {
      setIsAdvancedOpen(true);
    }
  }, []);

  const [dataSource, setDataSource] = useState<PermissionRecord[]>([]);

  useEffect(() => {
    if (isOfflineDisk) return;
    if (permissions.length > 0) {
      const data = permissions
        .filter((p) => p)
        .map((p) => {
          let who = p.grantee_name || p.granted_to || "";
          if (p.metadata?.metadata_type === "DIRECTORY_PASSWORD") {
            who = "Password";
          }
          return {
            key: p.id,
            who,
            who_id: p.granted_to || "",
            canView: p.permission_types.includes(DirectoryPermissionType.VIEW),
            canEdit: p.permission_types.includes(DirectoryPermissionType.EDIT),
            canDelete: p.permission_types.includes(
              DirectoryPermissionType.DELETE
            ),
            canInvite: p.permission_types.includes(
              DirectoryPermissionType.INVITE
            ),
            canUpload: p.permission_types.includes(
              DirectoryPermissionType.UPLOAD
            ),
            whenStart: p.begin_date_ms,
            whenEnd: p.expiry_date_ms,
            isEditing: false,
            original: p,
          };
        });

      setDataSource(data);
    } else if (dataSource.length > 0) {
      setDataSource([]);
    }
  }, [permissions, searchText]);

  const toggleEditMode = (record: PermissionRecord) => {
    const grantee_type = record.original.granted_to.startsWith("GroupID_")
      ? "group"
      : "contact";
    setPermissionForEdit({
      id: record.original.id,
      resource_id: record.original.resource_id,
      granted_to: record.original.granted_to,
      grantee_type: grantee_type,
      grantee_name: record.original.grantee_name || record.original.granted_to,
      permission_types: record.original.permission_types,
      begin_date_ms: record.original.begin_date_ms,
      expiry_date_ms: record.original.expiry_date_ms,
      inheritable: record.original.inheritable,
      note: record.original.note,
      external_id: record.original.external_id,
      external_payload: record.original.external_payload,
      password: record.original.metadata?.content?.DirectoryPassword || "",
      redeem_code: record.original.redeem_code,
    });
    setIsAddDrawerOpen(true);
  };

  const handleRemove = (id: DirectoryPermissionID) => {
    dispatch(
      deleteDirectoryPermissionAction({
        permission_id: id,
      })
    );

    setTimeout(() => {
      const payload: IRequestListDirectoryPermissions = {
        filters: {
          resource_id: resourceID,
        },
      };
      dispatch(listDirectoryPermissionsAction(payload));
    }, 500);
  };

  const handleAddPermission = () => {
    setIsAddDrawerOpen(true);
  };

  const getPermissionSummary = (record: PermissionRecord) => {
    const permissions = [];
    if (record.canView) permissions.push("View");
    if (record.canEdit) permissions.push("Edit");
    if (record.canDelete) permissions.push("Delete");
    if (record.canInvite) permissions.push("Invite");
    if (record.canUpload) permissions.push("Upload");

    return permissions.length ? permissions.join(", ") : "No permissions";
  };

  const getDateRangeSummary = (record: PermissionRecord) => {
    if (record.key === "1") return "Always";

    if (!record.whenStart && !record.whenEnd) return "No time limit";

    const startDate = record.whenStart
      ? record.whenStart === 0
        ? "Immediately"
        : new Date(record.whenStart).toLocaleDateString()
      : "Any time";
    const endDate = record.whenEnd
      ? record.whenEnd === -1
        ? "No Expiry"
        : new Date(record.whenEnd).toLocaleDateString()
      : "No end date";

    return `${startDate} to ${endDate}`;
  };

  const refetchPermissions = () => {
    const payload: IRequestListDirectoryPermissions = {
      filters: {
        resource_id: resourceID,
      },
    };
    dispatch(listDirectoryPermissionsAction(payload));
  };

  const columns = [
    {
      title: (
        <div>
          <span style={{ marginRight: 8 }}>Who</span>
          {permissionsLoading ? (
            <span>
              <LoadingOutlined />
              <i
                style={{
                  marginLeft: 8,
                  color: "rgba(0,0,0,0.2)",
                  fontWeight: 400,
                  fontSize: "0.9rem",
                }}
              >
                Syncing
              </i>
            </span>
          ) : (
            <SyncOutlined
              onClick={() => {
                message.info("Refetching permissions...");
                refetchPermissions();
              }}
              style={{ color: "rgba(0,0,0,0.2)" }}
            />
          )}
        </div>
      ),
      dataIndex: "who",
      key: "who",
      width: "45%",
      render: (name: string, record: PermissionRecord) => (
        <span style={{ fontSize: "16px" }}>
          <Popover content={record.original.note || "Add Custom Notes"}>
            {name}
          </Popover>
          {record.who_id !== "PUBLIC" && (
            <TagCopy id={record.who_id} style={{ marginLeft: 8 }} />
          )}
        </span>
      ),
    },
    {
      title: "Can",
      key: "can",
      width: "25%",
      render: (_: any, record: PermissionRecord) => {
        return (
          <span style={{ fontSize: "14px" }}>
            {getPermissionSummary(record)}
          </span>
        );
      },
    },
    {
      title: "When",
      key: "when",
      width: "20%",
      render: (_: any, record: PermissionRecord) => {
        return (
          <span style={{ fontSize: "14px" }}>
            {getDateRangeSummary(record)}
          </span>
        );
      },
    },
    {
      title: () => {
        return (
          <Button
            onClick={handleAddPermission}
            icon={<PlusOutlined style={{ fontSize: "20px" }} />}
            disabled={isOfflineDisk || !canInvite}
            type="primary"
          >
            Add
          </Button>
        );
      },
      key: "action",
      width: "10%",
      render: (_: any, record: PermissionRecord) => {
        const items: MenuProps["items"] = [];
        if (
          record.original.granted_to.startsWith(
            "PlaceholderPermissionGranteeID_"
          )
        ) {
          items.push({
            key: "magiclink",
            label: (
              <a
                onClick={() => {
                  const magicLink = generateRedeemDirectoryPermitURL({
                    fileURL: window.location.href,
                    wrapOrgCode,
                    permissionID: record.original.id,
                    resourceName: resourceName,
                    orgName: currentOrg?.nickname || "",
                    permissionTypes: record.original.permission_types,
                    resourceID: resourceID,
                    redeemCode: record.original.redeem_code || "",
                    daterange: {
                      begins_at: record.original.begin_date_ms,
                      expires_at: record.original.expiry_date_ms,
                    },
                  });
                  navigator.clipboard.writeText(magicLink);
                  message.success("Copied magic link!");
                }}
              >
                Copy Magic Link
              </a>
            ),
          });
        }
        if (record.original.metadata?.metadata_type === "DIRECTORY_PASSWORD") {
          items.push({
            key: "password",
            label: (
              <a
                onClick={() => {
                  navigator.clipboard.writeText(
                    record.original.metadata.content.DirectoryPassword
                  );
                  message.success("Copied password!");
                }}
              >
                Copy Password
              </a>
            ),
          });
        }
        items.push({
          key: "remove",
          label: (
            <Popconfirm
              title="Are you sure you want to remove this permission? This cannot be undone"
              onConfirm={() => {
                if (!canInvite) return;
                handleRemove(record.original.id);
              }}
            >
              <span>Remove</span>
            </Popconfirm>
          ),
          disabled: isOfflineDisk || !canInvite,
        });

        return (
          <Space>
            <Button
              type="text"
              icon={
                record.isEditing ? (
                  <CheckOutlined style={{ fontSize: "20px" }} />
                ) : (
                  <EditOutlined style={{ fontSize: "20px" }} />
                )
              }
              onClick={() => toggleEditMode(record)}
              disabled={isOfflineDisk || !canInvite}
            />
            <Dropdown
              disabled={isOfflineDisk}
              menu={{ items }}
              trigger={["click"]}
            >
              <Button
                type="text"
                icon={<MoreOutlined style={{ fontSize: "20px" }} />}
              />
            </Dropdown>
          </Space>
        );
      },
    },
  ];

  const generateOnTheFlyShareLink = async (fileResource: FileFEO) => {
    if (!fileResource || !fileResource?.id?.startsWith("FileID_")) {
      message.error("Cannot share a folder or invalid resource on the fly.");
      return;
    }

    // Define max file size (e.g., 50MB)
    const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB in bytes

    // Check file size from metadata if available
    if (fileResource.file_size && fileResource.file_size > MAX_FILE_SIZE) {
      message.error(
        `File is too large (${(fileResource.file_size / 1024 / 1024).toFixed(1)}MB) for offline disk sharing. Maximum allowed size is ${MAX_FILE_SIZE / 1024 / 1024}MB. Use another disk.`
      );
      return;
    }

    setIsGeneratingLink(true);
    setOnTheFlyShareUrl(""); // Clear previous

    try {
      let fileToUpload: File;

      console.log(`fileResource`, fileResource);

      // Attempt to get file from IndexedDB
      if (!fileResource.id) {
        message.error("File ID is missing, cannot fetch from IndexedDB.");
        setIsGeneratingLink(false);
        return;
      }

      try {
        const blobUrl = await getFileFromIndexedDB(fileResource.id as FileUUID);
        if (!blobUrl) {
          message.error("Failed to retrieve file content from local cache.");
          setIsGeneratingLink(false);
          return;
        }
        console.log(`indexdb found url:`, blobUrl);

        // Fetch the blob from the blob URL
        const response = await fetch(blobUrl);
        if (!response.ok) {
          throw new Error(`Failed to fetch blob: ${response.statusText}`);
        }
        const blob = await response.blob();
        fileToUpload = new File([blob], fileResource.name || "shared_file", {
          type: blob.type || "application/octet-stream",
        });
      } catch (dbError: any) {
        console.error(
          "Error fetching file from IndexedDB for sharing:",
          dbError
        );
        message.error(
          `Failed to get file from local cache: ${dbError.message}`
        );
        setIsGeneratingLink(false);
        return;
      }

      console.log(`fileToUpload`, fileToUpload);
      const tempFileID = `FileID_${uuidv4()}` as FileID;

      // TODO: Upload file to Storj
      const presignedUrl = await uploadTempTrialSharing(fileToUpload);
      console.log("File uploaded successfully! URL:", presignedUrl);

      const payload: fileRawUrl_BTOA = {
        note: `${currentProfile?.nickname} shared a file with you`,
        original: {
          ...resource,
          raw_url: presignedUrl,
          disk_id: defaultTempCloudSharingDiskID,
          disk_type: DiskTypeEnum.StorjWeb3,
          parent_folder_uuid: defaultTempCloudSharingDefaultUploadFolderID,
          upload_status: UploadStatus.COMPLETED,
        } as FileRecordFE,
      };
      const _setOnTheFlyShareUrl = `${window.location.origin}${wrapOrgCode("/share/free-cloud-filesharing")}?redeem=${urlSafeBase64Encode(
        JSON.stringify(payload)
      )}`;
      setOnTheFlyShareUrl(_setOnTheFlyShareUrl);
      setIsGeneratingLink(false);
      // copy to clipboard
      navigator.clipboard.writeText(_setOnTheFlyShareUrl);
      message.success("Generated & copied sharing link!");
    } catch (error: any) {
      console.error("Error generating on-the-fly share link:", error);
      message.error(`Failed to generate share link: ${error.message}`);
    }
  };

  const handleSave = (record: PermissionRecord) => {
    console.log("Saving:", record);
  };

  return (
    <Drawer
      title="Share Directory"
      placement="right"
      onClose={onClose}
      open={open}
      width={700}
      footer={null}
    >
      <PermissionStatusMessage
        resource_id={resourceID}
        breadcrumbs={breadcrumbs}
      />
      <div style={{ marginBottom: "16px" }}>
        <Input
          value={
            uploadTargetDiskID === defaultBrowserCacheDiskID
              ? onTheFlyShareUrl
              : shareUrl
          }
          placeholder={
            uploadTargetDiskID === defaultBrowserCacheDiskID
              ? " Generate a temporary 8 hour sharing link"
              : ""
          }
          readOnly
          size="large"
          variant="borderless"
          style={{ backgroundColor: "#fafafa" }}
          prefix={
            uploadTargetDiskID === defaultBrowserCacheDiskID && (
              <div
                onClick={() => {
                  navigator.clipboard.writeText(onTheFlyShareUrl);
                  message.success("Share URL copied to clipboard");
                }}
                style={{ color: "gray", cursor: "pointer" }}
              >
                <CopyOutlined />
                <span style={{ margin: "0px 8px" }}>Copy</span>
              </div>
            )
          }
          suffix={
            uploadTargetDiskID === defaultBrowserCacheDiskID ? (
              <Button
                type="primary"
                onClick={() => generateOnTheFlyShareLink(resource as FileFEO)}
                size="large"
                style={{ marginLeft: 8 }}
                loading={isGeneratingLink}
              >
                Generate Share Link
              </Button>
            ) : (
              <Button
                type="primary"
                icon={<CopyOutlined />}
                onClick={() => {
                  navigator.clipboard.writeText(shareUrl);
                  message.success("Share URL copied to clipboard");
                }}
                size="large"
                style={{ marginLeft: 8 }}
                disabled={uploadTargetDiskID === defaultBrowserCacheDiskID}
              >
                Copy Link
              </Button>
            )
          }
        />
      </div>

      {/* Advanced Section */}
      <details
        style={{ marginTop: "16px" }}
        open={isAdvancedOpen}
        onToggle={(e) => {
          setIsAdvancedOpen(e.currentTarget.open);
          localStorage.setItem(
            LOCAL_STORAGE_DIRECTORY_PERMISSIONS_ADVANCED_OPEN,
            e.currentTarget.open ? "1" : "0"
          );
        }}
      >
        <summary
          style={{
            cursor: "pointer",
            color: "#595959",
            fontSize: "14px",
            marginBottom: "8px",
            userSelect: "none",
          }}
        >
          Advanced
        </summary>

        <Input
          placeholder="Search by name"
          allowClear
          onChange={(e) => setSearchText(e.target.value)}
          style={{ marginTop: "16px", marginBottom: 8 }}
          prefix={<InfoCircleOutlined style={{ color: "#aaa" }} />}
          size="middle"
        />

        <Table
          dataSource={dataSource.filter((item) =>
            item.who.toLowerCase().includes(searchText.toLowerCase())
          )}
          columns={columns}
          pagination={false}
          rowKey="key"
          bordered={false}
          rowClassName={() => "permission-table-row"}
        />
      </details>

      <style>
        {`
          .permission-table-row td {
            padding: 16px 8px;
          }
          .ant-table-thead > tr > th {
            background-color: #fafafa;
            font-weight: bold;
            font-size: 16px;
          }
        `}
      </style>
      <DirectoryPermissionAddDrawer
        open={isAddDrawerOpen}
        onClose={() => {
          setIsAddDrawerOpen(false);
          setPermissionForEdit(undefined);
        }}
        onSubmitCallback={() => {
          setTimeout(() => {
            const payload: IRequestListDirectoryPermissions = {
              filters: {
                resource_id: resourceID,
              },
            };
            dispatch(listDirectoryPermissionsAction(payload));
          }, 500);
        }}
        resourceID={resourceID}
        resourceName={resourceName}
        preExistingStateForEdit={permissionForEdit}
      />
    </Drawer>
  );
};

export default DirectorySharingDrawer;

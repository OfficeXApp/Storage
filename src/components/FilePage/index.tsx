// FilePage.tsx

import React, { useState, useEffect, useRef } from "react";
import {
  Modal,
  Button,
  Result,
  Typography,
  message,
  Input,
  Spin,
  Tooltip,
  Popconfirm,
  Alert,
} from "antd";
import {
  FileOutlined,
  PictureOutlined,
  VideoCameraOutlined,
  AudioOutlined,
  FilePdfOutlined,
  FileUnknownOutlined,
  FileExcelOutlined,
  EditOutlined,
  CheckOutlined,
} from "@ant-design/icons";
import { FileUUID, StorageLocationEnum, useDrive } from "../../framework";
import useScreenType from "react-screentype-hook";
import { Link, useNavigate } from "react-router-dom";
// import FilePreview from "../FilePreview";
import { createPseudoShareLink } from "../../api/pseudo-share";
import mixpanel from "mixpanel-browser";
import { isFreeTrialStorj } from "../../api/storj";
import { useIdentitySystem } from "../../framework/identity";
import {
  FileFEO,
  shouldBehaveOfflineDiskUIIntent,
} from "../../redux-offline/directory/directory.reducer";
import { DirectoryResourceID, DiskTypeEnum, FileID } from "@officexapp/types";
import SheetJSPreview from "../SheetJSPreview";
import DirectorySharingDrawer from "../DirectorySharingDrawer";
import {
  extractDiskInfo,
  sleep,
  urlSafeBase64Encode,
  wrapAuthStringOrHeader,
} from "../../api/helpers";
import {
  UPDATE_FILE,
  updateFileAction,
} from "../../redux-offline/directory/directory.actions";
import { useDispatch } from "react-redux";
import VideoPlayer from "../VideoPlayer";

const { Text } = Typography;

interface FilePreviewProps {
  file: FileFEO;
}

const FilePage: React.FC<FilePreviewProps> = ({ file }) => {
  const screenType = useScreenType();
  const isMobile = screenType.isMobile;
  const currentLoadingFileRef = useRef<string | null>(null);
  const lastLoadedFileRef = useRef<string>("");
  const [fileName, setFileName] = useState(file.name || "Unknown File");
  const [isUpdatingName, setIsUpdatingName] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const {
    currentProfile,
    currentOrg,
    currentAPIKey,
    generateSignature,
    wrapOrgCode,
  } = useIdentitySystem();
  const { evmPublicKey, icpAccount } = currentProfile || {};
  const dispatch = useDispatch();
  // State for file content and UI
  const [fileUrl, setFileUrl] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isGeneratingShareLink, setIsGeneratingShareLink] = useState(false);
  const [isShareDrawerOpen, setIsShareDrawerOpen] = useState(false);
  // IndexedDB specific state and methods
  const dbNameRef = useRef<string>(
    `OFFICEX-browser-cache-storage-${currentOrg?.driveID}-${currentProfile?.userID}`
  );

  console.log(`file,`, file);
  console.log(`--- fileUrl loading=${isLoading}`, fileUrl);

  const objectStoreNameRef = useRef<string>("files");

  const getFileType = ():
    | "image"
    | "video"
    | "audio"
    | "pdf"
    | "spreadsheet"
    | "officex-spreadsheet"
    | "officex-document"
    | "other" => {
    const name = file.name || "";
    let extension =
      file.extension?.toLowerCase() || name.split(".").pop()?.toLowerCase();

    if (name.endsWith("officex-spreadsheet.json")) {
      extension = "officex-spreadsheet";
    } else if (name.endsWith("officex-document.json")) {
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

  const isFileSizeValidForPreview = (file: FileFEO) => {
    const sizeInMB = file.file_size / (1024 * 1024);
    const sizeInGB = sizeInMB / 1024;

    if (
      file.disk_type === DiskTypeEnum.BrowserCache ||
      file.disk_type === DiskTypeEnum.IcpCanister
    ) {
      return isMobile ? sizeInMB < 200 : sizeInGB < 1;
    } else if (
      (file.disk_type === DiskTypeEnum.StorjWeb3 ||
        file.disk_type === DiskTypeEnum.AwsBucket) &&
      getFileType() !== "video"
    ) {
      return sizeInGB < 2;
    }
    return true;
  };

  useEffect(() => {
    if (currentOrg && currentProfile) {
      dbNameRef.current = `OFFICEX-browser-cache-storage-${currentOrg.driveID}-${currentProfile.userID}`;
    }
  }, [currentOrg, currentProfile]);

  const fileType = getFileType();

  // New method to handle files from IndexedDB
  const getFileFromIndexedDB = async (fileId: FileUUID): Promise<string> => {
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

  useEffect(() => {
    console.log(`useEffect loop`);
    // If file ID hasn't changed, don't reload
    if (file.id === lastLoadedFileRef.current) {
      return;
    }

    // If we're already loading this file, don't start a new load
    if (currentLoadingFileRef.current === file.id) {
      return;
    }
    console.log(`about ot start`);
    // Clear previous URL when switching to a new file
    if (fileUrl && file.id !== lastLoadedFileRef.current) {
      URL.revokeObjectURL(fileUrl);
      setFileUrl("");
    }
    const loadFileContent = async () => {
      if (!file || !fileType) return;

      if (!currentOrg?.endpoint) {
        setFileUrl(file.raw_url || "");
        setIsLoading(false);
        return;
      }

      // Check if file is fully uploaded
      if (
        file.upload_status !== "COMPLETED" &&
        currentOrg?.endpoint &&
        !offlineDisk
      ) {
        setIsLoading(false);
        return;
      }

      // Check if file size is valid for preview
      if (!isFileSizeValidForPreview(file)) {
        setIsLoading(false);
        return;
      }

      currentLoadingFileRef.current = file.id;
      setIsLoading(true);
      console.log(`file --> `, file);
      try {
        if (file.disk_type === DiskTypeEnum.BrowserCache) {
          // Use IndexedDB approach instead of indexdbGetFileUrl
          const url = await getFileFromIndexedDB(file.id as FileUUID);
          setFileUrl(url);
        } else if (
          file.disk_type === DiskTypeEnum.StorjWeb3 ||
          file.disk_type === DiskTypeEnum.AwsBucket
        ) {
          const url = await getPresignedUrl(file.raw_url as string);
          console.log(`the presigned url`, url);
          setFileUrl(url as string);
        } else if (file.disk_type === DiskTypeEnum.IcpCanister) {
          // Handle IcpCanister files using the raw download endpoints
          // wait 3 seconds
          await sleep(3000);
          const blobUrl = await fetchFileContentFromCanister(file.id as string);
          if (blobUrl) {
            setFileUrl(blobUrl);
          } else {
            throw new Error("Failed to load file from Canister");
          }
        }
        lastLoadedFileRef.current = file.id;
      } catch (error) {
        console.error("Error loading file content", error);
        // message.info("Failed to load file content");
      } finally {
        setIsLoading(false);
        currentLoadingFileRef.current = null;
      }
    };

    loadFileContent();

    setFileName(file.name || "Unknown File");

    console.log(`just set file name`, file.name);

    // Cleanup function
    return () => {
      if (fileUrl) {
        URL.revokeObjectURL(fileUrl);
      }
    };
  }, [file, fileType]);

  async function getPresignedUrl(initialUrl: string) {
    try {
      // Make a GET request to follow redirects without downloading content
      const response = await fetch(initialUrl, {
        method: "GET",
        redirect: "follow",
      });

      if (response.ok) {
        // response.url will contain the final URL after all redirects
        return response.url;
      } else {
        console.error("Error fetching presigned URL:", response.status);
        throw new Error(`HTTP error: ${response.status}`);
      }
    } catch (error) {
      console.error("Failed to get presigned URL:", error);
      throw error;
    }
  }

  const fetchFileContentFromCanister = async (fileId: string) => {
    let auth_token = currentAPIKey?.value || (await generateSignature());
    try {
      // 1. Fetch metadata
      const { url, headers } = wrapAuthStringOrHeader(
        `${currentOrg?.endpoint}/v1/${currentOrg?.driveID}/directory/raw_download/meta?file_id=${fileId}`,
        {
          "Content-Type": "application/json",
        },
        auth_token
      );
      const metaRes = await fetch(url, {
        method: "GET",
        headers,
      });

      if (!metaRes.ok) {
        throw new Error(`Metadata request failed: ${metaRes.statusText}`);
      }

      const metadata = await metaRes.json();
      const { total_size, total_chunks } = metadata;

      // 2. Fetch all chunks
      let allBytes = new Uint8Array(total_size);
      let offset = 0;

      for (let i = 0; i < total_chunks; i++) {
        const { url, headers } = wrapAuthStringOrHeader(
          `${currentOrg?.endpoint}/v1/${currentOrg?.driveID}/directory/raw_download/chunk?file_id=${fileId}&chunk_index=${i}`,
          {
            "Content-Type": "application/json",
          },
          auth_token
        );
        const chunkRes = await fetch(url, {
          method: "GET",
          headers,
        });

        if (!chunkRes.ok) {
          throw new Error(`Chunk request #${i} failed: ${chunkRes.statusText}`);
        }

        const chunkBuf = await chunkRes.arrayBuffer();
        allBytes.set(new Uint8Array(chunkBuf), offset);
        offset += chunkBuf.byteLength;
      }

      // 3. Create blob and URL
      const blob = new Blob([allBytes]);
      const blobUrl = URL.createObjectURL(blob);

      return blobUrl;
    } catch (error) {
      console.error(
        `Error fetching content from Canister for ${fileId}:`,
        error
      );
      return null;
    }
  };

  const getIcon = () => {
    switch (fileType) {
      case "image":
        return <PictureOutlined style={{ fontSize: 36 }} />;
      case "video":
        return <VideoCameraOutlined style={{ fontSize: 36 }} />;
      case "audio":
        return <AudioOutlined style={{ fontSize: 36 }} />;
      case "spreadsheet":
        return <FileExcelOutlined style={{ fontSize: 36 }} />;
      case "pdf":
        return <FilePdfOutlined style={{ fontSize: 36 }} />;
      default:
        return <FileOutlined style={{ fontSize: 36 }} />;
    }
  };

  const handleRename = async (newName: string) => {
    const oldName = file.name;
    if (oldName === newName) return;
    if (newName.split(".").length === 1) {
      message.error(`Filename must include extension`);
      return;
    }
    setIsUpdatingName(true);
    try {
      // update file action
      const updateAction = {
        action: UPDATE_FILE as "UPDATE_FILE",
        payload: {
          id: file.id,
          name: newName,
        },
      };

      dispatch(
        updateFileAction(
          updateAction,
          undefined,
          shouldBehaveOfflineDiskUIIntent(file.disk_id)
        )
      );
      message.success("File renamed successfully");
    } catch (error) {
      message.error("Failed to rename file");
    } finally {
      setIsUpdatingName(false);
      setIsEditing(false);
    }
  };

  const handleShare = async (url: string) => {
    setIsShareDrawerOpen(true);
    // if (window.location.pathname.includes("/BrowserCache")) {
    //   message.warning(
    //     "Cannot share files from browser storage. Use cloud storage instead."
    //   );
    //   return;
    // }
    // setIsGeneratingShareLink(true);
    // const shareLink = await createPseudoShareLink({
    //   title: `${isFreeTrialStorj() ? `Expires in 24 hours - ` : ``}${file.name}`,
    //   url,
    //   ref: evmPublicKey,
    // });
    // message.info("Link copied to clipboard");
    // navigator.clipboard.writeText(shareLink);
    // setIsGeneratingShareLink(false);
    // mixpanel.track("Share File", {
    //   "File Type": file.name.split(".").pop(),
    //   Link: shareLink,
    // });
  };

  const formatFileSize = (size: number): string => {
    if (size === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
    const i = Math.floor(Math.log(size) / Math.log(k));
    return parseFloat((size / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const handleDownload = () => {
    if (fileUrl) {
      mixpanel.track("Download File", {
        "File Type": file.name.split(".").pop(),
      });

      // Open file URL in a new tab
      window.open(fileUrl, "_blank");
    } else {
      message.error("File URL not available for download");
    }
  };

  const { diskTypeEnum, diskID } = extractDiskInfo();
  const offlineDisk = shouldBehaveOfflineDiskUIIntent(diskID);

  if (!currentOrg && !currentProfile) {
    return null;
  }

  return (
    <>
      <div
        className="file-header-container"
        style={{
          background: "rgba(0,0,0,0.02)",
          padding: "8px 16px",
          borderRadius: "8px",
          marginBottom: "16px",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: isMobile ? "wrap" : "nowrap",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              flex: "1",
            }}
          >
            <div style={{ marginRight: 16 }}>
              {isLoading ? <Spin size="default" /> : getIcon()}
            </div>
            <div style={{ flex: "1" }}>
              {isEditing ? (
                <div style={{ display: "flex", alignItems: "center" }}>
                  <Input
                    defaultValue={fileName}
                    onPressEnter={(e) => handleRename(e.currentTarget.value)}
                    onBlur={(e) => setIsEditing(false)}
                    autoFocus
                    onChange={(e) => setFileName(e.target.value)}
                    disabled={isUpdatingName}
                    style={{ width: "100%", maxWidth: "300px" }}
                    suffix={
                      <Button
                        type="link"
                        icon={<CheckOutlined />}
                        loading={isUpdatingName}
                        onClick={() => handleRename(fileName)}
                      />
                    }
                  />
                  {isUpdatingName && (
                    <Spin size="small" style={{ marginLeft: 8 }} />
                  )}
                </div>
              ) : (
                <div style={{ display: "flex", alignItems: "center" }}>
                  <Text strong style={{ marginRight: "8px" }}>
                    {fileName}
                  </Text>
                  <Tooltip title="Rename">
                    <Button
                      type="link"
                      icon={<EditOutlined />}
                      onClick={() => setIsEditing(true)}
                      loading={isUpdatingName}
                      style={{ padding: "0" }}
                    />
                  </Tooltip>
                </div>
              )}
              <Text type="secondary" style={{ display: "block" }}>
                File Size: {formatFileSize(file.file_size)}
              </Text>
            </div>
          </div>

          <div
            style={{
              display: "flex",
              gap: "8px",
              marginTop: isMobile ? "12px" : "0",
              width: isMobile ? "100%" : "auto",
              justifyContent: isMobile ? "flex-end" : "flex-end",
            }}
          >
            {fileUrl && (
              <Button
                onClick={() => {
                  navigator.clipboard.writeText(file.raw_url || fileUrl);
                  message.success("Copied to clipboard");
                }}
                type="link"
                style={{ color: "rgba(0,0,0,0.3)" }}
              >
                Copy Raw
              </Button>
            )}
            <Button onClick={handleDownload} disabled={!fileUrl || isLoading}>
              Download
            </Button>
            <Button
              type="primary"
              onClick={() => handleShare(file.raw_url)}
              disabled={file.disk_type === DiskTypeEnum.BrowserCache}
              loading={isGeneratingShareLink}
            >
              Share
            </Button>
          </div>
        </div>
      </div>
      {currentOrg?.endpoint &&
        !offlineDisk &&
        file.upload_status !== "COMPLETED" && (
          <Alert
            type="warning"
            message="File Uploading"
            description="File is still uploading and cannot be previewed yet. Please wait for the upload to complete or try uploading again."
            style={{ marginBottom: "16px" }}
          />
        )}

      {currentOrg?.endpoint &&
        !offlineDisk &&
        file.upload_status === "COMPLETED" &&
        !isFileSizeValidForPreview(file) && (
          <Alert
            type="info"
            message="File Too Large for Preview"
            description={`This file is too large to preview (${formatFileSize(file.file_size)}). ${
              isMobile &&
              (file.disk_type === DiskTypeEnum.BrowserCache ||
                file.disk_type === DiskTypeEnum.IcpCanister)
                ? "Mobile preview is limited to 200MB for browser storage and ICP canister files."
                : file.disk_type === DiskTypeEnum.BrowserCache ||
                    file.disk_type === DiskTypeEnum.IcpCanister
                  ? "Preview is limited to 1GB for browser storage and ICP canister files."
                  : "Preview is limited to 2GB for cloud storage files."
            } Please download the file instead.`}
            style={{ marginBottom: "16px" }}
          />
        )}

      {!currentOrg?.endpoint ||
      (offlineDisk && fileUrl) ||
      (currentOrg?.endpoint &&
        file.upload_status === "COMPLETED" &&
        isFileSizeValidForPreview(file)) ? (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "flex-start",
            alignItems: "flex-start",
          }}
        >
          {fileType === "image" && fileUrl && (
            <img
              src={fileUrl}
              alt={file.name}
              style={{
                maxWidth: screenType.isMobile ? "80vw" : "800px",
                maxHeight: screenType.isMobile ? "auto" : "calc(65vh)",
                objectFit: "contain",
              }}
            />
          )}
          {fileType === "video" && fileUrl && (
            // <video
            //   src={fileUrl}
            //   controls
            //   style={{
            //     width: "100%",
            //     maxWidth: "800px",
            //     maxHeight: "calc(65vh)",
            //   }}
            // >
            //   Your browser does not support the video tag.
            // </video>

            <VideoPlayer url={fileUrl} />
          )}
          {fileType === "audio" && fileUrl && (
            <audio src={fileUrl} controls style={{ marginTop: "20px" }}>
              Your browser does not support the audio tag.
            </audio>
          )}
          {fileType === "spreadsheet" && fileUrl && (
            <SheetJSPreview file={file} showButtons={true} />
          )}
          {fileType === "pdf" && fileUrl && (
            <iframe
              src={fileUrl}
              title={file.name}
              style={{
                height: "calc(65vh)",
                border: "none",
              }}
            />
          )}
          {fileType === "other" && fileUrl && (
            <div
              style={{
                justifyContent: "center",
                marginTop: "32px",
              }}
            >
              <Result
                icon={<FileExcelOutlined />}
                title="Preview Unavailable"
                extra={
                  <Button
                    type="primary"
                    onClick={() => window.open(fileUrl, "_blank")}
                  >
                    Download
                  </Button>
                }
              />
            </div>
          )}
          {fileType === "officex-spreadsheet" && (
            <Link to={`${wrapOrgCode(`/apps/sheets/${file.id}`)}`}>
              <Button>Open Spreadsheet</Button>
            </Link>
          )}
        </div>
      ) : null}
      <DirectorySharingDrawer
        open={isShareDrawerOpen}
        onClose={() => setIsShareDrawerOpen(false)}
        resourceID={file.id as DirectoryResourceID}
        resourceName={file.name}
        resource={file}
        breadcrumbs={file?.breadcrumbs || []}
        currentUserPermissions={file?.permission_previews || []}
      />
    </>
  );
};

export default FilePage;

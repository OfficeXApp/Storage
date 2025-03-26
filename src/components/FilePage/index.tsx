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
import { useNavigate } from "react-router-dom";
import FilePreview from "../FilePreview";
import { createPseudoShareLink } from "../../api/pseudo-share";
import mixpanel from "mixpanel-browser";
import { isFreeTrialStorj } from "../../api/storj";
import { useIdentitySystem } from "../../framework/identity";
import { FileFEO } from "../../redux-offline/directory/directory.reducer";
import { DiskTypeEnum } from "@officexapp/types";

const { Text } = Typography;

interface FilePreviewProps {
  file: FileFEO;
}

const FilePage: React.FC<FilePreviewProps> = ({ file }) => {
  const screenType = useScreenType();
  const isMobile = screenType.isMobile;
  const [fileName, setFileName] = useState(file.name || "Unknown File");
  const [isUpdatingName, setIsUpdatingName] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const { renameFilePath } = useDrive();
  const { currentProfile, currentOrg, currentAPIKey } = useIdentitySystem();
  const { evmPublicKey, icpAccount } = currentProfile || {};

  // State for file content and UI
  const [fileUrl, setFileUrl] = useState<string>("");
  const [isModalVisible, setIsModalVisible] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isGeneratingShareLink, setIsGeneratingShareLink] = useState(false);

  // IndexedDB specific state and methods
  const dbNameRef = useRef<string>(
    `OFFICEX-browser-cache-storage-${currentOrg?.driveID}-${currentProfile?.userID}`
  );
  const objectStoreNameRef = useRef<string>("files");

  const getFileType = ():
    | "image"
    | "video"
    | "audio"
    | "pdf"
    | "spreadsheet"
    | "other" => {
    const name = file.name || "";
    const extension =
      file.extension?.toLowerCase() || name.split(".").pop()?.toLowerCase();

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
      default:
        return "other";
    }
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
              if (["image", "video", "audio", "pdf"].includes(fileType)) {
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
    const loadFileContent = async () => {
      setIsLoading(true);
      try {
        if (file.disk_type === DiskTypeEnum.BrowserCache) {
          // Use IndexedDB approach instead of indexdbGetFileUrl
          const url = await getFileFromIndexedDB(file.id as FileUUID);
          setFileUrl(url);
        } else if (file.disk_type === DiskTypeEnum.StorjWeb3) {
          setFileUrl(file.raw_url as string);
        } else if (file.disk_type === DiskTypeEnum.IcpCanister) {
          // Handle IcpCanister files using the raw download endpoints
          const blobUrl = await fetchFileContentFromCanister(file.id as string);
          if (blobUrl) {
            setFileUrl(blobUrl);
          } else {
            throw new Error("Failed to load file from Canister");
          }
        }
      } catch (error) {
        console.error("Error loading file content", error);
        message.error("Failed to load file content");
      } finally {
        setIsLoading(false);
      }
    };

    if (fileType === "other") {
      setIsModalVisible(false);
    } else {
      loadFileContent();
    }

    setFileName(file.name || "Unknown File");

    // Cleanup function
    return () => {
      if (fileUrl) {
        URL.revokeObjectURL(fileUrl);
      }
    };
  }, [file, fileType]);

  const fetchFileContentFromCanister = async (fileId: string) => {
    try {
      // 1. Fetch metadata
      const metaRes = await fetch(
        `${currentOrg?.endpoint}/v1/${currentOrg?.driveID}/directory/raw_download/meta?file_id=${fileId}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${currentAPIKey?.value}`,
          },
        }
      );

      if (!metaRes.ok) {
        throw new Error(`Metadata request failed: ${metaRes.statusText}`);
      }

      const metadata = await metaRes.json();
      const { total_size, total_chunks } = metadata;

      // 2. Fetch all chunks
      let allBytes = new Uint8Array(total_size);
      let offset = 0;

      for (let i = 0; i < total_chunks; i++) {
        const chunkRes = await fetch(
          `${currentOrg?.endpoint}/v1/${currentOrg?.driveID}/directory/raw_download/chunk?file_id=${fileId}&chunk_index=${i}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${currentAPIKey?.value}`,
            },
          }
        );

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
        return <PictureOutlined style={{ fontSize: 48 }} />;
      case "video":
        return <VideoCameraOutlined style={{ fontSize: 48 }} />;
      case "audio":
        return <AudioOutlined style={{ fontSize: 48 }} />;
      case "spreadsheet":
        return <FileExcelOutlined style={{ fontSize: 48 }} />;
      case "pdf":
        return <FilePdfOutlined style={{ fontSize: 48 }} />;
      default:
        return <FileOutlined style={{ fontSize: 48 }} />;
    }
  };

  const handleRename = async (newName: string) => {
    setIsUpdatingName(true);
    try {
      const oldName = file.name;
      await renameFilePath(file.id as FileUUID, newName);
      setFileName(newName);
      message.success("File renamed successfully");

      // Update URL using window.history.replaceState
      const currentPath = window.location.pathname;

      const newPath = currentPath.replace(
        encodeURIComponent(oldName),
        encodeURIComponent(newName)
      );
      window.history.replaceState(null, "", newPath);
    } catch (error) {
      message.error("Failed to rename file");
    } finally {
      setIsUpdatingName(false);
      setIsEditing(false);
    }
  };

  const handleShare = async (url: string) => {
    if (window.location.pathname.includes("/BrowserCache")) {
      message.warning(
        "Cannot share files from browser storage. Use cloud storage instead."
      );
      return;
    }
    setIsGeneratingShareLink(true);
    const shareLink = await createPseudoShareLink({
      title: `${isFreeTrialStorj() ? `Expires in 24 hours - ` : ``}${file.name}`,
      url,
      ref: evmPublicKey,
    });
    message.info("Link copied to clipboard");
    navigator.clipboard.writeText(shareLink);
    setIsGeneratingShareLink(false);
    mixpanel.track("Share File", {
      "File Type": file.name.split(".").pop(),
      Link: shareLink,
    });
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

  if (!currentOrg && !currentProfile) {
    return null;
  }

  return (
    <>
      <Result
        icon={getIcon()}
        title={
          isEditing ? (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Input
                defaultValue={fileName}
                onPressEnter={(e) => handleRename(e.currentTarget.value)}
                onBlur={(e) => setIsEditing(false)}
                autoFocus
                onChange={(e) => setFileName(e.target.value)}
                disabled={isUpdatingName}
                style={{ width: 200 }}
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
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Text strong>{fileName}</Text>
              <Tooltip title="Rename">
                <Button
                  type="link"
                  icon={<EditOutlined />}
                  onClick={() => setIsEditing(true)}
                  loading={isUpdatingName}
                />
              </Tooltip>
            </div>
          )
        }
        subTitle={`File Size: ${formatFileSize(file.file_size)}`}
        extra={[
          <Button
            key="download2"
            type="primary"
            onClick={handleDownload}
            disabled={!fileUrl || isLoading}
          >
            Download
          </Button>,
          <Button
            key="preview2"
            onClick={() => setIsModalVisible(true)}
            disabled={fileType === "other" || !fileUrl || isLoading}
          >
            Preview
          </Button>,
          <Button
            key="share2"
            onClick={() => handleShare(file.raw_url)}
            disabled={
              !file.raw_url || file.disk_type === DiskTypeEnum.BrowserCache
            }
            loading={isGeneratingShareLink}
          >
            Share
          </Button>,
        ]}
        style={{
          paddingTop: isMobile ? 70 : 150,
          paddingBottom: isMobile ? 70 : 150,
          background: "rgba(0,0,0,0.02)",
        }}
      />

      {isLoading && (
        <div style={{ textAlign: "center", marginTop: 20 }}>
          <Spin size="large" />
          <div style={{ marginTop: 10 }}>Loading file content...</div>
        </div>
      )}

      {isModalVisible && (
        <Modal
          open={isModalVisible}
          footer={null}
          onCancel={() => setIsModalVisible(false)}
          width={isMobile ? "100%" : "80%"}
          style={{ top: 20 }}
          closable={true}
          closeIcon={null} // Hide default close icon to customize header
        >
          {file.disk_type === DiskTypeEnum.BrowserCache ||
          file.disk_type === DiskTypeEnum.IcpCanister ? (
            // Custom preview for IndexedDB files
            <div style={{ textAlign: "center" }}>
              {fileType === "image" && fileUrl && (
                <img
                  src={fileUrl}
                  alt={file.name}
                  style={{
                    maxWidth: "100%",
                    maxHeight: "calc(80vh)",
                    objectFit: "contain",
                  }}
                />
              )}
              {fileType === "video" && fileUrl && (
                <video
                  src={fileUrl}
                  controls
                  style={{ maxWidth: "100%", maxHeight: "calc(80vh)" }}
                >
                  Your browser does not support the video tag.
                </video>
              )}
              {fileType === "audio" && fileUrl && (
                <audio
                  src={fileUrl}
                  controls
                  style={{ width: "100%", marginTop: "20px" }}
                >
                  Your browser does not support the audio tag.
                </audio>
              )}
              {fileType === "pdf" && fileUrl && (
                <iframe
                  src={fileUrl}
                  title={file.name}
                  style={{
                    width: "100%",
                    height: "calc(80vh)",
                    border: "none",
                  }}
                />
              )}
            </div>
          ) : (
            // Use FilePreview for other storage types
            <FilePreview file={file} />
          )}
        </Modal>
      )}
    </>
  );
};

export default FilePage;

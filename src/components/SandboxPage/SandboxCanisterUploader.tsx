import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  Button,
  Card,
  Progress,
  Space,
  Table,
  Tag,
  message,
  Divider,
  Typography,
  Popover,
  Image,
  Modal,
} from "antd";
import {
  UploadOutlined,
  PauseCircleOutlined,
  PlayCircleOutlined,
  DeleteOutlined,
  FileImageOutlined,
  FileTextOutlined,
  FileZipOutlined,
  FilePdfOutlined,
  FileUnknownOutlined,
  EyeOutlined,
  DownloadOutlined,
} from "@ant-design/icons";
import { useDispatch, useSelector } from "react-redux";
import {
  FolderID,
  FileID,
  DiskID,
  GenerateID,
  DiskTypeEnum,
} from "@officexapp/types";
import {
  CREATE_FILE,
  createFileAction,
} from "../../redux-offline/directory/directory.actions";
import { sleep } from "../../api/helpers";

const { Title, Text } = Typography;

// Base API URL - would normally come from environment or config
const API_BASE_URL =
  "http://bw4dl-smaaa-aaaaa-qaacq-cai.localhost:8000/v1/default";
const API_KEY =
  "eyJhdXRoX3R5cGUiOiJBUElfX0tFWSIsInZhbHVlIjoiZTE5ZjU2MzJkMWQ3MThiM2Q0Mzg1M2NiODNjNmE1YjlmMzBmMzk3ZTA0N2Q1YzFlMmYxNDczMGYyOTNlM2U3ZiJ9";

// Upload statuses
enum UploadState {
  QUEUED = "queued",
  ACTIVE = "active",
  PAUSED = "paused",
  COMPLETED = "completed",
  FAILED = "failed",
  CANCELLED = "cancelled",
}

// Interface for tracking uploads
interface UploadItem {
  id: string;
  file: File;
  state: UploadState;
  progress: number;
  chunks: {
    total: number;
    completed: number;
  };
  url?: string;
  error?: string;
  createdAt: number;
  blobUrl?: string;
}

const CanisterUploader: React.FC<{
  currentFolderId?: FolderID;
  diskId?: DiskID;
}> = ({
  currentFolderId = "FolderID_e3d09567-11df-45a9-815b-2c0abc1f9aed" as FolderID,
  diskId = "DiskID_e3d09567-11df-45a9-815b-2c0abc1f9aed" as DiskID,
}) => {
  const dispatch = useDispatch();
  const [fileList, setFileList] = useState<File[]>([]);
  const [uploads, setUploads] = useState<UploadItem[]>([]);
  const [overallProgress, setOverallProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadingActive, setUploadingActive] = useState(false);
  const activeCancelTokens = useRef<Record<string, AbortController>>({});
  const [previewVisible, setPreviewVisible] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [previewTitle, setPreviewTitle] = useState<string>("");

  // Calculate overall progress whenever uploads change
  useEffect(() => {
    if (uploads.length === 0) {
      setOverallProgress(0);
      return;
    }

    const total = uploads.reduce((sum, item) => sum + item.progress, 0);
    setOverallProgress(Math.floor(total / uploads.length));

    // Check if any uploads are still active
    const activeUploads = uploads.some(
      (item) =>
        item.state === UploadState.ACTIVE || item.state === UploadState.QUEUED
    );
    setUploadingActive(activeUploads);

    return () => {
      // Revoke all blob URLs when component unmounts
      uploads.forEach((item) => {
        if (item.blobUrl) {
          URL.revokeObjectURL(item.blobUrl);
        }
      });
    };
  }, [uploads]);

  // Handle file selection
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const filesArray = Array.from(e.target.files);
      setFileList((prev) => [...prev, ...filesArray]);
    }
  };

  // Create a file record in the system using Redux action
  const createFileRecord = async (file: File): Promise<string> => {
    const fileId = GenerateID.File();

    // Prepare the create file action
    const createAction = {
      action: CREATE_FILE as "CREATE_FILE",
      payload: {
        id: fileId,
        name: file.name,
        parent_folder_uuid: currentFolderId,
        extension: file.name.split(".").pop() || "",
        labels: [],
        file_size: file.size,
        raw_url: "", // Will be populated later
        disk_id: diskId,
        disk_type: DiskTypeEnum.IcpCanister,
      },
    };

    console.log("About to create file record with action:", createAction);

    // Dispatch action to create file record
    dispatch(createFileAction(createAction, undefined, false));

    console.log("Sent dispatch to create file record");

    await sleep(30000);
    return fileId;
  };

  // Upload a single chunk
  const uploadChunk = async (
    fileId: string,
    chunkIndex: number,
    chunkData: Uint8Array,
    totalChunks: number,
    abortController: AbortController
  ): Promise<boolean> => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/directory/raw_upload/chunk`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${API_KEY}`,
          },
          body: JSON.stringify({
            file_id: fileId,
            chunk_index: chunkIndex,
            chunk_data: Array.from(chunkData),
            total_chunks: totalChunks,
          }),
          signal: abortController.signal,
        }
      );

      if (!response.ok) {
        throw new Error(`Upload failed: ${response.statusText}`);
      }

      return true;
    } catch (error) {
      if ((error as Error).name === "AbortError") {
        console.log(
          `Upload of chunk ${chunkIndex} for file ${fileId} was cancelled`
        );
        return false;
      }
      throw error;
    }
  };

  // Complete the upload
  const completeUpload = async (
    fileId: string,
    filename: string,
    abortController: AbortController
  ): Promise<boolean> => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/directory/raw_upload/complete`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${API_KEY}`,
          },
          body: JSON.stringify({
            file_id: fileId,
            filename,
          }),
          signal: abortController.signal,
        }
      );

      if (!response.ok) {
        throw new Error(`Complete upload failed: ${response.statusText}`);
      }

      return true;
    } catch (error) {
      if ((error as Error).name === "AbortError") {
        console.log(`Complete upload for file ${fileId} was cancelled`);
        return false;
      }
      throw error;
    }
  };

  const fetchFileContent = async (fileId: string) => {
    try {
      const existingItem = uploads.find((item) => item.id === fileId);

      // If we already have a blob URL, don't fetch again
      if (existingItem?.blobUrl) {
        return existingItem.blobUrl;
      }

      // 1. Fetch metadata
      const metaRes = await fetch(
        `${API_BASE_URL}/directory/raw_download/meta?file_id=${fileId}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${API_KEY}`,
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
          `${API_BASE_URL}/directory/raw_download/chunk?file_id=${fileId}&chunk_index=${i}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${API_KEY}`,
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

      // Save blobUrl to state
      setUploads((prev) =>
        prev.map((item) => (item.id === fileId ? { ...item, blobUrl } : item))
      );

      return blobUrl;
    } catch (error) {
      console.error(`Error fetching content for ${fileId}:`, error);
      message.error(`Failed to prepare preview: ${(error as Error).message}`);
      return null;
    }
  };

  // Upload a file with chunking
  const uploadFile = async (file: File) => {
    const CHUNK_SIZE = 0.5 * 1024 * 1024; // 0.5MB chunks
    const totalChunks = Math.ceil(file.size / CHUNK_SIZE);

    // Create a file record and get the ID
    const fileId = await createFileRecord(file);

    const abortController = new AbortController();
    activeCancelTokens.current[fileId] = abortController;

    // Add to uploads state with initial values
    const uploadItem: UploadItem = {
      id: fileId,
      file,
      state: UploadState.QUEUED,
      progress: 0,
      chunks: {
        total: totalChunks,
        completed: 0,
      },
      createdAt: Date.now(),
    };

    setUploads((prev) => [...prev, uploadItem]);

    try {
      // Update state to active
      setUploads((prev) =>
        prev.map((item) =>
          item.id === fileId ? { ...item, state: UploadState.ACTIVE } : item
        )
      );

      // Upload each chunk
      for (let chunkIndex = 0; chunkIndex < totalChunks; chunkIndex++) {
        // Check if upload was cancelled
        if (abortController.signal.aborted) {
          return;
        }

        const start = chunkIndex * CHUNK_SIZE;
        const end = Math.min(start + CHUNK_SIZE, file.size);
        const chunk = file.slice(start, end);

        const chunkArrayBuffer = await chunk.arrayBuffer();
        const chunkData = new Uint8Array(chunkArrayBuffer);

        const success = await uploadChunk(
          fileId,
          chunkIndex,
          chunkData,
          totalChunks,
          abortController
        );

        if (!success) {
          // Upload was cancelled
          return;
        }

        // Update progress
        const newCompletedChunks = chunkIndex + 1;
        const newProgress = Math.floor(
          (newCompletedChunks / totalChunks) * 100
        );

        setUploads((prev) =>
          prev.map((item) =>
            item.id === fileId
              ? {
                  ...item,
                  progress: newProgress,
                  chunks: {
                    ...item.chunks,
                    completed: newCompletedChunks,
                  },
                }
              : item
          )
        );
      }

      // Complete the upload
      const completed = await completeUpload(
        fileId,
        file.name,
        abortController
      );

      if (isImageFile(file)) {
        fetchFileContent(fileId);
      }

      if (!completed) {
        // Upload was cancelled during completion
        return;
      }

      // Update final state
      setUploads((prev) =>
        prev.map((item) =>
          item.id === fileId
            ? {
                ...item,
                state: UploadState.COMPLETED,
                progress: 100,
              }
            : item
        )
      );

      // Generate URL for the uploaded file
      fetchFileUrl(fileId);

      message.success(`File ${file.name} uploaded successfully`);
    } catch (error) {
      console.error(`Error uploading file ${file.name}:`, error);

      setUploads((prev) =>
        prev.map((item) =>
          item.id === fileId
            ? {
                ...item,
                state: UploadState.FAILED,
                error: (error as Error).message,
              }
            : item
        )
      );

      message.error(
        `Failed to upload ${file.name}: ${(error as Error).message}`
      );
    } finally {
      // Clean up the abort controller
      delete activeCancelTokens.current[fileId];
    }
  };

  const handlePreviewCancel = () => {
    setPreviewVisible(false);
  };

  // Upload all selected files
  const handleUpload = async () => {
    if (fileList.length === 0) {
      message.warning("Please select files first");
      return;
    }

    for (const file of fileList) {
      await uploadFile(file);
    }

    // Clear file list after starting uploads
    setFileList([]);
  };

  // Fetch URL for a completed file
  const fetchFileUrl = async (fileId: string) => {
    try {
      // Fetch the file metadata
      const response = await fetch(
        `${API_BASE_URL}/directory/raw_download/meta?file_id=${fileId}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${API_KEY}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch file URL: ${response.statusText}`);
      }

      // Create a URL that would be used to access the file
      const fileUrl = `${API_BASE_URL}/directory/raw_download?file_id=${fileId}`;

      // Update the URL in the uploads state
      setUploads((prev) =>
        prev.map((item) =>
          item.id === fileId ? { ...item, url: fileUrl } : item
        )
      );

      return fileUrl;
    } catch (error) {
      console.error(`Error fetching URL for ${fileId}:`, error);
      return null;
    }
  };

  // Cancel an upload
  const handleCancelUpload = (id: string) => {
    const abortController = activeCancelTokens.current[id];

    if (abortController) {
      abortController.abort();
      delete activeCancelTokens.current[id];
    }

    setUploads((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, state: UploadState.CANCELLED } : item
      )
    );

    message.info(
      `Upload cancelled for file: ${uploads.find((item) => item.id === id)?.file.name}`
    );
  };

  // Clear finished uploads
  const clearFinishedUploads = () => {
    uploads.forEach((item) => {
      if (
        (item.state === UploadState.COMPLETED ||
          item.state === UploadState.FAILED ||
          item.state === UploadState.CANCELLED) &&
        item.blobUrl
      ) {
        URL.revokeObjectURL(item.blobUrl);
      }
    });
    setUploads((prev) =>
      prev.filter(
        (item) =>
          ![
            UploadState.COMPLETED,
            UploadState.FAILED,
            UploadState.CANCELLED,
          ].includes(item.state)
      )
    );
  };

  // Cancel all active uploads
  const cancelAllUploads = () => {
    // Abort all pending uploads
    Object.values(activeCancelTokens.current).forEach((controller) => {
      controller.abort();
    });

    // Clear the abort controllers
    activeCancelTokens.current = {};

    // Update all active uploads to cancelled
    setUploads((prev) =>
      prev.map((item) =>
        [UploadState.ACTIVE, UploadState.QUEUED].includes(item.state)
          ? { ...item, state: UploadState.CANCELLED }
          : item
      )
    );

    message.info("All uploads cancelled");
  };

  // Download a file
  const handleDownloadFile = async (fileId: string, fileName: string) => {
    try {
      // 1. Fetch metadata
      const metaRes = await fetch(
        `${API_BASE_URL}/directory/raw_download/meta?file_id=${fileId}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${API_KEY}`,
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
          `${API_BASE_URL}/directory/raw_download/chunk?file_id=${fileId}&chunk_index=${i}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${API_KEY}`,
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

      // 3. Create blob and download
      const blob = new Blob([allBytes]);
      const downloadUrl = URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = downloadUrl;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();

      // Clean up
      setTimeout(() => {
        document.body.removeChild(a);
        URL.revokeObjectURL(downloadUrl);
      }, 100);

      message.success(`File ${fileName} downloaded successfully`);
    } catch (error) {
      console.error("Error downloading file:", error);
      message.error(`Failed to download file: ${(error as Error).message}`);
    }
  };

  // Preview an image file
  // Handle preview for image files
  const handlePreviewImage = async (fileId: string, fileName: string) => {
    try {
      message.loading({ content: "Loading preview...", key: "preview" });

      // Find the file in uploads
      const file = uploads.find((item) => item.id === fileId);
      if (!file) {
        throw new Error("File not found");
      }

      // Get or create blob URL
      let blobUrl = file.blobUrl;
      if (!blobUrl) {
        blobUrl = (await fetchFileContent(fileId)) || undefined;
      }

      if (!blobUrl) {
        throw new Error("Failed to load preview");
      }

      // Set preview state
      setPreviewImage(blobUrl);
      setPreviewTitle(fileName);
      setPreviewVisible(true);
      message.success({ content: "Preview loaded", key: "preview" });
    } catch (error) {
      console.error("Error preparing image preview:", error);
      message.error({
        content: `Failed to preview image: ${(error as Error).message}`,
        key: "preview",
      });
    }
  };

  // Get file icon based on type
  const getFileIcon = (file: File) => {
    const type = file.type;

    if (type.startsWith("image/")) {
      return <FileImageOutlined />;
    } else if (type.includes("pdf")) {
      return <FilePdfOutlined />;
    } else if (
      type.includes("zip") ||
      type.includes("rar") ||
      type.includes("tar") ||
      type.includes("gzip")
    ) {
      return <FileZipOutlined />;
    } else if (type.startsWith("text/") || type.includes("document")) {
      return <FileTextOutlined />;
    } else {
      return <FileUnknownOutlined />;
    }
  };

  // Get tag color based on upload state
  const getStateTagColor = (state: UploadState) => {
    switch (state) {
      case UploadState.ACTIVE:
        return "processing";
      case UploadState.COMPLETED:
        return "success";
      case UploadState.PAUSED:
        return "warning";
      case UploadState.FAILED:
        return "error";
      case UploadState.CANCELLED:
        return "default";
      case UploadState.QUEUED:
        return "blue";
      default:
        return "blue";
    }
  };

  // Format bytes to human-readable format
  const formatBytes = (bytes: number, decimals = 2) => {
    if (bytes === 0) return "0 Bytes";

    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ["Bytes", "KB", "MB", "GB", "TB"];

    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
  };

  // Check if a file is an image based on its type
  const isImageFile = (file: File) => {
    return file.type.startsWith("image/");
  };

  // Calculate overall stats
  const stats = {
    total: uploads.length,
    active: uploads.filter((item) => item.state === UploadState.ACTIVE).length,
    completed: uploads.filter((item) => item.state === UploadState.COMPLETED)
      .length,
    failed: uploads.filter((item) => item.state === UploadState.FAILED).length,
    cancelled: uploads.filter((item) => item.state === UploadState.CANCELLED)
      .length,
    queued: uploads.filter((item) => item.state === UploadState.QUEUED).length,
  };

  // Table columns
  const columns = [
    {
      title: "File",
      key: "file",
      render: (item: UploadItem) => {
        const file = item.file;
        const isCompleted = item.state === UploadState.COMPLETED;
        const isImage = isImageFile(file);
        const fileUrl = item.url;

        if (isCompleted && isImage && fileUrl) {
          return (
            <Space>
              {getFileIcon(file)}
              <span style={{ cursor: "pointer", color: "#1890ff" }}>
                {file.name}
              </span>
            </Space>
          );
        }

        return (
          <Space>
            {getFileIcon(file)}
            <span>{file.name}</span>
          </Space>
        );
      },
    },
    {
      title: "Size",
      key: "size",
      render: (item: UploadItem) => formatBytes(item.file.size),
    },
    {
      title: "Status",
      key: "state",
      render: (item: UploadItem) => (
        <Tag color={getStateTagColor(item.state)}>
          {item.state.toUpperCase()}
        </Tag>
      ),
    },
    {
      title: "Progress",
      key: "progress",
      render: (item: UploadItem) => (
        <Progress
          percent={item.progress}
          size="small"
          status={item.state === UploadState.FAILED ? "exception" : undefined}
        />
      ),
    },
    {
      title: "Actions",
      key: "actions",
      render: (item: UploadItem) => {
        const canCancel =
          item.state === UploadState.ACTIVE ||
          item.state === UploadState.QUEUED;
        const isCompleted = item.state === UploadState.COMPLETED;
        const fileUrl = item.url;
        const isImage = isImageFile(item.file);

        return (
          <Space size="small">
            {canCancel && (
              <Button
                icon={<DeleteOutlined />}
                onClick={() => handleCancelUpload(item.id)}
                size="small"
                danger
                type="text"
              />
            )}
            {isCompleted && (
              <>
                {isImage && (
                  <Button
                    icon={<EyeOutlined />}
                    onClick={() => handlePreviewImage(item.id, item.file.name)}
                    size="small"
                    type="text"
                  />
                )}
                <Button
                  icon={<DownloadOutlined />}
                  onClick={() => handleDownloadFile(item.id, item.file.name)}
                  size="small"
                  type="text"
                />
              </>
            )}
          </Space>
        );
      },
    },
  ];

  return (
    <Card
      title="Canister File Upload Demo"
      style={{ width: "100%", maxWidth: 800, margin: "0 auto" }}
    >
      <Space direction="vertical" size="large" style={{ width: "100%" }}>
        {/* File selection */}
        <div>
          <Title level={4}>Select Files</Title>
          <Space>
            <Button
              icon={<UploadOutlined />}
              onClick={() => fileInputRef.current?.click()}
            >
              Select Files
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              onChange={handleFileSelect}
              style={{ display: "none" }}
            />
            <Button
              type="primary"
              onClick={handleUpload}
              disabled={fileList.length === 0}
            >
              Upload to Canister
            </Button>
          </Space>
          {fileList.length > 0 && (
            <div style={{ marginTop: 16 }}>
              <Text>{fileList.length} file(s) selected</Text>
              <ul>
                {fileList.map((file, index) => (
                  <li key={index}>
                    {file.name} - {formatBytes(file.size)}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <Divider />

        {/* Upload progress summary */}
        <div>
          <Title level={4}>Upload Progress</Title>
          <Space style={{ marginBottom: 16 }}>
            <Button
              onClick={cancelAllUploads}
              disabled={stats.active + stats.queued === 0}
            >
              Cancel All Uploads
            </Button>
            <Button
              onClick={clearFinishedUploads}
              disabled={stats.completed + stats.failed + stats.cancelled === 0}
            >
              Clear Finished
            </Button>
          </Space>

          <div style={{ marginBottom: 16 }}>
            <Text>Overall Progress: {overallProgress}%</Text>
            <Progress percent={overallProgress} />
          </div>

          <Space style={{ marginBottom: 16 }}>
            <Tag color="blue">Total: {stats.total}</Tag>
            <Tag color="processing">Active: {stats.active}</Tag>
            <Tag color="success">Completed: {stats.completed}</Tag>
            <Tag color="error">Failed: {stats.failed}</Tag>
            <Tag color="default">Cancelled: {stats.cancelled}</Tag>
            <Tag color="blue">Queued: {stats.queued}</Tag>
          </Space>
        </div>

        <Divider />

        {/* Uploads list */}
        <div>
          <Title level={4}>Uploads</Title>
          <Table
            dataSource={uploads}
            columns={columns}
            rowKey="id"
            pagination={false}
            locale={{ emptyText: "No uploads in progress" }}
          />
        </div>
      </Space>
      <Modal
        visible={previewVisible}
        title={previewTitle}
        footer={null}
        onCancel={handlePreviewCancel}
      >
        {previewImage && (
          <img alt="Preview" style={{ width: "100%" }} src={previewImage} />
        )}
      </Modal>
    </Card>
  );
};

export default CanisterUploader;

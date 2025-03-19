import React, { useState, useRef, useEffect } from "react";
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
} from "@ant-design/icons";
import { useMultiUploader } from "../../framework/uploader/hook";
import {
  UploadState,
  UploadID,
  QueuedUploadItem,
} from "../../framework/uploader/types";
import { DiskTypeEnum } from "@officexapp/types";

const { Title, Text } = Typography;

/**
 * A demo component showcasing the usage of the MultiUploader framework
 * specifically with IndexedDB
 */
const SandboxUploader: React.FC = () => {
  const {
    uploadFile,
    uploadFiles,
    pauseUpload,
    resumeUpload,
    cancelUpload,
    clearFinishedUploads,
    pauseAllUploads,
    resumeAllUploads,
    currentUploads,
    progress,
    getFileUrl,
    isInitialized,
    uploadManager,
  } = useMultiUploader();

  const [fileList, setFileList] = useState<File[]>([]);
  const [urls, setUrls] = useState<Record<string, string>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [initializationStatus, setInitializationStatus] =
    useState("Initializing...");

  // Check initialization status
  useEffect(() => {
    if (isInitialized) {
      setInitializationStatus("Initialized");
      console.log("MultiUploader initialized successfully");
      console.log(
        "Available adapters:",
        uploadManager?.getRegisteredAdapters()
      );
    } else {
      setInitializationStatus("Not initialized");
    }
  }, [isInitialized, uploadManager]);

  // Update URLs for completed uploads
  useEffect(() => {
    const checkCompletedUploads = async () => {
      for (const upload of currentUploads) {
        if (upload.state === UploadState.COMPLETED && !urls[upload.id]) {
          try {
            const url = await getFileUrl(upload.id);
            if (url) {
              setUrls((prev) => ({ ...prev, [upload.id]: url }));
            }
          } catch (error) {
            console.error(`Error getting URL for ${upload.id}:`, error);
          }
        }
      }
    };

    checkCompletedUploads();
  }, [currentUploads, getFileUrl, urls]);

  // Handle file selection
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const filesArray = Array.from(e.target.files);
      setFileList((prev) => [...prev, ...filesArray]);
    }
  };

  // Upload selected files
  const handleUpload = () => {
    if (fileList.length === 0) {
      message.warning("Please select files first");
      return;
    }

    try {
      // Upload all files in the fileList
      const uploadIds = uploadFiles(
        fileList,
        "/uploads",
        DiskTypeEnum.BrowserCache,
        {
          onFileComplete: (id) => {
            message.success(`File uploaded successfully: ${id}`);
            fetchFileUrl(id);
          },
          onAllComplete: () => {
            message.success("All files uploaded successfully");
            setFileList([]);
          },
        }
      );

      console.log("Started uploads with IDs:", uploadIds);
    } catch (error) {
      console.error("Error starting uploads:", error);
      message.error("Failed to start uploads. Check console for details.");
    }
  };

  // Get file URL after upload is complete
  const fetchFileUrl = async (id: UploadID) => {
    try {
      const url = await getFileUrl(id);
      if (url) {
        setUrls((prev) => ({ ...prev, [id]: url }));
      }
    } catch (error) {
      console.error(`Error getting URL for ${id}:`, error);
    }
  };

  // Handle pause upload
  const handlePauseUpload = async (id: UploadID) => {
    try {
      const paused = await pauseUpload(id);
      if (paused) {
        message.info(`Upload paused: ${id}`);
      } else {
        message.error(`Failed to pause upload: ${id}`);
      }
    } catch (error) {
      console.error(`Error pausing upload ${id}:`, error);
      message.error("Failed to pause upload. Check console for details.");
    }
  };

  // Handle resume upload
  const handleResumeUpload = async (id: UploadID, item: QueuedUploadItem) => {
    try {
      const resumed = await resumeUpload(id, item.file);
      if (resumed) {
        message.info(`Upload resumed: ${id}`);
      } else {
        message.error(`Failed to resume upload: ${id}`);
      }
    } catch (error) {
      console.error(`Error resuming upload ${id}:`, error);
      message.error("Failed to resume upload. Check console for details.");
    }
  };

  // Handle cancel upload
  const handleCancelUpload = async (id: UploadID) => {
    try {
      const cancelled = await cancelUpload(id);
      if (cancelled) {
        message.info(`Upload cancelled: ${id}`);
      } else {
        message.error(`Failed to cancel upload: ${id}`);
      }
    } catch (error) {
      console.error(`Error cancelling upload ${id}:`, error);
      message.error("Failed to cancel upload. Check console for details.");
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

  // Table columns
  const columns = [
    {
      title: "File",
      dataIndex: "file",
      key: "file",
      render: (file: File) => (
        <Space>
          {getFileIcon(file)}
          <span>{file.name}</span>
        </Space>
      ),
    },
    {
      title: "Size",
      dataIndex: "file",
      key: "size",
      render: (file: File) => formatBytes(file.size),
    },
    {
      title: "Status",
      dataIndex: "state",
      key: "state",
      render: (state: UploadState) => (
        <Tag color={getStateTagColor(state)}>{state.toUpperCase()}</Tag>
      ),
    },
    {
      title: "Progress",
      key: "progress",
      render: (_: any, record: QueuedUploadItem) => {
        const uploadProgress = record.lastProgress?.progress || 0;
        return (
          <Progress
            percent={Math.floor(uploadProgress)}
            size="small"
            status={
              record.state === UploadState.FAILED ? "exception" : undefined
            }
          />
        );
      },
    },
    {
      title: "Actions",
      key: "actions",
      render: (_: any, record: QueuedUploadItem) => {
        const canPause = record.state === UploadState.ACTIVE;
        const canResume = record.state === UploadState.PAUSED;
        const canCancel =
          record.state === UploadState.ACTIVE ||
          record.state === UploadState.PAUSED;
        const isCompleted = record.state === UploadState.COMPLETED;

        return (
          <Space size="small">
            {canPause && (
              <Button
                icon={<PauseCircleOutlined />}
                onClick={() => handlePauseUpload(record.id)}
                size="small"
                type="text"
              />
            )}
            {canResume && (
              <Button
                icon={<PlayCircleOutlined />}
                onClick={() => handleResumeUpload(record.id, record)}
                size="small"
                type="text"
              />
            )}
            {canCancel && (
              <Button
                icon={<DeleteOutlined />}
                onClick={() => handleCancelUpload(record.id)}
                size="small"
                danger
                type="text"
              />
            )}
            {isCompleted && urls[record.id] && (
              <Button
                href={urls[record.id]}
                target="_blank"
                size="small"
                type="link"
              >
                View
              </Button>
            )}
          </Space>
        );
      },
    },
  ];

  return (
    <Card
      title="IndexedDB File Upload Demo"
      style={{ width: "100%", maxWidth: 800, margin: "0 auto" }}
    >
      <Space direction="vertical" size="large" style={{ width: "100%" }}>
        {/* Initialization status */}
        <div>
          <Tag
            color={isInitialized ? "success" : "warning"}
            style={{ marginBottom: 16 }}
          >
            Status: {initializationStatus}
          </Tag>
        </div>

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
              disabled={fileList.length === 0 || !isInitialized}
            >
              Upload to IndexedDB
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
              onClick={() => pauseAllUploads()}
              disabled={progress.activeFiles === 0}
            >
              Pause All
            </Button>
            <Button
              onClick={() => resumeAllUploads()}
              disabled={progress.pausedFiles === 0}
            >
              Resume All
            </Button>
            <Button
              onClick={() => clearFinishedUploads()}
              disabled={progress.completedFiles + progress.failedFiles === 0}
            >
              Clear Finished
            </Button>
          </Space>

          <div style={{ marginBottom: 16 }}>
            <Text>Overall Progress: {progress.overallProgress}%</Text>
            <Progress percent={progress.overallProgress} />
          </div>

          <Space style={{ marginBottom: 16 }}>
            <Tag color="blue">Total: {progress.totalFiles}</Tag>
            <Tag color="processing">Active: {progress.activeFiles}</Tag>
            <Tag color="success">Completed: {progress.completedFiles}</Tag>
            <Tag color="warning">Paused: {progress.pausedFiles}</Tag>
            <Tag color="error">Failed: {progress.failedFiles}</Tag>
          </Space>
        </div>

        <Divider />

        {/* Uploads list */}
        <div>
          <Title level={4}>Uploads</Title>
          <Table
            dataSource={currentUploads}
            columns={columns}
            rowKey="id"
            pagination={false}
            locale={{ emptyText: "No uploads in progress" }}
          />
        </div>
      </Space>
    </Card>
  );
};

export default SandboxUploader;

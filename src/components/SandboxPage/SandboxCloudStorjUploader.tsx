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
import { useDispatch } from "react-redux";
import { DiskTypeEnum, GenerateID } from "@officexapp/types";
import { useMultiUploader } from "../../framework/uploader/hook";
import { CloudS3Adapter } from "../../framework/uploader/adapters/clouds3.adapter";
import { UploadState, QueuedUploadItem } from "../../framework/uploader/types";

const { Title, Text } = Typography;

// Configuration constants - replace with your actual values
const apiBaseUrl =
  "http://bw4dl-smaaa-aaaaa-qaacq-cai.localhost:8000/v1/default";
const apiKey =
  "eyJhdXRoX3R5cGUiOiJBUElfX0tFWSIsInZhbHVlIjoiMjgyYWIzNDZjNTg5YzdiYzY0MTdlNmQ1ODM5NGQ3ZjM0NTY3NTBjMjY5MDY2ZDNiNmYyZmNmYjgxNGJmMTkxNiJ9";
const diskId = "DiskID_aecad449-73ab-4945-a0c5-f94a24cf11c7";
const currentFolderId = "FolderID_dd97a4d6-f131-4b5b-97d1-15317afa38ce";
const maxChunkSize = 5 * 1024 * 1024; // 5MB chunks default
const rawUrlProxyPath = "/v1/default/directory/asset/";

/**
 * A component for uploading files to Cloud S3 using the MultiUploader framework
 */
const CloudS3Uploader = () => {
  const {
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
    registerAdapter,
  } = useMultiUploader();

  const dispatch = useDispatch();
  const [fileList, setFileList] = useState<File[]>([]);
  const [urls, setUrls] = useState<Record<string, string>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [adapterRegistered, setAdapterRegistered] = useState(false);
  const [previewVisible, setPreviewVisible] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [previewTitle, setPreviewTitle] = useState<string>("");

  // Register the Cloud S3 adapter when component initializes
  useEffect(() => {
    const initAdapter = async () => {
      if (isInitialized && !adapterRegistered) {
        try {
          // Create Cloud S3 adapter
          const cloudS3Adapter = new CloudS3Adapter();

          // Configuration for Cloud S3 adapter
          const cloudS3Config = {
            endpoint: apiBaseUrl,
            maxChunkSize: maxChunkSize,
            rawUrlProxyPath: rawUrlProxyPath,
            apiKey,
          };

          // Register the adapter
          await registerAdapter(
            cloudS3Adapter,
            DiskTypeEnum.StorjWeb3,
            diskId,
            cloudS3Config,
            3 // Concurrency
          );

          console.log("Cloud S3 adapter registered successfully");
          setAdapterRegistered(true);
        } catch (error) {
          console.error("Failed to register Cloud S3 adapter:", error);
          message.error("Failed to initialize Cloud S3 uploader");
        }
      }
    };

    initAdapter();
  }, [
    apiBaseUrl,
    diskId,
    isInitialized,
    adapterRegistered,
    registerAdapter,
    maxChunkSize,
  ]);

  // Update URLs for completed uploads
  useEffect(() => {
    const fetchUrls = async () => {
      for (const upload of currentUploads) {
        if (
          upload.state === UploadState.COMPLETED &&
          !urls[upload.id] &&
          upload.config.diskID === diskId // Only handle URLs for our disk
        ) {
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

    fetchUrls();
  }, [currentUploads, getFileUrl, urls, diskId]);

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
      // Upload all files in the fileList with Redux dispatch in metadata
      uploadFiles(
        fileList.map((file) => ({ file, fileID: GenerateID.File() })),
        currentFolderId,
        DiskTypeEnum.StorjWeb3,
        diskId,
        {
          metadata: {
            dispatch: dispatch,
          },
          onFileComplete: (id) => {
            message.success(`File upload completed successfully`);
            fetchFileUrl(id);
          },
          onAllComplete: () => {
            message.success("All files uploaded successfully");
            setFileList([]);
          },
        }
      );
    } catch (error) {
      console.error("Error starting uploads:", error);
      message.error("Failed to start uploads");
    }
  };

  // Get file URL after upload is complete
  const fetchFileUrl = async (id: string) => {
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
  const handlePauseUpload = async (id: string) => {
    try {
      const paused = await pauseUpload(id);
      if (paused) {
        message.info(`Upload paused`);
      } else {
        message.error(`Failed to pause upload`);
      }
    } catch (error) {
      console.error(`Error pausing upload ${id}:`, error);
      message.error("Failed to pause upload");
    }
  };

  // Handle resume upload
  const handleResumeUpload = async (id: string, item: QueuedUploadItem) => {
    try {
      const resumed = await resumeUpload(id, item.fileID, item.file);
      if (resumed) {
        message.info(`Upload resumed`);
      } else {
        message.error(`Failed to resume upload`);
      }
    } catch (error) {
      console.error(`Error resuming upload ${id}:`, error);
      message.error("Failed to resume upload");
    }
  };

  // Handle cancel upload
  const handleCancelUpload = async (id: string) => {
    try {
      const cancelled = await cancelUpload(id);
      if (cancelled) {
        // Cleanup URL if it exists
        if (urls[id]) {
          setUrls((prev) => {
            const newUrls = { ...prev };
            delete newUrls[id];
            return newUrls;
          });
        }
        message.info(`Upload cancelled`);
      } else {
        message.error(`Failed to cancel upload`);
      }
    } catch (error) {
      console.error(`Error cancelling upload ${id}:`, error);
      message.error("Failed to cancel upload");
    }
  };

  // Handle file download
  const handleDownloadFile = (id: string, fileName: string) => {
    const url = urls[id];
    console.log(`url=`, url);
    if (!url) {
      message.error("Download URL not available yet");
      return;
    }

    try {
      const link = document.createElement("a");
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();

      // Clean up after download starts
      setTimeout(() => {
        document.body.removeChild(link);
      }, 100);

      message.success(`Downloading ${fileName}`);
    } catch (error) {
      console.error("Error downloading file:", error);
      message.error("Failed to download file");
    }
  };

  // Preview an image file
  const handlePreviewImage = async (id: string, fileName: string) => {
    try {
      message.loading({ content: "Loading preview...", key: "preview" });

      // Get the URL if we don't already have it
      let imageUrl = urls[id];
      if (!imageUrl) {
        imageUrl = (await getFileUrl(id)) || "";
        if (imageUrl) {
          setUrls((prev) => ({ ...prev, [id]: imageUrl }));
        }
      }

      if (!imageUrl) {
        throw new Error("Failed to load preview");
      }

      // Set preview state
      setPreviewImage(imageUrl);
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

  const handlePreviewCancel = () => {
    setPreviewVisible(false);
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

  // Filter uploads for this disk ID only
  const filteredUploads = currentUploads.filter(
    (upload) => upload.config.diskID === diskId
  );

  // Table columns
  const columns = [
    {
      title: "File",
      key: "file",
      render: (record: QueuedUploadItem) => {
        const file = record.file;
        const isCompleted = record.state === UploadState.COMPLETED;
        const isImage = isImageFile(file);
        const fileUrl = urls[record.id];

        if (isCompleted && isImage && fileUrl) {
          return (
            <Space>
              {getFileIcon(file)}
              <span
                style={{ cursor: "pointer", color: "#1890ff" }}
                onClick={() => handlePreviewImage(record.id, file.name)}
              >
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
      render: (record: QueuedUploadItem) => formatBytes(record.file.size),
    },
    {
      title: "Status",
      key: "state",
      render: (record: QueuedUploadItem) => (
        <Tag color={getStateTagColor(record.state)}>
          {record.state.toUpperCase()}
        </Tag>
      ),
    },
    {
      title: "Progress",
      key: "progress",
      render: (record: QueuedUploadItem) => {
        // Calculate progress percentage
        let uploadProgress = 0;
        if (record.lastProgress) {
          uploadProgress = record.lastProgress.progress;
        } else if (record.state === UploadState.COMPLETED) {
          uploadProgress = 100;
        }

        return (
          <Progress
            percent={uploadProgress}
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
      render: (record: QueuedUploadItem) => {
        const canPause = record.state === UploadState.ACTIVE;
        const canResume = record.state === UploadState.PAUSED;
        const canCancel =
          record.state === UploadState.ACTIVE ||
          record.state === UploadState.QUEUED ||
          record.state === UploadState.PAUSED;
        const isCompleted = record.state === UploadState.COMPLETED;
        const fileUrl = urls[record.id];
        const isImage = isImageFile(record.file);

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
            {isCompleted && (
              <>
                {isImage && fileUrl && (
                  <Button
                    icon={<EyeOutlined />}
                    onClick={() =>
                      handlePreviewImage(record.id, record.file.name)
                    }
                    size="small"
                    type="text"
                  />
                )}
                <Button
                  icon={<DownloadOutlined />}
                  onClick={() =>
                    handleDownloadFile(record.id, record.file.name)
                  }
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

  // Clean up function to revoke object URLs on unmount
  useEffect(() => {
    return () => {
      // Clean up URLs when component unmounts
      Object.values(urls).forEach((url) => {
        URL.revokeObjectURL(url);
      });
    };
  }, [urls]);

  return (
    <Card
      title="Cloud S3 File Upload"
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
              disabled={!adapterRegistered}
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
              disabled={fileList.length === 0 || !adapterRegistered}
            >
              Upload to Cloud S3
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
              Pause All Uploads
            </Button>
            <Button
              onClick={() => resumeAllUploads()}
              disabled={progress.pausedFiles === 0}
            >
              Resume All
            </Button>
            <Button
              onClick={() => clearFinishedUploads()}
              disabled={
                progress.completedFiles +
                  progress.failedFiles +
                  progress.cancelledFiles ===
                0
              }
            >
              Clear Finished
            </Button>
          </Space>

          <div style={{ marginBottom: 16 }}>
            <Text>Overall Progress: {progress.overallProgress}%</Text>
            <Progress percent={progress.overallProgress} />
          </div>

          <Space style={{ marginBottom: 16 }}>
            <Tag color="blue">Total: {filteredUploads.length}</Tag>
            <Tag color="processing">
              Active:{" "}
              {
                filteredUploads.filter((u) => u.state === UploadState.ACTIVE)
                  .length
              }
            </Tag>
            <Tag color="success">
              Completed:{" "}
              {
                filteredUploads.filter((u) => u.state === UploadState.COMPLETED)
                  .length
              }
            </Tag>
            <Tag color="warning">
              Paused:{" "}
              {
                filteredUploads.filter((u) => u.state === UploadState.PAUSED)
                  .length
              }
            </Tag>
            <Tag color="error">
              Failed:{" "}
              {
                filteredUploads.filter((u) => u.state === UploadState.FAILED)
                  .length
              }
            </Tag>
            <Tag color="default">
              Cancelled:{" "}
              {
                filteredUploads.filter((u) => u.state === UploadState.CANCELLED)
                  .length
              }
            </Tag>
            <Tag color="blue">
              Queued:{" "}
              {
                filteredUploads.filter((u) => u.state === UploadState.QUEUED)
                  .length
              }
            </Tag>
          </Space>
        </div>

        <Divider />

        {/* Uploads list */}
        <div>
          <Title level={4}>Uploads</Title>
          <Table
            dataSource={filteredUploads}
            columns={columns}
            rowKey="id"
            pagination={false}
            locale={{ emptyText: "No uploads in progress" }}
          />
        </div>
      </Space>

      {/* Image preview modal */}
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

export default CloudS3Uploader;

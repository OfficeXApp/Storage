// FilePage.tsx

import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Modal,
  Button,
  Result,
  Typography,
  Table,
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
  DownloadOutlined,
  ShareAltOutlined,
  LinkOutlined,
  EditOutlined,
  CheckOutlined,
  ShrinkOutlined,
  ArrowsAltOutlined,
} from "@ant-design/icons";
import {
  FileMetadata,
  FileUUID,
  Identity,
  StorageLocationEnum,
  useDrive,
} from "@officexapp/framework";
import useScreenType from "react-screentype-hook";
import { useNavigate } from "react-router-dom";
import FilePreview from "../FilePreview";
import { createPseudoShareLink } from "../../api/pseudo-share";
import mixpanel from "mixpanel-browser";
import { isFreeTrialStorj } from "../../api/storj";

const { Text } = Typography;
const { useIdentity } = Identity;

interface FilePreviewProps {
  file: FileMetadata;
}

const FilePage: React.FC<FilePreviewProps> = ({ file }) => {
  const screenType = useScreenType();
  const isMobile = screenType.isMobile;
  const [fileName, setFileName] = useState(
    file.originalFileName || "Unknown File"
  );
  const [isUpdatingName, setIsUpdatingName] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const {
    renameFilePath,
    indexdbGetFileUrl,
    indexdbDownloadFile,
    indexdbGetVideoStream,
  } = useDrive();
  const { evmSlug, evmAccount, icpAccount } = useIdentity();

  const [fileUrl, setFileUrl] = useState<string>("");
  const [isModalVisible, setIsModalVisible] = useState<boolean>(true);
  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaSourceRef = useRef<MediaSource | null>(null);
  const sourceBufferRef = useRef<SourceBuffer | null>(null);
  const [videoBlob, setVideoBlob] = useState<Blob | null>(null);

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [isGeneratingShareLink, setIsGeneratingShareLink] = useState(false);

  const getFileType = ():
    | "image"
    | "video"
    | "audio"
    | "pdf"
    | "spreadsheet"
    | "other" => {
    const name = file.originalFileName || "";
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
  const fileType = getFileType();

  useEffect(() => {
    if (
      isModalVisible &&
      file.storageLocation === StorageLocationEnum.BrowserCache &&
      fileType === "video"
    ) {
      loadVideoAsBlob();
    }
  }, [isModalVisible, file]);

  const loadVideoAsBlob = async () => {
    setIsLoading(true);

    try {
      const stream = await indexdbGetVideoStream(file.id as FileUUID);
      const reader = stream.getReader();
      const chunks: Uint8Array[] = [];

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        chunks.push(value);
      }

      const blob = new Blob(chunks, { type: `video/${file.extension}` });
      setVideoBlob(blob);

      setIsLoading(false);
    } catch (error) {
      console.error("Error loading video as blob:", error);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const loadFileContent = async () => {
      setIsLoading(true);
      try {
        if (file.storageLocation === StorageLocationEnum.BrowserCache) {
          const url = await indexdbGetFileUrl(file.id as FileUUID);
          setFileUrl(url);
        } else if (file.storageLocation === StorageLocationEnum.Web3Storj) {
          setFileUrl(file.rawURL as string);
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

    setFileName(file.originalFileName || "Unknown File");

    // Cleanup function
    return () => {
      if (mediaSourceRef.current) {
        if (mediaSourceRef.current.readyState === "open") {
          mediaSourceRef.current.endOfStream();
        }
        URL.revokeObjectURL(videoRef.current?.src || "");
      }
      sourceBufferRef.current = null;
    };
  }, [file, fileType, indexdbGetFileUrl, indexdbGetVideoStream]);

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
      const oldName = file.originalFileName;
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
      title: `${isFreeTrialStorj() ? `Expires in 24 hours - ` : ``}${file.originalFileName}`,
      url,
      ref: evmAccount?.address || "",
    });
    message.info("Link copied to clipboard");
    navigator.clipboard.writeText(shareLink);
    setIsGeneratingShareLink(false);
    mixpanel.track("Share File", {
      "File Type": file.originalFileName.split(".").pop(),
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
        subTitle={`File Size: ${formatFileSize(file.fileSize)}`}
        extra={[
          <a
            key="download2"
            href={fileUrl}
            download={file.originalFileName}
            target={file.extension.toLowerCase() === "pdf" ? "_blank" : "_self"}
          >
            <Button
              onClick={() => {
                mixpanel.track("Download File", {
                  "File Type": file.originalFileName.split(".").pop(),
                });
              }}
              type="primary"
              key="download2"
            >
              Download
            </Button>
          </a>,
          <Button
            key="preview2"
            onClick={() => setIsModalVisible(true)}
            disabled={fileType === "other"}
          >
            Preview
          </Button>,
          <Button
            key="share2"
            onClick={() => handleShare(file.rawURL)}
            disabled={!file.rawURL}
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
          <FilePreview file={file} />
        </Modal>
      )}
    </>
  );
};

export default FilePage;

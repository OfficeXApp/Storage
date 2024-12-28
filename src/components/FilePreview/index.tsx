// FilePreview.tsx

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
} from "../../framework";
import useScreenType from "react-screentype-hook";
import { useNavigate } from "react-router-dom";
import SheetJSPreview from "../SheetJSPreview";
import { createPseudoShareLink } from "../../api/pseudo-share";
import mixpanel from "mixpanel-browser";
import { isFreeTrialStorj } from "../../api/storj";

const { Text } = Typography;
const { useIdentity } = Identity;

interface FilePreviewProps {
  file: FileMetadata;
  showButtons?: boolean;
}

const FilePreview: React.FC<FilePreviewProps> = ({
  file,
  showButtons = true,
}) => {
  const screenType = useScreenType();
  const isMobile = screenType.isMobile;
  const [fileName, setFileName] = useState(
    file.originalFileName || "Unknown File"
  );
  const [isGeneratingShareLink, setIsGeneratingShareLink] = useState(false);
  const [isUpdatingName, setIsUpdatingName] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const { evmSlug, evmAccount, icpAccount } = useIdentity();
  const {
    renameFilePath,
    indexdbGetFileUrl,
    indexdbDownloadFile,
    indexdbGetVideoStream,
  } = useDrive();

  const [fileUrl, setFileUrl] = useState<string>("");
  const [isModalVisible, setIsModalVisible] = useState<boolean>(true);
  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaSourceRef = useRef<MediaSource | null>(null);
  const sourceBufferRef = useRef<SourceBuffer | null>(null);
  const [videoBlob, setVideoBlob] = useState<Blob | null>(null);

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isExpanded, setIsExpanded] = useState<boolean>(false);

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
      if (window.location.pathname === "/gift") {
        setFileUrl(file.rawURL as string);
        return;
      }
      setIsLoading(true);
      try {
        if (file.storageLocation === StorageLocationEnum.BrowserCache) {
          const url = await indexdbGetFileUrl(file.id as FileUUID);
          setFileUrl(url);
        } else if (file.storageLocation === StorageLocationEnum.Web3Storj) {
          console.log(`setFileUrl Web3Storj`, file);
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

  const handleRaw = () => {
    if (file.rawURL) {
      window.open(file.rawURL as string, "_blank");
    } else {
      message.error("No raw URL available");
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

  const renderContent = () => {
    const containerStyle: React.CSSProperties = {
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      width: "100%",
      height: "100%",
      position: "relative",
      background: "rgba(0,0,0,0.02)",
      minHeight: "200px",
    };

    const mediaStyle: React.CSSProperties = {
      maxWidth: isExpanded ? "none" : "100%",
      maxHeight: isExpanded ? "none" : "80vh",
      width: isExpanded ? "100%" : "auto",
      height: isExpanded ? "auto" : "auto",
      objectFit: isExpanded ? "contain" : "contain",
    };

    switch (fileType) {
      case "image":
        return (
          <div style={containerStyle}>
            {isLoading && (
              <div
                style={{
                  position: "absolute",
                  top: "50%",
                  left: "50%",
                  transform: "translate(-50%, -50%)",
                }}
              >
                <Spin size="large" />
              </div>
            )}
            <img
              src={fileUrl}
              alt={fileName || "Image"}
              style={mediaStyle}
              onLoad={() => setIsLoading(false)}
            />
          </div>
        );
      case "video":
        return (
          <div style={containerStyle}>
            {isLoading && (
              <div
                style={{
                  position: "absolute",
                  top: "50%",
                  left: "50%",
                  transform: "translate(-50%, -50%)",
                }}
              >
                <Spin size="large" />
              </div>
            )}
            {file.storageLocation === StorageLocationEnum.BrowserCache ? (
              <>
                {videoBlob ? (
                  <video
                    src={URL.createObjectURL(videoBlob)}
                    controls
                    style={mediaStyle}
                    onLoadedMetadata={() => setIsLoading(false)}
                  />
                ) : (
                  <div>Loading video...</div>
                )}
              </>
            ) : (
              <video src={fileUrl} controls style={mediaStyle} />
            )}
          </div>
        );
      case "audio":
        return (
          <div style={containerStyle}>
            <audio src={fileUrl} controls />
          </div>
        );
      case "spreadsheet":
        return (
          <div style={containerStyle}>
            <SheetJSPreview file={file} showButtons={showButtons} />
          </div>
        );
      case "pdf":
        return (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              width: "100%",
            }}
          >
            {isMobile && <span>Click download to view entire file</span>}
            <iframe
              src={`${fileUrl}#navpanes=${isMobile ? "1" : "0"}`}
              style={{ width: "100%", height: "80vh" }}
              title={file.originalFileName}
            />
          </div>
        );
      default:
        return (
          <div style={containerStyle}>
            <Result
              icon={<FileUnknownOutlined />}
              title="Preview Unavailable"
              extra={
                showButtons
                  ? [
                      <div key="download">
                        <a
                          href={fileUrl}
                          target={
                            file.extension.toLowerCase() === "pdf"
                              ? "_blank"
                              : "_self"
                          }
                          download={file.originalFileName}
                        >
                          <Button
                            onClick={() => {
                              mixpanel.track("Download File", {
                                "File Type": file.originalFileName
                                  .split(".")
                                  .pop(),
                              });
                            }}
                            key="download1"
                          >
                            Download
                          </Button>
                        </a>
                      </div>,
                    ]
                  : []
              }
            />
          </div>
        );
    }
  };

  return (
    <>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        {showButtons && (
          <div style={{ display: "flex", flexDirection: "row", gap: 5 }}>
            <a
              href={fileUrl}
              download={file.originalFileName}
              target={
                file.extension.toLowerCase() === "pdf" ? "_blank" : "_self"
              }
            >
              <Button
                type="primary"
                icon={<DownloadOutlined />}
                size="small"
                onClick={() => {
                  mixpanel.track("Download File", {
                    "File Type": file.originalFileName.split(".").pop(),
                  });
                }}
              >
                Download
              </Button>
            </a>
            <Button
              icon={<ShareAltOutlined />}
              size="small"
              onClick={() => handleShare(fileUrl)}
              disabled={!fileUrl}
              loading={isGeneratingShareLink}
            >
              Share
            </Button>
            {file.rawURL && (
              <a href={file.rawURL} target="_blank" rel="noreferrer">
                <Button
                  type="link"
                  onClick={handleRaw}
                  icon={<LinkOutlined />}
                  size="small"
                  disabled={
                    file.storageLocation === StorageLocationEnum.BrowserCache
                  }
                >
                  Raw
                </Button>
              </a>
            )}
          </div>
        )}
      </div>
      <div
        style={{
          marginTop: 32,
          marginBottom: 16,
          textAlign: "center",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        {showButtons && <Text strong>{fileName}</Text>}
        {showButtons && (fileType === "image" || fileType === "video") && (
          <Tooltip title={isExpanded ? "Shrink" : "Expand"}>
            <Button
              type="link"
              icon={isExpanded ? <ShrinkOutlined /> : <ArrowsAltOutlined />}
              onClick={() => setIsExpanded(!isExpanded)}
            />
          </Tooltip>
        )}
      </div>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          padding: isLoading ? (showButtons ? 100 : 0) : 0,
        }}
      >
        {renderContent()}
      </div>
    </>
  );
};

export default FilePreview;

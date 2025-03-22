import React, { useState, useEffect, useRef, useMemo } from "react";
import { useMultiUploader } from "../../framework/uploader/hook";

import {
  Upload,
  Button,
  Progress,
  List,
  Typography,
  Dropdown,
  Menu,
  Result,
} from "antd";
import {
  UploadOutlined,
  EllipsisOutlined,
  ExpandAltOutlined,
  ShrinkOutlined,
  FileOutlined,
  CloudUploadOutlined,
  LoadingOutlined,
  CheckCircleFilled,
  ClearOutlined,
  FolderOutlined,
} from "@ant-design/icons";
import type { UploadFile } from "antd/es/upload/interface";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { v4 as uuidv4 } from "uuid";
import UploadDropZone from "../UploadDropZone";
import useScreenType from "react-screentype-hook";
import mixpanel from "mixpanel-browser";
import { DiskTypeEnum, FileID, UserID } from "@officexapp/types";

const { Text } = Typography;

const UploadPanel: React.FC<{
  children: React.ReactNode;
  uploadPanelVisible: boolean;
  setUploadPanelVisible: (bool: boolean) => void;
}> = ({ children, uploadPanelVisible, setUploadPanelVisible }) => {
  const {
    uploadFiles,
    currentUploads,
    clearFinishedUploads,
    progress: uploadProgress,
    uploadTargetDisk,
    uploadTargetFolderID,
  } = useMultiUploader();

  const screenType = useScreenType();
  const [selectedFiles, setSelectedFiles] = useState<UploadFile[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const folderInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const location = useLocation();

  const getUploadFolderPath = () => {
    // Get the current folder path
    const uploadPath = uploadTargetFolderID ? `/${uploadTargetFolderID}` : "/";

    // Get the storage location (disk type)
    const diskType = uploadTargetDisk
      ? (uploadTargetDisk.disk_type as DiskTypeEnum)
      : DiskTypeEnum.BrowserCache;
    const diskID = uploadTargetDisk ? uploadTargetDisk.id : undefined;

    return {
      uploadFolderPath: uploadPath,
      storageLocation: diskType,
      diskID,
    };
  };

  const handleFileSelect = (files: FileList | null) => {
    if (files) {
      const fileArray = Array.from(files);
      setSelectedFiles(
        fileArray.map((file) => ({
          uid: file.name,
          name: file.name,
          status: "uploading",
        }))
      );

      const { uploadFolderPath, storageLocation, diskID } =
        getUploadFolderPath();
      console.log(`uploadFolderPath: ${uploadFolderPath}`);

      // Create an array of file objects with generated FileIDs
      const uploadFilesArray = fileArray.map((file) => ({
        file,
        fileID: `FileID_${uuidv4()}` as FileID,
      }));

      // Use uploadFiles from useMultiUploader
      if (diskID) {
        uploadFiles(
          uploadFilesArray,
          uploadFolderPath,
          storageLocation,
          diskID,
          {
            onFileComplete: (fileUUID) => {
              console.log(`Local callback: File ${fileUUID} upload completed`);
            },
          }
        );
      } else {
        console.error("No disk ID available for upload");
      }
    }
  };

  const handleUploadFiles = () => {
    mixpanel.track("Upload Files");
    fileInputRef.current?.click();
  };

  const handleUploadFolder = () => {
    mixpanel.track("Upload Files");
    folderInputRef.current?.click();
  };

  const handleClearQueue = () => {
    clearFinishedUploads();
    setSelectedFiles([]);
  };

  const handleViewFile = (
    filePath: string,
    storageLocation: DiskTypeEnum,
    diskID: string
  ) => {
    const basePath = `/drive/${diskID}`;
    return `${basePath}${filePath}`;
  };

  const menuItems = (
    filePath: string,
    storageLocation: DiskTypeEnum,
    diskID: string
  ) => [
    {
      key: "1",
      label: (
        <Link to={handleViewFile(filePath, storageLocation, diskID)}>
          View File
        </Link>
      ),
    },
  ];

  const getUploadState = () => {
    if (uploadProgress.totalFiles === 0) {
      return "empty";
    } else if (uploadProgress.completedFiles < uploadProgress.totalFiles) {
      return "uploading";
    } else {
      return "completed";
    }
  };

  const renderIcon = () => {
    const state = getUploadState();
    switch (state) {
      case "empty":
        return <CloudUploadOutlined style={{ marginRight: "10px" }} />;
      case "uploading":
        return <LoadingOutlined style={{ marginRight: "10px" }} spin />;
      case "completed":
        return (
          <CheckCircleFilled
            style={{ marginRight: "10px", color: "#52c41a" }}
          />
        );
    }
  };

  useEffect(() => {
    // Check if all uploads are complete
    const allUploadsComplete = uploadProgress.overallProgress === 100;

    if (allUploadsComplete) {
      appendRefreshParam();
    }
  }, [uploadProgress]);

  const renderTitle = () => {
    const state = getUploadState();
    switch (state) {
      case "empty":
        return "Upload Files";
      case "uploading":
        return `Uploading ${uploadProgress.completedFiles} of ${uploadProgress.totalFiles}`;
      case "completed":
        return `${uploadProgress.completedFiles} Files Uploaded`;
    }
  };

  const appendRefreshParam = () => {
    const params = new URLSearchParams(location.search);
    params.set("refresh", uuidv4()); // Set or update the refresh parameter
    navigate(`${location.pathname}?${params.toString()}`, { replace: true }); // Update the URL
  };

  const renderUploadContent = () => (
    <div
      style={{
        padding: "10px",
        height: "calc(100% - 50px)",
        overflowY: "auto",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: "20px",
        }}
      >
        <div>
          <Button
            icon={<UploadOutlined />}
            onClick={handleUploadFiles}
            style={{ borderRadius: "5px 0px 0px 5px" }}
          >
            Upload Files
          </Button>
          <Button
            icon={<FolderOutlined />}
            onClick={handleUploadFolder}
            style={{ borderRadius: "0px 5px 5px 0px", marginLeft: "-1px" }}
          >
            Upload Folder
          </Button>
        </div>
        <Button icon={<ClearOutlined />} onClick={handleClearQueue}></Button>
      </div>
      <input
        type="file"
        ref={fileInputRef}
        style={{ display: "none" }}
        multiple
        onChange={(e) => handleFileSelect(e.target.files)}
      />
      <input
        type="file"
        ref={folderInputRef}
        style={{ display: "none" }}
        // @ts-ignore
        webkitdirectory="true"
        directory="true"
        multiple
        onChange={(e) => handleFileSelect(e.target.files)}
      />

      <UploadDropZone toggleUploadPanel={setUploadPanelVisible}>
        {currentUploads.length === 0 ? (
          <Result
            icon={
              <CloudUploadOutlined
                style={{ fontSize: "42px", color: "#8c8c8c" }}
              />
            } // Larger icon in gray
            title={
              <span
                style={{ color: "#595959", fontSize: "16px", fontWeight: 500 }}
              >
                Upload
              </span>
            }
            subTitle={
              <span
                style={{
                  color: "#8c8c8c",
                  fontSize: "12px",
                  marginTop: "8px",
                  display: "block",
                }}
              >
                Drag and drop files here to upload.
              </span>
            }
            style={{
              borderRadius: "12px", // Slightly round the corners
              width: "100%", // Take up more horizontal space
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              flex: 1,
              backgroundColor: "rgba(0, 0, 0, 0.02)",
            }}
          />
        ) : (
          <>
            <List
              size="small"
              dataSource={currentUploads}
              renderItem={(item) => (
                <Link
                  to={handleViewFile(
                    item.config.uploadPath,
                    item.config.diskType,
                    item.config.diskID
                  )}
                >
                  <List.Item
                    key={item.id}
                    onClick={() =>
                      handleViewFile(
                        item.config.uploadPath,
                        item.config.diskType,
                        item.config.diskID
                      )
                    }
                    actions={[
                      <Dropdown
                        menu={{
                          items: [], // menuItems(item.config.uploadPath, item.config.diskType, item.config.diskID),
                        }}
                        trigger={["click"]}
                      >
                        <Button
                          type="link"
                          icon={<EllipsisOutlined />}
                          size="large"
                          style={{ color: "black", marginRight: "-30px" }}
                        />
                      </Dropdown>,
                    ]}
                  >
                    <List.Item.Meta
                      avatar={<FileOutlined />}
                      title={item.file.name}
                      description={
                        <Progress
                          percent={
                            item.lastProgress ? item.lastProgress.progress : 0
                          }
                          size="small"
                        />
                      }
                    />
                  </List.Item>
                </Link>
              )}
            />
            <br />
            <br />
          </>
        )}
      </UploadDropZone>
    </div>
  );

  const renderMinimizedContent = () => (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 10px",
      }}
    >
      <Text>{renderTitle()}</Text>
    </div>
  );

  return (
    <>
      <div
        style={{
          position: "fixed",
          bottom: 0,
          right: screenType.isMobile ? 0 : 20,
          width: screenType.isMobile ? "100%" : "400px",
          backgroundColor: "white",
          boxShadow: "0 -2px 8px rgba(0,0,0,0.15)",
          borderRadius: "8px 8px 0 0",
          transition: "height 0.3s ease-in-out",
          height: uploadPanelVisible ? "600px" : "50px",
          overflow: "hidden",
          zIndex: 1000,
        }}
      >
        <div
          onClick={() => setUploadPanelVisible(!uploadPanelVisible)}
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "5px 10px",
            borderBottom: "1px solid #f0f0f0",
            height: "40px",
            cursor: "pointer",
          }}
        >
          <div style={{ display: "flex", alignItems: "center" }}>
            {renderIcon()}
            <Text strong>{renderTitle()}</Text>
          </div>
          <Button
            type="text"
            icon={
              uploadPanelVisible ? <ShrinkOutlined /> : <ExpandAltOutlined />
            }
            size="small"
          />
        </div>
        {uploadPanelVisible ? renderUploadContent() : renderMinimizedContent()}
      </div>
      {children}
    </>
  );
};

export default UploadPanel;

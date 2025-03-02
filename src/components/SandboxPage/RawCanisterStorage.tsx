import React, { useState, useEffect, useRef, useMemo } from "react";
import {
  StorageLocationEnum,
  useDrive,
  UserID,
  DriveDB,
  getUploadFolderPath,
} from "../../framework";
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
import UploadDropZone from "./UploadDropZone";
import useScreenType from "react-screentype-hook";
import mixpanel from "mixpanel-browser";

const { Text } = Typography;

const SandboxPage: React.FC<{
  uploadPanelVisible: boolean;
  setUploadPanelVisible: (bool: boolean) => void;
}> = ({ uploadPanelVisible, setUploadPanelVisible }) => {
  const {
    uploadFilesFolders,
    cancelUpload,
    cancelAllUploads,
    getUploadQueue,
    uploadProgress,
    clearQueue,
  } = useDrive();
  const screenType = useScreenType();
  const [selectedFiles, setSelectedFiles] = useState<UploadFile[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const folderInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const [imageUrl, setImageUrl] = useState("");

  const [tempFileId, setTempFileId] = useState<string | null>(null);

  const uploadQueue = getUploadQueue();

  const handleFileSelect = (files: FileList | null) => {
    const file = files?.[0];
    if (file) {
      uploadRawFile(file);
    }
  };

  const uploadRawFile = async (file: File) => {
    console.log("Uploading file", file);
    console.log("uploadRawFile: Preparing to upload file:", file.name);
    console.log("  size =", file.size, "bytes");
    console.log("  type =", file.type);

    const CHUNK_SIZE = 0.5 * 1024 * 1024;
    const fileId = crypto.randomUUID();
    const originalFilename = file.name;
    console.log(`fileId=`, fileId);
    setTempFileId(fileId);
    const totalChunks = Math.ceil(file.size / CHUNK_SIZE);

    for (let chunkIndex = 0; chunkIndex < totalChunks; chunkIndex++) {
      const start = chunkIndex * CHUNK_SIZE;
      const end = Math.min(start + CHUNK_SIZE, file.size);

      console.log(
        `uploadRawFile: Processing chunk #${chunkIndex} (start=${start}, end=${end})`
      );

      const chunk = file.slice(start, end);

      const chunkArrayBuffer = await chunk.arrayBuffer();
      const chunkData = Array.from(new Uint8Array(chunkArrayBuffer));

      console.log(
        `uploadRawFile: chunkIndex=${chunkIndex}, chunkData length=${chunkData.length}`
      );
      try {
        await uploadChunk(fileId, chunkIndex, chunkData, totalChunks);
      } catch (err) {
        console.error(`Failed to upload chunk ${chunkIndex}`, err);
        throw err;
      }
    }
    console.log(
      "uploadRawFile: All chunks uploaded, now calling completeUpload..."
    );

    return completeUpload(fileId, originalFilename);
  };

  const uploadChunk = async (
    fileId: string,
    chunkIndex: any,
    chunkData: any,
    totalChunks: any
  ) => {
    const response = await fetch(
      `http://bkyz2-fmaaa-aaaaa-qaaaq-cai.localhost:8000/directory/raw_upload/chunk`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          file_id: fileId,
          chunk_index: chunkIndex,
          chunk_data: chunkData,
          total_chunks: totalChunks,
        }),
      }
    );
    console.log(`uploadChunk: server responded with status ${response.status}`);
    if (!response.ok) {
      throw new Error(`Upload failed: ${response.statusText}`);
    }

    return response.json();
  };

  const completeUpload = async (fileId: string, filename: string) => {
    const response = await fetch(
      `http://bkyz2-fmaaa-aaaaa-qaaaq-cai.localhost:8000/directory/raw_upload/complete`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          file_id: fileId,
          filename,
        }),
      }
    );
    console.log(
      `completeUpload: server responded with status ${response.status}`
    );
    if (!response.ok) {
      throw new Error(`Complete upload failed: ${response.statusText}`);
    }

    return response.json();
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
    clearQueue();
    setSelectedFiles([]);
  };

  const handleViewFile = (
    filePath: string,
    storageLocation: StorageLocationEnum
  ) => {
    const basePath = `/drive/${storageLocation}`;
    // const folderPath = filePath.substring(0, filePath.lastIndexOf("/"));
    return `${basePath}${filePath}`;
  };

  const menuItems = (
    filePath: string,
    storageLocation: StorageLocationEnum
  ) => [
    {
      key: "1",
      label: (
        <Link to={handleViewFile(filePath, storageLocation)}>View File</Link>
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
    const allUploadsComplete = uploadProgress.percentage === 100;

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

  // chunked streaming write download is more memory efficient but requires filesystem permissions
  // async function downloadFile() {
  //   if (!tempFileId) {
  //     console.warn(
  //       "No tempFileId found. Upload a file first or set a valid file_id."
  //     );
  //     return;
  //   }

  //   try {
  //     // 1. Fetch metadata
  //     const metaRes = await fetch(
  //       `http://bkyz2-fmaaa-aaaaa-qaaaq-cai.localhost:8000/directory/raw_download/meta?file_id=${tempFileId}`
  //     );
  //     if (!metaRes.ok) {
  //       throw new Error(`Metadata request failed: ${metaRes.statusText}`);
  //     }

  //     const { file_id, total_size, total_chunks, filename } =
  //       await metaRes.json();

  //     // 2. Ask the user where they want to save the file:
  //     // @ts-ignore
  //     const fileHandle = await window.showSaveFilePicker({
  //       suggestedName: filename,
  //     });

  //     // 3. Create a writable stream to that file.
  //     const writable = await fileHandle.createWritable();

  //     try {
  //       // 4. Fetch each chunk in a loop, write directly to disk
  //       for (let i = 0; i < total_chunks; i++) {
  //         const chunkRes = await fetch(
  //           `http://bkyz2-fmaaa-aaaaa-qaaaq-cai.localhost:8000/directory/raw_download/chunk?file_id=${file_id}&chunk_index=${i}`
  //         );
  //         if (!chunkRes.ok) {
  //           throw new Error(
  //             `Chunk request #${i} failed: ${chunkRes.statusText}`
  //           );
  //         }

  //         // Read the chunk's bytes
  //         const chunkBuf = await chunkRes.arrayBuffer();

  //         // Write these bytes directly to disk
  //         await writable.write(chunkBuf);
  //       }
  //     } finally {
  //       // 5. Close the file once done (very important!)
  //       await writable.close();
  //     }

  //     console.log("Download completed successfully!");
  //   } catch (err) {
  //     console.error("Download failed:", err);
  //   }
  // }

  // chunked in-memory download is simpler no filesystem permissions required, but holds entire file in memory
  const downloadFile = async () => {
    if (!tempFileId) {
      console.warn(
        "No tempFileId found. Upload a file first or set a valid file_id."
      );
      return;
    }

    try {
      // 1. Fetch metadata
      const metaRes = await fetch(
        `http://bkyz2-fmaaa-aaaaa-qaaaq-cai.localhost:8000/directory/raw_download/meta?file_id=${tempFileId}`,
        {
          method: "GET",
        }
      );
      if (!metaRes.ok) {
        throw new Error(`Metadata request failed: ${metaRes.statusText}`);
      }
      // Read the response body *once*
      const meta = await metaRes.json();
      const { file_id, total_size, total_chunks, filename } = meta;
      console.log(
        `Download metadata => size: ${total_size}, chunks: ${total_chunks}`
      );

      // 2. Fetch all chunks in a loop
      let allBytes = new Uint8Array(total_size);
      let offset = 0;
      for (let i = 0; i < total_chunks; i++) {
        const chunkRes = await fetch(
          `http://bkyz2-fmaaa-aaaaa-qaaaq-cai.localhost:8000/directory/raw_download/chunk?file_id=${tempFileId}&chunk_index=${i}`
        );
        if (!chunkRes.ok) {
          throw new Error(`Chunk request #${i} failed: ${chunkRes.statusText}`);
        }
        const chunkBuf = await chunkRes.arrayBuffer();
        allBytes.set(new Uint8Array(chunkBuf), offset);
        offset += chunkBuf.byteLength;
      }

      // 3. Create a Blob from the combined data
      const blob = new Blob([allBytes]);

      // If it's an image, display it
      if (filename.match(/\.(jpg|jpeg|png|gif|webp)$/i)) {
        const url = URL.createObjectURL(blob);
        setImageUrl(url);
      }

      // 4. Trigger a download in the browser
      const downloadUrl = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = downloadUrl;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(downloadUrl);

      console.log("File downloaded successfully!");
    } catch (err) {
      console.error("Download failed:", err);
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
          {/* <Button
            icon={<FolderOutlined />}
            onClick={handleUploadFolder}
            style={{ borderRadius: "0px 5px 5px 0px", marginLeft: "-1px" }}
          >
            Upload Folder
          </Button> */}
          <Button
            icon={<FolderOutlined />}
            onClick={downloadFile}
            style={{ borderRadius: "0px 5px 5px 0px", marginLeft: "-1px" }}
          >
            Download File
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
        {imageUrl && (
          <div className="mt-4">
            <img
              src={imageUrl}
              alt="Preview"
              className="max-w-full h-auto rounded-lg shadow-lg"
            />
          </div>
        )}
        {uploadQueue.length === 0 ? (
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
              dataSource={uploadQueue}
              renderItem={(item) => (
                <Link to={handleViewFile(item.path, item.storageLocation)}>
                  <List.Item
                    key={item.id}
                    onClick={() =>
                      handleViewFile(item.path, item.storageLocation)
                    }
                    actions={[
                      <Dropdown
                        menu={{
                          items: [], // menuItems(item.path, item.storageLocation),
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
                      title={item.name}
                      description={
                        <Progress percent={item.progress} size="small" />
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
    </>
  );
};

export default SandboxPage;

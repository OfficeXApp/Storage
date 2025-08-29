import React, { useEffect, useRef, useState } from "react";
import { Button, List, message } from "antd";
import IndexedDBStorage from "./indexdb-storage";
import { FileMetadataFragment } from "../framework";
import toast from "react-hot-toast";

interface FileWithThumbnail extends FileMetadataFragment {
  thumbnailUrl?: string;
}

const BrowserSandbox: React.FC = () => {
  const storageRef = useRef<IndexedDBStorage>();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [lastProgress, setLastProgress] = useState<number>(0);
  const [finalMetadata, setFinalMetadata] =
    useState<FileMetadataFragment | null>(null);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [files, setFiles] = useState<FileWithThumbnail[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initStorage = async () => {
      try {
        const storage = IndexedDBStorage.getInstance();
        await storage.initialize();
        storageRef.current = storage;
      } catch (err) {
        setError(err instanceof Error ? err.message : String(err));
      }
    };
    initStorage();
  }, []);

  const listFiles = async () => {
    try {
      const fileList = await storageRef.current?.listFiles();
      if (fileList) {
        const filesWithThumbnails = await Promise.all(
          fileList.map(async (file) => {
            try {
              const thumbnailBlob = await storageRef.current?.getThumbnail(
                file.rawURL
              );
              if (thumbnailBlob) {
                return {
                  ...file,
                  thumbnailUrl: URL.createObjectURL(thumbnailBlob),
                };
              }
            } catch (error) {
              console.error("Error creating thumbnail URL:", error);
            }
            return file;
          })
        );
        setFiles(filesWithThumbnails);
      } else {
        setFiles([]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    }
  };

  const handleFileChangeAndUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) {
      console.log("No file selected");
      return;
    }

    setIsUploading(true);
    setError(null);

    try {
      const uploadObservable = await storageRef.current?.uploadRawFile(file);
      uploadObservable?.subscribe({
        next: ({ progress, metadataFragment }) => {
          setLastProgress(progress);
          if (metadataFragment) {
            setFinalMetadata(metadataFragment);
          }
        },
        error: (err) => {
          console.log(err);
          setError(err instanceof Error ? err.message : String(err));
          setIsUploading(false);
        },
        complete: () => {
          setIsUploading(false);
          if (fileInputRef.current) {
            fileInputRef.current.value = "";
          }
          listFiles(); // Refresh the file list after upload
        },
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
      setIsUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await storageRef.current?.deleteFile(id);
      toast.success(<span>File deleted successfully</span>);
      listFiles(); // Refresh the file list after deletion
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    }
  };

  const handleDownload = async (file: FileWithThumbnail) => {
    try {
      const blob = await storageRef.current?.downloadFile(file.rawURL);
      if (blob) {
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = file.name;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  useEffect(() => {
    return () => {
      // Clean up object URLs when component unmounts
      files.forEach((file) => {
        if (file.thumbnailUrl) {
          URL.revokeObjectURL(file.thumbnailUrl);
        }
      });
    };
  }, [files]);

  return (
    <div>
      <input
        type="file"
        ref={fileInputRef}
        accept="*"
        onChange={handleFileChangeAndUpload}
        style={{ display: "none" }}
      />
      <Button onClick={triggerFileInput} disabled={isUploading}>
        {isUploading ? "Uploading..." : "Select and Upload File"}
      </Button>
      <br />
      <div>Progress: {lastProgress.toFixed(2)}%</div>
      {finalMetadata && (
        <div>
          <h3>Uploaded File Details:</h3>
          <p>Name: {finalMetadata.name}</p>
          <p>Size: {finalMetadata.fileSize} bytes</p>
          <p>Type: {finalMetadata.mimeType}</p>
        </div>
      )}
      <br />
      <Button onClick={listFiles} disabled={isUploading}>
        List Files
      </Button>
      <br />
      <List
        dataSource={files}
        renderItem={(item) => (
          <List.Item
            actions={[
              <Button key="download" onClick={() => handleDownload(item)}>
                Download
              </Button>,
              <Button key="delete" onClick={() => handleDelete(item.rawURL)}>
                Delete
              </Button>,
            ]}
          >
            <List.Item.Meta
              avatar={
                item.thumbnailUrl && (
                  <div
                    style={{
                      width: "50px",
                      height: "50px",
                      overflow: "hidden",
                      borderRadius: "4px",
                    }}
                  >
                    <img
                      src={item.thumbnailUrl}
                      alt={item.name}
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                      }}
                    />
                  </div>
                )
              }
              title={item.name}
              description={`Size: ${item.fileSize} bytes, Type: ${item.mimeType}`}
            />
          </List.Item>
        )}
      />
      {error && <div style={{ color: "red" }}>{error}</div>}
    </div>
  );
};

export default BrowserSandbox;

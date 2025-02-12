import React, { useState, useCallback, useEffect } from "react";
import { Upload, Button, Progress, message } from "antd";
import { UploadOutlined } from "@ant-design/icons";

interface S3UploaderProps {
  onUploadComplete?: (fileKey: string) => void;
  onUploadError?: (error: Error) => void;
  onProgress?: (percent: number) => void;
}

const S3Uploader: React.FC<S3UploaderProps> = ({
  onUploadComplete,
  onUploadError,
  onProgress,
}) => {
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [uploading, setUploading] = useState<boolean>(false);

  useEffect(() => {
    const fetchDrivesSnapshot = async () => {
      try {
        const response = await fetch(
          "http://bkyz2-fmaaa-aaaaa-qaaaq-cai.localhost:8000/drives/snapshot",
          {
            method: "GET",
            headers: {
              Authorization: "Bearer mock_api_key_value",
            },
          }
        );

        if (!response.ok) {
          throw new Error("Failed to fetch drives snapshot");
        }

        const data = await response.json();
        console.log("Drives snapshot:", data);
      } catch (error) {
        console.error("Error fetching drives snapshot:", error);
        message.error("Failed to fetch drives information");
      }
    };

    fetchDrivesSnapshot();
  }, []);

  const uploadToS3WithProgress = (
    presignedUrl: string,
    fields: Record<string, string>,
    file: File
  ): Promise<void> => {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();

      // Track upload progress
      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const percentComplete = (event.loaded / event.total) * 100;
          setUploadProgress(Math.round(percentComplete));
          onProgress?.(Math.round(percentComplete));
        }
      };

      // Handle response
      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          resolve();
        } else {
          reject(new Error(`Upload failed with status ${xhr.status}`));
        }
      };

      // Handle errors
      xhr.onerror = () => {
        reject(new Error("Upload failed"));
      };

      // Prepare FormData
      const formData = new FormData();
      Object.entries(fields).forEach(([key, value]) => {
        formData.append(key, value);
      });
      formData.append("file", file);

      // Send request
      xhr.open("POST", presignedUrl, true);
      xhr.send(formData);
    });
  };

  const uploadToS3 = async (file: File) => {
    try {
      setUploading(true);
      setUploadProgress(0);

      // Step 1: Request presigned URL via directory action
      const actionResponse = await fetch(
        "http://bkyz2-fmaaa-aaaaa-qaaaq-cai.localhost:8000/directory/action",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer mock_api_key_value",
          },
          body: JSON.stringify({
            actions: [
              {
                action: "CREATE_FILE",
                target: {
                  resource_path: `DiskID_b2f184d4ca1a234d9da440d9a72c459673f6b8a8077bd3c4bce6f4a87943d0e8__DiskType_AwsBucket::`, // Adjust path as needed
                },
                payload: {
                  name: file.name,
                  extension: file.name.split(".").pop() || "",
                  tags: [],
                  file_size: file.size,
                  raw_url: "", // Will be set by backend
                  disk_id:
                    "DiskID_b2f184d4ca1a234d9da440d9a72c459673f6b8a8077bd3c4bce6f4a87943d0e8__DiskType_AwsBucket", // Your S3 disk ID
                  expires_at: null,
                  file_conflict_resolution: "KEEP_BOTH",
                },
              },
            ],
          }),
        }
      );

      if (!actionResponse.ok) {
        throw new Error("Failed to get upload URL");
      }

      const { upload, file: fileMetadata } = (await actionResponse.json())[0]
        .response.result;
      const { url: presignedUrl, fields } = upload;

      // Step 2: Upload to S3 with progress tracking
      await uploadToS3WithProgress(presignedUrl, fields, file);

      message.success("File uploaded successfully");
      onUploadComplete?.(fileMetadata.id);
      setUploadProgress(100);
    } catch (error) {
      console.error("Upload error:", error);
      message.error("Upload failed");
      onUploadError?.(error as Error);
    } finally {
      setUploading(false);
    }
  };

  const handleUpload = useCallback(async (file: File) => {
    await uploadToS3(file);
    return false; // Prevent default upload behavior
  }, []);

  return (
    <div className="w-full max-w-md">
      <Upload beforeUpload={handleUpload} showUploadList={false}>
        <Button
          icon={<UploadOutlined />}
          loading={uploading}
          className="w-full"
        >
          Select File
        </Button>
      </Upload>

      {uploading && (
        <Progress
          percent={uploadProgress}
          status={uploadProgress === 100 ? "success" : "active"}
          className="mt-4"
        />
      )}
    </div>
  );
};

export default S3Uploader;

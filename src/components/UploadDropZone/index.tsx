import React, { useCallback } from "react";
import { useDropzone } from "react-dropzone";
// import { useDrive, getUploadFolderPath } from "../../framework";
import "./dropzone.css"; // Assuming you have some custom CSS
import mixpanel from "mixpanel-browser";
import { UserID } from "@officexapp/types";
import { getUploadFolderPath, useDrive } from "../../framework";

interface UploadDropZoneProps {
  children: React.ReactNode;
  toggleUploadPanel: (bool: boolean) => void;
}

const UploadDropZone: React.FC<UploadDropZoneProps> = ({
  children,
  toggleUploadPanel,
}) => {
  const { uploadFilesFolders } = useDrive();

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (acceptedFiles.length > 0) {
        mixpanel.track("Upload Files");
        const { uploadFolderPath, storageLocation } = getUploadFolderPath();

        const directoryStructure = acceptedFiles.reduce(
          (acc, file) => {
            // Assuming path gives the full relative path
            const relativePath = (file as any).path || file.name; // 'path' is non-standard, so cast to any
            const pathParts = relativePath.split("/");
            const directory = pathParts.slice(0, -1).join("/");

            if (!acc[directory]) {
              acc[directory] = [];
            }
            acc[directory].push(file);

            return acc;
          },
          {} as Record<string, File[]>
        );

        // Upload files preserving the folder structure
        for (const directory in directoryStructure) {
          const filesInDirectory = directoryStructure[directory];
          const fullPath = `${uploadFolderPath}/${directory}`;

          uploadFilesFolders(
            filesInDirectory,
            fullPath,
            storageLocation,
            "user123" as UserID, // Replace with dynamic user ID as needed
            5,
            (fileUUID) => {
              console.log(
                `Local callback: File ${fileUUID} in ${directory} uploaded successfully`
              );
            }
          );
        }

        console.log("Selected files for upload:", acceptedFiles);
        toggleUploadPanel(true);
      }
    },
    [uploadFilesFolders, toggleUploadPanel]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: true, // Always allow multiple files and folders
    useFsAccessApi: true,
    noClick: true,
  });

  return (
    <div
      {...getRootProps({
        className: `custom-upload-dropzone ${isDragActive ? "drag-active" : ""}`,
      })}
      style={{ width: "100%", height: "100%" }}
    >
      <input {...getInputProps()} />
      {children}
    </div>
  );
};

export default UploadDropZone;

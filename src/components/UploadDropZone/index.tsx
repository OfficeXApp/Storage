import React, { useCallback } from "react";
import { useDropzone } from "react-dropzone";
// import { useDrive, getUploadFolderPath } from "../../framework";
import "./dropzone.css"; // Assuming you have some custom CSS
import mixpanel from "mixpanel-browser";
import { DiskTypeEnum, FileID, UserID } from "@officexapp/types";
import { getUploadFolderPath, useDrive } from "../../framework";
import { useMultiUploader } from "../../framework/uploader/hook";
import { v4 as uuidv4 } from "uuid";
import { generateListDirectoryKey } from "../../redux-offline/directory/directory.actions";
import { useDispatch } from "react-redux";

interface UploadDropZoneProps {
  children: React.ReactNode;
  toggleUploadPanel: (bool: boolean) => void;
}

const UploadDropZone: React.FC<UploadDropZoneProps> = ({
  children,
  toggleUploadPanel,
}) => {
  const { uploadFiles, uploadTargetFolderID, uploadTargetDisk } =
    useMultiUploader();
  const dispatch = useDispatch();

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      console.log(`Accepted files: ${acceptedFiles.length}`, acceptedFiles);
      if (
        acceptedFiles.length > 0 &&
        uploadTargetDisk &&
        uploadTargetFolderID
      ) {
        mixpanel.track("Upload Files");

        // Create an array of file objects with generated FileIDs
        const uploadFilesArray = acceptedFiles.map((file) => ({
          file,
          fileID: `FileID_${uuidv4()}` as FileID,
        }));
        console.log("uploadFilesArray", uploadFilesArray);
        // Use uploadFiles from useMultiUploader
        uploadFiles(
          uploadFilesArray,
          uploadTargetFolderID,
          uploadTargetDisk.disk_type as DiskTypeEnum,
          uploadTargetDisk.id,
          {
            onFileComplete: (fileUUID) => {
              console.log(`Local callback: File ${fileUUID} upload completed`);
            },
            parentFolderID: uploadTargetFolderID,
            metadata: {
              dispatch,
            },
            listDirectoryKey: generateListDirectoryKey({
              folder_id: uploadTargetFolderID || undefined,
            }),
          }
        );

        console.log("Selected files for upload:", acceptedFiles);
        toggleUploadPanel(true);
      }
    },
    [uploadFiles, uploadTargetFolderID, uploadTargetDisk, toggleUploadPanel]
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

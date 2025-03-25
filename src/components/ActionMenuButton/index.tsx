import React, { useEffect, useRef, useState } from "react";
import {
  Button,
  Dropdown,
  Input,
  MenuProps,
  message,
  Modal,
  Space,
} from "antd";
import {
  PlusOutlined,
  FolderOutlined,
  UploadOutlined,
  FolderAddOutlined,
  CloudSyncOutlined,
} from "@ant-design/icons";
import { DriveFullFilePath, useDrive } from "../../framework";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { v4 as uuidv4 } from "uuid";
import mixpanel from "mixpanel-browser";
// import useCloudSync from "../../api/cloud-sync";
import {
  DirectoryResourceID,
  DiskID,
  DiskTypeEnum,
  FileID,
  FolderID,
  GenerateID,
  UserID,
} from "@officexapp/types";
import { useIdentitySystem } from "../../framework/identity";
import { useDispatch, useSelector } from "react-redux";
import {
  CREATE_FOLDER,
  createFolderAction,
  generateListDirectoryKey,
  listDirectoryAction,
} from "../../redux-offline/directory/directory.actions";
import {
  defaultTempCloudSharingDiskID,
  defaultTempCloudSharingRootFolderID,
} from "../../api/dexie-database";
import {
  DiskFEO,
  LOCALSTORAGE_DEFAULT_DISK_ID,
} from "../../redux-offline/disks/disks.reducer";
import { ReduxAppState } from "../../redux-offline/ReduxProvider";
import { J } from "vitest/dist/chunks/reporters.D7Jzd9GS.js";
import { useMultiUploader } from "../../framework/uploader/hook";
import { shouldBehaveOfflineDiskUIIntent } from "../../redux-offline/directory/directory.reducer";

interface ActionMenuButtonProps {
  isBigButton?: boolean; // Determines the button style
  toggleUploadPanel: (bool: boolean) => void; // Callback to toggle UploadPanel visibility
  optimisticListDirectoryKey?: string;
}

const ActionMenuButton: React.FC<ActionMenuButtonProps> = ({
  isBigButton = false,
  toggleUploadPanel,
  optimisticListDirectoryKey,
}) => {
  const { currentOrg, isOfflineOrg } = useIdentitySystem();
  const icpCanisterId = currentOrg?.driveID;
  const fileInputRef = useRef<HTMLInputElement>(null);
  const folderInputRef = useRef<HTMLInputElement>(null);
  const [newFolderName, setNewFolderName] = useState("");
  const [isModalVisible, setIsModalVisible] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { "*": encodedPath } = useParams<{ "*": string }>();
  const { uploadTargetFolderID, uploadTargetDisk, uploadFiles } =
    useMultiUploader();

  const handleFileSelect = (files: FileList | null) => {
    if (files && uploadTargetDisk && uploadTargetFolderID) {
      const fileArray = Array.from(files);

      // Create an array of file objects with generated FileIDs
      const uploadFilesArray = fileArray.map((file) => ({
        file,
        fileID: `FileID_${uuidv4()}` as FileID,
      }));

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
          metadata: {
            dispatch,
          },
          parentFolderID: uploadTargetFolderID,
          listDirectoryKey: generateListDirectoryKey({
            folder_id: uploadTargetFolderID || undefined,
          }),
        }
      );

      console.log("Selected files for upload:", fileArray);
      // Expand the UploadPanel after files are selected
      toggleUploadPanel(true);
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

  const handleCreateFolder = async () => {
    mixpanel.track("Create Folder");
    console.log(
      `Creating folder: ${newFolderName} in ${uploadTargetFolderID} of ${uploadTargetDisk?.id}`
    );
    if (newFolderName.trim() && uploadTargetDisk && uploadTargetFolderID) {
      try {
        // Create the folder action
        const createAction = {
          action: CREATE_FOLDER as "CREATE_FOLDER",
          payload: {
            id: GenerateID.Folder(),
            name: newFolderName,
            labels: [],
            disk_id: uploadTargetDisk.id,
            parent_folder_uuid: uploadTargetFolderID,
          },
        };

        // Dispatch the action
        dispatch(
          createFolderAction(
            createAction,
            optimisticListDirectoryKey,
            shouldBehaveOfflineDiskUIIntent(uploadTargetDisk.id)
          )
        );

        message.success(`Folder "${newFolderName}" created successfully`);
        setNewFolderName("");
        setIsModalVisible(false);
      } catch (error) {
        message.error(`Failed to create folder: ${error}`);
      }
    } else {
      message.warning("Please enter a folder name");
    }
  };

  const appendRefreshParam = () => {
    const params = new URLSearchParams(location.search);
    params.set("refresh", uuidv4());
    navigate(`${location.pathname}?${params.toString()}`, { replace: true });
  };

  const newButtonItems: MenuProps["items"] = [
    {
      label: (
        <Space>
          <FolderAddOutlined />
          New Folder
        </Space>
      ),
      key: "newFolder",
      onClick: () => setIsModalVisible(true),
    },
    {
      type: "divider",
    },
    {
      label: (
        <Space>
          <UploadOutlined />
          Upload Files
        </Space>
      ),
      key: "uploadFile",
      onClick: handleUploadFiles,
    },
    {
      label: (
        <Space>
          <FolderOutlined />
          Upload Folder
        </Space>
      ),
      key: "uploadFolder",
      onClick: handleUploadFolder,
    },
    {
      type: "divider",
    },
    {
      label: "Connect Hard Drive",
      key: "connectHardDrive",
      disabled: true,
    },
  ];

  return (
    <>
      <Dropdown menu={{ items: newButtonItems }}>
        <Button
          type={isBigButton && icpCanisterId ? "primary" : undefined}
          block={isBigButton}
          style={
            isBigButton
              ? { width: "100%" }
              : { width: "100%", maxWidth: "125px" }
          }
        >
          <Space>
            <PlusOutlined />
            New
          </Space>
        </Button>
      </Dropdown>

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

      <Modal
        title="Create New Folder"
        open={isModalVisible}
        onOk={handleCreateFolder}
        onCancel={() => {
          setIsModalVisible(false);
          setNewFolderName("");
        }}
      >
        <Input
          placeholder="Enter folder name"
          value={newFolderName}
          onChange={(e) => setNewFolderName(e.target.value.slice(0, 128))}
          onPressEnter={handleCreateFolder}
          maxLength={128}
          style={{ marginTop: "10px" }}
        />
      </Modal>
    </>
  );
};

export default ActionMenuButton;

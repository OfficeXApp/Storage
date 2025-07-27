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
  MessageOutlined,
} from "@ant-design/icons";
import { DriveFullFilePath, useDrive } from "../../framework";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import sheetsLogo from "../../assets/sheets-logo.png";
import docsLogo from "../../assets/docs-logo.png";
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
} from "../../redux-offline/directory/directory.actions";
import { useMultiUploader } from "../../framework/uploader/hook";
import { shouldBehaveOfflineDiskUIIntent } from "../../redux-offline/directory/directory.reducer";
import { extractDiskInfo, urlSafeBase64Encode } from "../../api/helpers";

interface ActionMenuButtonProps {
  isBigButton?: boolean; // Determines the button style
  toggleUploadPanel: (bool: boolean) => void; // Callback to toggle UploadPanel visibility
  optimisticListDirectoryKey?: string;
  disabled?: boolean;
}

const ActionMenuButton: React.FC<ActionMenuButtonProps> = ({
  isBigButton = false,
  toggleUploadPanel,
  optimisticListDirectoryKey,
  disabled = false,
}) => {
  const { currentOrg, isOfflineOrg, wrapOrgCode } = useIdentitySystem();
  const icpCanisterId = currentOrg?.driveID;
  const fileInputRef = useRef<HTMLInputElement>(null);
  const folderInputRef = useRef<HTMLInputElement>(null);
  const [newFolderName, setNewFolderName] = useState("");
  const [isModalVisible, setIsModalVisible] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { "*": encodedPath } = useParams<{ "*": string }>();
  const {
    uploadTargetFolderID,
    uploadTargetDiskType,
    uploadTargetDisk,
    uploadFiles,
  } = useMultiUploader();

  const { diskTypeEnum, diskID } = extractDiskInfo();

  const handleFileSelect = (files: FileList | null) => {
    console.log(
      "handleFileSelect",
      files,
      uploadTargetFolderID,
      uploadTargetDiskType,
      diskID
    );
    if (files && diskID && uploadTargetDiskType && uploadTargetFolderID) {
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
        uploadTargetDiskType,
        diskID,
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
      `Creating folder: ${newFolderName} in ${uploadTargetFolderID} of ${diskTypeEnum} ${diskID}`
    );
    if (
      newFolderName.trim() &&
      diskTypeEnum &&
      diskID &&
      uploadTargetFolderID
    ) {
      try {
        // Create the folder action
        const createAction = {
          action: CREATE_FOLDER as "CREATE_FOLDER",
          payload: {
            id: GenerateID.Folder(),
            name: newFolderName,
            labels: [],
            disk_id: diskID,
            disk_type: diskTypeEnum,
            parent_folder_uuid: uploadTargetFolderID,
          },
        };

        // Dispatch the action
        dispatch(
          createFolderAction(
            createAction,
            optimisticListDirectoryKey,
            shouldBehaveOfflineDiskUIIntent(diskID)
          )
        );

        message.success(`Folder "${newFolderName}" created successfully`);
        setNewFolderName("");
        setIsModalVisible(false);
      } catch (error) {
        message.error(`Failed to create folder: ${error}`);
      }
    } else {
      message.warning("Not Allowed, please check permissions");
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
          <MessageOutlined />
          New Chat
        </Space>
      ),
      key: "newChat",
      disabled,
      onClick: () => {
        navigate(wrapOrgCode("/chat"));
      },
    },
    {
      type: "divider",
    },
    // {
    //   label: (
    //     <Space>
    //       <FolderAddOutlined />
    //       New Folder
    //     </Space>
    //   ),
    //   key: "newFolder",
    //   disabled,
    //   onClick: () => {
    //     if (window.location.pathname.includes("/drive/")) {
    //       setIsModalVisible(true);
    //     } else if (window.location.pathname === wrapOrgCode("/drive")) {
    //       message.info("Select a disk first");
    //     } else {
    //       navigate(wrapOrgCode("/drive"));
    //       message.info("Select a disk");
    //     }
    //   },
    // },
    {
      label: (
        <Space>
          <UploadOutlined />
          Upload Files
        </Space>
      ),
      key: "uploadFile",
      disabled,
      onClick: () => {
        if (window.location.pathname.includes("/drive/")) {
          handleUploadFiles();
        } else if (window.location.pathname === wrapOrgCode("/drive")) {
          message.info("Select a disk first");
        }
      },
    },
    {
      label: (
        <Space>
          <FolderOutlined />
          Upload Folder
        </Space>
      ),
      key: "uploadFolder",
      disabled,
      onClick: () => {
        if (window.location.pathname.includes("/drive/")) {
          handleUploadFolder();
        } else if (window.location.pathname === wrapOrgCode("/drive")) {
          message.info("Select a disk first");
        } else {
          navigate(wrapOrgCode("/drive"));
          message.info("Select a disk");
        }
      },
    },
    {
      type: "divider",
    },
    {
      label: (
        <Link
          to={wrapOrgCode(
            `/drive/${uploadTargetDiskType}/${uploadTargetDisk?.id}/${uploadTargetFolderID}/new/apps/docs`
          )}
          target="_blank"
        >
          <div
            style={{
              display: "flex",
              flexDirection: "row",
              alignItems: "flex-start",
              justifyContent: "center",
            }}
          >
            <img
              alt="Docs"
              src={docsLogo}
              style={
                {
                  width: 20,
                  objectFit: "cover",
                  margin: "0px",
                  marginRight: "8px",
                } as React.CSSProperties
              }
            />
            New Document
          </div>
        </Link>
      ),
      key: "new-docs",
      disabled,
    },
    {
      label: (
        <Link
          to={wrapOrgCode(
            `/drive/${uploadTargetDiskType}/${uploadTargetDisk?.id}/${uploadTargetFolderID}/new/apps/sheets`
          )}
          target="_blank"
        >
          <div
            style={{
              display: "flex",
              flexDirection: "row",
              alignItems: "flex-start",
              justifyContent: "center",
            }}
          >
            <img
              alt="Sheets"
              src={sheetsLogo}
              style={
                {
                  width: 20,
                  objectFit: "cover",
                  margin: "0px",
                  marginRight: "8px",
                } as React.CSSProperties
              }
            />
            New Spreadsheet
          </div>
        </Link>
      ),
      key: "new-sheets",
      disabled,
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
          disabled={disabled}
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

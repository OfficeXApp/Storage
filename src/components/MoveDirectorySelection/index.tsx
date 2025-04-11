import React, { useEffect, useState } from "react";
import type { TreeSelectProps } from "antd";
import { TreeSelect, Spin, Button, Modal, Form, Select, message } from "antd";
import {
  DirectoryActionEnum,
  DiskID,
  FileConflictResolutionEnum,
  FileID,
  FolderID,
} from "@officexapp/types";
import { useIdentitySystem } from "../../framework/identity";
import { wrapAuthStringOrHeader } from "../../api/helpers";
import { DiskFEO } from "../../redux-offline/disks/disks.reducer";
import { FolderFEO } from "../../redux-offline/directory/directory.reducer";
import { Link } from "react-router-dom";

// For TypeScript, you can refine these types as needed.
interface MoveDirectorySelectorProps {
  visible: boolean;
  setVisible: (visible: boolean) => void;
  initialFolderID?: FolderID;
  disk: DiskFEO;
  onFinish: () => void;
  onCancel: () => void;
  mode: "copy" | "move";
  resource_ids: (FileID | FolderID)[];
}

interface TreeNodeData {
  id: FolderID;
  pId: FolderID | null;
  value: string;
  title: string;
  isLeaf?: boolean;
}

const MoveDirectorySelector: React.FC<MoveDirectorySelectorProps> = ({
  initialFolderID,
  disk,
  onFinish,
  onCancel,
  visible,
  setVisible,
  mode,
  resource_ids,
}) => {
  const [selectedFolderID, setSelectedFolderID] = useState<string | undefined>(
    undefined
  );
  const [loading, setLoading] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const { currentOrg, currentAPIKey, generateSignature, wrapOrgCode } =
    useIdentitySystem();
  const [treeData, setTreeData] = useState<TreeNodeData[]>([]);
  const [folderMap, setFolderMap] = useState<Record<string, FolderFEO>>({});
  const [conflictResolution, setConflictResolution] =
    useState<FileConflictResolutionEnum>(FileConflictResolutionEnum.KEEP_BOTH);

  function extractDiskInfo() {
    const url = window.location.href;
    // Split the URL into parts
    const parts = new URL(url).pathname.split("/");

    // Find the index of 'drive' in the path
    const driveIndex = parts.indexOf("drive");

    // If 'drive' is found and there are enough parts after it
    if (driveIndex !== -1 && parts.length > driveIndex + 2) {
      const diskTypeEnum = parts[driveIndex + 1];
      const diskID = parts[driveIndex + 2];
      const currentFolderID = parts[driveIndex + 3];

      return {
        diskTypeEnum,
        diskID,
        currentFolderID,
      };
    }

    // Return null or throw an error if the URL doesn't match the expected format
    return {
      diskTypeEnum: "",
      diskID: "",
      currentFolderID: "",
    };
  }
  const { diskTypeEnum, diskID, currentFolderID } = extractDiskInfo();

  useEffect(() => {
    const init = async () => {
      if (!currentOrg) return;
      setLoading(true);

      // First, create a root folder node if we have disk information
      if (disk && disk.root_folder) {
        // Add the root folder as the first option
        const rootNode: TreeNodeData = {
          id: disk.root_folder,
          pId: null,
          value: disk.root_folder,
          title: disk.name,
          isLeaf: false,
        };

        setTreeData([rootNode]);

        // Then immediately load its children
        let auth_token = currentAPIKey?.value || (await generateSignature());
        const { url, headers } = wrapAuthStringOrHeader(
          `${currentOrg.endpoint}/v1/${currentOrg.driveID}/directory/list`,
          {
            "Content-Type": "application/json",
          },
          auth_token
        );

        try {
          const res = await fetch(url, {
            method: "POST",
            body: JSON.stringify({
              folder_id: initialFolderID || disk.root_folder,
            }),
            headers,
          });

          const data = await res.json();

          // Store folders in a map for easy access
          const newFolderMap = { ...folderMap };
          data.folders.forEach((folder: FolderFEO) => {
            newFolderMap[folder.id] = folder;
          });
          setFolderMap(newFolderMap);

          // Generate tree nodes and make sure they have the correct parent ID
          const newNodes = data.folders.map((f: FolderFEO) => genTreeNode(f));

          // Update with both root and children
          setTreeData((prev) => {
            // Filter out duplicates
            const existingIds = new Set(prev.map((item) => item.id));
            const uniqueNewNodes = newNodes.filter(
              (node: any) => !existingIds.has(node.id)
            );
            return [...prev, ...uniqueNewNodes];
          });
        } catch (err) {
          console.error("Error loading child nodes:", err);
        } finally {
          setLoading(false);
        }
      } else {
        console.error("No disk or root_folder information available");
        setLoading(false);
      }
    };

    init();
  }, [currentOrg, currentAPIKey, disk, initialFolderID]);

  const genTreeNode = (folder: FolderFEO): TreeNodeData => {
    return {
      id: folder.id,
      pId: folder.parent_folder_uuid || null,
      value: folder.id, // Use the folder ID as the value
      title: folder.name,
      isLeaf: folder.subfolder_uuids.length === 0,
    };
  };

  // Called when a node is expanded, to load child nodes
  const onLoadData: TreeSelectProps["loadData"] = (node) => {
    if (!currentOrg?.endpoint || !currentOrg?.driveID) return Promise.resolve();

    return new Promise<void>(async (resolve) => {
      setLoading(true);

      // Extract the folder ID directly from the node's value
      const folderID = node.value as string;

      try {
        let auth_token = currentAPIKey?.value || (await generateSignature());
        const { url, headers } = wrapAuthStringOrHeader(
          `${currentOrg.endpoint}/v1/${currentOrg.driveID}/directory/list`,
          {
            "Content-Type": "application/json",
          },
          auth_token
        );

        const res = await fetch(url, {
          method: "POST",
          body: JSON.stringify({
            folder_id: folderID,
          }),
          headers,
        });

        const data = await res.json();

        if (data.folders && Array.isArray(data.folders)) {
          // Store folders in map
          const newFolderMap = { ...folderMap };
          data.folders.forEach((folder: FolderFEO) => {
            newFolderMap[folder.id] = folder;
          });
          setFolderMap(newFolderMap);

          // Generate tree nodes for children
          const newNodes = data.folders.map((f: FolderFEO) => genTreeNode(f));

          // Update tree data, making sure we don't add duplicates
          setTreeData((prevData) => {
            const existingIds = new Set(prevData.map((item) => item.id));
            const uniqueNewNodes = newNodes.filter(
              (node: any) => !existingIds.has(node.id)
            );
            return [...prevData, ...uniqueNewNodes];
          });
        } else {
          console.warn("No folders found or invalid response format:", data);
        }
      } catch (err) {
        console.error("Error loading child nodes:", err);
      } finally {
        setLoading(false);
        resolve();
      }
    });
  };

  const initiateMoveCopy = async () => {
    if (!selectedFolderID || !currentOrg) return;
    setLoading(true);

    let auth_token = currentAPIKey?.value || (await generateSignature());
    const { url, headers } = wrapAuthStringOrHeader(
      `${currentOrg.endpoint}/v1/${currentOrg.driveID}/directory/action`,
      {
        "Content-Type": "application/json",
      },
      auth_token
    );

    const res = await fetch(url, {
      method: "POST",
      body: JSON.stringify({
        actions: resource_ids.map((id) => {
          let action = "";
          if (mode === "copy" && id.startsWith("FileID_")) {
            action = DirectoryActionEnum.COPY_FILE;
          } else if (mode === "copy" && id.startsWith("FolderID_")) {
            action = DirectoryActionEnum.COPY_FOLDER;
          } else if (mode === "move" && id.startsWith("FileID_")) {
            action = DirectoryActionEnum.MOVE_FILE;
          } else if (mode === "move" && id.startsWith("FolderID_")) {
            action = DirectoryActionEnum.MOVE_FOLDER;
          }
          return {
            action,
            payload: {
              id,
              destination_folder_id: selectedFolderID,
              file_conflict_resolution: conflictResolution,
            },
          };
        }),
      }),
      headers,
    });

    const data = await res.json();
    console.log(`Move/Copy operation completed`, data);
    if (data.every((d: any) => d.success)) {
      message.success(
        `Successfully ${mode === "move" ? "moved" : "copied"} all records`
      );
      setIsFinished(true);
      onFinish();
    } else if (data.every((d: any) => !d.success)) {
      message.error(
        `Failed to ${mode === "move" ? "move" : "copy"} all records`
      );
    } else if (data.map((d: any) => d.success).includes(false)) {
      data
        .filter((d: any) => !d.success)
        .forEach((d: any) => {
          message.error(`Error: ${d.response.error}`);
        });
      message.info(`Not all succeeded`);
      setIsFinished(true);
      onFinish();
    }
    setLoading(false);
  };

  return (
    <Modal
      title={mode === "move" ? "Move to Directory" : "Copy to Directory"}
      open={visible}
      onCancel={() => setVisible(false)}
      footer={null}
      width={600}
    >
      <span style={{ marginBottom: 32, color: "rgba(0,0,0,0.4)" }}>
        Choose where to move/copy your files to within the same disk.
      </span>
      <br />
      <br />
      <div>
        <p style={{ marginBottom: 8 }}>Destination Folder</p>

        <TreeSelect
          treeDataSimpleMode
          style={{ width: "100%" }}
          value={selectedFolderID}
          dropdownStyle={{ maxHeight: 400, overflow: "auto" }}
          placeholder="Select Destination Folder"
          onChange={(folderID) => {
            if (
              resource_ids.includes(folderID) ||
              folderID === currentFolderID
            ) {
              message.info("Cannot move/copy to the same folder");
            } else {
              setSelectedFolderID(folderID);
            }
          }}
          loadData={onLoadData}
          treeData={treeData}
          showSearch
          allowClear
        />
        <br />
        <p style={{ marginBottom: 8 }}>File Conflict Resolution</p>

        <Select
          value={conflictResolution}
          onChange={setConflictResolution}
          style={{ width: "100%" }}
        >
          <Select.Option value={FileConflictResolutionEnum.KEEP_BOTH}>
            Keep Both
          </Select.Option>
          <Select.Option value={FileConflictResolutionEnum.REPLACE}>
            Replace
          </Select.Option>
          <Select.Option value={FileConflictResolutionEnum.KEEP_ORIGINAL}>
            Keep Original
          </Select.Option>
          <Select.Option value={FileConflictResolutionEnum.KEEP_NEWER}>
            Keep Newer
          </Select.Option>
        </Select>
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            justifyContent: "flex-end",
            marginTop: 16,
          }}
        >
          <Button onClick={onCancel} style={{ marginRight: 8 }}>
            Cancel
          </Button>
          {isFinished ? (
            <Link
              to={wrapOrgCode(
                `/drive/${diskTypeEnum}/${diskID}/${selectedFolderID}`
              )}
            >
              <Button type="primary" onClick={() => setVisible(false)}>
                View Destination
              </Button>
            </Link>
          ) : (
            <Button
              onClick={() => {
                if (!selectedFolderID) return;
                initiateMoveCopy();
              }}
              type="primary"
              disabled={!selectedFolderID}
              loading={loading}
            >
              Continue
            </Button>
          )}
        </div>
      </div>
    </Modal>
  );
};

export default MoveDirectorySelector;

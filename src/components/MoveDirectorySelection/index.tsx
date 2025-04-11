import React, { useEffect, useState } from "react";
import type { TreeSelectProps } from "antd";
import { TreeSelect, Spin, Button, Modal } from "antd";
import { DiskID, FolderID } from "@officexapp/types";
import { useIdentitySystem } from "../../framework/identity";
import { wrapAuthStringOrHeader } from "../../api/helpers";
import { DiskFEO } from "../../redux-offline/disks/disks.reducer";
import { FolderFEO } from "../../redux-offline/directory/directory.reducer";

// For TypeScript, you can refine these types as needed.
interface MoveDirectorySelectorProps {
  visible: boolean;
  setVisible: (visible: boolean) => void;
  initialFolderID?: FolderID;
  disk: DiskFEO;
  onSelect: (folderID: FolderID) => void;
  onCancel: () => void;
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
  onSelect,
  onCancel,
  visible,
  setVisible,
}) => {
  const [selectedFolderID, setSelectedFolderID] = useState<string | undefined>(
    undefined
  );
  const [loading, setLoading] = useState(false);
  const { currentOrg, currentAPIKey, generateSignature } = useIdentitySystem();
  const [treeData, setTreeData] = useState<TreeNodeData[]>([]);
  const [folderMap, setFolderMap] = useState<Record<string, FolderFEO>>({});

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

  const onChange = (newValue: string) => {
    setSelectedFolderID(newValue);

    // Call the onSelect prop with the selected folder ID
    if (onSelect && newValue) {
      onSelect(newValue);
    }
  };

  return (
    <Modal
      title="Select Destination Folder"
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
        <TreeSelect
          treeDataSimpleMode
          style={{ width: "100%" }}
          value={selectedFolderID}
          dropdownStyle={{ maxHeight: 400, overflow: "auto" }}
          placeholder="Select Destination Folder"
          onChange={onChange}
          loadData={onLoadData}
          treeData={treeData}
          showSearch
          allowClear
        />
        <br />
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
          <Button
            onClick={() => {
              if (!selectedFolderID) return;
              onSelect(selectedFolderID);
            }}
            type="primary"
            disabled={!selectedFolderID}
          >
            Continue
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default MoveDirectorySelector;

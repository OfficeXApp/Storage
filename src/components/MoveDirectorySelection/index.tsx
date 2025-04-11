import React, { useState } from "react";
import type { TreeSelectProps } from "antd";
import { TreeSelect, Spin } from "antd";
import { DiskID, FolderID } from "@officexapp/types";
import { useIdentitySystem } from "../../framework/identity";
import { wrapAuthStringOrHeader } from "../../api/helpers";

// For TypeScript, you can refine these types as needed.
interface MoveDirectorySelectorProps {
  initialFolderID?: FolderID;
  diskID?: DiskID;
  onSelect: (folderID: FolderID) => void;
}

interface TreeNodeData {
  id: string | number;
  pId: string | number;
  value: string;
  title: string;
  isLeaf?: boolean;
}

const MoveDirectorySelector: React.FC<MoveDirectorySelectorProps> = ({
  initialFolderID,
  diskID,
}) => {
  const [value, setValue] = useState<string>();
  const [loading, setLoading] = useState(false);
  const { currentOrg, currentAPIKey, generateSignature } = useIdentitySystem();
  const [treeData, setTreeData] = useState<TreeNodeData[]>([
    {
      id: 1,
      pId: 0,
      value: "1",
      title: "Expand to load",
    },
    {
      id: 2,
      pId: 0,
      value: "2",
      title: "Expand to load",
    },
    {
      id: 3,
      pId: 0,
      value: "3",
      title: "Tree Node",
      isLeaf: true,
    },
  ]);

  // This just mocks a random child node
  const genTreeNode = (parentId: number | string, isLeaf = false) => {
    const random = Math.random().toString(36).substring(2, 6);
    return {
      id: random,
      pId: parentId,
      value: random,
      title: isLeaf ? "Tree Node" : "Expand to load",
      isLeaf,
    };
  };

  // Called when a node is expanded, to load child nodes
  const onLoadData: TreeSelectProps["loadData"] = async (node) => {
    if (!currentOrg?.endpoint || !currentOrg?.driveID) return Promise.resolve();
    return new Promise<void>(async (resolve) => {
      setLoading(true);
      // Example fetch to /directory/list
      let auth_token = currentAPIKey?.value || (await generateSignature());
      const { url, headers } = wrapAuthStringOrHeader(
        `${currentOrg.endpoint}/v1/${currentOrg.driveID}/directory/list`,
        {
          "Content-Type": "application/json",
        },
        auth_token
      );
      fetch(url, {
        method: "POST",
        body: JSON.stringify({
          folder_id: node.id,
        }),
        headers,
      })
        .then(async (res) => {
          const data = await res.json();
          console.log("Received /directory/list response:", data);
          // We mock the new child nodes in the tree:
          const newNodes = [
            genTreeNode(node.id, false),
            genTreeNode(node.id, false),
            genTreeNode(node.id, true),
          ];
          setTreeData((prev) => [...prev, ...newNodes]);
        })
        .catch((err) => {
          console.error("Error loading child nodes:", err);
        })
        .finally(() => {
          setLoading(false);
          resolve();
        });
    });
  };

  const onChange = (newValue: string) => {
    console.log("Selected folder:", newValue);
    setValue(newValue);
  };

  return (
    <div>
      <TreeSelect
        treeDataSimpleMode
        style={{ width: "100%" }}
        value={value}
        dropdownStyle={{ maxHeight: 400, overflow: "auto" }}
        placeholder="Select folder to move"
        onChange={onChange}
        loadData={onLoadData}
        treeData={treeData}
      />
    </div>
  );
};

export default MoveDirectorySelector;

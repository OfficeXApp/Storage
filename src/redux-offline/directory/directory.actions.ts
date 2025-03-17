// src/redux-offline/directory/directory.actions.ts

import {
  DirectoryActionRequestBody,
  DirectoryAction,
  GetFileAction,
  GetFolderAction,
  CreateFileAction,
  CreateFolderAction,
  UpdateFileAction,
  UpdateFolderAction,
  DeleteFileAction,
  DeleteFolderAction,
  CopyFileAction,
  CopyFolderAction,
  MoveFileAction,
  MoveFolderAction,
  RestoreTrashAction,
  FileID,
  FolderID,
  DirectoryResourceID,
  GenerateID,
} from "@officexapp/types";

// Action Types
export const GET_FILE = "GET_FILE";
export const GET_FILE_COMMIT = "GET_FILE_COMMIT";
export const GET_FILE_ROLLBACK = "GET_FILE_ROLLBACK";

export const GET_FOLDER = "GET_FOLDER";
export const GET_FOLDER_COMMIT = "GET_FOLDER_COMMIT";
export const GET_FOLDER_ROLLBACK = "GET_FOLDER_ROLLBACK";

export const CREATE_FILE = "CREATE_FILE";
export const CREATE_FILE_COMMIT = "CREATE_FILE_COMMIT";
export const CREATE_FILE_ROLLBACK = "CREATE_FILE_ROLLBACK";

export const CREATE_FOLDER = "CREATE_FOLDER";
export const CREATE_FOLDER_COMMIT = "CREATE_FOLDER_COMMIT";
export const CREATE_FOLDER_ROLLBACK = "CREATE_FOLDER_ROLLBACK";

export const UPDATE_FILE = "UPDATE_FILE";
export const UPDATE_FILE_COMMIT = "UPDATE_FILE_COMMIT";
export const UPDATE_FILE_ROLLBACK = "UPDATE_FILE_ROLLBACK";

export const UPDATE_FOLDER = "UPDATE_FOLDER";
export const UPDATE_FOLDER_COMMIT = "UPDATE_FOLDER_COMMIT";
export const UPDATE_FOLDER_ROLLBACK = "UPDATE_FOLDER_ROLLBACK";

export const DELETE_FILE = "DELETE_FILE";
export const DELETE_FILE_COMMIT = "DELETE_FILE_COMMIT";
export const DELETE_FILE_ROLLBACK = "DELETE_FILE_ROLLBACK";

export const DELETE_FOLDER = "DELETE_FOLDER";
export const DELETE_FOLDER_COMMIT = "DELETE_FOLDER_COMMIT";
export const DELETE_FOLDER_ROLLBACK = "DELETE_FOLDER_ROLLBACK";

export const COPY_FILE = "COPY_FILE";
export const COPY_FILE_COMMIT = "COPY_FILE_COMMIT";
export const COPY_FILE_ROLLBACK = "COPY_FILE_ROLLBACK";

export const COPY_FOLDER = "COPY_FOLDER";
export const COPY_FOLDER_COMMIT = "COPY_FOLDER_COMMIT";
export const COPY_FOLDER_ROLLBACK = "COPY_FOLDER_ROLLBACK";

export const MOVE_FILE = "MOVE_FILE";
export const MOVE_FILE_COMMIT = "MOVE_FILE_COMMIT";
export const MOVE_FILE_ROLLBACK = "MOVE_FILE_ROLLBACK";

export const MOVE_FOLDER = "MOVE_FOLDER";
export const MOVE_FOLDER_COMMIT = "MOVE_FOLDER_COMMIT";
export const MOVE_FOLDER_ROLLBACK = "MOVE_FOLDER_ROLLBACK";

export const RESTORE_TRASH = "RESTORE_TRASH";
export const RESTORE_TRASH_COMMIT = "RESTORE_TRASH_COMMIT";
export const RESTORE_TRASH_ROLLBACK = "RESTORE_TRASH_ROLLBACK";

// Action Creators

// Get File
export const getFileAction = (action: GetFileAction) => {
  const resourceId = action.target.resource_id as FileID;
  return {
    type: GET_FILE,
    meta: {
      optimisticID: resourceId,
      offline: {
        effect: {
          url: `/directory/action`,
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            // Authorization: `Bearer HANDLED_BY_OFFLINE_EFFECT_MIDDLEWARE`,
          },
          data: {
            actions: [action],
          },
        },
        commit: { type: GET_FILE_COMMIT, meta: { optimisticID: resourceId } },
        rollback: {
          type: GET_FILE_ROLLBACK,
          meta: { optimisticID: resourceId },
        },
      },
    },
  };
};

// Get Folder
export const getFolderAction = (action: GetFolderAction) => {
  const resourceId = action.target.resource_id as FolderID;
  return {
    type: GET_FOLDER,
    meta: {
      optimisticID: resourceId,
      offline: {
        effect: {
          url: `/directory/action`,
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            // Authorization: `Bearer HANDLED_BY_OFFLINE_EFFECT_MIDDLEWARE`,
          },
          data: {
            actions: [action],
          },
        },
        commit: { type: GET_FOLDER_COMMIT, meta: { optimisticID: resourceId } },
        rollback: {
          type: GET_FOLDER_ROLLBACK,
          meta: { optimisticID: resourceId },
        },
      },
    },
  };
};

// Create File
export const createFileAction = (action: CreateFileAction) => {
  const id = GenerateID.File();
  // Assign the generated ID to the resource_id if not provided
  if (!action.target.resource_id) {
    action.target.resource_id = id as DirectoryResourceID;
  }

  return {
    type: CREATE_FILE,
    meta: {
      optimisticID: id,
      offline: {
        effect: {
          url: `/directory/action`,
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            // Authorization: `Bearer HANDLED_BY_OFFLINE_EFFECT_MIDDLEWARE`,
          },
          data: {
            actions: [action],
          },
        },
        commit: { type: CREATE_FILE_COMMIT, meta: { optimisticID: id } },
        rollback: { type: CREATE_FILE_ROLLBACK, meta: { optimisticID: id } },
      },
    },
  };
};

// Create Folder
export const createFolderAction = (action: CreateFolderAction) => {
  const id = GenerateID.Folder();
  // Assign the generated ID to the resource_id if not provided
  if (!action.target.resource_id) {
    action.target.resource_id = id as DirectoryResourceID;
  }

  return {
    type: CREATE_FOLDER,
    meta: {
      optimisticID: id,
      offline: {
        effect: {
          url: `/directory/action`,
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            // Authorization: `Bearer HANDLED_BY_OFFLINE_EFFECT_MIDDLEWARE`,
          },
          data: {
            actions: [action],
          },
        },
        commit: { type: CREATE_FOLDER_COMMIT, meta: { optimisticID: id } },
        rollback: { type: CREATE_FOLDER_ROLLBACK, meta: { optimisticID: id } },
      },
    },
  };
};

// Update File
export const updateFileAction = (action: UpdateFileAction) => {
  const resourceId = action.target.resource_id as FileID;
  return {
    type: UPDATE_FILE,
    meta: {
      optimisticID: resourceId,
      offline: {
        effect: {
          url: `/directory/action`,
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            // Authorization: `Bearer HANDLED_BY_OFFLINE_EFFECT_MIDDLEWARE`,
          },
          data: {
            actions: [action],
          },
        },
        commit: {
          type: UPDATE_FILE_COMMIT,
          meta: { optimisticID: resourceId },
        },
        rollback: {
          type: UPDATE_FILE_ROLLBACK,
          meta: { optimisticID: resourceId },
        },
      },
    },
  };
};

// Update Folder
export const updateFolderAction = (action: UpdateFolderAction) => {
  const resourceId = action.target.resource_id as FolderID;
  return {
    type: UPDATE_FOLDER,
    meta: {
      optimisticID: resourceId,
      offline: {
        effect: {
          url: `/directory/action`,
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            // Authorization: `Bearer HANDLED_BY_OFFLINE_EFFECT_MIDDLEWARE`,
          },
          data: {
            actions: [action],
          },
        },
        commit: {
          type: UPDATE_FOLDER_COMMIT,
          meta: { optimisticID: resourceId },
        },
        rollback: {
          type: UPDATE_FOLDER_ROLLBACK,
          meta: { optimisticID: resourceId },
        },
      },
    },
  };
};

// Delete File
export const deleteFileAction = (action: DeleteFileAction) => {
  const resourceId = action.target.resource_id as FileID;
  return {
    type: DELETE_FILE,
    meta: {
      optimisticID: resourceId,
      offline: {
        effect: {
          url: `/directory/action`,
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            // Authorization: `Bearer HANDLED_BY_OFFLINE_EFFECT_MIDDLEWARE`,
          },
          data: {
            actions: [action],
          },
        },
        commit: {
          type: DELETE_FILE_COMMIT,
          meta: { optimisticID: resourceId },
        },
        rollback: {
          type: DELETE_FILE_ROLLBACK,
          meta: { optimisticID: resourceId },
        },
      },
    },
  };
};

// Delete Folder
export const deleteFolderAction = (action: DeleteFolderAction) => {
  const resourceId = action.target.resource_id as FolderID;
  return {
    type: DELETE_FOLDER,
    meta: {
      optimisticID: resourceId,
      offline: {
        effect: {
          url: `/directory/action`,
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            // Authorization: `Bearer HANDLED_BY_OFFLINE_EFFECT_MIDDLEWARE`,
          },
          data: {
            actions: [action],
          },
        },
        commit: {
          type: DELETE_FOLDER_COMMIT,
          meta: { optimisticID: resourceId },
        },
        rollback: {
          type: DELETE_FOLDER_ROLLBACK,
          meta: { optimisticID: resourceId },
        },
      },
    },
  };
};

// Copy File
export const copyFileAction = (action: CopyFileAction) => {
  const sourceId = action.target.resource_id as FileID;
  const destinationId = GenerateID.File();

  return {
    type: COPY_FILE,
    meta: {
      optimisticID: sourceId,
      destinationID: destinationId,
      offline: {
        effect: {
          url: `/directory/action`,
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            // Authorization: `Bearer HANDLED_BY_OFFLINE_EFFECT_MIDDLEWARE`,
          },
          data: {
            actions: [action],
          },
        },
        commit: {
          type: COPY_FILE_COMMIT,
          meta: {
            optimisticID: sourceId,
            destinationID: destinationId,
          },
        },
        rollback: {
          type: COPY_FILE_ROLLBACK,
          meta: {
            optimisticID: sourceId,
            destinationID: destinationId,
          },
        },
      },
    },
  };
};

// Copy Folder
export const copyFolderAction = (action: CopyFolderAction) => {
  const sourceId = action.target.resource_id as FolderID;
  const destinationId = GenerateID.Folder();

  return {
    type: COPY_FOLDER,
    meta: {
      optimisticID: sourceId,
      destinationID: destinationId,
      offline: {
        effect: {
          url: `/directory/action`,
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            // Authorization: `Bearer HANDLED_BY_OFFLINE_EFFECT_MIDDLEWARE`,
          },
          data: {
            actions: [action],
          },
        },
        commit: {
          type: COPY_FOLDER_COMMIT,
          meta: {
            optimisticID: sourceId,
            destinationID: destinationId,
          },
        },
        rollback: {
          type: COPY_FOLDER_ROLLBACK,
          meta: {
            optimisticID: sourceId,
            destinationID: destinationId,
          },
        },
      },
    },
  };
};

// Move File
export const moveFileAction = (action: MoveFileAction) => {
  const resourceId = action.target.resource_id as FileID;

  return {
    type: MOVE_FILE,
    meta: {
      optimisticID: resourceId,
      offline: {
        effect: {
          url: `/directory/action`,
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            // Authorization: `Bearer HANDLED_BY_OFFLINE_EFFECT_MIDDLEWARE`,
          },
          data: {
            actions: [action],
          },
        },
        commit: { type: MOVE_FILE_COMMIT, meta: { optimisticID: resourceId } },
        rollback: {
          type: MOVE_FILE_ROLLBACK,
          meta: { optimisticID: resourceId },
        },
      },
    },
  };
};

// Move Folder
export const moveFolderAction = (action: MoveFolderAction) => {
  const resourceId = action.target.resource_id as FolderID;

  return {
    type: MOVE_FOLDER,
    meta: {
      optimisticID: resourceId,
      offline: {
        effect: {
          url: `/directory/action`,
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            // Authorization: `Bearer HANDLED_BY_OFFLINE_EFFECT_MIDDLEWARE`,
          },
          data: {
            actions: [action],
          },
        },
        commit: {
          type: MOVE_FOLDER_COMMIT,
          meta: { optimisticID: resourceId },
        },
        rollback: {
          type: MOVE_FOLDER_ROLLBACK,
          meta: { optimisticID: resourceId },
        },
      },
    },
  };
};

// Restore Trash
export const restoreTrashAction = (action: RestoreTrashAction) => {
  const resourceId = action.target.resource_id as DirectoryResourceID;

  return {
    type: RESTORE_TRASH,
    meta: {
      optimisticID: resourceId,
      offline: {
        effect: {
          url: `/directory/action`,
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            // Authorization: `Bearer HANDLED_BY_OFFLINE_EFFECT_MIDDLEWARE`,
          },
          data: {
            actions: [action],
          },
        },
        commit: {
          type: RESTORE_TRASH_COMMIT,
          meta: { optimisticID: resourceId },
        },
        rollback: {
          type: RESTORE_TRASH_ROLLBACK,
          meta: { optimisticID: resourceId },
        },
      },
    },
  };
};

// Batch Action
export const directoryBatchAction = (directoryActions: DirectoryAction[]) => {
  const actionIds = directoryActions.map((action) => {
    if (action.target.resource_id) {
      return action.target.resource_id;
    } else {
      // Generate ID based on action type
      if (action.action.includes("FILE")) {
        return GenerateID.File();
      } else {
        return GenerateID.Folder();
      }
    }
  });

  // Join all IDs to create a unique batch ID
  const batchId = actionIds.join("_");

  return {
    type: "DIRECTORY_BATCH_ACTION",
    meta: {
      optimisticID: batchId,
      actionIds: actionIds,
      offline: {
        effect: {
          url: `/directory/action`,
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            // Authorization: `Bearer HANDLED_BY_OFFLINE_EFFECT_MIDDLEWARE`,
          },
          data: {
            actions: directoryActions,
          },
        },
        commit: {
          type: "DIRECTORY_BATCH_ACTION_COMMIT",
          meta: {
            optimisticID: batchId,
            actionIds: actionIds,
          },
        },
        rollback: {
          type: "DIRECTORY_BATCH_ACTION_ROLLBACK",
          meta: {
            optimisticID: batchId,
            actionIds: actionIds,
          },
        },
      },
    },
  };
};

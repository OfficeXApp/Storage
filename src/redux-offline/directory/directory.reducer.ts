// src/redux-offline/directory/directory.reducer.ts
import { FileRecord, FolderRecord, FileID, FolderID } from "@officexapp/types";
import {
  GET_FILE,
  GET_FILE_COMMIT,
  GET_FILE_ROLLBACK,
  GET_FOLDER,
  GET_FOLDER_COMMIT,
  GET_FOLDER_ROLLBACK,
  CREATE_FILE,
  CREATE_FILE_COMMIT,
  CREATE_FILE_ROLLBACK,
  CREATE_FOLDER,
  CREATE_FOLDER_COMMIT,
  CREATE_FOLDER_ROLLBACK,
  UPDATE_FILE,
  UPDATE_FILE_COMMIT,
  UPDATE_FILE_ROLLBACK,
  UPDATE_FOLDER,
  UPDATE_FOLDER_COMMIT,
  UPDATE_FOLDER_ROLLBACK,
  DELETE_FILE,
  DELETE_FILE_COMMIT,
  DELETE_FILE_ROLLBACK,
  DELETE_FOLDER,
  DELETE_FOLDER_COMMIT,
  DELETE_FOLDER_ROLLBACK,
  COPY_FILE,
  COPY_FILE_COMMIT,
  COPY_FILE_ROLLBACK,
  COPY_FOLDER,
  COPY_FOLDER_COMMIT,
  COPY_FOLDER_ROLLBACK,
  MOVE_FILE,
  MOVE_FILE_COMMIT,
  MOVE_FILE_ROLLBACK,
  MOVE_FOLDER,
  MOVE_FOLDER_COMMIT,
  MOVE_FOLDER_ROLLBACK,
  RESTORE_TRASH,
  RESTORE_TRASH_COMMIT,
  RESTORE_TRASH_ROLLBACK,
} from "./directory.actions";

export const DIRECTORY_REDUX_KEY = "directory";

export const FILES_DEXIE_TABLE = "files";
export const FOLDERS_DEXIE_TABLE = "folders";

export interface FileFEO extends FileRecord {
  _isOptimistic?: boolean; // flag for optimistic updates
  _optimisticID?: string; // unique ID for optimistic updates
  _syncWarning?: string; // tooltip for users
  _syncConflict?: boolean; // flag for corrupted data due to sync failures
  _syncSuccess?: boolean; // flag for successful sync
  _markedForDeletion?: boolean; // flag for deletion
}

export interface FolderFEO extends FolderRecord {
  _isOptimistic?: boolean; // flag for optimistic updates
  _optimisticID?: string; // unique ID for optimistic updates
  _syncWarning?: string; // tooltip for users
  _syncConflict?: boolean; // flag for corrupted data due to sync failures
  _syncSuccess?: boolean; // flag for successful sync
  _markedForDeletion?: boolean; // flag for deletion
}

interface DirectoryState {
  files: FileFEO[];
  fileMap: Record<FileID, FileFEO>;
  folders: FolderFEO[];
  folderMap: Record<FolderID, FolderFEO>;
  loading: boolean;
  error: string | null;
}

const initialState: DirectoryState = {
  files: [],
  fileMap: {},
  folders: [],
  folderMap: {},
  loading: false,
  error: null,
};

// Helper functions
const updateOrAddFile = (
  files: FileFEO[],
  newFile: FileFEO,
  identifierKey: keyof FileFEO = "id"
): FileFEO[] => {
  const existingIndex = files.findIndex(
    (file) => file[identifierKey] === newFile[identifierKey]
  );

  if (existingIndex !== -1) {
    // Replace existing file
    return [
      ...files.slice(0, existingIndex),
      newFile,
      ...files.slice(existingIndex + 1),
    ];
  } else {
    // Add to the array
    return [newFile, ...files];
  }
};

const updateOrAddFolder = (
  folders: FolderFEO[],
  newFolder: FolderFEO,
  identifierKey: keyof FolderFEO = "id"
): FolderFEO[] => {
  const existingIndex = folders.findIndex(
    (folder) => folder[identifierKey] === newFolder[identifierKey]
  );

  if (existingIndex !== -1) {
    // Replace existing folder
    return [
      ...folders.slice(0, existingIndex),
      newFolder,
      ...folders.slice(existingIndex + 1),
    ];
  } else {
    // Add to the array
    return [newFolder, ...folders];
  }
};

export const directoryReducer = (
  state = initialState,
  action: any
): DirectoryState => {
  switch (action.type) {
    // ------------------------------ GET FILE --------------------------------- //
    case GET_FILE: {
      return {
        ...state,
        files: action.optimistic
          ? updateOrAddFile(state.files, action.optimistic)
          : state.files,
        fileMap: action.optimistic
          ? {
              ...state.fileMap,
              [action.optimistic.id]: action.optimistic,
            }
          : state.fileMap,
        loading: true,
        error: null,
      };
    }

    case GET_FILE_COMMIT: {
      const optimisticID = action.meta?.optimisticID;
      let realFile;

      // Extract file from payload - handle different response structures
      if (action.payload?.ok?.data?.result?.file) {
        realFile = action.payload.ok.data.result.file;
      } else if (
        action.payload?.ok?.data?.actions?.[0]?.response?.result?.file
      ) {
        realFile = action.payload.ok.data.actions[0].response.result.file;
      } else if (action.payload?.ok?.data?.items?.[0]) {
        realFile = action.payload.ok.data.items[0];
      }

      if (!realFile) {
        return {
          ...state,
          loading: false,
        };
      }

      return {
        ...state,
        files: state.files.map((file) => {
          if (file._optimisticID === optimisticID) {
            return realFile;
          }
          return file;
        }),
        fileMap: {
          ...state.fileMap,
          [realFile.id]: realFile,
        },
        loading: false,
      };
    }

    case GET_FILE_ROLLBACK: {
      const optimisticID = action.meta?.optimisticID;
      return {
        ...state,
        files: state.files.map((file) => {
          if (file._optimisticID === optimisticID) {
            return {
              ...file,
              _syncWarning: action.error_message,
              _syncSuccess: false,
              _syncConflict: true,
              _isOptimistic: false,
            };
          }
          return file;
        }),
        loading: false,
        error: action.error_message || "Failed to fetch file",
      };
    }

    // ------------------------------ GET FOLDER --------------------------------- //
    case GET_FOLDER: {
      return {
        ...state,
        folders: action.optimistic
          ? updateOrAddFolder(state.folders, action.optimistic)
          : state.folders,
        folderMap: action.optimistic
          ? {
              ...state.folderMap,
              [action.optimistic.id]: action.optimistic,
            }
          : state.folderMap,
        loading: true,
        error: null,
      };
    }

    case GET_FOLDER_COMMIT: {
      const optimisticID = action.meta?.optimisticID;
      let realFolder;

      // Extract folder from payload - handle different response structures
      if (action.payload?.ok?.data?.result?.folder) {
        realFolder = action.payload.ok.data.result.folder;
      } else if (
        action.payload?.ok?.data?.actions?.[0]?.response?.result?.folder
      ) {
        realFolder = action.payload.ok.data.actions[0].response.result.folder;
      } else if (action.payload?.ok?.data?.items?.[0]) {
        realFolder = action.payload.ok.data.items[0];
      }

      if (!realFolder) {
        return {
          ...state,
          loading: false,
        };
      }

      return {
        ...state,
        folders: state.folders.map((folder) => {
          if (folder._optimisticID === optimisticID) {
            return realFolder;
          }
          return folder;
        }),
        folderMap: {
          ...state.folderMap,
          [realFolder.id]: realFolder,
        },
        loading: false,
      };
    }

    case GET_FOLDER_ROLLBACK: {
      const optimisticID = action.meta?.optimisticID;
      return {
        ...state,
        folders: state.folders.map((folder) => {
          if (folder._optimisticID === optimisticID) {
            return {
              ...folder,
              _syncWarning: action.error_message,
              _syncSuccess: false,
              _syncConflict: true,
              _isOptimistic: false,
            };
          }
          return folder;
        }),
        loading: false,
        error: action.error_message || "Failed to fetch folder",
      };
    }

    // ------------------------------ CREATE FILE --------------------------------- //
    case CREATE_FILE: {
      const optimisticFile = action.optimistic;
      return {
        ...state,
        files: optimisticFile
          ? updateOrAddFile(state.files, optimisticFile, "_optimisticID")
          : state.files,
        loading: true,
        error: null,
      };
    }

    case CREATE_FILE_COMMIT: {
      const optimisticID = action.meta?.optimisticID;
      let realFile;

      // Extract file from payload - handle different response structures
      if (action.payload?.ok?.data?.result?.file) {
        realFile = action.payload.ok.data.result.file;
      } else if (
        action.payload?.ok?.data?.actions?.[0]?.response?.result?.file
      ) {
        realFile = action.payload.ok.data.actions[0].response.result.file;
      } else if (action.payload?.ok?.data?.result) {
        realFile = action.payload.ok.data.result;
      }

      if (!realFile) {
        return {
          ...state,
          loading: false,
        };
      }

      const newFile = {
        ...realFile,
        _syncSuccess: true,
        _syncConflict: false,
        _syncWarning: "",
        _isOptimistic: false,
      };

      const filteredFiles = state.files.filter(
        (file) => file._optimisticID !== optimisticID
      );

      return {
        ...state,
        files: updateOrAddFile(filteredFiles, newFile),
        fileMap: {
          ...state.fileMap,
          [newFile.id]: newFile,
        },
        loading: false,
      };
    }

    case CREATE_FILE_ROLLBACK: {
      const optimisticID = action.meta?.optimisticID;
      return {
        ...state,
        files: state.files.map((file) => {
          if (file._optimisticID === optimisticID) {
            return {
              ...file,
              _syncWarning: action.error_message,
              _syncSuccess: false,
              _syncConflict: true,
              _isOptimistic: false,
            };
          }
          return file;
        }),
        loading: false,
        error: action.error_message || "Failed to create file",
      };
    }

    // ------------------------------ CREATE FOLDER --------------------------------- //
    case CREATE_FOLDER: {
      const optimisticFolder = action.optimistic;
      return {
        ...state,
        folders: optimisticFolder
          ? updateOrAddFolder(state.folders, optimisticFolder, "_optimisticID")
          : state.folders,
        loading: true,
        error: null,
      };
    }

    case CREATE_FOLDER_COMMIT: {
      const optimisticID = action.meta?.optimisticID;
      let realFolder;

      // Extract folder from payload - handle different response structures
      if (action.payload?.ok?.data?.result?.folder) {
        realFolder = action.payload.ok.data.result.folder;
      } else if (
        action.payload?.ok?.data?.actions?.[0]?.response?.result?.folder
      ) {
        realFolder = action.payload.ok.data.actions[0].response.result.folder;
      } else if (action.payload?.ok?.data?.result) {
        realFolder = action.payload.ok.data.result;
      }

      if (!realFolder) {
        return {
          ...state,
          loading: false,
        };
      }

      const newFolder = {
        ...realFolder,
        _syncSuccess: true,
        _syncConflict: false,
        _syncWarning: "",
        _isOptimistic: false,
      };

      const filteredFolders = state.folders.filter(
        (folder) => folder._optimisticID !== optimisticID
      );

      return {
        ...state,
        folders: updateOrAddFolder(filteredFolders, newFolder),
        folderMap: {
          ...state.folderMap,
          [newFolder.id]: newFolder,
        },
        loading: false,
      };
    }

    case CREATE_FOLDER_ROLLBACK: {
      const optimisticID = action.meta?.optimisticID;
      return {
        ...state,
        folders: state.folders.map((folder) => {
          if (folder._optimisticID === optimisticID) {
            return {
              ...folder,
              _syncWarning: action.error_message,
              _syncSuccess: false,
              _syncConflict: true,
              _isOptimistic: false,
            };
          }
          return folder;
        }),
        loading: false,
        error: action.error_message || "Failed to create folder",
      };
    }

    // ------------------------------ UPDATE FILE --------------------------------- //
    case UPDATE_FILE: {
      const optimisticFile = action.optimistic;
      return {
        ...state,
        files: optimisticFile
          ? updateOrAddFile(state.files, optimisticFile)
          : state.files,
        loading: true,
        error: null,
      };
    }

    case UPDATE_FILE_COMMIT: {
      const optimisticID = action.meta?.optimisticID;
      let realFile;

      // Extract file from payload - handle different response structures
      if (action.payload?.ok?.data?.result?.file) {
        realFile = action.payload.ok.data.result.file;
      } else if (
        action.payload?.ok?.data?.actions?.[0]?.response?.result?.file
      ) {
        realFile = action.payload.ok.data.actions[0].response.result.file;
      } else if (action.payload?.ok?.data?.result) {
        realFile = action.payload.ok.data.result;
      }

      if (!realFile) {
        return {
          ...state,
          loading: false,
        };
      }

      return {
        ...state,
        files: state.files.map((file) => {
          if (file._optimisticID === optimisticID) {
            return {
              ...realFile,
              _syncSuccess: true,
              _syncConflict: false,
              _syncWarning: "",
              _isOptimistic: false,
            };
          }
          return file;
        }),
        fileMap: {
          ...state.fileMap,
          [realFile.id]: {
            ...realFile,
            _syncSuccess: true,
            _syncConflict: false,
            _syncWarning: "",
            _isOptimistic: false,
          },
        },
        loading: false,
      };
    }

    case UPDATE_FILE_ROLLBACK: {
      const optimisticID = action.meta?.optimisticID;
      return {
        ...state,
        files: state.files.map((file) => {
          if (file._optimisticID === optimisticID) {
            return {
              ...file,
              _syncWarning: action.error_message,
              _syncSuccess: false,
              _syncConflict: true,
              _isOptimistic: false,
            };
          }
          return file;
        }),
        loading: false,
        error: action.error_message || "Failed to update file",
      };
    }

    // ------------------------------ UPDATE FOLDER --------------------------------- //
    case UPDATE_FOLDER: {
      const optimisticFolder = action.optimistic;
      return {
        ...state,
        folders: optimisticFolder
          ? updateOrAddFolder(state.folders, optimisticFolder)
          : state.folders,
        loading: true,
        error: null,
      };
    }

    case UPDATE_FOLDER_COMMIT: {
      const optimisticID = action.meta?.optimisticID;
      let realFolder;

      // Extract folder from payload - handle different response structures
      if (action.payload?.ok?.data?.result?.folder) {
        realFolder = action.payload.ok.data.result.folder;
      } else if (
        action.payload?.ok?.data?.actions?.[0]?.response?.result?.folder
      ) {
        realFolder = action.payload.ok.data.actions[0].response.result.folder;
      } else if (action.payload?.ok?.data?.result) {
        realFolder = action.payload.ok.data.result;
      }

      if (!realFolder) {
        return {
          ...state,
          loading: false,
        };
      }

      return {
        ...state,
        folders: state.folders.map((folder) => {
          if (folder._optimisticID === optimisticID) {
            return {
              ...realFolder,
              _syncSuccess: true,
              _syncConflict: false,
              _syncWarning: "",
              _isOptimistic: false,
            };
          }
          return folder;
        }),
        folderMap: {
          ...state.folderMap,
          [realFolder.id]: {
            ...realFolder,
            _syncSuccess: true,
            _syncConflict: false,
            _syncWarning: "",
            _isOptimistic: false,
          },
        },
        loading: false,
      };
    }

    case UPDATE_FOLDER_ROLLBACK: {
      const optimisticID = action.meta?.optimisticID;
      return {
        ...state,
        folders: state.folders.map((folder) => {
          if (folder._optimisticID === optimisticID) {
            return {
              ...folder,
              _syncWarning: action.error_message,
              _syncSuccess: false,
              _syncConflict: true,
              _isOptimistic: false,
            };
          }
          return folder;
        }),
        loading: false,
        error: action.error_message || "Failed to update folder",
      };
    }

    // ------------------------------ DELETE FILE --------------------------------- //
    case DELETE_FILE: {
      const optimisticFile = action.optimistic;
      return {
        ...state,
        files: optimisticFile
          ? updateOrAddFile(state.files, optimisticFile)
          : state.files,
        loading: true,
        error: null,
      };
    }

    case DELETE_FILE_COMMIT: {
      const optimisticID = action.meta?.optimisticID;
      return {
        ...state,
        files: state.files.filter(
          (file) => file._optimisticID !== optimisticID
        ),
        loading: false,
      };
    }

    case DELETE_FILE_ROLLBACK: {
      const optimisticID = action.meta?.optimisticID;
      return {
        ...state,
        files: state.files.map((file) => {
          if (file._optimisticID === optimisticID) {
            return {
              ...file,
              _syncWarning: action.error_message,
              _syncSuccess: false,
              _syncConflict: true,
              _isOptimistic: false,
              _markedForDeletion: false,
              deleted: false,
            };
          }
          return file;
        }),
        loading: false,
        error: action.error_message || "Failed to delete file",
      };
    }

    // ------------------------------ DELETE FOLDER --------------------------------- //
    case DELETE_FOLDER: {
      const optimisticFolder = action.optimistic;
      return {
        ...state,
        folders: optimisticFolder
          ? updateOrAddFolder(state.folders, optimisticFolder)
          : state.folders,
        loading: true,
        error: null,
      };
    }

    case DELETE_FOLDER_COMMIT: {
      const optimisticID = action.meta?.optimisticID;
      return {
        ...state,
        folders: state.folders.filter(
          (folder) => folder._optimisticID !== optimisticID
        ),
        loading: false,
      };
    }

    case DELETE_FOLDER_ROLLBACK: {
      const optimisticID = action.meta?.optimisticID;
      return {
        ...state,
        folders: state.folders.map((folder) => {
          if (folder._optimisticID === optimisticID) {
            return {
              ...folder,
              _syncWarning: action.error_message,
              _syncSuccess: false,
              _syncConflict: true,
              _isOptimistic: false,
              _markedForDeletion: false,
              deleted: false,
            };
          }
          return folder;
        }),
        loading: false,
        error: action.error_message || "Failed to delete folder",
      };
    }

    // ------------------------------ MOVE FILE --------------------------------- //
    case MOVE_FILE: {
      const optimisticFile = action.optimistic;
      return {
        ...state,
        files: optimisticFile
          ? updateOrAddFile(state.files, optimisticFile)
          : state.files,
        loading: true,
        error: null,
      };
    }

    case MOVE_FILE_COMMIT: {
      const optimisticID = action.meta?.optimisticID;
      let realFile;

      // Extract file from payload - handle different response structures
      if (action.payload?.ok?.data?.result?.file) {
        realFile = action.payload.ok.data.result.file;
      } else if (
        action.payload?.ok?.data?.actions?.[0]?.response?.result?.file
      ) {
        realFile = action.payload.ok.data.actions[0].response.result.file;
      } else if (action.payload?.ok?.data?.result) {
        realFile = action.payload.ok.data.result;
      }

      if (!realFile) {
        return {
          ...state,
          loading: false,
        };
      }

      const filteredFiles = state.files.filter(
        (file) => file._optimisticID !== optimisticID
      );

      return {
        ...state,
        files: updateOrAddFile(filteredFiles, {
          ...realFile,
          _syncSuccess: true,
          _syncConflict: false,
          _syncWarning: "",
          _isOptimistic: false,
        }),
        fileMap: {
          ...state.fileMap,
          [realFile.id]: {
            ...realFile,
            _syncSuccess: true,
            _syncConflict: false,
            _syncWarning: "",
            _isOptimistic: false,
          },
        },
        loading: false,
      };
    }

    case MOVE_FILE_ROLLBACK: {
      const optimisticID = action.meta?.optimisticID;
      return {
        ...state,
        files: state.files.map((file) => {
          if (file._optimisticID === optimisticID) {
            return {
              ...file,
              _syncWarning: action.error_message,
              _syncSuccess: false,
              _syncConflict: true,
              _isOptimistic: false,
            };
          }
          return file;
        }),
        loading: false,
        error: action.error_message || "Failed to move file",
      };
    }

    // ------------------------------ MOVE FOLDER --------------------------------- //
    case MOVE_FOLDER: {
      const optimisticFolder = action.optimistic;
      return {
        ...state,
        folders: optimisticFolder
          ? updateOrAddFolder(state.folders, optimisticFolder)
          : state.folders,
        loading: true,
        error: null,
      };
    }

    case MOVE_FOLDER_COMMIT: {
      const optimisticID = action.meta?.optimisticID;
      let realFolder;

      // Extract folder from payload - handle different response structures
      if (action.payload?.ok?.data?.result?.folder) {
        realFolder = action.payload.ok.data.result.folder;
      } else if (
        action.payload?.ok?.data?.actions?.[0]?.response?.result?.folder
      ) {
        realFolder = action.payload.ok.data.actions[0].response.result.folder;
      } else if (action.payload?.ok?.data?.result) {
        realFolder = action.payload.ok.data.result;
      }

      if (!realFolder) {
        return {
          ...state,
          loading: false,
        };
      }

      const filteredFolders = state.folders.filter(
        (folder) => folder._optimisticID !== optimisticID
      );

      return {
        ...state,
        folders: updateOrAddFolder(filteredFolders, {
          ...realFolder,
          _syncSuccess: true,
          _syncConflict: false,
          _syncWarning: "",
          _isOptimistic: false,
        }),
        folderMap: {
          ...state.folderMap,
          [realFolder.id]: {
            ...realFolder,
            _syncSuccess: true,
            _syncConflict: false,
            _syncWarning: "",
            _isOptimistic: false,
          },
        },
        loading: false,
      };
    }

    case MOVE_FOLDER_ROLLBACK: {
      const optimisticID = action.meta?.optimisticID;
      return {
        ...state,
        folders: state.folders.map((folder) => {
          if (folder._optimisticID === optimisticID) {
            return {
              ...folder,
              _syncWarning: action.error_message,
              _syncSuccess: false,
              _syncConflict: true,
              _isOptimistic: false,
            };
          }
          return folder;
        }),
        loading: false,
        error: action.error_message || "Failed to move folder",
      };
    }

    // ------------------------------ COPY FILE --------------------------------- //
    case COPY_FILE: {
      const optimisticFile = action.optimistic;
      return {
        ...state,
        files: optimisticFile
          ? updateOrAddFile(state.files, optimisticFile)
          : state.files,
        loading: true,
        error: null,
      };
    }

    case COPY_FILE_COMMIT: {
      const destinationId = action.meta?.destinationID;
      let realFile;

      // Extract file from payload - handle different response structures
      if (action.payload?.ok?.data?.result?.file) {
        realFile = action.payload.ok.data.result.file;
      } else if (
        action.payload?.ok?.data?.actions?.[0]?.response?.result?.file
      ) {
        realFile = action.payload.ok.data.actions[0].response.result.file;
      } else if (action.payload?.ok?.data?.result) {
        realFile = action.payload.ok.data.result;
      }

      if (!realFile) {
        return {
          ...state,
          loading: false,
        };
      }

      const filteredFiles = state.files.filter(
        (file) => file._optimisticID !== destinationId
      );

      return {
        ...state,
        files: updateOrAddFile(filteredFiles, {
          ...realFile,
          _syncSuccess: true,
          _syncConflict: false,
          _syncWarning: "",
          _isOptimistic: false,
        }),
        fileMap: {
          ...state.fileMap,
          [realFile.id]: {
            ...realFile,
            _syncSuccess: true,
            _syncConflict: false,
            _syncWarning: "",
            _isOptimistic: false,
          },
        },
        loading: false,
      };
    }

    case COPY_FILE_ROLLBACK: {
      const destinationId = action.meta?.destinationID;
      return {
        ...state,
        files: state.files.map((file) => {
          if (file._optimisticID === destinationId) {
            return {
              ...file,
              _syncWarning: action.error_message,
              _syncSuccess: false,
              _syncConflict: true,
              _isOptimistic: false,
            };
          }
          return file;
        }),
        loading: false,
        error: action.error_message || "Failed to copy file",
      };
    }

    // ------------------------------ COPY FOLDER --------------------------------- //
    case COPY_FOLDER: {
      const optimisticFolder = action.optimistic;
      return {
        ...state,
        folders: optimisticFolder
          ? updateOrAddFolder(state.folders, optimisticFolder)
          : state.folders,
        loading: true,
        error: null,
      };
    }

    case COPY_FOLDER_COMMIT: {
      const destinationId = action.meta?.destinationID;
      let realFolder;
      let copiedItems: any = {
        files: [],
        folders: [],
      };

      // Extract the folder and potentially copied items from the response
      if (action.payload?.ok?.data?.result?.folder) {
        realFolder = action.payload.ok.data.result.folder;
      } else if (
        action.payload?.ok?.data?.actions?.[0]?.response?.result?.folder
      ) {
        realFolder = action.payload.ok.data.actions[0].response.result.folder;
      } else if (action.payload?.ok?.data?.result) {
        realFolder = action.payload.ok.data.result;
      }

      // Look for copied items in the response
      if (action.payload?.ok?.data?.result?.copied_files) {
        copiedItems.files = action.payload.ok.data.result.copied_files;
      } else if (action.payload?.ok?.data?.result?.copied_folders) {
        copiedItems.folders = action.payload.ok.data.result.copied_folders;
      } else if (
        action.payload?.ok?.data?.actions?.[0]?.response?.result?.copied_items
      ) {
        copiedItems =
          action.payload.ok.data.actions[0].response.result.copied_items;
      }

      if (!realFolder) {
        return {
          ...state,
          loading: false,
        };
      }

      let updatedFileMap = { ...state.fileMap };
      let updatedFiles = [...state.files];

      // Process any copied files
      if (copiedItems.files && Array.isArray(copiedItems.files)) {
        copiedItems.files.forEach((file: FileFEO) => {
          const enhancedFile = {
            ...file,
            _syncSuccess: true,
            _syncConflict: false,
            _syncWarning: "",
            _isOptimistic: false,
          };
          updatedFiles = updateOrAddFile(updatedFiles, enhancedFile);
          updatedFileMap[file.id] = enhancedFile;
        });
      }

      let updatedFolderMap = { ...state.folderMap };
      let updatedFolders = state.folders.filter(
        (folder) => folder._optimisticID !== destinationId
      );

      // Process any copied folders
      if (copiedItems.folders && Array.isArray(copiedItems.folders)) {
        copiedItems.folders.forEach((folder: FolderFEO) => {
          const enhancedFolder = {
            ...folder,
            _syncSuccess: true,
            _syncConflict: false,
            _syncWarning: "",
            _isOptimistic: false,
          };
          updatedFolders = updateOrAddFolder(updatedFolders, enhancedFolder);
          updatedFolderMap[folder.id] = enhancedFolder;
        });
      }

      // Add the main copied folder
      updatedFolders = updateOrAddFolder(updatedFolders, {
        ...realFolder,
        _syncSuccess: true,
        _syncConflict: false,
        _syncWarning: "",
        _isOptimistic: false,
      });

      updatedFolderMap[realFolder.id] = {
        ...realFolder,
        _syncSuccess: true,
        _syncConflict: false,
        _syncWarning: "",
        _isOptimistic: false,
      };

      return {
        ...state,
        files: updatedFiles,
        fileMap: updatedFileMap,
        folders: updatedFolders,
        folderMap: updatedFolderMap,
        loading: false,
      };
    }

    case COPY_FOLDER_ROLLBACK: {
      const destinationId = action.meta?.destinationID;
      return {
        ...state,
        folders: state.folders.map((folder) => {
          if (folder._optimisticID === destinationId) {
            return {
              ...folder,
              _syncWarning: action.error_message,
              _syncSuccess: false,
              _syncConflict: true,
              _isOptimistic: false,
            };
          }
          return folder;
        }),
        loading: false,
        error: action.error_message || "Failed to copy folder",
      };
    }

    // ------------------------------ RESTORE TRASH --------------------------------- //
    case RESTORE_TRASH: {
      const optimisticFolder = action.optimistic;
      return {
        ...state,
        folders: optimisticFolder
          ? updateOrAddFolder(state.folders, optimisticFolder)
          : state.folders,
        loading: true,
        error: null,
      };
    }

    default:
      return state;
  }
};

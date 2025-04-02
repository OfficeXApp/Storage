// src/redux-offline/directory/directory.reducer.ts
import {
  FileRecord,
  FolderRecord,
  FileID,
  FolderID,
  FileRecordFE,
  FolderRecordFE,
  DiskID,
} from "@officexapp/types";
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
  LIST_DIRECTORY_ROLLBACK,
  LIST_DIRECTORY_COMMIT,
  LIST_DIRECTORY,
} from "./directory.actions";
import {
  defaultBrowserCacheDiskID,
  defaultTempCloudSharingDiskID,
  DirectoryListQueryString,
} from "../../api/dexie-database";
import { DiskFEO } from "../disks/disks.reducer";

export const DIRECTORY_REDUX_KEY = "directory";

export const FILES_DEXIE_TABLE = "files";
export const FOLDERS_DEXIE_TABLE = "folders";

export const shouldBehaveOfflineDiskUIIntent = (diskID: DiskID) => {
  if (
    diskID === defaultBrowserCacheDiskID ||
    diskID === defaultTempCloudSharingDiskID
  ) {
    return true;
  } else if (!diskID) {
    return true;
  } else {
    return false;
  }
};

export interface FileFEO extends FileRecordFE {
  _isOptimistic?: boolean; // flag for optimistic updates
  _optimisticID?: string; // unique ID for optimistic updates
  _syncWarning?: string; // tooltip for users
  _syncConflict?: boolean; // flag for corrupted data due to sync failures
  _syncSuccess?: boolean; // flag for successful sync
  _markedForDeletion?: boolean; // flag for deletion
}

export interface FolderFEO extends FolderRecordFE {
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
  listingDataMap: Record<
    DirectoryListQueryString,
    {
      folders: FolderFEO[];
      files: FileFEO[];
      totalFiles: number;
      totalFolders: number;
      cursor: string | null;
      isLoading: boolean;
      error: string | null;
      lastUpdated: number;
    }
  >;
}

const initialState: DirectoryState = {
  files: [],
  fileMap: {},
  folders: [],
  folderMap: {},
  loading: false,
  error: null,
  listingDataMap: {},
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
    case LIST_DIRECTORY: {
      console.log("LIST_DIRECTORY reducer", action);
      let listDirectoryKey = action.meta?.listDirectoryKey;

      const shouldBehaveOfflineDisk =
        action.meta.offline.effect.headers.shouldBehaveOfflineDiskUI;
      let hasExistingResults = state.listingDataMap[listDirectoryKey];

      if (action.optimistic) {
        return {
          ...state,
          listingDataMap: {
            ...state.listingDataMap,
            [listDirectoryKey]: {
              ...action.optimistic,
              isLoading: !shouldBehaveOfflineDisk && !hasExistingResults,
            },
          },
        };
      }

      return {
        ...state,
        loading: true,
        error: null,
      };
    }

    case LIST_DIRECTORY_COMMIT: {
      console.log(`LIST_DIRECTORY_COMMIT reducer`, action);
      let listDirectoryKey = action.meta?.listDirectoryKey;
      const response = action.payload;

      if (!response) {
        return {
          ...state,
          loading: false,
        };
      }

      const processedFiles = response.files.map((file: FileRecordFE) => ({
        ...file,
        _syncSuccess: true,
        _syncConflict: false,
        _syncWarning: "",
        _isOptimistic: false,
      }));

      const processedFolders = response.folders.map(
        (folder: FolderRecordFE) => ({
          ...folder,
          _syncSuccess: true,
          _syncConflict: false,
          _syncWarning: "",
          _isOptimistic: false,
        })
      );

      const updatedFileMap = { ...state.fileMap };
      processedFiles.forEach((file: FileFEO) => {
        updatedFileMap[file.id] = file;
      });

      const updatedFolderMap = { ...state.folderMap };
      processedFolders.forEach((folder: FolderFEO) => {
        updatedFolderMap[folder.id] = folder;
      });

      return {
        ...state,
        listingDataMap: {
          ...state.listingDataMap,
          [listDirectoryKey]: action.payload,
        },
        files: [
          ...state.files.filter(
            (file) =>
              !processedFiles.some((newFile: FileFEO) => newFile.id === file.id)
          ),
          ...processedFiles,
        ],
        folders: [
          ...state.folders.filter(
            (folder) =>
              !processedFolders.some(
                (newFolder: FolderFEO) => newFolder.id === folder.id
              )
          ),
          ...processedFolders,
        ],
        fileMap: updatedFileMap,
        folderMap: updatedFolderMap,
        loading: false,
        error: null,
      };
    }

    case LIST_DIRECTORY_ROLLBACK: {
      console.log(`LIST_DIRECTORY_ROLLBACK reducer`, action);
      console.log(`state`, state);
      if (!action.payload.response) return state;
      let errorMessage = "Failed to list directory contents";

      try {
        if (action.payload?.response) {
          const err = action.payload.response.json();
          errorMessage = err.err?.message || errorMessage;
        }
      } catch (e) {
        console.error("Error parsing error response:", e);
      }

      let listDirectoryKey = action.meta?.listDirectoryKey;

      return {
        ...state,
        listingDataMap: {
          ...state.listingDataMap,
          [listDirectoryKey]: {
            ...state.listingDataMap[listDirectoryKey],
            isLoading: false,
            error: errorMessage,
          },
        },
        loading: false,
        error: errorMessage,
      };
    }

    // ------------------------------ GET FILE --------------------------------- //
    case GET_FILE: {
      console.log(`GET_FILE reducer`, action);
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
      console.log(`GET_FILE_COMMIT reducer`, action);

      const optimisticID = action.meta?.optimisticID;
      let realFile;

      // Extract file from payload - handle different response structures
      // this hydra mutant if statements is AI slop that needs to be cleaned up
      if (action.payload?.ok?.data?.result?.file) {
        realFile = action.payload.ok.data.result.file;
      } else if (
        action.payload?.ok?.data?.actions?.[0]?.response?.result?.file
      ) {
        realFile = action.payload.ok.data.actions[0].response.result.file;
      } else if (action.payload?.ok?.data?.items?.[0]) {
        realFile = action.payload.ok.data.items[0];
      } else if (action.payload[0].response.result) {
        realFile = action.payload[0].response.result;
      }
      console.log(`GET_FILE_COMMIT realFile`, realFile);
      if (!realFile) {
        const newFileMap = state.fileMap;
        delete newFileMap[optimisticID];
        return {
          ...state,
          files: state.files.filter((file) => {
            return file.id !== optimisticID;
          }),
          fileMap: newFileMap,
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
      if (!action.payload.response) return state;
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
      if (!action.payload.response) return state;
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
      console.log(`CREATE_FILE reducer`, action);
      const optimisticFile = action.optimistic;
      return {
        ...state,
        files: optimisticFile
          ? updateOrAddFile(state.files, optimisticFile, "_optimisticID")
          : state.files,
        fileMap: {
          ...state.fileMap,
          [optimisticFile.id]: optimisticFile,
        },
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

      console.log(`newFile COMMIT`, newFile);

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
      if (!action.payload.response) return state;
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
      console.log(`CREATE_FOLDER reducer`, action);
      const optimisticFolder = action.optimistic;
      const listDirectoryKey = action.meta?.listDirectoryKey;

      let updatedState = {
        ...state,
        folders: optimisticFolder
          ? updateOrAddFolder(state.folders, optimisticFolder, "_optimisticID")
          : state.folders,
        loading: true,
        error: null,
      };

      // If we have a listDirectoryKey and the optimistic folder, update that view too
      if (listDirectoryKey && optimisticFolder) {
        const currentListing = state.listingDataMap[listDirectoryKey];

        if (currentListing) {
          updatedState = {
            ...updatedState,
            listingDataMap: {
              ...state.listingDataMap,
              [listDirectoryKey]: {
                ...currentListing,
                // Add the optimistic folder to the listing
                folders: updateOrAddFolder(
                  currentListing.folders,
                  optimisticFolder,
                  "_optimisticID"
                ),
                totalFolders: currentListing.totalFolders + 1,
              },
            },
          };
        }
      }

      return updatedState;
    }

    case CREATE_FOLDER_COMMIT: {
      console.log(`CREATE_FOLDER_COMMIT reducer`, action);
      const optimisticID = action.meta?.optimisticID;
      const listDirectoryKey = action.meta?.listDirectoryKey;
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

      let updatedState = {
        ...state,
        folders: updateOrAddFolder(filteredFolders, newFolder),
        folderMap: {
          ...state.folderMap,
          [newFolder.id]: newFolder,
        },
        loading: false,
      };

      // Update the corresponding listDirectory view if we have a listDirectoryKey
      if (listDirectoryKey) {
        const currentListing = state.listingDataMap[listDirectoryKey];

        if (currentListing) {
          const filteredListingFolders = currentListing.folders.filter(
            (folder) => folder._optimisticID !== optimisticID
          );

          updatedState = {
            ...updatedState,
            listingDataMap: {
              ...state.listingDataMap,
              [listDirectoryKey]: {
                ...currentListing,
                // Replace the optimistic folder with the real one
                folders: updateOrAddFolder(filteredListingFolders, newFolder),
              },
            },
          };
        }
      }

      return updatedState;
    }

    case CREATE_FOLDER_ROLLBACK: {
      console.log(`CREATE_FOLDER_ROLLBACK reducer`, action);
      if (!action.payload.response) return state;

      const optimisticID = action.meta?.optimisticID;
      const listDirectoryKey = action.meta?.listDirectoryKey;

      let updatedState = {
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

      // Update the corresponding listDirectory view if we have a listDirectoryKey
      if (listDirectoryKey) {
        const currentListing = state.listingDataMap[listDirectoryKey];

        if (currentListing) {
          updatedState = {
            ...updatedState,
            listingDataMap: {
              ...state.listingDataMap,
              [listDirectoryKey]: {
                ...currentListing,
                // Update the folder in the listing to show the sync conflict
                folders: currentListing.folders.map((folder) => {
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
              },
            },
          };
        }
      }

      return updatedState;
    }

    // ------------------------------ UPDATE FILE --------------------------------- //
    case UPDATE_FILE: {
      const optimisticFile = action.optimistic;
      return {
        ...state,
        files: optimisticFile
          ? updateOrAddFile(state.files, optimisticFile)
          : state.files,
        fileMap: {
          ...state.fileMap,
          [optimisticFile.id]: optimisticFile,
        },
        loading: true,
        error: null,
      };
    }

    case UPDATE_FILE_COMMIT: {
      console.log(`UPDATE_FILE_COMMIT reducer`, action);
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
      if (!action.payload.response) return state;
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
        folderMap: {
          ...state.folderMap,
          [optimisticFolder.id]: optimisticFolder,
        },
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
      if (!action.payload.response) return state;
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
      if (!action.payload.response) return state;
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
      if (!action.payload.response) return state;
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
      if (!action.payload.response) return state;
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
      if (!action.payload.response) return state;
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
      if (!action.payload.response) return state;
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
      if (!action.payload.response) return state;
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

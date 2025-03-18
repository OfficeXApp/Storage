// src/redux-offline/directory/directory.optimistic.ts

import { AnyAction, Dispatch, Middleware, MiddlewareAPI } from "redux";
import { getDexieDb, markSyncConflict } from "../../api/dexie-database";
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
  LIST_DIRECTORY,
  LIST_DIRECTORY_COMMIT,
  LIST_DIRECTORY_ROLLBACK,
} from "./directory.actions";
import {
  AuthProfile,
  IndexDB_ApiKey,
  IndexDB_Organization,
  IndexDB_Profile,
} from "../../framework/identity";
import {
  FileFEO,
  FolderFEO,
  FILES_DEXIE_TABLE,
  FOLDERS_DEXIE_TABLE,
  DIRECTORY_LIST_QUERY_RESULTS_TABLE,
} from "./directory.reducer";
import _ from "lodash";
import {
  DirectoryResourceID,
  FileID,
  FolderID,
  DirectoryActionOutcome,
  FileRecord,
  FolderRecord,
  FileRecordFE,
  FolderRecordFE,
} from "@officexapp/types";

export interface DirectoryListCacheEntry {
  listQueryString: string;
  folders: FolderFEO[];
  files: FileFEO[];
  totalFiles: number;
  totalFolders: number;
  cursor: string | null;
  last_updated_date_ms: number;
}

/**
 * Middleware for handling optimistic updates for the directory tables (files and folders)
 */
export const directoryOptimisticDexieMiddleware = (currentIdentitySet: {
  currentOrg: IndexDB_Organization;
  currentProfile: AuthProfile;
  currentAPIKey: IndexDB_ApiKey | null;
}): Middleware => {
  // @ts-ignore
  return (store: MiddlewareAPI<Dispatch, any>) =>
    (next: Dispatch<AnyAction>) =>
    async (action: AnyAction) => {
      // Skip actions we don't care about

      const directoryActions = [
        LIST_DIRECTORY,
        LIST_DIRECTORY_COMMIT,
        LIST_DIRECTORY_ROLLBACK,
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
      ];

      if (!directoryActions.includes(action.type)) {
        return next(action);
      }

      const userID = currentIdentitySet.currentProfile?.userID;
      const orgID = currentIdentitySet.currentOrg?.driveID;

      // Skip if we don't have identity info
      if (!userID || !orgID) {
        console.warn(
          `Missing identity info for ${action.type}. Skipping optimistic update.`
        );
        return next(action);
      }

      // Get db instance for this user+org pair
      const db = getDexieDb(userID, orgID);
      const filesTable = db.table<FileFEO, string>(FILES_DEXIE_TABLE);
      const foldersTable = db.table<FolderFEO, string>(FOLDERS_DEXIE_TABLE);
      let enhancedAction = action;

      try {
        // Process action based on type
        switch (action.type) {
          // ------------------------------ LIST DIRECTORY --------------------------------- //
          case LIST_DIRECTORY: {
            const listQueryString = action.meta.listQueryString;
            console.log(`listQueryString`, listQueryString);
            try {
              const listCacheTable = db.table<DirectoryListCacheEntry, string>(
                DIRECTORY_LIST_QUERY_RESULTS_TABLE
              );
              const cachedResult = await listCacheTable.get(listQueryString);

              console.log(`cachedResult`, cachedResult);

              let resultsToRender = cachedResult || {
                files: [],
                folders: [],
                totalFiles: 0,
                totalFolders: 0,
                cursor: null,
              };

              if (resultsToRender) {
                console.log("Using cached directory listing", listQueryString);

                enhancedAction = {
                  ...action,
                  optimistic: {
                    files: resultsToRender.files.map((file) => ({
                      ...file,
                      _isOptimistic: true,
                      _syncWarning:
                        "Cached directory listing. This data might be slightly out of date.",
                    })),
                    folders: resultsToRender.folders.map((folder) => ({
                      ...folder,
                      _isOptimistic: true,
                      _syncWarning:
                        "Cached directory listing. This data might be slightly out of date.",
                    })),
                    totalFiles: resultsToRender.totalFiles,
                    totalFolders: resultsToRender.totalFolders,
                    cursor: resultsToRender.cursor,
                  },
                };
              }
            } catch (error) {
              console.error("Error checking directory listing cache:", error);
            }

            break;
          }

          case LIST_DIRECTORY_COMMIT: {
            const listQueryString = action.meta?.listQueryString;
            const response = action.payload?.ok?.data;

            if (response && listQueryString) {
              const files = response.files || [];
              const folders = response.folders || [];

              try {
                await db.transaction(
                  "rw",
                  [
                    filesTable,
                    foldersTable,
                    db.table(DIRECTORY_LIST_QUERY_RESULTS_TABLE),
                  ],
                  async () => {
                    // Update files in IndexedDB
                    for (const file of files) {
                      await filesTable.put({
                        ...file,
                        _syncSuccess: true,
                        _syncConflict: false,
                        _syncWarning: "",
                        _isOptimistic: false,
                      });
                    }

                    // Update folders in IndexedDB
                    for (const folder of folders) {
                      await foldersTable.put({
                        ...folder,
                        _syncSuccess: true,
                        _syncConflict: false,
                        _syncWarning: "",
                        _isOptimistic: false,
                      });
                    }

                    // Cache the directory listing results
                    const cacheEntry: DirectoryListCacheEntry = {
                      listQueryString,
                      folders: response.folders,
                      files: response.files,
                      totalFiles: response.total_files,
                      totalFolders: response.total_folders,
                      cursor: response.cursor || null,
                      last_updated_date_ms: Date.now(),
                    };

                    await db
                      .table(DIRECTORY_LIST_QUERY_RESULTS_TABLE)
                      .put(cacheEntry);
                  }
                );
              } catch (error) {
                console.error(
                  "Error caching directory listing results:",
                  error
                );
              }
            }

            break;
          }

          case LIST_DIRECTORY_ROLLBACK: {
            // No local IndexedDB state to roll back for the cache
            break;
          }

          // ------------------------------ GET FILE --------------------------------- //
          case GET_FILE: {
            // Get cached data from IndexedDB
            const optimisticID = action.meta.optimisticID;
            const cachedFile = await filesTable.get(optimisticID);
            if (cachedFile) {
              enhancedAction = {
                ...action,
                optimistic: {
                  ...cachedFile,
                  _isOptimistic: true,
                  _optimisticID: optimisticID,
                  _syncSuccess: false,
                  _syncConflict: false,
                  _syncWarning: `Awaiting Sync. This file was fetched offline and will auto-sync with cloud when you are online again. If there are errors, it may need to be refetched.`,
                },
              };
            }
            break;
          }

          case GET_FILE_COMMIT: {
            const optimisticID = action.meta?.optimisticID;
            let realFile: FileRecordFE | undefined;

            // Extract the file from the response - handle different response structures
            if (action.payload?.ok?.data?.result?.file) {
              // Handle response with file in result.file structure
              realFile = action.payload.ok.data.result.file;
            } else if (
              action.payload?.ok?.data?.actions?.[0]?.response?.result?.file
            ) {
              // Handle batch action response format
              realFile = action.payload.ok.data.actions[0].response.result.file;
            } else if (action.payload?.ok?.data?.items?.[0]) {
              // Handle array response format
              realFile = action.payload.ok.data.items[0];
            }

            if (realFile) {
              await filesTable.put({
                ...realFile,
                _isOptimistic: false,
                _syncSuccess: true,
                _syncConflict: false,
                _syncWarning: "",
              });
            }
            break;
          }

          case GET_FILE_ROLLBACK: {
            try {
              const err = await action.payload.response.json();
              const optimisticID = action.meta?.optimisticID;
              if (optimisticID) {
                const error_message = `Failed to get file - a sync conflict occurred between your offline local copy & the official cloud record. Error message: ${err.err.message}`;
                await markSyncConflict(filesTable, optimisticID, error_message);
                enhancedAction = {
                  ...action,
                  error_message,
                };
              }
            } catch (e) {
              console.log(e);
            }
            break;
          }

          // ------------------------------ GET FOLDER --------------------------------- //
          case GET_FOLDER: {
            // Get cached data from IndexedDB
            const optimisticID = action.meta.optimisticID;
            const cachedFolder = await foldersTable.get(optimisticID);
            if (cachedFolder) {
              enhancedAction = {
                ...action,
                optimistic: {
                  ...cachedFolder,
                  _isOptimistic: true,
                  _optimisticID: optimisticID,
                  _syncSuccess: false,
                  _syncConflict: false,
                  _syncWarning: `Awaiting Sync. This folder was fetched offline and will auto-sync with cloud when you are online again. If there are errors, it may need to be refetched.`,
                },
              };
            }
            break;
          }

          case GET_FOLDER_COMMIT: {
            const optimisticID = action.meta?.optimisticID;
            let realFolder: FolderRecordFE | undefined;

            // Extract the folder from the response - handle different response structures
            if (action.payload?.ok?.data?.result?.folder) {
              // Handle response with folder in result.folder structure
              realFolder = action.payload.ok.data.result.folder;
            } else if (
              action.payload?.ok?.data?.actions?.[0]?.response?.result?.folder
            ) {
              // Handle batch action response format
              realFolder =
                action.payload.ok.data.actions[0].response.result.folder;
            } else if (action.payload?.ok?.data?.items?.[0]) {
              // Handle array response format
              realFolder = action.payload.ok.data.items[0];
            }

            if (realFolder) {
              await foldersTable.put({
                ...realFolder,
                _isOptimistic: false,
                _syncSuccess: true,
                _syncConflict: false,
                _syncWarning: "",
              });
            }
            break;
          }

          case GET_FOLDER_ROLLBACK: {
            try {
              const err = await action.payload.response.json();
              const optimisticID = action.meta?.optimisticID;
              if (optimisticID) {
                const error_message = `Failed to get folder - a sync conflict occurred between your offline local copy & the official cloud record. Error message: ${err.err.message}`;
                await markSyncConflict(
                  foldersTable,
                  optimisticID,
                  error_message
                );
                enhancedAction = {
                  ...action,
                  error_message,
                };
              }
            } catch (e) {
              console.log(e);
            }
            break;
          }

          // ------------------------------ CREATE FILE --------------------------------- //
          case CREATE_FILE: {
            // Only handle actions with file data
            if (action.meta?.offline?.effect?.data) {
              const fileData = action.meta.offline.effect.data.actions[0];
              const optimisticID = action.meta.optimisticID;
              const parentFolderId =
                fileData.payload.parent_folder_id || "root";

              // Get parent folder for any fields we need from it
              const parentFolder = await foldersTable.get(parentFolderId);

              // Create optimistic file object
              const optimisticFile: FileFEO = {
                id: optimisticID,
                name: fileData.payload.name,
                extension: fileData.payload.extension || "",
                folder_uuid: parentFolderId,
                disk_type: fileData.payload.disk_type || "local",
                file_version: 1,
                full_directory_path: parentFolder
                  ? `${parentFolder.full_directory_path}/${fileData.payload.name}`
                  : `/${fileData.payload.name}`,
                labels: fileData.payload.labels || [],
                created_by: userID,
                created_at: Date.now(),
                last_updated_date_ms: Date.now(),
                last_updated_by: userID,
                disk_id: fileData.payload.disk_id,
                file_size: fileData.payload.file_size || 0,
                raw_url: fileData.payload.raw_url || "",
                deleted: false,
                drive_id: orgID,
                expires_at: fileData.payload.expires_at || 0,
                has_sovereign_permissions:
                  fileData.payload.has_sovereign_permissions || false,
                clipped_directory_path: parentFolder
                  ? `${parentFolder.clipped_directory_path}/${fileData.payload.name}`
                  : `/${fileData.payload.name}`,
                permission_previews: [],
                external_id: fileData.payload.external_id,
                external_payload: fileData.payload.external_payload,
                _optimisticID: optimisticID,
                _syncWarning: `Awaiting Sync. This file was created offline and will auto-sync with cloud when you are online again. If there are errors, it may need to be recreated.`,
                _syncConflict: false,
                _syncSuccess: false,
                _isOptimistic: true,
              };

              // Save to IndexedDB
              await filesTable.put(optimisticFile);

              // Enhance action with optimisticID
              enhancedAction = {
                ...action,
                optimistic: optimisticFile,
              };
            }
            break;
          }

          case CREATE_FILE_COMMIT: {
            const optimisticID = action.meta?.optimisticID;
            let realFile: FileRecordFE | undefined;

            // Extract the file from the response - handle different response structures
            if (action.payload?.ok?.data?.result?.file) {
              realFile = action.payload.ok.data.result.file;
            } else if (
              action.payload?.ok?.data?.actions?.[0]?.response?.result?.file
            ) {
              realFile = action.payload.ok.data.actions[0].response.result.file;
            } else if (action.payload?.ok?.data?.result) {
              // Handle the case where result itself is the file
              realFile = action.payload.ok.data.result;
            }

            if (optimisticID && realFile) {
              await db.transaction("rw", filesTable, async () => {
                // Remove optimistic version
                await filesTable.delete(optimisticID);
                // Add real version
                await filesTable.put({
                  ...realFile,
                  _syncSuccess: true,
                  _syncConflict: false,
                  _syncWarning: "",
                  _isOptimistic: false,
                });
              });
            }
            break;
          }

          case CREATE_FILE_ROLLBACK: {
            try {
              const err = await action.payload.response.json();
              const optimisticID = action.meta?.optimisticID;
              if (optimisticID) {
                const error_message = `Failed to create file - a sync conflict occurred between your offline local copy & the official cloud record. Error message: ${err.err.message}`;
                await markSyncConflict(filesTable, optimisticID, error_message);
                enhancedAction = {
                  ...action,
                  error_message,
                };
              }
            } catch (e) {
              console.log(e);
            }
            break;
          }

          // ------------------------------ CREATE FOLDER --------------------------------- //
          case CREATE_FOLDER: {
            // Only handle actions with folder data
            if (action.meta?.offline?.effect?.data) {
              const folderData = action.meta.offline.effect.data.actions[0];
              const optimisticID = action.meta.optimisticID;
              const parentFolderId = folderData.payload.parent_folder_id;

              // Get parent folder for path construction
              const parentFolder = await foldersTable.get(parentFolderId);

              // Create optimistic folder object
              const optimisticFolder: FolderFEO = {
                id: optimisticID,
                name: folderData.payload.name,
                parent_folder_uuid:
                  parentFolderId === "root" ? undefined : parentFolderId,
                subfolder_uuids: [],
                file_uuids: [],
                full_directory_path: parentFolder
                  ? `${parentFolder.full_directory_path}/${folderData.payload.name}`
                  : `/${folderData.payload.name}`,
                labels: folderData.payload.labels || [],
                created_by: userID,
                created_at: Date.now(),
                last_updated_date_ms: Date.now(),
                last_updated_by: userID,
                disk_id: folderData.payload.disk_id,
                deleted: false,
                expires_at: folderData.payload.expires_at || 0,
                drive_id: orgID,
                has_sovereign_permissions:
                  folderData.payload.has_sovereign_permissions || false,
                clipped_directory_path: parentFolder
                  ? `${parentFolder.clipped_directory_path}/${folderData.payload.name}`
                  : `/${folderData.payload.name}`,
                permission_previews: [],
                external_id: folderData.payload.external_id,
                external_payload: folderData.payload.external_payload,
                _optimisticID: optimisticID,
                _syncWarning: `Awaiting Sync. This folder was created offline and will auto-sync with cloud when you are online again. If there are errors, it may need to be recreated.`,
                _syncConflict: false,
                _syncSuccess: false,
                _isOptimistic: true,
              };

              // Save to IndexedDB
              await foldersTable.put(optimisticFolder);

              // Update parent folder if it exists
              if (parentFolder && parentFolderId !== "root") {
                const updatedParentFolder = {
                  ...parentFolder,
                  subfolder_uuids: [
                    ...parentFolder.subfolder_uuids,
                    optimisticID,
                  ],
                  last_updated_date_ms: Date.now(),
                  last_updated_by: userID,
                };
                await foldersTable.put(updatedParentFolder);
              }

              // Enhance action with optimisticID
              enhancedAction = {
                ...action,
                optimistic: optimisticFolder,
              };
            }
            break;
          }

          case CREATE_FOLDER_COMMIT: {
            const optimisticID = action.meta?.optimisticID;
            let realFolder: FolderRecordFE | undefined;

            // Extract the folder from the response - handle different response structures
            if (action.payload?.ok?.data?.result?.folder) {
              realFolder = action.payload.ok.data.result.folder;
            } else if (
              action.payload?.ok?.data?.actions?.[0]?.response?.result?.folder
            ) {
              realFolder =
                action.payload.ok.data.actions[0].response.result.folder;
            } else if (action.payload?.ok?.data?.result) {
              // Handle the case where result itself is the folder
              realFolder = action.payload.ok.data.result;
            }

            if (optimisticID && realFolder) {
              await db.transaction("rw", foldersTable, async () => {
                // Get the optimistic version to check the parent folder
                const optimisticFolder = await foldersTable.get(optimisticID);

                // Remove optimistic version
                await foldersTable.delete(optimisticID);

                // Add real version
                await foldersTable.put({
                  ...realFolder,
                  _syncSuccess: true,
                  _syncConflict: false,
                  _syncWarning: "",
                  _isOptimistic: false,
                });

                // Update parent folder references if needed
                if (
                  optimisticFolder?.parent_folder_uuid &&
                  optimisticFolder.parent_folder_uuid !==
                    realFolder.parent_folder_uuid
                ) {
                  // Get parent folders
                  const oldParent = await foldersTable.get(
                    optimisticFolder.parent_folder_uuid
                  );
                  const newParent = realFolder.parent_folder_uuid
                    ? await foldersTable.get(realFolder.parent_folder_uuid)
                    : undefined;

                  // Update old parent if it exists
                  if (oldParent) {
                    await foldersTable.put({
                      ...oldParent,
                      subfolder_uuids: oldParent.subfolder_uuids.filter(
                        (id) => id !== optimisticID && id !== realFolder.id
                      ),
                      last_updated_date_ms: Date.now(),
                    });
                  }

                  // Update new parent if it exists
                  if (newParent && realFolder.parent_folder_uuid) {
                    await foldersTable.put({
                      ...newParent,
                      subfolder_uuids: [
                        ...newParent.subfolder_uuids,
                        realFolder.id,
                      ],
                      last_updated_date_ms: Date.now(),
                    });
                  }
                }
              });
            }
            break;
          }

          case CREATE_FOLDER_ROLLBACK: {
            try {
              const err = await action.payload.response.json();
              const optimisticID = action.meta?.optimisticID;
              if (optimisticID) {
                const error_message = `Failed to create folder - a sync conflict occurred between your offline local copy & the official cloud record. Error message: ${err.err.message}`;
                await markSyncConflict(
                  foldersTable,
                  optimisticID,
                  error_message
                );
                enhancedAction = {
                  ...action,
                  error_message,
                };
              }
            } catch (e) {
              console.log(e);
            }
            break;
          }

          // ------------------------------ UPDATE FILE --------------------------------- //
          case UPDATE_FILE: {
            // Only handle actions with file data
            if (action.meta?.offline?.effect?.data) {
              const fileData = action.meta.offline.effect.data.actions[0];
              const optimisticID = action.meta.optimisticID;

              const cachedFile = await filesTable.get(optimisticID);

              if (cachedFile) {
                // Create optimistic file object with updates
                const optimisticFile: FileFEO = {
                  ...cachedFile,
                  ...fileData.payload,
                  last_updated_date_ms: Date.now(),
                  last_updated_by: userID,
                  _isOptimistic: true,
                  _optimisticID: optimisticID,
                  _syncWarning: `Awaiting Sync. This file was updated offline and will auto-sync with cloud when you are online again. If there are errors, it may need to be reverted.`,
                  _syncConflict: false,
                  _syncSuccess: false,
                };

                // Save to IndexedDB
                await filesTable.put(optimisticFile);

                // Enhance action with optimisticID
                enhancedAction = {
                  ...action,
                  optimistic: optimisticFile,
                };
              }
            }
            break;
          }

          case UPDATE_FILE_COMMIT: {
            const optimisticID = action.meta?.optimisticID;
            let realFile: FileRecordFE | undefined;

            // Extract the file from the response
            if (action.payload?.ok?.data?.result?.file) {
              realFile = action.payload.ok.data.result.file;
            } else if (
              action.payload?.ok?.data?.actions?.[0]?.response?.result?.file
            ) {
              realFile = action.payload.ok.data.actions[0].response.result.file;
            } else if (action.payload?.ok?.data?.result) {
              realFile = action.payload.ok.data.result;
            }

            if (optimisticID && realFile) {
              await db.transaction("rw", filesTable, async () => {
                // Remove optimistic version
                await filesTable.delete(optimisticID);
                // Add real version
                await filesTable.put({
                  ...realFile,
                  _syncSuccess: true,
                  _syncConflict: false,
                  _syncWarning: "",
                  _isOptimistic: false,
                });
              });
            }
            break;
          }

          case UPDATE_FILE_ROLLBACK: {
            try {
              const err = await action.payload.response.json();
              const optimisticID = action.meta?.optimisticID;
              if (optimisticID) {
                const error_message = `Failed to update file - a sync conflict occurred between your offline local copy & the official cloud record. Error message: ${err.err.message}`;
                await markSyncConflict(filesTable, optimisticID, error_message);
                enhancedAction = {
                  ...action,
                  error_message,
                };
              }
            } catch (e) {
              console.log(e);
            }
            break;
          }

          // ------------------------------ UPDATE FOLDER --------------------------------- //
          case UPDATE_FOLDER: {
            // Only handle actions with folder data
            if (action.meta?.offline?.effect?.data) {
              const folderData = action.meta.offline.effect.data.actions[0];
              const optimisticID = action.meta.optimisticID;

              const cachedFolder = await foldersTable.get(optimisticID);

              if (cachedFolder) {
                // Create optimistic folder object with updates
                const optimisticFolder: FolderFEO = {
                  ...cachedFolder,
                  ...folderData.payload,
                  last_updated_date_ms: Date.now(),
                  last_updated_by: userID,
                  _isOptimistic: true,
                  _optimisticID: optimisticID,
                  _syncWarning: `Awaiting Sync. This folder was updated offline and will auto-sync with cloud when you are online again. If there are errors, it may need to be reverted.`,
                  _syncConflict: false,
                  _syncSuccess: false,
                };

                // Save to IndexedDB
                await foldersTable.put(optimisticFolder);

                // Enhance action with optimisticID
                enhancedAction = {
                  ...action,
                  optimistic: optimisticFolder,
                };
              }
            }
            break;
          }

          case UPDATE_FOLDER_COMMIT: {
            const optimisticID = action.meta?.optimisticID;
            let realFolder: FolderRecordFE | undefined;

            // Extract the folder from the response
            if (action.payload?.ok?.data?.result?.folder) {
              realFolder = action.payload.ok.data.result.folder;
            } else if (
              action.payload?.ok?.data?.actions?.[0]?.response?.result?.folder
            ) {
              realFolder =
                action.payload.ok.data.actions[0].response.result.folder;
            } else if (action.payload?.ok?.data?.result) {
              realFolder = action.payload.ok.data.result;
            }

            if (optimisticID && realFolder) {
              await db.transaction("rw", foldersTable, async () => {
                // Remove optimistic version
                await foldersTable.delete(optimisticID);
                // Add real version
                await foldersTable.put({
                  ...realFolder,
                  _syncSuccess: true,
                  _syncConflict: false,
                  _syncWarning: "",
                  _isOptimistic: false,
                });
              });
            }
            break;
          }

          case UPDATE_FOLDER_ROLLBACK: {
            try {
              const err = await action.payload.response.json();
              const optimisticID = action.meta?.optimisticID;
              if (optimisticID) {
                const error_message = `Failed to update folder - a sync conflict occurred between your offline local copy & the official cloud record. Error message: ${err.err.message}`;
                await markSyncConflict(
                  foldersTable,
                  optimisticID,
                  error_message
                );
                enhancedAction = {
                  ...action,
                  error_message,
                };
              }
            } catch (e) {
              console.log(e);
            }
            break;
          }

          // ------------------------------ DELETE FILE --------------------------------- //
          case DELETE_FILE: {
            const optimisticID = action.meta.optimisticID;
            const cachedFile = await filesTable.get(optimisticID);

            if (cachedFile) {
              const optimisticFile: FileFEO = {
                ...cachedFile,
                id: optimisticID,
                deleted: true,
                _markedForDeletion: true,
                _syncWarning: `Awaiting Sync. This file was deleted offline and will auto-sync with cloud when you are online again. If there are errors, it may need to be restored.`,
                _syncConflict: false,
                _syncSuccess: false,
                _isOptimistic: true,
                _optimisticID: optimisticID,
              };

              // Mark for deletion in indexdb
              await filesTable.put(optimisticFile);

              // Update parent folder reference if it exists
              if (cachedFile.folder_uuid) {
                const parentFolder = await foldersTable.get(
                  cachedFile.folder_uuid
                );
                if (parentFolder) {
                  await foldersTable.put({
                    ...parentFolder,
                    file_uuids: parentFolder.file_uuids.filter(
                      (id) => id !== optimisticID
                    ),
                    last_updated_date_ms: Date.now(),
                    last_updated_by: userID,
                  });
                }
              }

              // Enhance action with optimisticID
              enhancedAction = {
                ...action,
                optimistic: optimisticFile,
              };
            }
            break;
          }

          case DELETE_FILE_COMMIT: {
            const optimisticID = action.meta?.optimisticID;
            if (optimisticID) {
              await db.transaction("rw", filesTable, async () => {
                // Remove optimistic version
                await filesTable.delete(optimisticID);
              });
            }
            break;
          }

          case DELETE_FILE_ROLLBACK: {
            try {
              const err = await action.payload.response.json();
              const optimisticID = action.meta?.optimisticID;
              if (optimisticID) {
                const error_message = `Failed to delete file - a sync conflict occurred between your offline local copy & the official cloud record. Error message: ${err.err.message}`;
                await markSyncConflict(filesTable, optimisticID, error_message);
                enhancedAction = {
                  ...action,
                  error_message,
                };
              }
            } catch (e) {
              console.log(e);
            }
            break;
          }

          // ------------------------------ DELETE FOLDER --------------------------------- //
          case DELETE_FOLDER: {
            const optimisticID = action.meta.optimisticID;
            const cachedFolder = await foldersTable.get(optimisticID);

            if (cachedFolder) {
              const optimisticFolder: FolderFEO = {
                ...cachedFolder,
                id: optimisticID,
                deleted: true,
                _markedForDeletion: true,
                _syncWarning: `Awaiting Sync. This folder was deleted offline and will auto-sync with cloud when you are online again. If there are errors, it may need to be restored.`,
                _syncConflict: false,
                _syncSuccess: false,
                _isOptimistic: true,
                _optimisticID: optimisticID,
              };

              // Mark for deletion in indexdb
              await foldersTable.put(optimisticFolder);

              // Update parent folder reference if it exists
              if (cachedFolder.parent_folder_uuid) {
                const parentFolder = await foldersTable.get(
                  cachedFolder.parent_folder_uuid
                );
                if (parentFolder) {
                  await foldersTable.put({
                    ...parentFolder,
                    subfolder_uuids: parentFolder.subfolder_uuids.filter(
                      (id) => id !== optimisticID
                    ),
                    last_updated_date_ms: Date.now(),
                    last_updated_by: userID,
                  });
                }
              }

              // Enhance action with optimisticID
              enhancedAction = {
                ...action,
                optimistic: optimisticFolder,
              };
            }
            break;
          }

          case DELETE_FOLDER_COMMIT: {
            const optimisticID = action.meta?.optimisticID;
            if (optimisticID) {
              await db.transaction("rw", foldersTable, async () => {
                // Remove optimistic version
                await foldersTable.delete(optimisticID);
              });
            }
            break;
          }

          case DELETE_FOLDER_ROLLBACK: {
            try {
              const err = await action.payload.response.json();
              const optimisticID = action.meta?.optimisticID;
              if (optimisticID) {
                const error_message = `Failed to delete folder - a sync conflict occurred between your offline local copy & the official cloud record. Error message: ${err.err.message}`;
                await markSyncConflict(
                  foldersTable,
                  optimisticID,
                  error_message
                );
                enhancedAction = {
                  ...action,
                  error_message,
                };
              }
            } catch (e) {
              console.log(e);
            }
            break;
          }

          // ------------------------------ MOVE FILE --------------------------------- //
          case MOVE_FILE: {
            const optimisticID = action.meta.optimisticID;
            const fileData = action.meta.offline.effect.data.actions[0];
            const destinationFolderId = fileData.payload.destination_folder_id;

            const cachedFile = await filesTable.get(optimisticID);
            if (cachedFile && destinationFolderId) {
              // Get source and destination folders
              const sourceFolder = await foldersTable.get(
                cachedFile.folder_uuid
              );
              const destinationFolder =
                await foldersTable.get(destinationFolderId);

              // Create the updated path for the file
              let newFilePath = cachedFile.full_directory_path;
              if (destinationFolder) {
                newFilePath = `${destinationFolder.full_directory_path}/${cachedFile.name}`;
              }

              // Create optimistic file object with updates
              const optimisticFile: FileFEO = {
                ...cachedFile,
                folder_uuid: destinationFolderId,
                full_directory_path: newFilePath,
                clipped_directory_path: newFilePath,
                last_updated_date_ms: Date.now(),
                last_updated_by: userID,
                _isOptimistic: true,
                _optimisticID: optimisticID,
                _syncWarning: `Awaiting Sync. This file was moved offline and will auto-sync with cloud when you are online again. If there are errors, it may need to be restored.`,
                _syncConflict: false,
                _syncSuccess: false,
              };

              // Update the file
              await filesTable.put(optimisticFile);

              // Update source folder if it exists
              if (sourceFolder) {
                await foldersTable.put({
                  ...sourceFolder,
                  file_uuids: sourceFolder.file_uuids.filter(
                    (id) => id !== optimisticID
                  ),
                  last_updated_date_ms: Date.now(),
                  last_updated_by: userID,
                });
              }

              // Update destination folder if it exists
              if (destinationFolder) {
                await foldersTable.put({
                  ...destinationFolder,
                  file_uuids: [...destinationFolder.file_uuids, optimisticID],
                  last_updated_date_ms: Date.now(),
                  last_updated_by: userID,
                });
              }

              // Enhance action with optimisticFile
              enhancedAction = {
                ...action,
                optimistic: optimisticFile,
              };
            }
            break;
          }

          case MOVE_FILE_COMMIT: {
            const optimisticID = action.meta?.optimisticID;
            let realFile: FileRecordFE | undefined;

            // Extract the file from the response
            if (action.payload?.ok?.data?.result?.file) {
              realFile = action.payload.ok.data.result.file;
            } else if (
              action.payload?.ok?.data?.actions?.[0]?.response?.result?.file
            ) {
              realFile = action.payload.ok.data.actions[0].response.result.file;
            } else if (action.payload?.ok?.data?.result) {
              realFile = action.payload.ok.data.result;
            }

            if (optimisticID && realFile) {
              await db.transaction(
                "rw",
                [filesTable, foldersTable],
                async () => {
                  // Get the optimistic file to check for folder changes
                  const optimisticFile = await filesTable.get(optimisticID);

                  // Remove optimistic version
                  await filesTable.delete(optimisticID);

                  // Add real version
                  await filesTable.put({
                    ...realFile,
                    _syncSuccess: true,
                    _syncConflict: false,
                    _syncWarning: "",
                    _isOptimistic: false,
                  });

                  // Update folder references if needed
                  if (
                    optimisticFile &&
                    optimisticFile.folder_uuid !== realFile.folder_uuid
                  ) {
                    // Update old folder reference
                    const oldFolder = await foldersTable.get(
                      optimisticFile.folder_uuid
                    );
                    if (oldFolder) {
                      await foldersTable.put({
                        ...oldFolder,
                        file_uuids: oldFolder.file_uuids.filter(
                          (id) => id !== optimisticID && id !== realFile.id
                        ),
                        last_updated_date_ms: Date.now(),
                      });
                    }

                    // Update new folder reference
                    const newFolder = await foldersTable.get(
                      realFile.folder_uuid
                    );
                    if (newFolder) {
                      await foldersTable.put({
                        ...newFolder,
                        file_uuids: [
                          ...newFolder.file_uuids.filter(
                            (id) => id !== realFile.id
                          ),
                          realFile.id,
                        ],
                        last_updated_date_ms: Date.now(),
                      });
                    }
                  }
                }
              );
            }
            break;
          }

          case MOVE_FILE_ROLLBACK: {
            try {
              const err = await action.payload.response.json();
              const optimisticID = action.meta?.optimisticID;
              if (optimisticID) {
                const error_message = `Failed to move file - a sync conflict occurred between your offline local copy & the official cloud record. Error message: ${err.err.message}`;
                await markSyncConflict(filesTable, optimisticID, error_message);
                enhancedAction = {
                  ...action,
                  error_message,
                };
              }
            } catch (e) {
              console.log(e);
            }
            break;
          }

          // ------------------------------ MOVE FOLDER --------------------------------- //
          case MOVE_FOLDER: {
            const optimisticID = action.meta.optimisticID;
            const folderData = action.meta.offline.effect.data.actions[0];
            const destinationFolderId =
              folderData.payload.destination_folder_id;

            const cachedFolder = await foldersTable.get(optimisticID);
            if (cachedFolder && destinationFolderId) {
              // Get source and destination folders
              const sourceFolder = cachedFolder.parent_folder_uuid
                ? await foldersTable.get(cachedFolder.parent_folder_uuid)
                : null;
              const destinationFolder =
                await foldersTable.get(destinationFolderId);

              // Create the updated path for the folder
              let newFolderPath = cachedFolder.full_directory_path;
              if (destinationFolder) {
                newFolderPath = `${destinationFolder.full_directory_path}/${cachedFolder.name}`;
              }

              // Create optimistic folder object with updates
              const optimisticFolder: FolderFEO = {
                ...cachedFolder,
                parent_folder_uuid: destinationFolderId,
                full_directory_path: newFolderPath,
                clipped_directory_path: newFolderPath,
                last_updated_date_ms: Date.now(),
                last_updated_by: userID,
                _isOptimistic: true,
                _optimisticID: optimisticID,
                _syncWarning: `Awaiting Sync. This folder was moved offline and will auto-sync with cloud when you are online again. If there are errors, it may need to be restored.`,
                _syncConflict: false,
                _syncSuccess: false,
              };

              // Update the folder
              await foldersTable.put(optimisticFolder);

              // Update source folder if it exists
              if (sourceFolder) {
                await foldersTable.put({
                  ...sourceFolder,
                  subfolder_uuids: sourceFolder.subfolder_uuids.filter(
                    (id) => id !== optimisticID
                  ),
                  last_updated_date_ms: Date.now(),
                  last_updated_by: userID,
                });
              }

              // Update destination folder if it exists
              if (destinationFolder) {
                await foldersTable.put({
                  ...destinationFolder,
                  subfolder_uuids: [
                    ...destinationFolder.subfolder_uuids,
                    optimisticID,
                  ],
                  last_updated_date_ms: Date.now(),
                  last_updated_by: userID,
                });
              }

              // Enhance action with optimisticFolder
              enhancedAction = {
                ...action,
                optimistic: optimisticFolder,
              };
            }
            break;
          }

          case MOVE_FOLDER_COMMIT: {
            const optimisticID = action.meta?.optimisticID;
            let realFolder: FolderRecordFE | undefined;

            // Extract the folder from the response
            if (action.payload?.ok?.data?.result?.folder) {
              realFolder = action.payload.ok.data.result.folder;
            } else if (
              action.payload?.ok?.data?.actions?.[0]?.response?.result?.folder
            ) {
              realFolder =
                action.payload.ok.data.actions[0].response.result.folder;
            } else if (action.payload?.ok?.data?.result) {
              realFolder = action.payload.ok.data.result;
            }

            if (optimisticID && realFolder) {
              await db.transaction("rw", foldersTable, async () => {
                // Get the optimistic folder to check for parent changes
                const optimisticFolder = await foldersTable.get(optimisticID);

                // Remove optimistic version
                await foldersTable.delete(optimisticID);

                // Add real version
                await foldersTable.put({
                  ...realFolder,
                  _syncSuccess: true,
                  _syncConflict: false,
                  _syncWarning: "",
                  _isOptimistic: false,
                });

                // Update parent folder references if needed
                const oldParentId = optimisticFolder?.parent_folder_uuid;
                const newParentId = realFolder.parent_folder_uuid;

                if (oldParentId !== newParentId) {
                  // Update old parent reference
                  if (oldParentId) {
                    const oldParent = await foldersTable.get(oldParentId);
                    if (oldParent) {
                      await foldersTable.put({
                        ...oldParent,
                        subfolder_uuids: oldParent.subfolder_uuids.filter(
                          (id) => id !== optimisticID && id !== realFolder.id
                        ),
                        last_updated_date_ms: Date.now(),
                      });
                    }
                  }

                  // Update new parent reference
                  if (newParentId) {
                    const newParent = await foldersTable.get(newParentId);
                    if (newParent) {
                      await foldersTable.put({
                        ...newParent,
                        subfolder_uuids: [
                          ...newParent.subfolder_uuids.filter(
                            (id) => id !== realFolder.id
                          ),
                          realFolder.id,
                        ],
                        last_updated_date_ms: Date.now(),
                      });
                    }
                  }
                }
              });
            }
            break;
          }

          case MOVE_FOLDER_ROLLBACK: {
            try {
              const err = await action.payload.response.json();
              const optimisticID = action.meta?.optimisticID;
              if (optimisticID) {
                const error_message = `Failed to move folder - a sync conflict occurred between your offline local copy & the official cloud record. Error message: ${err.err.message}`;
                await markSyncConflict(
                  foldersTable,
                  optimisticID,
                  error_message
                );
                enhancedAction = {
                  ...action,
                  error_message,
                };
              }
            } catch (e) {
              console.log(e);
            }
            break;
          }

          // ------------------------------ COPY FILE --------------------------------- //
          case COPY_FILE: {
            const sourceId = action.meta.optimisticID;
            const destinationId = action.meta.destinationID;
            const fileData = action.meta.offline.effect.data.actions[0];
            const destinationFolderId = fileData.payload.destination_folder_id;

            const sourceFile = await filesTable.get(sourceId);
            if (sourceFile && destinationFolderId) {
              const destinationFolder =
                await foldersTable.get(destinationFolderId);

              // Create the new path for the copied file
              let newFilePath = sourceFile.full_directory_path;
              if (destinationFolder) {
                newFilePath = `${destinationFolder.full_directory_path}/${sourceFile.name}`;
              }

              // Create optimistic file object for the copy
              const optimisticFile: FileFEO = {
                ...sourceFile,
                id: destinationId,
                folder_uuid: destinationFolderId,
                full_directory_path: newFilePath,
                clipped_directory_path: newFilePath,
                created_at: Date.now(),
                created_by: userID,
                last_updated_date_ms: Date.now(),
                last_updated_by: userID,
                _isOptimistic: true,
                _optimisticID: destinationId,
                _syncWarning: `Awaiting Sync. This file was copied offline and will auto-sync with cloud when you are online again. If there are errors, it may need to be recreated.`,
                _syncConflict: false,
                _syncSuccess: false,
              };

              // Save the copy to IndexedDB
              await filesTable.put(optimisticFile);

              // Update destination folder if it exists
              if (destinationFolder) {
                await foldersTable.put({
                  ...destinationFolder,
                  file_uuids: [...destinationFolder.file_uuids, destinationId],
                  last_updated_date_ms: Date.now(),
                  last_updated_by: userID,
                });
              }

              // Enhance action with optimisticFile
              enhancedAction = {
                ...action,
                optimistic: optimisticFile,
              };
            }
            break;
          }

          case COPY_FILE_COMMIT: {
            const sourceId = action.meta?.optimisticID;
            const destinationId = action.meta?.destinationID;
            let realFile: FileRecordFE | undefined;

            // Extract the file from the response
            if (action.payload?.ok?.data?.result?.file) {
              realFile = action.payload.ok.data.result.file;
            } else if (
              action.payload?.ok?.data?.actions?.[0]?.response?.result?.file
            ) {
              realFile = action.payload.ok.data.actions[0].response.result.file;
            } else if (action.payload?.ok?.data?.result) {
              realFile = action.payload.ok.data.result;
            }

            if (destinationId && realFile) {
              await db.transaction(
                "rw",
                [filesTable, foldersTable],
                async () => {
                  // Remove optimistic version
                  await filesTable.delete(destinationId);

                  // Add real version
                  await filesTable.put({
                    ...realFile,
                    _syncSuccess: true,
                    _syncConflict: false,
                    _syncWarning: "",
                    _isOptimistic: false,
                  });

                  // Update folder reference
                  const folder = await foldersTable.get(realFile.folder_uuid);
                  if (folder && !folder.file_uuids.includes(realFile.id)) {
                    await foldersTable.put({
                      ...folder,
                      file_uuids: [
                        ...folder.file_uuids.filter(
                          (id) => id !== destinationId
                        ),
                        realFile.id,
                      ],
                      last_updated_date_ms: Date.now(),
                    });
                  }
                }
              );
            }
            break;
          }

          case COPY_FILE_ROLLBACK: {
            try {
              const err = await action.payload.response.json();
              const destinationId = action.meta?.destinationID;
              if (destinationId) {
                const error_message = `Failed to copy file - a sync conflict occurred between your offline local copy & the official cloud record. Error message: ${err.err.message}`;
                await markSyncConflict(
                  filesTable,
                  destinationId,
                  error_message
                );
                enhancedAction = {
                  ...action,
                  error_message,
                };
              }
            } catch (e) {
              console.log(e);
            }
            break;
          }

          // ------------------------------ COPY FOLDER --------------------------------- //
          case COPY_FOLDER: {
            const sourceId = action.meta.optimisticID;
            const destinationId = action.meta.destinationID;
            const folderData = action.meta.offline.effect.data.actions[0];
            const destinationParentId =
              folderData.payload.destination_folder_id;

            const sourceFolder = await foldersTable.get(sourceId);
            if (sourceFolder && destinationParentId) {
              const destinationParent =
                await foldersTable.get(destinationParentId);

              // Create the new path for the copied folder
              let newFolderPath = sourceFolder.full_directory_path;
              if (destinationParent) {
                newFolderPath = `${destinationParent.full_directory_path}/${sourceFolder.name}`;
              }

              // Create optimistic folder object for the copy
              const optimisticFolder: FolderFEO = {
                ...sourceFolder,
                id: destinationId,
                parent_folder_uuid: destinationParentId,
                full_directory_path: newFolderPath,
                clipped_directory_path: newFolderPath,
                // For a copy, we start with empty child arrays that will be populated as children are copied
                subfolder_uuids: [],
                file_uuids: [],
                created_at: Date.now(),
                created_by: userID,
                last_updated_date_ms: Date.now(),
                last_updated_by: userID,
                _isOptimistic: true,
                _optimisticID: destinationId,
                _syncWarning: `Awaiting Sync. This folder was copied offline and will auto-sync with cloud when you are online again. If there are errors, it may need to be recreated.`,
                _syncConflict: false,
                _syncSuccess: false,
              };

              // Save the copy to IndexedDB
              await foldersTable.put(optimisticFolder);

              // Update destination parent folder if it exists
              if (destinationParent) {
                await foldersTable.put({
                  ...destinationParent,
                  subfolder_uuids: [
                    ...destinationParent.subfolder_uuids,
                    destinationId,
                  ],
                  last_updated_date_ms: Date.now(),
                  last_updated_by: userID,
                });
              }

              // Enhance action with optimisticFolder
              enhancedAction = {
                ...action,
                optimistic: optimisticFolder,
              };
            }
            break;
          }

          case COPY_FOLDER_COMMIT: {
            const sourceId = action.meta?.optimisticID;
            const destinationId = action.meta?.destinationID;
            let realFolder: FolderRecordFE | undefined;
            let copiedItems: any = {};

            // Extract the folder and potentially copied items from the response
            if (action.payload?.ok?.data?.result?.folder) {
              realFolder = action.payload.ok.data.result.folder;
            } else if (
              action.payload?.ok?.data?.actions?.[0]?.response?.result?.folder
            ) {
              realFolder =
                action.payload.ok.data.actions[0].response.result.folder;
            } else if (action.payload?.ok?.data?.result) {
              realFolder = action.payload.ok.data.result;
            }

            // Look for copied items in the response
            if (action.payload?.ok?.data?.result?.copied_files) {
              copiedItems.files = action.payload.ok.data.result.copied_files;
            } else if (action.payload?.ok?.data?.result?.copied_folders) {
              copiedItems.folders =
                action.payload.ok.data.result.copied_folders;
            } else if (
              action.payload?.ok?.data?.actions?.[0]?.response?.result
                ?.copied_items
            ) {
              copiedItems =
                action.payload.ok.data.actions[0].response.result.copied_items;
            }

            if (destinationId && realFolder) {
              await db.transaction(
                "rw",
                [filesTable, foldersTable],
                async () => {
                  // Remove optimistic version
                  await foldersTable.delete(destinationId);

                  // Add real version
                  await foldersTable.put({
                    ...realFolder,
                    _syncSuccess: true,
                    _syncConflict: false,
                    _syncWarning: "",
                    _isOptimistic: false,
                  });

                  // Update parent folder reference
                  if (realFolder.parent_folder_uuid) {
                    const parentFolder = await foldersTable.get(
                      realFolder.parent_folder_uuid
                    );
                    if (
                      parentFolder &&
                      !parentFolder.subfolder_uuids.includes(realFolder.id)
                    ) {
                      await foldersTable.put({
                        ...parentFolder,
                        subfolder_uuids: [
                          ...parentFolder.subfolder_uuids.filter(
                            (id) => id !== destinationId
                          ),
                          realFolder.id,
                        ],
                        last_updated_date_ms: Date.now(),
                      });
                    }
                  }

                  // Process any copied items if available
                  if (copiedItems.files && Array.isArray(copiedItems.files)) {
                    for (const file of copiedItems.files) {
                      await filesTable.put({
                        ...file,
                        _syncSuccess: true,
                        _syncConflict: false,
                        _syncWarning: "",
                        _isOptimistic: false,
                        _optimisticID: null,
                      });
                    }
                  }

                  if (
                    copiedItems.folders &&
                    Array.isArray(copiedItems.folders)
                  ) {
                    for (const folder of copiedItems.folders) {
                      await foldersTable.put({
                        ...folder,
                        _syncSuccess: true,
                        _syncConflict: false,
                        _syncWarning: "",
                        _isOptimistic: false,
                        _optimisticID: null,
                      });
                    }
                  }
                }
              );
            }
            break;
          }

          case COPY_FOLDER_ROLLBACK: {
            try {
              const err = await action.payload.response.json();
              const destinationId = action.meta?.destinationID;
              if (destinationId) {
                const error_message = `Failed to copy folder - a sync conflict occurred between your offline local copy & the official cloud record. Error message: ${err.err.message}`;
                await markSyncConflict(
                  foldersTable,
                  destinationId,
                  error_message
                );
                enhancedAction = {
                  ...action,
                  error_message,
                };
              }
            } catch (e) {
              console.log(e);
            }
            break;
          }

          // ------------------------------ RESTORE TRASH --------------------------------- //
          // Fix for the RESTORE_TRASH case in directory.optimistic.ts

          case RESTORE_TRASH: {
            const resourceId = action.meta.optimisticID;
            const resourceAction = action.meta.offline.effect.data.actions[0];

            // Determine if we're restoring a file or folder
            const isFile =
              resourceAction.target.resource_id?.startsWith("file_");

            if (isFile) {
              // Handle file restoration
              const file = await filesTable.get(resourceId);
              if (file) {
                // Path to restore to
                const restorePath =
                  resourceAction.payload.restore_to_folder_path ||
                  file.restore_trash_prior_folder_path;

                // Create optimistic file object
                const optimisticFile: FileFEO = {
                  ...file,
                  deleted: false,
                  _markedForDeletion: false,
                  _syncWarning: `Awaiting Sync. This file was restored from trash offline and will auto-sync with cloud when you are online again.`,
                  _syncConflict: false,
                  _syncSuccess: false,
                  _isOptimistic: true,
                };

                // Save to IndexedDB
                await filesTable.put(optimisticFile);

                // Enhance action with optimistic file
                enhancedAction = {
                  ...action,
                  optimistic: optimisticFile,
                };
              }
            } else {
              // Handle folder restoration
              const folder = await foldersTable.get(resourceId);
              if (folder) {
                // Path to restore to
                const restorePath =
                  resourceAction.payload.restore_to_folder_path ||
                  folder.restore_trash_prior_folder_path;

                // Create optimistic folder object
                const optimisticFolder: FolderFEO = {
                  ...folder,
                  deleted: false,
                  _markedForDeletion: false,
                  _syncWarning: `Awaiting Sync. This folder was restored from trash offline and will auto-sync with cloud when you are online again.`,
                  _syncConflict: false,
                  _syncSuccess: false,
                  _isOptimistic: true,
                };

                // Save to IndexedDB
                await foldersTable.put(optimisticFolder);

                // Enhance action with optimistic folder
                enhancedAction = {
                  ...action,
                  optimistic: optimisticFolder,
                };
              }
            }
            break;
          }

          case RESTORE_TRASH_COMMIT: {
            const resourceId = action.meta?.optimisticID;
            let restoredItems: {
              restored_files?: FileID[];
              restored_folders?: FolderID[];
            } = {};

            // Extract restored items from the response
            if (action.payload?.ok?.data?.result?.restored_files) {
              restoredItems.restored_files =
                action.payload.ok.data.result.restored_files;
            }

            if (action.payload?.ok?.data?.result?.restored_folders) {
              restoredItems.restored_folders =
                action.payload.ok.data.result.restored_folders;
            }

            // Process restored items if available
            if (
              restoredItems.restored_files &&
              restoredItems.restored_files.length > 0
            ) {
              for (const fileId of restoredItems.restored_files) {
                const file = await filesTable.get(fileId);
                if (file) {
                  await filesTable.put({
                    ...file,
                    deleted: false,
                    _markedForDeletion: false,
                    _syncSuccess: true,
                    _syncConflict: false,
                    _syncWarning: "",
                    _isOptimistic: false,
                  });
                }
              }
            }

            if (
              restoredItems.restored_folders &&
              restoredItems.restored_folders.length > 0
            ) {
              for (const folderId of restoredItems.restored_folders) {
                const folder = await foldersTable.get(folderId);
                if (folder) {
                  await foldersTable.put({
                    ...folder,
                    deleted: false,
                    _markedForDeletion: false,
                    _syncSuccess: true,
                    _syncConflict: false,
                    _syncWarning: "",
                    _isOptimistic: false,
                  });
                }
              }
            }
            break;
          }

          case RESTORE_TRASH_ROLLBACK: {
            try {
              const err = await action.payload.response.json();
              const resourceId = action.meta?.optimisticID;
              if (resourceId) {
                const isFile = resourceId.startsWith("file_");
                const table = isFile ? filesTable : foldersTable;

                const error_message = `Failed to restore from trash - a sync conflict occurred between your offline local copy & the official cloud record. Error message: ${err.err.message}`;
                await markSyncConflict(table, resourceId, error_message);
                enhancedAction = {
                  ...action,
                  error_message,
                };
              }
            } catch (e) {
              console.log(e);
            }
            break;
          }
        }

        // Pass the (potentially enhanced) action to the next middleware
        return next(enhancedAction);
      } catch (error) {
        console.error(
          `Error in directory middleware for ${action.type}:`,
          error
        );
        // Continue with the original action if there's an error
        return next(action);
      }
    };
};

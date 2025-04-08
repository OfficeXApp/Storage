// src/redux-offline/disks/disks.optimistic.ts

import { AnyAction, Dispatch, Middleware, MiddlewareAPI } from "redux";
import {
  defaultBrowserCacheDiskID,
  defaultTempCloudSharingDiskID,
  getDexieDb,
  markSyncConflict,
} from "../../api/dexie-database";
import {
  LIST_DISKS,
  LIST_DISKS_COMMIT,
  LIST_DISKS_ROLLBACK,
  CREATE_DISK,
  CREATE_DISK_COMMIT,
  CREATE_DISK_ROLLBACK,
  GET_DISK,
  GET_DISK_COMMIT,
  GET_DISK_ROLLBACK,
  UPDATE_DISK,
  UPDATE_DISK_COMMIT,
  UPDATE_DISK_ROLLBACK,
  DELETE_DISK,
  DELETE_DISK_COMMIT,
  DELETE_DISK_ROLLBACK,
  CHECK_DISKS_TABLE_PERMISSIONS,
  CHECK_DISKS_TABLE_PERMISSIONS_COMMIT,
  CHECK_DISKS_TABLE_PERMISSIONS_ROLLBACK,
} from "../disks/disks.actions";
import {
  AuthProfile,
  IndexDB_ApiKey,
  IndexDB_Organization,
  IndexDB_Profile,
} from "../../framework/identity";
import { DiskFEO, DISKS_DEXIE_TABLE, DISKS_REDUX_KEY } from "./disks.reducer";
import _ from "lodash";
import { DiskTypeEnum, SystemPermissionType } from "@officexapp/types";
import { SYSTEM_PERMISSIONS_DEXIE_TABLE } from "../permissions/permissions.reducer";

/**
 * Middleware for handling optimistic updates for the disks table
 */
export const disksOptimisticDexieMiddleware = (currentIdentitySet: {
  currentOrg: IndexDB_Organization;
  currentProfile: AuthProfile;
}): Middleware => {
  // Return the actual middleware function with access to the provided values
  // @ts-ignore
  return (store: MiddlewareAPI<Dispatch, any>) =>
    (next: Dispatch<AnyAction>) =>
    async (action: AnyAction) => {
      // Skip actions we don't care about

      // Skip actions we don't care about
      if (
        ![
          GET_DISK,
          GET_DISK_COMMIT,
          GET_DISK_ROLLBACK,
          LIST_DISKS,
          LIST_DISKS_COMMIT,
          LIST_DISKS_ROLLBACK,
          CREATE_DISK,
          CREATE_DISK_COMMIT,
          CREATE_DISK_ROLLBACK,
          UPDATE_DISK,
          UPDATE_DISK_COMMIT,
          UPDATE_DISK_ROLLBACK,
          DELETE_DISK,
          DELETE_DISK_COMMIT,
          DELETE_DISK_ROLLBACK,
          CHECK_DISKS_TABLE_PERMISSIONS,
          CHECK_DISKS_TABLE_PERMISSIONS_COMMIT,
          CHECK_DISKS_TABLE_PERMISSIONS_ROLLBACK,
        ].includes(action.type)
      ) {
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
      // This won't create a new instance if the same one is already open
      const db = getDexieDb(userID, orgID);
      const table = db.table<DiskFEO, string>(DISKS_DEXIE_TABLE);
      let enhancedAction = action;

      try {
        // Process action based on type

        // ------------------------------ GET DISKS --------------------------------- //

        switch (action.type) {
          case GET_DISK: {
            // Get cached data from IndexedDB
            const optimisticID = action.meta.optimisticID;
            const cachedDisk = await table.get(optimisticID);
            if (cachedDisk) {
              enhancedAction = {
                ...action,
                optimistic: {
                  ...cachedDisk,
                  _isOptimistic: true,
                  _optimisticID: optimisticID,
                  _syncSuccess: false,
                  _syncConflict: false,
                  _syncWarning: `Awaiting Sync. This disk was fetched offline and will auto-sync with cloud when you are online again. If there are errors, it may need to be refetched. Anything else depending on it may also be affected.`,
                },
              };
            }
            break;
          }

          case GET_DISK_COMMIT: {
            const realDisk = action.payload?.ok?.data;
            if (realDisk) {
              await table.put({
                ...realDisk,
                _optimisticID: null,
                _isOptimistic: false,
                _syncSuccess: true,
                _syncConflict: false,
                _syncWarning: "",
              });
            }
            break;
          }

          case GET_DISK_ROLLBACK: {
            if (!action.payload.response) break;
            try {
              const err = await action.payload.response.json();
              const optimisticID = action.meta?.optimisticID;
              if (optimisticID) {
                const error_message = `Failed to get disk - a sync conflict occured between your offline local copy & the official cloud record. You may see sync conflicts in other related data. Error message for your request: ${err.err.message}`;
                await markSyncConflict(table, optimisticID, error_message);
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

          // ------------------------------ LIST DISKS --------------------------------- //

          case LIST_DISKS: {
            // Get cached data from IndexedDB
            const cachedDisks = await table.toArray();

            // Enhance action with cached data if available
            if (cachedDisks && cachedDisks.length > 0) {
              enhancedAction = {
                ...action,
                optimistic: cachedDisks.map((d) => ({
                  ...d,
                  _isOptimistic: true,
                  _optimisticID: d.id,
                })),
              };
            }
            break;
          }

          case LIST_DISKS_COMMIT: {
            // Extract disks from the response
            const disks = action.payload?.ok?.data?.items || [];

            // Update IndexedDB with fresh data
            await db.transaction("rw", table, async () => {
              // Get both default disks if they exist
              const defaultBrowserDisk = await table.get(
                defaultBrowserCacheDiskID
              );
              const defaultCloudSharingDisk = await table.get(
                defaultTempCloudSharingDiskID
              );

              // Filter out the default disks from the server response
              const nonDefaultDisks = disks.filter(
                (d: DiskFEO) =>
                  d.id !== defaultBrowserCacheDiskID &&
                  d.id !== defaultTempCloudSharingDiskID
              );

              // Update or add each disk from API response
              for (const disk of nonDefaultDisks) {
                await table.put({
                  ...disk,
                  _optimisticID: disk.id,
                  _isOptimistic: false,
                  _syncConflict: false,
                  _syncWarning: "",
                  _syncSuccess: true,
                });
              }

              // Make sure our default disks stay in the database
              if (defaultBrowserDisk) {
                await table.put({
                  ...defaultBrowserDisk,
                  _isOptimistic: false,
                  _syncConflict: false,
                  _syncWarning: "",
                  _syncSuccess: true,
                });
              }

              if (defaultCloudSharingDisk) {
                await table.put({
                  ...defaultCloudSharingDisk,
                  _isOptimistic: false,
                  _syncConflict: false,
                  _syncWarning: "",
                  _syncSuccess: true,
                });
              }
            });
            break;
          }

          case LIST_DISKS_ROLLBACK: {
            if (!action.payload.response) break;
            try {
              if (!action.payload.response) break;
              const err = await action.payload.response.json();
              const error_message = `Failed to fetch disks - ${err.err.message}`;
              enhancedAction = {
                ...action,
                error_message,
              };
            } catch (e) {
              console.log(e);
            }
            break;
          }

          // ------------------------------ CREATE DISK --------------------------------- //

          case CREATE_DISK: {
            // Only handle actions with disk data
            if (action.meta?.offline?.effect?.data) {
              const diskData = action.meta.offline.effect.data;
              const optimisticID = action.meta.optimisticID;

              // Create optimistic disk object
              const optimisticDisk: DiskFEO = {
                id: optimisticID,
                ...diskData,
                created_at: Date.now(),
                updated_at: Date.now(),
                permission_previews: [
                  SystemPermissionType.CREATE,
                  SystemPermissionType.EDIT,
                  SystemPermissionType.DELETE,
                  SystemPermissionType.VIEW,
                  SystemPermissionType.INVITE,
                ],
                _optimisticID: optimisticID,
                _syncWarning: `Awaiting Sync. This disk was created offline and will auto-sync with cloud when you are online again. If there are errors, it may need to be recreated. Anything else depending on it may also be affected.`,
                _syncConflict: false,
                _syncSuccess: false,
                _isOptimistic: true,
              };

              // Save to IndexedDB
              await table.put(optimisticDisk);

              // Enhance action with optimisticID
              enhancedAction = {
                ...action,
                optimistic: optimisticDisk,
              };
            }
            break;
          }

          case CREATE_DISK_COMMIT: {
            const optimisticID = action.meta?.optimisticID;
            const realDisk = action.payload?.ok?.data;
            if (optimisticID && realDisk) {
              await db.transaction("rw", table, async () => {
                // Remove optimistic version
                await table.delete(optimisticID);
                // Add real version
                await table.put({
                  ...realDisk,
                  _optimisticID: null,
                  _syncSuccess: true,
                  _syncConflict: false,
                  _syncWarning: "",
                  _isOptimistic: false,
                });
              });
            }
            break;
          }

          case CREATE_DISK_ROLLBACK: {
            if (!action.payload.response) break;
            try {
              const err = await action.payload.response.json();
              const optimisticID = action.meta?.optimisticID;
              if (optimisticID) {
                const error_message = `Failed to create disk - a sync conflict occured between your offline local copy & the official cloud record. You may see sync conflicts in other related data. Error message for your request: ${err.err.message}`;
                await markSyncConflict(table, optimisticID, error_message);
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

          // ------------------------------ UPDATE DISK --------------------------------- //

          case UPDATE_DISK: {
            // Only handle actions with disk data
            if (action.meta?.offline?.effect?.data) {
              const diskData = action.meta.offline.effect.data;
              const optimisticID = action.meta.optimisticID;

              const cachedDisk = await table.get(optimisticID);

              // Create optimistic disk object
              const optimisticDisk: DiskFEO = {
                id: diskData.id,
                ...cachedDisk,
                ...diskData,
                updated_at: Date.now(),
                _isOptimistic: true,
                _optimisticID: optimisticID,
                _syncWarning: `Awaiting Sync. This disk was edited offline and will auto-sync with cloud when you are online again. If there are errors, it may need to be reverted. Anything else depending on it may also be affected.`,
                _syncConflict: false,
                _syncSuccess: false,
              };

              // Save to IndexedDB
              await table.put(optimisticDisk);

              // Enhance action with optimisticID
              enhancedAction = {
                ...action,
                optimistic: optimisticDisk,
              };
            }
            break;
          }

          case UPDATE_DISK_COMMIT: {
            const optimisticID = action.meta?.optimisticID;
            const realDisk = action.payload?.ok?.data;
            if (optimisticID && realDisk) {
              await db.transaction("rw", table, async () => {
                // Remove optimistic version
                await table.delete(optimisticID);
                // Add real version
                await table.put({
                  ...realDisk,
                  _syncSuccess: true,
                  _syncConflict: false,
                  _syncWarning: "",
                  _isOptimistic: false,
                  _optimisticID: null,
                });
              });
            }
            break;
          }

          case UPDATE_DISK_ROLLBACK: {
            if (!action.payload.response) break;
            try {
              const err = await action.payload.response.json();
              const optimisticID = action.meta?.optimisticID;
              if (optimisticID) {
                const error_message = `Failed to update disk - a sync conflict occured between your offline local copy & the official cloud record. You may see sync conflicts in other related data. Error message for your request: ${err.err.message}`;
                await markSyncConflict(table, optimisticID, error_message);
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

          // ------------------------------ DELETE DISK --------------------------------- //

          case DELETE_DISK: {
            const optimisticID = action.meta.optimisticID;

            const cachedDisk = await table.get(optimisticID);

            if (cachedDisk) {
              const optimisticDisk: DiskFEO = {
                ...cachedDisk,
                id: optimisticID,
                _markedForDeletion: true,
                _syncWarning: `Awaiting Sync. This disk was deleted offline and will auto-sync with cloud when you are online again. If there are errors, it may need to be restored. Anything else depending on it may also be affected.`,
                _syncConflict: false,
                _syncSuccess: false,
                _isOptimistic: true,
                _optimisticID: optimisticID,
              };

              // mark for deletion in indexdb
              // Save to IndexedDB
              await table.put(optimisticDisk);

              // Enhance action with optimisticID
              enhancedAction = {
                ...action,
                optimistic: optimisticDisk,
              };
            }

            break;
          }

          case DELETE_DISK_COMMIT: {
            const optimisticID = action.meta?.optimisticID;
            if (optimisticID) {
              await db.transaction("rw", table, async () => {
                // Remove optimistic version
                await table.delete(optimisticID);
              });
            }
            break;
          }

          case DELETE_DISK_ROLLBACK: {
            if (!action.payload.response) break;
            try {
              const err = await action.payload.response.json();
              const optimisticID = action.meta?.optimisticID;
              if (optimisticID) {
                const error_message = `Failed to delete disk - a sync conflict occured between your offline local copy & the official cloud record. You may see sync conflicts in other related data. Error message for your request: ${err.err.message}`;
                await markSyncConflict(table, optimisticID, error_message);
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

          case CHECK_DISKS_TABLE_PERMISSIONS: {
            console.log(
              `Firing checkDisksTablePermissionsAction for user`,
              action
            );
            // check dexie
            const systemPermissionsTable = db.table(
              SYSTEM_PERMISSIONS_DEXIE_TABLE
            );
            const permission = await systemPermissionsTable.get(
              action.meta?.optimisticID
            );
            if (permission) {
              enhancedAction = {
                ...action,
                optimistic: permission,
              };
            }
            break;
          }

          case CHECK_DISKS_TABLE_PERMISSIONS_COMMIT: {
            console.log(
              `Handling CHECK_DISKS_TABLE_PERMISSIONS_COMMIT`,
              action
            );
            const optimisticID = action.meta?.optimisticID;
            const permissions = action.payload?.ok?.data?.permissions;

            if (permissions) {
              // Save to system permissions table
              const systemPermissionsTable = db.table(
                SYSTEM_PERMISSIONS_DEXIE_TABLE
              );
              await systemPermissionsTable.put({
                id: optimisticID,
                resource_id: "TABLE_DISKS",
                granted_to: optimisticID.replace("disk_table_permissions_", ""),
                granted_by: optimisticID.replace("disk_table_permissions_", ""),
                permission_types: permissions,
                begin_date_ms: 0,
                expiry_date_ms: -1,
                note: "Table permission",
                created_at: 0,
                last_modified_at: 0,
                from_placeholder_grantee: null,
                labels: [],
                redeem_code: null,
                metadata: null,
                external_id: null,
                external_payload: null,
                resource_name: "Disks Table",
                grantee_name: "You",
                grantee_avatar: null,
                granter_name: "System",
                permission_previews: [],
                _optimisticID: optimisticID,
                _isOptimistic: false,
                _syncSuccess: true,
                _syncConflict: false,
              });
            }
            break;
          }

          case CHECK_DISKS_TABLE_PERMISSIONS_ROLLBACK: {
            if (!action.payload.response) break;
            try {
              const err = await action.payload.response.json();
              const optimisticID = action.meta?.optimisticID;
              if (optimisticID) {
                const error_message = `Failed to check contact table permissions - a sync conflict occurred between your offline local copy & the official cloud record. You may see sync conflicts in other related data. Error message for your request: ${err.err.message}`;
                await markSyncConflict(table, optimisticID, error_message);
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
        console.error(`Error in disks middleware for ${action.type}:`, error);
        // Continue with the original action if there's an error
        return next(action);
      }
    };
};

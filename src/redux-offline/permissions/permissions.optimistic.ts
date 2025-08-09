// src/redux-offline/permissions/permissions.optimistic.ts

import { AnyAction, Dispatch, Middleware, MiddlewareAPI } from "redux";
import { getDexieDb, markSyncConflict } from "../../api/dexie-database";
import {
  GET_SYSTEM_PERMISSION,
  GET_SYSTEM_PERMISSION_COMMIT,
  GET_SYSTEM_PERMISSION_ROLLBACK,
  LIST_SYSTEM_PERMISSIONS,
  LIST_SYSTEM_PERMISSIONS_COMMIT,
  LIST_SYSTEM_PERMISSIONS_ROLLBACK,
  CREATE_SYSTEM_PERMISSION,
  CREATE_SYSTEM_PERMISSION_COMMIT,
  CREATE_SYSTEM_PERMISSION_ROLLBACK,
  UPDATE_SYSTEM_PERMISSION,
  UPDATE_SYSTEM_PERMISSION_COMMIT,
  UPDATE_SYSTEM_PERMISSION_ROLLBACK,
  DELETE_SYSTEM_PERMISSION,
  DELETE_SYSTEM_PERMISSION_COMMIT,
  DELETE_SYSTEM_PERMISSION_ROLLBACK,
  REDEEM_SYSTEM_PERMISSION,
  REDEEM_SYSTEM_PERMISSION_COMMIT,
  REDEEM_SYSTEM_PERMISSION_ROLLBACK,
  GET_DIRECTORY_PERMISSION,
  GET_DIRECTORY_PERMISSION_COMMIT,
  GET_DIRECTORY_PERMISSION_ROLLBACK,
  LIST_DIRECTORY_PERMISSIONS,
  LIST_DIRECTORY_PERMISSIONS_COMMIT,
  LIST_DIRECTORY_PERMISSIONS_ROLLBACK,
  CREATE_DIRECTORY_PERMISSION,
  CREATE_DIRECTORY_PERMISSION_COMMIT,
  CREATE_DIRECTORY_PERMISSION_ROLLBACK,
  UPDATE_DIRECTORY_PERMISSION,
  UPDATE_DIRECTORY_PERMISSION_COMMIT,
  UPDATE_DIRECTORY_PERMISSION_ROLLBACK,
  DELETE_DIRECTORY_PERMISSION,
  DELETE_DIRECTORY_PERMISSION_COMMIT,
  DELETE_DIRECTORY_PERMISSION_ROLLBACK,
  REDEEM_DIRECTORY_PERMISSION,
  REDEEM_DIRECTORY_PERMISSION_COMMIT,
  REDEEM_DIRECTORY_PERMISSION_ROLLBACK,
  CHECK_PERMISSION_TABLE_PERMISSIONS_ROLLBACK,
  CHECK_PERMISSION_TABLE_PERMISSIONS_COMMIT,
  CHECK_PERMISSION_TABLE_PERMISSIONS,
} from "./permissions.actions";
import {
  AuthProfile,
  IndexDB_ApiKey,
  IndexDB_Organization,
  IndexDB_Profile,
} from "../../framework/identity";
import {
  SystemPermissionFEO,
  DirectoryPermissionFEO,
  SYSTEM_PERMISSIONS_DEXIE_TABLE,
  DIRECTORY_PERMISSIONS_DEXIE_TABLE,
} from "./permissions.reducer";
import _ from "lodash";

/**
 * Middleware for handling optimistic updates for the permissions tables
 */
export const permissionsOptimisticDexieMiddleware = (currentIdentitySet: {
  currentOrg: IndexDB_Organization;
  currentProfile: AuthProfile;
}): Middleware => {
  // Return the actual middleware function with access to the provided values
  // @ts-ignore
  return (store: MiddlewareAPI<Dispatch, any>) =>
    (next: Dispatch<AnyAction>) =>
    async (action: AnyAction) => {
      // Skip actions we don't care about

      // Define all permission-related actions we want to handle
      const permissionActions = [
        GET_SYSTEM_PERMISSION,
        GET_SYSTEM_PERMISSION_COMMIT,
        GET_SYSTEM_PERMISSION_ROLLBACK,
        LIST_SYSTEM_PERMISSIONS,
        LIST_SYSTEM_PERMISSIONS_COMMIT,
        LIST_SYSTEM_PERMISSIONS_ROLLBACK,
        CREATE_SYSTEM_PERMISSION,
        CREATE_SYSTEM_PERMISSION_COMMIT,
        CREATE_SYSTEM_PERMISSION_ROLLBACK,
        UPDATE_SYSTEM_PERMISSION,
        UPDATE_SYSTEM_PERMISSION_COMMIT,
        UPDATE_SYSTEM_PERMISSION_ROLLBACK,
        DELETE_SYSTEM_PERMISSION,
        DELETE_SYSTEM_PERMISSION_COMMIT,
        DELETE_SYSTEM_PERMISSION_ROLLBACK,
        REDEEM_SYSTEM_PERMISSION,
        REDEEM_SYSTEM_PERMISSION_COMMIT,
        REDEEM_SYSTEM_PERMISSION_ROLLBACK,
        GET_DIRECTORY_PERMISSION,
        GET_DIRECTORY_PERMISSION_COMMIT,
        GET_DIRECTORY_PERMISSION_ROLLBACK,
        LIST_DIRECTORY_PERMISSIONS,
        LIST_DIRECTORY_PERMISSIONS_COMMIT,
        LIST_DIRECTORY_PERMISSIONS_ROLLBACK,
        CREATE_DIRECTORY_PERMISSION,
        CREATE_DIRECTORY_PERMISSION_COMMIT,
        CREATE_DIRECTORY_PERMISSION_ROLLBACK,
        UPDATE_DIRECTORY_PERMISSION,
        UPDATE_DIRECTORY_PERMISSION_COMMIT,
        UPDATE_DIRECTORY_PERMISSION_ROLLBACK,
        DELETE_DIRECTORY_PERMISSION,
        DELETE_DIRECTORY_PERMISSION_COMMIT,
        DELETE_DIRECTORY_PERMISSION_ROLLBACK,
        REDEEM_DIRECTORY_PERMISSION,
        REDEEM_DIRECTORY_PERMISSION_COMMIT,
        REDEEM_DIRECTORY_PERMISSION_ROLLBACK,
      ];

      // Skip if action type is not in our list
      if (!permissionActions.includes(action.type)) {
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
      let systemTable = db.table<SystemPermissionFEO, string>(
        SYSTEM_PERMISSIONS_DEXIE_TABLE
      );
      let directoryTable = db.table<DirectoryPermissionFEO, string>(
        DIRECTORY_PERMISSIONS_DEXIE_TABLE
      );
      let enhancedAction = action;

      try {
        // Process action based on type
        switch (action.type) {
          // ===== SYSTEM PERMISSIONS ACTIONS =====

          // GET SYSTEM PERMISSION
          case GET_SYSTEM_PERMISSION: {
            const optimisticID = action.meta.optimisticID;
            const cachedPermission = await systemTable.get(optimisticID);
            if (cachedPermission) {
              enhancedAction = {
                ...action,
                optimistic: {
                  ...cachedPermission,
                  _isOptimistic: true,
                  _optimisticID: optimisticID,
                  _syncSuccess: false,
                  _syncConflict: false,
                  _syncWarning: `Awaiting Sync. This system permission was fetched offline and will auto-sync with cloud when you are online again. If there are errors, it may need to be refetched.`,
                },
              };
            }
            break;
          }

          case GET_SYSTEM_PERMISSION_COMMIT: {
            const realPermission = action.payload?.ok?.data;
            if (realPermission) {
              await systemTable.put({
                ...realPermission,
                _optimisticID: null,
                _isOptimistic: false,
                _syncSuccess: true,
                _syncConflict: false,
                _syncWarning: "",
              });
            }
            break;
          }

          case GET_SYSTEM_PERMISSION_ROLLBACK: {
            if (!action.payload.response) break;
            try {
              const err = await action.payload.response.json();
              const optimisticID = action.meta?.optimisticID;
              if (optimisticID) {
                const error_message = `Failed to get system permission - a sync conflict occurred. Error message: ${err.err.message}`;
                await markSyncConflict(
                  systemTable,
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

          // LIST SYSTEM PERMISSIONS
          case LIST_SYSTEM_PERMISSIONS: {
            const cachedPermissions = await systemTable.toArray();
            if (cachedPermissions && cachedPermissions.length > 0) {
              enhancedAction = {
                ...action,
                optimistic: cachedPermissions.map((p) => ({
                  ...p,
                  _isOptimistic: true,
                  _optimisticID: p.id,
                })),
              };
            }
            break;
          }

          case LIST_SYSTEM_PERMISSIONS_COMMIT: {
            const permissions = action.payload?.ok?.data?.items || [];
            await db.transaction("rw", systemTable, async () => {
              for (const permission of permissions) {
                await systemTable.put({
                  ...permission,
                  _optimisticID: permission.id,
                  _isOptimistic: false,
                  _syncConflict: false,
                  _syncWarning: "",
                  _syncSuccess: true,
                });
              }
            });
            break;
          }

          case LIST_SYSTEM_PERMISSIONS_ROLLBACK: {
            if (!action.payload.response) break;
            try {
              const err = await action.payload.response.json();
              const error_message = `Failed to fetch system permissions - ${err.err.message}`;
              enhancedAction = {
                ...action,
                error_message,
              };
            } catch (e) {
              console.log(e);
            }
            break;
          }

          // CREATE SYSTEM PERMISSION
          case CREATE_SYSTEM_PERMISSION: {
            if (action.meta?.offline?.effect?.data) {
              const permissionData = action.meta.offline.effect.data;
              const optimisticID = action.meta.optimisticID;

              const optimisticPermission: SystemPermissionFEO = {
                ...permissionData,
                id: optimisticID,
                permission_previews: permissionData.permission_types || [],
                labels: [],
                granted_by: userID,
                created_at: Date.now(),
                last_modified_at: Date.now(),
                _optimisticID: optimisticID,
                _syncWarning: `Awaiting Sync. This system permission was created offline and will auto-sync with cloud when you are online again.`,
                _syncConflict: false,
                _syncSuccess: false,
                _isOptimistic: true,
              };

              await systemTable.put(optimisticPermission);

              enhancedAction = {
                ...action,
                optimistic: optimisticPermission,
              };
            }
            break;
          }

          case CREATE_SYSTEM_PERMISSION_COMMIT: {
            const optimisticID = action.meta?.optimisticID;
            const realPermission = action.payload?.ok?.data.permission;
            if (optimisticID && realPermission) {
              await db.transaction("rw", systemTable, async () => {
                await systemTable.delete(optimisticID);
                await systemTable.put({
                  ...realPermission,
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

          case CREATE_SYSTEM_PERMISSION_ROLLBACK: {
            if (!action.payload.response) break;
            try {
              const err = await action.payload.response.json();
              const optimisticID = action.meta?.optimisticID;
              if (optimisticID) {
                const error_message = `Failed to create system permission - a sync conflict occurred. Error message: ${err.err.message}`;
                await markSyncConflict(
                  systemTable,
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

          // UPDATE SYSTEM PERMISSION
          case UPDATE_SYSTEM_PERMISSION: {
            if (action.meta?.offline?.effect?.data) {
              const permissionData = action.meta.offline.effect.data;
              const optimisticID = action.meta.optimisticID;

              const cachedPermission = await systemTable.get(optimisticID);

              const optimisticPermission: SystemPermissionFEO = {
                id: permissionData.id,
                ...cachedPermission,
                ...permissionData,
                last_modified_at: Date.now(),
                _isOptimistic: true,
                _optimisticID: optimisticID,
                _syncWarning: `Awaiting Sync. This system permission was edited offline and will auto-sync with cloud when you are online again.`,
                _syncConflict: false,
                _syncSuccess: false,
              };

              await systemTable.put(optimisticPermission);

              enhancedAction = {
                ...action,
                optimistic: optimisticPermission,
              };
            }
            break;
          }

          case UPDATE_SYSTEM_PERMISSION_COMMIT: {
            const optimisticID = action.meta?.optimisticID;
            const realPermission = action.payload?.ok?.data;
            if (optimisticID && realPermission) {
              await db.transaction("rw", systemTable, async () => {
                await systemTable.delete(optimisticID);
                await systemTable.put({
                  ...realPermission,
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

          case UPDATE_SYSTEM_PERMISSION_ROLLBACK: {
            if (!action.payload.response) break;
            try {
              const err = await action.payload.response.json();
              const optimisticID = action.meta?.optimisticID;
              if (optimisticID) {
                const error_message = `Failed to update system permission - a sync conflict occurred. Error message: ${err.err.message}`;
                await markSyncConflict(
                  systemTable,
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

          // DELETE SYSTEM PERMISSION
          case DELETE_SYSTEM_PERMISSION: {
            const optimisticID = action.meta.optimisticID;

            const cachedPermission = await systemTable.get(optimisticID);

            if (cachedPermission) {
              const optimisticPermission: SystemPermissionFEO = {
                ...cachedPermission,
                id: optimisticID,
                _markedForDeletion: true,
                _syncWarning: `Awaiting Sync. This system permission was deleted offline and will auto-sync with cloud when you are online again.`,
                _syncConflict: false,
                _syncSuccess: false,
                _isOptimistic: true,
                _optimisticID: optimisticID,
              };

              await systemTable.put(optimisticPermission);

              enhancedAction = {
                ...action,
                optimistic: optimisticPermission,
              };
            }
            break;
          }

          case DELETE_SYSTEM_PERMISSION_COMMIT: {
            const optimisticID = action.meta?.optimisticID;
            if (optimisticID) {
              await db.transaction("rw", systemTable, async () => {
                await systemTable.delete(optimisticID);
              });
            }
            break;
          }

          case DELETE_SYSTEM_PERMISSION_ROLLBACK: {
            if (!action.payload.response) break;
            try {
              const err = await action.payload.response.json();
              const optimisticID = action.meta?.optimisticID;
              if (optimisticID) {
                const error_message = `Failed to delete system permission - a sync conflict occurred. Error message: ${err.err.message}`;
                await markSyncConflict(
                  systemTable,
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

          // ===== DIRECTORY PERMISSIONS ACTIONS =====

          // GET DIRECTORY PERMISSION
          case GET_DIRECTORY_PERMISSION: {
            const optimisticID = action.meta.optimisticID;
            const cachedPermission = await directoryTable.get(optimisticID);
            if (cachedPermission) {
              enhancedAction = {
                ...action,
                optimistic: {
                  ...cachedPermission,
                  _isOptimistic: true,
                  _optimisticID: optimisticID,
                  _syncSuccess: false,
                  _syncConflict: false,
                  _syncWarning: `Awaiting Sync. This directory permission was fetched offline and will auto-sync with cloud when you are online again. If there are errors, it may need to be refetched.`,
                },
              };
            }
            break;
          }

          case GET_DIRECTORY_PERMISSION_COMMIT: {
            const realPermission = action.payload?.ok?.data;
            if (realPermission) {
              await directoryTable.put({
                ...realPermission,
                _optimisticID: null,
                _isOptimistic: false,
                _syncSuccess: true,
                _syncConflict: false,
                _syncWarning: "",
              });
            }
            break;
          }

          case GET_DIRECTORY_PERMISSION_ROLLBACK: {
            if (!action.payload.response) break;
            try {
              const err = await action.payload.response.json();
              const optimisticID = action.meta?.optimisticID;
              if (optimisticID) {
                const error_message = `Failed to get directory permission - a sync conflict occurred. Error message: ${err.err.message}`;
                await markSyncConflict(
                  directoryTable,
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

          case LIST_DIRECTORY_PERMISSIONS: {
            const resourceId =
              action.meta?.offline?.effect?.data?.filters?.resource_id;
            const cachedPermissions = await directoryTable
              .where("resource_id")
              .equals(resourceId)
              .toArray();
            if (cachedPermissions && cachedPermissions.length > 0) {
              enhancedAction = {
                ...action,
                optimistic: cachedPermissions.map((p) => ({
                  ...p,
                  _isOptimistic: true,
                  _optimisticID: p.id,
                })),
              };
            }
            break;
          }

          case LIST_DIRECTORY_PERMISSIONS_COMMIT: {
            const permissions = action.payload?.ok?.data?.items || [];
            const resource_id = permissions[0]?.resource_id;
            if (!resource_id) break;
            const cachedPermissions = await directoryTable
              .where("resource_id")
              .equals(resource_id)
              .toArray();
            await directoryTable.bulkDelete(cachedPermissions.map((p) => p.id));
            await db.transaction("rw", directoryTable, async () => {
              for (const permission of permissions) {
                await directoryTable.put({
                  ...permission,
                  _optimisticID: permission.id,
                  _isOptimistic: false,
                  _syncConflict: false,
                  _syncWarning: "",
                  _syncSuccess: true,
                });
              }
            });
            break;
          }

          case LIST_DIRECTORY_PERMISSIONS_ROLLBACK: {
            if (!action.payload.response) break;
            try {
              const err = await action.payload.response.json();
              const error_message = `Failed to fetch directory permissions - ${err.err.message}`;
              enhancedAction = {
                ...action,
                error_message,
              };
            } catch (e) {
              console.log(e);
            }
            break;
          }

          // CREATE DIRECTORY PERMISSION
          case CREATE_DIRECTORY_PERMISSION: {
            if (action.meta?.offline?.effect?.data) {
              const permissionData = action.meta.offline.effect.data;
              const optimisticID = action.meta.optimisticID;

              const optimisticPermission: DirectoryPermissionFEO = {
                id: optimisticID,
                ...permissionData,
                permission_previews: permissionData.permission_types || [],
                resource_path: permissionData.resource_path || "/",
                labels: [],
                granted_by: userID,
                created_at: Date.now(),
                last_modified_at: Date.now(),
                _optimisticID: optimisticID,
                _syncWarning: `Awaiting Sync. This directory permission was created offline and will auto-sync with cloud when you are online again.`,
                _syncConflict: false,
                _syncSuccess: false,
                _isOptimistic: true,
              };

              await directoryTable.put(optimisticPermission);

              enhancedAction = {
                ...action,
                optimistic: optimisticPermission,
              };
            }
            break;
          }

          case CREATE_DIRECTORY_PERMISSION_COMMIT: {
            const optimisticID = action.meta?.optimisticID;
            const realPermission = action.payload?.ok?.data.permission;
            if (optimisticID && realPermission) {
              await db.transaction("rw", directoryTable, async () => {
                await directoryTable.delete(optimisticID);
                await directoryTable.put({
                  ...realPermission,
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

          case CREATE_DIRECTORY_PERMISSION_ROLLBACK: {
            if (!action.payload.response) break;
            try {
              const err = await action.payload.response.json();
              const optimisticID = action.meta?.optimisticID;
              if (optimisticID) {
                const error_message = `Failed to create directory permission - a sync conflict occurred. Error message: ${err.err.message}`;
                await markSyncConflict(
                  directoryTable,
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

          // UPDATE DIRECTORY PERMISSION
          case UPDATE_DIRECTORY_PERMISSION: {
            if (action.meta?.offline?.effect?.data) {
              const permissionData = action.meta.offline.effect.data;
              const optimisticID = action.meta.optimisticID;

              const cachedPermission = await directoryTable.get(optimisticID);

              const optimisticPermission: DirectoryPermissionFEO = {
                id: permissionData.id,
                ...cachedPermission,
                ...permissionData,
                last_modified_at: Date.now(),
                _isOptimistic: true,
                _optimisticID: optimisticID,
                _syncWarning: `Awaiting Sync. This directory permission was edited offline and will auto-sync with cloud when you are online again.`,
                _syncConflict: false,
                _syncSuccess: false,
              };

              await directoryTable.put(optimisticPermission);

              enhancedAction = {
                ...action,
                optimistic: optimisticPermission,
              };
            }
            break;
          }

          case UPDATE_DIRECTORY_PERMISSION_COMMIT: {
            const optimisticID = action.meta?.optimisticID;
            const realPermission = action.payload?.ok?.data;
            if (optimisticID && realPermission) {
              await db.transaction("rw", directoryTable, async () => {
                await directoryTable.delete(optimisticID);
                await directoryTable.put({
                  ...realPermission,
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

          case UPDATE_DIRECTORY_PERMISSION_ROLLBACK: {
            if (!action.payload.response) break;
            try {
              const err = await action.payload.response.json();
              const optimisticID = action.meta?.optimisticID;
              if (optimisticID) {
                const error_message = `Failed to update directory permission - a sync conflict occurred. Error message: ${err.err.message}`;
                await markSyncConflict(
                  directoryTable,
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

          // DELETE DIRECTORY PERMISSION
          case DELETE_DIRECTORY_PERMISSION: {
            const optimisticID = action.meta.optimisticID;

            const cachedPermission = await directoryTable.get(optimisticID);

            if (cachedPermission) {
              const optimisticPermission: DirectoryPermissionFEO = {
                ...cachedPermission,
                id: optimisticID,
                _markedForDeletion: true,
                _syncWarning: `Awaiting Sync. This directory permission was deleted offline and will auto-sync with cloud when you are online again.`,
                _syncConflict: false,
                _syncSuccess: false,
                _isOptimistic: true,
                _optimisticID: optimisticID,
              };

              await directoryTable.put(optimisticPermission);

              enhancedAction = {
                ...action,
                optimistic: optimisticPermission,
              };
            }
            break;
          }

          case DELETE_DIRECTORY_PERMISSION_COMMIT: {
            const optimisticID = action.meta?.optimisticID;
            if (optimisticID) {
              await db.transaction("rw", directoryTable, async () => {
                await directoryTable.delete(optimisticID);
              });
            }
            break;
          }

          case DELETE_DIRECTORY_PERMISSION_ROLLBACK: {
            if (!action.payload.response) break;
            try {
              const err = await action.payload.response.json();
              const optimisticID = action.meta?.optimisticID;
              if (optimisticID) {
                const error_message = `Failed to delete directory permission - a sync conflict occurred. Error message: ${err.err.message}`;
                await markSyncConflict(
                  directoryTable,
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

          // REDEEM DIRECTORY PERMISSION
          case REDEEM_DIRECTORY_PERMISSION: {
            const optimisticID = action.meta.optimisticID;
            const payload = action.meta.offline.effect.data;

            const cachedPermission = await directoryTable.get(optimisticID);

            if (cachedPermission) {
              const optimisticPermission: DirectoryPermissionFEO = {
                ...cachedPermission,
                granted_to: payload.user_id,
                last_modified_at: Date.now(),
                _optimisticID: optimisticID,
                _syncWarning: `Awaiting Sync. This directory permission was redeemed offline and will auto-sync with cloud when you are online again.`,
                _syncConflict: false,
                _syncSuccess: false,
                _isOptimistic: true,
              };

              await directoryTable.put(optimisticPermission);

              enhancedAction = {
                ...action,
                optimistic: optimisticPermission,
              };
            }
            break;
          }

          case REDEEM_DIRECTORY_PERMISSION_COMMIT: {
            const optimisticID = action.meta?.optimisticID;
            const redeemedPermission = action.payload?.ok?.data?.permission;
            if (optimisticID && redeemedPermission) {
              await db.transaction("rw", directoryTable, async () => {
                await directoryTable.delete(optimisticID);
                await directoryTable.put({
                  ...redeemedPermission,
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

          case REDEEM_DIRECTORY_PERMISSION_ROLLBACK: {
            if (!action.payload.response) break;
            try {
              const err = await action.payload.response.json();
              const optimisticID = action.meta?.optimisticID;
              if (optimisticID) {
                const error_message = `Failed to redeem directory permission - a sync conflict occurred. Error message: ${err.err.message}`;
                await markSyncConflict(
                  directoryTable,
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

          // REDEEM SYSTEM PERMISSION
          case REDEEM_SYSTEM_PERMISSION: {
            const optimisticID = action.meta.optimisticID;
            const payload = action.meta.offline.effect.data;

            const cachedPermission = await systemTable.get(optimisticID);

            if (cachedPermission) {
              const optimisticPermission: SystemPermissionFEO = {
                ...cachedPermission,
                granted_to: payload.user_id,
                last_modified_at: Date.now(),
                _optimisticID: optimisticID,
                _syncWarning: `Awaiting Sync. This system permission was redeemed offline and will auto-sync with cloud when you are online again.`,
                _syncConflict: false,
                _syncSuccess: false,
                _isOptimistic: true,
              };

              await systemTable.put(optimisticPermission);

              enhancedAction = {
                ...action,
                optimistic: optimisticPermission,
              };
            }
            break;
          }

          case REDEEM_SYSTEM_PERMISSION_COMMIT: {
            const optimisticID = action.meta?.optimisticID;
            const redeemedPermission = action.payload?.ok?.data?.permission;
            if (optimisticID && redeemedPermission) {
              await db.transaction("rw", systemTable, async () => {
                await systemTable.delete(optimisticID);
                await systemTable.put({
                  ...redeemedPermission,
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

          case REDEEM_SYSTEM_PERMISSION_ROLLBACK: {
            if (!action.payload.response) break;
            try {
              const err = await action.payload.response.json();
              const optimisticID = action.meta?.optimisticID;
              if (optimisticID) {
                const error_message = `Failed to redeem system permission - a sync conflict occurred. Error message: ${err.err.message}`;
                await markSyncConflict(
                  systemTable,
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

          case CHECK_PERMISSION_TABLE_PERMISSIONS: {
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

          case CHECK_PERMISSION_TABLE_PERMISSIONS_COMMIT: {
            const optimisticID = action.meta?.optimisticID;
            const permissions = action.payload?.ok?.data?.permissions;

            if (permissions) {
              // Save to system permissions table
              const systemPermissionsTable = db.table(
                SYSTEM_PERMISSIONS_DEXIE_TABLE
              );
              await systemPermissionsTable.put({
                id: optimisticID,
                resource_id: "TABLE_PERMISSIONS",
                granted_to: optimisticID.replace(
                  "permission_table_permissions_",
                  ""
                ),
                granted_by: optimisticID.replace(
                  "permission_table_permissions_",
                  ""
                ),
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
                resource_name: "Permission Table",
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

          case CHECK_PERMISSION_TABLE_PERMISSIONS_ROLLBACK: {
            if (!action.payload.response) break;
            try {
              const err = await action.payload.response.json();
              const optimisticID = action.meta?.optimisticID;
              if (optimisticID) {
                const error_message = `Failed to check permission table permissions - a sync conflict occurred between your offline local copy & the official cloud record. You may see sync conflicts in other related data. Error message for your request: ${err.err.message}`;
                await markSyncConflict(
                  systemTable,
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
        }

        // Pass the (potentially enhanced) action to the next middleware
        return next(enhancedAction);
      } catch (error) {
        console.error(
          `Error in permissions middleware for ${action.type}:`,
          error
        );
        // Continue with the original action if there's an error
        return next(action);
      }
    };
};

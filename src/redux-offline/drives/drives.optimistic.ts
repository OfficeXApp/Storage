// src/redux-offline/drives/drives.optimistic.ts

import { AnyAction, Dispatch, Middleware, MiddlewareAPI } from "redux";
import { getDexieDb, markSyncConflict } from "../../api/dexie-database";
import {
  LIST_DRIVES,
  LIST_DRIVES_COMMIT,
  LIST_DRIVES_ROLLBACK,
  CREATE_DRIVE,
  CREATE_DRIVE_COMMIT,
  CREATE_DRIVE_ROLLBACK,
  GET_DRIVE,
  GET_DRIVE_COMMIT,
  GET_DRIVE_ROLLBACK,
  UPDATE_DRIVE,
  UPDATE_DRIVE_COMMIT,
  UPDATE_DRIVE_ROLLBACK,
  DELETE_DRIVE,
  DELETE_DRIVE_COMMIT,
  DELETE_DRIVE_ROLLBACK,
} from "./drives.actions";
import {
  AuthProfile,
  IndexDB_ApiKey,
  IndexDB_Organization,
  IndexDB_Profile,
} from "../../framework/identity";
import {
  DriveFEO,
  DRIVES_DEXIE_TABLE,
  DRIVES_REDUX_KEY,
} from "./drives.reducer";
import _ from "lodash";

/**
 * Middleware for handling optimistic updates for the drives table
 */
export const drivesOptimisticDexieMiddleware = (currentIdentitySet: {
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
          GET_DRIVE,
          GET_DRIVE_COMMIT,
          GET_DRIVE_ROLLBACK,
          LIST_DRIVES,
          LIST_DRIVES_COMMIT,
          LIST_DRIVES_ROLLBACK,
          CREATE_DRIVE,
          CREATE_DRIVE_COMMIT,
          CREATE_DRIVE_ROLLBACK,
          UPDATE_DRIVE,
          UPDATE_DRIVE_COMMIT,
          UPDATE_DRIVE_ROLLBACK,
          DELETE_DRIVE,
          DELETE_DRIVE_COMMIT,
          DELETE_DRIVE_ROLLBACK,
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
      const table = db.table<DriveFEO, string>(DRIVES_DEXIE_TABLE);
      let enhancedAction = action;

      try {
        // Process action based on type

        // ------------------------------ GET DRIVE --------------------------------- //

        switch (action.type) {
          case GET_DRIVE: {
            // Get cached data from IndexedDB
            const optimisticID = action.meta.optimisticID;
            const cachedDrive = await table.get(optimisticID);
            if (cachedDrive) {
              enhancedAction = {
                ...action,
                optimistic: {
                  ...cachedDrive,
                  _isOptimistic: true,
                  _optimisticID: optimisticID,
                  _syncSuccess: false,
                  _syncConflict: false,
                  _syncWarning: `Awaiting Sync. This drive was fetched offline and will auto-sync with cloud when you are online again. If there are errors, it may need to be refetched. Anything else depending on it may also be affected.`,
                },
              };
            }
            break;
          }

          case GET_DRIVE_COMMIT: {
            const realDrive = action.payload?.ok?.data;
            if (realDrive) {
              await table.put({
                ...realDrive,
                _optimisticID: null,
                _isOptimistic: false,
                _syncSuccess: true,
                _syncConflict: false,
                _syncWarning: "",
              });
            }
            break;
          }

          case GET_DRIVE_ROLLBACK: {
            if (!action.payload.response) break;
            try {
              const err = await action.payload.response.json();
              const optimisticID = action.meta?.optimisticID;
              if (optimisticID) {
                const error_message = `Failed to get drive - a sync conflict occurred between your offline local copy & the official cloud record. You may see sync conflicts in other related data. Error message for your request: ${err.err.message}`;
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

          // ------------------------------ LIST DRIVES --------------------------------- //

          case LIST_DRIVES: {
            // Get cached data from IndexedDB
            const cachedDrives = await table.toArray();

            // Enhance action with cached data if available
            if (cachedDrives && cachedDrives.length > 0) {
              enhancedAction = {
                ...action,
                optimistic: cachedDrives.map((d) => ({
                  ...d,
                  _isOptimistic: true,
                  _optimisticID: d.id,
                })),
              };
            }
            break;
          }

          case LIST_DRIVES_COMMIT: {
            // Extract drives from the response
            const drives = action.payload?.ok?.data?.items || [];

            // Update IndexedDB with fresh data
            await db.transaction("rw", table, async () => {
              // Update or add each drive
              for (const drive of drives) {
                await table.put({
                  ...drive,
                  _optimisticID: drive.id,
                  _isOptimistic: false,
                  _syncConflict: false,
                  _syncWarning: "",
                  _syncSuccess: true,
                });
              }
            });
            break;
          }

          case LIST_DRIVES_ROLLBACK: {
            if (!action.payload.response) break;
            try {
              const err = await action.payload.response.json();
              const error_message = `Failed to fetch drives - ${err.err.message}`;
              enhancedAction = {
                ...action,
                error_message,
              };
            } catch (e) {
              console.log(e);
            }
            break;
          }

          // ------------------------------ CREATE DRIVE --------------------------------- //

          case CREATE_DRIVE: {
            // Only handle actions with drive data
            if (action.meta?.offline?.effect?.data) {
              const driveData = action.meta.offline.effect.data;
              const optimisticID = action.meta.optimisticID;

              // Create optimistic drive object
              const optimisticDrive: DriveFEO = {
                id: optimisticID,
                ...driveData,
                labels: driveData.labels || [],
                permission_previews: [],
                created_at: Date.now(),
                updated_at: Date.now(),
                _optimisticID: optimisticID,
                _syncWarning: `Awaiting Sync. This drive was created offline and will auto-sync with cloud when you are online again. If there are errors, it may need to be recreated. Anything else depending on it may also be affected.`,
                _syncConflict: false,
                _syncSuccess: false,
                _isOptimistic: true,
              };

              // Save to IndexedDB
              await table.put(optimisticDrive);

              // Enhance action with optimisticID
              enhancedAction = {
                ...action,
                optimistic: optimisticDrive,
              };
            }
            break;
          }

          case CREATE_DRIVE_COMMIT: {
            const optimisticID = action.meta?.optimisticID;
            const realDrive = action.payload?.ok?.data;
            if (optimisticID && realDrive) {
              await db.transaction("rw", table, async () => {
                // Remove optimistic version
                await table.delete(optimisticID);
                // Add real version
                await table.put({
                  ...realDrive,
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

          case CREATE_DRIVE_ROLLBACK: {
            if (!action.payload.response) break;
            try {
              const err = await action.payload.response.json();
              const optimisticID = action.meta?.optimisticID;
              if (optimisticID) {
                const error_message = `Failed to create drive - a sync conflict occurred between your offline local copy & the official cloud record. You may see sync conflicts in other related data. Error message for your request: ${err.err.message}`;
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

          // ------------------------------ UPDATE DRIVE --------------------------------- //

          case UPDATE_DRIVE: {
            // Only handle actions with drive data
            if (action.meta?.offline?.effect?.data) {
              const driveData = action.meta.offline.effect.data;
              const optimisticID = action.meta.optimisticID;

              const cachedDrive = await table.get(optimisticID);

              // Create optimistic drive object
              const optimisticDrive: DriveFEO = {
                id: driveData.id,
                ...cachedDrive,
                ...driveData,
                updated_at: Date.now(),
                _isOptimistic: true,
                _optimisticID: optimisticID,
                _syncWarning: `Awaiting Sync. This drive was edited offline and will auto-sync with cloud when you are online again. If there are errors, it may need to be reverted. Anything else depending on it may also be affected.`,
                _syncConflict: false,
                _syncSuccess: false,
              };

              // Save to IndexedDB
              await table.put(optimisticDrive);

              // Enhance action with optimisticID
              enhancedAction = {
                ...action,
                optimistic: optimisticDrive,
              };
            }
            break;
          }

          case UPDATE_DRIVE_COMMIT: {
            const optimisticID = action.meta?.optimisticID;
            const realDrive = action.payload?.ok?.data;
            if (optimisticID && realDrive) {
              await db.transaction("rw", table, async () => {
                // Remove optimistic version
                await table.delete(optimisticID);
                // Add real version
                await table.put({
                  ...realDrive,
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

          case UPDATE_DRIVE_ROLLBACK: {
            if (!action.payload.response) break;
            try {
              const err = await action.payload.response.json();
              const optimisticID = action.meta?.optimisticID;
              if (optimisticID) {
                const error_message = `Failed to update drive - a sync conflict occurred between your offline local copy & the official cloud record. You may see sync conflicts in other related data. Error message for your request: ${err.err.message}`;
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

          // ------------------------------ DELETE DRIVE --------------------------------- //

          case DELETE_DRIVE: {
            const optimisticID = action.meta.optimisticID;

            const cachedDrive = await table.get(optimisticID);

            if (cachedDrive) {
              const optimisticDrive: DriveFEO = {
                ...cachedDrive,
                id: optimisticID,
                _markedForDeletion: true,
                _syncWarning: `Awaiting Sync. This drive was deleted offline and will auto-sync with cloud when you are online again. If there are errors, it may need to be restored. Anything else depending on it may also be affected.`,
                _syncConflict: false,
                _syncSuccess: false,
                _isOptimistic: true,
                _optimisticID: optimisticID,
              };

              // mark for deletion in indexdb
              // Save to IndexedDB
              await table.put(optimisticDrive);

              // Enhance action with optimisticID
              enhancedAction = {
                ...action,
                optimistic: optimisticDrive,
              };
            }

            break;
          }

          case DELETE_DRIVE_COMMIT: {
            const optimisticID = action.meta?.optimisticID;
            if (optimisticID) {
              await db.transaction("rw", table, async () => {
                // Remove optimistic version
                await table.delete(optimisticID);
              });
            }
            break;
          }

          case DELETE_DRIVE_ROLLBACK: {
            if (!action.payload.response) break;
            try {
              const err = await action.payload.response.json();
              const optimisticID = action.meta?.optimisticID;
              if (optimisticID) {
                const error_message = `Failed to delete drive - a sync conflict occurred between your offline local copy & the official cloud record. You may see sync conflicts in other related data. Error message for your request: ${err.err.message}`;
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
        console.error(`Error in drives middleware for ${action.type}:`, error);
        // Continue with the original action if there's an error
        return next(action);
      }
    };
};

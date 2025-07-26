// src/redux-offline/jobRuns/jobRuns.optimistic.ts

import { AnyAction, Dispatch, Middleware, MiddlewareAPI } from "redux";
import { getDexieDb, markSyncConflict } from "../../api/dexie-database";
import {
  LIST_JOB_RUNS,
  LIST_JOB_RUNS_COMMIT,
  LIST_JOB_RUNS_ROLLBACK,
  CREATE_JOB_RUN,
  CREATE_JOB_RUN_COMMIT,
  CREATE_JOB_RUN_ROLLBACK,
  GET_JOB_RUN,
  GET_JOB_RUN_COMMIT,
  GET_JOB_RUN_ROLLBACK,
  UPDATE_JOB_RUN,
  UPDATE_JOB_RUN_COMMIT,
  UPDATE_JOB_RUN_ROLLBACK,
  DELETE_JOB_RUN,
  DELETE_JOB_RUN_COMMIT,
  DELETE_JOB_RUN_ROLLBACK,
  CHECK_JOB_RUNS_TABLE_PERMISSIONS,
  CHECK_JOB_RUNS_TABLE_PERMISSIONS_COMMIT,
  CHECK_JOB_RUNS_TABLE_PERMISSIONS_ROLLBACK,
} from "./job-runs.actions";
import { AuthProfile, IndexDB_Organization } from "../../framework/identity";
import { JobRunFEO, JOB_RUNS_DEXIE_TABLE } from "./job-runs.reducer";
import { SystemPermissionType } from "@officexapp/types";
import { SYSTEM_PERMISSIONS_DEXIE_TABLE } from "../permissions/permissions.reducer"; // Assuming this path is correct

/**
 * Middleware for handling optimistic updates for the job runs table
 */
export const jobRunsOptimisticDexieMiddleware = (currentIdentitySet: {
  currentOrg: IndexDB_Organization;
  currentProfile: AuthProfile;
}): Middleware => {
  // Return the actual middleware function with access to the provided values
  // @ts-ignore
  return (store: MiddlewareAPI<Dispatch, any>) =>
    (next: Dispatch<AnyAction>) =>
    async (action: AnyAction) => {
      // Skip actions we don't care about
      if (
        ![
          GET_JOB_RUN,
          GET_JOB_RUN_COMMIT,
          GET_JOB_RUN_ROLLBACK,
          LIST_JOB_RUNS,
          LIST_JOB_RUNS_COMMIT,
          LIST_JOB_RUNS_ROLLBACK,
          CREATE_JOB_RUN,
          CREATE_JOB_RUN_COMMIT,
          CREATE_JOB_RUN_ROLLBACK,
          UPDATE_JOB_RUN,
          UPDATE_JOB_RUN_COMMIT,
          UPDATE_JOB_RUN_ROLLBACK,
          DELETE_JOB_RUN,
          DELETE_JOB_RUN_COMMIT,
          DELETE_JOB_RUN_ROLLBACK,
          CHECK_JOB_RUNS_TABLE_PERMISSIONS,
          CHECK_JOB_RUNS_TABLE_PERMISSIONS_COMMIT,
          CHECK_JOB_RUNS_TABLE_PERMISSIONS_ROLLBACK,
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
      const db = getDexieDb(userID, orgID);
      const table = db.table<JobRunFEO, string>(JOB_RUNS_DEXIE_TABLE);
      let enhancedAction = action;

      try {
        // Process action based on type
        switch (action.type) {
          // ------------------------------ GET JOB RUN --------------------------------- //
          case GET_JOB_RUN: {
            // Get cached data from IndexedDB
            const optimisticID = action.meta.optimisticID;
            const cachedJobRun = await table.get(optimisticID);
            if (cachedJobRun) {
              enhancedAction = {
                ...action,
                optimistic: {
                  ...cachedJobRun,
                  _isOptimistic: true,
                  _optimisticID: optimisticID,
                  _syncSuccess: false,
                  _syncConflict: false,
                  _syncWarning: `Awaiting Sync. This job run was fetched offline and will auto-sync with cloud when you are online again. If there are errors, it may need to be refetched. Anything else depending on it may also be affected.`,
                },
              };
            }
            break;
          }

          case GET_JOB_RUN_COMMIT: {
            const realJobRun = action.payload?.ok?.data;
            if (realJobRun) {
              await table.put({
                ...realJobRun,
                _optimisticID: null,
                _isOptimistic: false,
                _syncSuccess: true,
                _syncConflict: false,
                _syncWarning: "",
              });
            }
            break;
          }

          case GET_JOB_RUN_ROLLBACK: {
            if (!action.payload.response) break;
            try {
              const err = await action.payload.response.json();
              const optimisticID = action.meta?.optimisticID;
              if (optimisticID) {
                const error_message = `Failed to get job run - a sync conflict occurred between your offline local copy & the official cloud record. You may see sync conflicts in other related data. Error message for your request: ${err.err.message}`;
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

          // ------------------------------ LIST JOB RUNS --------------------------------- //

          case LIST_JOB_RUNS: {
            // Get cached data from IndexedDB
            const cachedJobRuns = await table.toArray();

            // Enhance action with cached data if available
            if (cachedJobRuns && cachedJobRuns.length > 0) {
              enhancedAction = {
                ...action,
                optimistic: cachedJobRuns.map((jr) => ({
                  ...jr,
                  _isOptimistic: true,
                  _optimisticID: jr.id,
                })),
              };
            }
            break;
          }

          case LIST_JOB_RUNS_COMMIT: {
            // Extract job runs from the response
            const jobRuns = action.payload?.ok?.data?.items || [];

            // Update IndexedDB with fresh data
            await db.transaction("rw", table, async () => {
              // Clear existing data and add fresh data
              await table.clear(); // This might be too aggressive depending on your caching strategy
              for (const jobRun of jobRuns) {
                await table.put({
                  ...jobRun,
                  _optimisticID: jobRun.id,
                  _isOptimistic: false,
                  _syncConflict: false,
                  _syncWarning: "",
                  _syncSuccess: true,
                });
              }
            });
            break;
          }

          case LIST_JOB_RUNS_ROLLBACK: {
            if (!action.payload.response) break;
            try {
              const err = await action.payload.response.json();
              const error_message = `Failed to fetch job runs - ${err.err.message}`;
              enhancedAction = {
                ...action,
                error_message,
              };
            } catch (e) {
              console.log(e);
            }
            break;
          }

          // ------------------------------ CREATE JOB RUN --------------------------------- //

          case CREATE_JOB_RUN: {
            // Only handle actions with job run data
            if (action.meta?.offline?.effect?.data) {
              const jobRunData = action.meta.offline.effect.data;
              const optimisticID = action.meta.optimisticID;

              // Create optimistic job run object
              const optimisticJobRun: JobRunFEO = {
                id: optimisticID,
                ...jobRunData,
                created_at: Date.now(),
                updated_at: Date.now(),
                last_updated_at: Date.now(),
                // Default permissions for a newly created item, typically editable by creator
                permission_previews: [
                  SystemPermissionType.CREATE,
                  SystemPermissionType.EDIT,
                  SystemPermissionType.DELETE,
                  SystemPermissionType.VIEW,
                ],
                _optimisticID: optimisticID,
                _syncWarning: `Awaiting Sync. This job run was created offline and will auto-sync with cloud when you are online again. If there are errors, it may need to be recreated. Anything else depending on it may also be affected.`,
                _syncConflict: false,
                _syncSuccess: false,
                _isOptimistic: true,
              };

              // Save to IndexedDB
              await table.put(optimisticJobRun);

              // Enhance action with optimisticID
              enhancedAction = {
                ...action,
                optimistic: optimisticJobRun,
              };
            }
            break;
          }

          case CREATE_JOB_RUN_COMMIT: {
            const optimisticID = action.meta?.optimisticID;
            const realJobRun = action.payload?.ok?.data;
            if (optimisticID && realJobRun) {
              await db.transaction("rw", table, async () => {
                // Remove optimistic version
                await table.delete(optimisticID);
                // Add real version
                await table.put({
                  ...realJobRun,
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

          case CREATE_JOB_RUN_ROLLBACK: {
            if (!action.payload.response) break;
            try {
              const err = await action.payload.response.json();
              const optimisticID = action.meta?.optimisticID;
              if (optimisticID) {
                const error_message = `Failed to create job run - a sync conflict occurred between your offline local copy & the official cloud record. You may see sync conflicts in other related data. Error message for your request: ${err.err.message}`;
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

          // ------------------------------ UPDATE JOB RUN --------------------------------- //

          case UPDATE_JOB_RUN: {
            // Only handle actions with job run data
            if (action.meta?.offline?.effect?.data) {
              const jobRunData = action.meta.offline.effect.data;
              const optimisticID = action.meta.optimisticID;

              const cachedJobRun = await table.get(optimisticID);

              // Create optimistic job run object
              const optimisticJobRun: JobRunFEO = {
                id: jobRunData.id,
                ...cachedJobRun, // Keep existing cached data
                ...jobRunData, // Apply new data
                updated_at: Date.now(),
                _isOptimistic: true,
                _optimisticID: optimisticID,
                _syncWarning: `Awaiting Sync. This job run was edited offline and will auto-sync with cloud when you are online again. If there are errors, it may need to be reverted. Anything else depending on it may also be affected.`,
                _syncConflict: false,
                _syncSuccess: false,
              };

              // Save to IndexedDB
              await table.put(optimisticJobRun);

              // Enhance action with optimisticID
              enhancedAction = {
                ...action,
                optimistic: optimisticJobRun,
              };
            }
            break;
          }

          case UPDATE_JOB_RUN_COMMIT: {
            const optimisticID = action.meta?.optimisticID;
            const realJobRun = action.payload?.ok?.data;
            if (optimisticID && realJobRun) {
              await db.transaction("rw", table, async () => {
                // Remove optimistic version
                await table.delete(optimisticID);
                // Add real version
                await table.put({
                  ...realJobRun,
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

          case UPDATE_JOB_RUN_ROLLBACK: {
            if (!action.payload.response) break;
            try {
              const err = await action.payload.response.json();
              const optimisticID = action.meta?.optimisticID;
              if (optimisticID) {
                const error_message = `Failed to update job run - a sync conflict occurred between your offline local copy & the official cloud record. You may see sync conflicts in other related data. Error message for your request: ${err.err.message}`;
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

          // ------------------------------ DELETE JOB RUN --------------------------------- //

          case DELETE_JOB_RUN: {
            const optimisticID = action.meta.optimisticID;

            const cachedJobRun = await table.get(optimisticID);

            if (cachedJobRun) {
              const optimisticJobRun: JobRunFEO = {
                ...cachedJobRun,
                id: optimisticID,
                _markedForDeletion: true, // Mark for deletion
                _syncWarning: `Awaiting Sync. This job run was deleted offline and will auto-sync with cloud when you are online again. If there are errors, it may need to be restored. Anything else depending on it may also be affected.`,
                _syncConflict: false,
                _syncSuccess: false,
                _isOptimistic: true,
                _optimisticID: optimisticID,
              };

              // mark for deletion in indexdb
              await table.put(optimisticJobRun);

              // Enhance action with optimisticID
              enhancedAction = {
                ...action,
                optimistic: optimisticJobRun,
              };
            }
            break;
          }

          case DELETE_JOB_RUN_COMMIT: {
            const optimisticID = action.meta?.optimisticID;
            if (optimisticID) {
              await db.transaction("rw", table, async () => {
                // Remove optimistic version
                await table.delete(optimisticID);
              });
            }
            break;
          }

          case DELETE_JOB_RUN_ROLLBACK: {
            if (!action.payload.response) break;
            try {
              const err = await action.payload.response.json();
              const optimisticID = action.meta?.optimisticID;
              if (optimisticID) {
                const error_message = `Failed to delete job run - a sync conflict occurred between your offline local copy & the official cloud record. You may see sync conflicts in other related data. Error message for your request: ${err.err.message}`;
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

          case CHECK_JOB_RUNS_TABLE_PERMISSIONS: {
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

          case CHECK_JOB_RUNS_TABLE_PERMISSIONS_COMMIT: {
            const optimisticID = action.meta?.optimisticID;
            const permissions = action.payload?.ok?.data?.permissions;

            if (permissions) {
              // Save to system permissions table
              const systemPermissionsTable = db.table(
                SYSTEM_PERMISSIONS_DEXIE_TABLE
              );
              await systemPermissionsTable.put({
                id: optimisticID,
                resource_id: "TABLE_JOB_RUNS",
                granted_to: optimisticID.replace(
                  "job_runs_table_permissions_",
                  ""
                ),
                granted_by: optimisticID.replace(
                  "job_runs_table_permissions_",
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
                resource_name: "Job Runs Table",
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

          case CHECK_JOB_RUNS_TABLE_PERMISSIONS_ROLLBACK: {
            if (!action.payload.response) break;
            try {
              const err = await action.payload.response.json();
              const optimisticID = action.meta?.optimisticID;
              if (optimisticID) {
                const error_message = `Failed to check job runs table permissions - a sync conflict occurred between your offline local copy & the official cloud record. You may see sync conflicts in other related data. Error message for your request: ${err.err.message}`;
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
        console.error(
          `Error in job runs middleware for ${action.type}:`,
          error
        );
        // Continue with the original action if there's an error
        return next(action);
      }
    };
};

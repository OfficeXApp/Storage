// src/redux-offline/groups/groups.optimistic.ts

import { AnyAction, Dispatch, Middleware, MiddlewareAPI } from "redux";
import { getDexieDb, markSyncConflict } from "../../api/dexie-database";
import {
  LIST_GROUPS,
  LIST_GROUPS_COMMIT,
  LIST_GROUPS_ROLLBACK,
  CREATE_GROUP,
  CREATE_GROUP_COMMIT,
  CREATE_GROUP_ROLLBACK,
  GET_GROUP,
  GET_GROUP_COMMIT,
  GET_GROUP_ROLLBACK,
  UPDATE_GROUP,
  UPDATE_GROUP_COMMIT,
  UPDATE_GROUP_ROLLBACK,
  DELETE_GROUP,
  DELETE_GROUP_COMMIT,
  DELETE_GROUP_ROLLBACK,
} from "./groups.actions";
import {
  AuthProfile,
  IndexDB_ApiKey,
  IndexDB_Organization,
  IndexDB_Profile,
} from "../../framework/identity";
import {
  GroupFEO,
  GROUPS_DEXIE_TABLE,
  GROUPS_REDUX_KEY,
} from "./groups.reducer";
import _ from "lodash";

/**
 * Middleware for handling optimistic updates for the groups table
 */
export const groupsOptimisticDexieMiddleware = (currentIdentitySet: {
  currentOrg: IndexDB_Organization;
  currentProfile: AuthProfile;
  currentAPIKey: IndexDB_ApiKey | null;
}): Middleware => {
  // Return the actual middleware function with access to the provided values
  // @ts-ignore
  return (store: MiddlewareAPI<Dispatch, any>) =>
    (next: Dispatch<AnyAction>) =>
    async (action: AnyAction) => {
      // Log action for debugging

      // Skip actions we don't care about
      if (
        ![
          GET_GROUP,
          GET_GROUP_COMMIT,
          GET_GROUP_ROLLBACK,
          LIST_GROUPS,
          LIST_GROUPS_COMMIT,
          LIST_GROUPS_ROLLBACK,
          CREATE_GROUP,
          CREATE_GROUP_COMMIT,
          CREATE_GROUP_ROLLBACK,
          UPDATE_GROUP,
          UPDATE_GROUP_COMMIT,
          UPDATE_GROUP_ROLLBACK,
          DELETE_GROUP,
          DELETE_GROUP_COMMIT,
          DELETE_GROUP_ROLLBACK,
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
      const table = db.table<GroupFEO, string>(GROUPS_DEXIE_TABLE);
      let enhancedAction = action;

      try {
        // Process action based on type
        switch (action.type) {
          // ------------------------------ GET GROUP --------------------------------- //

          case GET_GROUP: {
            // Get cached data from IndexedDB
            const optimisticID = action.meta.optimisticID;
            const cachedGroup = await table.get(optimisticID);

            if (cachedGroup) {
              enhancedAction = {
                ...action,
                optimistic: {
                  ...cachedGroup,
                  _isOptimistic: true,
                  _optimisticID: optimisticID,
                  _syncSuccess: false,
                  _syncConflict: false,
                  _syncWarning: `Awaiting Sync. This group was fetched offline and will auto-sync with cloud when you are online again. If there are errors, it may need to be refetched. Anything else depending on it may also be affected.`,
                },
              };
            }
            break;
          }

          case GET_GROUP_COMMIT: {
            const realGroup = action.payload?.ok?.data;

            if (realGroup) {
              await table.put({
                ...realGroup,
                _optimisticID: null,
                _isOptimistic: false,
                _syncSuccess: true,
                _syncConflict: false,
                _syncWarning: "",
              });
            }
            break;
          }

          case GET_GROUP_ROLLBACK: {
            if (!action.payload.response) break;
            try {
              const err = await action.payload.response.json();
              const optimisticID = action.meta?.optimisticID;

              if (optimisticID) {
                const error_message = `Failed to get group - a sync conflict occurred between your offline local copy & the official cloud record. You may see sync conflicts in other related data. Error message for your request: ${err.err.message}`;
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

          // ------------------------------ LIST GROUPS --------------------------------- //

          case LIST_GROUPS: {
            // Get cached data from IndexedDB
            const cachedGroups = await table.toArray();
            console.log(`cachedGroups`, cachedGroups);
            // Enhance action with cached data if available
            if (cachedGroups && cachedGroups.length > 0) {
              enhancedAction = {
                ...action,
                optimistic: cachedGroups.map((t) => ({
                  ...t,
                  _isOptimistic: true,
                  _optimisticID: t.id,
                })),
              };
            }
            break;
          }

          case LIST_GROUPS_COMMIT: {
            // Extract groups from the response
            const groups = action.payload?.ok?.data?.items || [];

            // Update IndexedDB with fresh data
            await db.transaction("rw", table, async () => {
              // Update or add each group
              for (const group of groups) {
                await table.put({
                  ...group,
                  _optimisticID: group.id,
                  _isOptimistic: false,
                  _syncConflict: false,
                  _syncWarning: "",
                  _syncSuccess: true,
                });
              }
            });
            break;
          }

          case LIST_GROUPS_ROLLBACK: {
            if (!action.payload.response) break;
            try {
              const err = await action.payload.response.json();
              const error_message = `Failed to fetch groups - ${err.err.message}`;

              enhancedAction = {
                ...action,
                error_message,
              };
            } catch (e) {
              console.log(e);
            }
            break;
          }

          // ------------------------------ CREATE GROUP --------------------------------- //

          case CREATE_GROUP: {
            // Only handle actions with group data
            if (action.meta?.offline?.effect?.data) {
              const groupData = action.meta.offline.effect.data;
              const optimisticID = action.meta.optimisticID;

              // Create optimistic group object
              const optimisticGroup: GroupFEO = {
                id: optimisticID,
                ...groupData,
                labels: [],
                member_previews: [],
                permission_previews: [],
                created_at: Date.now(),
                last_modified_at: Date.now(),
                _optimisticID: optimisticID,
                _syncWarning: `Awaiting Sync. This group was created offline and will auto-sync with cloud when you are online again. If there are errors, it may need to be recreated. Anything else depending on it may also be affected.`,
                _syncConflict: false,
                _syncSuccess: false,
                _isOptimistic: true,
              };

              // Save to IndexedDB
              await table.put(optimisticGroup);

              // Enhance action with optimisticID
              enhancedAction = {
                ...action,
                optimistic: optimisticGroup,
              };
            }
            break;
          }

          case CREATE_GROUP_COMMIT: {
            const optimisticID = action.meta?.optimisticID;
            const realGroup = action.payload?.ok?.data;

            if (optimisticID && realGroup) {
              await db.transaction("rw", table, async () => {
                // Remove optimistic version
                await table.delete(optimisticID);

                // Add real version
                await table.put({
                  ...realGroup,
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

          case CREATE_GROUP_ROLLBACK: {
            if (!action.payload.response) break;
            try {
              const err = await action.payload.response.json();
              const optimisticID = action.meta?.optimisticID;

              if (optimisticID) {
                const error_message = `Failed to create group - a sync conflict occurred between your offline local copy & the official cloud record. You may see sync conflicts in other related data. Error message for your request: ${err.err.message}`;
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

          // ------------------------------ UPDATE GROUP --------------------------------- //

          case UPDATE_GROUP: {
            // Only handle actions with group data
            if (action.meta?.offline?.effect?.data) {
              const groupData = action.meta.offline.effect.data;
              const optimisticID = action.meta.optimisticID;

              const cachedGroup = await table.get(optimisticID);

              // Create optimistic group object
              const optimisticGroup: GroupFEO = {
                id: groupData.id,
                ...cachedGroup,
                ...groupData,
                last_modified_at: Date.now(),
                _isOptimistic: true,
                _optimisticID: optimisticID,
                _syncWarning: `Awaiting Sync. This group was edited offline and will auto-sync with cloud when you are online again. If there are errors, it may need to be reverted. Anything else depending on it may also be affected.`,
                _syncConflict: false,
                _syncSuccess: false,
              };

              // Save to IndexedDB
              await table.put(optimisticGroup);

              // Enhance action with optimisticID
              enhancedAction = {
                ...action,
                optimistic: optimisticGroup,
              };
            }
            break;
          }

          case UPDATE_GROUP_COMMIT: {
            const optimisticID = action.meta?.optimisticID;
            const realGroup = action.payload?.ok?.data;

            if (optimisticID && realGroup) {
              await db.transaction("rw", table, async () => {
                // Remove optimistic version
                await table.delete(optimisticID);

                // Add real version
                await table.put({
                  ...realGroup,
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

          case UPDATE_GROUP_ROLLBACK: {
            if (!action.payload.response) break;
            try {
              const err = await action.payload.response.json();
              const optimisticID = action.meta?.optimisticID;

              if (optimisticID) {
                const error_message = `Failed to update group - a sync conflict occurred between your offline local copy & the official cloud record. You may see sync conflicts in other related data. Error message for your request: ${err.err.message}`;
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

          // ------------------------------ DELETE GROUP --------------------------------- //

          case DELETE_GROUP: {
            const optimisticID = action.meta.optimisticID;
            const cachedGroup = await table.get(optimisticID);

            if (cachedGroup) {
              const optimisticGroup: GroupFEO = {
                ...cachedGroup,
                id: optimisticID,
                _markedForDeletion: true,
                _syncWarning: `Awaiting Sync. This group was deleted offline and will auto-sync with cloud when you are online again. If there are errors, it may need to be restored. Anything else depending on it may also be affected.`,
                _syncConflict: false,
                _syncSuccess: false,
                _isOptimistic: true,
                _optimisticID: optimisticID,
              };

              // Mark for deletion in indexdb
              await table.put(optimisticGroup);

              // Enhance action with optimisticID
              enhancedAction = {
                ...action,
                optimistic: optimisticGroup,
              };
            }
            break;
          }

          case DELETE_GROUP_COMMIT: {
            const optimisticID = action.meta?.optimisticID;

            if (optimisticID) {
              await db.transaction("rw", table, async () => {
                // Remove optimistic version
                await table.delete(optimisticID);
              });
            }
            break;
          }

          case DELETE_GROUP_ROLLBACK: {
            if (!action.payload.response) break;
            try {
              const err = await action.payload.response.json();
              const optimisticID = action.meta?.optimisticID;

              if (optimisticID) {
                const error_message = `Failed to delete group - a sync conflict occurred between your offline local copy & the official cloud record. You may see sync conflicts in other related data. Error message for your request: ${err.err.message}`;
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
        console.error(`Error in groups middleware for ${action.type}:`, error);
        // Continue with the original action if there's an error
        return next(action);
      }
    };
};

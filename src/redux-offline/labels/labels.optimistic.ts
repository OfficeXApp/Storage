// src/redux-offline/labels/labels.optimistic.ts

import { AnyAction, Dispatch, Middleware, MiddlewareAPI } from "redux";
import { getDexieDb, markSyncConflict } from "../../api/dexie-database";
import {
  LIST_LABELS,
  LIST_LABELS_COMMIT,
  LIST_LABELS_ROLLBACK,
  CREATE_LABEL,
  CREATE_LABEL_COMMIT,
  CREATE_LABEL_ROLLBACK,
  GET_LABEL,
  GET_LABEL_COMMIT,
  GET_LABEL_ROLLBACK,
  UPDATE_LABEL,
  UPDATE_LABEL_COMMIT,
  UPDATE_LABEL_ROLLBACK,
  DELETE_LABEL,
  DELETE_LABEL_COMMIT,
  DELETE_LABEL_ROLLBACK,
} from "./labels.actions";
import {
  AuthProfile,
  IndexDB_ApiKey,
  IndexDB_Organization,
  IndexDB_Profile,
} from "../../framework/identity";
import {
  LabelFEO,
  LABELS_DEXIE_TABLE,
  LABELS_REDUX_KEY,
} from "./labels.reducer";
import _ from "lodash";

/**
 * Middleware for handling optimistic updates for the labels table
 */
export const labelsOptimisticDexieMiddleware = (currentIdentitySet: {
  currentOrg: IndexDB_Organization;
  currentProfile: AuthProfile;
  currentAPIKey: IndexDB_ApiKey | null;
}): Middleware => {
  // Return the actual middleware function with access to the provided values
  // @ts-ignore
  return (store: MiddlewareAPI<Dispatch, any>) =>
    (next: Dispatch<AnyAction>) =>
    async (action: AnyAction) => {
      // Log action
      console.log(
        `Inside labels optimistic middleware for ${action.type}`,
        action
      );

      // Skip actions we don't care about
      if (
        ![
          GET_LABEL,
          GET_LABEL_COMMIT,
          GET_LABEL_ROLLBACK,
          LIST_LABELS,
          LIST_LABELS_COMMIT,
          LIST_LABELS_ROLLBACK,
          CREATE_LABEL,
          CREATE_LABEL_COMMIT,
          CREATE_LABEL_ROLLBACK,
          UPDATE_LABEL,
          UPDATE_LABEL_COMMIT,
          UPDATE_LABEL_ROLLBACK,
          DELETE_LABEL,
          DELETE_LABEL_COMMIT,
          DELETE_LABEL_ROLLBACK,
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
      const table = db.table<LabelFEO, string>(LABELS_DEXIE_TABLE);
      let enhancedAction = action;

      try {
        // Process action based on type
        switch (action.type) {
          // ------------------------------ GET LABEL --------------------------------- //

          case GET_LABEL: {
            // Get cached data from IndexedDB
            const optimisticID = action.meta.optimisticID;
            const cachedLabel = await table.get(optimisticID);
            if (cachedLabel) {
              enhancedAction = {
                ...action,
                optimistic: {
                  ...cachedLabel,
                  _isOptimistic: true,
                  _optimisticID: optimisticID,
                  _syncSuccess: false,
                  _syncConflict: false,
                  _syncWarning: `Awaiting Sync. This label was fetched offline and will auto-sync with cloud when you are online again. If there are errors, it may need to be refetched. Anything else depending on it may also be affected.`,
                },
              };
            }
            break;
          }

          case GET_LABEL_COMMIT: {
            const realLabel = action.payload?.ok?.data;
            if (realLabel) {
              await table.put({
                ...realLabel,
                _optimisticID: null,
                _isOptimistic: false,
                _syncSuccess: true,
                _syncConflict: false,
                _syncWarning: "",
              });
            }
            break;
          }

          case GET_LABEL_ROLLBACK: {
            try {
              const err = await action.payload.response.json();
              const optimisticID = action.meta?.optimisticID;
              if (optimisticID) {
                const error_message = `Failed to get label - a sync conflict occurred between your offline local copy & the official cloud record. You may see sync conflicts in other related data. Error message for your request: ${err.err.message}`;
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

          // ------------------------------ LIST LABELS --------------------------------- //

          case LIST_LABELS: {
            // Get cached data from IndexedDB
            const cachedLabels = await table.toArray();

            // Enhance action with cached data if available
            if (cachedLabels && cachedLabels.length > 0) {
              enhancedAction = {
                ...action,
                optimistic: cachedLabels.map((t) => ({
                  ...t,
                  _isOptimistic: true,
                  _optimisticID: t.id,
                })),
              };
            }
            break;
          }

          case LIST_LABELS_COMMIT: {
            // Extract labels from the response
            const labels = action.payload?.ok?.data?.items || [];

            // Update IndexedDB with fresh data
            await db.transaction("rw", table, async () => {
              // Update or add each label
              for (const label of labels) {
                await table.put({
                  ...label,
                  _optimisticID: label.id,
                  _isOptimistic: false,
                  _syncConflict: false,
                  _syncWarning: "",
                  _syncSuccess: true,
                });
              }
            });
            break;
          }

          case LIST_LABELS_ROLLBACK: {
            try {
              const err = await action.payload.response.json();
              const error_message = `Failed to fetch labels - ${err.err.message}`;
              enhancedAction = {
                ...action,
                error_message,
              };
            } catch (e) {
              console.log(e);
            }
            break;
          }

          // ------------------------------ CREATE LABEL --------------------------------- //

          case CREATE_LABEL: {
            // Only handle actions with label data
            if (action.meta?.offline?.effect?.data) {
              const labelData = action.meta.offline.effect.data;
              const optimisticID = action.meta.optimisticID;

              // Create optimistic label object with defaults
              const optimisticLabel: LabelFEO = {
                id: optimisticID,
                ...labelData,
                value: labelData.value,
                color: labelData.color || "#808080", // Default color if not provided
                created_by: userID,
                created_at: Date.now(),
                last_updated_at: Date.now(),
                resources: [],
                labels: [],
                permission_previews: [],
                _optimisticID: optimisticID,
                _syncWarning: `Awaiting Sync. This label was created offline and will auto-sync with cloud when you are online again. If there are errors, it may need to be recreated. Anything else depending on it may also be affected.`,
                _syncConflict: false,
                _syncSuccess: false,
                _isOptimistic: true,
              };

              // Save to IndexedDB
              await table.put(optimisticLabel);

              // Enhance action with optimisticID
              enhancedAction = {
                ...action,
                optimistic: optimisticLabel,
              };
            }
            break;
          }

          case CREATE_LABEL_COMMIT: {
            const optimisticID = action.meta?.optimisticID;
            const realLabel = action.payload?.ok?.data;
            if (optimisticID && realLabel) {
              await db.transaction("rw", table, async () => {
                // Remove optimistic version
                await table.delete(optimisticID);
                // Add real version
                await table.put({
                  ...realLabel,
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

          case CREATE_LABEL_ROLLBACK: {
            try {
              const err = await action.payload.response.json();
              const optimisticID = action.meta?.optimisticID;
              if (optimisticID) {
                const error_message = `Failed to create label - a sync conflict occurred between your offline local copy & the official cloud record. You may see sync conflicts in other related data. Error message for your request: ${err.err.message}`;
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

          // ------------------------------ UPDATE LABEL --------------------------------- //

          case UPDATE_LABEL: {
            // Only handle actions with label data
            if (action.meta?.offline?.effect?.data) {
              const labelData = action.meta.offline.effect.data;
              const optimisticID = action.meta.optimisticID;

              const cachedLabel = await table.get(optimisticID);

              // Create optimistic label object by merging with cached data
              const optimisticLabel: LabelFEO = {
                id: labelData.id,
                ...cachedLabel,
                ...labelData,
                last_updated_at: Date.now(),
                _isOptimistic: true,
                _optimisticID: optimisticID,
                _syncWarning: `Awaiting Sync. This label was edited offline and will auto-sync with cloud when you are online again. If there are errors, it may need to be reverted. Anything else depending on it may also be affected.`,
                _syncConflict: false,
                _syncSuccess: false,
              };

              // Save to IndexedDB
              await table.put(optimisticLabel);

              // Enhance action with optimisticID
              enhancedAction = {
                ...action,
                optimistic: optimisticLabel,
              };
            }
            break;
          }

          case UPDATE_LABEL_COMMIT: {
            const optimisticID = action.meta?.optimisticID;
            const realLabel = action.payload?.ok?.data;
            if (optimisticID && realLabel) {
              await db.transaction("rw", table, async () => {
                // Remove optimistic version
                await table.delete(optimisticID);
                // Add real version
                await table.put({
                  ...realLabel,
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

          case UPDATE_LABEL_ROLLBACK: {
            try {
              const err = await action.payload.response.json();
              const optimisticID = action.meta?.optimisticID;
              if (optimisticID) {
                const error_message = `Failed to update label - a sync conflict occurred between your offline local copy & the official cloud record. You may see sync conflicts in other related data. Error message for your request: ${err.err.message}`;
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

          // ------------------------------ DELETE LABEL --------------------------------- //

          case DELETE_LABEL: {
            const optimisticID = action.meta.optimisticID;

            const cachedLabel = await table.get(optimisticID);

            if (cachedLabel) {
              const optimisticLabel: LabelFEO = {
                ...cachedLabel,
                id: optimisticID,
                _markedForDeletion: true,
                _syncWarning: `Awaiting Sync. This label was deleted offline and will auto-sync with cloud when you are online again. If there are errors, it may need to be restored. Anything else depending on it may also be affected.`,
                _syncConflict: false,
                _syncSuccess: false,
                _isOptimistic: true,
                _optimisticID: optimisticID,
              };

              // mark for deletion in indexdb
              await table.put(optimisticLabel);

              // Enhance action with optimisticID
              enhancedAction = {
                ...action,
                optimistic: optimisticLabel,
              };
            }

            break;
          }

          case DELETE_LABEL_COMMIT: {
            const optimisticID = action.meta?.optimisticID;
            if (optimisticID) {
              await db.transaction("rw", table, async () => {
                // Remove label completely after successful deletion
                await table.delete(optimisticID);
              });
            }
            break;
          }

          case DELETE_LABEL_ROLLBACK: {
            try {
              const err = await action.payload.response.json();
              const optimisticID = action.meta?.optimisticID;
              if (optimisticID) {
                const error_message = `Failed to delete label - a sync conflict occurred between your offline local copy & the official cloud record. You may see sync conflicts in other related data. Error message for your request: ${err.err.message}`;

                // Update the label to remove deletion mark and add conflict warning
                const cachedLabel = await table.get(optimisticID);
                if (cachedLabel) {
                  await table.put({
                    ...cachedLabel,
                    _markedForDeletion: false,
                    _syncWarning: error_message,
                    _syncSuccess: false,
                    _syncConflict: true,
                    _isOptimistic: false,
                  });
                }

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
        console.error(`Error in labels middleware for ${action.type}:`, error);
        // Continue with the original action if there's an error
        return next(action);
      }
    };
};

// src/redux-offline/tags/tags.optimistic.ts

import { AnyAction, Dispatch, Middleware, MiddlewareAPI } from "redux";
import { getDexieDb, markSyncConflict } from "../../api/dexie-database";
import {
  LIST_TAGS,
  LIST_TAGS_COMMIT,
  LIST_TAGS_ROLLBACK,
  CREATE_TAG,
  CREATE_TAG_COMMIT,
  CREATE_TAG_ROLLBACK,
  GET_TAG,
  GET_TAG_COMMIT,
  GET_TAG_ROLLBACK,
  UPDATE_TAG,
  UPDATE_TAG_COMMIT,
  UPDATE_TAG_ROLLBACK,
  DELETE_TAG,
  DELETE_TAG_COMMIT,
  DELETE_TAG_ROLLBACK,
} from "./tags.actions";
import {
  AuthProfile,
  IndexDB_ApiKey,
  IndexDB_Organization,
  IndexDB_Profile,
} from "../../framework/identity";
import { TagFEO, TAGS_DEXIE_TABLE, TAGS_REDUX_KEY } from "./tags.reducer";
import _ from "lodash";

/**
 * Middleware for handling optimistic updates for the tags table
 */
export const tagsOptimisticDexieMiddleware = (currentIdentitySet: {
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
        `Inside tags optimistic middleware for ${action.type}`,
        action
      );

      // Skip actions we don't care about
      if (
        ![
          GET_TAG,
          GET_TAG_COMMIT,
          GET_TAG_ROLLBACK,
          LIST_TAGS,
          LIST_TAGS_COMMIT,
          LIST_TAGS_ROLLBACK,
          CREATE_TAG,
          CREATE_TAG_COMMIT,
          CREATE_TAG_ROLLBACK,
          UPDATE_TAG,
          UPDATE_TAG_COMMIT,
          UPDATE_TAG_ROLLBACK,
          DELETE_TAG,
          DELETE_TAG_COMMIT,
          DELETE_TAG_ROLLBACK,
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
      const table = db.table<TagFEO, string>(TAGS_DEXIE_TABLE);
      let enhancedAction = action;

      try {
        // Process action based on type
        switch (action.type) {
          // ------------------------------ GET TAG --------------------------------- //

          case GET_TAG: {
            // Get cached data from IndexedDB
            const optimisticID = action.meta.optimisticID;
            const cachedTag = await table.get(optimisticID);
            if (cachedTag) {
              enhancedAction = {
                ...action,
                optimistic: {
                  ...cachedTag,
                  _isOptimistic: true,
                  _optimisticID: optimisticID,
                  _syncSuccess: false,
                  _syncConflict: false,
                  _syncWarning: `Awaiting Sync. This tag was fetched offline and will auto-sync with cloud when you are online again. If there are errors, it may need to be refetched. Anything else depending on it may also be affected.`,
                },
              };
            }
            break;
          }

          case GET_TAG_COMMIT: {
            const realTag = action.payload?.ok?.data;
            if (realTag) {
              await table.put({
                ...realTag,
                _optimisticID: null,
                _isOptimistic: false,
                _syncSuccess: true,
                _syncConflict: false,
                _syncWarning: "",
              });
            }
            break;
          }

          case GET_TAG_ROLLBACK: {
            try {
              const err = await action.payload.response.json();
              const optimisticID = action.meta?.optimisticID;
              if (optimisticID) {
                const error_message = `Failed to get tag - a sync conflict occurred between your offline local copy & the official cloud record. You may see sync conflicts in other related data. Error message for your request: ${err.err.message}`;
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

          // ------------------------------ LIST TAGS --------------------------------- //

          case LIST_TAGS: {
            // Get cached data from IndexedDB
            const cachedTags = await table.toArray();

            // Enhance action with cached data if available
            if (cachedTags && cachedTags.length > 0) {
              enhancedAction = {
                ...action,
                optimistic: cachedTags.map((t) => ({
                  ...t,
                  _isOptimistic: true,
                  _optimisticID: t.id,
                })),
              };
            }
            break;
          }

          case LIST_TAGS_COMMIT: {
            // Extract tags from the response
            const tags = action.payload?.ok?.data?.items || [];

            // Update IndexedDB with fresh data
            await db.transaction("rw", table, async () => {
              // Update or add each tag
              for (const tag of tags) {
                await table.put({
                  ...tag,
                  _optimisticID: tag.id,
                  _isOptimistic: false,
                  _syncConflict: false,
                  _syncWarning: "",
                  _syncSuccess: true,
                });
              }
            });
            break;
          }

          case LIST_TAGS_ROLLBACK: {
            try {
              const err = await action.payload.response.json();
              const error_message = `Failed to fetch tags - ${err.err.message}`;
              enhancedAction = {
                ...action,
                error_message,
              };
            } catch (e) {
              console.log(e);
            }
            break;
          }

          // ------------------------------ CREATE TAG --------------------------------- //

          case CREATE_TAG: {
            // Only handle actions with tag data
            if (action.meta?.offline?.effect?.data) {
              const tagData = action.meta.offline.effect.data;
              const optimisticID = action.meta.optimisticID;

              // Create optimistic tag object with defaults
              const optimisticTag: TagFEO = {
                id: optimisticID,
                ...tagData,
                value: tagData.value,
                color: tagData.color || "#808080", // Default color if not provided
                created_by: userID,
                created_at: Date.now(),
                last_updated_at: Date.now(),
                resources: [],
                tags: [],
                permission_previews: [],
                _optimisticID: optimisticID,
                _syncWarning: `Awaiting Sync. This tag was created offline and will auto-sync with cloud when you are online again. If there are errors, it may need to be recreated. Anything else depending on it may also be affected.`,
                _syncConflict: false,
                _syncSuccess: false,
                _isOptimistic: true,
              };

              // Save to IndexedDB
              await table.put(optimisticTag);

              // Enhance action with optimisticID
              enhancedAction = {
                ...action,
                optimistic: optimisticTag,
              };
            }
            break;
          }

          case CREATE_TAG_COMMIT: {
            const optimisticID = action.meta?.optimisticID;
            const realTag = action.payload?.ok?.data;
            if (optimisticID && realTag) {
              await db.transaction("rw", table, async () => {
                // Remove optimistic version
                await table.delete(optimisticID);
                // Add real version
                await table.put({
                  ...realTag,
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

          case CREATE_TAG_ROLLBACK: {
            try {
              const err = await action.payload.response.json();
              const optimisticID = action.meta?.optimisticID;
              if (optimisticID) {
                const error_message = `Failed to create tag - a sync conflict occurred between your offline local copy & the official cloud record. You may see sync conflicts in other related data. Error message for your request: ${err.err.message}`;
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

          // ------------------------------ UPDATE TAG --------------------------------- //

          case UPDATE_TAG: {
            // Only handle actions with tag data
            if (action.meta?.offline?.effect?.data) {
              const tagData = action.meta.offline.effect.data;
              const optimisticID = action.meta.optimisticID;

              const cachedTag = await table.get(optimisticID);

              // Create optimistic tag object by merging with cached data
              const optimisticTag: TagFEO = {
                id: tagData.id,
                ...cachedTag,
                ...tagData,
                last_updated_at: Date.now(),
                _isOptimistic: true,
                _optimisticID: optimisticID,
                _syncWarning: `Awaiting Sync. This tag was edited offline and will auto-sync with cloud when you are online again. If there are errors, it may need to be reverted. Anything else depending on it may also be affected.`,
                _syncConflict: false,
                _syncSuccess: false,
              };

              // Save to IndexedDB
              await table.put(optimisticTag);

              // Enhance action with optimisticID
              enhancedAction = {
                ...action,
                optimistic: optimisticTag,
              };
            }
            break;
          }

          case UPDATE_TAG_COMMIT: {
            const optimisticID = action.meta?.optimisticID;
            const realTag = action.payload?.ok?.data;
            if (optimisticID && realTag) {
              await db.transaction("rw", table, async () => {
                // Remove optimistic version
                await table.delete(optimisticID);
                // Add real version
                await table.put({
                  ...realTag,
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

          case UPDATE_TAG_ROLLBACK: {
            try {
              const err = await action.payload.response.json();
              const optimisticID = action.meta?.optimisticID;
              if (optimisticID) {
                const error_message = `Failed to update tag - a sync conflict occurred between your offline local copy & the official cloud record. You may see sync conflicts in other related data. Error message for your request: ${err.err.message}`;
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

          // ------------------------------ DELETE TAG --------------------------------- //

          case DELETE_TAG: {
            const optimisticID = action.meta.optimisticID;

            const cachedTag = await table.get(optimisticID);

            if (cachedTag) {
              const optimisticTag: TagFEO = {
                ...cachedTag,
                id: optimisticID,
                _markedForDeletion: true,
                _syncWarning: `Awaiting Sync. This tag was deleted offline and will auto-sync with cloud when you are online again. If there are errors, it may need to be restored. Anything else depending on it may also be affected.`,
                _syncConflict: false,
                _syncSuccess: false,
                _isOptimistic: true,
                _optimisticID: optimisticID,
              };

              // mark for deletion in indexdb
              await table.put(optimisticTag);

              // Enhance action with optimisticID
              enhancedAction = {
                ...action,
                optimistic: optimisticTag,
              };
            }

            break;
          }

          case DELETE_TAG_COMMIT: {
            const optimisticID = action.meta?.optimisticID;
            if (optimisticID) {
              await db.transaction("rw", table, async () => {
                // Remove tag completely after successful deletion
                await table.delete(optimisticID);
              });
            }
            break;
          }

          case DELETE_TAG_ROLLBACK: {
            try {
              const err = await action.payload.response.json();
              const optimisticID = action.meta?.optimisticID;
              if (optimisticID) {
                const error_message = `Failed to delete tag - a sync conflict occurred between your offline local copy & the official cloud record. You may see sync conflicts in other related data. Error message for your request: ${err.err.message}`;

                // Update the tag to remove deletion mark and add conflict warning
                const cachedTag = await table.get(optimisticID);
                if (cachedTag) {
                  await table.put({
                    ...cachedTag,
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
        console.error(`Error in tags middleware for ${action.type}:`, error);
        // Continue with the original action if there's an error
        return next(action);
      }
    };
};

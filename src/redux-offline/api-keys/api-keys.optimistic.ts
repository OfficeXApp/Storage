import { AnyAction, Dispatch, Middleware, MiddlewareAPI } from "redux";
import { getDexieDb, markSyncConflict } from "../../api/dexie-database";
import {
  LIST_APIKEYS,
  LIST_APIKEYS_COMMIT,
  LIST_APIKEYS_ROLLBACK,
  CREATE_APIKEY,
  CREATE_APIKEY_COMMIT,
  CREATE_APIKEY_ROLLBACK,
  GET_APIKEY,
  GET_APIKEY_COMMIT,
  GET_APIKEY_ROLLBACK,
  UPDATE_APIKEY,
  UPDATE_APIKEY_COMMIT,
  UPDATE_APIKEY_ROLLBACK,
  DELETE_APIKEY,
  DELETE_APIKEY_COMMIT,
  DELETE_APIKEY_ROLLBACK,
} from "./api-keys.actions";
import {
  AuthProfile,
  IndexDB_ApiKey,
  IndexDB_Organization,
  IndexDB_Profile,
} from "../../framework/identity";
import {
  ApiKeyFEO,
  APIKEYS_DEXIE_TABLE,
  APIKEYS_REDUX_KEY,
} from "./api-keys.reducer";
import _ from "lodash";

/**
 * Middleware for handling optimistic updates for the apikeys table
 */
export const apiKeysOptimisticDexieMiddleware = (currentIdentitySet: {
  currentOrg: IndexDB_Organization;
  currentProfile: AuthProfile;
  currentAPIKey: IndexDB_ApiKey | null;
}): Middleware => {
  // Return the actual middleware function with access to the provided values
  // @ts-ignore
  return (store: MiddlewareAPI<Dispatch, any>) =>
    (next: Dispatch<AnyAction>) =>
    async (action: AnyAction) => {
      // Skip actions we don't care about
      console.log(
        `Inside apikeys optimistic middleware for ${action.type}`,
        action
      );

      // Skip actions we don't care about
      if (
        ![
          GET_APIKEY,
          GET_APIKEY_COMMIT,
          GET_APIKEY_ROLLBACK,
          LIST_APIKEYS,
          LIST_APIKEYS_COMMIT,
          LIST_APIKEYS_ROLLBACK,
          CREATE_APIKEY,
          CREATE_APIKEY_COMMIT,
          CREATE_APIKEY_ROLLBACK,
          UPDATE_APIKEY,
          UPDATE_APIKEY_COMMIT,
          UPDATE_APIKEY_ROLLBACK,
          DELETE_APIKEY,
          DELETE_APIKEY_COMMIT,
          DELETE_APIKEY_ROLLBACK,
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
      const table = db.table<ApiKeyFEO, string>(APIKEYS_DEXIE_TABLE);
      let enhancedAction = action;

      try {
        // Process action based on type

        // ------------------------------ GET API KEY --------------------------------- //

        switch (action.type) {
          case GET_APIKEY: {
            // Get cached data from IndexedDB
            const optimisticID = action.meta.optimisticID;
            const cachedApiKey = await table.get(optimisticID);
            if (cachedApiKey) {
              enhancedAction = {
                ...action,
                optimistic: {
                  ...cachedApiKey,
                  _isOptimistic: true,
                  _optimisticID: optimisticID,
                  _syncSuccess: false,
                  _syncConflict: false,
                  _syncWarning: `Awaiting Sync. This API key was fetched offline and will auto-sync with cloud when you are online again. If there are errors, it may need to be refetched. Anything else depending on it may also be affected.`,
                },
              };
            }
            break;
          }

          case GET_APIKEY_COMMIT: {
            const realApiKey = action.payload?.ok?.data;
            if (realApiKey) {
              await table.put({
                ...realApiKey,
                _optimisticID: null,
                _isOptimistic: false,
                _syncSuccess: true,
                _syncConflict: false,
                _syncWarning: "",
              });
            }
            break;
          }

          case GET_APIKEY_ROLLBACK: {
            try {
              const err = await action.payload.response.json();
              const optimisticID = action.meta?.optimisticID;
              if (optimisticID) {
                const error_message = `Failed to get API key - a sync conflict occurred between your offline local copy & the official cloud record. You may see sync conflicts in other related data. Error message for your request: ${err.err.message}`;
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

          // ------------------------------ LIST API KEYS --------------------------------- //

          case LIST_APIKEYS: {
            // Get cached data from IndexedDB
            const cachedApiKeys = await table.toArray();

            // Enhance action with cached data if available
            if (cachedApiKeys && cachedApiKeys.length > 0) {
              enhancedAction = {
                ...action,
                optimistic: cachedApiKeys.map((k) => ({
                  ...k,
                  _isOptimistic: true,
                  _optimisticID: k.id,
                })),
              };
            }
            break;
          }

          case LIST_APIKEYS_COMMIT: {
            // Extract apikeys from the response
            const apikeys = action.payload?.ok?.data || [];

            // Update IndexedDB with fresh data
            await db.transaction("rw", table, async () => {
              // Update or add each apikey
              for (const apikey of apikeys) {
                await table.put({
                  ...apikey,
                  _optimisticID: apikey.id,
                  _isOptimistic: false,
                  _syncConflict: false,
                  _syncWarning: "",
                  _syncSuccess: true,
                });
              }
            });
            break;
          }

          case LIST_APIKEYS_ROLLBACK: {
            try {
              const err = await action.payload.response.json();
              const error_message = `Failed to fetch API keys - ${err.err.message}`;
              enhancedAction = {
                ...action,
                error_message,
              };
            } catch (e) {
              console.log(e);
            }
            break;
          }

          // ------------------------------ CREATE API KEY --------------------------------- //

          case CREATE_APIKEY: {
            // Only handle actions with apikey data
            if (action.meta?.offline?.effect?.data) {
              const apiKeyData = action.meta.offline.effect.data;
              const optimisticID = action.meta.optimisticID;

              // Create optimistic apikey object
              const optimisticApiKey: ApiKeyFEO = {
                id: optimisticID,
                user_id: apiKeyData.user_id || userID,
                value: "temp_" + optimisticID, // Temporary placeholder value
                name: apiKeyData.name,
                tags: [],
                permission_previews: [],
                created_at: Date.now(),
                expires_at: apiKeyData.expires_at || -1,
                is_revoked: false,
                external_id: apiKeyData.external_id,
                external_payload: apiKeyData.external_payload,
                _optimisticID: optimisticID,
                _syncWarning: `Awaiting Sync. This API key was created offline and will auto-sync with cloud when you are online again. If there are errors, it may need to be recreated. Anything else depending on it may also be affected.`,
                _syncConflict: false,
                _syncSuccess: false,
                _isOptimistic: true,
              };

              // Save to IndexedDB
              await table.put(optimisticApiKey);

              // Enhance action with optimisticID
              enhancedAction = {
                ...action,
                optimistic: optimisticApiKey,
              };
            }
            break;
          }

          case CREATE_APIKEY_COMMIT: {
            const optimisticID = action.meta?.optimisticID;
            const realApiKey = action.payload?.ok?.data;
            if (optimisticID && realApiKey) {
              await db.transaction("rw", table, async () => {
                // Remove optimistic version
                await table.delete(optimisticID);
                // Add real version
                await table.put({
                  ...realApiKey,
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

          case CREATE_APIKEY_ROLLBACK: {
            try {
              const err = await action.payload.response.json();
              const optimisticID = action.meta?.optimisticID;
              if (optimisticID) {
                const error_message = `Failed to create API key - a sync conflict occurred between your offline local copy & the official cloud record. You may see sync conflicts in other related data. Error message for your request: ${err.err.message}`;
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

          // ------------------------------ UPDATE API KEY --------------------------------- //

          case UPDATE_APIKEY: {
            // Only handle actions with apikey data
            if (action.meta?.offline?.effect?.data) {
              const apiKeyData = action.meta.offline.effect.data;
              const optimisticID = action.meta.optimisticID;

              const cachedApiKey = await table.get(optimisticID);

              // Create optimistic apikey object
              const optimisticApiKey: ApiKeyFEO = {
                id: apiKeyData.id,
                ...cachedApiKey,
                ...apiKeyData,
                updated_at: Date.now(),
                _isOptimistic: true,
                _optimisticID: optimisticID,
                _syncWarning: `Awaiting Sync. This API key was edited offline and will auto-sync with cloud when you are online again. If there are errors, it may need to be reverted. Anything else depending on it may also be affected.`,
                _syncConflict: false,
                _syncSuccess: false,
              };

              // Save to IndexedDB
              await table.put(optimisticApiKey);

              // Enhance action with optimisticID
              enhancedAction = {
                ...action,
                optimistic: optimisticApiKey,
              };
            }
            break;
          }

          case UPDATE_APIKEY_COMMIT: {
            const optimisticID = action.meta?.optimisticID;
            const realApiKey = action.payload?.ok?.data;
            if (optimisticID && realApiKey) {
              await db.transaction("rw", table, async () => {
                // Remove optimistic version
                await table.delete(optimisticID);
                // Add real version
                await table.put({
                  ...realApiKey,
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

          case UPDATE_APIKEY_ROLLBACK: {
            try {
              const err = await action.payload.response.json();
              const optimisticID = action.meta?.optimisticID;
              if (optimisticID) {
                const error_message = `Failed to update API key - a sync conflict occurred between your offline local copy & the official cloud record. You may see sync conflicts in other related data. Error message for your request: ${err.err.message}`;
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

          // ------------------------------ DELETE API KEY --------------------------------- //

          case DELETE_APIKEY: {
            const optimisticID = action.meta.optimisticID;

            const cachedApiKey = await table.get(optimisticID);

            if (cachedApiKey) {
              const optimisticApiKey: ApiKeyFEO = {
                ...cachedApiKey,
                id: optimisticID,
                _markedForDeletion: true,
                _syncWarning: `Awaiting Sync. This API key was deleted offline and will auto-sync with cloud when you are online again. If there are errors, it may need to be restored. Anything else depending on it may also be affected.`,
                _syncConflict: false,
                _syncSuccess: false,
                _isOptimistic: true,
                _optimisticID: optimisticID,
              };

              // mark for deletion in indexdb
              // Save to IndexedDB
              await table.put(optimisticApiKey);

              // Enhance action with optimisticID
              enhancedAction = {
                ...action,
                optimistic: optimisticApiKey,
              };
            }

            break;
          }

          case DELETE_APIKEY_COMMIT: {
            const optimisticID = action.meta?.optimisticID;
            if (optimisticID) {
              await db.transaction("rw", table, async () => {
                // Remove optimistic version
                await table.delete(optimisticID);
              });
            }
            break;
          }

          case DELETE_APIKEY_ROLLBACK: {
            try {
              const err = await action.payload.response.json();
              const optimisticID = action.meta?.optimisticID;
              if (optimisticID) {
                const error_message = `Failed to delete API key - a sync conflict occurred between your offline local copy & the official cloud record. You may see sync conflicts in other related data. Error message for your request: ${err.err.message}`;
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
        console.error(`Error in apikeys middleware for ${action.type}:`, error);
        // Continue with the original action if there's an error
        return next(action);
      }
    };
};

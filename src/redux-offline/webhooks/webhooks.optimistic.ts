import { AnyAction, Dispatch, Middleware, MiddlewareAPI } from "redux";
import { getDexieDb, markSyncConflict } from "../../api/dexie-database";
import {
  LIST_WEBHOOKS,
  LIST_WEBHOOKS_COMMIT,
  LIST_WEBHOOKS_ROLLBACK,
  CREATE_WEBHOOK,
  CREATE_WEBHOOK_COMMIT,
  CREATE_WEBHOOK_ROLLBACK,
  GET_WEBHOOK,
  GET_WEBHOOK_COMMIT,
  GET_WEBHOOK_ROLLBACK,
  UPDATE_WEBHOOK,
  UPDATE_WEBHOOK_COMMIT,
  UPDATE_WEBHOOK_ROLLBACK,
  DELETE_WEBHOOK,
  DELETE_WEBHOOK_COMMIT,
  DELETE_WEBHOOK_ROLLBACK,
} from "./webhooks.actions";
import {
  AuthProfile,
  IndexDB_ApiKey,
  IndexDB_Organization,
  IndexDB_Profile,
} from "../../framework/identity";
import {
  WebhookFEO,
  WEBHOOKS_DEXIE_TABLE,
  WEBHOOKS_REDUX_KEY,
} from "./webhooks.reducer";
import _ from "lodash";

/**
 * Middleware for handling optimistic updates for the webhooks table
 */
export const webhooksOptimisticDexieMiddleware = (currentIdentitySet: {
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
          GET_WEBHOOK,
          GET_WEBHOOK_COMMIT,
          GET_WEBHOOK_ROLLBACK,
          LIST_WEBHOOKS,
          LIST_WEBHOOKS_COMMIT,
          LIST_WEBHOOKS_ROLLBACK,
          CREATE_WEBHOOK,
          CREATE_WEBHOOK_COMMIT,
          CREATE_WEBHOOK_ROLLBACK,
          UPDATE_WEBHOOK,
          UPDATE_WEBHOOK_COMMIT,
          UPDATE_WEBHOOK_ROLLBACK,
          DELETE_WEBHOOK,
          DELETE_WEBHOOK_COMMIT,
          DELETE_WEBHOOK_ROLLBACK,
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
      const table = db.table<WebhookFEO, string>(WEBHOOKS_DEXIE_TABLE);
      let enhancedAction = action;

      try {
        // Process action based on type

        // ------------------------------ GET WEBHOOK --------------------------------- //

        switch (action.type) {
          case GET_WEBHOOK: {
            // Get cached data from IndexedDB
            const optimisticID = action.meta.optimisticID;
            const cachedWebhook = await table.get(optimisticID);
            if (cachedWebhook) {
              enhancedAction = {
                ...action,
                optimistic: {
                  ...cachedWebhook,
                  _isOptimistic: true,
                  _optimisticID: optimisticID,
                  _syncSuccess: false,
                  _syncConflict: false,
                  _syncWarning: `Awaiting Sync. This webhook was fetched offline and will auto-sync with cloud when you are online again. If there are errors, it may need to be refetched. Anything else depending on it may also be affected.`,
                },
              };
            }
            break;
          }

          case GET_WEBHOOK_COMMIT: {
            const realWebhook = action.payload?.ok?.data;
            if (realWebhook) {
              await table.put({
                ...realWebhook,
                _optimisticID: null,
                _isOptimistic: false,
                _syncSuccess: true,
                _syncConflict: false,
                _syncWarning: "",
              });
            }
            break;
          }

          case GET_WEBHOOK_ROLLBACK: {
            if (!action.payload.response) break;
            try {
              const err = await action.payload.response.json();
              const optimisticID = action.meta?.optimisticID;
              if (optimisticID) {
                const error_message = `Failed to get webhook - a sync conflict occurred between your offline local copy & the official cloud record. You may see sync conflicts in other related data. Error message for your request: ${err.err.message}`;
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

          // ------------------------------ LIST WEBHOOKS --------------------------------- //

          case LIST_WEBHOOKS: {
            // Get cached data from IndexedDB
            const cachedWebhooks = await table.toArray();

            // Enhance action with cached data if available
            if (cachedWebhooks && cachedWebhooks.length > 0) {
              enhancedAction = {
                ...action,
                optimistic: cachedWebhooks.map((w) => ({
                  ...w,
                  _isOptimistic: true,
                  _optimisticID: w.id,
                })),
              };
            }
            break;
          }

          case LIST_WEBHOOKS_COMMIT: {
            // Extract webhooks from the response
            const webhooks = action.payload?.ok?.data?.items || [];

            // Update IndexedDB with fresh data
            await db.transaction("rw", table, async () => {
              // Update or add each webhook
              for (const webhook of webhooks) {
                await table.put({
                  ...webhook,
                  _optimisticID: webhook.id,
                  _isOptimistic: false,
                  _syncConflict: false,
                  _syncWarning: "",
                  _syncSuccess: true,
                });
              }
            });
            break;
          }

          case LIST_WEBHOOKS_ROLLBACK: {
            if (!action.payload.response) break;
            try {
              const err = await action.payload.response.json();
              const error_message = `Failed to fetch webhooks - ${err.err.message}`;
              enhancedAction = {
                ...action,
                error_message,
              };
            } catch (e) {
              console.log(e);
            }
            break;
          }

          // ------------------------------ CREATE WEBHOOK --------------------------------- //

          case CREATE_WEBHOOK: {
            // Only handle actions with webhook data
            if (action.meta?.offline?.effect?.data) {
              const webhookData = action.meta.offline.effect.data;
              const optimisticID = action.meta.optimisticID;

              // Create optimistic webhook object
              const optimisticWebhook: WebhookFEO = {
                id: optimisticID,
                ...webhookData,
                labels: webhookData.labels || [],
                permission_previews: [],
                created_at: Date.now(),
                updated_at: Date.now(),
                _optimisticID: optimisticID,
                _syncWarning: `Awaiting Sync. This webhook was created offline and will auto-sync with cloud when you are online again. If there are errors, it may need to be recreated. Anything else depending on it may also be affected.`,
                _syncConflict: false,
                _syncSuccess: false,
                _isOptimistic: true,
              };

              // Save to IndexedDB
              await table.put(optimisticWebhook);

              // Enhance action with optimisticID
              enhancedAction = {
                ...action,
                optimistic: optimisticWebhook,
              };
            }
            break;
          }

          case CREATE_WEBHOOK_COMMIT: {
            const optimisticID = action.meta?.optimisticID;
            const realWebhook = action.payload?.ok?.data;
            if (optimisticID && realWebhook) {
              await db.transaction("rw", table, async () => {
                // Remove optimistic version
                await table.delete(optimisticID);
                // Add real version
                await table.put({
                  ...realWebhook,
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

          case CREATE_WEBHOOK_ROLLBACK: {
            if (!action.payload.response) break;
            try {
              const err = await action.payload.response.json();
              const optimisticID = action.meta?.optimisticID;
              if (optimisticID) {
                const error_message = `Failed to create webhook - a sync conflict occurred between your offline local copy & the official cloud record. You may see sync conflicts in other related data. Error message for your request: ${err.err.message}`;
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

          // ------------------------------ UPDATE WEBHOOK --------------------------------- //

          case UPDATE_WEBHOOK: {
            // Only handle actions with webhook data
            if (action.meta?.offline?.effect?.data) {
              const webhookData = action.meta.offline.effect.data;
              const optimisticID = action.meta.optimisticID;

              const cachedWebhook = await table.get(optimisticID);

              // Create optimistic webhook object
              const optimisticWebhook: WebhookFEO = {
                id: webhookData.id,
                ...cachedWebhook,
                ...webhookData,
                updated_at: Date.now(),
                _isOptimistic: true,
                _optimisticID: optimisticID,
                _syncWarning: `Awaiting Sync. This webhook was edited offline and will auto-sync with cloud when you are online again. If there are errors, it may need to be reverted. Anything else depending on it may also be affected.`,
                _syncConflict: false,
                _syncSuccess: false,
              };

              // Save to IndexedDB
              await table.put(optimisticWebhook);

              // Enhance action with optimisticID
              enhancedAction = {
                ...action,
                optimistic: optimisticWebhook,
              };
            }
            break;
          }

          case UPDATE_WEBHOOK_COMMIT: {
            const optimisticID = action.meta?.optimisticID;
            const realWebhook = action.payload?.ok?.data;
            if (optimisticID && realWebhook) {
              await db.transaction("rw", table, async () => {
                // Remove optimistic version
                await table.delete(optimisticID);
                // Add real version
                await table.put({
                  ...realWebhook,
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

          case UPDATE_WEBHOOK_ROLLBACK: {
            if (!action.payload.response) break;
            try {
              const err = await action.payload.response.json();
              const optimisticID = action.meta?.optimisticID;
              if (optimisticID) {
                const error_message = `Failed to update webhook - a sync conflict occurred between your offline local copy & the official cloud record. You may see sync conflicts in other related data. Error message for your request: ${err.err.message}`;
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

          // ------------------------------ DELETE WEBHOOK --------------------------------- //

          case DELETE_WEBHOOK: {
            const optimisticID = action.meta.optimisticID;

            const cachedWebhook = await table.get(optimisticID);

            if (cachedWebhook) {
              const optimisticWebhook: WebhookFEO = {
                ...cachedWebhook,
                id: optimisticID,
                _markedForDeletion: true,
                _syncWarning: `Awaiting Sync. This webhook was deleted offline and will auto-sync with cloud when you are online again. If there are errors, it may need to be restored. Anything else depending on it may also be affected.`,
                _syncConflict: false,
                _syncSuccess: false,
                _isOptimistic: true,
                _optimisticID: optimisticID,
              };

              // mark for deletion in indexdb
              // Save to IndexedDB
              await table.put(optimisticWebhook);

              // Enhance action with optimisticID
              enhancedAction = {
                ...action,
                optimistic: optimisticWebhook,
              };
            }
            break;
          }

          case DELETE_WEBHOOK_COMMIT: {
            const optimisticID = action.meta?.optimisticID;
            if (optimisticID) {
              await db.transaction("rw", table, async () => {
                // Remove optimistic version
                await table.delete(optimisticID);
              });
            }
            break;
          }

          case DELETE_WEBHOOK_ROLLBACK: {
            if (!action.payload.response) break;
            try {
              const err = await action.payload.response.json();
              const optimisticID = action.meta?.optimisticID;
              if (optimisticID) {
                const error_message = `Failed to delete webhook - a sync conflict occurred between your offline local copy & the official cloud record. You may see sync conflicts in other related data. Error message for your request: ${err.err.message}`;
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
          `Error in webhooks middleware for ${action.type}:`,
          error
        );
        // Continue with the original action if there's an error
        return next(action);
      }
    };
};

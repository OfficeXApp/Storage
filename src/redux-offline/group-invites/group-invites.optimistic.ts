// src/redux-offline/group-invites/group-invites.optimistic.ts

import { AnyAction, Dispatch, Middleware, MiddlewareAPI } from "redux";
import { getDexieDb, markSyncConflict } from "../../api/dexie-database";
import {
  LIST_GROUP_INVITES,
  LIST_GROUP_INVITES_COMMIT,
  LIST_GROUP_INVITES_ROLLBACK,
  CREATE_GROUP_INVITE,
  CREATE_GROUP_INVITE_COMMIT,
  CREATE_GROUP_INVITE_ROLLBACK,
  GET_GROUP_INVITE,
  GET_GROUP_INVITE_COMMIT,
  GET_GROUP_INVITE_ROLLBACK,
  UPDATE_GROUP_INVITE,
  UPDATE_GROUP_INVITE_COMMIT,
  UPDATE_GROUP_INVITE_ROLLBACK,
  DELETE_GROUP_INVITE,
  DELETE_GROUP_INVITE_COMMIT,
  DELETE_GROUP_INVITE_ROLLBACK,
} from "./group-invites.actions";
import {
  AuthProfile,
  IndexDB_ApiKey,
  IndexDB_Organization,
  IndexDB_Profile,
} from "../../framework/identity";
import {
  GroupInviteFEO,
  GROUP_INVITES_DEXIE_TABLE,
  GROUP_INVITES_REDUX_KEY,
} from "./group-invites.reducer";
import _ from "lodash";

/**
 * Middleware for handling optimistic updates for the group invites table
 */
export const groupInvitesOptimisticDexieMiddleware = (currentIdentitySet: {
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

      // Skip actions we don't care about
      if (
        ![
          GET_GROUP_INVITE,
          GET_GROUP_INVITE_COMMIT,
          GET_GROUP_INVITE_ROLLBACK,
          LIST_GROUP_INVITES,
          LIST_GROUP_INVITES_COMMIT,
          LIST_GROUP_INVITES_ROLLBACK,
          CREATE_GROUP_INVITE,
          CREATE_GROUP_INVITE_COMMIT,
          CREATE_GROUP_INVITE_ROLLBACK,
          UPDATE_GROUP_INVITE,
          UPDATE_GROUP_INVITE_COMMIT,
          UPDATE_GROUP_INVITE_ROLLBACK,
          DELETE_GROUP_INVITE,
          DELETE_GROUP_INVITE_COMMIT,
          DELETE_GROUP_INVITE_ROLLBACK,
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
      const table = db.table<GroupInviteFEO, string>(GROUP_INVITES_DEXIE_TABLE);
      let enhancedAction = action;

      try {
        // Process action based on type

        // ------------------------------ GET GROUP INVITE --------------------------------- //

        switch (action.type) {
          case GET_GROUP_INVITE: {
            // Get cached data from IndexedDB
            const optimisticID = action.meta.optimisticID;
            const cachedInvite = await table.get(optimisticID);
            if (cachedInvite) {
              enhancedAction = {
                ...action,
                optimistic: {
                  ...cachedInvite,
                  _isOptimistic: true,
                  _optimisticID: optimisticID,
                  _syncSuccess: false,
                  _syncConflict: false,
                  _syncWarning: `Awaiting Sync. This group invite was fetched offline and will auto-sync with cloud when you are online again. If there are errors, it may need to be refetched. Anything else depending on it may also be affected.`,
                },
              };
            }
            break;
          }

          case GET_GROUP_INVITE_COMMIT: {
            const realInvite = action.payload?.ok?.data;
            if (realInvite) {
              await table.put({
                ...realInvite,
                _optimisticID: null,
                _isOptimistic: false,
                _syncSuccess: true,
                _syncConflict: false,
                _syncWarning: "",
              });
            }
            break;
          }

          case GET_GROUP_INVITE_ROLLBACK: {
            try {
              const err = await action.payload.response.json();
              const optimisticID = action.meta?.optimisticID;
              if (optimisticID) {
                const error_message = `Failed to get group invite - a sync conflict occurred between your offline local copy & the official cloud record. You may see sync conflicts in other related data. Error message for your request: ${err.err.message}`;
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

          // ------------------------------ LIST GROUP INVITES --------------------------------- //

          case LIST_GROUP_INVITES: {
            // Get cached data from IndexedDB
            const cachedInvites = await table.toArray();

            // Enhance action with cached data if available
            if (cachedInvites && cachedInvites.length > 0) {
              enhancedAction = {
                ...action,
                optimistic: cachedInvites.map((invite) => ({
                  ...invite,
                  _isOptimistic: true,
                  _optimisticID: invite.id,
                })),
              };
            }
            break;
          }

          case LIST_GROUP_INVITES_COMMIT: {
            // Extract invites from the response
            const invites = action.payload?.ok?.data?.items || [];

            // Update IndexedDB with fresh data
            await db.transaction("rw", table, async () => {
              // Update or add each invite
              for (const invite of invites) {
                await table.put({
                  ...invite,
                  _optimisticID: invite.id,
                  _isOptimistic: false,
                  _syncConflict: false,
                  _syncWarning: "",
                  _syncSuccess: true,
                });
              }
            });
            break;
          }

          case LIST_GROUP_INVITES_ROLLBACK: {
            try {
              const err = await action.payload.response.json();
              const error_message = `Failed to fetch group invites - ${err.err.message}`;
              enhancedAction = {
                ...action,
                error_message,
              };
            } catch (e) {
              console.log(e);
            }
            break;
          }

          // ------------------------------ CREATE GROUP INVITE --------------------------------- //

          case CREATE_GROUP_INVITE: {
            // Only handle actions with invite data
            if (action.meta?.offline?.effect?.data) {
              const inviteData = action.meta.offline.effect.data;
              const optimisticID = action.meta.optimisticID;

              // Create optimistic invite object
              const optimisticInvite: GroupInviteFEO = {
                id: optimisticID,
                ...inviteData,
                group_name: "", // These would be filled with proper data in a real implementation
                invitee_name: "",
                permission_previews: [],
                labels: [],
                created_at: Date.now(),
                last_modified_at: Date.now(),
                _optimisticID: optimisticID,
                _syncWarning: `Awaiting Sync. This group invite was created offline and will auto-sync with cloud when you are online again. If there are errors, it may need to be recreated. Anything else depending on it may also be affected.`,
                _syncConflict: false,
                _syncSuccess: false,
                _isOptimistic: true,
              };

              // Save to IndexedDB
              await table.put(optimisticInvite);

              // Enhance action with optimisticID
              enhancedAction = {
                ...action,
                optimistic: optimisticInvite,
              };
            }
            break;
          }

          case CREATE_GROUP_INVITE_COMMIT: {
            const optimisticID = action.meta?.optimisticID;
            const realInvite = action.payload?.ok?.data;
            if (optimisticID && realInvite) {
              await db.transaction("rw", table, async () => {
                // Remove optimistic version
                await table.delete(optimisticID);
                // Add real version
                await table.put({
                  ...realInvite,
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

          case CREATE_GROUP_INVITE_ROLLBACK: {
            try {
              const err = await action.payload.response.json();
              const optimisticID = action.meta?.optimisticID;
              if (optimisticID) {
                const error_message = `Failed to create group invite - a sync conflict occurred between your offline local copy & the official cloud record. You may see sync conflicts in other related data. Error message for your request: ${err.err.message}`;
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

          // ------------------------------ UPDATE GROUP INVITE --------------------------------- //

          case UPDATE_GROUP_INVITE: {
            // Only handle actions with invite data
            if (action.meta?.offline?.effect?.data) {
              const inviteData = action.meta.offline.effect.data;
              const optimisticID = action.meta.optimisticID;

              const cachedInvite = await table.get(optimisticID);

              // Create optimistic invite object
              const optimisticInvite: GroupInviteFEO = {
                id: inviteData.id,
                ...cachedInvite,
                ...inviteData,
                last_modified_at: Date.now(),
                _isOptimistic: true,
                _optimisticID: optimisticID,
                _syncWarning: `Awaiting Sync. This group invite was edited offline and will auto-sync with cloud when you are online again. If there are errors, it may need to be reverted. Anything else depending on it may also be affected.`,
                _syncConflict: false,
                _syncSuccess: false,
              };

              // Save to IndexedDB
              await table.put(optimisticInvite);

              // Enhance action with optimisticID
              enhancedAction = {
                ...action,
                optimistic: optimisticInvite,
              };
            }
            break;
          }

          case UPDATE_GROUP_INVITE_COMMIT: {
            const optimisticID = action.meta?.optimisticID;
            const realInvite = action.payload?.ok?.data;
            if (optimisticID && realInvite) {
              await db.transaction("rw", table, async () => {
                // Remove optimistic version
                await table.delete(optimisticID);
                // Add real version
                await table.put({
                  ...realInvite,
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

          case UPDATE_GROUP_INVITE_ROLLBACK: {
            try {
              const err = await action.payload.response.json();
              const optimisticID = action.meta?.optimisticID;
              if (optimisticID) {
                const error_message = `Failed to update group invite - a sync conflict occurred between your offline local copy & the official cloud record. You may see sync conflicts in other related data. Error message for your request: ${err.err.message}`;
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

          // ------------------------------ DELETE GROUP INVITE --------------------------------- //

          case DELETE_GROUP_INVITE: {
            const optimisticID = action.meta.optimisticID;

            const cachedInvite = await table.get(optimisticID);

            if (cachedInvite) {
              const optimisticInvite: GroupInviteFEO = {
                ...cachedInvite,
                id: optimisticID,
                _markedForDeletion: true,
                _syncWarning: `Awaiting Sync. This group invite was deleted offline and will auto-sync with cloud when you are online again. If there are errors, it may need to be restored. Anything else depending on it may also be affected.`,
                _syncConflict: false,
                _syncSuccess: false,
                _isOptimistic: true,
                _optimisticID: optimisticID,
              };

              // mark for deletion in indexdb
              // Save to IndexedDB
              await table.put(optimisticInvite);

              // Enhance action with optimisticID
              enhancedAction = {
                ...action,
                optimistic: optimisticInvite,
              };
            }

            break;
          }

          case DELETE_GROUP_INVITE_COMMIT: {
            const optimisticID = action.meta?.optimisticID;
            if (optimisticID) {
              await db.transaction("rw", table, async () => {
                // Remove optimistic version
                await table.delete(optimisticID);
              });
            }
            break;
          }

          case DELETE_GROUP_INVITE_ROLLBACK: {
            try {
              const err = await action.payload.response.json();
              const optimisticID = action.meta?.optimisticID;
              if (optimisticID) {
                const error_message = `Failed to delete group invite - a sync conflict occurred between your offline local copy & the official cloud record. You may see sync conflicts in other related data. Error message for your request: ${err.err.message}`;
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
          `Error in group invites middleware for ${action.type}:`,
          error
        );
        // Continue with the original action if there's an error
        return next(action);
      }
    };
};

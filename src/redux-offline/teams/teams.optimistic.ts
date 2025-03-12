// src/redux-offline/teams/teams.optimistic.ts

import { AnyAction, Dispatch, Middleware, MiddlewareAPI } from "redux";
import { getDexieDb, markSyncConflict } from "../../api/dexie-database";
import {
  LIST_TEAMS,
  LIST_TEAMS_COMMIT,
  LIST_TEAMS_ROLLBACK,
  CREATE_TEAM,
  CREATE_TEAM_COMMIT,
  CREATE_TEAM_ROLLBACK,
  GET_TEAM,
  GET_TEAM_COMMIT,
  GET_TEAM_ROLLBACK,
  UPDATE_TEAM,
  UPDATE_TEAM_COMMIT,
  UPDATE_TEAM_ROLLBACK,
  DELETE_TEAM,
  DELETE_TEAM_COMMIT,
  DELETE_TEAM_ROLLBACK,
} from "./teams.actions";
import {
  AuthProfile,
  IndexDB_ApiKey,
  IndexDB_Organization,
  IndexDB_Profile,
} from "../../framework/identity";
import { TeamFEO, TEAMS_DEXIE_TABLE, TEAMS_REDUX_KEY } from "./teams.reducer";
import _ from "lodash";

/**
 * Middleware for handling optimistic updates for the teams table
 */
export const teamsOptimisticDexieMiddleware = (currentIdentitySet: {
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
      console.log(
        `Inside teams optimistic middleware for ${action.type}`,
        action
      );

      // Skip actions we don't care about
      if (
        ![
          GET_TEAM,
          GET_TEAM_COMMIT,
          GET_TEAM_ROLLBACK,
          LIST_TEAMS,
          LIST_TEAMS_COMMIT,
          LIST_TEAMS_ROLLBACK,
          CREATE_TEAM,
          CREATE_TEAM_COMMIT,
          CREATE_TEAM_ROLLBACK,
          UPDATE_TEAM,
          UPDATE_TEAM_COMMIT,
          UPDATE_TEAM_ROLLBACK,
          DELETE_TEAM,
          DELETE_TEAM_COMMIT,
          DELETE_TEAM_ROLLBACK,
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
      const table = db.table<TeamFEO, string>(TEAMS_DEXIE_TABLE);
      let enhancedAction = action;

      try {
        // Process action based on type
        switch (action.type) {
          // ------------------------------ GET TEAM --------------------------------- //

          case GET_TEAM: {
            // Get cached data from IndexedDB
            const optimisticID = action.meta.optimisticID;
            const cachedTeam = await table.get(optimisticID);

            if (cachedTeam) {
              enhancedAction = {
                ...action,
                optimistic: {
                  ...cachedTeam,
                  _isOptimistic: true,
                  _optimisticID: optimisticID,
                  _syncSuccess: false,
                  _syncConflict: false,
                  _syncWarning: `Awaiting Sync. This team was fetched offline and will auto-sync with cloud when you are online again. If there are errors, it may need to be refetched. Anything else depending on it may also be affected.`,
                },
              };
            }
            break;
          }

          case GET_TEAM_COMMIT: {
            const realTeam = action.payload?.ok?.data;

            if (realTeam) {
              await table.put({
                ...realTeam,
                _optimisticID: null,
                _isOptimistic: false,
                _syncSuccess: true,
                _syncConflict: false,
                _syncWarning: "",
              });
            }
            break;
          }

          case GET_TEAM_ROLLBACK: {
            try {
              const err = await action.payload.response.json();
              const optimisticID = action.meta?.optimisticID;

              if (optimisticID) {
                const error_message = `Failed to get team - a sync conflict occurred between your offline local copy & the official cloud record. You may see sync conflicts in other related data. Error message for your request: ${err.err.message}`;
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

          // ------------------------------ LIST TEAMS --------------------------------- //

          case LIST_TEAMS: {
            // Get cached data from IndexedDB
            const cachedTeams = await table.toArray();

            // Enhance action with cached data if available
            if (cachedTeams && cachedTeams.length > 0) {
              enhancedAction = {
                ...action,
                optimistic: cachedTeams.map((t) => ({
                  ...t,
                  _isOptimistic: true,
                  _optimisticID: t.id,
                })),
              };
            }
            break;
          }

          case LIST_TEAMS_COMMIT: {
            // Extract teams from the response
            const teams = action.payload?.ok?.data?.items || [];

            // Update IndexedDB with fresh data
            await db.transaction("rw", table, async () => {
              // Update or add each team
              for (const team of teams) {
                await table.put({
                  ...team,
                  _optimisticID: team.id,
                  _isOptimistic: false,
                  _syncConflict: false,
                  _syncWarning: "",
                  _syncSuccess: true,
                });
              }
            });
            break;
          }

          case LIST_TEAMS_ROLLBACK: {
            try {
              const err = await action.payload.response.json();
              const error_message = `Failed to fetch teams - ${err.err.message}`;

              enhancedAction = {
                ...action,
                error_message,
              };
            } catch (e) {
              console.log(e);
            }
            break;
          }

          // ------------------------------ CREATE TEAM --------------------------------- //

          case CREATE_TEAM: {
            // Only handle actions with team data
            if (action.meta?.offline?.effect?.data) {
              const teamData = action.meta.offline.effect.data;
              const optimisticID = action.meta.optimisticID;

              // Create optimistic team object
              const optimisticTeam: TeamFEO = {
                id: optimisticID,
                ...teamData,
                tags: [],
                member_previews: [],
                permission_previews: [],
                created_at: Date.now(),
                last_modified_at: Date.now(),
                _optimisticID: optimisticID,
                _syncWarning: `Awaiting Sync. This team was created offline and will auto-sync with cloud when you are online again. If there are errors, it may need to be recreated. Anything else depending on it may also be affected.`,
                _syncConflict: false,
                _syncSuccess: false,
                _isOptimistic: true,
              };

              // Save to IndexedDB
              await table.put(optimisticTeam);

              // Enhance action with optimisticID
              enhancedAction = {
                ...action,
                optimistic: optimisticTeam,
              };
            }
            break;
          }

          case CREATE_TEAM_COMMIT: {
            const optimisticID = action.meta?.optimisticID;
            const realTeam = action.payload?.ok?.data;

            if (optimisticID && realTeam) {
              await db.transaction("rw", table, async () => {
                // Remove optimistic version
                await table.delete(optimisticID);

                // Add real version
                await table.put({
                  ...realTeam,
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

          case CREATE_TEAM_ROLLBACK: {
            try {
              const err = await action.payload.response.json();
              const optimisticID = action.meta?.optimisticID;

              if (optimisticID) {
                const error_message = `Failed to create team - a sync conflict occurred between your offline local copy & the official cloud record. You may see sync conflicts in other related data. Error message for your request: ${err.err.message}`;
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

          // ------------------------------ UPDATE TEAM --------------------------------- //

          case UPDATE_TEAM: {
            // Only handle actions with team data
            if (action.meta?.offline?.effect?.data) {
              const teamData = action.meta.offline.effect.data;
              const optimisticID = action.meta.optimisticID;

              const cachedTeam = await table.get(optimisticID);

              // Create optimistic team object
              const optimisticTeam: TeamFEO = {
                id: teamData.id,
                ...cachedTeam,
                ...teamData,
                last_modified_at: Date.now(),
                _isOptimistic: true,
                _optimisticID: optimisticID,
                _syncWarning: `Awaiting Sync. This team was edited offline and will auto-sync with cloud when you are online again. If there are errors, it may need to be reverted. Anything else depending on it may also be affected.`,
                _syncConflict: false,
                _syncSuccess: false,
              };

              // Save to IndexedDB
              await table.put(optimisticTeam);

              // Enhance action with optimisticID
              enhancedAction = {
                ...action,
                optimistic: optimisticTeam,
              };
            }
            break;
          }

          case UPDATE_TEAM_COMMIT: {
            const optimisticID = action.meta?.optimisticID;
            const realTeam = action.payload?.ok?.data;

            if (optimisticID && realTeam) {
              await db.transaction("rw", table, async () => {
                // Remove optimistic version
                await table.delete(optimisticID);

                // Add real version
                await table.put({
                  ...realTeam,
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

          case UPDATE_TEAM_ROLLBACK: {
            try {
              const err = await action.payload.response.json();
              const optimisticID = action.meta?.optimisticID;

              if (optimisticID) {
                const error_message = `Failed to update team - a sync conflict occurred between your offline local copy & the official cloud record. You may see sync conflicts in other related data. Error message for your request: ${err.err.message}`;
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

          // ------------------------------ DELETE TEAM --------------------------------- //

          case DELETE_TEAM: {
            const optimisticID = action.meta.optimisticID;
            const cachedTeam = await table.get(optimisticID);

            if (cachedTeam) {
              const optimisticTeam: TeamFEO = {
                ...cachedTeam,
                id: optimisticID,
                _markedForDeletion: true,
                _syncWarning: `Awaiting Sync. This team was deleted offline and will auto-sync with cloud when you are online again. If there are errors, it may need to be restored. Anything else depending on it may also be affected.`,
                _syncConflict: false,
                _syncSuccess: false,
                _isOptimistic: true,
                _optimisticID: optimisticID,
              };

              // Mark for deletion in indexdb
              await table.put(optimisticTeam);

              // Enhance action with optimisticID
              enhancedAction = {
                ...action,
                optimistic: optimisticTeam,
              };
            }
            break;
          }

          case DELETE_TEAM_COMMIT: {
            const optimisticID = action.meta?.optimisticID;

            if (optimisticID) {
              await db.transaction("rw", table, async () => {
                // Remove optimistic version
                await table.delete(optimisticID);
              });
            }
            break;
          }

          case DELETE_TEAM_ROLLBACK: {
            try {
              const err = await action.payload.response.json();
              const optimisticID = action.meta?.optimisticID;

              if (optimisticID) {
                const error_message = `Failed to delete team - a sync conflict occurred between your offline local copy & the official cloud record. You may see sync conflicts in other related data. Error message for your request: ${err.err.message}`;
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
        console.error(`Error in teams middleware for ${action.type}:`, error);
        // Continue with the original action if there's an error
        return next(action);
      }
    };
};

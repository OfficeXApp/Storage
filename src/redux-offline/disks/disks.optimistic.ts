import { AnyAction, Dispatch, Middleware, MiddlewareAPI } from "redux";
import { getDexieDb } from "../../api/dexie-database";
import {
  FETCH_DISKS,
  FETCH_DISKS_COMMIT,
  FETCH_DISKS_ROLLBACK,
  CREATE_DISK,
  CREATE_DISK_COMMIT,
  CREATE_DISK_ROLLBACK,
} from "../disks/disks.actions";
import {
  AuthProfile,
  IndexDB_ApiKey,
  IndexDB_Organization,
  IndexDB_Profile,
} from "../../framework/identity";
import { DISKS_DEXIE_TABLE, DISKS_REDUX_KEY } from "./disks.reducer";

/**
 * Middleware for handling optimistic updates for the disks table
 */
export const disksOptimisticDexieMiddleware = (currentIdentitySet: {
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
        `Inside disks optimistic middleware for ${action.type}`,
        action
      );
      // Skip actions we don't care about
      if (
        ![
          FETCH_DISKS,
          FETCH_DISKS_COMMIT,
          FETCH_DISKS_ROLLBACK,
          CREATE_DISK,
          CREATE_DISK_COMMIT,
          CREATE_DISK_ROLLBACK,
        ].includes(action.type)
      ) {
        return next(action);
      }

      const userID = currentIdentitySet.currentProfile?.userID;
      const orgID = currentIdentitySet.currentOrg?.driveID;

      console.log(`userID: ${userID}, orgID: ${orgID}`);

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
      const table = db.table(DISKS_DEXIE_TABLE);
      let enhancedAction = action;

      try {
        // Process action based on type
        switch (action.type) {
          case FETCH_DISKS: {
            // Get cached data from IndexedDB
            const cachedDisks = await table.toArray();

            // Enhance action with cached data if available
            if (cachedDisks && cachedDisks.length > 0) {
              enhancedAction = {
                ...action,
                cachedData: cachedDisks,
              };
            }
            break;
          }

          case FETCH_DISKS_COMMIT: {
            // Extract disks from the response
            const disks = action.payload?.ok?.data?.items || [];

            // Update IndexedDB with fresh data
            await db.transaction("rw", table, async () => {
              // Update or add each disk
              for (const disk of disks) {
                await table.put({
                  ...disk,
                  _isOptimistic: false,
                });
              }
            });
            break;
          }

          case CREATE_DISK: {
            console.log(`Inside disk optimistic middleware for CREATE_DISK`);
            console.log(action);
            // Only handle actions with disk data
            if (action.meta?.offline?.effect?.data) {
              const diskData = action.meta.offline.effect.data;
              const optimisticID = action.meta.optimisticID;

              // Create optimistic disk object
              const optimisticDisk = {
                id: optimisticID,
                ...diskData,
                created_at: Date.now(),
                updated_at: Date.now(),
                _optimisticID: optimisticID,
              };
              console.log(`Storing an optimistic disk`, optimisticDisk);

              // Save to IndexedDB
              await table.put(optimisticDisk);

              // Enhance action with optimisticID
              enhancedAction = {
                ...action,
                optimistic: optimisticDisk,
              };
            }
            break;
          }

          case CREATE_DISK_COMMIT: {
            const optimisticID = action.meta?.optimisticID;
            const realDisk = action.payload?.ok?.data;
            if (optimisticID && realDisk) {
              await db.transaction("rw", table, async () => {
                // Remove optimistic version
                await table.delete(optimisticID);
                // Add real version
                await table.put(realDisk);
              });
            }
            break;
          }

          case CREATE_DISK_ROLLBACK: {
            const optimisticID = action.meta?.optimisticID;
            if (optimisticID) {
              await table.delete(optimisticID);
            }
            break;
          }
        }

        // Pass the (potentially enhanced) action to the next middleware
        return next(enhancedAction);
      } catch (error) {
        console.error(`Error in disks middleware for ${action.type}:`, error);
        // Continue with the original action if there's an error
        return next(action);
      }
    };
};

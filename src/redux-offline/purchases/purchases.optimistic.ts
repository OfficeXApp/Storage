// src/redux-offline/purchases/purchases.optimistic.ts

import { AnyAction, Dispatch, Middleware, MiddlewareAPI } from "redux";
import { getDexieDb, markSyncConflict } from "../../api/dexie-database";
import {
  LIST_PURCHASES,
  LIST_PURCHASES_COMMIT,
  LIST_PURCHASES_ROLLBACK,
  CREATE_PURCHASE,
  CREATE_PURCHASE_COMMIT,
  CREATE_PURCHASE_ROLLBACK,
  GET_PURCHASE,
  GET_PURCHASE_COMMIT,
  GET_PURCHASE_ROLLBACK,
  UPDATE_PURCHASE,
  UPDATE_PURCHASE_COMMIT,
  UPDATE_PURCHASE_ROLLBACK,
  DELETE_PURCHASE,
  DELETE_PURCHASE_COMMIT,
  DELETE_PURCHASE_ROLLBACK,
  CHECK_PURCHASES_TABLE_PERMISSIONS,
  CHECK_PURCHASES_TABLE_PERMISSIONS_COMMIT,
  CHECK_PURCHASES_TABLE_PERMISSIONS_ROLLBACK,
} from "./purchases.actions";
import { AuthProfile, IndexDB_Organization } from "../../framework/identity";
import { PurchaseFEO, PURCHASES_DEXIE_TABLE } from "./purchases.reducer";
import { SystemPermissionType } from "@officexapp/types";
import { SYSTEM_PERMISSIONS_DEXIE_TABLE } from "../permissions/permissions.reducer"; // Assuming this path is correct

/**
 * Middleware for handling optimistic updates for the purchases table
 */
export const purchasesOptimisticDexieMiddleware = (currentIdentitySet: {
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
          GET_PURCHASE,
          GET_PURCHASE_COMMIT,
          GET_PURCHASE_ROLLBACK,
          LIST_PURCHASES,
          LIST_PURCHASES_COMMIT,
          LIST_PURCHASES_ROLLBACK,
          CREATE_PURCHASE,
          CREATE_PURCHASE_COMMIT,
          CREATE_PURCHASE_ROLLBACK,
          UPDATE_PURCHASE,
          UPDATE_PURCHASE_COMMIT,
          UPDATE_PURCHASE_ROLLBACK,
          DELETE_PURCHASE,
          DELETE_PURCHASE_COMMIT,
          DELETE_PURCHASE_ROLLBACK,
          CHECK_PURCHASES_TABLE_PERMISSIONS,
          CHECK_PURCHASES_TABLE_PERMISSIONS_COMMIT,
          CHECK_PURCHASES_TABLE_PERMISSIONS_ROLLBACK,
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
      const table = db.table<PurchaseFEO, string>(PURCHASES_DEXIE_TABLE);
      let enhancedAction = action;

      try {
        // Process action based on type
        switch (action.type) {
          // ------------------------------ GET JOB RUN --------------------------------- //
          case GET_PURCHASE: {
            // Get cached data from IndexedDB
            const optimisticID = action.meta.optimisticID;
            const cachedPurchase = await table.get(optimisticID);
            if (cachedPurchase) {
              enhancedAction = {
                ...action,
                optimistic: {
                  ...cachedPurchase,
                  _isOptimistic: true,
                  _optimisticID: optimisticID,
                  _syncSuccess: false,
                  _syncConflict: false,
                  _syncWarning: `Awaiting Sync. This purchase was fetched offline and will auto-sync with cloud when you are online again. If there are errors, it may need to be refetched. Anything else depending on it may also be affected.`,
                },
              };
            }
            break;
          }

          case GET_PURCHASE_COMMIT: {
            const realPurchase = action.payload?.ok?.data;
            if (realPurchase) {
              await table.put({
                ...realPurchase,
                _optimisticID: null,
                _isOptimistic: false,
                _syncSuccess: true,
                _syncConflict: false,
                _syncWarning: "",
              });
            }
            break;
          }

          case GET_PURCHASE_ROLLBACK: {
            if (!action.payload.response) break;
            try {
              const err = await action.payload.response.json();
              const optimisticID = action.meta?.optimisticID;
              if (optimisticID) {
                const error_message = `Failed to get purchase - a sync conflict occurred between your offline local copy & the official cloud record. You may see sync conflicts in other related data. Error message for your request: ${err.err.message}`;
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

          case LIST_PURCHASES: {
            // Get cached data from IndexedDB
            const cachedPurchases = await table.toArray();

            // Enhance action with cached data if available
            if (cachedPurchases && cachedPurchases.length > 0) {
              enhancedAction = {
                ...action,
                optimistic: cachedPurchases.map((jr) => ({
                  ...jr,
                  _isOptimistic: true,
                  _optimisticID: jr.id,
                })),
              };
            }
            break;
          }

          case LIST_PURCHASES_COMMIT: {
            // Extract purchases from the response
            const purchases = action.payload?.ok?.data?.items || [];

            // Update IndexedDB with fresh data
            await db.transaction("rw", table, async () => {
              // Clear existing data and add fresh data
              await table.clear(); // This might be too aggressive depending on your caching strategy
              for (const purchase of purchases) {
                await table.put({
                  ...purchase,
                  _optimisticID: purchase.id,
                  _isOptimistic: false,
                  _syncConflict: false,
                  _syncWarning: "",
                  _syncSuccess: true,
                });
              }
            });
            break;
          }

          case LIST_PURCHASES_ROLLBACK: {
            if (!action.payload.response) break;
            try {
              const err = await action.payload.response.json();
              const error_message = `Failed to fetch purchases - ${err.err.message}`;
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

          case CREATE_PURCHASE: {
            // Only handle actions with purchase data
            if (action.meta?.offline?.effect?.data) {
              const purchaseData = action.meta.offline.effect.data;
              const optimisticID = action.meta.optimisticID;

              // Create optimistic purchase object
              const optimisticPurchase: PurchaseFEO = {
                id: optimisticID,
                ...purchaseData,
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
                _syncWarning: `Awaiting Sync. This purchase was created offline and will auto-sync with cloud when you are online again. If there are errors, it may need to be recreated. Anything else depending on it may also be affected.`,
                _syncConflict: false,
                _syncSuccess: false,
                _isOptimistic: true,
              };

              // Save to IndexedDB
              await table.put(optimisticPurchase);

              // Enhance action with optimisticID
              enhancedAction = {
                ...action,
                optimistic: optimisticPurchase,
              };
            }
            break;
          }

          case CREATE_PURCHASE_COMMIT: {
            const optimisticID = action.meta?.optimisticID;
            const realPurchase = action.payload?.ok?.data;
            if (optimisticID && realPurchase) {
              await db.transaction("rw", table, async () => {
                // Remove optimistic version
                await table.delete(optimisticID);
                // Add real version
                await table.put({
                  ...realPurchase,
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

          case CREATE_PURCHASE_ROLLBACK: {
            if (!action.payload.response) break;
            try {
              const err = await action.payload.response.json();
              const optimisticID = action.meta?.optimisticID;
              if (optimisticID) {
                const error_message = `Failed to create purchase - a sync conflict occurred between your offline local copy & the official cloud record. You may see sync conflicts in other related data. Error message for your request: ${err.err.message}`;
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

          case UPDATE_PURCHASE: {
            // Only handle actions with purchase data
            if (action.meta?.offline?.effect?.data) {
              const purchaseData = action.meta.offline.effect.data;
              const optimisticID = action.meta.optimisticID;

              const cachedPurchase = await table.get(optimisticID);

              // Create optimistic purchase object
              const optimisticPurchase: PurchaseFEO = {
                id: purchaseData.id,
                ...cachedPurchase, // Keep existing cached data
                ...purchaseData, // Apply new data
                updated_at: Date.now(),
                _isOptimistic: true,
                _optimisticID: optimisticID,
                _syncWarning: `Awaiting Sync. This purchase was edited offline and will auto-sync with cloud when you are online again. If there are errors, it may need to be reverted. Anything else depending on it may also be affected.`,
                _syncConflict: false,
                _syncSuccess: false,
              };

              // Save to IndexedDB
              await table.put(optimisticPurchase);

              // Enhance action with optimisticID
              enhancedAction = {
                ...action,
                optimistic: optimisticPurchase,
              };
            }
            break;
          }

          case UPDATE_PURCHASE_COMMIT: {
            const optimisticID = action.meta?.optimisticID;
            const realPurchase = action.payload?.ok?.data;
            if (optimisticID && realPurchase) {
              await db.transaction("rw", table, async () => {
                // Remove optimistic version
                await table.delete(optimisticID);
                // Add real version
                await table.put({
                  ...realPurchase,
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

          case UPDATE_PURCHASE_ROLLBACK: {
            if (!action.payload.response) break;
            try {
              const err = await action.payload.response.json();
              const optimisticID = action.meta?.optimisticID;
              if (optimisticID) {
                const error_message = `Failed to update purchase - a sync conflict occurred between your offline local copy & the official cloud record. You may see sync conflicts in other related data. Error message for your request: ${err.err.message}`;
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

          case DELETE_PURCHASE: {
            const optimisticID = action.meta.optimisticID;

            const cachedPurchase = await table.get(optimisticID);

            if (cachedPurchase) {
              const optimisticPurchase: PurchaseFEO = {
                ...cachedPurchase,
                id: optimisticID,
                _markedForDeletion: true, // Mark for deletion
                _syncWarning: `Awaiting Sync. This purchase was deleted offline and will auto-sync with cloud when you are online again. If there are errors, it may need to be restored. Anything else depending on it may also be affected.`,
                _syncConflict: false,
                _syncSuccess: false,
                _isOptimistic: true,
                _optimisticID: optimisticID,
              };

              // mark for deletion in indexdb
              await table.put(optimisticPurchase);

              // Enhance action with optimisticID
              enhancedAction = {
                ...action,
                optimistic: optimisticPurchase,
              };
            }
            break;
          }

          case DELETE_PURCHASE_COMMIT: {
            const optimisticID = action.meta?.optimisticID;
            if (optimisticID) {
              await db.transaction("rw", table, async () => {
                // Remove optimistic version
                await table.delete(optimisticID);
              });
            }
            break;
          }

          case DELETE_PURCHASE_ROLLBACK: {
            if (!action.payload.response) break;
            try {
              const err = await action.payload.response.json();
              const optimisticID = action.meta?.optimisticID;
              if (optimisticID) {
                const error_message = `Failed to delete purchase - a sync conflict occurred between your offline local copy & the official cloud record. You may see sync conflicts in other related data. Error message for your request: ${err.err.message}`;
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

          case CHECK_PURCHASES_TABLE_PERMISSIONS: {
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

          case CHECK_PURCHASES_TABLE_PERMISSIONS_COMMIT: {
            const optimisticID = action.meta?.optimisticID;
            const permissions = action.payload?.ok?.data?.permissions;

            if (permissions) {
              // Save to system permissions table
              const systemPermissionsTable = db.table(
                SYSTEM_PERMISSIONS_DEXIE_TABLE
              );
              await systemPermissionsTable.put({
                id: optimisticID,
                resource_id: "TABLE_PURCHASES",
                granted_to: optimisticID.replace(
                  "purchases_table_permissions_",
                  ""
                ),
                granted_by: optimisticID.replace(
                  "purchases_table_permissions_",
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
                resource_name: "Purchases Table",
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

          case CHECK_PURCHASES_TABLE_PERMISSIONS_ROLLBACK: {
            if (!action.payload.response) break;
            try {
              const err = await action.payload.response.json();
              const optimisticID = action.meta?.optimisticID;
              if (optimisticID) {
                const error_message = `Failed to check purchases table permissions - a sync conflict occurred between your offline local copy & the official cloud record. You may see sync conflicts in other related data. Error message for your request: ${err.err.message}`;
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
          `Error in purchases middleware for ${action.type}:`,
          error
        );
        // Continue with the original action if there's an error
        return next(action);
      }
    };
};

// src/redux-offline/contacts/contacts.optimistic.ts

import { AnyAction, Dispatch, Middleware, MiddlewareAPI } from "redux";
import { getDexieDb, markSyncConflict } from "../../api/dexie-database";
import {
  LIST_CONTACTS,
  LIST_CONTACTS_COMMIT,
  LIST_CONTACTS_ROLLBACK,
  CREATE_CONTACT,
  CREATE_CONTACT_COMMIT,
  CREATE_CONTACT_ROLLBACK,
  GET_CONTACT,
  GET_CONTACT_COMMIT,
  GET_CONTACT_ROLLBACK,
  UPDATE_CONTACT,
  UPDATE_CONTACT_COMMIT,
  UPDATE_CONTACT_ROLLBACK,
  DELETE_CONTACT,
  DELETE_CONTACT_COMMIT,
  DELETE_CONTACT_ROLLBACK,
  REDEEM_CONTACT,
  REDEEM_CONTACT_COMMIT,
  REDEEM_CONTACT_ROLLBACK,
  CHECK_CONTACT_TABLE_PERMISSIONS,
  CHECK_CONTACT_TABLE_PERMISSIONS_COMMIT,
  CHECK_CONTACT_TABLE_PERMISSIONS_ROLLBACK,
} from "../contacts/contacts.actions";
import {
  AuthProfile,
  IndexDB_ApiKey,
  IndexDB_Organization,
  IndexDB_Profile,
} from "../../framework/identity";
import {
  ContactFEO,
  CONTACTS_DEXIE_TABLE,
  CONTACTS_REDUX_KEY,
} from "./contacts.reducer";
import { SYSTEM_PERMISSIONS_DEXIE_TABLE } from "../permissions/permissions.reducer";
import _ from "lodash";

/**
 * Middleware for handling optimistic updates for the contacts table
 */
export const contactsOptimisticDexieMiddleware = (currentIdentitySet: {
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
          GET_CONTACT,
          GET_CONTACT_COMMIT,
          GET_CONTACT_ROLLBACK,
          LIST_CONTACTS,
          LIST_CONTACTS_COMMIT,
          LIST_CONTACTS_ROLLBACK,
          CREATE_CONTACT,
          CREATE_CONTACT_COMMIT,
          CREATE_CONTACT_ROLLBACK,
          UPDATE_CONTACT,
          UPDATE_CONTACT_COMMIT,
          UPDATE_CONTACT_ROLLBACK,
          DELETE_CONTACT,
          DELETE_CONTACT_COMMIT,
          DELETE_CONTACT_ROLLBACK,
          REDEEM_CONTACT,
          REDEEM_CONTACT_COMMIT,
          REDEEM_CONTACT_ROLLBACK,
          CHECK_CONTACT_TABLE_PERMISSIONS,
          CHECK_CONTACT_TABLE_PERMISSIONS_COMMIT,
          CHECK_CONTACT_TABLE_PERMISSIONS_ROLLBACK,
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
      const table = db.table<ContactFEO, string>(CONTACTS_DEXIE_TABLE);
      let enhancedAction = action;

      try {
        // Process action based on type

        // ------------------------------ GET CONTACT --------------------------------- //

        switch (action.type) {
          case GET_CONTACT: {
            // Get cached data from IndexedDB
            const optimisticID = action.meta.optimisticID;
            const cachedContact = await table.get(optimisticID);
            if (cachedContact) {
              enhancedAction = {
                ...action,
                optimistic: {
                  ...cachedContact,
                  _isOptimistic: true,
                  _optimisticID: optimisticID,
                  _syncSuccess: false,
                  _syncConflict: false,
                  _syncWarning: `Awaiting Sync. This contact was fetched offline and will auto-sync with cloud when you are online again. If there are errors, it may need to be refetched. Anything else depending on it may also be affected.`,
                },
              };
            }
            break;
          }

          case GET_CONTACT_COMMIT: {
            const realContact = action.payload?.ok?.data;
            if (realContact) {
              await table.put({
                ...realContact,
                _optimisticID: null,
                _isOptimistic: false,
                _syncSuccess: true,
                _syncConflict: false,
                _syncWarning: "",
              });
            }
            break;
          }

          case GET_CONTACT_ROLLBACK: {
            if (!action.payload.response) break;
            try {
              const err = await action.payload.response.json();
              const optimisticID = action.meta?.optimisticID;
              if (optimisticID) {
                const error_message = `Failed to get contact - a sync conflict occurred between your offline local copy & the official cloud record. You may see sync conflicts in other related data. Error message for your request: ${err.err.message}`;
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

          // ------------------------------ LIST CONTACTS --------------------------------- //

          case LIST_CONTACTS: {
            // Get cached data from IndexedDB
            const cachedContacts = await table.toArray();

            // Enhance action with cached data if available
            if (cachedContacts && cachedContacts.length > 0) {
              enhancedAction = {
                ...action,
                optimistic: cachedContacts.map((c) => ({
                  ...c,
                  _isOptimistic: true,
                  _optimisticID: c.id,
                })),
              };
            }
            break;
          }

          case LIST_CONTACTS_COMMIT: {
            // Extract contacts from the response
            const contacts = action.payload?.ok?.data?.items || [];

            // Update IndexedDB with fresh data
            await db.transaction("rw", table, async () => {
              // Update or add each contact
              for (const contact of contacts) {
                await table.put({
                  ...contact,
                  _optimisticID: contact.id,
                  _isOptimistic: false,
                  _syncConflict: false,
                  _syncWarning: "",
                  _syncSuccess: true,
                });
                if (contact.from_placeholder_user_id) {
                  await table.delete(contact.from_placeholder_user_id);
                }
              }
            });

            break;
          }

          case LIST_CONTACTS_ROLLBACK: {
            if (!action.payload.response) break;
            try {
              const err = await action.payload.response.json();
              const error_message = `Failed to fetch contacts - ${err.err.message}`;
              enhancedAction = {
                ...action,
                error_message,
              };
            } catch (e) {
              console.log(e);
            }
            break;
          }

          // ------------------------------ CREATE CONTACT --------------------------------- //

          case CREATE_CONTACT: {
            // Only handle actions with contact data
            if (action.meta?.offline?.effect?.data) {
              const contactData = action.meta.offline.effect.data;
              const optimisticID = action.meta.optimisticID;

              // Create optimistic contact object
              const optimisticContact: ContactFEO = {
                id: optimisticID,
                ...contactData,
                labels: [],
                group_previews: [],
                permission_previews: [],
                created_at: Date.now(),
                updated_at: Date.now(),
                _optimisticID: optimisticID,
                _syncWarning: `Awaiting Sync. This contact was created offline and will auto-sync with cloud when you are online again. If there are errors, it may need to be recreated. Anything else depending on it may also be affected.`,
                _syncConflict: false,
                _syncSuccess: false,
                _isOptimistic: true,
              };

              // Save to IndexedDB
              await table.put(optimisticContact);

              // Enhance action with optimisticID
              enhancedAction = {
                ...action,
                optimistic: optimisticContact,
              };
            }
            break;
          }

          case CREATE_CONTACT_COMMIT: {
            const optimisticID = action.meta?.optimisticID;
            const realContact = action.payload?.ok?.data;
            if (optimisticID && realContact) {
              await db.transaction("rw", table, async () => {
                // Remove optimistic version
                await table.delete(optimisticID);
                // Add real version
                await table.put({
                  ...realContact,
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

          case CREATE_CONTACT_ROLLBACK: {
            if (!action.payload.response) break;
            try {
              const err = await action.payload.response.json();
              const optimisticID = action.meta?.optimisticID;
              if (optimisticID) {
                const error_message = `Failed to create contact - a sync conflict occurred between your offline local copy & the official cloud record. You may see sync conflicts in other related data. Error message for your request: ${err.err.message}`;
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

          // ------------------------------ UPDATE CONTACT --------------------------------- //

          case UPDATE_CONTACT: {
            // Only handle actions with contact data
            if (action.meta?.offline?.effect?.data) {
              const contactData = action.meta.offline.effect.data;
              const optimisticID = action.meta.optimisticID;

              const cachedContact = await table.get(optimisticID);

              // Create optimistic contact object
              const optimisticContact: ContactFEO = {
                id: contactData.id,
                ...cachedContact,
                ...contactData,
                updated_at: Date.now(),
                _isOptimistic: true,
                _optimisticID: optimisticID,
                _syncWarning: `Awaiting Sync. This contact was edited offline and will auto-sync with cloud when you are online again. If there are errors, it may need to be reverted. Anything else depending on it may also be affected.`,
                _syncConflict: false,
                _syncSuccess: false,
              };

              // Save to IndexedDB
              await table.put(optimisticContact);

              // Enhance action with optimisticID
              enhancedAction = {
                ...action,
                optimistic: optimisticContact,
              };
            }
            break;
          }

          case UPDATE_CONTACT_COMMIT: {
            const optimisticID = action.meta?.optimisticID;
            const realContact = action.payload?.ok?.data;
            if (optimisticID && realContact) {
              await db.transaction("rw", table, async () => {
                // Remove optimistic version
                await table.delete(optimisticID);
                // Add real version
                await table.put({
                  ...realContact,
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

          case UPDATE_CONTACT_ROLLBACK: {
            if (!action.payload.response) break;
            try {
              const err = await action.payload.response.json();
              const optimisticID = action.meta?.optimisticID;
              if (optimisticID) {
                const error_message = `Failed to update contact - a sync conflict occurred between your offline local copy & the official cloud record. You may see sync conflicts in other related data. Error message for your request: ${err.err.message}`;
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

          // ------------------------------ DELETE CONTACT --------------------------------- //

          case DELETE_CONTACT: {
            const optimisticID = action.meta.optimisticID;

            const cachedContact = await table.get(optimisticID);

            if (cachedContact) {
              const optimisticContact: ContactFEO = {
                ...cachedContact,
                id: optimisticID,
                _markedForDeletion: true,
                _syncWarning: `Awaiting Sync. This contact was deleted offline and will auto-sync with cloud when you are online again. If there are errors, it may need to be restored. Anything else depending on it may also be affected.`,
                _syncConflict: false,
                _syncSuccess: false,
                _isOptimistic: true,
                _optimisticID: optimisticID,
              };

              // mark for deletion in indexdb
              // Save to IndexedDB
              await table.put(optimisticContact);

              // Enhance action with optimisticID
              enhancedAction = {
                ...action,
                optimistic: optimisticContact,
              };
            }

            break;
          }

          case DELETE_CONTACT_COMMIT: {
            const optimisticID = action.meta?.optimisticID;
            if (optimisticID) {
              await db.transaction("rw", table, async () => {
                // Remove optimistic version
                await table.delete(optimisticID);
              });
            }
            break;
          }

          case DELETE_CONTACT_ROLLBACK: {
            if (!action.payload.response) break;
            try {
              const err = await action.payload.response.json();
              const optimisticID = action.meta?.optimisticID;
              if (optimisticID) {
                const error_message = `Failed to delete contact - a sync conflict occurred between your offline local copy & the official cloud record. You may see sync conflicts in other related data. Error message for your request: ${err.err.message}`;
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

          case CHECK_CONTACT_TABLE_PERMISSIONS: {
            console.log(
              `Firing checkContactTablePermissionsAction for user`,
              action
            );
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

          case CHECK_CONTACT_TABLE_PERMISSIONS_COMMIT: {
            console.log(
              `Handling CHECK_CONTACT_TABLE_PERMISSIONS_COMMIT`,
              action
            );
            const optimisticID = action.meta?.optimisticID;
            const permissions = action.payload?.ok?.data?.permissions;

            if (permissions) {
              // Save to system permissions table
              const systemPermissionsTable = db.table(
                SYSTEM_PERMISSIONS_DEXIE_TABLE
              );
              await systemPermissionsTable.put({
                id: optimisticID,
                resource_id: "TABLE_CONTACTS",
                granted_to: optimisticID.replace(
                  "contact_table_permissions_",
                  ""
                ),
                granted_by: optimisticID.replace(
                  "contact_table_permissions_",
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
                resource_name: "Contacts Table",
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

          case CHECK_CONTACT_TABLE_PERMISSIONS_ROLLBACK: {
            if (!action.payload.response) break;
            try {
              const err = await action.payload.response.json();
              const optimisticID = action.meta?.optimisticID;
              if (optimisticID) {
                const error_message = `Failed to check contact table permissions - a sync conflict occurred between your offline local copy & the official cloud record. You may see sync conflicts in other related data. Error message for your request: ${err.err.message}`;
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
          `Error in contacts middleware for ${action.type}:`,
          error
        );
        // Continue with the original action if there's an error
        return next(action);
      }
    };
};

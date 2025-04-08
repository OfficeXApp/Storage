// src/redux-offline/contacts/contacts.reducer.ts
import { ContactFE, SystemPermissionType, UserID } from "@officexapp/types";
import {
  CREATE_CONTACT,
  CREATE_CONTACT_COMMIT,
  CREATE_CONTACT_ROLLBACK,
  LIST_CONTACTS,
  LIST_CONTACTS_COMMIT,
  LIST_CONTACTS_ROLLBACK,
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
} from "./contacts.actions";

export const CONTACTS_REDUX_KEY = "contacts";
export const CONTACTS_DEXIE_TABLE = CONTACTS_REDUX_KEY;

export interface ContactFEO extends ContactFE {
  _isOptimistic?: boolean; // flag for optimistic updates
  _optimisticID?: string; // unique ID for optimistic updates
  _syncWarning?: string; // tooltip for users
  _syncConflict?: boolean; // flag for corrupted data due to sync failures
  _syncSuccess?: boolean; // flag for successful sync
  _markedForDeletion?: boolean; // flag for deletion
}

interface ContactsState {
  contacts: ContactFEO[];
  contactMap: Record<UserID, ContactFEO>;
  loading: boolean;
  error: string | null;
  tablePermissions: SystemPermissionType[];
  lastChecked: number;
}

const initialState: ContactsState = {
  contacts: [],
  contactMap: {},
  loading: false,
  error: null,
  tablePermissions: [],
  lastChecked: 0,
};

const updateOrAddContact = (
  contacts: ContactFEO[],
  newContact: ContactFEO,
  identifierKey: keyof ContactFEO = "id"
): ContactFEO[] => {
  const existingIndex = contacts.findIndex(
    (contact) => contact[identifierKey] === newContact[identifierKey]
  );

  if (existingIndex !== -1) {
    // Replace existing contact
    return [
      ...contacts.slice(0, existingIndex),
      newContact,
      ...contacts.slice(existingIndex + 1),
    ];
  } else {
    // Add to the front of the array
    return [newContact, ...contacts];
  }
};

export const contactsReducer = (
  state = initialState,
  action: any
): ContactsState => {
  // console.log(`Now in official reducer`, action, state);
  switch (action.type) {
    // ------------------------------ GET CONTACT --------------------------------- //

    // Get Contact
    case GET_CONTACT: {
      return {
        ...state,
        contacts: updateOrAddContact(state.contacts, action.optimistic),
        contactMap: {
          ...state.contactMap,
          [action.optimistic.id]: action.optimistic,
        },
        loading: true,
        error: null,
      };
    }

    case GET_CONTACT_COMMIT: {
      const optimisticID = action.meta?.optimisticID;
      // Update the optimistic contact with the real data
      return {
        ...state,
        contacts: state.contacts.map((contact) => {
          if (contact._optimisticID === optimisticID) {
            return action.payload.ok.data;
          }
          return contact;
        }),
        contactMap: {
          ...state.contactMap,
          [action.payload.ok.data.id]: action.payload.ok.data,
        },
        loading: false,
      };
    }

    case GET_CONTACT_ROLLBACK: {
      if (!action.payload.response) return state;
      // Update the optimistic contact with the error message
      const newContactMap = { ...state.contactMap };
      delete newContactMap[action.meta.optimisticID];
      return {
        ...state,
        contacts: state.contacts.map((contact) => {
          if (contact._optimisticID === action.meta.optimisticID) {
            return {
              ...contact,
              _syncWarning: action.error_message,
              _syncSuccess: false,
              _syncConflict: true,
              _isOptimistic: false,
            };
          }
          return contact;
        }),
        contactMap: newContactMap,
        loading: false,
        error: action.payload.message || "Failed to fetch contact",
      };
    }

    // ------------------------------ LIST CONTACTS --------------------------------- //

    case LIST_CONTACTS: {
      return {
        ...state,
        contacts: action.optimistic || [],
        loading: true,
        error: null,
      };
    }

    case LIST_CONTACTS_COMMIT: {
      return {
        ...state,
        contacts: action.payload.ok.data.items.reduce(
          (acc: ContactFEO[], item: ContactFEO) =>
            updateOrAddContact(acc, item),
          state.contacts
        ),
        contactMap: action.payload.ok.data.items.reduce(
          (acc: Record<UserID, ContactFEO>, item: ContactFEO) => {
            acc[item.id] = item;
            return acc;
          },
          state.contactMap
        ),
        loading: false,
        lastChecked: Date.now(),
      };
    }

    case LIST_CONTACTS_ROLLBACK: {
      if (!action.payload.response) return state;
      return {
        ...state,
        loading: false,
        error: action.error_message || "Failed to fetch contacts",
      };
    }

    // ------------------------------ CREATE CONTACT --------------------------------- //

    case CREATE_CONTACT: {
      const optimisticContact = action.optimistic;
      return {
        ...state,
        contacts: updateOrAddContact(
          state.contacts,
          optimisticContact,
          "_optimisticID"
        ),
        loading: true,
        error: null,
      };
    }

    case CREATE_CONTACT_COMMIT: {
      const optimisticID = action.meta?.optimisticID;
      // Remove the optimistic contact from our items array & indexdb
      const newContact = {
        ...action.payload.ok.data,
        _syncSuccess: true,
        _syncConflict: false,
        _syncWarning: "",
        _isOptimistic: false,
      };
      const filteredContacts = state.contacts.filter(
        (contact) => contact._optimisticID !== optimisticID
      );
      // removal from dexie is already handled in optimistic middleware which can handle async, whereas reducers are pure sync functions
      return {
        ...state,
        // Add the newly created contact to our items array
        contacts: updateOrAddContact(filteredContacts, newContact),
        contactMap: {
          ...state.contactMap,
          [newContact.id]: newContact,
        },
        loading: false,
      };
    }

    case CREATE_CONTACT_ROLLBACK: {
      if (!action.payload.response) return state;
      // Add a sync warning to the optimistic contact
      const newReduxContacts = state.contacts.map((contact) => {
        if (contact._optimisticID === action.meta.optimisticID) {
          return {
            ...contact,
            _syncWarning: action.error_message,
            _syncSuccess: false,
            _syncConflict: true,
            _isOptimistic: false,
          };
        }
        return contact;
      });
      // removal from dexie is already handled in optimistic middleware which can handle async, whereas reducers are pure sync functions
      return {
        ...state,
        contacts: newReduxContacts,
        loading: false,
        error: action.payload.message || "Failed to create contact",
      };
    }

    // ------------------------------ UPDATE CONTACT --------------------------------- //

    case UPDATE_CONTACT: {
      const optimisticContact = action.optimistic;
      return {
        ...state,
        contacts: updateOrAddContact(state.contacts, optimisticContact),
        loading: true,
        error: null,
      };
    }

    case UPDATE_CONTACT_COMMIT: {
      const optimisticID = action.meta?.optimisticID;
      // Update the optimistic contact with the real data
      return {
        ...state,
        contacts: state.contacts.map((contact) => {
          if (contact._optimisticID === optimisticID) {
            return {
              ...contact,
              ...action.payload.ok.data,
              _syncSuccess: true,
              _syncConflict: false,
              _syncWarning: "",
              _isOptimistic: false,
            };
          }
          return contact;
        }),
        loading: false,
      };
    }

    case UPDATE_CONTACT_ROLLBACK: {
      if (!action.payload.response) return state;
      // Update the optimistic contact with the error message
      return {
        ...state,
        contacts: state.contacts.map((contact) => {
          if (contact._optimisticID === action.meta.optimisticID) {
            return {
              ...contact,
              _syncWarning: action.error_message,
              _syncSuccess: false,
              _syncConflict: true,
              _isOptimistic: false,
            };
          }
          return contact;
        }),
        loading: false,
        error: action.payload.message || "Failed to update contact",
      };
    }

    // ------------------------------ DELETE CONTACT --------------------------------- //

    case DELETE_CONTACT: {
      const optimisticContact = action.optimistic;
      return {
        ...state,
        contacts: updateOrAddContact(state.contacts, optimisticContact),
        loading: true,
        error: null,
      };
    }

    case DELETE_CONTACT_COMMIT: {
      const optimisticID = action.meta?.optimisticID;
      // Update the optimistic contact with the real data
      return {
        ...state,
        contacts: state.contacts.filter(
          (contact) => contact._optimisticID !== optimisticID
        ),
        loading: false,
      };
    }

    case DELETE_CONTACT_ROLLBACK: {
      if (!action.payload.response) return state;
      // Update the optimistic contact with the error message
      return {
        ...state,
        contacts: state.contacts.map((contact) => {
          if (contact._optimisticID === action.meta.optimisticID) {
            return {
              ...contact,
              _syncWarning: action.error_message,
              _syncSuccess: false,
              _syncConflict: true,
              _isOptimistic: false,
            };
          }
          return contact;
        }),
        loading: false,
        error: action.payload.message || "Failed to delete contact",
      };
    }

    // ------------------------------ CHECK CONTACT TABLE PERMISSIONS --------------------------------- //

    case CHECK_CONTACT_TABLE_PERMISSIONS: {
      console.log(`Firing checkContactTablePermissionsAction for user`, action);
      const permission_types = action.optimistic?.permission_types || [];
      return {
        ...state,
        loading: true,
        error: null,
        tablePermissions: permission_types,
      };
    }

    case CHECK_CONTACT_TABLE_PERMISSIONS_COMMIT: {
      return {
        ...state,
        loading: false,
        tablePermissions: action.payload.ok.data.permissions,
      };
    }

    case CHECK_CONTACT_TABLE_PERMISSIONS_ROLLBACK: {
      return {
        ...state,
        loading: false,
        error:
          action.payload.message || "Failed to check contact table permissions",
      };
    }

    default:
      return state;
  }
};

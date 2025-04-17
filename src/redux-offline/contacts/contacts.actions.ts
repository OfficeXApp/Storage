// src/redux-offline/contacts.actions.ts

import {
  UserID,
  GenerateID,
  IRequestGetContact,
  IRequestListContacts,
  IRequestCreateContact,
  IRequestUpdateContact,
  IRequestDeleteContact,
  IRequestRedeemContact,
  ContactFE,
} from "@officexapp/types";

export const GET_CONTACT = "GET_CONTACT";
export const GET_CONTACT_COMMIT = "GET_CONTACT_COMMIT";
export const GET_CONTACT_ROLLBACK = "GET_CONTACT_ROLLBACK";

export const LIST_CONTACTS = "LIST_CONTACTS";
export const LIST_CONTACTS_COMMIT = "LIST_CONTACTS_COMMIT";
export const LIST_CONTACTS_ROLLBACK = "LIST_CONTACTS_ROLLBACK";

export const CREATE_CONTACT = "CREATE_CONTACT";
export const CREATE_CONTACT_COMMIT = "CREATE_CONTACT_COMMIT";
export const CREATE_CONTACT_ROLLBACK = "CREATE_CONTACT_ROLLBACK";

export const UPDATE_CONTACT = "UPDATE_CONTACT";
export const UPDATE_CONTACT_COMMIT = "UPDATE_CONTACT_COMMIT";
export const UPDATE_CONTACT_ROLLBACK = "UPDATE_CONTACT_ROLLBACK";

export const DELETE_CONTACT = "DELETE_CONTACT";
export const DELETE_CONTACT_COMMIT = "DELETE_CONTACT_COMMIT";
export const DELETE_CONTACT_ROLLBACK = "DELETE_CONTACT_ROLLBACK";

export const REDEEM_CONTACT = "REDEEM_CONTACT";
export const REDEEM_CONTACT_COMMIT = "REDEEM_CONTACT_COMMIT";
export const REDEEM_CONTACT_ROLLBACK = "REDEEM_CONTACT_ROLLBACK";

export const CHECK_CONTACT_TABLE_PERMISSIONS =
  "CHECK_CONTACT_TABLE_PERMISSIONS";

export const CHECK_CONTACT_TABLE_PERMISSIONS_COMMIT =
  "CHECK_CONTACT_TABLE_PERMISSIONS_COMMIT";

export const CHECK_CONTACT_TABLE_PERMISSIONS_ROLLBACK =
  "CHECK_CONTACT_TABLE_PERMISSIONS_ROLLBACK";

// Get Contact
export const getContactAction = (contact_id: UserID) => ({
  type: GET_CONTACT,
  meta: {
    optimisticID: contact_id,
    offline: {
      // Define the effect (the API call to make)
      effect: {
        url: `/contacts/get/${contact_id}`,
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          // Authorization: `Bearer HANDLED_BY_OFFLINE_EFFECT_MIDDLEWARE`,
        },
        data: {},
      },
      // Action to dispatch on success
      commit: { type: GET_CONTACT_COMMIT },
      // Action to dispatch on failure
      rollback: { type: GET_CONTACT_ROLLBACK },
    },
  },
});

// List Contacts
export const listContactsAction = (payload: IRequestListContacts) => ({
  type: LIST_CONTACTS,
  meta: {
    offline: {
      // Define the effect (the API call to make)
      effect: {
        url: `/contacts/list`,
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          // Authorization: `Bearer HANDLED_BY_OFFLINE_EFFECT_MIDDLEWARE`,
        },
        data: payload,
      },
      // Action to dispatch on success
      commit: { type: LIST_CONTACTS_COMMIT },
      // Action to dispatch on failure
      rollback: { type: LIST_CONTACTS_ROLLBACK },
    },
  },
});

// Create Contact
export const createContactAction = (contactData: IRequestCreateContact) => {
  const id = contactData.id || GenerateID.User(contactData.icp_principal);
  const payload = {
    ...contactData,
    id,
  };
  return {
    type: CREATE_CONTACT,
    meta: {
      optimisticID: id,
      offline: {
        effect: {
          url: `/contacts/create`,
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            // Authorization: `Bearer HANDLED_BY_OFFLINE_EFFECT_MIDDLEWARE`,
          },
          data: payload,
        },
        // Action to dispatch on success
        commit: { type: CREATE_CONTACT_COMMIT, meta: { optimisticID: id } },
        // Action to dispatch on failure
        rollback: { type: CREATE_CONTACT_ROLLBACK, meta: { optimisticID: id } },
      },
    },
  };
};

// Update Contact
export const updateContactAction = (contactData: IRequestUpdateContact) => {
  const id = contactData.id;
  const payload = {
    ...contactData,
  };
  return {
    type: UPDATE_CONTACT,
    meta: {
      optimisticID: id,
      offline: {
        effect: {
          url: `/contacts/update`,
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            // Authorization: `Bearer HANDLED_BY_OFFLINE_EFFECT_MIDDLEWARE`,
          },
          data: payload,
        },
        // Action to dispatch on success
        commit: { type: UPDATE_CONTACT_COMMIT, meta: { optimisticID: id } },
        // Action to dispatch on failure
        rollback: { type: UPDATE_CONTACT_ROLLBACK, meta: { optimisticID: id } },
      },
    },
  };
};

// Delete Contact
export const deleteContactAction = (payload: IRequestDeleteContact) => {
  const id = payload.id;
  return {
    type: DELETE_CONTACT,
    meta: {
      optimisticID: id,
      offline: {
        effect: {
          url: `/contacts/delete`,
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            // Authorization: `Bearer HANDLED_BY_OFFLINE_EFFECT_MIDDLEWARE`,
          },
          data: payload,
        },
        // Action to dispatch on success
        commit: { type: DELETE_CONTACT_COMMIT, meta: { optimisticID: id } },
        // Action to dispatch on failure
        rollback: {
          type: DELETE_CONTACT_ROLLBACK,
          meta: { optimisticID: id },
        },
      },
    },
  };
};

// Redeem Contact
export const redeemContactAction = (payload: IRequestRedeemContact) => {
  const id = payload.new_user_id;
  return {
    type: REDEEM_CONTACT,
    meta: {
      optimisticID: id,
      offline: {
        effect: {
          url: `/contacts/redeem`,
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            // Authorization: `Bearer HANDLED_BY_OFFLINE_EFFECT_MIDDLEWARE`,
          },
          data: payload,
        },
        // Action to dispatch on success
        commit: { type: REDEEM_CONTACT_COMMIT, meta: { optimisticID: id } },
        // Action to dispatch on failure
        rollback: {
          type: REDEEM_CONTACT_ROLLBACK,
          meta: { optimisticID: id },
        },
      },
    },
  };
};

// Check Contact Table Permissions
export const checkContactTablePermissionsAction = (userID: UserID) => {
  const id = `contact_table_permissions_${userID}`;

  const payload = {
    resource_id: "TABLE_CONTACTS",
    grantee_id: userID,
  };

  return {
    type: CHECK_CONTACT_TABLE_PERMISSIONS,
    meta: {
      optimisticID: id,
      offline: {
        effect: {
          url: `/permissions/system/check`,
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            // Authorization: `Bearer HANDLED_BY_OFFLINE_EFFECT_MIDDLEWARE`,
          },
          data: payload,
        },
        // Action to dispatch on success
        commit: {
          type: CHECK_CONTACT_TABLE_PERMISSIONS_COMMIT,
          meta: { optimisticID: id },
        },
        // Action to dispatch on failure
        rollback: {
          type: CHECK_CONTACT_TABLE_PERMISSIONS_ROLLBACK,
          meta: { optimisticID: id },
        },
      },
    },
  };
};

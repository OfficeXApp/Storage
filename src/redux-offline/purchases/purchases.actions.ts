// src/redux-offline/purchases/purchases.actions.ts

import {
  PurchaseID,
  IRequestCreatePurchase,
  IRequestDeletePurchase,
  IRequestListPurchases,
  IRequestUpdatePurchase,
  UserID,
} from "@officexapp/types";
import { GenerateID } from "@officexapp/types"; // Assuming GenerateID is available

export const GET_PURCHASE = "GET_PURCHASE";
export const GET_PURCHASE_COMMIT = "GET_PURCHASE_COMMIT";
export const GET_PURCHASE_ROLLBACK = "GET_PURCHASE_ROLLBACK";

export const LIST_PURCHASES = "LIST_PURCHASES";
export const LIST_PURCHASES_COMMIT = "LIST_PURCHASES_COMMIT";
export const LIST_PURCHASES_ROLLBACK = "LIST_PURCHASES_ROLLBACK";

export const CREATE_PURCHASE = "CREATE_PURCHASE";
export const CREATE_PURCHASE_COMMIT = "CREATE_PURCHASE_COMMIT";
export const CREATE_PURCHASE_ROLLBACK = "CREATE_PURCHASE_ROLLBACK";

export const UPDATE_PURCHASE = "UPDATE_PURCHASE";
export const UPDATE_PURCHASE_COMMIT = "UPDATE_PURCHASE_COMMIT";
export const UPDATE_PURCHASE_ROLLBACK = "UPDATE_PURCHASE_ROLLBACK";

export const DELETE_PURCHASE = "DELETE_PURCHASE";
export const DELETE_PURCHASE_COMMIT = "DELETE_PURCHASE_COMMIT";
export const DELETE_PURCHASE_ROLLBACK = "DELETE_PURCHASE_ROLLBACK";

export const CHECK_PURCHASES_TABLE_PERMISSIONS =
  "CHECK_PURCHASES_TABLE_PERMISSIONS";
export const CHECK_PURCHASES_TABLE_PERMISSIONS_COMMIT =
  "CHECK_PURCHASES_TABLE_PERMISSIONS_COMMIT";
export const CHECK_PURCHASES_TABLE_PERMISSIONS_ROLLBACK =
  "CHECK_PURCHASES_TABLE_PERMISSIONS_ROLLBACK";

// Get Purchase
export const getPurchaseAction = (id: PurchaseID) => ({
  type: GET_PURCHASE,
  meta: {
    optimisticID: id,
    offline: {
      // Define the effect (the API call to make)
      effect: {
        url: `/purchases/get/${id}`,
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          // Authorization: `Bearer HANDLED_BY_OFFLINE_EFFECT_MIDDLEWARE`,
        },
        data: {},
      },
      // Action to dispatch on success
      commit: { type: GET_PURCHASE_COMMIT },
      // Action to dispatch on failure
      rollback: { type: GET_PURCHASE_ROLLBACK },
      discard: (error: any, _action: any, _retries: number) => {
        console.log("redux-offline discard error:", error);
        const { response } = error;
        // Don't retry on 4xx client errors
        return response && response.status >= 400 && response.status < 500;
      },
    },
  },
});

// List Purchases
export const listPurchasesAction = (payload: IRequestListPurchases) => ({
  type: LIST_PURCHASES,
  meta: {
    offline: {
      // Define the effect (the API call to make)
      effect: {
        url: `/purchases/list`,
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          // Authorization: `Bearer HANDLED_BY_OFFLINE_EFFECT_MIDDLEWARE`,
        },
        data: payload,
      },
      // Action to dispatch on success
      commit: { type: LIST_PURCHASES_COMMIT },
      // Action to dispatch on failure
      rollback: { type: LIST_PURCHASES_ROLLBACK },
      discard: (error: any, _action: any, _retries: number) => {
        console.log("redux-offline discard error:", error);
        const { response } = error;
        // Don't retry on 4xx client errors
        return response && response.status >= 400 && response.status < 500;
      },
    },
  },
});

// Create Purchase
export const createPurchaseAction = (purchaseData: IRequestCreatePurchase) => {
  const id = purchaseData.id || GenerateID.PurchaseID(); // Use provided ID or generate
  const payload = {
    ...purchaseData,
    id,
  };
  return {
    type: CREATE_PURCHASE,
    meta: {
      optimisticID: id,
      offline: {
        effect: {
          url: `/purchases/create`,
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            // Authorization: `Bearer HANDLED_BY_OFFLINE_EFFECT_MIDDLEWARE`,
          },
          data: payload,
        },
        // Action to dispatch on success
        commit: { type: CREATE_PURCHASE_COMMIT, meta: { optimisticID: id } },
        // Action to dispatch on failure
        rollback: {
          type: CREATE_PURCHASE_ROLLBACK,
          meta: { optimisticID: id },
        },
        discard: (error: any, _action: any, _retries: number) => {
          console.log("redux-offline discard error:", error);
          const { response } = error;
          // Don't retry on 4xx client errors
          return response && response.status >= 400 && response.status < 500;
        },
      },
    },
  };
};

// Update Purchase
export const updatePurchaseAction = (purchaseData: IRequestUpdatePurchase) => {
  const id = purchaseData.id;
  const payload = {
    ...purchaseData,
  };
  return {
    type: UPDATE_PURCHASE,
    meta: {
      optimisticID: id,
      offline: {
        effect: {
          url: `/purchases/update`,
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            // Authorization: `Bearer HANDLED_BY_OFFLINE_EFFECT_MIDDLEWARE`,
          },
          data: payload,
        },
        // Action to dispatch on success
        commit: { type: UPDATE_PURCHASE_COMMIT, meta: { optimisticID: id } },
        // Action to dispatch on failure
        rollback: {
          type: UPDATE_PURCHASE_ROLLBACK,
          meta: { optimisticID: id },
        },
        discard: (error: any, _action: any, _retries: number) => {
          console.log("redux-offline discard error:", error);
          const { response } = error;
          // Don't retry on 4xx client errors
          return response && response.status >= 400 && response.status < 500;
        },
      },
    },
  };
};

// Delete Purchase
export const deletePurchaseAction = (payload: IRequestDeletePurchase) => {
  const id = payload.id;
  return {
    type: DELETE_PURCHASE,
    meta: {
      optimisticID: id,
      offline: {
        effect: {
          url: `/purchases/delete`,
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            // Authorization: `Bearer HANDLED_BY_OFFLINE_EFFECT_MIDDLEWARE`,
          },
          data: payload,
        },
        // Action to dispatch on success
        commit: { type: DELETE_PURCHASE_COMMIT, meta: { optimisticID: id } },
        // Action to dispatch on failure
        rollback: {
          type: DELETE_PURCHASE_ROLLBACK,
          meta: { optimisticID: id },
        },
        discard: (error: any, _action: any, _retries: number) => {
          console.log("redux-offline discard error:", error);
          const { response } = error;
          // Don't retry on 4xx client errors
          return response && response.status >= 400 && response.status < 500;
        },
      },
    },
  };
};

// Check Purchases Table Permissions
export const checkPurchasesTablePermissionsAction = (userID: UserID) => {
  const id = `purchases_table_permissions_${userID}`;

  const payload = {
    resource_id: "TABLE_PURCHASES", // Ensure this matches your SystemTableValueEnum
    grantee_id: userID,
  };

  return {
    type: CHECK_PURCHASES_TABLE_PERMISSIONS,
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
          type: CHECK_PURCHASES_TABLE_PERMISSIONS_COMMIT,
          meta: { optimisticID: id },
        },
        // Action to dispatch on failure
        rollback: {
          type: CHECK_PURCHASES_TABLE_PERMISSIONS_ROLLBACK,
          meta: { optimisticID: id },
        },
        discard: (error: any, _action: any, _retries: number) => {
          console.log("redux-offline discard error:", error);
          const { response } = error;
          // Don't retry on 4xx client errors
          return response && response.status >= 400 && response.status < 500;
        },
      },
    },
  };
};

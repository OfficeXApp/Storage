import {
  WebhookID,
  GenerateID,
  IRequestGetWebhook,
  IRequestListWebhooks,
  IRequestCreateWebhook,
  IRequestUpdateWebhook,
  IRequestDeleteWebhook,
  WebhookFE,
  UserID,
} from "@officexapp/types";

export const GET_WEBHOOK = "GET_WEBHOOK";
export const GET_WEBHOOK_COMMIT = "GET_WEBHOOK_COMMIT";
export const GET_WEBHOOK_ROLLBACK = "GET_WEBHOOK_ROLLBACK";

export const LIST_WEBHOOKS = "LIST_WEBHOOKS";
export const LIST_WEBHOOKS_COMMIT = "LIST_WEBHOOKS_COMMIT";
export const LIST_WEBHOOKS_ROLLBACK = "LIST_WEBHOOKS_ROLLBACK";

export const CREATE_WEBHOOK = "CREATE_WEBHOOK";
export const CREATE_WEBHOOK_COMMIT = "CREATE_WEBHOOK_COMMIT";
export const CREATE_WEBHOOK_ROLLBACK = "CREATE_WEBHOOK_ROLLBACK";

export const UPDATE_WEBHOOK = "UPDATE_WEBHOOK";
export const UPDATE_WEBHOOK_COMMIT = "UPDATE_WEBHOOK_COMMIT";
export const UPDATE_WEBHOOK_ROLLBACK = "UPDATE_WEBHOOK_ROLLBACK";

export const DELETE_WEBHOOK = "DELETE_WEBHOOK";
export const DELETE_WEBHOOK_COMMIT = "DELETE_WEBHOOK_COMMIT";
export const DELETE_WEBHOOK_ROLLBACK = "DELETE_WEBHOOK_ROLLBACK";

export const CHECK_WEBHOOK_TABLE_PERMISSIONS =
  "CHECK_WEBHOOK_TABLE_PERMISSIONS";
export const CHECK_WEBHOOK_TABLE_PERMISSIONS_COMMIT =
  "CHECK_WEBHOOK_TABLE_PERMISSIONS_COMMIT";
export const CHECK_WEBHOOK_TABLE_PERMISSIONS_ROLLBACK =
  "CHECK_WEBHOOK_TABLE_PERMISSIONS_ROLLBACK";

// Get Webhook
export const getWebhookAction = (webhook_id: WebhookID) => ({
  type: GET_WEBHOOK,
  meta: {
    optimisticID: webhook_id,
    offline: {
      // Define the effect (the API call to make)
      effect: {
        url: `/webhooks/get/${webhook_id}`,
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          // Authorization: `Bearer HANDLED_BY_OFFLINE_EFFECT_MIDDLEWARE`,
        },
        data: {},
      },
      // Action to dispatch on success
      commit: { type: GET_WEBHOOK_COMMIT },
      // Action to dispatch on failure
      rollback: { type: GET_WEBHOOK_ROLLBACK },
    },
  },
});

// List Webhooks
export const listWebhooksAction = (payload: IRequestListWebhooks) => ({
  type: LIST_WEBHOOKS,
  meta: {
    offline: {
      // Define the effect (the API call to make)
      effect: {
        url: `/webhooks/list`,
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          // Authorization: `Bearer HANDLED_BY_OFFLINE_EFFECT_MIDDLEWARE`,
        },
        data: payload,
      },
      // Action to dispatch on success
      commit: { type: LIST_WEBHOOKS_COMMIT },
      // Action to dispatch on failure
      rollback: { type: LIST_WEBHOOKS_ROLLBACK },
    },
  },
});

// Create Webhook
export const createWebhookAction = (webhookData: IRequestCreateWebhook) => {
  const id = webhookData.id || GenerateID.Webhook();
  const payload = {
    ...webhookData,
    id,
  };
  return {
    type: CREATE_WEBHOOK,
    meta: {
      optimisticID: id,
      offline: {
        effect: {
          url: `/webhooks/create`,
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            // Authorization: `Bearer HANDLED_BY_OFFLINE_EFFECT_MIDDLEWARE`,
          },
          data: payload,
        },
        // Action to dispatch on success
        commit: { type: CREATE_WEBHOOK_COMMIT, meta: { optimisticID: id } },
        // Action to dispatch on failure
        rollback: { type: CREATE_WEBHOOK_ROLLBACK, meta: { optimisticID: id } },
      },
    },
  };
};

// Update Webhook
export const updateWebhookAction = (webhookData: IRequestUpdateWebhook) => {
  const id = webhookData.id;
  const payload = {
    ...webhookData,
  };
  return {
    type: UPDATE_WEBHOOK,
    meta: {
      optimisticID: id,
      offline: {
        effect: {
          url: `/webhooks/update`,
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            // Authorization: `Bearer HANDLED_BY_OFFLINE_EFFECT_MIDDLEWARE`,
          },
          data: payload,
        },
        // Action to dispatch on success
        commit: { type: UPDATE_WEBHOOK_COMMIT, meta: { optimisticID: id } },
        // Action to dispatch on failure
        rollback: { type: UPDATE_WEBHOOK_ROLLBACK, meta: { optimisticID: id } },
      },
    },
  };
};

// Delete Webhook
export const deleteWebhookAction = (payload: IRequestDeleteWebhook) => {
  const id = payload.id;
  return {
    type: DELETE_WEBHOOK,
    meta: {
      optimisticID: id,
      offline: {
        effect: {
          url: `/webhooks/delete`,
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            // Authorization: `Bearer HANDLED_BY_OFFLINE_EFFECT_MIDDLEWARE`,
          },
          data: payload,
        },
        // Action to dispatch on success
        commit: { type: DELETE_WEBHOOK_COMMIT, meta: { optimisticID: id } },
        // Action to dispatch on failure
        rollback: {
          type: DELETE_WEBHOOK_ROLLBACK,
          meta: { optimisticID: id },
        },
      },
    },
  };
};

// Check Webhook Table Permissions
export const checkWebhookTablePermissionsAction = (userID: UserID) => {
  const id = `webhook_table_permissions_${userID}`;

  const payload = {
    resource_id: "TABLE_WEBHOOKS",
    grantee_id: userID,
  };

  return {
    type: CHECK_WEBHOOK_TABLE_PERMISSIONS,
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
          type: CHECK_WEBHOOK_TABLE_PERMISSIONS_COMMIT,
          meta: { optimisticID: id },
        },
        // Action to dispatch on failure
        rollback: {
          type: CHECK_WEBHOOK_TABLE_PERMISSIONS_ROLLBACK,
          meta: { optimisticID: id },
        },
      },
    },
  };
};

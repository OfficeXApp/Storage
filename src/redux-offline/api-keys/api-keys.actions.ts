import {
  ApiKeyID,
  GenerateID,
  IRequestGetApiKey,
  IRequestListApiKeys,
  IRequestCreateApiKey,
  IRequestUpdateApiKey,
  IRequestDeleteApiKey,
  ApiKeyFE,
  UserID,
} from "@officexapp/types";

export const GET_APIKEY = "GET_APIKEY";
export const GET_APIKEY_COMMIT = "GET_APIKEY_COMMIT";
export const GET_APIKEY_ROLLBACK = "GET_APIKEY_ROLLBACK";

export const LIST_APIKEYS = "LIST_APIKEYS";
export const LIST_APIKEYS_COMMIT = "LIST_APIKEYS_COMMIT";
export const LIST_APIKEYS_ROLLBACK = "LIST_APIKEYS_ROLLBACK";

export const CREATE_APIKEY = "CREATE_APIKEY";
export const CREATE_APIKEY_COMMIT = "CREATE_APIKEY_COMMIT";
export const CREATE_APIKEY_ROLLBACK = "CREATE_APIKEY_ROLLBACK";

export const UPDATE_APIKEY = "UPDATE_APIKEY";
export const UPDATE_APIKEY_COMMIT = "UPDATE_APIKEY_COMMIT";
export const UPDATE_APIKEY_ROLLBACK = "UPDATE_APIKEY_ROLLBACK";

export const DELETE_APIKEY = "DELETE_APIKEY";
export const DELETE_APIKEY_COMMIT = "DELETE_APIKEY_COMMIT";
export const DELETE_APIKEY_ROLLBACK = "DELETE_APIKEY_ROLLBACK";

// Get API Key
export const getApiKeyAction = (api_key_id: ApiKeyID) => ({
  type: GET_APIKEY,
  meta: {
    optimisticID: api_key_id,
    offline: {
      // Define the effect (the API call to make)
      effect: {
        url: `/api_keys/get/${api_key_id}`,
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          // Authorization: `Bearer HANDLED_BY_OFFLINE_EFFECT_MIDDLEWARE`,
        },
        data: {},
      },
      // Action to dispatch on success
      commit: { type: GET_APIKEY_COMMIT },
      // Action to dispatch on failure
      rollback: { type: GET_APIKEY_ROLLBACK },
    },
  },
});

// List API Keys
export const listApiKeysAction = (user_id: UserID) => ({
  type: LIST_APIKEYS,
  meta: {
    offline: {
      // Define the effect (the API call to make)
      effect: {
        url: `/api_keys/list/${user_id}`,
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          // Authorization: `Bearer HANDLED_BY_OFFLINE_EFFECT_MIDDLEWARE`,
        },
        data: {},
      },
      // Action to dispatch on success
      commit: { type: LIST_APIKEYS_COMMIT },
      // Action to dispatch on failure
      rollback: { type: LIST_APIKEYS_ROLLBACK },
    },
  },
});

// Create API Key
export const createApiKeyAction = (apiKeyData: IRequestCreateApiKey) => {
  const id = apiKeyData.id || GenerateID.ApiKey();
  const payload = {
    ...apiKeyData,
    id,
  };
  return {
    type: CREATE_APIKEY,
    meta: {
      optimisticID: id,
      offline: {
        effect: {
          url: `/api_keys/create`,
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            // Authorization: `Bearer HANDLED_BY_OFFLINE_EFFECT_MIDDLEWARE`,
          },
          data: payload,
        },
        // Action to dispatch on success
        commit: { type: CREATE_APIKEY_COMMIT, meta: { optimisticID: id } },
        // Action to dispatch on failure
        rollback: { type: CREATE_APIKEY_ROLLBACK, meta: { optimisticID: id } },
      },
    },
  };
};

// Update API Key
export const updateApiKeyAction = (apiKeyData: IRequestUpdateApiKey) => {
  const id = apiKeyData.id;
  const payload = {
    ...apiKeyData,
  };
  return {
    type: UPDATE_APIKEY,
    meta: {
      optimisticID: id,
      offline: {
        effect: {
          url: `/api_keys/update`,
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            // Authorization: `Bearer HANDLED_BY_OFFLINE_EFFECT_MIDDLEWARE`,
          },
          data: payload,
        },
        // Action to dispatch on success
        commit: { type: UPDATE_APIKEY_COMMIT, meta: { optimisticID: id } },
        // Action to dispatch on failure
        rollback: { type: UPDATE_APIKEY_ROLLBACK, meta: { optimisticID: id } },
      },
    },
  };
};

// Delete API Key
export const deleteApiKeyAction = (payload: IRequestDeleteApiKey) => {
  const id = payload.id;
  return {
    type: DELETE_APIKEY,
    meta: {
      optimisticID: id,
      offline: {
        effect: {
          url: `/api_keys/delete`,
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            // Authorization: `Bearer HANDLED_BY_OFFLINE_EFFECT_MIDDLEWARE`,
          },
          data: payload,
        },
        // Action to dispatch on success
        commit: { type: DELETE_APIKEY_COMMIT, meta: { optimisticID: id } },
        // Action to dispatch on failure
        rollback: {
          type: DELETE_APIKEY_ROLLBACK,
          meta: { optimisticID: id },
        },
      },
    },
  };
};

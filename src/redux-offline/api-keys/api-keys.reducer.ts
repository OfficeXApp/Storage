import { ApiKeyFE, ApiKeyID, SystemPermissionType } from "@officexapp/types";
import {
  CREATE_APIKEY,
  CREATE_APIKEY_COMMIT,
  CREATE_APIKEY_ROLLBACK,
  LIST_APIKEYS,
  LIST_APIKEYS_COMMIT,
  LIST_APIKEYS_ROLLBACK,
  GET_APIKEY,
  GET_APIKEY_COMMIT,
  GET_APIKEY_ROLLBACK,
  UPDATE_APIKEY,
  UPDATE_APIKEY_COMMIT,
  UPDATE_APIKEY_ROLLBACK,
  DELETE_APIKEY,
  DELETE_APIKEY_COMMIT,
  DELETE_APIKEY_ROLLBACK,
  CHECK_API_KEY_TABLE_PERMISSIONS,
  CHECK_API_KEY_TABLE_PERMISSIONS_COMMIT,
  CHECK_API_KEY_TABLE_PERMISSIONS_ROLLBACK,
} from "./api-keys.actions";

export const APIKEYS_REDUX_KEY = "apikeys";
export const APIKEYS_DEXIE_TABLE = APIKEYS_REDUX_KEY;

export interface ApiKeyFEO extends ApiKeyFE {
  _isOptimistic?: boolean; // flag for optimistic updates
  _optimisticID?: string; // unique ID for optimistic updates
  _syncWarning?: string; // tooltip for users
  _syncConflict?: boolean; // flag for corrupted data due to sync failures
  _syncSuccess?: boolean; // flag for successful sync
  _markedForDeletion?: boolean; // flag for deletion
}

interface ApiKeysState {
  apikeys: ApiKeyFEO[];
  apikeyMap: Record<ApiKeyID, ApiKeyFEO>;
  loading: boolean;
  error: string | null;
  tablePermissions: SystemPermissionType[];
  lastChecked: number;
}

const initialState: ApiKeysState = {
  apikeys: [],
  apikeyMap: {},
  loading: false,
  error: null,
  tablePermissions: [],
  lastChecked: 0,
};

const updateOrAddApiKey = (
  apikeys: ApiKeyFEO[],
  newApiKey: ApiKeyFEO,
  identifierKey: keyof ApiKeyFEO = "id"
): ApiKeyFEO[] => {
  const existingIndex = apikeys.findIndex(
    (apikey) => apikey[identifierKey] === newApiKey[identifierKey]
  );

  if (existingIndex !== -1) {
    // Replace existing apikey
    return [
      ...apikeys.slice(0, existingIndex),
      newApiKey,
      ...apikeys.slice(existingIndex + 1),
    ];
  } else {
    // Add to the front of the array
    return [newApiKey, ...apikeys];
  }
};

export const apiKeysReducer = (
  state = initialState,
  action: any
): ApiKeysState => {
  switch (action.type) {
    // ------------------------------ GET API KEY --------------------------------- //

    case GET_APIKEY: {
      if (!action.optimistic) return { ...state, loading: true, error: null };

      return {
        ...state,
        apikeys: updateOrAddApiKey(state.apikeys, action.optimistic),
        apikeyMap: {
          ...state.apikeyMap,
          [action.optimistic.id]: action.optimistic,
        },
        loading: true,
        error: null,
      };
    }

    case GET_APIKEY_COMMIT: {
      const optimisticID = action.meta?.optimisticID;
      const apiKeyData = action.payload?.ok?.data;

      if (!apiKeyData) return { ...state, loading: false };

      // Update the optimistic apikey with the real data
      return {
        ...state,
        apikeys: state.apikeys.map((apikey) => {
          if (apikey._optimisticID === optimisticID) {
            return apiKeyData;
          }
          return apikey;
        }),
        apikeyMap: {
          ...state.apikeyMap,
          [apiKeyData.id]: apiKeyData,
        },
        loading: false,
      };
    }

    case GET_APIKEY_ROLLBACK: {
      if (!action.payload.response) return state;
      // Update the optimistic apikey with the error message
      const newApiKeyMap = { ...state.apikeyMap };
      delete newApiKeyMap[action.meta.optimisticID];
      return {
        ...state,
        apikeys: state.apikeys.map((apikey) => {
          if (apikey._optimisticID === action.meta.optimisticID) {
            return {
              ...apikey,
              _syncWarning: action.error_message,
              _syncSuccess: false,
              _syncConflict: true,
              _isOptimistic: false,
            };
          }
          return apikey;
        }),
        apikeyMap: newApiKeyMap,
        loading: false,
        error: action.payload?.message || "Failed to fetch API key",
      };
    }

    // ------------------------------ LIST API KEYS --------------------------------- //

    case LIST_APIKEYS: {
      return {
        ...state,
        apikeys: action.optimistic || [],
        loading: true,
        error: null,
      };
    }

    case LIST_APIKEYS_COMMIT: {
      const apikeys = (action.payload?.ok?.data || []).reduce(
        (acc: ApiKeyFEO[], item: ApiKeyFEO) => updateOrAddApiKey(acc, item),
        state.apikeys
      );
      const apikeyMap = (action.payload?.ok?.data || []).reduce(
        (acc: Record<ApiKeyID, ApiKeyFEO>, item: ApiKeyFEO) => {
          acc[item.id] = item;
          return acc;
        },
        state.apikeyMap
      );

      return {
        ...state,
        apikeys,
        apikeyMap,
        loading: false,
        lastChecked: Date.now(),
      };
    }

    case LIST_APIKEYS_ROLLBACK: {
      if (!action.payload.response) return state;
      return {
        ...state,
        loading: false,
        error: action.error_message || "Failed to fetch API keys",
      };
    }

    // ------------------------------ CREATE API KEY --------------------------------- //

    case CREATE_APIKEY: {
      const optimisticApiKey = action.optimistic;
      if (!optimisticApiKey) return { ...state, loading: true, error: null };

      return {
        ...state,
        apikeys: updateOrAddApiKey(
          state.apikeys,
          optimisticApiKey,
          "_optimisticID"
        ),
        apikeyMap: {
          ...state.apikeyMap,
          [optimisticApiKey.id]: optimisticApiKey,
        },
        loading: true,
        error: null,
      };
    }

    case CREATE_APIKEY_COMMIT: {
      const optimisticID = action.meta?.optimisticID;
      const apiKeyData = action.payload?.ok?.data;

      if (!apiKeyData) return { ...state, loading: false };

      const newApiKey = {
        ...apiKeyData,
        _syncSuccess: true,
        _syncConflict: false,
        _syncWarning: "",
        _isOptimistic: false,
      };

      const filteredApiKeys = state.apikeys.filter(
        (apikey) => apikey._optimisticID !== optimisticID
      );

      return {
        ...state,
        apikeys: updateOrAddApiKey(filteredApiKeys, newApiKey),
        apikeyMap: {
          ...state.apikeyMap,
          [newApiKey.id]: newApiKey,
        },
        loading: false,
      };
    }

    case CREATE_APIKEY_ROLLBACK: {
      if (!action.payload.response) return state;
      // Add a sync warning to the optimistic apikey
      const newReduxApiKeys = state.apikeys.map((apikey) => {
        if (apikey._optimisticID === action.meta.optimisticID) {
          return {
            ...apikey,
            _syncWarning: action.error_message,
            _syncSuccess: false,
            _syncConflict: true,
            _isOptimistic: false,
          };
        }
        return apikey;
      });

      return {
        ...state,
        apikeys: newReduxApiKeys,
        loading: false,
        error: action.payload?.message || "Failed to create API key",
      };
    }

    // ------------------------------ UPDATE API KEY --------------------------------- //

    case UPDATE_APIKEY: {
      const optimisticApiKey = action.optimistic;
      if (!optimisticApiKey) return { ...state, loading: true, error: null };

      return {
        ...state,
        apikeys: updateOrAddApiKey(state.apikeys, optimisticApiKey),
        apikeyMap: {
          ...state.apikeyMap,
          [optimisticApiKey.id]: optimisticApiKey,
        },
        loading: true,
        error: null,
      };
    }

    case UPDATE_APIKEY_COMMIT: {
      const optimisticID = action.meta?.optimisticID;
      const apiKeyData = action.payload?.ok?.data;

      if (!apiKeyData) return { ...state, loading: false };

      const updatedApiKeys = state.apikeys.map((apikey) => {
        if (apikey._optimisticID === optimisticID) {
          return {
            ...apikey,
            ...apiKeyData,
            _syncSuccess: true,
            _syncConflict: false,
            _syncWarning: "",
            _isOptimistic: false,
          };
        }
        return apikey;
      });

      return {
        ...state,
        apikeys: updatedApiKeys,
        apikeyMap: {
          ...state.apikeyMap,
          [apiKeyData.id]: {
            ...apiKeyData,
            _syncSuccess: true,
            _syncConflict: false,
            _syncWarning: "",
            _isOptimistic: false,
          },
        },
        loading: false,
      };
    }

    case UPDATE_APIKEY_ROLLBACK: {
      if (!action.payload.response) return state;
      // Update the optimistic apikey with the error message
      return {
        ...state,
        apikeys: state.apikeys.map((apikey) => {
          if (apikey._optimisticID === action.meta.optimisticID) {
            return {
              ...apikey,
              _syncWarning: action.error_message,
              _syncSuccess: false,
              _syncConflict: true,
              _isOptimistic: false,
            };
          }
          return apikey;
        }),
        loading: false,
        error: action.payload?.message || "Failed to update API key",
      };
    }

    // ------------------------------ DELETE API KEY --------------------------------- //

    case DELETE_APIKEY: {
      const optimisticApiKey = action.optimistic;
      if (!optimisticApiKey) return { ...state, loading: true, error: null };

      return {
        ...state,
        apikeys: updateOrAddApiKey(state.apikeys, optimisticApiKey),
        apikeyMap: {
          ...state.apikeyMap,
          [optimisticApiKey.id]: optimisticApiKey,
        },
        loading: true,
        error: null,
      };
    }

    case DELETE_APIKEY_COMMIT: {
      const optimisticID = action.meta?.optimisticID;
      const newApiKeyMap = { ...state.apikeyMap };
      delete newApiKeyMap[optimisticID];

      return {
        ...state,
        apikeys: state.apikeys.filter(
          (apikey) => apikey._optimisticID !== optimisticID
        ),
        apikeyMap: newApiKeyMap,
        loading: false,
      };
    }

    case DELETE_APIKEY_ROLLBACK: {
      if (!action.payload.response) return state;
      // Update the optimistic apikey with the error message
      return {
        ...state,
        apikeys: state.apikeys.map((apikey) => {
          if (apikey._optimisticID === action.meta.optimisticID) {
            return {
              ...apikey,
              _syncWarning: action.error_message,
              _syncSuccess: false,
              _syncConflict: true,
              _isOptimistic: false,
              _markedForDeletion: false,
            };
          }
          return apikey;
        }),
        loading: false,
        error: action.payload?.message || "Failed to delete API key",
      };
    }

    case CHECK_API_KEY_TABLE_PERMISSIONS: {
      console.log(`Firing checkContactTablePermissionsAction for user`, action);
      const permission_types = action.optimistic?.permission_types || [];
      return {
        ...state,
        loading: true,
        error: null,
        tablePermissions: permission_types,
      };
    }

    case CHECK_API_KEY_TABLE_PERMISSIONS_COMMIT: {
      return {
        ...state,
        loading: false,
        tablePermissions: action.payload.ok.data.permissions,
      };
    }

    case CHECK_API_KEY_TABLE_PERMISSIONS_ROLLBACK: {
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

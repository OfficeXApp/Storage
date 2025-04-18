import { SystemPermissionType, WebhookFE, WebhookID } from "@officexapp/types";
import {
  CREATE_WEBHOOK,
  CREATE_WEBHOOK_COMMIT,
  CREATE_WEBHOOK_ROLLBACK,
  LIST_WEBHOOKS,
  LIST_WEBHOOKS_COMMIT,
  LIST_WEBHOOKS_ROLLBACK,
  GET_WEBHOOK,
  GET_WEBHOOK_COMMIT,
  GET_WEBHOOK_ROLLBACK,
  UPDATE_WEBHOOK,
  UPDATE_WEBHOOK_COMMIT,
  UPDATE_WEBHOOK_ROLLBACK,
  DELETE_WEBHOOK,
  DELETE_WEBHOOK_COMMIT,
  DELETE_WEBHOOK_ROLLBACK,
  CHECK_WEBHOOK_TABLE_PERMISSIONS,
  CHECK_WEBHOOK_TABLE_PERMISSIONS_ROLLBACK,
  CHECK_WEBHOOK_TABLE_PERMISSIONS_COMMIT,
} from "./webhooks.actions";

export const WEBHOOKS_REDUX_KEY = "webhooks";
export const WEBHOOKS_DEXIE_TABLE = WEBHOOKS_REDUX_KEY;

export interface WebhookFEO extends WebhookFE {
  _isOptimistic?: boolean; // flag for optimistic updates
  _optimisticID?: string; // unique ID for optimistic updates
  _syncWarning?: string; // tooltip for users
  _syncConflict?: boolean; // flag for corrupted data due to sync failures
  _syncSuccess?: boolean; // flag for successful sync
  _markedForDeletion?: boolean; // flag for deletion
  lastChecked?: number;
  isLoading?: boolean;
}

interface WebhooksState {
  webhooks: WebhookFEO[];
  webhookMap: Record<WebhookID, WebhookFEO>;
  loading: boolean;
  error: string | null;
  tablePermissions: SystemPermissionType[];
  lastChecked: number;
}

const initialState: WebhooksState = {
  webhooks: [],
  webhookMap: {},
  loading: false,
  error: null,
  tablePermissions: [],
  lastChecked: 0,
};

const updateOrAddWebhook = (
  webhooks: WebhookFEO[],
  newWebhook: WebhookFEO,
  identifierKey: keyof WebhookFEO = "id"
): WebhookFEO[] => {
  const existingIndex = webhooks.findIndex(
    (webhook) => webhook[identifierKey] === newWebhook[identifierKey]
  );

  if (existingIndex !== -1) {
    // Replace existing webhook
    return [
      ...webhooks.slice(0, existingIndex),
      newWebhook,
      ...webhooks.slice(existingIndex + 1),
    ];
  } else {
    // Add to the front of the array
    return [newWebhook, ...webhooks];
  }
};

export const webhooksReducer = (
  state = initialState,
  action: any
): WebhooksState => {
  switch (action.type) {
    // ------------------------------ GET WEBHOOK --------------------------------- //

    case GET_WEBHOOK: {
      if (!action.optimistic) return { ...state, loading: true, error: null };

      return {
        ...state,
        webhooks: updateOrAddWebhook(state.webhooks, action.optimistic),
        webhookMap: {
          ...state.webhookMap,
          [action.optimistic.id]: { ...action.optimistic, isLoading: true },
        },
      };
    }

    case GET_WEBHOOK_COMMIT: {
      const realWebhook = action.payload.ok.data;
      // Update the optimistic webhook with the real data
      return {
        ...state,
        webhooks: state.webhooks.map((webhook) => {
          if (
            webhook._optimisticID === realWebhook.id ||
            webhook.id === realWebhook.id
          ) {
            return realWebhook;
          }
          return webhook;
        }),
        webhookMap: {
          ...state.webhookMap,
          [realWebhook.id]: {
            ...realWebhook,
            lastChecked: Date.now(),
            isLoading: false,
          },
        },
      };
    }

    case GET_WEBHOOK_ROLLBACK: {
      if (!action.payload.response) return state;
      // Update the optimistic webhook with the error message
      const newWebhookMap = { ...state.webhookMap };
      delete newWebhookMap[action.meta.optimisticID];
      return {
        ...state,
        webhooks: state.webhooks.map((webhook) => {
          if (webhook._optimisticID === action.meta.optimisticID) {
            return {
              ...webhook,
              _syncWarning: action.error_message,
              _syncSuccess: false,
              _syncConflict: true,
              _isOptimistic: false,
              isLoading: false,
            };
          }
          return webhook;
        }),
        webhookMap: newWebhookMap,
        error: action.payload.message || "Failed to fetch webhook",
      };
    }

    // ------------------------------ LIST WEBHOOKS --------------------------------- //

    case LIST_WEBHOOKS: {
      return {
        ...state,
        webhooks: action.optimistic || [],
        loading: true,
        error: null,
      };
    }

    case LIST_WEBHOOKS_COMMIT: {
      const webhooks = action.payload.ok.data.items.reduce(
        (acc: WebhookFEO[], item: WebhookFEO) => updateOrAddWebhook(acc, item),
        state.webhooks
      );
      const webhookMap = action.payload.ok.data.items.reduce(
        (acc: Record<WebhookID, WebhookFEO>, item: WebhookFEO) => {
          acc[item.id] = { ...item, lastChecked: Date.now(), isLoading: false };
          return acc;
        },
        state.webhookMap
      );

      return {
        ...state,
        webhooks,
        webhookMap,
        loading: false,
        lastChecked: Date.now(),
      };
    }

    case LIST_WEBHOOKS_ROLLBACK: {
      if (!action.payload.response) return state;
      return {
        ...state,
        webhooks: [],
        loading: false,
        error: action.error_message || "Failed to fetch webhooks",
      };
    }

    // ------------------------------ CREATE WEBHOOK --------------------------------- //

    case CREATE_WEBHOOK: {
      const optimisticWebhook = action.optimistic;
      if (!optimisticWebhook) return { ...state, loading: true, error: null };

      return {
        ...state,
        webhooks: updateOrAddWebhook(
          state.webhooks,
          optimisticWebhook,
          "_optimisticID"
        ),
        loading: true,
        error: null,
      };
    }

    case CREATE_WEBHOOK_COMMIT: {
      const optimisticID = action.meta?.optimisticID;
      // Remove the optimistic webhook from our items array & indexdb
      const newWebhook = {
        ...action.payload.ok.data,
        _syncSuccess: true,
        _syncConflict: false,
        _syncWarning: "",
        _isOptimistic: false,
      };
      const filteredWebhooks = state.webhooks.filter(
        (webhook) => webhook._optimisticID !== optimisticID
      );
      // removal from dexie is already handled in optimistic middleware which can handle async, whereas reducers are pure sync functions
      return {
        ...state,
        // Add the newly created webhook to our items array
        webhooks: updateOrAddWebhook(filteredWebhooks, newWebhook),
        loading: false,
      };
    }

    case CREATE_WEBHOOK_ROLLBACK: {
      if (!action.payload.response) return state;
      // Add a sync warning to the optimistic webhook
      const newReduxWebhooks = state.webhooks.map((webhook) => {
        if (webhook._optimisticID === action.meta.optimisticID) {
          return {
            ...webhook,
            _syncWarning: action.error_message,
            _syncSuccess: false,
            _syncConflict: true,
            _isOptimistic: false,
          };
        }
        return webhook;
      });
      // removal from dexie is already handled in optimistic middleware which can handle async, whereas reducers are pure sync functions
      return {
        ...state,
        webhooks: newReduxWebhooks,
        loading: false,
        error: action.payload.message || "Failed to create webhook",
      };
    }

    // ------------------------------ UPDATE WEBHOOK --------------------------------- //

    case UPDATE_WEBHOOK: {
      const optimisticWebhook = action.optimistic;
      if (!optimisticWebhook) return { ...state, loading: true, error: null };

      return {
        ...state,
        webhooks: updateOrAddWebhook(state.webhooks, optimisticWebhook),
        loading: true,
        error: null,
      };
    }

    case UPDATE_WEBHOOK_COMMIT: {
      const optimisticID = action.meta?.optimisticID;
      // Update the optimistic webhook with the real data
      return {
        ...state,
        webhooks: state.webhooks.map((webhook) => {
          if (webhook._optimisticID === optimisticID) {
            return {
              ...webhook,
              ...action.payload.ok.data,
              _syncSuccess: true,
              _syncConflict: false,
              _syncWarning: "",
              _isOptimistic: false,
            };
          }
          return webhook;
        }),
        loading: false,
      };
    }

    case UPDATE_WEBHOOK_ROLLBACK: {
      if (!action.payload.response) return state;
      // Update the optimistic webhook with the error message
      return {
        ...state,
        webhooks: state.webhooks.map((webhook) => {
          if (webhook._optimisticID === action.meta.optimisticID) {
            return {
              ...webhook,
              _syncWarning: action.error_message,
              _syncSuccess: false,
              _syncConflict: true,
              _isOptimistic: false,
            };
          }
          return webhook;
        }),
        loading: false,
        error: action.payload.message || "Failed to update webhook",
      };
    }

    // ------------------------------ DELETE WEBHOOK --------------------------------- //

    case DELETE_WEBHOOK: {
      const optimisticWebhook = action.optimistic;
      if (!optimisticWebhook) return { ...state, loading: true, error: null };

      return {
        ...state,
        webhooks: updateOrAddWebhook(state.webhooks, optimisticWebhook),
        loading: true,
        error: null,
      };
    }

    case DELETE_WEBHOOK_COMMIT: {
      const optimisticID = action.meta?.optimisticID;
      // Update the optimistic webhook with the real data
      return {
        ...state,
        webhooks: state.webhooks.filter(
          (webhook) => webhook._optimisticID !== optimisticID
        ),
        loading: false,
      };
    }

    case DELETE_WEBHOOK_ROLLBACK: {
      if (!action.payload.response) return state;
      // Update the optimistic webhook with the error message
      return {
        ...state,
        webhooks: state.webhooks.map((webhook) => {
          if (webhook._optimisticID === action.meta.optimisticID) {
            return {
              ...webhook,
              _syncWarning: action.error_message,
              _syncSuccess: false,
              _syncConflict: true,
              _isOptimistic: false,
            };
          }
          return webhook;
        }),
        loading: false,
        error: action.payload.message || "Failed to delete webhook",
      };
    }

    case CHECK_WEBHOOK_TABLE_PERMISSIONS: {
      const permission_types = action.optimistic?.permission_types || [];
      return {
        ...state,
        loading: true,
        error: null,
        tablePermissions: permission_types,
      };
    }

    case CHECK_WEBHOOK_TABLE_PERMISSIONS_COMMIT: {
      return {
        ...state,
        loading: false,
        tablePermissions: action.payload.ok.data.permissions,
      };
    }

    case CHECK_WEBHOOK_TABLE_PERMISSIONS_ROLLBACK: {
      return {
        ...state,
        loading: false,
        error:
          action.payload.message || "Failed to check webhook table permissions",
      };
    }

    default:
      return state;
  }
};

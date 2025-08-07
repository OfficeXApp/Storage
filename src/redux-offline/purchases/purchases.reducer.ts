// src/redux-offline/purchases/purchases.reducer.ts
import {
  Purchase,
  PurchaseFE,
  PurchaseID,
  SystemPermissionType,
} from "@officexapp/types";
import {
  CREATE_PURCHASE,
  CREATE_PURCHASE_COMMIT,
  CREATE_PURCHASE_ROLLBACK,
  LIST_PURCHASES,
  LIST_PURCHASES_COMMIT,
  LIST_PURCHASES_ROLLBACK,
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

export const PURCHASES_REDUX_KEY = "purchases";
export const PURCHASES_DEXIE_TABLE = PURCHASES_REDUX_KEY;

export interface PurchaseFEO extends PurchaseFE {
  _isOptimistic?: boolean; // flag for optimistic updates
  _optimisticID?: string; // unique ID for optimistic updates
  _syncWarning?: string; // tooltip for users
  _syncConflict?: boolean; // flag for corrupted data due to sync failures
  _syncSuccess?: boolean; // flag for successful sync
  _markedForDeletion?: boolean; // flag for deletion
  lastChecked?: number;
  isLoading?: boolean;
}

interface PurchasesState {
  purchases: PurchaseFEO[];
  purchaseMap: Record<PurchaseID, PurchaseFEO>;
  loading: boolean;
  error: string | null;
  tablePermissions: SystemPermissionType[];
  lastChecked: number;
}

const initialState: PurchasesState = {
  purchases: [],
  purchaseMap: {},
  loading: false,
  error: null,
  tablePermissions: [],
  lastChecked: 0,
};

const updateOrAddPurchase = (
  purchases: PurchaseFEO[],
  newPurchase: PurchaseFEO
): PurchaseFEO[] => {
  const existingIndex = purchases.findIndex(
    (purchase) =>
      purchase.id === newPurchase.id ||
      purchase._optimisticID === newPurchase.id
  );

  if (existingIndex !== -1) {
    // Replace existing purchase
    return [
      ...purchases.slice(0, existingIndex),
      newPurchase,
      ...purchases.slice(existingIndex + 1),
    ];
  } else {
    // Add to the front of the array
    return [newPurchase, ...purchases];
  }
};

export const purchasesReducer = (
  state = initialState,
  action: any
): PurchasesState => {
  switch (action.type) {
    // ------------------------------ GET JOB RUN --------------------------------- //

    case GET_PURCHASE: {
      return {
        ...state,
        purchases: updateOrAddPurchase(state.purchases, action.optimistic),
        purchaseMap: {
          ...state.purchaseMap,
          [action.optimistic.id]: { ...action.optimistic, isLoading: true },
        },
      };
    }

    case GET_PURCHASE_COMMIT: {
      const realPurchase = action.payload.ok.data;
      // Update the optimistic purchase with the real data
      return {
        ...state,
        purchases: state.purchases.map((purchase) => {
          if (
            purchase._optimisticID === realPurchase.id ||
            purchase.id === realPurchase.id
          ) {
            return realPurchase;
          }
          return purchase;
        }),
        purchaseMap: {
          ...state.purchaseMap,
          [action.payload.ok.data.id]: {
            ...action.payload.ok.data,
            lastChecked: Date.now(),
            isLoading: false,
          },
        },
      };
    }

    case GET_PURCHASE_ROLLBACK: {
      if (!action.payload.response) return state;
      // Update the optimistic purchase with the error message
      const newPurchaseMap = { ...state.purchaseMap };
      delete newPurchaseMap[action.meta.optimisticID];
      return {
        ...state,
        purchases: state.purchases.map((purchase) => {
          if (purchase._optimisticID === action.meta.optimisticID) {
            return {
              ...purchase,
              _syncWarning: action.error_message,
              _syncSuccess: false,
              _syncConflict: true,
              _isOptimistic: false,
              isLoading: false,
            };
          }
          return purchase;
        }),
        purchaseMap: newPurchaseMap,
        error: action.payload.message || "Failed to fetch purchase",
      };
    }

    // ------------------------------ LIST JOB RUNS --------------------------------- //

    case LIST_PURCHASES: {
      return {
        ...state,
        purchases: action.optimistic || [],
        loading: true,
        error: null,
      };
    }

    case LIST_PURCHASES_COMMIT: {
      // Get items from the API response
      const serverPurchases = action.payload.ok.data.items || [];

      const newPurchases: PurchaseFEO[] = serverPurchases.reduce(
        (acc: PurchaseFEO[], item: PurchaseFEO) =>
          updateOrAddPurchase(acc, item),
        state.purchases
      );
      const newPurchaseMap = serverPurchases.reduce(
        (acc: Record<PurchaseID, PurchaseFEO>, item: PurchaseFEO) => {
          acc[item.id] = { ...item, lastChecked: Date.now() };
          return acc;
        },
        state.purchaseMap
      );

      return {
        ...state,
        purchases: newPurchases,
        purchaseMap: newPurchaseMap,
        loading: false,
        lastChecked: Date.now(),
      };
    }

    case LIST_PURCHASES_ROLLBACK: {
      if (!action.payload.response) return state;
      return {
        ...state,
        loading: false,
        error: action.error_message || "Failed to fetch purchases",
      };
    }

    // ------------------------------ CREATE JOB RUN --------------------------------- //

    case CREATE_PURCHASE: {
      const optimisticPurchase = action.optimistic;
      return {
        ...state,
        purchases: updateOrAddPurchase(state.purchases, optimisticPurchase),
        loading: true,
        error: null,
      };
    }

    case CREATE_PURCHASE_COMMIT: {
      const optimisticID = action.meta?.optimisticID;
      const newPurchase = {
        ...action.payload.ok.data,
        _syncSuccess: true,
        _syncConflict: false,
        _syncWarning: "",
        _isOptimistic: false,
      };
      const filteredPurchases = state.purchases.filter(
        (purchase) => purchase._optimisticID !== optimisticID
      );
      return {
        ...state,
        // Add the newly created purchase to our items array
        purchases: updateOrAddPurchase(filteredPurchases, newPurchase),
        loading: false,
      };
    }

    case CREATE_PURCHASE_ROLLBACK: {
      if (!action.payload.response) return state;
      // Add a sync warning to the optimistic purchase
      const newReduxPurchases = state.purchases.map((purchase) => {
        if (purchase._optimisticID === action.meta.optimisticID) {
          return {
            ...purchase,
            _syncWarning: action.error_message,
            _syncSuccess: false,
            _syncConflict: true,
            _isOptimistic: false,
          };
        }
        return purchase;
      });
      // removal from dexie is already handled in optimistic middleware which can handle async, whereas reducers are pure sync functions
      return {
        ...state,
        purchases: newReduxPurchases,
        loading: false,
        error: action.payload.message || "Failed to create purchase",
      };
    }

    // ------------------------------ UPDATE JOB RUN --------------------------------- //

    case UPDATE_PURCHASE: {
      const optimisticPurchase = action.optimistic;
      return {
        ...state,
        purchases: updateOrAddPurchase(state.purchases, optimisticPurchase),
        loading: true,
        error: null,
      };
    }

    case UPDATE_PURCHASE_COMMIT: {
      const optimisticID = action.meta?.optimisticID;
      // Update the optimistic purchase with the real data
      return {
        ...state,
        purchases: state.purchases.map((purchase) => {
          if (purchase._optimisticID === optimisticID) {
            return {
              ...purchase,
              ...action.payload.ok.data,
              _syncSuccess: true,
              _syncConflict: false,
              _syncWarning: "",
              _isOptimistic: false,
            };
          }
          return purchase;
        }),
        loading: false,
      };
    }

    case UPDATE_PURCHASE_ROLLBACK: {
      if (!action.payload.response) return state;
      // Update the optimistic purchase with the error message
      return {
        ...state,
        purchases: state.purchases.map((purchase) => {
          if (purchase._optimisticID === action.meta.optimisticID) {
            return {
              ...purchase,
              _syncWarning: action.error_message,
              _syncSuccess: false,
              _syncConflict: true,
              _isOptimistic: false,
            };
          }
          return purchase;
        }),
        loading: false,
        error: action.payload.message || "Failed to update purchase",
      };
    }

    // ------------------------------ DELETE JOB RUN --------------------------------- //

    case DELETE_PURCHASE: {
      const optimisticPurchase = action.optimistic;
      return {
        ...state,
        purchases: updateOrAddPurchase(state.purchases, optimisticPurchase),
        loading: true,
        error: null,
      };
    }

    case DELETE_PURCHASE_COMMIT: {
      const optimisticID = action.meta?.optimisticID;
      // Update the optimistic purchase with the real data
      return {
        ...state,
        purchases: state.purchases.filter(
          (purchase) => purchase._optimisticID !== optimisticID
        ),
        loading: false,
      };
    }

    case DELETE_PURCHASE_ROLLBACK: {
      // Update the optimistic purchase with the error message
      return {
        ...state,
        purchases: state.purchases.map((purchase) => {
          if (purchase._optimisticID === action.meta.optimisticID) {
            return {
              ...purchase,
              _syncWarning: action.error_message,
              _syncSuccess: false,
              _syncConflict: true,
              _isOptimistic: false,
            };
          }
          return purchase;
        }),
        loading: false,
        error: action.payload.message || "Failed to delete purchase",
      };
    }

    case CHECK_PURCHASES_TABLE_PERMISSIONS: {
      const permission_types = action.optimistic?.permission_types || [];
      return {
        ...state,
        loading: true,
        error: null,
        tablePermissions: permission_types,
      };
    }

    case CHECK_PURCHASES_TABLE_PERMISSIONS_COMMIT: {
      return {
        ...state,
        loading: false,
        tablePermissions: action.payload.ok.data.permissions,
      };
    }

    case CHECK_PURCHASES_TABLE_PERMISSIONS_ROLLBACK: {
      return {
        ...state,
        loading: false,
        error:
          action.payload.message ||
          "Failed to check purchases table permissions",
      };
    }

    default:
      return state;
  }
};

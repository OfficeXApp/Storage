// src/redux-offline/labels/labels.reducer.ts
import { LabelFE, LabelID } from "@officexapp/types";
import {
  CREATE_LABEL,
  CREATE_LABEL_COMMIT,
  CREATE_LABEL_ROLLBACK,
  LIST_LABELS,
  LIST_LABELS_COMMIT,
  LIST_LABELS_ROLLBACK,
  GET_LABEL,
  GET_LABEL_COMMIT,
  GET_LABEL_ROLLBACK,
  UPDATE_LABEL,
  UPDATE_LABEL_COMMIT,
  UPDATE_LABEL_ROLLBACK,
  DELETE_LABEL,
  DELETE_LABEL_COMMIT,
  DELETE_LABEL_ROLLBACK,
} from "./labels.actions";

export const LABELS_REDUX_KEY = "labels";
export const LABELS_DEXIE_TABLE = LABELS_REDUX_KEY;

export interface LabelFEO extends LabelFE {
  _isOptimistic?: boolean; // flag for optimistic updates
  _optimisticID?: string; // unique ID for optimistic updates
  _syncWarning?: string; // tooltip for users
  _syncConflict?: boolean; // flag for corrupted data due to sync failures
  _syncSuccess?: boolean; // flag for successful sync
  _markedForDeletion?: boolean; // flag for deletion
}

interface LabelsState {
  labels: LabelFEO[];
  labelMap: Record<LabelID, LabelFEO>;
  loading: boolean;
  error: string | null;
}

const initialState: LabelsState = {
  labels: [],
  labelMap: {},
  loading: false,
  error: null,
};

const updateOrAddLabel = (
  labels: LabelFEO[],
  newLabel: LabelFEO,
  identifierKey: keyof LabelFEO = "id"
): LabelFEO[] => {
  const existingIndex = labels.findIndex(
    (label) => label[identifierKey] === newLabel[identifierKey]
  );

  if (existingIndex !== -1) {
    // Replace existing label
    return [
      ...labels.slice(0, existingIndex),
      newLabel,
      ...labels.slice(existingIndex + 1),
    ];
  } else {
    // Add to the front of the array
    return [newLabel, ...labels];
  }
};

export const labelsReducer = (
  state = initialState,
  action: any
): LabelsState => {
  switch (action.type) {
    // ------------------------------ GET LABEL --------------------------------- //

    // Get Label
    case GET_LABEL: {
      if (!action.optimistic) return { ...state, loading: true, error: null };

      return {
        ...state,
        labels: updateOrAddLabel(state.labels, action.optimistic),
        labelMap: {
          ...state.labelMap,
          [action.optimistic.id]: action.optimistic,
        },
        loading: true,
        error: null,
      };
    }

    case GET_LABEL_COMMIT: {
      const optimisticID = action.meta?.optimisticID;
      const label = action.payload.ok.data;

      // Update the optimistic label with the real data
      return {
        ...state,
        labels: state.labels.map((t) => {
          if (t._optimisticID === optimisticID) {
            return label;
          }
          return t;
        }),
        labelMap: {
          ...state.labelMap,
          [label.id]: label,
        },
        loading: false,
      };
    }

    case GET_LABEL_ROLLBACK: {
      if (!action.payload.response) return state;
      // Update the optimistic label with the error message
      const newLabelMap = { ...state.labelMap };
      delete newLabelMap[action.meta.optimisticID];

      return {
        ...state,
        labels: state.labels.map((label) => {
          if (label._optimisticID === action.meta.optimisticID) {
            return {
              ...label,
              _syncWarning: action.error_message,
              _syncSuccess: false,
              _syncConflict: true,
              _isOptimistic: false,
            };
          }
          return label;
        }),
        labelMap: newLabelMap,
        loading: false,
        error: action.payload.message || "Failed to fetch label",
      };
    }

    // ------------------------------ LIST LABELS --------------------------------- //

    case LIST_LABELS: {
      return {
        ...state,
        labels: action.optimistic || [],
        loading: true,
        error: null,
      };
    }

    case LIST_LABELS_COMMIT: {
      // Replace entire labels list with response data
      const labels = action.payload.ok.data.items;
      const labelMap = labels.reduce(
        (map: Record<string, LabelFEO>, label: LabelFEO) => {
          map[label.id] = label;
          return map;
        },
        {}
      );

      return {
        ...state,
        labels,
        labelMap,
        loading: false,
      };
    }

    case LIST_LABELS_ROLLBACK: {
      if (!action.payload.response) return state;
      return {
        ...state,
        loading: false,
        error: action.error_message || "Failed to fetch labels",
      };
    }

    // ------------------------------ CREATE LABEL --------------------------------- //

    case CREATE_LABEL: {
      if (!action.optimistic) return { ...state, loading: true, error: null };

      const optimisticLabel = action.optimistic;
      return {
        ...state,
        labels: updateOrAddLabel(
          state.labels,
          optimisticLabel,
          "_optimisticID"
        ),
        labelMap: {
          ...state.labelMap,
          [optimisticLabel.id]: optimisticLabel,
        },
        loading: true,
        error: null,
      };
    }

    case CREATE_LABEL_COMMIT: {
      const optimisticID = action.meta?.optimisticID;
      // Remove the optimistic label and add the real one
      const newLabel = {
        ...action.payload.ok.data,
        _syncSuccess: true,
        _syncConflict: false,
        _syncWarning: "",
        _isOptimistic: false,
      };

      const filteredLabels = state.labels.filter(
        (label) => label._optimisticID !== optimisticID
      );

      // Remove old label from labelMap
      const newLabelMap = { ...state.labelMap };
      delete newLabelMap[optimisticID];
      newLabelMap[newLabel.id] = newLabel;

      return {
        ...state,
        labels: updateOrAddLabel(filteredLabels, newLabel),
        labelMap: newLabelMap,
        loading: false,
      };
    }

    case CREATE_LABEL_ROLLBACK: {
      if (!action.payload.response) return state;
      // Add a sync warning to the optimistic label
      const newReduxLabels = state.labels.map((label) => {
        if (label._optimisticID === action.meta.optimisticID) {
          return {
            ...label,
            _syncWarning: action.error_message,
            _syncSuccess: false,
            _syncConflict: true,
            _isOptimistic: false,
          };
        }
        return label;
      });

      return {
        ...state,
        labels: newReduxLabels,
        loading: false,
        error: action.payload.message || "Failed to create label",
      };
    }

    // ------------------------------ UPDATE LABEL --------------------------------- //

    case UPDATE_LABEL: {
      if (!action.optimistic) return { ...state, loading: true, error: null };

      const optimisticLabel = action.optimistic;
      return {
        ...state,
        labels: updateOrAddLabel(state.labels, optimisticLabel),
        labelMap: {
          ...state.labelMap,
          [optimisticLabel.id]: optimisticLabel,
        },
        loading: true,
        error: null,
      };
    }

    case UPDATE_LABEL_COMMIT: {
      const optimisticID = action.meta?.optimisticID;
      const updatedLabel = action.payload.ok.data;

      // Update the label in both labels array and labelMap
      return {
        ...state,
        labels: state.labels.map((label) => {
          if (label._optimisticID === optimisticID) {
            return {
              ...updatedLabel,
              _syncSuccess: true,
              _syncConflict: false,
              _syncWarning: "",
              _isOptimistic: false,
            };
          }
          return label;
        }),
        labelMap: {
          ...state.labelMap,
          [updatedLabel.id]: {
            ...updatedLabel,
            _syncSuccess: true,
            _syncConflict: false,
            _syncWarning: "",
            _isOptimistic: false,
          },
        },
        loading: false,
      };
    }

    case UPDATE_LABEL_ROLLBACK: {
      if (!action.payload.response) return state;
      // Update the optimistic label with the error message
      return {
        ...state,
        labels: state.labels.map((label) => {
          if (label._optimisticID === action.meta.optimisticID) {
            return {
              ...label,
              _syncWarning: action.error_message,
              _syncSuccess: false,
              _syncConflict: true,
              _isOptimistic: false,
            };
          }
          return label;
        }),
        loading: false,
        error: action.payload.message || "Failed to update label",
      };
    }

    // ------------------------------ DELETE LABEL --------------------------------- //

    case DELETE_LABEL: {
      if (!action.optimistic) return { ...state, loading: true, error: null };

      const optimisticLabel = action.optimistic;
      return {
        ...state,
        labels: updateOrAddLabel(state.labels, optimisticLabel),
        labelMap: {
          ...state.labelMap,
          [optimisticLabel.id]: optimisticLabel,
        },
        loading: true,
        error: null,
      };
    }

    case DELETE_LABEL_COMMIT: {
      const optimisticID = action.meta?.optimisticID;

      // Remove the label from both arrays
      const newLabels = state.labels.filter(
        (label) => label._optimisticID !== optimisticID
      );

      const newLabelMap = { ...state.labelMap };
      delete newLabelMap[optimisticID];

      return {
        ...state,
        labels: newLabels,
        labelMap: newLabelMap,
        loading: false,
      };
    }

    case DELETE_LABEL_ROLLBACK: {
      if (!action.payload.response) return state;
      // Update the optimistic label with the error message
      return {
        ...state,
        labels: state.labels.map((label) => {
          if (label._optimisticID === action.meta.optimisticID) {
            return {
              ...label,
              _syncWarning: action.error_message,
              _syncSuccess: false,
              _syncConflict: true,
              _isOptimistic: false,
              _markedForDeletion: false,
            };
          }
          return label;
        }),
        loading: false,
        error: action.payload.message || "Failed to delete label",
      };
    }

    default:
      return state;
  }
};

// src/redux-offline/labels/labels.actions.ts

import {
  LabelID,
  GenerateID,
  IRequestGetLabel,
  IRequestListLabels,
  IRequestCreateLabel,
  IRequestUpdateLabel,
  IRequestDeleteLabel,
  LabelFE,
} from "@officexapp/types";

export const GET_LABEL = "GET_LABEL";
export const GET_LABEL_COMMIT = "GET_LABEL_COMMIT";
export const GET_LABEL_ROLLBACK = "GET_LABEL_ROLLBACK";

export const LIST_LABELS = "LIST_LABELS";
export const LIST_LABELS_COMMIT = "LIST_LABELS_COMMIT";
export const LIST_LABELS_ROLLBACK = "LIST_LABELS_ROLLBACK";

export const CREATE_LABEL = "CREATE_LABEL";
export const CREATE_LABEL_COMMIT = "CREATE_LABEL_COMMIT";
export const CREATE_LABEL_ROLLBACK = "CREATE_LABEL_ROLLBACK";

export const UPDATE_LABEL = "UPDATE_LABEL";
export const UPDATE_LABEL_COMMIT = "UPDATE_LABEL_COMMIT";
export const UPDATE_LABEL_ROLLBACK = "UPDATE_LABEL_ROLLBACK";

export const DELETE_LABEL = "DELETE_LABEL";
export const DELETE_LABEL_COMMIT = "DELETE_LABEL_COMMIT";
export const DELETE_LABEL_ROLLBACK = "DELETE_LABEL_ROLLBACK";

// Get Label
export const getLabelAction = (label_id: LabelID) => ({
  type: GET_LABEL,
  meta: {
    optimisticID: label_id,
    offline: {
      // Define the effect (the API call to make)
      effect: {
        url: `/labels/get/${label_id}`,
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          // Authorization: `Bearer HANDLED_BY_OFFLINE_EFFECT_MIDDLEWARE`,
        },
        data: {},
      },
      // Action to dispatch on success
      commit: { type: GET_LABEL_COMMIT },
      // Action to dispatch on failure
      rollback: { type: GET_LABEL_ROLLBACK },
    },
  },
});

// List Labels
export const listLabelsAction = (payload: IRequestListLabels) => ({
  type: LIST_LABELS,
  meta: {
    offline: {
      // Define the effect (the API call to make)
      effect: {
        url: `/labels/list`,
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          // Authorization: `Bearer HANDLED_BY_OFFLINE_EFFECT_MIDDLEWARE`,
        },
        data: payload,
      },
      // Action to dispatch on success
      commit: { type: LIST_LABELS_COMMIT },
      // Action to dispatch on failure
      rollback: { type: LIST_LABELS_ROLLBACK },
    },
  },
});

// Create Label
export const createLabelAction = (labelData: IRequestCreateLabel) => {
  const id = labelData.id || GenerateID.Label();
  const payload = {
    ...labelData,
    id,
  };
  return {
    type: CREATE_LABEL,
    meta: {
      optimisticID: id,
      offline: {
        effect: {
          url: `/labels/create`,
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            // Authorization: `Bearer HANDLED_BY_OFFLINE_EFFECT_MIDDLEWARE`,
          },
          data: payload,
        },
        // Action to dispatch on success
        commit: { type: CREATE_LABEL_COMMIT, meta: { optimisticID: id } },
        // Action to dispatch on failure
        rollback: { type: CREATE_LABEL_ROLLBACK, meta: { optimisticID: id } },
      },
    },
  };
};

// Update Label
export const updateLabelAction = (labelData: IRequestUpdateLabel) => {
  const id = labelData.id;
  const payload = {
    ...labelData,
  };
  return {
    type: UPDATE_LABEL,
    meta: {
      optimisticID: id,
      offline: {
        effect: {
          url: `/labels/update`,
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            // Authorization: `Bearer HANDLED_BY_OFFLINE_EFFECT_MIDDLEWARE`,
          },
          data: payload,
        },
        // Action to dispatch on success
        commit: { type: UPDATE_LABEL_COMMIT, meta: { optimisticID: id } },
        // Action to dispatch on failure
        rollback: { type: UPDATE_LABEL_ROLLBACK, meta: { optimisticID: id } },
      },
    },
  };
};

// Delete Label
export const deleteLabelAction = (payload: IRequestDeleteLabel) => {
  const id = payload.id;
  return {
    type: DELETE_LABEL,
    meta: {
      optimisticID: id,
      offline: {
        effect: {
          url: `/labels/delete`,
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            // Authorization: `Bearer HANDLED_BY_OFFLINE_EFFECT_MIDDLEWARE`,
          },
          data: payload,
        },
        // Action to dispatch on success
        commit: { type: DELETE_LABEL_COMMIT, meta: { optimisticID: id } },
        // Action to dispatch on failure
        rollback: {
          type: DELETE_LABEL_ROLLBACK,
          meta: { optimisticID: id },
        },
      },
    },
  };
};

// src/redux-offline/tags/tags.actions.ts

import {
  TagID,
  GenerateID,
  IRequestGetTag,
  IRequestListTags,
  IRequestCreateTag,
  IRequestUpdateTag,
  IRequestDeleteTag,
  TagFE,
} from "@officexapp/types";

export const GET_TAG = "GET_TAG";
export const GET_TAG_COMMIT = "GET_TAG_COMMIT";
export const GET_TAG_ROLLBACK = "GET_TAG_ROLLBACK";

export const LIST_TAGS = "LIST_TAGS";
export const LIST_TAGS_COMMIT = "LIST_TAGS_COMMIT";
export const LIST_TAGS_ROLLBACK = "LIST_TAGS_ROLLBACK";

export const CREATE_TAG = "CREATE_TAG";
export const CREATE_TAG_COMMIT = "CREATE_TAG_COMMIT";
export const CREATE_TAG_ROLLBACK = "CREATE_TAG_ROLLBACK";

export const UPDATE_TAG = "UPDATE_TAG";
export const UPDATE_TAG_COMMIT = "UPDATE_TAG_COMMIT";
export const UPDATE_TAG_ROLLBACK = "UPDATE_TAG_ROLLBACK";

export const DELETE_TAG = "DELETE_TAG";
export const DELETE_TAG_COMMIT = "DELETE_TAG_COMMIT";
export const DELETE_TAG_ROLLBACK = "DELETE_TAG_ROLLBACK";

// Get Tag
export const getTagAction = (tag_id: TagID) => ({
  type: GET_TAG,
  meta: {
    optimisticID: tag_id,
    offline: {
      // Define the effect (the API call to make)
      effect: {
        url: `/tags/get/${tag_id}`,
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          // Authorization: `Bearer HANDLED_BY_OFFLINE_EFFECT_MIDDLEWARE`,
        },
        data: {},
      },
      // Action to dispatch on success
      commit: { type: GET_TAG_COMMIT },
      // Action to dispatch on failure
      rollback: { type: GET_TAG_ROLLBACK },
    },
  },
});

// List Tags
export const listTagsAction = (payload: IRequestListTags) => ({
  type: LIST_TAGS,
  meta: {
    offline: {
      // Define the effect (the API call to make)
      effect: {
        url: `/tags/list`,
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          // Authorization: `Bearer HANDLED_BY_OFFLINE_EFFECT_MIDDLEWARE`,
        },
        data: payload,
      },
      // Action to dispatch on success
      commit: { type: LIST_TAGS_COMMIT },
      // Action to dispatch on failure
      rollback: { type: LIST_TAGS_ROLLBACK },
    },
  },
});

// Create Tag
export const createTagAction = (tagData: IRequestCreateTag) => {
  const id = tagData.id || GenerateID.TagID();
  const payload = {
    ...tagData,
    id,
  };
  return {
    type: CREATE_TAG,
    meta: {
      optimisticID: id,
      offline: {
        effect: {
          url: `/tags/create`,
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            // Authorization: `Bearer HANDLED_BY_OFFLINE_EFFECT_MIDDLEWARE`,
          },
          data: payload,
        },
        // Action to dispatch on success
        commit: { type: CREATE_TAG_COMMIT, meta: { optimisticID: id } },
        // Action to dispatch on failure
        rollback: { type: CREATE_TAG_ROLLBACK, meta: { optimisticID: id } },
      },
    },
  };
};

// Update Tag
export const updateTagAction = (tagData: IRequestUpdateTag) => {
  const id = tagData.id;
  const payload = {
    ...tagData,
  };
  return {
    type: UPDATE_TAG,
    meta: {
      optimisticID: id,
      offline: {
        effect: {
          url: `/tags/update`,
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            // Authorization: `Bearer HANDLED_BY_OFFLINE_EFFECT_MIDDLEWARE`,
          },
          data: payload,
        },
        // Action to dispatch on success
        commit: { type: UPDATE_TAG_COMMIT, meta: { optimisticID: id } },
        // Action to dispatch on failure
        rollback: { type: UPDATE_TAG_ROLLBACK, meta: { optimisticID: id } },
      },
    },
  };
};

// Delete Tag
export const deleteTagAction = (payload: IRequestDeleteTag) => {
  const id = payload.id;
  return {
    type: DELETE_TAG,
    meta: {
      optimisticID: id,
      offline: {
        effect: {
          url: `/tags/delete`,
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            // Authorization: `Bearer HANDLED_BY_OFFLINE_EFFECT_MIDDLEWARE`,
          },
          data: payload,
        },
        // Action to dispatch on success
        commit: { type: DELETE_TAG_COMMIT, meta: { optimisticID: id } },
        // Action to dispatch on failure
        rollback: {
          type: DELETE_TAG_ROLLBACK,
          meta: { optimisticID: id },
        },
      },
    },
  };
};

// src/redux-offline/groups/groups.actions.ts

import {
  UserID,
  GroupID,
  GenerateID,
  IRequestGetGroup,
  IRequestListGroups,
  IRequestCreateGroup,
  IRequestUpdateGroup,
  IRequestDeleteGroup,
  GroupFE,
  DriveID,
  GroupInviteID,
  ExternalID,
  ExternalPayload,
} from "@officexapp/types";

export const GET_GROUP = "GET_GROUP";
export const GET_GROUP_COMMIT = "GET_GROUP_COMMIT";
export const GET_GROUP_ROLLBACK = "GET_GROUP_ROLLBACK";

export const LIST_GROUPS = "LIST_GROUPS";
export const LIST_GROUPS_COMMIT = "LIST_GROUPS_COMMIT";
export const LIST_GROUPS_ROLLBACK = "LIST_GROUPS_ROLLBACK";

export const CREATE_GROUP = "CREATE_GROUP";
export const CREATE_GROUP_COMMIT = "CREATE_GROUP_COMMIT";
export const CREATE_GROUP_ROLLBACK = "CREATE_GROUP_ROLLBACK";

export const UPDATE_GROUP = "UPDATE_GROUP";
export const UPDATE_GROUP_COMMIT = "UPDATE_GROUP_COMMIT";
export const UPDATE_GROUP_ROLLBACK = "UPDATE_GROUP_ROLLBACK";

export const DELETE_GROUP = "DELETE_GROUP";
export const DELETE_GROUP_COMMIT = "DELETE_GROUP_COMMIT";
export const DELETE_GROUP_ROLLBACK = "DELETE_GROUP_ROLLBACK";

export const CHECK_GROUP_TABLE_PERMISSIONS = "CHECK_GROUP_TABLE_PERMISSIONS";
export const CHECK_GROUP_TABLE_PERMISSIONS_COMMIT =
  "CHECK_GROUP_TABLE_PERMISSIONS_COMMIT";
export const CHECK_GROUP_TABLE_PERMISSIONS_ROLLBACK =
  "CHECK_GROUP_TABLE_PERMISSIONS_ROLLBACK";

// Get Group
export const getGroupAction = (group_id: GroupID) => ({
  type: GET_GROUP,
  meta: {
    optimisticID: group_id,
    offline: {
      // Define the effect (the API call to make)
      effect: {
        url: `/groups/get/${group_id}`,
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          // Authorization: `Bearer HANDLED_BY_OFFLINE_EFFECT_MIDDLEWARE`,
        },
        data: {},
      },
      // Action to dispatch on success
      commit: { type: GET_GROUP_COMMIT },
      // Action to dispatch on failure
      rollback: { type: GET_GROUP_ROLLBACK },
    },
  },
});

// List Groups
export const listGroupsAction = (payload: IRequestListGroups) => ({
  type: LIST_GROUPS,
  meta: {
    offline: {
      // Define the effect (the API call to make)
      effect: {
        url: `/groups/list`,
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          // Authorization: `Bearer HANDLED_BY_OFFLINE_EFFECT_MIDDLEWARE`,
        },
        data: payload,
      },
      // Action to dispatch on success
      commit: { type: LIST_GROUPS_COMMIT },
      // Action to dispatch on failure
      rollback: { type: LIST_GROUPS_ROLLBACK },
    },
  },
});

// Create Group
export const createGroupAction = (groupData: IRequestCreateGroup) => {
  const id = groupData.id || GenerateID.Group();
  const payload = {
    ...groupData,
    id,
  };
  return {
    type: CREATE_GROUP,
    meta: {
      optimisticID: id,
      offline: {
        effect: {
          url: `/groups/create`,
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            // Authorization: `Bearer HANDLED_BY_OFFLINE_EFFECT_MIDDLEWARE`,
          },
          data: payload,
        },
        // Action to dispatch on success
        commit: { type: CREATE_GROUP_COMMIT, meta: { optimisticID: id } },
        // Action to dispatch on failure
        rollback: { type: CREATE_GROUP_ROLLBACK, meta: { optimisticID: id } },
      },
    },
  };
};

// Update Group
export const updateGroupAction = (groupData: IRequestUpdateGroup) => {
  const id = groupData.id;
  const payload = {
    ...groupData,
  };
  return {
    type: UPDATE_GROUP,
    meta: {
      optimisticID: id,
      offline: {
        effect: {
          url: `/groups/update`,
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            // Authorization: `Bearer HANDLED_BY_OFFLINE_EFFECT_MIDDLEWARE`,
          },
          data: payload,
        },
        // Action to dispatch on success
        commit: { type: UPDATE_GROUP_COMMIT, meta: { optimisticID: id } },
        // Action to dispatch on failure
        rollback: { type: UPDATE_GROUP_ROLLBACK, meta: { optimisticID: id } },
      },
    },
  };
};

// Delete Group
export const deleteGroupAction = (payload: IRequestDeleteGroup) => {
  const id = payload.id;
  return {
    type: DELETE_GROUP,
    meta: {
      optimisticID: id,
      offline: {
        effect: {
          url: `/groups/delete`,
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            // Authorization: `Bearer HANDLED_BY_OFFLINE_EFFECT_MIDDLEWARE`,
          },
          data: payload,
        },
        // Action to dispatch on success
        commit: { type: DELETE_GROUP_COMMIT, meta: { optimisticID: id } },
        // Action to dispatch on failure
        rollback: {
          type: DELETE_GROUP_ROLLBACK,
          meta: { optimisticID: id },
        },
      },
    },
  };
};

// Check Groups Table Permissions
export const checkGroupTablePermissionsAction = (userID: UserID) => {
  const id = `group_table_permissions_${userID}`;

  const payload = {
    resource_id: "TABLE_GROUPS",
    grantee_id: userID,
  };

  return {
    type: CHECK_GROUP_TABLE_PERMISSIONS,
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
          type: CHECK_GROUP_TABLE_PERMISSIONS_COMMIT,
          meta: { optimisticID: id },
        },
        // Action to dispatch on failure
        rollback: {
          type: CHECK_GROUP_TABLE_PERMISSIONS_ROLLBACK,
          meta: { optimisticID: id },
        },
      },
    },
  };
};

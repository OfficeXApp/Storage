// src/redux-offline/group-invites/group-invites.actions.ts

import {
  UserID,
  GroupID,
  GroupInviteID,
  GroupRole,
  GenerateID,
  GroupInviteFE,
} from "@officexapp/types";

export const GET_GROUP_INVITE = "GET_GROUP_INVITE";
export const GET_GROUP_INVITE_COMMIT = "GET_GROUP_INVITE_COMMIT";
export const GET_GROUP_INVITE_ROLLBACK = "GET_GROUP_INVITE_ROLLBACK";

export const LIST_GROUP_INVITES = "LIST_GROUP_INVITES";
export const LIST_GROUP_INVITES_COMMIT = "LIST_GROUP_INVITES_COMMIT";
export const LIST_GROUP_INVITES_ROLLBACK = "LIST_GROUP_INVITES_ROLLBACK";

export const CREATE_GROUP_INVITE = "CREATE_GROUP_INVITE";
export const CREATE_GROUP_INVITE_COMMIT = "CREATE_GROUP_INVITE_COMMIT";
export const CREATE_GROUP_INVITE_ROLLBACK = "CREATE_GROUP_INVITE_ROLLBACK";

export const UPDATE_GROUP_INVITE = "UPDATE_GROUP_INVITE";
export const UPDATE_GROUP_INVITE_COMMIT = "UPDATE_GROUP_INVITE_COMMIT";
export const UPDATE_GROUP_INVITE_ROLLBACK = "UPDATE_GROUP_INVITE_ROLLBACK";

export const DELETE_GROUP_INVITE = "DELETE_GROUP_INVITE";
export const DELETE_GROUP_INVITE_COMMIT = "DELETE_GROUP_INVITE_COMMIT";
export const DELETE_GROUP_INVITE_ROLLBACK = "DELETE_GROUP_INVITE_ROLLBACK";

// Interface definitions for request payloads
export interface IRequestGetGroupInvite {
  invite_id: GroupInviteID;
}

export interface IRequestListGroupInvites {
  group_id?: GroupID;
  inviter_id?: UserID;
  invitee_id?: UserID;
  include_expired?: boolean;
  page_size?: number;
  page_token?: string;
}

export interface IRequestCreateGroupInvite {
  id?: GroupInviteID;
  group_id: GroupID;
  invitee_id?: UserID;
  role?: GroupRole;
  note?: string;
  active_from?: number;
  expires_at?: number;
  from_placeholder_invitee?: string;
  tags?: string[];
  external_id?: string;
  external_payload?: any;
}

export interface IRequestUpdateGroupInvite {
  id: GroupInviteID;
  role?: GroupRole;
  note?: string;
  active_from?: number;
  expires_at?: number;
  tags?: string[];
  external_payload?: any;
}

export interface IRequestDeleteGroupInvite {
  id: GroupInviteID;
}

export interface IRequestRedeemGroupInvite {
  id: GroupInviteID;
  new_user_id: UserID;
}

// Get Group Invite
export const getGroupInviteAction = (invite_id: GroupInviteID) => ({
  type: GET_GROUP_INVITE,
  meta: {
    optimisticID: invite_id,
    offline: {
      // Define the effect (the API call to make)
      effect: {
        url: `/groups/invites/get/${invite_id}`,
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          // Authorization: `Bearer HANDLED_BY_OFFLINE_EFFECT_MIDDLEWARE`,
        },
        data: {},
      },
      // Action to dispatch on success
      commit: { type: GET_GROUP_INVITE_COMMIT },
      // Action to dispatch on failure
      rollback: { type: GET_GROUP_INVITE_ROLLBACK },
    },
  },
});

// List Group Invites
export const listGroupInvitesAction = (payload: IRequestListGroupInvites) => ({
  type: LIST_GROUP_INVITES,
  meta: {
    offline: {
      // Define the effect (the API call to make)
      effect: {
        url: `/groups/invites/list`,
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          // Authorization: `Bearer HANDLED_BY_OFFLINE_EFFECT_MIDDLEWARE`,
        },
        data: payload,
      },
      // Action to dispatch on success
      commit: { type: LIST_GROUP_INVITES_COMMIT },
      // Action to dispatch on failure
      rollback: { type: LIST_GROUP_INVITES_ROLLBACK },
    },
  },
});

// Create Group Invite
export const createGroupInviteAction = (
  inviteData: IRequestCreateGroupInvite
) => {
  const id = inviteData.id || GenerateID.GroupInvite();
  const payload = {
    ...inviteData,
    id,
  };
  return {
    type: CREATE_GROUP_INVITE,
    meta: {
      optimisticID: id,
      offline: {
        effect: {
          url: `/groups/invites/create`,
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            // Authorization: `Bearer HANDLED_BY_OFFLINE_EFFECT_MIDDLEWARE`,
          },
          data: payload,
        },
        // Action to dispatch on success
        commit: {
          type: CREATE_GROUP_INVITE_COMMIT,
          meta: { optimisticID: id },
        },
        // Action to dispatch on failure
        rollback: {
          type: CREATE_GROUP_INVITE_ROLLBACK,
          meta: { optimisticID: id },
        },
      },
    },
  };
};

// Update Group Invite
export const updateGroupInviteAction = (
  inviteData: IRequestUpdateGroupInvite
) => {
  const id = inviteData.id;
  const payload = {
    ...inviteData,
  };
  return {
    type: UPDATE_GROUP_INVITE,
    meta: {
      optimisticID: id,
      offline: {
        effect: {
          url: `/groups/invites/update`,
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            // Authorization: `Bearer HANDLED_BY_OFFLINE_EFFECT_MIDDLEWARE`,
          },
          data: payload,
        },
        // Action to dispatch on success
        commit: {
          type: UPDATE_GROUP_INVITE_COMMIT,
          meta: { optimisticID: id },
        },
        // Action to dispatch on failure
        rollback: {
          type: UPDATE_GROUP_INVITE_ROLLBACK,
          meta: { optimisticID: id },
        },
      },
    },
  };
};

// Delete Group Invite
export const deleteGroupInviteAction = (payload: IRequestDeleteGroupInvite) => {
  const id = payload.id;
  return {
    type: DELETE_GROUP_INVITE,
    meta: {
      optimisticID: id,
      offline: {
        effect: {
          url: `/groups/invites/delete`,
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            // Authorization: `Bearer HANDLED_BY_OFFLINE_EFFECT_MIDDLEWARE`,
          },
          data: payload,
        },
        // Action to dispatch on success
        commit: {
          type: DELETE_GROUP_INVITE_COMMIT,
          meta: { optimisticID: id },
        },
        // Action to dispatch on failure
        rollback: {
          type: DELETE_GROUP_INVITE_ROLLBACK,
          meta: { optimisticID: id },
        },
      },
    },
  };
};

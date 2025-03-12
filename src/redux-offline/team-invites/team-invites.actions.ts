// src/redux-offline/team-invites/team-invites.actions.ts

import {
  UserID,
  TeamID,
  TeamInviteID,
  TeamRole,
  GenerateID,
  TeamInviteFE,
} from "@officexapp/types";

export const GET_TEAM_INVITE = "GET_TEAM_INVITE";
export const GET_TEAM_INVITE_COMMIT = "GET_TEAM_INVITE_COMMIT";
export const GET_TEAM_INVITE_ROLLBACK = "GET_TEAM_INVITE_ROLLBACK";

export const LIST_TEAM_INVITES = "LIST_TEAM_INVITES";
export const LIST_TEAM_INVITES_COMMIT = "LIST_TEAM_INVITES_COMMIT";
export const LIST_TEAM_INVITES_ROLLBACK = "LIST_TEAM_INVITES_ROLLBACK";

export const CREATE_TEAM_INVITE = "CREATE_TEAM_INVITE";
export const CREATE_TEAM_INVITE_COMMIT = "CREATE_TEAM_INVITE_COMMIT";
export const CREATE_TEAM_INVITE_ROLLBACK = "CREATE_TEAM_INVITE_ROLLBACK";

export const UPDATE_TEAM_INVITE = "UPDATE_TEAM_INVITE";
export const UPDATE_TEAM_INVITE_COMMIT = "UPDATE_TEAM_INVITE_COMMIT";
export const UPDATE_TEAM_INVITE_ROLLBACK = "UPDATE_TEAM_INVITE_ROLLBACK";

export const DELETE_TEAM_INVITE = "DELETE_TEAM_INVITE";
export const DELETE_TEAM_INVITE_COMMIT = "DELETE_TEAM_INVITE_COMMIT";
export const DELETE_TEAM_INVITE_ROLLBACK = "DELETE_TEAM_INVITE_ROLLBACK";

// Interface definitions for request payloads
export interface IRequestGetTeamInvite {
  invite_id: TeamInviteID;
}

export interface IRequestListTeamInvites {
  team_id?: TeamID;
  inviter_id?: UserID;
  invitee_id?: UserID;
  include_expired?: boolean;
  page_size?: number;
  page_token?: string;
}

export interface IRequestCreateTeamInvite {
  id?: TeamInviteID;
  team_id: TeamID;
  inviter_id: UserID;
  invitee_id: UserID;
  role: TeamRole;
  note?: string;
  active_from?: number;
  expires_at?: number;
  from_placeholder_invitee?: string;
  tags?: string[];
  external_id?: string;
  external_payload?: any;
}

export interface IRequestUpdateTeamInvite {
  id: TeamInviteID;
  role?: TeamRole;
  note?: string;
  active_from?: number;
  expires_at?: number;
  tags?: string[];
  external_payload?: any;
}

export interface IRequestDeleteTeamInvite {
  id: TeamInviteID;
}

export interface IRequestRedeemTeamInvite {
  id: TeamInviteID;
  new_user_id: UserID;
}

// Get Team Invite
export const getTeamInviteAction = (invite_id: TeamInviteID) => ({
  type: GET_TEAM_INVITE,
  meta: {
    optimisticID: invite_id,
    offline: {
      // Define the effect (the API call to make)
      effect: {
        url: `/teams/invites/get/${invite_id}`,
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          // Authorization: `Bearer HANDLED_BY_OFFLINE_EFFECT_MIDDLEWARE`,
        },
        data: {},
      },
      // Action to dispatch on success
      commit: { type: GET_TEAM_INVITE_COMMIT },
      // Action to dispatch on failure
      rollback: { type: GET_TEAM_INVITE_ROLLBACK },
    },
  },
});

// List Team Invites
export const listTeamInvitesAction = (payload: IRequestListTeamInvites) => ({
  type: LIST_TEAM_INVITES,
  meta: {
    offline: {
      // Define the effect (the API call to make)
      effect: {
        url: `/teams/invites/list`,
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          // Authorization: `Bearer HANDLED_BY_OFFLINE_EFFECT_MIDDLEWARE`,
        },
        data: payload,
      },
      // Action to dispatch on success
      commit: { type: LIST_TEAM_INVITES_COMMIT },
      // Action to dispatch on failure
      rollback: { type: LIST_TEAM_INVITES_ROLLBACK },
    },
  },
});

// Create Team Invite
export const createTeamInviteAction = (
  inviteData: IRequestCreateTeamInvite
) => {
  const id = inviteData.id || GenerateID.TeamInvite();
  const payload = {
    ...inviteData,
    id,
  };
  return {
    type: CREATE_TEAM_INVITE,
    meta: {
      optimisticID: id,
      offline: {
        effect: {
          url: `/teams/invites/create`,
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            // Authorization: `Bearer HANDLED_BY_OFFLINE_EFFECT_MIDDLEWARE`,
          },
          data: payload,
        },
        // Action to dispatch on success
        commit: { type: CREATE_TEAM_INVITE_COMMIT, meta: { optimisticID: id } },
        // Action to dispatch on failure
        rollback: {
          type: CREATE_TEAM_INVITE_ROLLBACK,
          meta: { optimisticID: id },
        },
      },
    },
  };
};

// Update Team Invite
export const updateTeamInviteAction = (
  inviteData: IRequestUpdateTeamInvite
) => {
  const id = inviteData.id;
  const payload = {
    ...inviteData,
  };
  return {
    type: UPDATE_TEAM_INVITE,
    meta: {
      optimisticID: id,
      offline: {
        effect: {
          url: `/teams/invites/update`,
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            // Authorization: `Bearer HANDLED_BY_OFFLINE_EFFECT_MIDDLEWARE`,
          },
          data: payload,
        },
        // Action to dispatch on success
        commit: { type: UPDATE_TEAM_INVITE_COMMIT, meta: { optimisticID: id } },
        // Action to dispatch on failure
        rollback: {
          type: UPDATE_TEAM_INVITE_ROLLBACK,
          meta: { optimisticID: id },
        },
      },
    },
  };
};

// Delete Team Invite
export const deleteTeamInviteAction = (payload: IRequestDeleteTeamInvite) => {
  const id = payload.id;
  return {
    type: DELETE_TEAM_INVITE,
    meta: {
      optimisticID: id,
      offline: {
        effect: {
          url: `/teams/invites/delete`,
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            // Authorization: `Bearer HANDLED_BY_OFFLINE_EFFECT_MIDDLEWARE`,
          },
          data: payload,
        },
        // Action to dispatch on success
        commit: { type: DELETE_TEAM_INVITE_COMMIT, meta: { optimisticID: id } },
        // Action to dispatch on failure
        rollback: {
          type: DELETE_TEAM_INVITE_ROLLBACK,
          meta: { optimisticID: id },
        },
      },
    },
  };
};

// src/redux-offline/teams/teams.actions.ts

import {
  UserID,
  TeamID,
  GenerateID,
  IRequestGetTeam,
  IRequestListTeams,
  IRequestCreateTeam,
  IRequestUpdateTeam,
  IRequestDeleteTeam,
  TeamFE,
  DriveID,
  TeamInviteID,
  URLEndpoint,
  ExternalID,
  ExternalPayload,
} from "@officexapp/types";

export const GET_TEAM = "GET_TEAM";
export const GET_TEAM_COMMIT = "GET_TEAM_COMMIT";
export const GET_TEAM_ROLLBACK = "GET_TEAM_ROLLBACK";

export const LIST_TEAMS = "LIST_TEAMS";
export const LIST_TEAMS_COMMIT = "LIST_TEAMS_COMMIT";
export const LIST_TEAMS_ROLLBACK = "LIST_TEAMS_ROLLBACK";

export const CREATE_TEAM = "CREATE_TEAM";
export const CREATE_TEAM_COMMIT = "CREATE_TEAM_COMMIT";
export const CREATE_TEAM_ROLLBACK = "CREATE_TEAM_ROLLBACK";

export const UPDATE_TEAM = "UPDATE_TEAM";
export const UPDATE_TEAM_COMMIT = "UPDATE_TEAM_COMMIT";
export const UPDATE_TEAM_ROLLBACK = "UPDATE_TEAM_ROLLBACK";

export const DELETE_TEAM = "DELETE_TEAM";
export const DELETE_TEAM_COMMIT = "DELETE_TEAM_COMMIT";
export const DELETE_TEAM_ROLLBACK = "DELETE_TEAM_ROLLBACK";

// Get Team
export const getTeamAction = (team_id: TeamID) => ({
  type: GET_TEAM,
  meta: {
    optimisticID: team_id,
    offline: {
      // Define the effect (the API call to make)
      effect: {
        url: `/teams/get/${team_id}`,
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          // Authorization: `Bearer HANDLED_BY_OFFLINE_EFFECT_MIDDLEWARE`,
        },
        data: {},
      },
      // Action to dispatch on success
      commit: { type: GET_TEAM_COMMIT },
      // Action to dispatch on failure
      rollback: { type: GET_TEAM_ROLLBACK },
    },
  },
});

// List Teams
export const listTeamsAction = (payload: IRequestListTeams) => ({
  type: LIST_TEAMS,
  meta: {
    offline: {
      // Define the effect (the API call to make)
      effect: {
        url: `/teams/list`,
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          // Authorization: `Bearer HANDLED_BY_OFFLINE_EFFECT_MIDDLEWARE`,
        },
        data: payload,
      },
      // Action to dispatch on success
      commit: { type: LIST_TEAMS_COMMIT },
      // Action to dispatch on failure
      rollback: { type: LIST_TEAMS_ROLLBACK },
    },
  },
});

// Create Team
export const createTeamAction = (teamData: IRequestCreateTeam) => {
  const id = teamData.id || GenerateID.Team();
  const payload = {
    ...teamData,
    id,
  };
  return {
    type: CREATE_TEAM,
    meta: {
      optimisticID: id,
      offline: {
        effect: {
          url: `/teams/create`,
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            // Authorization: `Bearer HANDLED_BY_OFFLINE_EFFECT_MIDDLEWARE`,
          },
          data: payload,
        },
        // Action to dispatch on success
        commit: { type: CREATE_TEAM_COMMIT, meta: { optimisticID: id } },
        // Action to dispatch on failure
        rollback: { type: CREATE_TEAM_ROLLBACK, meta: { optimisticID: id } },
      },
    },
  };
};

// Update Team
export const updateTeamAction = (teamData: IRequestUpdateTeam) => {
  const id = teamData.id;
  const payload = {
    ...teamData,
  };
  return {
    type: UPDATE_TEAM,
    meta: {
      optimisticID: id,
      offline: {
        effect: {
          url: `/teams/update`,
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            // Authorization: `Bearer HANDLED_BY_OFFLINE_EFFECT_MIDDLEWARE`,
          },
          data: payload,
        },
        // Action to dispatch on success
        commit: { type: UPDATE_TEAM_COMMIT, meta: { optimisticID: id } },
        // Action to dispatch on failure
        rollback: { type: UPDATE_TEAM_ROLLBACK, meta: { optimisticID: id } },
      },
    },
  };
};

// Delete Team
export const deleteTeamAction = (payload: IRequestDeleteTeam) => {
  const id = payload.id;
  return {
    type: DELETE_TEAM,
    meta: {
      optimisticID: id,
      offline: {
        effect: {
          url: `/teams/delete`,
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            // Authorization: `Bearer HANDLED_BY_OFFLINE_EFFECT_MIDDLEWARE`,
          },
          data: payload,
        },
        // Action to dispatch on success
        commit: { type: DELETE_TEAM_COMMIT, meta: { optimisticID: id } },
        // Action to dispatch on failure
        rollback: {
          type: DELETE_TEAM_ROLLBACK,
          meta: { optimisticID: id },
        },
      },
    },
  };
};

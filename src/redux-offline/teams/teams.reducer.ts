// src/redux-offline/teams/teams.reducer.ts
import { TeamFE, UserID, TeamID } from "@officexapp/types";
import {
  CREATE_TEAM,
  CREATE_TEAM_COMMIT,
  CREATE_TEAM_ROLLBACK,
  LIST_TEAMS,
  LIST_TEAMS_COMMIT,
  LIST_TEAMS_ROLLBACK,
  GET_TEAM,
  GET_TEAM_COMMIT,
  GET_TEAM_ROLLBACK,
  UPDATE_TEAM,
  UPDATE_TEAM_COMMIT,
  UPDATE_TEAM_ROLLBACK,
  DELETE_TEAM,
  DELETE_TEAM_COMMIT,
  DELETE_TEAM_ROLLBACK,
} from "./teams.actions";

export const TEAMS_REDUX_KEY = "teams";
export const TEAMS_DEXIE_TABLE = TEAMS_REDUX_KEY;

export interface TeamFEO extends TeamFE {
  _isOptimistic?: boolean; // flag for optimistic updates
  _optimisticID?: string; // unique ID for optimistic updates
  _syncWarning?: string; // tooltip for users
  _syncConflict?: boolean; // flag for corrupted data due to sync failures
  _syncSuccess?: boolean; // flag for successful sync
  _markedForDeletion?: boolean; // flag for deletion
}

interface TeamsState {
  teams: TeamFEO[];
  teamMap: Record<TeamID, TeamFEO>;
  loading: boolean;
  error: string | null;
}

const initialState: TeamsState = {
  teams: [],
  teamMap: {},
  loading: false,
  error: null,
};

const updateOrAddTeam = (
  teams: TeamFEO[],
  newTeam: TeamFEO,
  identifierKey: keyof TeamFEO = "id"
): TeamFEO[] => {
  const existingIndex = teams.findIndex(
    (team) => team[identifierKey] === newTeam[identifierKey]
  );

  if (existingIndex !== -1) {
    // Replace existing team
    return [
      ...teams.slice(0, existingIndex),
      newTeam,
      ...teams.slice(existingIndex + 1),
    ];
  } else {
    // Add to the front of the array
    return [newTeam, ...teams];
  }
};

export const teamsReducer = (state = initialState, action: any): TeamsState => {
  switch (action.type) {
    // ------------------------------ GET TEAM --------------------------------- //

    // Get Team
    case GET_TEAM: {
      if (!action.optimistic) return { ...state, loading: true, error: null };

      return {
        ...state,
        teams: updateOrAddTeam(state.teams, action.optimistic),
        teamMap: {
          ...state.teamMap,
          [action.optimistic.id]: action.optimistic,
        },
        loading: true,
        error: null,
      };
    }

    case GET_TEAM_COMMIT: {
      const optimisticID = action.meta?.optimisticID;
      const teamData = action.payload.ok.data;

      // Update the optimistic team with the real data
      return {
        ...state,
        teams: state.teams.map((team) => {
          if (team._optimisticID === optimisticID) {
            return teamData;
          }
          return team;
        }),
        teamMap: {
          ...state.teamMap,
          [teamData.id]: teamData,
        },
        loading: false,
      };
    }

    case GET_TEAM_ROLLBACK: {
      // Update the optimistic team with the error message
      const newTeamMap = { ...state.teamMap };
      delete newTeamMap[action.meta.optimisticID];
      return {
        ...state,
        teams: state.teams.map((team) => {
          if (team._optimisticID === action.meta.optimisticID) {
            return {
              ...team,
              _syncWarning: action.error_message,
              _syncSuccess: false,
              _syncConflict: true,
              _isOptimistic: false,
            };
          }
          return team;
        }),
        teamMap: newTeamMap,
        loading: false,
        error: action.payload.message || "Failed to fetch team",
      };
    }

    // ------------------------------ LIST TEAMS --------------------------------- //

    case LIST_TEAMS: {
      return {
        ...state,
        teams: action.optimistic || [],
        loading: true,
        error: null,
      };
    }

    case LIST_TEAMS_COMMIT: {
      const teamsData = action.payload.ok.data.items;
      const teamMap = teamsData.reduce((acc: any, team: any) => {
        acc[team.id] = team;
        return acc;
      }, {});

      return {
        ...state,
        teams: teamsData,
        teamMap,
        loading: false,
      };
    }

    case LIST_TEAMS_ROLLBACK: {
      return {
        ...state,
        teams: [],
        loading: false,
        error: action.error_message || "Failed to fetch teams",
      };
    }

    // ------------------------------ CREATE TEAM --------------------------------- //

    case CREATE_TEAM: {
      if (!action.optimistic) return { ...state, loading: true, error: null };

      const optimisticTeam = action.optimistic;
      return {
        ...state,
        teams: updateOrAddTeam(state.teams, optimisticTeam, "_optimisticID"),
        teamMap: {
          ...state.teamMap,
          [optimisticTeam.id]: optimisticTeam,
        },
        loading: true,
        error: null,
      };
    }

    case CREATE_TEAM_COMMIT: {
      const optimisticID = action.meta?.optimisticID;
      const newTeam = {
        ...action.payload.ok.data,
        _syncSuccess: true,
        _syncConflict: false,
        _syncWarning: "",
        _isOptimistic: false,
      };

      // Remove the optimistic team from our items array
      const filteredTeams = state.teams.filter(
        (team) => team._optimisticID !== optimisticID
      );

      // Create a new teamMap without the optimistic entry
      const newTeamMap = { ...state.teamMap };
      delete newTeamMap[optimisticID];
      newTeamMap[newTeam.id] = newTeam;

      return {
        ...state,
        // Add the newly created team to our items array
        teams: updateOrAddTeam(filteredTeams, newTeam),
        teamMap: newTeamMap,
        loading: false,
      };
    }

    case CREATE_TEAM_ROLLBACK: {
      // Add a sync warning to the optimistic team
      const newReduxTeams = state.teams.map((team) => {
        if (team._optimisticID === action.meta.optimisticID) {
          return {
            ...team,
            _syncWarning: action.error_message,
            _syncSuccess: false,
            _syncConflict: true,
            _isOptimistic: false,
          };
        }
        return team;
      });

      return {
        ...state,
        teams: newReduxTeams,
        loading: false,
        error: action.payload.message || "Failed to create team",
      };
    }

    // ------------------------------ UPDATE TEAM --------------------------------- //

    case UPDATE_TEAM: {
      if (!action.optimistic) return { ...state, loading: true, error: null };

      const optimisticTeam = action.optimistic;
      return {
        ...state,
        teams: updateOrAddTeam(state.teams, optimisticTeam),
        teamMap: {
          ...state.teamMap,
          [optimisticTeam.id]: optimisticTeam,
        },
        loading: true,
        error: null,
      };
    }

    case UPDATE_TEAM_COMMIT: {
      const optimisticID = action.meta?.optimisticID;
      const updatedTeam = {
        ...action.payload.ok.data,
        _syncSuccess: true,
        _syncConflict: false,
        _syncWarning: "",
        _isOptimistic: false,
      };

      // Update the optimistic team with the real data
      return {
        ...state,
        teams: state.teams.map((team) => {
          if (team._optimisticID === optimisticID) {
            return updatedTeam;
          }
          return team;
        }),
        teamMap: {
          ...state.teamMap,
          [updatedTeam.id]: updatedTeam,
        },
        loading: false,
      };
    }

    case UPDATE_TEAM_ROLLBACK: {
      // Update the optimistic team with the error message
      return {
        ...state,
        teams: state.teams.map((team) => {
          if (team._optimisticID === action.meta.optimisticID) {
            return {
              ...team,
              _syncWarning: action.error_message,
              _syncSuccess: false,
              _syncConflict: true,
              _isOptimistic: false,
            };
          }
          return team;
        }),
        loading: false,
        error: action.payload.message || "Failed to update team",
      };
    }

    // ------------------------------ DELETE TEAM --------------------------------- //

    case DELETE_TEAM: {
      if (!action.optimistic) return { ...state, loading: true, error: null };

      const optimisticTeam = action.optimistic;
      return {
        ...state,
        teams: updateOrAddTeam(state.teams, optimisticTeam),
        teamMap: {
          ...state.teamMap,
          [optimisticTeam.id]: optimisticTeam,
        },
        loading: true,
        error: null,
      };
    }

    case DELETE_TEAM_COMMIT: {
      const optimisticID = action.meta?.optimisticID;

      // Remove the team from our state
      const filteredTeams = state.teams.filter(
        (team) => team._optimisticID !== optimisticID
      );

      // Create a new teamMap without the deleted entry
      const newTeamMap = { ...state.teamMap };
      delete newTeamMap[optimisticID];

      return {
        ...state,
        teams: filteredTeams,
        teamMap: newTeamMap,
        loading: false,
      };
    }

    case DELETE_TEAM_ROLLBACK: {
      // Update the optimistic team with the error message
      return {
        ...state,
        teams: state.teams.map((team) => {
          if (team._optimisticID === action.meta.optimisticID) {
            return {
              ...team,
              _syncWarning: action.error_message,
              _syncSuccess: false,
              _syncConflict: true,
              _isOptimistic: false,
              _markedForDeletion: false,
            };
          }
          return team;
        }),
        loading: false,
        error: action.payload.message || "Failed to delete team",
      };
    }

    default:
      return state;
  }
};

// src/redux-offline/team-invites/team-invites.reducer.ts
import { TeamInviteFE, TeamInviteID } from "@officexapp/types";
import {
  CREATE_TEAM_INVITE,
  CREATE_TEAM_INVITE_COMMIT,
  CREATE_TEAM_INVITE_ROLLBACK,
  LIST_TEAM_INVITES,
  LIST_TEAM_INVITES_COMMIT,
  LIST_TEAM_INVITES_ROLLBACK,
  GET_TEAM_INVITE,
  GET_TEAM_INVITE_COMMIT,
  GET_TEAM_INVITE_ROLLBACK,
  UPDATE_TEAM_INVITE,
  UPDATE_TEAM_INVITE_COMMIT,
  UPDATE_TEAM_INVITE_ROLLBACK,
  DELETE_TEAM_INVITE,
  DELETE_TEAM_INVITE_COMMIT,
  DELETE_TEAM_INVITE_ROLLBACK,
} from "./team-invites.actions";

export const TEAM_INVITES_REDUX_KEY = "teamInvites";
export const TEAM_INVITES_DEXIE_TABLE = TEAM_INVITES_REDUX_KEY;

export interface TeamInviteFEO extends TeamInviteFE {
  _isOptimistic?: boolean; // flag for optimistic updates
  _optimisticID?: string; // unique ID for optimistic updates
  _syncWarning?: string; // tooltip for users
  _syncConflict?: boolean; // flag for corrupted data due to sync failures
  _syncSuccess?: boolean; // flag for successful sync
  _markedForDeletion?: boolean; // flag for deletion
}

interface TeamInvitesState {
  invites: TeamInviteFEO[];
  inviteMap: Record<TeamInviteID, TeamInviteFEO>;
  loading: boolean;
  error: string | null;
}

const initialState: TeamInvitesState = {
  invites: [],
  inviteMap: {},
  loading: false,
  error: null,
};

const updateOrAddInvite = (
  invites: TeamInviteFEO[],
  newInvite: TeamInviteFEO,
  identifierKey: keyof TeamInviteFEO = "id"
): TeamInviteFEO[] => {
  const existingIndex = invites.findIndex(
    (invite) => invite[identifierKey] === newInvite[identifierKey]
  );

  if (existingIndex !== -1) {
    // Replace existing invite
    return [
      ...invites.slice(0, existingIndex),
      newInvite,
      ...invites.slice(existingIndex + 1),
    ];
  } else {
    // Add to the front of the array
    return [newInvite, ...invites];
  }
};

export const teamInvitesReducer = (
  state = initialState,
  action: any
): TeamInvitesState => {
  switch (action.type) {
    // ------------------------------ GET TEAM INVITE --------------------------------- //

    // Get Team Invite
    case GET_TEAM_INVITE: {
      if (!action.optimistic) return { ...state, loading: true, error: null };

      return {
        ...state,
        invites: updateOrAddInvite(state.invites, action.optimistic),
        inviteMap: {
          ...state.inviteMap,
          [action.optimistic.id]: action.optimistic,
        },
        loading: true,
        error: null,
      };
    }

    case GET_TEAM_INVITE_COMMIT: {
      const optimisticID = action.meta?.optimisticID;
      // Update the optimistic invite with the real data
      return {
        ...state,
        invites: state.invites.map((invite) => {
          if (invite._optimisticID === optimisticID) {
            return action.payload.ok.data;
          }
          return invite;
        }),
        inviteMap: {
          ...state.inviteMap,
          [action.payload.ok.data.id]: action.payload.ok.data,
        },
        loading: false,
      };
    }

    case GET_TEAM_INVITE_ROLLBACK: {
      // Update the optimistic invite with the error message
      const newInviteMap = { ...state.inviteMap };
      delete newInviteMap[action.meta.optimisticID];
      return {
        ...state,
        invites: state.invites.map((invite) => {
          if (invite._optimisticID === action.meta.optimisticID) {
            return {
              ...invite,
              _syncWarning: action.error_message,
              _syncSuccess: false,
              _syncConflict: true,
              _isOptimistic: false,
            };
          }
          return invite;
        }),
        inviteMap: newInviteMap,
        loading: false,
        error: action.payload.message || "Failed to fetch team invite",
      };
    }

    // ------------------------------ LIST TEAM INVITES --------------------------------- //

    case LIST_TEAM_INVITES: {
      return {
        ...state,
        invites: action.optimistic || [],
        loading: true,
        error: null,
      };
    }

    case LIST_TEAM_INVITES_COMMIT: {
      // find & replace optimistic invites with action.payload.ok.data.items
      // or even replace entire invites
      return {
        ...state,
        invites: action.payload.ok.data.items,
        loading: false,
      };
    }

    case LIST_TEAM_INVITES_ROLLBACK: {
      return {
        ...state,
        invites: [],
        loading: false,
        error: action.error_message || "Failed to fetch team invites",
      };
    }

    // ------------------------------ CREATE TEAM INVITE --------------------------------- //

    case CREATE_TEAM_INVITE: {
      const optimisticInvite = action.optimistic;
      if (!optimisticInvite) return { ...state, loading: true, error: null };

      return {
        ...state,
        invites: updateOrAddInvite(
          state.invites,
          optimisticInvite,
          "_optimisticID"
        ),
        loading: true,
        error: null,
      };
    }

    case CREATE_TEAM_INVITE_COMMIT: {
      const optimisticID = action.meta?.optimisticID;
      // Remove the optimistic invite from our items array & indexdb
      const newInvite = {
        ...action.payload.ok.data,
        _syncSuccess: true,
        _syncConflict: false,
        _syncWarning: "",
        _isOptimistic: false,
      };
      const filteredInvites = state.invites.filter(
        (invite) => invite._optimisticID !== optimisticID
      );
      // removal from dexie is already handled in optimistic middleware which can handle async, whereas reducers are pure sync functions
      return {
        ...state,
        // Add the newly created invite to our items array
        invites: updateOrAddInvite(filteredInvites, newInvite),
        loading: false,
      };
    }

    case CREATE_TEAM_INVITE_ROLLBACK: {
      // Add a sync warning to the optimistic invite
      const newReduxInvites = state.invites.map((invite) => {
        if (invite._optimisticID === action.meta.optimisticID) {
          return {
            ...invite,
            _syncWarning: action.error_message,
            _syncSuccess: false,
            _syncConflict: true,
            _isOptimistic: false,
          };
        }
        return invite;
      });
      // removal from dexie is already handled in optimistic middleware which can handle async, whereas reducers are pure sync functions
      return {
        ...state,
        invites: newReduxInvites,
        loading: false,
        error: action.payload.message || "Failed to create team invite",
      };
    }

    // ------------------------------ UPDATE TEAM INVITE --------------------------------- //

    case UPDATE_TEAM_INVITE: {
      const optimisticInvite = action.optimistic;
      if (!optimisticInvite) return { ...state, loading: true, error: null };

      return {
        ...state,
        invites: updateOrAddInvite(state.invites, optimisticInvite),
        loading: true,
        error: null,
      };
    }

    case UPDATE_TEAM_INVITE_COMMIT: {
      const optimisticID = action.meta?.optimisticID;
      // Update the optimistic invite with the real data
      return {
        ...state,
        invites: state.invites.map((invite) => {
          if (invite._optimisticID === optimisticID) {
            return {
              ...invite,
              ...action.payload.ok.data,
              _syncSuccess: true,
              _syncConflict: false,
              _syncWarning: "",
              _isOptimistic: false,
            };
          }
          return invite;
        }),
        loading: false,
      };
    }

    case UPDATE_TEAM_INVITE_ROLLBACK: {
      // Update the optimistic invite with the error message
      return {
        ...state,
        invites: state.invites.map((invite) => {
          if (invite._optimisticID === action.meta.optimisticID) {
            return {
              ...invite,
              _syncWarning: action.error_message,
              _syncSuccess: false,
              _syncConflict: true,
              _isOptimistic: false,
            };
          }
          return invite;
        }),
        loading: false,
        error: action.payload.message || "Failed to update team invite",
      };
    }

    // ------------------------------ DELETE TEAM INVITE --------------------------------- //

    case DELETE_TEAM_INVITE: {
      const optimisticInvite = action.optimistic;
      if (!optimisticInvite) return { ...state, loading: true, error: null };

      return {
        ...state,
        invites: updateOrAddInvite(state.invites, optimisticInvite),
        loading: true,
        error: null,
      };
    }

    case DELETE_TEAM_INVITE_COMMIT: {
      const optimisticID = action.meta?.optimisticID;
      // Update the optimistic invite with the real data
      return {
        ...state,
        invites: state.invites.filter(
          (invite) => invite._optimisticID !== optimisticID
        ),
        loading: false,
      };
    }

    case DELETE_TEAM_INVITE_ROLLBACK: {
      // Update the optimistic invite with the error message
      return {
        ...state,
        invites: state.invites.map((invite) => {
          if (invite._optimisticID === action.meta.optimisticID) {
            return {
              ...invite,
              _syncWarning: action.error_message,
              _syncSuccess: false,
              _syncConflict: true,
              _isOptimistic: false,
            };
          }
          return invite;
        }),
        loading: false,
        error: action.payload.message || "Failed to delete team invite",
      };
    }

    default:
      return state;
  }
};

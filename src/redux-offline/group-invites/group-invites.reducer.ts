// src/redux-offline/group-invites/group-invites.reducer.ts
import { GroupInviteFE, GroupInviteID } from "@officexapp/types";
import {
  CREATE_GROUP_INVITE,
  CREATE_GROUP_INVITE_COMMIT,
  CREATE_GROUP_INVITE_ROLLBACK,
  LIST_GROUP_INVITES,
  LIST_GROUP_INVITES_COMMIT,
  LIST_GROUP_INVITES_ROLLBACK,
  GET_GROUP_INVITE,
  GET_GROUP_INVITE_COMMIT,
  GET_GROUP_INVITE_ROLLBACK,
  UPDATE_GROUP_INVITE,
  UPDATE_GROUP_INVITE_COMMIT,
  UPDATE_GROUP_INVITE_ROLLBACK,
  DELETE_GROUP_INVITE,
  DELETE_GROUP_INVITE_COMMIT,
  DELETE_GROUP_INVITE_ROLLBACK,
} from "./group-invites.actions";

export const GROUP_INVITES_REDUX_KEY = "groupInvites";
export const GROUP_INVITES_DEXIE_TABLE = GROUP_INVITES_REDUX_KEY;

export interface GroupInviteFEO extends GroupInviteFE {
  _isOptimistic?: boolean; // flag for optimistic updates
  _optimisticID?: string; // unique ID for optimistic updates
  _syncWarning?: string; // tooltip for users
  _syncConflict?: boolean; // flag for corrupted data due to sync failures
  _syncSuccess?: boolean; // flag for successful sync
  _markedForDeletion?: boolean; // flag for deletion
  lastChecked?: number;
}

interface GroupInvitesState {
  invites: GroupInviteFEO[];
  inviteMap: Record<GroupInviteID, GroupInviteFEO>;
  loading: boolean;
  error: string | null;
  lastChecked: number;
}

const initialState: GroupInvitesState = {
  invites: [],
  inviteMap: {},
  loading: false,
  error: null,
  lastChecked: 0,
};

const updateOrAddInvite = (
  invites: GroupInviteFEO[],
  newInvite: GroupInviteFEO,
  identifierKey: keyof GroupInviteFEO = "id"
): GroupInviteFEO[] => {
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

export const groupInvitesReducer = (
  state = initialState,
  action: any
): GroupInvitesState => {
  switch (action.type) {
    // ------------------------------ GET GROUP INVITE --------------------------------- //

    // Get Group Invite
    case GET_GROUP_INVITE: {
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

    case GET_GROUP_INVITE_COMMIT: {
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
          [action.payload.ok.data.id]: {
            ...action.payload.ok.data,
            lastChecked: Date.now(),
          },
        },
        loading: false,
      };
    }

    case GET_GROUP_INVITE_ROLLBACK: {
      if (!action.payload.response) return state;
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
        error: action.payload.message || "Failed to fetch group invite",
      };
    }

    // ------------------------------ LIST GROUP INVITES --------------------------------- //

    case LIST_GROUP_INVITES: {
      return {
        ...state,
        invites: action.optimistic || [],
        loading: true,
        error: null,
      };
    }

    case LIST_GROUP_INVITES_COMMIT: {
      // find & replace optimistic invites with action.payload.ok.data.items
      // or even replace entire invites
      return {
        ...state,
        invites: action.payload.ok.data.items,
        inviteMap: action.payload.ok.data.items.reduce(
          (
            acc: Record<GroupInviteID, GroupInviteFEO>,
            item: GroupInviteFEO
          ) => {
            acc[item.id] = { ...item, lastChecked: Date.now() };
            return acc;
          },
          state.inviteMap
        ),
        loading: false,
        lastChecked: Date.now(),
      };
    }

    case LIST_GROUP_INVITES_ROLLBACK: {
      if (!action.payload.response) return state;
      return {
        ...state,
        invites: [],
        loading: false,
        error: action.error_message || "Failed to fetch group invites",
      };
    }

    // ------------------------------ CREATE GROUP INVITE --------------------------------- //

    case CREATE_GROUP_INVITE: {
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

    case CREATE_GROUP_INVITE_COMMIT: {
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

    case CREATE_GROUP_INVITE_ROLLBACK: {
      if (!action.payload.response) return state;
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
        error: action.payload.message || "Failed to create group invite",
      };
    }

    // ------------------------------ UPDATE GROUP INVITE --------------------------------- //

    case UPDATE_GROUP_INVITE: {
      const optimisticInvite = action.optimistic;
      if (!optimisticInvite) return { ...state, loading: true, error: null };

      return {
        ...state,
        invites: updateOrAddInvite(state.invites, optimisticInvite),
        loading: true,
        error: null,
      };
    }

    case UPDATE_GROUP_INVITE_COMMIT: {
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

    case UPDATE_GROUP_INVITE_ROLLBACK: {
      if (!action.payload.response) return state;
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
        error: action.payload.message || "Failed to update group invite",
      };
    }

    // ------------------------------ DELETE GROUP INVITE --------------------------------- //

    case DELETE_GROUP_INVITE: {
      const optimisticInvite = action.optimistic;
      if (!optimisticInvite) return { ...state, loading: true, error: null };

      return {
        ...state,
        invites: updateOrAddInvite(state.invites, optimisticInvite),
        loading: true,
        error: null,
      };
    }

    case DELETE_GROUP_INVITE_COMMIT: {
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

    case DELETE_GROUP_INVITE_ROLLBACK: {
      if (!action.payload.response) return state;
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
        error: action.payload.message || "Failed to delete group invite",
      };
    }

    default:
      return state;
  }
};

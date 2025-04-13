// src/redux-offline/groups/groups.reducer.ts
import {
  GroupFE,
  UserID,
  GroupID,
  SystemPermissionType,
} from "@officexapp/types";
import {
  CREATE_GROUP,
  CREATE_GROUP_COMMIT,
  CREATE_GROUP_ROLLBACK,
  LIST_GROUPS,
  LIST_GROUPS_COMMIT,
  LIST_GROUPS_ROLLBACK,
  GET_GROUP,
  GET_GROUP_COMMIT,
  GET_GROUP_ROLLBACK,
  UPDATE_GROUP,
  UPDATE_GROUP_COMMIT,
  UPDATE_GROUP_ROLLBACK,
  DELETE_GROUP,
  DELETE_GROUP_COMMIT,
  DELETE_GROUP_ROLLBACK,
  CHECK_GROUP_TABLE_PERMISSIONS,
  CHECK_GROUP_TABLE_PERMISSIONS_COMMIT,
  CHECK_GROUP_TABLE_PERMISSIONS_ROLLBACK,
} from "./groups.actions";

export const GROUPS_REDUX_KEY = "groups";
export const GROUPS_DEXIE_TABLE = GROUPS_REDUX_KEY;

export interface GroupFEO extends GroupFE {
  _isOptimistic?: boolean; // flag for optimistic updates
  _optimisticID?: string; // unique ID for optimistic updates
  _syncWarning?: string; // tooltip for users
  _syncConflict?: boolean; // flag for corrupted data due to sync failures
  _syncSuccess?: boolean; // flag for successful sync
  _markedForDeletion?: boolean; // flag for deletion
}

interface GroupsState {
  groups: GroupFEO[];
  groupMap: Record<GroupID, GroupFEO>;
  loading: boolean;
  error: string | null;
  tablePermissions: SystemPermissionType[];
  lastChecked: number;
}

const initialState: GroupsState = {
  groups: [],
  groupMap: {},
  loading: false,
  error: null,
  tablePermissions: [],
  lastChecked: 0,
};

const updateOrAddGroup = (
  groups: GroupFEO[],
  newGroup: GroupFEO,
  identifierKey: keyof GroupFEO = "id"
): GroupFEO[] => {
  const existingIndex = groups.findIndex(
    (group) => group[identifierKey] === newGroup[identifierKey]
  );

  if (existingIndex !== -1) {
    // Replace existing group
    return [
      ...groups.slice(0, existingIndex),
      newGroup,
      ...groups.slice(existingIndex + 1),
    ];
  } else {
    // Add to the front of the array
    return [newGroup, ...groups];
  }
};

export const groupsReducer = (
  state = initialState,
  action: any
): GroupsState => {
  switch (action.type) {
    // ------------------------------ GET GROUP --------------------------------- //

    // Get Group
    case GET_GROUP: {
      if (!action.optimistic) return { ...state, loading: true, error: null };

      return {
        ...state,
        groups: updateOrAddGroup(state.groups, action.optimistic),
        groupMap: {
          ...state.groupMap,
          [action.optimistic.id]: action.optimistic,
        },
        loading: true,
        error: null,
      };
    }

    case GET_GROUP_COMMIT: {
      const optimisticID = action.meta?.optimisticID;
      const groupData = action.payload.ok.data;

      console.log("GET_GROUP_COMMIT reducer", groupData, state.groups);

      // Update the optimistic group with the real data
      return {
        ...state,
        groups: state.groups.map((group) => {
          if (
            group._optimisticID === optimisticID ||
            group.id === groupData.id
          ) {
            return groupData;
          }
          return group;
        }),
        groupMap: {
          ...state.groupMap,
          [groupData.id]: groupData,
        },
        loading: false,
      };
    }

    case GET_GROUP_ROLLBACK: {
      if (!action.payload.response) return state;
      // Update the optimistic group with the error message
      const newGroupMap = { ...state.groupMap };
      delete newGroupMap[action.meta.optimisticID];
      return {
        ...state,
        groups: state.groups.map((group) => {
          if (group._optimisticID === action.meta.optimisticID) {
            return {
              ...group,
              _syncWarning: action.error_message,
              _syncSuccess: false,
              _syncConflict: true,
              _isOptimistic: false,
            };
          }
          return group;
        }),
        groupMap: newGroupMap,
        loading: false,
        error: action.payload.message || "Failed to fetch group",
      };
    }

    // ------------------------------ LIST GROUPS --------------------------------- //

    case LIST_GROUPS: {
      return {
        ...state,
        groups: action.optimistic || [],
        loading: true,
        error: null,
      };
    }

    case LIST_GROUPS_COMMIT: {
      const groupsData = action.payload.ok.data.items.reduce(
        (acc: GroupFEO[], item: GroupFEO) => updateOrAddGroup(acc, item),
        state.groups
      );
      const groupMap = action.payload.ok.data.items.reduce(
        (acc: Record<GroupID, GroupFEO>, item: GroupFEO) => {
          acc[item.id] = item;
          return acc;
        },
        state.groupMap
      );

      return {
        ...state,
        groups: groupsData,
        groupMap,
        loading: false,
        lastChecked: Date.now(),
      };
    }

    case LIST_GROUPS_ROLLBACK: {
      if (!action.payload.response) return state;
      return {
        ...state,
        loading: false,
        error: action.error_message || "Failed to fetch groups",
      };
    }

    // ------------------------------ CREATE GROUP --------------------------------- //

    case CREATE_GROUP: {
      if (!action.optimistic) return { ...state, loading: true, error: null };

      const optimisticGroup = action.optimistic;
      return {
        ...state,
        groups: updateOrAddGroup(
          state.groups,
          optimisticGroup,
          "_optimisticID"
        ),
        groupMap: {
          ...state.groupMap,
          [optimisticGroup.id]: optimisticGroup,
        },
        loading: true,
        error: null,
      };
    }

    case CREATE_GROUP_COMMIT: {
      const optimisticID = action.meta?.optimisticID;
      const newGroup = {
        ...action.payload.ok.data,
        _syncSuccess: true,
        _syncConflict: false,
        _syncWarning: "",
        _isOptimistic: false,
      };

      // Remove the optimistic group from our items array
      const filteredGroups = state.groups.filter(
        (group) => group._optimisticID !== optimisticID
      );

      // Create a new groupMap without the optimistic entry
      const newGroupMap = { ...state.groupMap };
      delete newGroupMap[optimisticID];
      newGroupMap[newGroup.id] = newGroup;

      return {
        ...state,
        // Add the newly created group to our items array
        groups: updateOrAddGroup(filteredGroups, newGroup),
        groupMap: newGroupMap,
        loading: false,
      };
    }

    case CREATE_GROUP_ROLLBACK: {
      if (!action.payload.response) return state;
      // Add a sync warning to the optimistic group
      const newReduxGroups = state.groups.map((group) => {
        if (group._optimisticID === action.meta.optimisticID) {
          return {
            ...group,
            _syncWarning: action.error_message,
            _syncSuccess: false,
            _syncConflict: true,
            _isOptimistic: false,
          };
        }
        return group;
      });

      return {
        ...state,
        groups: newReduxGroups,
        loading: false,
        error: action.payload.message || "Failed to create group",
      };
    }

    // ------------------------------ UPDATE GROUP --------------------------------- //

    case UPDATE_GROUP: {
      if (!action.optimistic) return { ...state, loading: true, error: null };

      const optimisticGroup = action.optimistic;
      return {
        ...state,
        groups: updateOrAddGroup(state.groups, optimisticGroup),
        groupMap: {
          ...state.groupMap,
          [optimisticGroup.id]: optimisticGroup,
        },
        loading: true,
        error: null,
      };
    }

    case UPDATE_GROUP_COMMIT: {
      const optimisticID = action.meta?.optimisticID;
      const updatedGroup = {
        ...action.payload.ok.data,
        _syncSuccess: true,
        _syncConflict: false,
        _syncWarning: "",
        _isOptimistic: false,
      };

      // Update the optimistic group with the real data
      return {
        ...state,
        groups: state.groups.map((group) => {
          if (group._optimisticID === optimisticID) {
            return updatedGroup;
          }
          return group;
        }),
        groupMap: {
          ...state.groupMap,
          [updatedGroup.id]: updatedGroup,
        },
        loading: false,
      };
    }

    case UPDATE_GROUP_ROLLBACK: {
      if (!action.payload.response) return state;
      // Update the optimistic group with the error message
      return {
        ...state,
        groups: state.groups.map((group) => {
          if (group._optimisticID === action.meta.optimisticID) {
            return {
              ...group,
              _syncWarning: action.error_message,
              _syncSuccess: false,
              _syncConflict: true,
              _isOptimistic: false,
            };
          }
          return group;
        }),
        loading: false,
        error: action.payload.message || "Failed to update group",
      };
    }

    // ------------------------------ DELETE GROUP --------------------------------- //

    case DELETE_GROUP: {
      if (!action.optimistic) return { ...state, loading: true, error: null };

      const optimisticGroup = action.optimistic;
      return {
        ...state,
        groups: updateOrAddGroup(state.groups, optimisticGroup),
        groupMap: {
          ...state.groupMap,
          [optimisticGroup.id]: optimisticGroup,
        },
        loading: true,
        error: null,
      };
    }

    case DELETE_GROUP_COMMIT: {
      const optimisticID = action.meta?.optimisticID;

      // Remove the group from our state
      const filteredGroups = state.groups.filter(
        (group) => group._optimisticID !== optimisticID
      );

      // Create a new groupMap without the deleted entry
      const newGroupMap = { ...state.groupMap };
      delete newGroupMap[optimisticID];

      return {
        ...state,
        groups: filteredGroups,
        groupMap: newGroupMap,
        loading: false,
      };
    }

    case DELETE_GROUP_ROLLBACK: {
      if (!action.payload.response) return state;
      // Update the optimistic group with the error message
      return {
        ...state,
        groups: state.groups.map((group) => {
          if (group._optimisticID === action.meta.optimisticID) {
            return {
              ...group,
              _syncWarning: action.error_message,
              _syncSuccess: false,
              _syncConflict: true,
              _isOptimistic: false,
              _markedForDeletion: false,
            };
          }
          return group;
        }),
        loading: false,
        error: action.payload.message || "Failed to delete group",
      };
    }

    case CHECK_GROUP_TABLE_PERMISSIONS: {
      console.log(`Firing checkGroupTablePermissionsAction for user`, action);
      const permission_types = action.optimistic?.permission_types || [];
      return {
        ...state,
        loading: true,
        error: null,
        tablePermissions: permission_types,
      };
    }

    case CHECK_GROUP_TABLE_PERMISSIONS_COMMIT: {
      return {
        ...state,
        loading: false,
        tablePermissions: action.payload.ok.data.permissions,
      };
    }

    case CHECK_GROUP_TABLE_PERMISSIONS_ROLLBACK: {
      return {
        ...state,
        loading: false,
        error:
          action.payload.message || "Failed to check group table permissions",
      };
    }

    default:
      return state;
  }
};

// src/redux-offline/permissions/permissions.reducer.ts

import {
  DirectoryPermission,
  SystemPermission,
  DirectoryPermissionFE,
  SystemPermissionFE,
  DirectoryPermissionID,
  SystemPermissionID,
  DirectoryResourceID,
  SystemPermissionType,
} from "@officexapp/types";

import {
  GET_SYSTEM_PERMISSION,
  GET_SYSTEM_PERMISSION_COMMIT,
  GET_SYSTEM_PERMISSION_ROLLBACK,
  LIST_SYSTEM_PERMISSIONS,
  LIST_SYSTEM_PERMISSIONS_COMMIT,
  LIST_SYSTEM_PERMISSIONS_ROLLBACK,
  CREATE_SYSTEM_PERMISSION,
  CREATE_SYSTEM_PERMISSION_COMMIT,
  CREATE_SYSTEM_PERMISSION_ROLLBACK,
  UPDATE_SYSTEM_PERMISSION,
  UPDATE_SYSTEM_PERMISSION_COMMIT,
  UPDATE_SYSTEM_PERMISSION_ROLLBACK,
  DELETE_SYSTEM_PERMISSION,
  DELETE_SYSTEM_PERMISSION_COMMIT,
  DELETE_SYSTEM_PERMISSION_ROLLBACK,
  REDEEM_SYSTEM_PERMISSION,
  REDEEM_SYSTEM_PERMISSION_COMMIT,
  REDEEM_SYSTEM_PERMISSION_ROLLBACK,
  GET_DIRECTORY_PERMISSION,
  GET_DIRECTORY_PERMISSION_COMMIT,
  GET_DIRECTORY_PERMISSION_ROLLBACK,
  LIST_DIRECTORY_PERMISSIONS,
  LIST_DIRECTORY_PERMISSIONS_COMMIT,
  LIST_DIRECTORY_PERMISSIONS_ROLLBACK,
  CREATE_DIRECTORY_PERMISSION,
  CREATE_DIRECTORY_PERMISSION_COMMIT,
  CREATE_DIRECTORY_PERMISSION_ROLLBACK,
  UPDATE_DIRECTORY_PERMISSION,
  UPDATE_DIRECTORY_PERMISSION_COMMIT,
  UPDATE_DIRECTORY_PERMISSION_ROLLBACK,
  DELETE_DIRECTORY_PERMISSION,
  DELETE_DIRECTORY_PERMISSION_COMMIT,
  DELETE_DIRECTORY_PERMISSION_ROLLBACK,
  REDEEM_DIRECTORY_PERMISSION,
  REDEEM_DIRECTORY_PERMISSION_COMMIT,
  REDEEM_DIRECTORY_PERMISSION_ROLLBACK,
  CHECK_PERMISSION_TABLE_PERMISSIONS_ROLLBACK,
  CHECK_PERMISSION_TABLE_PERMISSIONS_COMMIT,
  CHECK_PERMISSION_TABLE_PERMISSIONS,
} from "./permissions.actions";

export const SYSTEM_PERMISSIONS_REDUX_KEY = "systemPermissions";
export const DIRECTORY_PERMISSIONS_REDUX_KEY = "directoryPermissions";
export const SYSTEM_PERMISSIONS_DEXIE_TABLE = SYSTEM_PERMISSIONS_REDUX_KEY;
export const DIRECTORY_PERMISSIONS_DEXIE_TABLE =
  DIRECTORY_PERMISSIONS_REDUX_KEY;

// Enhanced interfaces with optimistic update fields
export interface SystemPermissionFEO extends SystemPermissionFE {
  _isOptimistic?: boolean;
  _optimisticID?: string;
  _syncWarning?: string;
  _syncConflict?: boolean;
  _syncSuccess?: boolean;
  _markedForDeletion?: boolean;
  lastChecked?: number;
  isLoading?: boolean;
}

export interface DirectoryPermissionFEO extends DirectoryPermissionFE {
  _isOptimistic?: boolean;
  _optimisticID?: string;
  _syncWarning?: string;
  _syncConflict?: boolean;
  _syncSuccess?: boolean;
  _markedForDeletion?: boolean;
  lastChecked: number;
}

// State interfaces
interface SystemPermissionsState {
  permissions: SystemPermissionFEO[];
  permissionMap: Record<SystemPermissionID, SystemPermissionFEO>;
  loading: boolean;
  error: string | null;
  tablePermissions: SystemPermissionType[];
  lastChecked: number;
}

interface DirectoryPermissionsState {
  permissionMap: Record<DirectoryPermissionID, DirectoryPermissionFEO>;
  resourcePermissionsMap: Record<DirectoryResourceID, DirectoryPermissionID[]>;
  loading: boolean;
  error: string | null;
  lastChecked: number;
}

// Combined state interface
export interface PermissionsState {
  system: SystemPermissionsState;
  directory: DirectoryPermissionsState;
}

// Initial states
const initialSystemState: SystemPermissionsState = {
  permissions: [],
  permissionMap: {},
  loading: false,
  error: null,
  tablePermissions: [],
  lastChecked: 0,
};

const initialDirectoryState: DirectoryPermissionsState = {
  permissionMap: {},
  resourcePermissionsMap: {},
  loading: false,
  error: null,
  lastChecked: 0,
};

const initialState: PermissionsState = {
  system: initialSystemState,
  directory: initialDirectoryState,
};

// Helper function to update or add a permission to a permissions array
const updateOrAddPermission = <
  T extends { id: string; _optimisticID?: string },
>(
  permissions: T[],
  newPermission: T,
  identifierKey: keyof T = "id"
): T[] => {
  const existingIndex = permissions.findIndex(
    (permission) => permission[identifierKey] === newPermission[identifierKey]
  );

  if (existingIndex !== -1) {
    // Replace existing permission
    return [
      ...permissions.slice(0, existingIndex),
      newPermission,
      ...permissions.slice(existingIndex + 1),
    ];
  } else {
    // Add to the front of the array
    return [newPermission, ...permissions];
  }
};

// Reducers
export const systemPermissionsReducer = (
  state = initialSystemState,
  action: any
): SystemPermissionsState => {
  switch (action.type) {
    // GET SYSTEM PERMISSION
    case GET_SYSTEM_PERMISSION: {
      if (!action.optimistic) return { ...state, loading: true, error: null };

      return {
        ...state,
        permissions: updateOrAddPermission(
          state.permissions,
          action.optimistic
        ),
        permissionMap: {
          ...state.permissionMap,
          [action.optimistic.id]: { ...action.optimistic, isLoading: true },
        },
      };
    }

    case GET_SYSTEM_PERMISSION_COMMIT: {
      const permission = action.payload.ok.data;

      return {
        ...state,
        permissions: state.permissions.map((p) => {
          if (p._optimisticID === permission.id || p.id === permission.id) {
            return permission;
          }
          return p;
        }),
        permissionMap: {
          ...state.permissionMap,
          [permission.id]: {
            ...permission,
            lastChecked: Date.now(),
            isLoading: false,
          },
        },
      };
    }

    case GET_SYSTEM_PERMISSION_ROLLBACK: {
      if (!action.payload.response) return state;
      const optimisticID = action.meta?.optimisticID;
      const newPermissionMap = { ...state.permissionMap };

      if (optimisticID && newPermissionMap[optimisticID]) {
        delete newPermissionMap[optimisticID];
      }

      return {
        ...state,
        permissions: state.permissions.map((p) => {
          if (p._optimisticID === optimisticID) {
            return {
              ...p,
              _syncWarning: action.error_message,
              _syncSuccess: false,
              _syncConflict: true,
              _isOptimistic: false,
              isLoading: false,
            };
          }
          return p;
        }),
        permissionMap: newPermissionMap,
        error: action.payload?.message || "Failed to fetch system permission",
      };
    }

    // LIST SYSTEM PERMISSIONS
    case LIST_SYSTEM_PERMISSIONS: {
      return {
        ...state,
        permissions: action.optimistic || [],
        loading: true,
        error: null,
      };
    }

    case LIST_SYSTEM_PERMISSIONS_COMMIT: {
      const permissions = action.payload.ok.data.items.reduce(
        (acc: SystemPermissionFEO[], item: SystemPermissionFE) =>
          updateOrAddPermission(acc, item),
        state.permissions
      );
      const permissionMap = action.payload.ok.data.items.reduce(
        (
          acc: Record<SystemPermissionID, SystemPermissionFEO>,
          item: SystemPermissionFE
        ) => {
          acc[item.id] = { ...item, lastChecked: Date.now() };
          return acc;
        },
        state.permissionMap
      );

      return {
        ...state,
        permissions,
        permissionMap,
        loading: false,
        lastChecked: Date.now(),
      };
    }

    case LIST_SYSTEM_PERMISSIONS_ROLLBACK: {
      if (!action.payload.response) return state;
      return {
        ...state,
        loading: false,
        error: action.error_message || "Failed to fetch system permissions",
      };
    }

    // CREATE SYSTEM PERMISSION
    case CREATE_SYSTEM_PERMISSION: {
      if (!action.optimistic) return { ...state, loading: true, error: null };

      return {
        ...state,
        permissions: updateOrAddPermission(
          state.permissions,
          action.optimistic,
          "_optimisticID"
        ),
        permissionMap: {
          ...state.permissionMap,
          [action.optimistic._optimisticID as string]: action.optimistic,
        },
        loading: true,
        error: null,
      };
    }

    case CREATE_SYSTEM_PERMISSION_COMMIT: {
      const optimisticID = action.meta?.optimisticID;
      const newPermission = {
        ...action.payload.ok.data.permission,
        _syncSuccess: true,
        _syncConflict: false,
        _syncWarning: "",
        _isOptimistic: false,
      };

      const filteredPermissions = state.permissions.filter(
        (p) => p._optimisticID !== optimisticID
      );

      const newPermissionMap = { ...state.permissionMap };
      delete newPermissionMap[optimisticID as string];
      newPermissionMap[newPermission.id] = newPermission;

      return {
        ...state,
        permissions: updateOrAddPermission(filteredPermissions, newPermission),
        permissionMap: newPermissionMap,
        loading: false,
      };
    }

    case CREATE_SYSTEM_PERMISSION_ROLLBACK: {
      if (!action.payload.response) return state;
      const optimisticID = action.meta?.optimisticID;

      return {
        ...state,
        permissions: state.permissions.map((p) => {
          if (p._optimisticID === optimisticID) {
            return {
              ...p,
              _syncWarning: action.error_message,
              _syncSuccess: false,
              _syncConflict: true,
              _isOptimistic: false,
            };
          }
          return p;
        }),
        loading: false,
        error: action.payload?.message || "Failed to create system permission",
      };
    }

    // UPDATE SYSTEM PERMISSION
    case UPDATE_SYSTEM_PERMISSION: {
      if (!action.optimistic) return { ...state, loading: true, error: null };

      return {
        ...state,
        permissions: updateOrAddPermission(
          state.permissions,
          action.optimistic
        ),
        permissionMap: {
          ...state.permissionMap,
          [action.optimistic.id]: action.optimistic,
        },
        loading: true,
        error: null,
      };
    }

    case UPDATE_SYSTEM_PERMISSION_COMMIT: {
      const optimisticID = action.meta?.optimisticID;

      return {
        ...state,
        permissions: state.permissions.map((p) => {
          if (p._optimisticID === optimisticID) {
            return {
              ...p,
              ...action.payload.ok.data,
              _syncSuccess: true,
              _syncConflict: false,
              _syncWarning: "",
              _isOptimistic: false,
            };
          }
          return p;
        }),
        permissionMap: {
          ...state.permissionMap,
          [action.payload.ok.data.id]: {
            ...action.payload.ok.data,
            _syncSuccess: true,
            _syncConflict: false,
            _syncWarning: "",
            _isOptimistic: false,
          },
        },
        loading: false,
      };
    }

    case UPDATE_SYSTEM_PERMISSION_ROLLBACK: {
      if (!action.payload.response) return state;
      const optimisticID = action.meta?.optimisticID;

      return {
        ...state,
        permissions: state.permissions.map((p) => {
          if (p._optimisticID === optimisticID) {
            return {
              ...p,
              _syncWarning: action.error_message,
              _syncSuccess: false,
              _syncConflict: true,
              _isOptimistic: false,
            };
          }
          return p;
        }),
        loading: false,
        error: action.payload?.message || "Failed to update system permission",
      };
    }

    case DELETE_SYSTEM_PERMISSION: {
      if (!action.optimistic) return { ...state, loading: true, error: null };

      return {
        ...state,
        permissions: updateOrAddPermission(
          state.permissions,
          action.optimistic
        ),
        permissionMap: {
          ...state.permissionMap,
          [action.optimistic.id]: action.optimistic,
        },
        loading: true,
        error: null,
      };
    }

    case DELETE_SYSTEM_PERMISSION_COMMIT: {
      const optimisticID = action.meta?.optimisticID;

      const filteredPermissions = state.permissions.filter(
        (p) => p._optimisticID !== optimisticID
      );

      const newPermissionMap = { ...state.permissionMap };
      delete newPermissionMap[optimisticID as string];

      return {
        ...state,
        permissions: filteredPermissions,
        permissionMap: newPermissionMap,
        loading: false,
      };
    }

    case DELETE_SYSTEM_PERMISSION_ROLLBACK: {
      if (!action.payload.response) return state;
      const optimisticID = action.meta?.optimisticID;

      return {
        ...state,
        permissions: state.permissions.map((p) => {
          if (p._optimisticID === optimisticID) {
            return {
              ...p,
              _markedForDeletion: false,
              _syncWarning: action.error_message,
              _syncSuccess: false,
              _syncConflict: true,
              _isOptimistic: false,
            };
          }
          return p;
        }),
        loading: false,
        error: action.payload?.message || "Failed to delete system permission",
      };
    }

    // REDEEM SYSTEM PERMISSION
    case REDEEM_SYSTEM_PERMISSION: {
      if (!action.optimistic) return { ...state, loading: true, error: null };

      return {
        ...state,
        permissions: updateOrAddPermission(
          state.permissions,
          action.optimistic
        ),
        permissionMap: {
          ...state.permissionMap,
          [action.optimistic.id]: action.optimistic,
        },
        loading: true,
        error: null,
      };
    }

    case REDEEM_SYSTEM_PERMISSION_COMMIT: {
      const optimisticID = action.meta?.optimisticID;
      const redeemedPermission = action.payload?.ok?.data?.permission;

      if (!redeemedPermission) return state;

      const filteredPermissions = state.permissions.filter(
        (p) => p._optimisticID !== optimisticID
      );

      const newPermission = {
        ...redeemedPermission,
        _syncSuccess: true,
        _syncConflict: false,
        _syncWarning: "",
        _isOptimistic: false,
      };

      const newPermissionMap = { ...state.permissionMap };
      delete newPermissionMap[optimisticID as string];
      newPermissionMap[newPermission.id] = newPermission;

      return {
        ...state,
        permissions: updateOrAddPermission(filteredPermissions, newPermission),
        permissionMap: newPermissionMap,
        loading: false,
      };
    }

    case REDEEM_SYSTEM_PERMISSION_ROLLBACK: {
      if (!action.payload.response) return state;
      const optimisticID = action.meta?.optimisticID;

      return {
        ...state,
        permissions: state.permissions.map((p) => {
          if (p._optimisticID === optimisticID) {
            return {
              ...p,
              _syncWarning: action.error_message,
              _syncSuccess: false,
              _syncConflict: true,
              _isOptimistic: false,
            };
          }
          return p;
        }),
        loading: false,
        error: action.payload?.message || "Failed to redeem system permission",
      };
    }

    case CHECK_PERMISSION_TABLE_PERMISSIONS: {
      const permission_types = action.optimistic?.permission_types || [];
      return {
        ...state,
        loading: true,
        error: null,
        tablePermissions: permission_types,
      };
    }

    case CHECK_PERMISSION_TABLE_PERMISSIONS_COMMIT: {
      return {
        ...state,
        loading: false,
        tablePermissions: action.payload.ok.data.permissions,
      };
    }

    case CHECK_PERMISSION_TABLE_PERMISSIONS_ROLLBACK: {
      return {
        ...state,
        loading: false,
        error:
          action.payload.message ||
          "Failed to check permission table permissions",
      };
    }

    default:
      return state;
  }
};

export const directoryPermissionsReducer = (
  state = initialDirectoryState,
  action: any
): DirectoryPermissionsState => {
  switch (action.type) {
    // GET DIRECTORY PERMISSION
    case GET_DIRECTORY_PERMISSION: {
      if (!action.optimistic) return { ...state, loading: true, error: null };

      return {
        ...state,
        permissionMap: {
          ...state.permissionMap,
          [action.optimistic.id]: { ...action.optimistic, isLoading: true },
        },
        loading: true,
        error: null,
      };
    }

    case GET_DIRECTORY_PERMISSION_COMMIT: {
      const optimisticID = action.meta?.optimisticID;
      const permission = action.payload.ok.data;
      const updatedResourcePermissionsList = updateOrAddPermission(
        state.resourcePermissionsMap[permission.resource_id] || [],
        permission
      );
      return {
        ...state,
        resourcePermissionsMap: {
          ...state.resourcePermissionsMap,
          [permission.resource_id]: updatedResourcePermissionsList,
        },
        permissionMap: {
          ...state.permissionMap,
          [permission.id]: {
            ...permission,
            lastChecked: Date.now(),
            isLoading: false,
          },
        },
        loading: false,
      };
    }

    case GET_DIRECTORY_PERMISSION_ROLLBACK: {
      if (!action.payload.response) return state;
      const optimisticID = action.meta?.optimisticID;
      const newPermissionMap = { ...state.permissionMap };

      if (optimisticID && newPermissionMap[optimisticID]) {
        delete newPermissionMap[optimisticID];
      }

      return {
        ...state,
        permissionMap: newPermissionMap,
        loading: false,
        error:
          action.payload?.message || "Failed to fetch directory permission",
      };
    }

    // LIST DIRECTORY PERMISSIONS
    case LIST_DIRECTORY_PERMISSIONS: {
      const resourceId =
        action.meta?.offline?.effect?.data?.filters?.resource_id;

      if (!action.optimistic) return { ...state, loading: true, error: null };

      const permits = action.optimistic || [];
      const newPermissionMap = permits.reduce(
        (
          map: Record<string, DirectoryPermissionFEO>,
          permission: DirectoryPermissionFE
        ) => {
          map[permission.id] = { ...permission, lastChecked: Date.now() };
          return map;
        },
        state.permissionMap
      );
      const newResourcePermissionsMap = {
        ...state.resourcePermissionsMap,
        [resourceId as string]: permits.map(
          (p: DirectoryPermissionFEO) => p.id
        ),
      };

      return {
        ...state,
        permissionMap: newPermissionMap,
        resourcePermissionsMap: newResourcePermissionsMap,
        loading: true,
        error: null,
      };
    }

    case LIST_DIRECTORY_PERMISSIONS_COMMIT: {
      console.log(`> LIST_DIRECTORY_PERMISSIONS_COMMIT`, action);
      const permissions = action.payload.ok.data.items;
      const resource_id = permissions[0]?.resource_id || "";
      const permissionMap = permissions.reduce(
        (
          map: Record<string, DirectoryPermissionFEO>,
          permission: DirectoryPermissionFE
        ) => {
          map[permission.id] = { ...permission, lastChecked: Date.now() };
          return map;
        },
        state.permissionMap
      );
      const newResourcePermissionsMap = {
        ...state.resourcePermissionsMap,
        [resource_id]: permissions.map((p: DirectoryPermissionFEO) => p.id),
      };

      console.log(`> newResourcePermissionsMap`, newResourcePermissionsMap);

      return {
        ...state,
        permissionMap,
        resourcePermissionsMap: newResourcePermissionsMap,
        loading: false,
      };
    }

    case LIST_DIRECTORY_PERMISSIONS_ROLLBACK: {
      if (!action.payload.response) return state;

      return {
        ...state,
        loading: false,
        error: action.error_message || "Failed to fetch directory permissions",
      };
    }

    // CREATE DIRECTORY PERMISSION
    case CREATE_DIRECTORY_PERMISSION: {
      if (!action.optimistic) return { ...state, loading: true, error: null };

      return {
        ...state,
        permissionMap: {
          ...state.permissionMap,
          [action.optimistic._optimisticID as string]: action.optimistic,
        },
        loading: true,
        error: null,
      };
    }

    case CREATE_DIRECTORY_PERMISSION_COMMIT: {
      const optimisticID = action.meta?.optimisticID;
      const newPermission = {
        ...action.payload.ok.data.permission,
        _syncSuccess: true,
        _syncConflict: false,
        _syncWarning: "",
        _isOptimistic: false,
      };

      const newPermissionMap = { ...state.permissionMap };
      delete newPermissionMap[optimisticID as string];
      newPermissionMap[newPermission.id] = newPermission;

      return {
        ...state,
        permissionMap: newPermissionMap,
        loading: false,
      };
    }

    case CREATE_DIRECTORY_PERMISSION_ROLLBACK: {
      if (!action.payload.response) return state;
      const optimisticID = action.meta?.optimisticID;

      return {
        ...state,
        permissionMap: {
          ...state.permissionMap,
          [optimisticID as string]: {
            ...state.permissionMap[optimisticID as string],
            _syncWarning: action.error_message,
            _syncSuccess: false,
            _syncConflict: true,
            _isOptimistic: false,
          },
        },
        loading: false,
        error:
          action.payload?.message || "Failed to create directory permission",
      };
    }

    // UPDATE DIRECTORY PERMISSION
    case UPDATE_DIRECTORY_PERMISSION: {
      if (!action.optimistic) return { ...state, loading: true, error: null };

      return {
        ...state,
        permissionMap: {
          ...state.permissionMap,
          [action.optimistic.id]: action.optimistic,
        },
        loading: true,
        error: null,
      };
    }

    case UPDATE_DIRECTORY_PERMISSION_COMMIT: {
      const optimisticID = action.meta?.optimisticID;

      return {
        ...state,
        permissionMap: {
          ...state.permissionMap,
          [action.payload.ok.data.id]: {
            ...action.payload.ok.data,
            _syncSuccess: true,
            _syncConflict: false,
            _syncWarning: "",
            _isOptimistic: false,
          },
        },
        loading: false,
      };
    }

    case UPDATE_DIRECTORY_PERMISSION_ROLLBACK: {
      if (!action.payload.response) return state;
      const optimisticID = action.meta?.optimisticID;

      return {
        ...state,
        permissionMap: {
          ...state.permissionMap,
          [optimisticID as string]: {
            ...state.permissionMap[optimisticID as string],
            _syncWarning: action.error_message,
            _syncSuccess: false,
            _syncConflict: true,
            _isOptimistic: false,
          },
        },
        loading: false,
        error:
          action.payload?.message || "Failed to update directory permission",
      };
    }

    // DELETE DIRECTORY PERMISSION
    case DELETE_DIRECTORY_PERMISSION: {
      if (!action.optimistic) return { ...state, loading: true, error: null };

      return {
        ...state,
        permissionMap: {
          ...state.permissionMap,
          [action.optimistic.id]: action.optimistic,
        },
        loading: true,
        error: null,
      };
    }

    case DELETE_DIRECTORY_PERMISSION_COMMIT: {
      const optimisticID = action.meta?.optimisticID;

      const newPermissionMap = { ...state.permissionMap };
      delete newPermissionMap[optimisticID as string];

      return {
        ...state,
        permissionMap: newPermissionMap,
        loading: false,
      };
    }

    case DELETE_DIRECTORY_PERMISSION_ROLLBACK: {
      if (!action.payload.response) return state;
      const optimisticID = action.meta?.optimisticID;

      return {
        ...state,
        loading: false,
        error:
          action.payload?.message || "Failed to delete directory permission",
      };
    }

    // REDEEM DIRECTORY PERMISSION
    case REDEEM_DIRECTORY_PERMISSION: {
      if (!action.optimistic) return { ...state, loading: true, error: null };

      return {
        ...state,
        permissionMap: {
          ...state.permissionMap,
          [action.optimistic.id]: action.optimistic,
        },
        loading: true,
        error: null,
      };
    }

    case REDEEM_DIRECTORY_PERMISSION_COMMIT: {
      const optimisticID = action.meta?.optimisticID;
      const redeemedPermission = action.payload?.ok?.data?.permission;

      if (!redeemedPermission) return state;

      const newPermission = {
        ...redeemedPermission,
        _syncSuccess: true,
        _syncConflict: false,
        _syncWarning: "",
        _isOptimistic: false,
      };

      const newPermissionMap = { ...state.permissionMap };
      delete newPermissionMap[optimisticID as string];
      newPermissionMap[newPermission.id] = newPermission;

      return {
        ...state,
        permissionMap: newPermissionMap,
        loading: false,
      };
    }

    case REDEEM_DIRECTORY_PERMISSION_ROLLBACK: {
      if (!action.payload.response) return state;
      const optimisticID = action.meta?.optimisticID;

      return {
        ...state,
        loading: false,
        error:
          action.payload?.message || "Failed to redeem directory permission",
      };
    }

    default:
      return state;
  }
};

// Combined permissions reducer
export const permissionsReducer = (
  state = initialState,
  action: any
): PermissionsState => {
  return {
    system: systemPermissionsReducer(state.system, action),
    directory: directoryPermissionsReducer(state.directory, action),
  };
};

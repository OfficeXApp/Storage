// src/redux-offline/disks/disks.reducer.ts
import { Disk, DiskFE, DiskID, SystemPermissionType } from "@officexapp/types";
import {
  CREATE_DISK,
  CREATE_DISK_COMMIT,
  CREATE_DISK_ROLLBACK,
  LIST_DISKS,
  LIST_DISKS_COMMIT,
  LIST_DISKS_ROLLBACK,
  GET_DISK,
  GET_DISK_COMMIT,
  GET_DISK_ROLLBACK,
  UPDATE_DISK,
  UPDATE_DISK_COMMIT,
  UPDATE_DISK_ROLLBACK,
  CHECK_DISKS_TABLE_PERMISSIONS,
  CHECK_DISKS_TABLE_PERMISSIONS_COMMIT,
  CHECK_DISKS_TABLE_PERMISSIONS_ROLLBACK,
} from "./disks.actions";
import {
  defaultBrowserCacheDiskID,
  defaultTempCloudSharingDiskID,
} from "../../api/dexie-database";

export const DISKS_REDUX_KEY = "disks";
export const DISKS_DEXIE_TABLE = DISKS_REDUX_KEY;
export const LOCALSTORAGE_DEFAULT_DISK_ID = "LOCALSTORAGE_DEFAULT_DISK_ID";

export interface DiskFEO extends DiskFE {
  _isOptimistic?: boolean; // flag for optimistic updates
  _optimisticID?: string; // unique ID for optimistic updates
  _syncWarning?: string; // tooltip for users
  _syncConflict?: boolean; // flag for corrupted data due to sync failures
  _syncSuccess?: boolean; // flag for successful sync
  _markedForDeletion?: boolean; // flag for deletion
}

interface DisksState {
  defaultDisk: DiskFEO | null;
  disks: DiskFEO[];
  diskMap: Record<DiskID, DiskFEO>;
  loading: boolean;
  error: string | null;
  tablePermissions: SystemPermissionType[];
  lastChecked: number;
}

const initialState: DisksState = {
  defaultDisk: null,
  disks: [],
  diskMap: {},
  loading: false,
  error: null,
  tablePermissions: [],
  lastChecked: 0,
};

const updateOrAddDisk = (disks: DiskFEO[], newDisk: DiskFEO): DiskFEO[] => {
  const existingIndex = disks.findIndex(
    (disk) => disk.id === newDisk.id || disk._optimisticID === newDisk.id
  );

  if (existingIndex !== -1) {
    // Replace existing disk
    return [
      ...disks.slice(0, existingIndex),
      newDisk,
      ...disks.slice(existingIndex + 1),
    ];
  } else {
    // Add to the front of the array
    return [newDisk, ...disks];
  }
};

export const disksReducer = (state = initialState, action: any): DisksState => {
  // console.log(`Now in official reducer`, action, state);
  switch (action.type) {
    // ------------------------------ GET DISKS --------------------------------- //

    // Get Disks
    case GET_DISK: {
      return {
        ...state,
        disks: updateOrAddDisk(state.disks, action.optimistic),
        diskMap: {
          ...state.diskMap,
          [action.optimistic.id]: action.optimistic,
        },
        loading: true,
        error: null,
      };
    }

    case GET_DISK_COMMIT: {
      const optimisticID = action.meta?.optimisticID;
      // Update the optimistic disk with the real data
      return {
        ...state,
        disks: state.disks.map((disk) => {
          if (disk._optimisticID === optimisticID) {
            return action.payload.ok.data;
          }
          return disk;
        }),
        diskMap: {
          ...state.diskMap,
          [action.payload.ok.data.id]: action.payload.ok.data,
        },
        loading: false,
      };
    }

    case GET_DISK_ROLLBACK: {
      if (!action.payload.response) return state;
      // Update the optimistic disk with the error message
      const newDiskMap = { ...state.diskMap };
      delete newDiskMap[action.meta.optimisticID];
      return {
        ...state,
        disks: state.disks.map((disk) => {
          if (disk._optimisticID === action.meta.optimisticID) {
            return {
              ...disk,
              _syncWarning: action.error_message,
              _syncSuccess: false,
              _syncConflict: true,
              _isOptimistic: false,
            };
          }
          return disk;
        }),
        diskMap: newDiskMap,
        loading: false,
        error: action.payload.message || "Failed to fetch disk",
      };
    }

    // ------------------------------ LIST DISKS --------------------------------- //

    case LIST_DISKS: {
      // console.log(`LIST_DISKS reducer`, action);
      const DEFAULT_DISK_ID = localStorage.getItem(
        LOCALSTORAGE_DEFAULT_DISK_ID
      );
      const defaultDisk = (action.optimistic || []).find(
        (disk: DiskFEO) => disk.id === DEFAULT_DISK_ID
      );
      return {
        ...state,
        defaultDisk: defaultDisk || null,
        disks: action.optimistic || [],
        loading: true,
        error: null,
      };
    }

    case LIST_DISKS_COMMIT: {
      // console.log(`LIST_DISKS_COMMIT reducer`, action);
      // Get items from the API response
      const serverDisks = action.payload.ok.data.items || [];

      const newDisks: DiskFEO[] = serverDisks.reduce(
        (acc: DiskFEO[], item: DiskFEO) => updateOrAddDisk(acc, item),
        state.disks
      );
      const newDiskMap = serverDisks.reduce(
        (acc: Record<DiskID, DiskFEO>, item: DiskFEO) => {
          acc[item.id] = item;
          return acc;
        },
        state.diskMap
      );

      const DEFAULT_DISK_ID = localStorage.getItem(
        LOCALSTORAGE_DEFAULT_DISK_ID
      );
      const defaultDisk = newDisks.find((disk) => disk.id === DEFAULT_DISK_ID);

      return {
        ...state,
        defaultDisk: defaultDisk || null,
        disks: newDisks,
        diskMap: newDiskMap,
        loading: false,
        lastChecked: Date.now(),
      };
    }

    case LIST_DISKS_ROLLBACK: {
      // console.log(`LIST_DISKS_ROLLBACK reducer`, action);
      if (!action.payload.response) return state;
      return {
        ...state,
        loading: false,
        error: action.error_message || "Failed to fetch disks",
      };
    }

    // ------------------------------ CREATE DISK --------------------------------- //

    case CREATE_DISK: {
      const optimisticDisk = action.optimistic;
      return {
        ...state,
        disks: updateOrAddDisk(state.disks, optimisticDisk),
        loading: true,
        error: null,
      };
    }

    case CREATE_DISK_COMMIT: {
      const optimisticID = action.meta?.optimisticID;
      const newDisk = {
        ...action.payload.ok.data,
        _syncSuccess: true,
        _syncConflict: false,
        _syncWarning: "",
        _isOptimistic: false,
      };
      const filteredDisks = state.disks.filter(
        (disk) => disk._optimisticID !== optimisticID
      );
      // removal from dexie is already handled in optimistic middleware which can handle async, whereas reducers are pure sync functions
      return {
        ...state,
        // Add the newly created disk to our items array
        disks: updateOrAddDisk(filteredDisks, newDisk),
        loading: false,
      };
    }

    case CREATE_DISK_ROLLBACK: {
      if (!action.payload.response) return state;
      // Add a sync warning to the optimistic disk
      const newReduxDisks = state.disks.map((disk) => {
        if (disk._optimisticID === action.meta.optimisticID) {
          return {
            ...disk,
            _syncWarning: action.error_message,
            _syncSuccess: false,
            _syncConflict: true,
            _isOptimistic: false,
          };
        }
        return disk;
      });
      // removal from dexie is already handled in optimistic middleware which can handle async, whereas reducers are pure sync functions
      return {
        ...state,
        disks: newReduxDisks,
        loading: false,
        error: action.payload.message || "Failed to create disk",
      };
    }

    // ------------------------------ UPDATE DISK --------------------------------- //

    case UPDATE_DISK: {
      const optimisticDisk = action.optimistic;
      return {
        ...state,
        disks: updateOrAddDisk(state.disks, optimisticDisk),
        loading: true,
        error: null,
      };
    }

    case UPDATE_DISK_COMMIT: {
      const optimisticID = action.meta?.optimisticID;
      // Update the optimistic disk with the real data
      return {
        ...state,
        disks: state.disks.map((disk) => {
          if (disk._optimisticID === optimisticID) {
            return {
              ...disk,
              ...action.payload.ok.data,
              _syncSuccess: true,
              _syncConflict: false,
              _syncWarning: "",
              _isOptimistic: false,
            };
          }
          return disk;
        }),
        loading: false,
      };
    }

    case UPDATE_DISK_ROLLBACK: {
      if (!action.payload.response) return state;
      // Update the optimistic disk with the error message
      return {
        ...state,
        disks: state.disks.map((disk) => {
          if (disk._optimisticID === action.meta.optimisticID) {
            return {
              ...disk,
              _syncWarning: action.error_message,
              _syncSuccess: false,
              _syncConflict: true,
              _isOptimistic: false,
            };
          }
          return disk;
        }),
        loading: false,
        error: action.payload.message || "Failed to update disk",
      };
    }

    // ------------------------------ DELETE DISK --------------------------------- //

    case "DELETE_DISK": {
      const optimisticDisk = action.optimistic;
      return {
        ...state,
        disks: updateOrAddDisk(state.disks, optimisticDisk),
        loading: true,
        error: null,
      };
    }

    case "DELETE_DISK_COMMIT": {
      const optimisticID = action.meta?.optimisticID;
      // Update the optimistic disk with the real data
      return {
        ...state,
        disks: state.disks.filter(
          (disk) => disk._optimisticID !== optimisticID
        ),
        loading: false,
      };
    }

    case "DELETE_DISK_ROLLBACK": {
      // Update the optimistic disk with the error message
      return {
        ...state,
        disks: state.disks.map((disk) => {
          if (disk._optimisticID === action.meta.optimisticID) {
            return {
              ...disk,
              _syncWarning: action.error_message,
              _syncSuccess: false,
              _syncConflict: true,
              _isOptimistic: false,
            };
          }
          return disk;
        }),
        loading: false,
        error: action.payload.message || "Failed to delete disk",
      };
    }

    case CHECK_DISKS_TABLE_PERMISSIONS: {
      console.log(`Firing checkDisksTablePermissionsAction for user`, action);
      const permission_types = action.optimistic?.permission_types || [];
      return {
        ...state,
        loading: true,
        error: null,
        tablePermissions: permission_types,
      };
    }

    case CHECK_DISKS_TABLE_PERMISSIONS_COMMIT: {
      return {
        ...state,
        loading: false,
        tablePermissions: action.payload.ok.data.permissions,
      };
    }

    case CHECK_DISKS_TABLE_PERMISSIONS_ROLLBACK: {
      return {
        ...state,
        loading: false,
        error:
          action.payload.message || "Failed to check disks table permissions",
      };
    }

    default:
      return state;
  }
};

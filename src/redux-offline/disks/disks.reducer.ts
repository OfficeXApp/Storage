// src/redux-offline/disks/disks.reducer.ts
import { Disk, DiskFE, DiskID } from "@officexapp/types";
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
}

const initialState: DisksState = {
  defaultDisk: null,
  disks: [],
  diskMap: {},
  loading: false,
  error: null,
};

const updateOrAddDisk = (
  disks: DiskFEO[],
  newDisk: DiskFEO,
  identifierKey: keyof DiskFEO = "id"
): DiskFEO[] => {
  const existingIndex = disks.findIndex(
    (disk) => disk[identifierKey] === newDisk[identifierKey]
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
      const DEFAULT_DISK_ID = localStorage.getItem(
        LOCALSTORAGE_DEFAULT_DISK_ID
      );
      const defaultDisk = action.optimistic.find(
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
      // Get items from the API response
      const serverDisks = action.payload.ok.data.items || [];

      // Find both default disks in the current state
      const defaultBrowserDisk = state.disks.find(
        (disk) => disk.id === defaultBrowserCacheDiskID
      );

      const defaultCloudSharingDisk = state.disks.find(
        (disk) => disk.id === defaultTempCloudSharingDiskID
      );

      // Filter out any server disk that has the same ID as our default disks
      const filteredServerDisks = serverDisks.filter(
        (disk: DiskFEO) =>
          disk.id !== defaultBrowserCacheDiskID &&
          disk.id !== defaultTempCloudSharingDiskID
      );

      // Create the new disks array - include the default disks if they exist
      let newDisks = [...filteredServerDisks];

      // Add the default disks at the beginning of the array
      if (defaultCloudSharingDisk) {
        newDisks.unshift(defaultCloudSharingDisk);
      }

      if (defaultBrowserDisk) {
        newDisks.unshift(defaultBrowserDisk);
      }

      const DEFAULT_DISK_ID = localStorage.getItem(
        LOCALSTORAGE_DEFAULT_DISK_ID
      );
      const defaultDisk = newDisks.find((disk) => disk.id === DEFAULT_DISK_ID);

      return {
        ...state,
        defaultDisk: defaultDisk || null,
        disks: newDisks,
        loading: false,
      };
    }

    case LIST_DISKS_ROLLBACK: {
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
        disks: updateOrAddDisk(state.disks, optimisticDisk, "_optimisticID"),
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

    default:
      return state;
  }
};

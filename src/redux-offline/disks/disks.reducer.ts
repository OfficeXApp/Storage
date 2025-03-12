// src/redux-offline/disks/disks.reducer.ts
import { Disk } from "@officexapp/types";
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

export const DISKS_REDUX_KEY = "disks";
export const DISKS_DEXIE_TABLE = DISKS_REDUX_KEY;

export interface DiskFEO extends Disk {
  _isOptimistic?: boolean; // flag for optimistic updates
  _optimisticID?: string; // unique ID for optimistic updates
  _syncWarning?: string; // tooltip for users
  _syncConflict?: boolean; // flag for corrupted data due to sync failures
  _syncSuccess?: boolean; // flag for successful sync
  _markedForDeletion?: boolean; // flag for deletion
}

interface DisksState {
  disks: DiskFEO[];
  loading: boolean;
  error: string | null;
}

const initialState: DisksState = {
  disks: [],
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
        loading: false,
      };
    }

    case GET_DISK_ROLLBACK: {
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
        error: action.payload.message || "Failed to fetch disk",
      };
    }

    // ------------------------------ LIST DISKS --------------------------------- //

    case LIST_DISKS: {
      return {
        ...state,
        disks: action.optimistic,
        loading: true,
        error: null,
      };
    }

    case LIST_DISKS_COMMIT: {
      // find & replace optimisticFetchDisk with action.payload.ok.data.items
      // or even replace entire disks
      return {
        ...state,
        disks: action.payload.ok.data.items,
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

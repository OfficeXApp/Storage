// src/redux-offline/drives/drives.reducer.ts
import { DriveFE, DriveID, Drive } from "@officexapp/types";
import {
  CREATE_DRIVE,
  CREATE_DRIVE_COMMIT,
  CREATE_DRIVE_ROLLBACK,
  LIST_DRIVES,
  LIST_DRIVES_COMMIT,
  LIST_DRIVES_ROLLBACK,
  GET_DRIVE,
  GET_DRIVE_COMMIT,
  GET_DRIVE_ROLLBACK,
  UPDATE_DRIVE,
  UPDATE_DRIVE_COMMIT,
  UPDATE_DRIVE_ROLLBACK,
  DELETE_DRIVE,
  DELETE_DRIVE_COMMIT,
  DELETE_DRIVE_ROLLBACK,
} from "./drives.actions";

export const DRIVES_REDUX_KEY = "drives";
export const DRIVES_DEXIE_TABLE = DRIVES_REDUX_KEY;

export interface DriveFEO extends DriveFE {
  _isOptimistic?: boolean; // flag for optimistic updates
  _optimisticID?: string; // unique ID for optimistic updates
  _syncWarning?: string; // tooltip for users
  _syncConflict?: boolean; // flag for corrupted data due to sync failures
  _syncSuccess?: boolean; // flag for successful sync
  _markedForDeletion?: boolean; // flag for deletion
}

interface DrivesState {
  drives: DriveFEO[];
  driveMap: Record<DriveID, DriveFEO>;
  loading: boolean;
  error: string | null;
}

const initialState: DrivesState = {
  drives: [],
  driveMap: {},
  loading: false,
  error: null,
};

const updateOrAddDrive = (
  drives: DriveFEO[],
  newDrive: DriveFEO,
  identifierKey: keyof DriveFEO = "id"
): DriveFEO[] => {
  const existingIndex = drives.findIndex(
    (drive) => drive[identifierKey] === newDrive[identifierKey]
  );

  if (existingIndex !== -1) {
    // Replace existing drive
    return [
      ...drives.slice(0, existingIndex),
      newDrive,
      ...drives.slice(existingIndex + 1),
    ];
  } else {
    // Add to the front of the array
    return [newDrive, ...drives];
  }
};

export const drivesReducer = (
  state = initialState,
  action: any
): DrivesState => {
  switch (action.type) {
    // ------------------------------ GET DRIVE --------------------------------- //

    // Get Drive
    case GET_DRIVE: {
      return {
        ...state,
        drives: action.optimistic
          ? updateOrAddDrive(state.drives, action.optimistic)
          : state.drives,
        driveMap: action.optimistic
          ? {
              ...state.driveMap,
              [action.optimistic.id]: action.optimistic,
            }
          : state.driveMap,
        loading: true,
        error: null,
      };
    }

    case GET_DRIVE_COMMIT: {
      const optimisticID = action.meta?.optimisticID;
      // Update the optimistic drive with the real data
      return {
        ...state,
        drives: state.drives.map((drive) => {
          if (drive._optimisticID === optimisticID) {
            return action.payload.ok.data;
          }
          return drive;
        }),
        driveMap: {
          ...state.driveMap,
          [action.payload.ok.data.id]: action.payload.ok.data,
        },
        loading: false,
      };
    }

    case GET_DRIVE_ROLLBACK: {
      if (!action.payload.response) return state;
      // Update the optimistic drive with the error message
      const newDriveMap = { ...state.driveMap };
      delete newDriveMap[action.meta.optimisticID];
      return {
        ...state,
        drives: state.drives.map((drive) => {
          if (drive._optimisticID === action.meta.optimisticID) {
            return {
              ...drive,
              _syncWarning: action.error_message,
              _syncSuccess: false,
              _syncConflict: true,
              _isOptimistic: false,
            };
          }
          return drive;
        }),
        driveMap: newDriveMap,
        loading: false,
        error: action.payload.message || "Failed to fetch drive",
      };
    }

    // ------------------------------ LIST DRIVES --------------------------------- //

    case LIST_DRIVES: {
      return {
        ...state,
        drives: action.optimistic || [],
        loading: true,
        error: null,
      };
    }

    case LIST_DRIVES_COMMIT: {
      return {
        ...state,
        drives: action.payload.ok.data.items,
        loading: false,
      };
    }

    case LIST_DRIVES_ROLLBACK: {
      if (!action.payload.response) return state;
      return {
        ...state,
        drives: [],
        loading: false,
        error: action.error_message || "Failed to fetch drives",
      };
    }

    // ------------------------------ CREATE DRIVE --------------------------------- //

    case CREATE_DRIVE: {
      const optimisticDrive = action.optimistic;
      return {
        ...state,
        drives: optimisticDrive
          ? updateOrAddDrive(state.drives, optimisticDrive, "_optimisticID")
          : state.drives,
        loading: true,
        error: null,
      };
    }

    case CREATE_DRIVE_COMMIT: {
      const optimisticID = action.meta?.optimisticID;
      // Remove the optimistic drive from our items array & indexdb
      const newDrive = {
        ...action.payload.ok.data,
        _syncSuccess: true,
        _syncConflict: false,
        _syncWarning: "",
        _isOptimistic: false,
      };
      const filteredDrives = state.drives.filter(
        (drive) => drive._optimisticID !== optimisticID
      );
      // removal from dexie is already handled in optimistic middleware which can handle async, whereas reducers are pure sync functions
      return {
        ...state,
        // Add the newly created drive to our items array
        drives: updateOrAddDrive(filteredDrives, newDrive),
        loading: false,
      };
    }

    case CREATE_DRIVE_ROLLBACK: {
      if (!action.payload.response) return state;
      // Add a sync warning to the optimistic drive
      const newReduxDrives = state.drives.map((drive) => {
        if (drive._optimisticID === action.meta.optimisticID) {
          return {
            ...drive,
            _syncWarning: action.error_message,
            _syncSuccess: false,
            _syncConflict: true,
            _isOptimistic: false,
          };
        }
        return drive;
      });
      return {
        ...state,
        drives: newReduxDrives,
        loading: false,
        error: action.payload.message || "Failed to create drive",
      };
    }

    // ------------------------------ UPDATE DRIVE --------------------------------- //

    case UPDATE_DRIVE: {
      const optimisticDrive = action.optimistic;
      return {
        ...state,
        drives: optimisticDrive
          ? updateOrAddDrive(state.drives, optimisticDrive)
          : state.drives,
        loading: true,
        error: null,
      };
    }

    case UPDATE_DRIVE_COMMIT: {
      const optimisticID = action.meta?.optimisticID;
      // Update the optimistic drive with the real data
      return {
        ...state,
        drives: state.drives.map((drive) => {
          if (drive._optimisticID === optimisticID) {
            return {
              ...drive,
              ...action.payload.ok.data,
              _syncSuccess: true,
              _syncConflict: false,
              _syncWarning: "",
              _isOptimistic: false,
            };
          }
          return drive;
        }),
        loading: false,
      };
    }

    case UPDATE_DRIVE_ROLLBACK: {
      if (!action.payload.response) return state;
      // Update the optimistic drive with the error message
      return {
        ...state,
        drives: state.drives.map((drive) => {
          if (drive._optimisticID === action.meta.optimisticID) {
            return {
              ...drive,
              _syncWarning: action.error_message,
              _syncSuccess: false,
              _syncConflict: true,
              _isOptimistic: false,
            };
          }
          return drive;
        }),
        loading: false,
        error: action.payload.message || "Failed to update drive",
      };
    }

    // ------------------------------ DELETE DRIVE --------------------------------- //

    case DELETE_DRIVE: {
      const optimisticDrive = action.optimistic;
      return {
        ...state,
        drives: optimisticDrive
          ? updateOrAddDrive(state.drives, optimisticDrive)
          : state.drives,
        loading: true,
        error: null,
      };
    }

    case DELETE_DRIVE_COMMIT: {
      const optimisticID = action.meta?.optimisticID;
      // Update the optimistic drive with the real data
      return {
        ...state,
        drives: state.drives.filter(
          (drive) => drive._optimisticID !== optimisticID
        ),
        loading: false,
      };
    }

    case DELETE_DRIVE_ROLLBACK: {
      if (!action.payload.response) return state;
      // Update the optimistic drive with the error message
      return {
        ...state,
        drives: state.drives.map((drive) => {
          if (drive._optimisticID === action.meta.optimisticID) {
            return {
              ...drive,
              _syncWarning: action.error_message,
              _syncSuccess: false,
              _syncConflict: true,
              _isOptimistic: false,
            };
          }
          return drive;
        }),
        loading: false,
        error: action.payload.message || "Failed to delete drive",
      };
    }

    default:
      return state;
  }
};

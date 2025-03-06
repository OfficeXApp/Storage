// store/disks/reducer.ts
import { Disk } from "@officexapp/types";
import {
  CREATE_DISK,
  CREATE_DISK_COMMIT,
  CREATE_DISK_ROLLBACK,
  FETCH_DISKS,
  FETCH_DISKS_COMMIT,
  FETCH_DISKS_ROLLBACK,
} from "./disks.actions";

export const DISKS_PERSIST_KEY = "disks";

interface DisksState {
  disks: Disk[];
  loading: boolean;
  error: string | null;
}
const initialState: DisksState = {
  disks: [],
  loading: false,
  error: null,
};

export const disksReducer = (state = initialState, action: any): DisksState => {
  switch (action.type) {
    // List Disks
    case FETCH_DISKS:
      return {
        ...state,
        loading: true,
        error: null,
      };

    case FETCH_DISKS_COMMIT:
      return {
        ...state,
        disks: action.payload.ok.data.items,
        loading: false,
      };

    case FETCH_DISKS_ROLLBACK:
      return {
        ...state,
        loading: false,
        error: action.payload.message || "Failed to fetch disks",
      };

    // Create Disk
    case CREATE_DISK:
      return {
        ...state,
        loading: true,
        error: null,
      };

    case CREATE_DISK_COMMIT:
      return {
        ...state,
        // Add the newly created disk to our items array
        disks: [...state.disks, action.payload.ok.data],
        loading: false,
      };

    case CREATE_DISK_ROLLBACK:
      return {
        ...state,
        loading: false,
        error: action.payload.message || "Failed to create disk",
      };

    default:
      return state;
  }
};

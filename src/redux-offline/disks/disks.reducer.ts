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

export const DISKS_REDUX_KEY = "disks";
export const DISKS_DEXIE_TABLE = DISKS_REDUX_KEY;

interface DiskFEO extends Disk {
  _optimisticID?: string;
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

export const disksReducer = (state = initialState, action: any): DisksState => {
  switch (action.type) {
    // List Disks
    case FETCH_DISKS: {
      return {
        ...state,
        loading: true,
        error: null,
      };
    }

    case FETCH_DISKS_COMMIT: {
      // find & replace optimisticFetchDisk with action.payload.ok.data.items
      // or even replace entire disks
      return {
        ...state,
        disks: action.payload.ok.data.items,
        loading: false,
      };
    }

    case FETCH_DISKS_ROLLBACK: {
      return {
        ...state,
        loading: false,
        error: action.payload.message || "Failed to fetch disks",
      };
    }

    // Create Disk
    case CREATE_DISK: {
      // const diskData = action.meta.offline.effect.data;
      console.log(`Now in official reducer CREATE_DISK`, action);
      const optimisticDisk = action.optimistic;
      // then save to localdb too
      return {
        ...state,
        disks: [...state.disks, optimisticDisk],
        loading: true,
        error: null,
      };
    }

    case CREATE_DISK_COMMIT: {
      console.log(`Now in official reducer CREATE_DISK_COMMIT`, action);
      console.log(`versus current state`, state);
      const optimisticID = action.meta?.optimisticID;
      // Remove the optimistic disk from our items array & indexdb
      const newReduxDisks = state.disks
        .filter((disk) => disk._optimisticID !== optimisticID)
        .concat(action.payload.ok.data);
      // removal from dexie is already handled in optimistic middleware which can handle async, whereas reducers are pure sync functions
      return {
        ...state,
        // Add the newly created disk to our items array
        disks: newReduxDisks,
        loading: false,
      };
    }

    case CREATE_DISK_ROLLBACK: {
      // Remove the optimistic disk from our items array & indexdb
      const newReduxDisks = state.disks.filter(
        (disk) => disk._optimisticID !== action.meta.optimisticID
      );
      // removal from dexie is already handled in optimistic middleware which can handle async, whereas reducers are pure sync functions
      return {
        ...state,
        disks: newReduxDisks,
        loading: false,
        error: action.payload.message || "Failed to create disk",
      };
    }

    default:
      return state;
  }
};

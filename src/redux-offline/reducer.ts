// store/root-reducer.ts
import { combineReducers } from "redux";
import { DISKS_REDUX_KEY, disksReducer } from "./disks/disks.reducer";
import {
  CONTACTS_REDUX_KEY,
  contactsReducer,
} from "./contacts/contacts.reducer";
import { OfflineAction } from "@redux-offline/redux-offline/lib/types";

export const rootReducer = combineReducers({
  [DISKS_REDUX_KEY]: disksReducer,
  [CONTACTS_REDUX_KEY]: contactsReducer,
  // Any other reducers would go here
});

// Define the shape of the offline state that redux-offline adds to your store
export interface OfflineState {
  online: boolean;
  busy: boolean;
  lastTransaction: number;
  outbox: OfflineAction[];
  retryCount: number;
  retryScheduled: boolean;
  netInfo?: {
    isConnectionExpensive: boolean;
    reach: string;
  };
}

// Type for the network callback
export type NetworkCallback = (
  result: boolean | { online: boolean; netInfo?: any }
) => void;

export type RootState = ReturnType<typeof rootReducer>;

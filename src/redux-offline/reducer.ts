// store/root-reducer.ts
import { combineReducers } from "redux";
import { DISKS_REDUX_KEY, disksReducer } from "./disks/disks.reducer";
import {
  CONTACTS_REDUX_KEY,
  contactsReducer,
} from "./contacts/contacts.reducer";
import { OfflineAction } from "@redux-offline/redux-offline/lib/types";
import { TAGS_REDUX_KEY, tagsReducer } from "./tags/tags.reducer";
import { DRIVES_REDUX_KEY, drivesReducer } from "./drives/drives.reducer";
import { TEAMS_REDUX_KEY, teamsReducer } from "./teams/teams.reducer";
import {
  TEAM_INVITES_REDUX_KEY,
  teamInvitesReducer,
} from "./team-invites/team-invites.reducer";
import {
  WEBHOOKS_REDUX_KEY,
  webhooksReducer,
} from "./webhooks/webhooks.reducer";
import { APIKEYS_REDUX_KEY, apiKeysReducer } from "./api-keys/api-keys.reducer";

export const rootReducer = combineReducers({
  [DISKS_REDUX_KEY]: disksReducer,
  [CONTACTS_REDUX_KEY]: contactsReducer,
  [TAGS_REDUX_KEY]: tagsReducer,
  [DRIVES_REDUX_KEY]: drivesReducer,
  [TEAMS_REDUX_KEY]: teamsReducer,
  [TEAM_INVITES_REDUX_KEY]: teamInvitesReducer,
  [WEBHOOKS_REDUX_KEY]: webhooksReducer,
  [APIKEYS_REDUX_KEY]: apiKeysReducer,
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

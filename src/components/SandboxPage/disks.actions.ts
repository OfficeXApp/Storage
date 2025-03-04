// store/disks.actions.ts

import { DiskTypeEnum } from "@officexapp/types";

// API base URL
const API_URL = "http://bkyz2-fmaaa-aaaaa-qaaaq-cai.localhost:8000/v1/default";
const API_KEY =
  "eyJhdXRoX3R5cGUiOiJBUElfX0tFWSIsInZhbHVlIjoiZGU5NGU1ZjNkMDExN2NjZmE0ZGIxOGY5MGUyMzhkYjAxNWNiMjRmMDhhZjBkZjQ0NGEzOTdjMDM1OTU3MzJiOSJ9";

export const FETCH_DISKS = "FETCH_DISKS";
export const FETCH_DISKS_COMMIT = "FETCH_DISKS_COMMIT";
export const FETCH_DISKS_ROLLBACK = "FETCH_DISKS_ROLLBACK";

export const CREATE_DISK = "CREATE_DISK";
export const CREATE_DISK_COMMIT = "CREATE_DISK_COMMIT";
export const CREATE_DISK_ROLLBACK = "CREATE_DISK_ROLLBACK";

// List Disks
export const fetchDisks = () => ({
  type: FETCH_DISKS,
  meta: {
    offline: {
      // Define the effect (the API call to make)
      effect: {
        url: `${API_URL}/disks/list`,
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${API_KEY}`,
        },
        data: {},
      },
      // Action to dispatch on success
      commit: { type: FETCH_DISKS_COMMIT },
      // Action to dispatch on failure
      rollback: { type: FETCH_DISKS_ROLLBACK },
    },
  },
});

// Create Disk
export const createDisk = (diskData: {
  name: string;
  disk_type: DiskTypeEnum;
  public_note?: string;
  private_note?: string;
  auth_json?: string;
  external_id?: string;
  external_payload?: string;
}) => {
  const payload = {
    action: "CREATE",
    ...diskData,
  };

  return {
    type: CREATE_DISK,
    meta: {
      offline: {
        // Define the effect (the API call to make)
        effect: {
          url: `${API_URL}/disks/upsert`,
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${API_KEY}`,
          },
          data: payload,
        },
        // Action to dispatch on success
        commit: { type: CREATE_DISK_COMMIT },
        // Action to dispatch on failure
        rollback: { type: CREATE_DISK_ROLLBACK },
      },
    },
  };
};

// store/disks.actions.ts

import { DiskTypeEnum, DriveID } from "@officexapp/types";

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
        url: `/disks/list`,
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          // Authorization: `Bearer HANDLED_BY_MIDDLEWARE`,
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
    ...diskData,
  };

  return {
    type: CREATE_DISK,
    meta: {
      offline: {
        // Define the effect (the API call to make)
        effect: {
          url: `/disks/create`,
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            // Authorization: `Bearer HANDLED_BY_MIDDLEWARE`,
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

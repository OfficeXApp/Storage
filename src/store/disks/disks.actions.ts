// store/disks.actions.ts

import { DiskTypeEnum, DriveID } from "@officexapp/types";

export const FETCH_DISKS = "FETCH_DISKS";
export const FETCH_DISKS_COMMIT = "FETCH_DISKS_COMMIT";
export const FETCH_DISKS_ROLLBACK = "FETCH_DISKS_ROLLBACK";

export const CREATE_DISK = "CREATE_DISK";
export const CREATE_DISK_COMMIT = "CREATE_DISK_COMMIT";
export const CREATE_DISK_ROLLBACK = "CREATE_DISK_ROLLBACK";

interface TempCreds {
  endpoint_url: string;
  drive_id: DriveID;
  auth_token: string;
}

// List Disks
export const fetchDisks = ({
  endpoint_url,
  drive_id,
  auth_token,
}: TempCreds) => ({
  type: FETCH_DISKS,
  meta: {
    offline: {
      // Define the effect (the API call to make)
      effect: {
        url: `${endpoint_url}/v1/${drive_id}/disks/list`,
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${auth_token}`,
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
export const createDisk = (
  diskData: {
    name: string;
    disk_type: DiskTypeEnum;
    public_note?: string;
    private_note?: string;
    auth_json?: string;
    external_id?: string;
    external_payload?: string;
  },
  { endpoint_url, drive_id, auth_token }: TempCreds
) => {
  const payload = {
    ...diskData,
  };

  return {
    type: CREATE_DISK,
    meta: {
      offline: {
        // Define the effect (the API call to make)
        effect: {
          url: `${endpoint_url}/v1/${drive_id}/disks/create`,
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${auth_token}`,
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

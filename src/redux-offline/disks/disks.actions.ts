// src/redux-offline/disks/disks.actions.ts

import {
  DiskID,
  DiskTypeEnum,
  DriveID,
  GenerateID,
  IRequestCreateDisk,
  IRequestDeleteDisk,
  IRequestListDisks,
  IRequestUpdateDisk,
} from "@officexapp/types";
import { v4 as uuidv4 } from "uuid";

export const GET_DISK = "GET_DISK";
export const GET_DISK_COMMIT = "GET_DISK_COMMIT";
export const GET_DISK_ROLLBACK = "GET_DISK_ROLLBACK";

export const LIST_DISKS = "LIST_DISKS";
export const LIST_DISKS_COMMIT = "LIST_DISKS_COMMIT";
export const LIST_DISKS_ROLLBACK = "LIST_DISKS_ROLLBACK";

export const CREATE_DISK = "CREATE_DISK";
export const CREATE_DISK_COMMIT = "CREATE_DISK_COMMIT";
export const CREATE_DISK_ROLLBACK = "CREATE_DISK_ROLLBACK";

export const UPDATE_DISK = "UPDATE_DISK";
export const UPDATE_DISK_COMMIT = "UPDATE_DISK_COMMIT";
export const UPDATE_DISK_ROLLBACK = "UPDATE_DISK_ROLLBACK";

export const DELETE_DISK = "DELETE_DISK";
export const DELETE_DISK_COMMIT = "DELETE_DISK_COMMIT";
export const DELETE_DISK_ROLLBACK = "DELETE_DISK_ROLLBACK";

// Get Disk
export const getDiskAction = (id: DiskID) => ({
  type: GET_DISK,
  meta: {
    optimisticID: id,
    offline: {
      // Define the effect (the API call to make)
      effect: {
        url: `/disks/get/${id}`,
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          // Authorization: `Bearer HANDLED_BY_OFFLINE_EFFECT_MIDDLEWARE`,
        },
        data: {},
      },
      // Action to dispatch on success
      commit: { type: GET_DISK_COMMIT },
      // Action to dispatch on failure
      rollback: { type: GET_DISK_ROLLBACK },
    },
  },
});

// List Disks
export const listDisksAction = (payload: IRequestListDisks) => ({
  type: LIST_DISKS,
  meta: {
    offline: {
      // Define the effect (the API call to make)
      effect: {
        url: `/disks/list`,
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          // Authorization: `Bearer HANDLED_BY_OFFLINE_EFFECT_MIDDLEWARE`,
        },
        data: {},
      },
      // Action to dispatch on success
      commit: { type: LIST_DISKS_COMMIT },
      // Action to dispatch on failure
      rollback: { type: LIST_DISKS_ROLLBACK },
    },
  },
});

// Create Disk
export const createDiskAction = (diskData: IRequestCreateDisk) => {
  const id = GenerateID.Disk();
  const payload = {
    ...diskData,
    id,
  };
  return {
    type: CREATE_DISK,
    meta: {
      optimisticID: id,
      offline: {
        effect: {
          url: `/disks/create`,
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            // Authorization: `Bearer HANDLED_BY_OFFLINE_EFFECT_MIDDLEWARE`,
          },
          data: payload,
        },
        // Action to dispatch on success
        commit: { type: CREATE_DISK_COMMIT, meta: { optimisticID: id } },
        // Action to dispatch on failure
        rollback: { type: CREATE_DISK_ROLLBACK, meta: { optimisticID: id } },
      },
    },
  };
};

// Update Disk
export const updateDiskAction = (diskData: IRequestUpdateDisk) => {
  const id = diskData.id;
  const payload = {
    ...diskData,
  };
  return {
    type: UPDATE_DISK,
    meta: {
      optimisticID: id,
      offline: {
        effect: {
          url: `/disks/update`,
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            // Authorization: `Bearer HANDLED_BY_OFFLINE_EFFECT_MIDDLEWARE`,
          },
          data: payload,
        },
        // Action to dispatch on success
        commit: { type: UPDATE_DISK_COMMIT, meta: { optimisticID: id } },
        // Action to dispatch on failure
        rollback: { type: UPDATE_DISK_ROLLBACK, meta: { optimisticID: id } },
      },
    },
  };
};

// Delete Disk
export const deleteDiskAction = (payload: IRequestDeleteDisk) => {
  const id = payload.id;
  return {
    type: DELETE_DISK,
    meta: {
      optimisticID: id,
      offline: {
        effect: {
          url: `/disks/delete`,
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            // Authorization: `Bearer HANDLED_BY_OFFLINE_EFFECT_MIDDLEWARE`,
          },
          data: payload,
        },
        // Action to dispatch on success
        commit: { type: DELETE_DISK_COMMIT, meta: { optimisticID: id } },
        // Action to dispatch on failure
        rollback: {
          type: DELETE_DISK_ROLLBACK,
          meta: { optimisticID: id },
        },
      },
    },
  };
};

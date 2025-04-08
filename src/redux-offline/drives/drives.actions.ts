// src/redux-offline/drives/drives.actions.ts

import {
  DriveID,
  GenerateID,
  ICPPrincipalString,
  IRequestGetDrive,
  IRequestListDrives,
  IRequestCreateDrive,
  IRequestUpdateDrive,
  IRequestDeleteDrive,
  DriveFE,
  UserID,
} from "@officexapp/types";

export const GET_DRIVE = "GET_DRIVE";
export const GET_DRIVE_COMMIT = "GET_DRIVE_COMMIT";
export const GET_DRIVE_ROLLBACK = "GET_DRIVE_ROLLBACK";

export const LIST_DRIVES = "LIST_DRIVES";
export const LIST_DRIVES_COMMIT = "LIST_DRIVES_COMMIT";
export const LIST_DRIVES_ROLLBACK = "LIST_DRIVES_ROLLBACK";

export const CREATE_DRIVE = "CREATE_DRIVE";
export const CREATE_DRIVE_COMMIT = "CREATE_DRIVE_COMMIT";
export const CREATE_DRIVE_ROLLBACK = "CREATE_DRIVE_ROLLBACK";

export const UPDATE_DRIVE = "UPDATE_DRIVE";
export const UPDATE_DRIVE_COMMIT = "UPDATE_DRIVE_COMMIT";
export const UPDATE_DRIVE_ROLLBACK = "UPDATE_DRIVE_ROLLBACK";

export const DELETE_DRIVE = "DELETE_DRIVE";
export const DELETE_DRIVE_COMMIT = "DELETE_DRIVE_COMMIT";
export const DELETE_DRIVE_ROLLBACK = "DELETE_DRIVE_ROLLBACK";

export const CHECK_DRIVE_TABLE_PERMISSIONS = "CHECK_DRIVE_TABLE_PERMISSIONS";

export const CHECK_DRIVE_TABLE_PERMISSIONS_COMMIT =
  "CHECK_DRIVE_TABLE_PERMISSIONS_COMMIT";

export const CHECK_DRIVE_TABLE_PERMISSIONS_ROLLBACK =
  "CHECK_DRIVE_TABLE_PERMISSIONS_ROLLBACK";

// Get Drive
export const getDriveAction = (drive_id: DriveID) => ({
  type: GET_DRIVE,
  meta: {
    optimisticID: drive_id,
    offline: {
      // Define the effect (the API call to make)
      effect: {
        url: `/drives/get/${drive_id}`,
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          // Authorization: `Bearer HANDLED_BY_OFFLINE_EFFECT_MIDDLEWARE`,
        },
        data: {},
      },
      // Action to dispatch on success
      commit: { type: GET_DRIVE_COMMIT },
      // Action to dispatch on failure
      rollback: { type: GET_DRIVE_ROLLBACK },
    },
  },
});

// List Drives
export const listDrivesAction = (payload: IRequestListDrives) => ({
  type: LIST_DRIVES,
  meta: {
    offline: {
      // Define the effect (the API call to make)
      effect: {
        url: `/drives/list`,
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          // Authorization: `Bearer HANDLED_BY_OFFLINE_EFFECT_MIDDLEWARE`,
        },
        data: payload,
      },
      // Action to dispatch on success
      commit: { type: LIST_DRIVES_COMMIT },
      // Action to dispatch on failure
      rollback: { type: LIST_DRIVES_ROLLBACK },
    },
  },
});

// Create Drive
export const createDriveAction = (driveData: IRequestCreateDrive) => {
  const id = driveData.id || GenerateID.Drive(driveData.icp_principal);
  const payload = {
    ...driveData,
    id,
  };
  return {
    type: CREATE_DRIVE,
    meta: {
      optimisticID: id,
      offline: {
        effect: {
          url: `/drives/create`,
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            // Authorization: `Bearer HANDLED_BY_OFFLINE_EFFECT_MIDDLEWARE`,
          },
          data: payload,
        },
        // Action to dispatch on success
        commit: { type: CREATE_DRIVE_COMMIT, meta: { optimisticID: id } },
        // Action to dispatch on failure
        rollback: { type: CREATE_DRIVE_ROLLBACK, meta: { optimisticID: id } },
      },
    },
  };
};

// Update Drive
export const updateDriveAction = (driveData: IRequestUpdateDrive) => {
  const id = driveData.id;
  const payload = {
    ...driveData,
  };
  return {
    type: UPDATE_DRIVE,
    meta: {
      optimisticID: id,
      offline: {
        effect: {
          url: `/drives/update`,
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            // Authorization: `Bearer HANDLED_BY_OFFLINE_EFFECT_MIDDLEWARE`,
          },
          data: payload,
        },
        // Action to dispatch on success
        commit: { type: UPDATE_DRIVE_COMMIT, meta: { optimisticID: id } },
        // Action to dispatch on failure
        rollback: { type: UPDATE_DRIVE_ROLLBACK, meta: { optimisticID: id } },
      },
    },
  };
};

// Delete Drive
export const deleteDriveAction = (payload: IRequestDeleteDrive) => {
  const id = payload.id;
  return {
    type: DELETE_DRIVE,
    meta: {
      optimisticID: id,
      offline: {
        effect: {
          url: `/drives/delete`,
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            // Authorization: `Bearer HANDLED_BY_OFFLINE_EFFECT_MIDDLEWARE`,
          },
          data: payload,
        },
        // Action to dispatch on success
        commit: { type: DELETE_DRIVE_COMMIT, meta: { optimisticID: id } },
        // Action to dispatch on failure
        rollback: {
          type: DELETE_DRIVE_ROLLBACK,
          meta: { optimisticID: id },
        },
      },
    },
  };
};

// Check Drive Table Permissions
export const checkDriveTablePermissionsAction = (userID: UserID) => {
  const id = `drive_table_permissions_${userID}`;
  console.log(`Firing checkDriveTablePermissionsAction for user ${userID}`);
  const payload = {
    resource_id: "TABLE_DRIVES",
    grantee_id: userID,
  };

  return {
    type: CHECK_DRIVE_TABLE_PERMISSIONS,
    meta: {
      optimisticID: id,
      offline: {
        effect: {
          url: `/permissions/system/check`,
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            // Authorization: `Bearer HANDLED_BY_OFFLINE_EFFECT_MIDDLEWARE`,
          },
          data: payload,
        },
        // Action to dispatch on success
        commit: {
          type: CHECK_DRIVE_TABLE_PERMISSIONS_COMMIT,
          meta: { optimisticID: id },
        },
        // Action to dispatch on failure
        rollback: {
          type: CHECK_DRIVE_TABLE_PERMISSIONS_ROLLBACK,
          meta: { optimisticID: id },
        },
      },
    },
  };
};

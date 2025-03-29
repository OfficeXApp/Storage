// src/redux-offline/permissions.actions.ts

import {
  SystemResourceID,
  DirectoryResourceID,
  GranteeID,
  SystemPermissionID,
  DirectoryPermissionID,
  GenerateID,
  IRequestGetSystemPermission,
  IRequestListSystemPermissions,
  IRequestCreateSystemPermission,
  IRequestUpdateSystemPermission,
  IRequestDeleteSystemPermission,
  IRequestRedeemSystemPermission,
  IRequestGetDirectoryPermission,
  IRequestCreateDirectoryPermission,
  IRequestUpdateDirectoryPermission,
  IRequestDeleteDirectoryPermission,
  IRequestRedeemDirectoryPermission,
  SystemPermission,
  DirectoryPermission,
  IRequestListDirectoryPermissions,
} from "@officexapp/types";

// System Permission action types
export const GET_SYSTEM_PERMISSION = "GET_SYSTEM_PERMISSION";
export const GET_SYSTEM_PERMISSION_COMMIT = "GET_SYSTEM_PERMISSION_COMMIT";
export const GET_SYSTEM_PERMISSION_ROLLBACK = "GET_SYSTEM_PERMISSION_ROLLBACK";

export const LIST_SYSTEM_PERMISSIONS = "LIST_SYSTEM_PERMISSIONS";
export const LIST_SYSTEM_PERMISSIONS_COMMIT = "LIST_SYSTEM_PERMISSIONS_COMMIT";
export const LIST_SYSTEM_PERMISSIONS_ROLLBACK =
  "LIST_SYSTEM_PERMISSIONS_ROLLBACK";

export const CREATE_SYSTEM_PERMISSION = "CREATE_SYSTEM_PERMISSION";
export const CREATE_SYSTEM_PERMISSION_COMMIT =
  "CREATE_SYSTEM_PERMISSION_COMMIT";
export const CREATE_SYSTEM_PERMISSION_ROLLBACK =
  "CREATE_SYSTEM_PERMISSION_ROLLBACK";

export const UPDATE_SYSTEM_PERMISSION = "UPDATE_SYSTEM_PERMISSION";
export const UPDATE_SYSTEM_PERMISSION_COMMIT =
  "UPDATE_SYSTEM_PERMISSION_COMMIT";
export const UPDATE_SYSTEM_PERMISSION_ROLLBACK =
  "UPDATE_SYSTEM_PERMISSION_ROLLBACK";

export const DELETE_SYSTEM_PERMISSION = "DELETE_SYSTEM_PERMISSION";
export const DELETE_SYSTEM_PERMISSION_COMMIT =
  "DELETE_SYSTEM_PERMISSION_COMMIT";
export const DELETE_SYSTEM_PERMISSION_ROLLBACK =
  "DELETE_SYSTEM_PERMISSION_ROLLBACK";

export const REDEEM_SYSTEM_PERMISSION = "REDEEM_SYSTEM_PERMISSION";
export const REDEEM_SYSTEM_PERMISSION_COMMIT =
  "REDEEM_SYSTEM_PERMISSION_COMMIT";
export const REDEEM_SYSTEM_PERMISSION_ROLLBACK =
  "REDEEM_SYSTEM_PERMISSION_ROLLBACK";

// Directory Permission action types
export const GET_DIRECTORY_PERMISSION = "GET_DIRECTORY_PERMISSION";
export const GET_DIRECTORY_PERMISSION_COMMIT =
  "GET_DIRECTORY_PERMISSION_COMMIT";
export const GET_DIRECTORY_PERMISSION_ROLLBACK =
  "GET_DIRECTORY_PERMISSION_ROLLBACK";

export const LIST_DIRECTORY_PERMISSIONS = "LIST_DIRECTORY_PERMISSIONS";
export const LIST_DIRECTORY_PERMISSIONS_COMMIT =
  "LIST_DIRECTORY_PERMISSIONS_COMMIT";
export const LIST_DIRECTORY_PERMISSIONS_ROLLBACK =
  "LIST_DIRECTORY_PERMISSIONS_ROLLBACK";

export const CREATE_DIRECTORY_PERMISSION = "CREATE_DIRECTORY_PERMISSION";
export const CREATE_DIRECTORY_PERMISSION_COMMIT =
  "CREATE_DIRECTORY_PERMISSION_COMMIT";
export const CREATE_DIRECTORY_PERMISSION_ROLLBACK =
  "CREATE_DIRECTORY_PERMISSION_ROLLBACK";

export const UPDATE_DIRECTORY_PERMISSION = "UPDATE_DIRECTORY_PERMISSION";
export const UPDATE_DIRECTORY_PERMISSION_COMMIT =
  "UPDATE_DIRECTORY_PERMISSION_COMMIT";
export const UPDATE_DIRECTORY_PERMISSION_ROLLBACK =
  "UPDATE_DIRECTORY_PERMISSION_ROLLBACK";

export const DELETE_DIRECTORY_PERMISSION = "DELETE_DIRECTORY_PERMISSION";
export const DELETE_DIRECTORY_PERMISSION_COMMIT =
  "DELETE_DIRECTORY_PERMISSION_COMMIT";
export const DELETE_DIRECTORY_PERMISSION_ROLLBACK =
  "DELETE_DIRECTORY_PERMISSION_ROLLBACK";

export const REDEEM_DIRECTORY_PERMISSION = "REDEEM_DIRECTORY_PERMISSION";
export const REDEEM_DIRECTORY_PERMISSION_COMMIT =
  "REDEEM_DIRECTORY_PERMISSION_COMMIT";
export const REDEEM_DIRECTORY_PERMISSION_ROLLBACK =
  "REDEEM_DIRECTORY_PERMISSION_ROLLBACK";

// System Permission action creators
export const getSystemPermissionAction = (
  system_permission_id: SystemPermissionID
) => ({
  type: GET_SYSTEM_PERMISSION,
  meta: {
    optimisticID: system_permission_id,
    offline: {
      effect: {
        url: `/permissions/system/get/${system_permission_id}`,
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        data: {},
      },
      commit: { type: GET_SYSTEM_PERMISSION_COMMIT },
      rollback: { type: GET_SYSTEM_PERMISSION_ROLLBACK },
    },
  },
});

export const listSystemPermissionsAction = (
  payload: IRequestListSystemPermissions
) => ({
  type: LIST_SYSTEM_PERMISSIONS,
  meta: {
    offline: {
      effect: {
        url: `/permissions/system/list`,
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        data: payload,
      },
      commit: { type: LIST_SYSTEM_PERMISSIONS_COMMIT },
      rollback: { type: LIST_SYSTEM_PERMISSIONS_ROLLBACK },
    },
  },
});

export const createSystemPermissionAction = (
  permissionData: IRequestCreateSystemPermission
) => {
  const id = permissionData.id || GenerateID.SystemPermission();
  const payload = {
    ...permissionData,
    id,
  };
  return {
    type: CREATE_SYSTEM_PERMISSION,
    meta: {
      optimisticID: id,
      offline: {
        effect: {
          url: `/permissions/system/create`,
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          data: payload,
        },
        commit: {
          type: CREATE_SYSTEM_PERMISSION_COMMIT,
          meta: { optimisticID: id },
        },
        rollback: {
          type: CREATE_SYSTEM_PERMISSION_ROLLBACK,
          meta: { optimisticID: id },
        },
      },
    },
  };
};

export const updateSystemPermissionAction = (
  permissionData: IRequestUpdateSystemPermission
) => {
  const id = permissionData.id;
  const payload = {
    ...permissionData,
  };
  return {
    type: UPDATE_SYSTEM_PERMISSION,
    meta: {
      optimisticID: id,
      offline: {
        effect: {
          url: `/permissions/system/update`,
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          data: payload,
        },
        commit: {
          type: UPDATE_SYSTEM_PERMISSION_COMMIT,
          meta: { optimisticID: id },
        },
        rollback: {
          type: UPDATE_SYSTEM_PERMISSION_ROLLBACK,
          meta: { optimisticID: id },
        },
      },
    },
  };
};

export const deleteSystemPermissionAction = (
  payload: IRequestDeleteSystemPermission
) => {
  const id = payload.permission_id;
  return {
    type: DELETE_SYSTEM_PERMISSION,
    meta: {
      optimisticID: id,
      offline: {
        effect: {
          url: `/permissions/system/delete`,
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          data: payload,
        },
        commit: {
          type: DELETE_SYSTEM_PERMISSION_COMMIT,
          meta: { optimisticID: id },
        },
        rollback: {
          type: DELETE_SYSTEM_PERMISSION_ROLLBACK,
          meta: { optimisticID: id },
        },
      },
    },
  };
};

export const redeemSystemPermissionAction = (
  payload: IRequestRedeemSystemPermission
) => {
  const id = payload.permission_id;
  return {
    type: REDEEM_SYSTEM_PERMISSION,
    meta: {
      optimisticID: id,
      offline: {
        effect: {
          url: `/permissions/system/redeem`,
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          data: payload,
        },
        commit: {
          type: REDEEM_SYSTEM_PERMISSION_COMMIT,
          meta: { optimisticID: id },
        },
        rollback: {
          type: REDEEM_SYSTEM_PERMISSION_ROLLBACK,
          meta: { optimisticID: id },
        },
      },
    },
  };
};

export const listDirectoryPermissionsAction = (
  payload: IRequestListDirectoryPermissions
) => ({
  type: LIST_DIRECTORY_PERMISSIONS,
  meta: {
    offline: {
      effect: {
        url: `/permissions/directory/list`,
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        data: payload,
      },
      commit: { type: LIST_DIRECTORY_PERMISSIONS_COMMIT },
      rollback: { type: LIST_DIRECTORY_PERMISSIONS_ROLLBACK },
    },
  },
});

// Directory Permission action creators
export const getDirectoryPermissionAction = (
  directory_permission_id: DirectoryPermissionID
) => ({
  type: GET_DIRECTORY_PERMISSION,
  meta: {
    optimisticID: directory_permission_id,
    offline: {
      effect: {
        url: `/permissions/directory/get/${directory_permission_id}`,
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        data: {},
      },
      commit: { type: GET_DIRECTORY_PERMISSION_COMMIT },
      rollback: { type: GET_DIRECTORY_PERMISSION_ROLLBACK },
    },
  },
});

export const createDirectoryPermissionAction = (
  permissionData: IRequestCreateDirectoryPermission
) => {
  const id = permissionData.id || GenerateID.DirectoryPermission();
  const payload = {
    ...permissionData,
    id,
  };
  return {
    type: CREATE_DIRECTORY_PERMISSION,
    meta: {
      optimisticID: id,
      offline: {
        effect: {
          url: `/permissions/directory/create`,
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          data: payload,
        },
        commit: {
          type: CREATE_DIRECTORY_PERMISSION_COMMIT,
          meta: { optimisticID: id },
        },
        rollback: {
          type: CREATE_DIRECTORY_PERMISSION_ROLLBACK,
          meta: { optimisticID: id },
        },
      },
    },
  };
};

export const updateDirectoryPermissionAction = (
  permissionData: IRequestUpdateDirectoryPermission
) => {
  const id = permissionData.id;
  const payload = {
    ...permissionData,
  };
  return {
    type: UPDATE_DIRECTORY_PERMISSION,
    meta: {
      optimisticID: id,
      offline: {
        effect: {
          url: `/permissions/directory/update`,
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          data: payload,
        },
        commit: {
          type: UPDATE_DIRECTORY_PERMISSION_COMMIT,
          meta: { optimisticID: id },
        },
        rollback: {
          type: UPDATE_DIRECTORY_PERMISSION_ROLLBACK,
          meta: { optimisticID: id },
        },
      },
    },
  };
};

export const deleteDirectoryPermissionAction = (
  payload: IRequestDeleteDirectoryPermission
) => {
  const id = payload.permission_id;
  return {
    type: DELETE_DIRECTORY_PERMISSION,
    meta: {
      optimisticID: id,
      offline: {
        effect: {
          url: `/permissions/directory/delete`,
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          data: payload,
        },
        commit: {
          type: DELETE_DIRECTORY_PERMISSION_COMMIT,
          meta: { optimisticID: id },
        },
        rollback: {
          type: DELETE_DIRECTORY_PERMISSION_ROLLBACK,
          meta: { optimisticID: id },
        },
      },
    },
  };
};

export const redeemDirectoryPermissionAction = (
  payload: IRequestRedeemDirectoryPermission
) => {
  const id = payload.permission_id;
  return {
    type: REDEEM_DIRECTORY_PERMISSION,
    meta: {
      optimisticID: id,
      offline: {
        effect: {
          url: `/permissions/directory/redeem`,
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          data: payload,
        },
        commit: {
          type: REDEEM_DIRECTORY_PERMISSION_COMMIT,
          meta: { optimisticID: id },
        },
        rollback: {
          type: REDEEM_DIRECTORY_PERMISSION_ROLLBACK,
          meta: { optimisticID: id },
        },
      },
    },
  };
};

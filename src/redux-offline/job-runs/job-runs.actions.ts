// src/redux-offline/jobRuns/jobRuns.actions.ts

import {
  JobRunID,
  IRequestCreateJobRun,
  IRequestDeleteJobRun,
  IRequestListJobRuns,
  IRequestUpdateJobRun,
  UserID,
} from "@officexapp/types";
import { GenerateID } from "@officexapp/types"; // Assuming GenerateID is available

export const GET_JOB_RUN = "GET_JOB_RUN";
export const GET_JOB_RUN_COMMIT = "GET_JOB_RUN_COMMIT";
export const GET_JOB_RUN_ROLLBACK = "GET_JOB_RUN_ROLLBACK";

export const LIST_JOB_RUNS = "LIST_JOB_RUNS";
export const LIST_JOB_RUNS_COMMIT = "LIST_JOB_RUNS_COMMIT";
export const LIST_JOB_RUNS_ROLLBACK = "LIST_JOB_RUNS_ROLLBACK";

export const CREATE_JOB_RUN = "CREATE_JOB_RUN";
export const CREATE_JOB_RUN_COMMIT = "CREATE_JOB_RUN_COMMIT";
export const CREATE_JOB_RUN_ROLLBACK = "CREATE_JOB_RUN_ROLLBACK";

export const UPDATE_JOB_RUN = "UPDATE_JOB_RUN";
export const UPDATE_JOB_RUN_COMMIT = "UPDATE_JOB_RUN_COMMIT";
export const UPDATE_JOB_RUN_ROLLBACK = "UPDATE_JOB_RUN_ROLLBACK";

export const DELETE_JOB_RUN = "DELETE_JOB_RUN";
export const DELETE_JOB_RUN_COMMIT = "DELETE_JOB_RUN_COMMIT";
export const DELETE_JOB_RUN_ROLLBACK = "DELETE_JOB_RUN_ROLLBACK";

export const CHECK_JOB_RUNS_TABLE_PERMISSIONS =
  "CHECK_JOB_RUNS_TABLE_PERMISSIONS";
export const CHECK_JOB_RUNS_TABLE_PERMISSIONS_COMMIT =
  "CHECK_JOB_RUNS_TABLE_PERMISSIONS_COMMIT";
export const CHECK_JOB_RUNS_TABLE_PERMISSIONS_ROLLBACK =
  "CHECK_JOB_RUNS_TABLE_PERMISSIONS_ROLLBACK";

// Get Job Run
export const getJobRunAction = (id: JobRunID) => ({
  type: GET_JOB_RUN,
  meta: {
    optimisticID: id,
    offline: {
      // Define the effect (the API call to make)
      effect: {
        url: `/job_runs/get/${id}`,
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          // Authorization: `Bearer HANDLED_BY_OFFLINE_EFFECT_MIDDLEWARE`,
        },
        data: {},
      },
      // Action to dispatch on success
      commit: { type: GET_JOB_RUN_COMMIT },
      // Action to dispatch on failure
      rollback: { type: GET_JOB_RUN_ROLLBACK },
      discard: (error: any, _action: any, _retries: number) => {
        console.log("redux-offline discard error:", error);
        const { response } = error;
        // Don't retry on 4xx client errors
        return response && response.status >= 400 && response.status < 500;
      },
    },
  },
});

// List Job Runs
export const listJobRunsAction = (payload: IRequestListJobRuns) => ({
  type: LIST_JOB_RUNS,
  meta: {
    offline: {
      // Define the effect (the API call to make)
      effect: {
        url: `/job_runs/list`,
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          // Authorization: `Bearer HANDLED_BY_OFFLINE_EFFECT_MIDDLEWARE`,
        },
        data: payload,
      },
      // Action to dispatch on success
      commit: { type: LIST_JOB_RUNS_COMMIT },
      // Action to dispatch on failure
      rollback: { type: LIST_JOB_RUNS_ROLLBACK },
      discard: (error: any, _action: any, _retries: number) => {
        console.log("redux-offline discard error:", error);
        const { response } = error;
        // Don't retry on 4xx client errors
        return response && response.status >= 400 && response.status < 500;
      },
    },
  },
});

// Create Job Run
export const createJobRunAction = (jobRunData: IRequestCreateJobRun) => {
  const id = jobRunData.id || GenerateID.JobRunID(); // Use provided ID or generate
  const payload = {
    ...jobRunData,
    id,
  };
  return {
    type: CREATE_JOB_RUN,
    meta: {
      optimisticID: id,
      offline: {
        effect: {
          url: `/job_runs/create`,
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            // Authorization: `Bearer HANDLED_BY_OFFLINE_EFFECT_MIDDLEWARE`,
          },
          data: payload,
        },
        // Action to dispatch on success
        commit: { type: CREATE_JOB_RUN_COMMIT, meta: { optimisticID: id } },
        // Action to dispatch on failure
        rollback: { type: CREATE_JOB_RUN_ROLLBACK, meta: { optimisticID: id } },
        discard: (error: any, _action: any, _retries: number) => {
          console.log("redux-offline discard error:", error);
          const { response } = error;
          // Don't retry on 4xx client errors
          return response && response.status >= 400 && response.status < 500;
        },
      },
    },
  };
};

// Update Job Run
export const updateJobRunAction = (jobRunData: IRequestUpdateJobRun) => {
  const id = jobRunData.id;
  const payload = {
    ...jobRunData,
  };
  return {
    type: UPDATE_JOB_RUN,
    meta: {
      optimisticID: id,
      offline: {
        effect: {
          url: `/job_runs/update`,
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            // Authorization: `Bearer HANDLED_BY_OFFLINE_EFFECT_MIDDLEWARE`,
          },
          data: payload,
        },
        // Action to dispatch on success
        commit: { type: UPDATE_JOB_RUN_COMMIT, meta: { optimisticID: id } },
        // Action to dispatch on failure
        rollback: { type: UPDATE_JOB_RUN_ROLLBACK, meta: { optimisticID: id } },
        discard: (error: any, _action: any, _retries: number) => {
          console.log("redux-offline discard error:", error);
          const { response } = error;
          // Don't retry on 4xx client errors
          return response && response.status >= 400 && response.status < 500;
        },
      },
    },
  };
};

// Delete Job Run
export const deleteJobRunAction = (payload: IRequestDeleteJobRun) => {
  const id = payload.id;
  return {
    type: DELETE_JOB_RUN,
    meta: {
      optimisticID: id,
      offline: {
        effect: {
          url: `/job_runs/delete`,
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            // Authorization: `Bearer HANDLED_BY_OFFLINE_EFFECT_MIDDLEWARE`,
          },
          data: payload,
        },
        // Action to dispatch on success
        commit: { type: DELETE_JOB_RUN_COMMIT, meta: { optimisticID: id } },
        // Action to dispatch on failure
        rollback: {
          type: DELETE_JOB_RUN_ROLLBACK,
          meta: { optimisticID: id },
        },
        discard: (error: any, _action: any, _retries: number) => {
          console.log("redux-offline discard error:", error);
          const { response } = error;
          // Don't retry on 4xx client errors
          return response && response.status >= 400 && response.status < 500;
        },
      },
    },
  };
};

// Check Job Runs Table Permissions
export const checkJobRunsTablePermissionsAction = (userID: UserID) => {
  const id = `job_runs_table_permissions_${userID}`;

  const payload = {
    resource_id: "TABLE_JOB_RUNS", // Ensure this matches your SystemTableValueEnum
    grantee_id: userID,
  };

  return {
    type: CHECK_JOB_RUNS_TABLE_PERMISSIONS,
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
          type: CHECK_JOB_RUNS_TABLE_PERMISSIONS_COMMIT,
          meta: { optimisticID: id },
        },
        // Action to dispatch on failure
        rollback: {
          type: CHECK_JOB_RUNS_TABLE_PERMISSIONS_ROLLBACK,
          meta: { optimisticID: id },
        },
        discard: (error: any, _action: any, _retries: number) => {
          console.log("redux-offline discard error:", error);
          const { response } = error;
          // Don't retry on 4xx client errors
          return response && response.status >= 400 && response.status < 500;
        },
      },
    },
  };
};

// src/redux-offline/jobRuns/jobRuns.reducer.ts
import {
  JobRun,
  JobRunFE,
  JobRunID,
  SystemPermissionType,
} from "@officexapp/types";
import {
  CREATE_JOB_RUN,
  CREATE_JOB_RUN_COMMIT,
  CREATE_JOB_RUN_ROLLBACK,
  LIST_JOB_RUNS,
  LIST_JOB_RUNS_COMMIT,
  LIST_JOB_RUNS_ROLLBACK,
  GET_JOB_RUN,
  GET_JOB_RUN_COMMIT,
  GET_JOB_RUN_ROLLBACK,
  UPDATE_JOB_RUN,
  UPDATE_JOB_RUN_COMMIT,
  UPDATE_JOB_RUN_ROLLBACK,
  DELETE_JOB_RUN,
  DELETE_JOB_RUN_COMMIT,
  DELETE_JOB_RUN_ROLLBACK,
  CHECK_JOB_RUNS_TABLE_PERMISSIONS,
  CHECK_JOB_RUNS_TABLE_PERMISSIONS_COMMIT,
  CHECK_JOB_RUNS_TABLE_PERMISSIONS_ROLLBACK,
} from "./job-runs.actions";

export const JOB_RUNS_REDUX_KEY = "jobRuns";
export const JOB_RUNS_DEXIE_TABLE = JOB_RUNS_REDUX_KEY;

export interface JobRunFEO extends JobRunFE {
  _isOptimistic?: boolean; // flag for optimistic updates
  _optimisticID?: string; // unique ID for optimistic updates
  _syncWarning?: string; // tooltip for users
  _syncConflict?: boolean; // flag for corrupted data due to sync failures
  _syncSuccess?: boolean; // flag for successful sync
  _markedForDeletion?: boolean; // flag for deletion
  lastChecked?: number;
  isLoading?: boolean;
}

interface JobRunsState {
  jobRuns: JobRunFEO[];
  jobRunMap: Record<JobRunID, JobRunFEO>;
  loading: boolean;
  error: string | null;
  tablePermissions: SystemPermissionType[];
  lastChecked: number;
}

const initialState: JobRunsState = {
  jobRuns: [],
  jobRunMap: {},
  loading: false,
  error: null,
  tablePermissions: [],
  lastChecked: 0,
};

const updateOrAddJobRun = (
  jobRuns: JobRunFEO[],
  newJobRun: JobRunFEO
): JobRunFEO[] => {
  const existingIndex = jobRuns.findIndex(
    (jobRun) =>
      jobRun.id === newJobRun.id || jobRun._optimisticID === newJobRun.id
  );

  if (existingIndex !== -1) {
    // Replace existing job run
    return [
      ...jobRuns.slice(0, existingIndex),
      newJobRun,
      ...jobRuns.slice(existingIndex + 1),
    ];
  } else {
    // Add to the front of the array
    return [newJobRun, ...jobRuns];
  }
};

export const jobRunsReducer = (
  state = initialState,
  action: any
): JobRunsState => {
  switch (action.type) {
    // ------------------------------ GET JOB RUN --------------------------------- //

    case GET_JOB_RUN: {
      return {
        ...state,
        jobRuns: updateOrAddJobRun(state.jobRuns, action.optimistic),
        jobRunMap: {
          ...state.jobRunMap,
          [action.optimistic.id]: { ...action.optimistic, isLoading: true },
        },
      };
    }

    case GET_JOB_RUN_COMMIT: {
      const realJobRun = action.payload.ok.data;
      // Update the optimistic job run with the real data
      return {
        ...state,
        jobRuns: state.jobRuns.map((jobRun) => {
          if (
            jobRun._optimisticID === realJobRun.id ||
            jobRun.id === realJobRun.id
          ) {
            return realJobRun;
          }
          return jobRun;
        }),
        jobRunMap: {
          ...state.jobRunMap,
          [action.payload.ok.data.id]: {
            ...action.payload.ok.data,
            lastChecked: Date.now(),
            isLoading: false,
          },
        },
      };
    }

    case GET_JOB_RUN_ROLLBACK: {
      if (!action.payload.response) return state;
      // Update the optimistic job run with the error message
      const newJobRunMap = { ...state.jobRunMap };
      delete newJobRunMap[action.meta.optimisticID];
      return {
        ...state,
        jobRuns: state.jobRuns.map((jobRun) => {
          if (jobRun._optimisticID === action.meta.optimisticID) {
            return {
              ...jobRun,
              _syncWarning: action.error_message,
              _syncSuccess: false,
              _syncConflict: true,
              _isOptimistic: false,
              isLoading: false,
            };
          }
          return jobRun;
        }),
        jobRunMap: newJobRunMap,
        error: action.payload.message || "Failed to fetch job run",
      };
    }

    // ------------------------------ LIST JOB RUNS --------------------------------- //

    case LIST_JOB_RUNS: {
      return {
        ...state,
        jobRuns: action.optimistic || [],
        loading: true,
        error: null,
      };
    }

    case LIST_JOB_RUNS_COMMIT: {
      // Get items from the API response
      const serverJobRuns = action.payload.ok.data.items || [];

      const newJobRuns: JobRunFEO[] = serverJobRuns.reduce(
        (acc: JobRunFEO[], item: JobRunFEO) => updateOrAddJobRun(acc, item),
        state.jobRuns
      );
      const newJobRunMap = serverJobRuns.reduce(
        (acc: Record<JobRunID, JobRunFEO>, item: JobRunFEO) => {
          acc[item.id] = { ...item, lastChecked: Date.now() };
          return acc;
        },
        state.jobRunMap
      );

      return {
        ...state,
        jobRuns: newJobRuns,
        jobRunMap: newJobRunMap,
        loading: false,
        lastChecked: Date.now(),
      };
    }

    case LIST_JOB_RUNS_ROLLBACK: {
      if (!action.payload.response) return state;
      return {
        ...state,
        loading: false,
        error: action.error_message || "Failed to fetch job runs",
      };
    }

    // ------------------------------ CREATE JOB RUN --------------------------------- //

    case CREATE_JOB_RUN: {
      const optimisticJobRun = action.optimistic;
      return {
        ...state,
        jobRuns: updateOrAddJobRun(state.jobRuns, optimisticJobRun),
        loading: true,
        error: null,
      };
    }

    case CREATE_JOB_RUN_COMMIT: {
      const optimisticID = action.meta?.optimisticID;
      const newJobRun = {
        ...action.payload.ok.data,
        _syncSuccess: true,
        _syncConflict: false,
        _syncWarning: "",
        _isOptimistic: false,
      };
      const filteredJobRuns = state.jobRuns.filter(
        (jobRun) => jobRun._optimisticID !== optimisticID
      );
      return {
        ...state,
        // Add the newly created job run to our items array
        jobRuns: updateOrAddJobRun(filteredJobRuns, newJobRun),
        loading: false,
      };
    }

    case CREATE_JOB_RUN_ROLLBACK: {
      if (!action.payload.response) return state;
      // Add a sync warning to the optimistic job run
      const newReduxJobRuns = state.jobRuns.map((jobRun) => {
        if (jobRun._optimisticID === action.meta.optimisticID) {
          return {
            ...jobRun,
            _syncWarning: action.error_message,
            _syncSuccess: false,
            _syncConflict: true,
            _isOptimistic: false,
          };
        }
        return jobRun;
      });
      // removal from dexie is already handled in optimistic middleware which can handle async, whereas reducers are pure sync functions
      return {
        ...state,
        jobRuns: newReduxJobRuns,
        loading: false,
        error: action.payload.message || "Failed to create job run",
      };
    }

    // ------------------------------ UPDATE JOB RUN --------------------------------- //

    case UPDATE_JOB_RUN: {
      const optimisticJobRun = action.optimistic;
      return {
        ...state,
        jobRuns: updateOrAddJobRun(state.jobRuns, optimisticJobRun),
        loading: true,
        error: null,
      };
    }

    case UPDATE_JOB_RUN_COMMIT: {
      const optimisticID = action.meta?.optimisticID;
      // Update the optimistic job run with the real data
      return {
        ...state,
        jobRuns: state.jobRuns.map((jobRun) => {
          if (jobRun._optimisticID === optimisticID) {
            return {
              ...jobRun,
              ...action.payload.ok.data,
              _syncSuccess: true,
              _syncConflict: false,
              _syncWarning: "",
              _isOptimistic: false,
            };
          }
          return jobRun;
        }),
        loading: false,
      };
    }

    case UPDATE_JOB_RUN_ROLLBACK: {
      if (!action.payload.response) return state;
      // Update the optimistic job run with the error message
      return {
        ...state,
        jobRuns: state.jobRuns.map((jobRun) => {
          if (jobRun._optimisticID === action.meta.optimisticID) {
            return {
              ...jobRun,
              _syncWarning: action.error_message,
              _syncSuccess: false,
              _syncConflict: true,
              _isOptimistic: false,
            };
          }
          return jobRun;
        }),
        loading: false,
        error: action.payload.message || "Failed to update job run",
      };
    }

    // ------------------------------ DELETE JOB RUN --------------------------------- //

    case DELETE_JOB_RUN: {
      const optimisticJobRun = action.optimistic;
      return {
        ...state,
        jobRuns: updateOrAddJobRun(state.jobRuns, optimisticJobRun),
        loading: true,
        error: null,
      };
    }

    case DELETE_JOB_RUN_COMMIT: {
      const optimisticID = action.meta?.optimisticID;
      // Update the optimistic job run with the real data
      return {
        ...state,
        jobRuns: state.jobRuns.filter(
          (jobRun) => jobRun._optimisticID !== optimisticID
        ),
        loading: false,
      };
    }

    case DELETE_JOB_RUN_ROLLBACK: {
      // Update the optimistic job run with the error message
      return {
        ...state,
        jobRuns: state.jobRuns.map((jobRun) => {
          if (jobRun._optimisticID === action.meta.optimisticID) {
            return {
              ...jobRun,
              _syncWarning: action.error_message,
              _syncSuccess: false,
              _syncConflict: true,
              _isOptimistic: false,
            };
          }
          return jobRun;
        }),
        loading: false,
        error: action.payload.message || "Failed to delete job run",
      };
    }

    case CHECK_JOB_RUNS_TABLE_PERMISSIONS: {
      const permission_types = action.optimistic?.permission_types || [];
      return {
        ...state,
        loading: true,
        error: null,
        tablePermissions: permission_types,
      };
    }

    case CHECK_JOB_RUNS_TABLE_PERMISSIONS_COMMIT: {
      return {
        ...state,
        loading: false,
        tablePermissions: action.payload.ok.data.permissions,
      };
    }

    case CHECK_JOB_RUNS_TABLE_PERMISSIONS_ROLLBACK: {
      return {
        ...state,
        loading: false,
        error:
          action.payload.message ||
          "Failed to check job runs table permissions",
      };
    }

    default:
      return state;
  }
};

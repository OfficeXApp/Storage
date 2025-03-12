// src/redux-offline/tags/tags.reducer.ts
import { TagFE, TagID } from "@officexapp/types";
import {
  CREATE_TAG,
  CREATE_TAG_COMMIT,
  CREATE_TAG_ROLLBACK,
  LIST_TAGS,
  LIST_TAGS_COMMIT,
  LIST_TAGS_ROLLBACK,
  GET_TAG,
  GET_TAG_COMMIT,
  GET_TAG_ROLLBACK,
  UPDATE_TAG,
  UPDATE_TAG_COMMIT,
  UPDATE_TAG_ROLLBACK,
  DELETE_TAG,
  DELETE_TAG_COMMIT,
  DELETE_TAG_ROLLBACK,
} from "./tags.actions";

export const TAGS_REDUX_KEY = "tags";
export const TAGS_DEXIE_TABLE = TAGS_REDUX_KEY;

export interface TagFEO extends TagFE {
  _isOptimistic?: boolean; // flag for optimistic updates
  _optimisticID?: string; // unique ID for optimistic updates
  _syncWarning?: string; // tooltip for users
  _syncConflict?: boolean; // flag for corrupted data due to sync failures
  _syncSuccess?: boolean; // flag for successful sync
  _markedForDeletion?: boolean; // flag for deletion
}

interface TagsState {
  tags: TagFEO[];
  tagMap: Record<TagID, TagFEO>;
  loading: boolean;
  error: string | null;
}

const initialState: TagsState = {
  tags: [],
  tagMap: {},
  loading: false,
  error: null,
};

const updateOrAddTag = (
  tags: TagFEO[],
  newTag: TagFEO,
  identifierKey: keyof TagFEO = "id"
): TagFEO[] => {
  const existingIndex = tags.findIndex(
    (tag) => tag[identifierKey] === newTag[identifierKey]
  );

  if (existingIndex !== -1) {
    // Replace existing tag
    return [
      ...tags.slice(0, existingIndex),
      newTag,
      ...tags.slice(existingIndex + 1),
    ];
  } else {
    // Add to the front of the array
    return [newTag, ...tags];
  }
};

export const tagsReducer = (state = initialState, action: any): TagsState => {
  switch (action.type) {
    // ------------------------------ GET TAG --------------------------------- //

    // Get Tag
    case GET_TAG: {
      if (!action.optimistic) return { ...state, loading: true, error: null };

      return {
        ...state,
        tags: updateOrAddTag(state.tags, action.optimistic),
        tagMap: {
          ...state.tagMap,
          [action.optimistic.id]: action.optimistic,
        },
        loading: true,
        error: null,
      };
    }

    case GET_TAG_COMMIT: {
      const optimisticID = action.meta?.optimisticID;
      const tag = action.payload.ok.data;

      // Update the optimistic tag with the real data
      return {
        ...state,
        tags: state.tags.map((t) => {
          if (t._optimisticID === optimisticID) {
            return tag;
          }
          return t;
        }),
        tagMap: {
          ...state.tagMap,
          [tag.id]: tag,
        },
        loading: false,
      };
    }

    case GET_TAG_ROLLBACK: {
      // Update the optimistic tag with the error message
      const newTagMap = { ...state.tagMap };
      delete newTagMap[action.meta.optimisticID];

      return {
        ...state,
        tags: state.tags.map((tag) => {
          if (tag._optimisticID === action.meta.optimisticID) {
            return {
              ...tag,
              _syncWarning: action.error_message,
              _syncSuccess: false,
              _syncConflict: true,
              _isOptimistic: false,
            };
          }
          return tag;
        }),
        tagMap: newTagMap,
        loading: false,
        error: action.payload.message || "Failed to fetch tag",
      };
    }

    // ------------------------------ LIST TAGS --------------------------------- //

    case LIST_TAGS: {
      return {
        ...state,
        tags: action.optimistic || [],
        loading: true,
        error: null,
      };
    }

    case LIST_TAGS_COMMIT: {
      // Replace entire tags list with response data
      const tags = action.payload.ok.data.items;
      const tagMap = tags.reduce((map: Record<string, TagFEO>, tag: TagFEO) => {
        map[tag.id] = tag;
        return map;
      }, {});

      return {
        ...state,
        tags,
        tagMap,
        loading: false,
      };
    }

    case LIST_TAGS_ROLLBACK: {
      return {
        ...state,
        loading: false,
        error: action.error_message || "Failed to fetch tags",
      };
    }

    // ------------------------------ CREATE TAG --------------------------------- //

    case CREATE_TAG: {
      if (!action.optimistic) return { ...state, loading: true, error: null };

      const optimisticTag = action.optimistic;
      return {
        ...state,
        tags: updateOrAddTag(state.tags, optimisticTag, "_optimisticID"),
        tagMap: {
          ...state.tagMap,
          [optimisticTag.id]: optimisticTag,
        },
        loading: true,
        error: null,
      };
    }

    case CREATE_TAG_COMMIT: {
      const optimisticID = action.meta?.optimisticID;
      // Remove the optimistic tag and add the real one
      const newTag = {
        ...action.payload.ok.data,
        _syncSuccess: true,
        _syncConflict: false,
        _syncWarning: "",
        _isOptimistic: false,
      };

      const filteredTags = state.tags.filter(
        (tag) => tag._optimisticID !== optimisticID
      );

      // Remove old tag from tagMap
      const newTagMap = { ...state.tagMap };
      delete newTagMap[optimisticID];
      newTagMap[newTag.id] = newTag;

      return {
        ...state,
        tags: updateOrAddTag(filteredTags, newTag),
        tagMap: newTagMap,
        loading: false,
      };
    }

    case CREATE_TAG_ROLLBACK: {
      // Add a sync warning to the optimistic tag
      const newReduxTags = state.tags.map((tag) => {
        if (tag._optimisticID === action.meta.optimisticID) {
          return {
            ...tag,
            _syncWarning: action.error_message,
            _syncSuccess: false,
            _syncConflict: true,
            _isOptimistic: false,
          };
        }
        return tag;
      });

      return {
        ...state,
        tags: newReduxTags,
        loading: false,
        error: action.payload.message || "Failed to create tag",
      };
    }

    // ------------------------------ UPDATE TAG --------------------------------- //

    case UPDATE_TAG: {
      if (!action.optimistic) return { ...state, loading: true, error: null };

      const optimisticTag = action.optimistic;
      return {
        ...state,
        tags: updateOrAddTag(state.tags, optimisticTag),
        tagMap: {
          ...state.tagMap,
          [optimisticTag.id]: optimisticTag,
        },
        loading: true,
        error: null,
      };
    }

    case UPDATE_TAG_COMMIT: {
      const optimisticID = action.meta?.optimisticID;
      const updatedTag = action.payload.ok.data;

      // Update the tag in both tags array and tagMap
      return {
        ...state,
        tags: state.tags.map((tag) => {
          if (tag._optimisticID === optimisticID) {
            return {
              ...updatedTag,
              _syncSuccess: true,
              _syncConflict: false,
              _syncWarning: "",
              _isOptimistic: false,
            };
          }
          return tag;
        }),
        tagMap: {
          ...state.tagMap,
          [updatedTag.id]: {
            ...updatedTag,
            _syncSuccess: true,
            _syncConflict: false,
            _syncWarning: "",
            _isOptimistic: false,
          },
        },
        loading: false,
      };
    }

    case UPDATE_TAG_ROLLBACK: {
      // Update the optimistic tag with the error message
      return {
        ...state,
        tags: state.tags.map((tag) => {
          if (tag._optimisticID === action.meta.optimisticID) {
            return {
              ...tag,
              _syncWarning: action.error_message,
              _syncSuccess: false,
              _syncConflict: true,
              _isOptimistic: false,
            };
          }
          return tag;
        }),
        loading: false,
        error: action.payload.message || "Failed to update tag",
      };
    }

    // ------------------------------ DELETE TAG --------------------------------- //

    case DELETE_TAG: {
      if (!action.optimistic) return { ...state, loading: true, error: null };

      const optimisticTag = action.optimistic;
      return {
        ...state,
        tags: updateOrAddTag(state.tags, optimisticTag),
        tagMap: {
          ...state.tagMap,
          [optimisticTag.id]: optimisticTag,
        },
        loading: true,
        error: null,
      };
    }

    case DELETE_TAG_COMMIT: {
      const optimisticID = action.meta?.optimisticID;

      // Remove the tag from both arrays
      const newTags = state.tags.filter(
        (tag) => tag._optimisticID !== optimisticID
      );

      const newTagMap = { ...state.tagMap };
      delete newTagMap[optimisticID];

      return {
        ...state,
        tags: newTags,
        tagMap: newTagMap,
        loading: false,
      };
    }

    case DELETE_TAG_ROLLBACK: {
      // Update the optimistic tag with the error message
      return {
        ...state,
        tags: state.tags.map((tag) => {
          if (tag._optimisticID === action.meta.optimisticID) {
            return {
              ...tag,
              _syncWarning: action.error_message,
              _syncSuccess: false,
              _syncConflict: true,
              _isOptimistic: false,
              _markedForDeletion: false,
            };
          }
          return tag;
        }),
        loading: false,
        error: action.payload.message || "Failed to delete tag",
      };
    }

    default:
      return state;
  }
};

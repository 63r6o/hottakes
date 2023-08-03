import { createSlice } from "@reduxjs/toolkit";
import takeService from "../services/takes";
import {
  appendDislike,
  appendLike,
  removeLike,
  removeDislike,
} from "./loginReducer";

const takesSlice = createSlice({
  name: "takes",
  initialState: {
    takes: [],
    isFetching: false,
    error: null,
  },
  reducers: {
    setTakes(state, action) {
      const takes = action.payload;
      takes.reverse();

      return {
        takes,
        isFetching: false,
        error: null,
      };
    },
    setFetching(state, action) {
      return {
        ...state,
        isFetching: true,
      };
    },
    setError(state, action) {
      return {
        ...state,
        error: action.payload,
      };
    },
    appendTake(state, action) {
      state.takes.unshift(action.payload);
      state.isFetching = false;
      state.error = null;
    },
    updateTake(state, action) {
      const updated = action.payload;
      state.takes = state.takes.map((t) => (t.id === updated.id ? updated : t));

      state.isFetching = false;
      state.error = null;
    },
    clearError(state, action) {
      return {
        ...state,
        error: null,
      };
    },
  },
});

export const {
  setTakes,
  setFetching,
  setError,
  appendTake,
  updateTake,
  clearError,
} = takesSlice.actions;

export const initializeTakes = () => {
  return async (dispatch) => {
    try {
      dispatch(setFetching());
      const takes = await takeService.getAll();
      dispatch(setTakes(takes));
    } catch (err) {
      dispatch(setError(err.response.data.error));
    }
  };
};

export const createTake = (newTake) => {
  return async (dispatch) => {
    try {
      dispatch(setFetching());
      const take = await takeService.create(newTake);
      dispatch(appendTake(take));
    } catch (err) {
      dispatch(setError(err.response.data.error));
    }
  };
};

export const likeTake = (takeId) => {
  return async (dispatch) => {
    try {
      dispatch(setFetching());
      const updatedTake = await takeService.like(takeId);

      dispatch(appendLike(updatedTake.id));

      dispatch(removeDislike(updatedTake.id));

      dispatch(updateTake(updatedTake));
    } catch (err) {
      dispatch(setError(err));
    }
  };
};

export const dislikeTake = (takeId) => {
  return async (dispatch) => {
    try {
      dispatch(setFetching());
      const updatedTake = await takeService.dislike(takeId);

      dispatch(appendDislike(updatedTake.id));

      dispatch(removeLike(updatedTake.id));

      dispatch(updateTake(updatedTake));
    } catch (err) {
      dispatch(setError(err));
    }
  };
};

export default takesSlice.reducer;

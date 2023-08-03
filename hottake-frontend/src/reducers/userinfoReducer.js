import { createSlice } from "@reduxjs/toolkit";
import userService from "../services/users";
import takeService from "../services/takes";
import {
  appendLike,
  appendDislike,
  removeLike,
  removeDislike,
} from "./loginReducer";

const userInfoSlice = createSlice({
  name: "userInfo",
  initialState: {
    user: null,
    isFetching: false,
    error: null,
  },
  reducers: {
    setUserInfo(state, action) {
      const user = {
        ...action.payload,
        takes: action.payload.takes.reverse(),
      };
      return {
        user,
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
    updateTakeInfo(state, action) {
      const updated = action.payload;
      state.user.takes = state.user.takes.map((t) =>
        t.id === updated.id ? updated : t
      );
      state.isFetching = false;
      state.error = null;
    },
    clearError(state, action) {
      return {
        ...state,
        error: null,
      };
    },
    clearUserInfo(state, action) {
      return {
        user: action.payload,
        isFetching: false,
        error: null,
      };
    },
  },
});

export const {
  setUserInfo,
  setFetching,
  setError,
  updateTakeInfo,
  clearError,
  clearUserInfo,
} = userInfoSlice.actions;

export const initializeUserInfo = (userId) => {
  return async (dispatch) => {
    try {
      dispatch(setFetching());
      const userInfo = await userService.getUser(userId);
      dispatch(setUserInfo(userInfo));
    } catch (err) {
      dispatch(setError(err.response.data.error));
    }
  };
};

export const likeUsersTake = (takeId) => {
  return async (dispatch) => {
    try {
      dispatch(setFetching());
      const updatedTake = await takeService.like(takeId);
      dispatch(appendLike(updatedTake.id));
      dispatch(removeDislike(updatedTake.id));

      dispatch(updateTakeInfo(updatedTake));
    } catch (err) {
      dispatch(setError(err.response.data.error));
    }
  };
};

export const dislikeUsersTake = (takeId) => {
  return async (dispatch) => {
    try {
      dispatch(setFetching());
      const updatedTake = await takeService.dislike(takeId);
      dispatch(appendDislike(updatedTake.id));
      dispatch(removeLike(updatedTake.id));

      dispatch(updateTakeInfo(updatedTake));
    } catch (err) {
      dispatch(setError(err.response.data.error));
    }
  };
};

export default userInfoSlice.reducer;

import { createSlice } from "@reduxjs/toolkit";
import loginService from "../services/login";
import userService from "../services/users";
import takeService from "../services/takes";

const loginSlice = createSlice({
  name: "login",
  initialState: {
    user: null,
    likedTakes: [],
    dislikedTakes: [],
    isFetching: false,
    error: null,
  },
  reducers: {
    setUser(state, action) {
      const { user, likedTakes, dislikedTakes } = action.payload;
      return {
        user,
        likedTakes,
        dislikedTakes,
        isFetching: false,
        error: null,
      };
    },
    setFetching(state, action) {
      return {
        user: null,
        likedTakes: [],
        dislikedTakes: [],
        isFetching: true,
        error: null,
      };
    },
    setError(state, action) {
      return {
        user: null,
        likedTakes: [],
        dislikedTakes: [],
        isFetching: false,
        error: action.payload,
      };
    },
    appendLike(state, action) {
      state.likedTakes.push(action.payload);
    },
    appendDislike(state, action) {
      state.dislikedTakes.push(action.payload);
    },
    removeLike(state, action) {
      const takeToRemove = action.payload;
      return {
        ...state,
        likedTakes: state.likedTakes.filter((t) => t !== takeToRemove),
      };
    },
    removeDislike(state, action) {
      const takeToRemove = action.payload;
      return {
        ...state,
        dislikedTakes: state.dislikedTakes.filter((t) => t !== takeToRemove),
      };
    },
    clearError(state, action) {
      return {
        ...state,
        error: null,
      };
    },
    clearUser(state, action) {
      return {
        user: null,
        likedTakes: [],
        dislikedTakes: [],
        isFetching: false,
        error: null,
      };
    },
  },
});

export const {
  setUser,
  setFetching,
  setError,
  appendLike,
  appendDislike,
  removeLike,
  removeDislike,
  clearError,
  clearUser,
} = loginSlice.actions;

export const loginUser = (username, password) => {
  return async (dispatch) => {
    try {
      dispatch(setFetching());
      const user = await loginService.login({ username, password });
      takeService.setToken(user.token);
      userService.setToken(user.token);
      const { likedTakes, dislikedTakes } = await userService.getUser(user.id);
      dispatch(setUser({ user, likedTakes, dislikedTakes }));

      window.localStorage.setItem("loggedInUser", JSON.stringify(user));
    } catch (err) {
      dispatch(setError(err.response.data.error));
      setTimeout(() => dispatch(clearError()), 5000);
    }
  };
};

export const registerUser = (username, password) => {
  return async (dispatch) => {
    try {
      dispatch(setFetching());
      await userService.register({ username, password });
      dispatch(loginUser(username, password));
    } catch (err) {
      dispatch(setError(err.response.data.error));
      setTimeout(() => dispatch(clearError()), 5000);
    }
  };
};

export const logoutUser = () => {
  return async (dispatch) => {
    window.localStorage.removeItem("loggedInUser");
    dispatch(clearUser());
    takeService.setToken(null);
    userService.setToken(null);
  };
};

export const initializeUser = () => {
  return async (dispatch) => {
    const loggedInUser = window.localStorage.getItem("loggedInUser");
    if (!loggedInUser) return null;

    const user = JSON.parse(loggedInUser);

    takeService.setToken(user.token);
    userService.setToken(user.token);

    const { likedTakes, dislikedTakes } = await userService.getUser(user.id);

    dispatch(setUser({ user, likedTakes, dislikedTakes }));
  };
};

export default loginSlice.reducer;

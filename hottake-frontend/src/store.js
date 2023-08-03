import { configureStore } from "@reduxjs/toolkit";
import takeReducer from "./reducers/takeReducer";
import loginReducer from "./reducers/loginReducer";
import userinfoReducer from "./reducers/userinfoReducer";

const store = configureStore({
  reducer: {
    takes: takeReducer,
    login: loginReducer,
    userInfo: userinfoReducer,
  },
});

export default store;

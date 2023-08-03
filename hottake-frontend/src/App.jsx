import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Route, Routes } from "react-router-dom";
import { initializeUser } from "./reducers/loginReducer";

import Header from "./components/Header";
import LoginForm from "./components/LoginForm";
import RegisterForm from "./components/RegisterForm";
import Takes from "./components/Takes";
import Navbar from "./components/Navbar";
import UserProfile from "./components/UserProfile";

function App() {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.login.user);

  useEffect(() => {
    dispatch(initializeUser());
  }, [dispatch]);

  return (
    <div className="flex flex-col items-center selection:bg-red-500">
      <Header />
      <Navbar />
      <Routes>
        <Route path="/" element={<Takes />} />
        <Route path="/login" element={<LoginForm />} />
        <Route path="/register" element={<RegisterForm />} />
        <Route
          path="/user/:userid"
          element={user ? <UserProfile /> : <LoginForm />}
        />
      </Routes>
    </div>
  );
}

export default App;

import { useDispatch, useSelector } from "react-redux";
import { logoutUser } from "../reducers/loginReducer";
import { Link, NavLink } from "react-router-dom";

const Navbar = () => {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.login.user);

  const handleLogOut = () => {
    dispatch(logoutUser());
  };

  return (
    <nav className="w-full sm:w-[647px] px-4 border-b-black border-b-2">
      {user ? (
        <div className="flex justify-end">
          <ul>
            <li className="inline-block pr-2">welcome {user.username}</li>
            <li className="inline-block mr-2 hover:bg-red-500 decoration-red-500 underline underline-offset-2">
              <a href="#" onClick={handleLogOut}>
                logout
              </a>
            </li>
          </ul>
        </div>
      ) : (
        <ul>
          <li className="inline-block mr-2 hover:bg-red-500 decoration-red-500 decoration-2 underline underline-offset-2">
            <NavLink
              className={({ isActive }) => (isActive ? " bg-red-500" : "")}
              to={"/login"}
            >
              Login
            </NavLink>
          </li>
          <li className="inline-block mr-2 hover:bg-red-500 decoration-red-500 underline underline-offset-2">
            <NavLink
              className={({ isActive }) => (isActive ? " bg-red-500" : "")}
              to={"/register"}
            >
              Register
            </NavLink>
          </li>
        </ul>
      )}
    </nav>
  );
};

export default Navbar;

import { useState, useRef, useEffect } from "react";
import { useField } from "../hooks";
import { useDispatch, useSelector } from "react-redux";
import { loginUser } from "../reducers/loginReducer";
import { Link, useNavigate } from "react-router-dom";
import Button from "./Button";

const LoginForm = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { reset: resetUsername, ...username } = useField("text");

  const { reset: resetPassword, ...password } = useField("password");

  const [disabled, setDisabled] = useState(true);

  const usernameRef = useRef();
  const passwordRef = useRef();

  const login = useSelector((state) => state.login);

  useEffect(() => {
    if (!username.value.length || !password.value.length) setDisabled(true);
    else setDisabled(false);
  }, [username.value, password.value]);

  useEffect(() => {
    if (login.isFetching) setDisabled(true);
  }, [login.isFetching]);

  useEffect(() => {
    if (login.error) {
      usernameRef.current.setCustomValidity(login.error);
      passwordRef.current.setCustomValidity(login.error);
    } else {
      usernameRef.current.setCustomValidity("");
      passwordRef.current.setCustomValidity("");
    }
  }, [login.error]);

  useEffect(() => {
    if (login.user) navigate("/");
  }, [login.user]);

  const handleSubmit = (event) => {
    event.preventDefault();
    dispatch(loginUser(username.value, password.value));
  };

  return (
    <>
      <form onSubmit={handleSubmit} noValidate className="w-full sm:w-[640px]">
        <div className="p-2">
          <label>
            username:
            <input
              ref={usernameRef}
              {...username}
              placeholder="username"
              className="invalid:border-red-700 w-full bg-stone-100 border-black  border-2 rounded-lg p-2"
            />
          </label>
        </div>
        <div className="p-2">
          <label>
            password:
            <input
              ref={passwordRef}
              {...password}
              placeholder="password"
              className="invalid:border-red-700 w-full bg-stone-100 border-black border-2 rounded-lg p-2"
            />
          </label>
        </div>
        <div className="flex items-center justify-end p-2">
          {login.error && (
            <div className="text-red-700 mr-auto">{login.error}</div>
          )}
          <Button disabled={disabled}>Log in</Button>
        </div>
      </form>
      <div className="text-sm text-slate-700">
        Don't have an account?{" "}
        <Link
          className="hover:decoration-2 decoration-red-500 underline underline-offset-2"
          to={"/register"}
        >
          Register one
        </Link>
      </div>
    </>
  );
};

export default LoginForm;

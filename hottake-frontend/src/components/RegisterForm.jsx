import { useState, useRef, useEffect } from "react";
import { useField } from "../hooks";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { registerUser } from "../reducers/loginReducer";
import Button from "./Button";

const RegisterForm = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { reset: resetUsername, ...username } = useField("text");
  const { reset: resetPassword, ...password } = useField("password");
  const { reset: resetPasswordConfirm, ...passwordConfirm } =
    useField("password");

  const [disabled, setDisabled] = useState(true);

  const usernameRef = useRef();
  const passwordRef = useRef();
  const passwordConfirmRef = useRef();

  const login = useSelector((state) => state.login);

  useEffect(() => {
    if (
      !username.value.length ||
      !password.value.length ||
      !passwordConfirm.value.length
    )
      setDisabled(true);
    else setDisabled(false);
  }, [username.value, password.value, passwordConfirm.value]);

  useEffect(() => {
    if (password.value !== passwordConfirm.value) {
      passwordRef.current.setCustomValidity("the passwords doesn't match");
      passwordConfirmRef.current.setCustomValidity(
        "the passwords doesn't match"
      );
      setDisabled(true);
    } else {
      passwordRef.current.setCustomValidity("");
      passwordConfirmRef.current.setCustomValidity("");
    }
  }, [password.value, passwordConfirm.value]);

  useEffect(() => {
    if (login.isFetching) setDisabled(true);
  }, [login.isFetching]);

  useEffect(() => {
    if (login.error) {
      usernameRef.current.setCustomValidity(login.error);
      passwordRef.current.setCustomValidity(login.error);
      passwordConfirmRef.current.setCustomValidity(login.error);
    } else {
      usernameRef.current.setCustomValidity("");
      passwordRef.current.setCustomValidity("");
      passwordConfirmRef.current.setCustomValidity("");
    }
  }, [login.error]);

  useEffect(() => {
    if (login.user) navigate("/");
  }, [login.user]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    dispatch(registerUser(username.value, password.value));
  };

  return (
    <>
      <form onSubmit={handleSubmit} className="w-full sm:w-[640px]">
        <div className="p-2">
          <label>
            username:
            <input
              ref={usernameRef}
              {...username}
              placeholder="username"
              className="invalid:border-red-700  w-full bg-stone-100 border-black  border-2 rounded-lg p-2"
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
              className="invalid:border-red-700  w-full bg-stone-100 border-black border-2 rounded-lg p-2"
            />
          </label>
        </div>
        <div className="p-2">
          <label>
            confirm password:
            <input
              ref={passwordConfirmRef}
              {...passwordConfirm}
              placeholder="confirm password"
              className="invalid:border-red-700  w-full bg-stone-100 border-black border-2 rounded-lg p-2"
            />
          </label>
        </div>
        <div className="flex justify-end p-2">
          {login.error && (
            <div className="text-red-700 mr-auto">{login.error}</div>
          )}
          <Button disabled={disabled}>Register</Button>
        </div>
      </form>
      <div className="text-sm text-slate-700">
        Already have an account?{" "}
        <Link
          className="hover:decoration-2 decoration-red-500 underline underline-offset-2"
          to={"/login"}
        >
          Log in
        </Link>
      </div>
    </>
  );
};

export default RegisterForm;

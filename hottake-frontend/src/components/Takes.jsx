import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { initializeTakes } from "../reducers/takeReducer";
import Take from "./Take";
import TakeForm from "./TakeForm";

const Takes = () => {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.login.user);
  const takes = useSelector((state) => state.takes.takes);

  useEffect(() => {
    dispatch(initializeTakes());
  }, [dispatch]);

  return (
    <>
      {user && <TakeForm />}
      {takes.map((t) => (
        <Take key={t.id} take={t} />
      ))}
    </>
  );
};

export default Takes;

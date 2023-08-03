import { useState, useRef, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { createTake } from "../reducers/takeReducer";
import TextAreaAutosize from "react-textarea-autosize";
import Button from "./Button";

const TakeForm = () => {
  const dispatch = useDispatch();
  const [value, setValue] = useState("");
  const [disabled, setDisabled] = useState(true);
  const user = useSelector((state) => state.login.user);
  const takes = useSelector((state) => state.takes);

  useEffect(() => {
    if (value.length < 3 || value.length > 240) setDisabled(true);
    else setDisabled(false);
  }, [value]);

  useEffect(() => {
    if (takes.isFetching) setDisabled(true);
  }, [takes.isFetching]);

  const handleSubmit = (event) => {
    event.preventDefault();
    const newTake = { content: value };
    dispatch(createTake(newTake));

    setValue("");
  };

  const handleChange = (event) => {
    setValue(event.target.value);
  };

  return (
    <form onSubmit={handleSubmit} className="w-full p-4 sm:w-[640px]">
      <TextAreaAutosize
        name="new-take"
        placeholder={`Let's hear yours ${user.username}...`}
        minLength={3}
        maxLength={240}
        minRows={2}
        maxRows={7}
        required
        className="h-full bg-stone-100 border-black border-2 rounded-lg p-2 w-full resize-none"
        value={value}
        onChange={handleChange}
      />
      <div className="flex w-full items-center justify-end">
        {value.length > 140 && (
          <div className="text-slate-700 px-4">{value.length}/240</div>
        )}
        <Button type="submit" disabled={disabled}>
          Go
        </Button>
      </div>
    </form>
  );
};

export default TakeForm;

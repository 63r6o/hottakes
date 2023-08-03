import { useDispatch, useSelector } from "react-redux";
import { timeAgo } from "../utils/timeago";
import { dislikeTake, likeTake } from "../reducers/takeReducer";
import { Link } from "react-router-dom";

const Take = ({ take }) => {
  const dispatch = useDispatch();
  const login = useSelector((state) => state.login);
  const takes = useSelector((state) => state.takes);

  const likeable =
    login.user &&
    login.user.id !== take.user.id &&
    !login.likedTakes.includes(take.id);

  const handleLike = async (event) => {
    event.preventDefault();
    if (!takes.isFetching) dispatch(likeTake(take.id));
  };

  const dislikeable =
    login.user &&
    login.user.id !== take.user.id &&
    !login.dislikedTakes.includes(take.id);

  const handleDislike = async (event) => {
    event.preventDefault();
    if (!takes.isFetching) dispatch(dislikeTake(take.id));
  };

  return (
    <div className="p-4 w-screen sm:w-[647px] flex">
      <div className="flex flex-col items-center">
        <div className="w-14 h-14 bg-black flex-shrink-0 rounded-full select-none font-surreal text-4xl flex items-center justify-center text-white">
          {take.user.username && take.user.username.charAt(0)}
        </div>
        <div className="h-full mt-2 w-[0.05rem] bg-slate-700"></div>
      </div>
      <div className="inline-block w-full">
        <div className="flex h-14 flex-wrap content-center">
          <div className="text-sm text-slate-700 flex-1  pl-4">
            <Link to={`/user/${take.user.id}`}>@{take.user.username}</Link>
          </div>
          <div className="px-4 text-sm text-slate-700 ">
            {timeAgo(take.createdAt)}
          </div>
        </div>
        <article className="pl-4 pt-1">
          <p className="w-full text-lg pt-0 pb-6 break-all">{take.content}</p>
          <div className="">
            <div className="inline-block pr-4">
              {likeable ? (
                <a
                  href=""
                  className="hover:bg-red-500 decoration-red-500 underline underline-offset-2 mr-1"
                  onClick={handleLike}
                >
                  Like
                </a>
              ) : (
                <span className="text-slate-700 pr-1">Likes</span>
              )}
              <span className="inline-block w-[2ch]">{take.likes}</span>
            </div>
            <div className="inline-block pr-4">
              {dislikeable ? (
                <a
                  href=""
                  className="hover:bg-red-500 decoration-red-500 underline underline-offset-2 mr-1"
                  onClick={handleDislike}
                >
                  Dislike
                </a>
              ) : (
                <span className="text-slate-700 pr-1">Dislikes</span>
              )}
              <span className="inline-block w-[2ch]">{take.dislikes}</span>
            </div>
          </div>
        </article>
      </div>
    </div>
  );
};

export default Take;

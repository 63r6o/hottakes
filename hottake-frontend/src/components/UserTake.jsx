import { useDispatch, useSelector } from "react-redux";
import { dislikeUsersTake, likeUsersTake } from "../reducers/userinfoReducer";
import { timeAgo } from "../utils/timeago";

const UserTake = ({ take }) => {
  const dispatch = useDispatch();
  const login = useSelector((state) => state.login);
  const userInfo = useSelector((state) => state.userInfo);

  const likeable =
    login.user &&
    login.user.id !== take.user &&
    !login.likedTakes.includes(take.id);

  const handleLike = async (event) => {
    event.preventDefault();
    if (!userInfo.isFetching) dispatch(likeUsersTake(take.id));
  };

  const dislikeable =
    login.user &&
    login.user.id !== take.user &&
    !login.dislikedTakes.includes(take.id);

  const handleDislike = async (event) => {
    event.preventDefault();
    if (!userInfo.isFetching) dispatch(dislikeUsersTake(take.id));
  };

  return (
    <article className="px-4 pt-14 w-full max-w-[674px]">
      <p className="w-full text-lg pt-0 pb-6 break-all">{take.content}</p>
      <div className="flex items-center">
        <div className="pr-4">
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
          <span className="w-[2ch]">{take.likes}</span>
        </div>
        <div className="pr-4">
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
          <span className="w-[2ch]">{take.dislikes}</span>
        </div>
        <div className="pr-4 text-sm text-slate-700 ">
          {timeAgo(take.createdAt)}
        </div>
      </div>
    </article>
  );
};

export default UserTake;

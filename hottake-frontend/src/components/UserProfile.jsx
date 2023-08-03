import { useEffect } from "react";
import { useParams } from "react-router-dom";
import { getReadableDateFrom } from "../utils/date";
import { useDispatch, useSelector } from "react-redux";
import { clearUserInfo, initializeUserInfo } from "../reducers/userinfoReducer";
import UserTake from "./UserTake";

const UserProfile = () => {
  const dispatch = useDispatch();

  const userId = useParams().userid;
  const userInfo = useSelector((state) => state.userInfo);
  const loggedInUser = useSelector((state) => state.login.user);

  useEffect(() => {
    dispatch(initializeUserInfo(userId));
    return () => dispatch(clearUserInfo());
  }, []);

  return (
    <>
      {userInfo.isFetching && !userInfo.user && <div>just a sec...</div>}
      {userInfo.error && <div>ups, something went wrong</div>}
      {userInfo.user && (
        <div className="w-full max-w-[647px]">
          <div className="py-8 px-4 flex items-center border-b-black border-b-2">
            <div className="flex flex-col items-center">
              <div className="w-32 h-32 bg-black flex-shrink-0 rounded-full font-surreal text-8xl select-none flex items-center justify-center text-white relative">
                {userInfo.user.username && userInfo.user.username.charAt(0)}
                {loggedInUser.id === userInfo.user.id && (
                  <div className="bg-red-500 px-2 font-surreal -rotate-6 absolute bottom-0 right-2 w-max h-max text-sm">
                    It's you
                  </div>
                )}
              </div>
              <h1 className="pt-4 text-lg h-8">{userInfo.user.username}</h1>
            </div>
            <ul className="text-sm pb-8 pl-4">
              <li>
                <span>
                  member since {getReadableDateFrom(userInfo.user.createdAt)}
                </span>
              </li>
              <li>
                <span>
                  had {userInfo.user.takes.length}{" "}
                  {userInfo.user.takes.length === 1 ? "take" : "takes"}
                </span>
              </li>
              <li>
                <span>liked {userInfo.user.likedTakes.length}</span>
              </li>
              <li>
                <span>disliked {userInfo.user.dislikedTakes.length}</span>
              </li>
            </ul>
          </div>
          {userInfo.user.takes.map((t) => (
            <UserTake key={t.id} take={t} />
          ))}
        </div>
      )}
    </>
  );
};

export default UserProfile;

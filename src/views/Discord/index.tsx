import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Dispatch } from "../../redux";
import { ActionType } from "../../redux/appLogin/actions";
import { getDiscordUserInfo } from "../../redux/appLogin/selectors";
import Login from "./Login";

export default function Discord() {
  const dispatch = useDispatch<Dispatch>();
  const userInfo = useSelector(getDiscordUserInfo);
  const [fetchUserInfoInterval, setFetchUserInterval] = useState<ReturnType<
    typeof setInterval
  > | null>(null);
  useEffect(() => {
    if (!userInfo) {
      const interval = setInterval(() => {
        dispatch({
          type: ActionType.fetchStart,
          payload: { appName: "discord" },
        });
      }, 1000);
      setFetchUserInterval(interval);
      return () => clearInterval(interval);
    }
  }, []);
  useEffect(() => {
    if (userInfo && fetchUserInfoInterval) {
      clearInterval(fetchUserInfoInterval);
      setFetchUserInterval(null);
    }
  }, [userInfo, fetchUserInfoInterval]);

  if (!userInfo) {
    return <Login />;
  }

  return <div>{userInfo.username}</div>;
}

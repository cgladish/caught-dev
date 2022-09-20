import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
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
    if (!userInfo && !fetchUserInfoInterval) {
      const interval = setInterval(() => {
        dispatch({
          type: ActionType.fetchStart,
          payload: { appName: "discord" },
        });
      }, 1000);
      setFetchUserInterval(interval);
      return () => clearInterval(interval);
    }
  }, [userInfo]);
  useEffect(() => {
    if (userInfo && fetchUserInfoInterval) {
      clearInterval(fetchUserInfoInterval);
      setFetchUserInterval(null);
    }
  }, [userInfo, fetchUserInfoInterval]);

  if (!userInfo) {
    return <Login />;
  }

  return (
    <div
      style={{
        display: "flex",
        height: 100,
        width: "100%",
        alignItems: "center",
        paddingLeft: 40,
        paddingRight: 40,
        backgroundColor: "#222",
      }}
    >
      <img
        src={
          userInfo.avatar
            ? `https://cdn.discordapp.com/avatars/${userInfo.id}/${userInfo.avatar}`
            : "/app-logos/discord.png"
        }
        alt="avatar"
        width={60}
        style={{ borderRadius: 30 }}
      />
      <div style={{ marginLeft: 10 }}>
        <Typography variant="h6">{userInfo.username}</Typography>
        <Typography>#{userInfo.discriminator}</Typography>
      </div>
      <Button
        variant="contained"
        style={{ marginLeft: "auto" }}
        onClick={() =>
          dispatch({
            type: ActionType.logoutStart,
            payload: { appName: "discord" },
          })
        }
      >
        Log out
      </Button>
    </div>
  );
}

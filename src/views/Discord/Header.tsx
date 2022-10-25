import { Typography, Button } from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import discordLogo from "../../assets/app-logos/discord.png";
import { Dispatch } from "../../redux";
import { ActionType as AppLoginActionType } from "../../redux/appLogin/actions";
import { getDiscordUserInfo } from "../../redux/appLogin/selectors";

export default function Header() {
  const dispatch = useDispatch<Dispatch>();

  const userInfo = useSelector(getDiscordUserInfo);

  if (!userInfo) {
    return null;
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
            : discordLogo
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
            type: AppLoginActionType.logoutStart,
            payload: { appName: "discord" },
          })
        }
      >
        Log out
      </Button>
    </div>
  );
}

import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { ActionType as DiscordActionType } from "../../redux/discord/actions";
import { Dispatch } from "../../redux";
import { getDiscordUserInfo } from "../../redux/appLogin/selectors";
import { getGuilds } from "../../redux/discord/selectors";
import Card from "@mui/material/Card";
import Grid from "@mui/material/Grid";
import List from "@mui/material/List";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemAvatar from "@mui/material/ListItemAvatar";
import Avatar from "@mui/material/Avatar";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import ListItemIcon from "@mui/material/ListItemIcon";
import Checkbox from "@mui/material/Checkbox";
import LinearProgress from "@mui/material/LinearProgress";

export default function ChannelGrid() {
  const dispatch = useDispatch<Dispatch>();

  const userInfo = useSelector(getDiscordUserInfo);
  const guilds = useSelector(getGuilds);

  const [selectedGuildId, setSelectedGuildId] = useState<string | null>(null);

  useEffect(() => {
    if (userInfo) {
      dispatch({ type: DiscordActionType.fetchGuildsStart });
    }
  }, [userInfo?.id]);

  useEffect(() => {
    if (selectedGuildId) {
      dispatch({
        type: DiscordActionType.fetchChannelsStart,
        payload: { guildId: selectedGuildId },
      });
    }
  }, [selectedGuildId]);

  const channels = selectedGuildId ? guilds?.[selectedGuildId]?.channels : null;

  return (
    <Card style={{ width: 600, height: 400 }}>
      <Grid container style={{ width: "100%", height: "100%" }}>
        <Grid
          xs={5}
          style={{
            backgroundColor: "#222",
            overflowY: "scroll",
            maxHeight: 400,
          }}
          item
        >
          {guilds ? (
            <List dense>
              {Object.values(guilds).map((guild) => (
                <ListItem key={guild.id} disablePadding>
                  <ListItemButton onClick={() => setSelectedGuildId(guild.id)}>
                    <ListItemAvatar>
                      <Avatar
                        src={
                          guild.icon
                            ? `https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}`
                            : "/app-logos/discord.png"
                        }
                      />
                    </ListItemAvatar>
                    <ListItemText>{guild.name}</ListItemText>
                  </ListItemButton>
                </ListItem>
              ))}
            </List>
          ) : (
            <LinearProgress />
          )}
        </Grid>
        <Grid
          xs={7}
          style={{
            backgroundColor: "#333",
            overflowY: "scroll",
            maxHeight: 400,
          }}
          item
        >
          {channels ? (
            <List dense>
              {Object.values(channels).map((channel) => (
                <ListItem key={channel.id} disablePadding>
                  <ListItemButton onClick={() => console.log(channel.id)}>
                    <ListItemText
                      primaryTypographyProps={{
                        sx: {
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        },
                      }}
                    >
                      {channel.name}
                    </ListItemText>
                    <ListItemIcon>
                      <Checkbox
                        edge="end"
                        checked={false}
                        tabIndex={-1}
                        disableRipple
                      />
                    </ListItemIcon>
                  </ListItemButton>
                </ListItem>
              ))}
            </List>
          ) : (
            selectedGuildId && <LinearProgress />
          )}
        </Grid>
      </Grid>
    </Card>
  );
}

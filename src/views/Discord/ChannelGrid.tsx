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
import NavigateNext from "@mui/icons-material/NavigateNext";
import NavigateBefore from "@mui/icons-material/NavigateBefore";
import { IconButton } from "@mui/material";
import type {} from "@mui/x-date-pickers/themeAugmentation";

export default function ChannelGrid() {
  const dispatch = useDispatch<Dispatch>();

  const userInfo = useSelector(getDiscordUserInfo);
  const guilds = useSelector(getGuilds);

  const [viewedGuildId, setViewedGuildId] = useState<string | null>(null);
  const [selectedGuilds, setSelectedGuilds] = useState<{
    [guildId: string]: boolean;
  }>({});
  const [selectedChannels, setSelectedChannels] = useState<{
    [channelId: string]: boolean;
  }>({});

  const channels = viewedGuildId ? guilds?.[viewedGuildId]?.channels : null;

  useEffect(() => {
    const newSelectedChannels = { ...selectedChannels };
    Object.entries(selectedGuilds)
      .filter(([guildId, selected]) => selected)
      .forEach(([guildId]) => {
        const channels = guilds?.[guildId].channels;
        if (channels) {
          Object.keys(channels).forEach((channelId) => {
            newSelectedChannels[channelId] = true;
          });
        }
      });
    setSelectedChannels(newSelectedChannels);
  }, [guilds]);

  useEffect(() => {
    if (userInfo) {
      dispatch({ type: DiscordActionType.fetchGuildsStart });
    }
  }, [userInfo?.id]);

  useEffect(() => {
    if (viewedGuildId && !channels) {
      dispatch({
        type: DiscordActionType.fetchChannelsStart,
        payload: { guildId: viewedGuildId },
      });
    }
  }, [viewedGuildId]);

  const toggleSelectedGuild = (guildId: string) => {
    const newSelected = !selectedGuilds[guildId];
    const newSelectedGuilds = { ...selectedGuilds };
    newSelectedGuilds[guildId] = newSelected;
    setSelectedGuilds(newSelectedGuilds);

    const channels = guilds?.[guildId].channels;
    if (channels) {
      const newSelectedChannels = { ...selectedChannels };
      Object.keys(channels).forEach((channelId) => {
        newSelectedChannels[channelId] = newSelected;
      });
      setSelectedChannels(newSelectedChannels);
    }
  };

  const toggleSelectedChannel = (channelId: string) => {
    if (!channels) {
      return;
    }
    const newSelectedChannels = { ...selectedChannels };
    newSelectedChannels[channelId] = !selectedChannels[channelId];
    setSelectedChannels(newSelectedChannels);

    const guildId = channels[channelId].guildId;
    const guildChannels = guilds?.[guildId].channels;
    if (guildChannels) {
      const newSelected = Object.keys(guildChannels).every(
        (channelId) => newSelectedChannels[channelId]
      );
      const newSelectedGuilds = { ...selectedGuilds };
      newSelectedGuilds[guildId] = newSelected;
      setSelectedGuilds(newSelectedGuilds);
    }
  };

  return (
    <Card style={{ width: 800, height: 400 }}>
      <Grid container style={{ width: "100%", height: "100%" }}>
        <Grid
          xs={viewedGuildId ? 6 : 12}
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
                <ListItem
                  key={guild.id}
                  secondaryAction={
                    <IconButton
                      onClick={() => {
                        if (guild.id === viewedGuildId) {
                          setViewedGuildId(null);
                        } else {
                          setViewedGuildId(guild.id);
                        }
                      }}
                    >
                      {guild.id === viewedGuildId ? (
                        <NavigateBefore />
                      ) : (
                        <NavigateNext />
                      )}
                    </IconButton>
                  }
                  disablePadding
                >
                  <ListItemButton
                    onClick={() => toggleSelectedGuild(guild.id)}
                    selected={guild.id === viewedGuildId}
                  >
                    <ListItemAvatar>
                      <Avatar
                        src={
                          guild.icon
                            ? `https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}`
                            : "/app-logos/discord.png"
                        }
                      />
                    </ListItemAvatar>
                    <ListItemText
                      primaryTypographyProps={{
                        sx: {
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        },
                      }}
                    >
                      {guild.name}
                    </ListItemText>
                    <ListItemIcon>
                      <Checkbox
                        edge="end"
                        checked={selectedGuilds[guild.id] ?? false}
                        indeterminate={
                          !selectedGuilds[guild.id] &&
                          !!guild.channels &&
                          Object.keys(guild.channels).some(
                            (channelId) => selectedChannels[channelId]
                          )
                        }
                        tabIndex={-1}
                        disableRipple
                      />
                    </ListItemIcon>
                  </ListItemButton>
                </ListItem>
              ))}
            </List>
          ) : (
            <LinearProgress />
          )}
        </Grid>
        <Grid
          xs={6}
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
                  <ListItemButton
                    onClick={() => toggleSelectedChannel(channel.id)}
                  >
                    <ListItemText
                      primaryTypographyProps={{
                        sx: {
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
                        checked={selectedChannels[channel.id] ?? false}
                        tabIndex={-1}
                        disableRipple
                      />
                    </ListItemIcon>
                  </ListItemButton>
                </ListItem>
              ))}
            </List>
          ) : (
            viewedGuildId && <LinearProgress />
          )}
        </Grid>
      </Grid>
    </Card>
  );
}

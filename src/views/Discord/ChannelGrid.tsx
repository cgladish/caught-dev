import { useEffect, useState, memo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { ActionType as DiscordActionType } from "../../redux/discord/actions";
import { Dispatch } from "../../redux";
import { getDiscordUserInfo } from "../../redux/appLogin/selectors";
import { getDmChannels, getGuilds } from "../../redux/discord/selectors";
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
import IconButton from "@mui/material/IconButton";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import type {} from "@mui/x-date-pickers/themeAugmentation";

function ChannelGrid({
  selectedGuilds,
  setSelectedGuilds,
  selectedChannels,
  setSelectedChannels,
  selectedDmChannels,
  setSelectedDmChannels,
}: {
  selectedGuilds: { [guildId: string]: boolean };
  setSelectedGuilds: (newSelectedGuilds: {
    [guildId: string]: boolean;
  }) => void;
  selectedChannels: { [channelId: string]: boolean };
  setSelectedChannels: (newSelectedChannels: {
    [channelId: string]: boolean;
  }) => void;
  selectedDmChannels: { [dmChannelId: string]: boolean };
  setSelectedDmChannels: (newSelectedDmChannels: {
    [dmChannelId: string]: boolean;
  }) => void;
}) {
  const dispatch = useDispatch<Dispatch>();

  const userInfo = useSelector(getDiscordUserInfo);
  const guilds = useSelector(getGuilds);
  const dmChannels = useSelector(getDmChannels);

  const [viewedGuildId, setViewedGuildId] = useState<string | null>(null);
  const [selectedTab, setSelectedTab] = useState<number>(0);

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
    dispatch({ type: DiscordActionType.fetchGuildsStart });
  }, [userInfo?.id]);

  useEffect(() => {
    dispatch({ type: DiscordActionType.fetchDmChannelsStart });
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

  const toggleSelectedDmChannel = (dmChannelId: string) => {
    if (!dmChannels) {
      return;
    }
    const newSelectedDmChannels = { ...selectedDmChannels };
    newSelectedDmChannels[dmChannelId] = !selectedDmChannels[dmChannelId];
    setSelectedDmChannels(newSelectedDmChannels);
  };

  return (
    <Card style={{ width: 800, height: 448 }}>
      <Tabs
        value={selectedTab}
        onChange={(event, tabIndex) => setSelectedTab(tabIndex)}
        style={{ height: 48 }}
      >
        <Tab label="Servers" />
        <Tab label="DMs" />
      </Tabs>
      {selectedTab === 0 && (
        <Grid container style={{ width: "100%", height: "100%" }}>
          <Grid
            xs={viewedGuildId ? 6 : 12}
            style={{
              backgroundColor: "#222",
              overflowY: "scroll",
              maxHeight: 400,
              height: "100%",
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
              height: "100%",
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
      )}
      {selectedTab === 1 && (
        <div
          style={{
            backgroundColor: "#222",
            overflowY: "scroll",
            maxHeight: 400,
            height: "100%",
          }}
        >
          {dmChannels ? (
            <List dense>
              {Object.values(dmChannels).map((dmChannel) => (
                <ListItem key={dmChannel.id} disablePadding>
                  <ListItemButton
                    onClick={() => toggleSelectedDmChannel(dmChannel.id)}
                  >
                    <ListItemAvatar>
                      <Avatar
                        src={
                          dmChannel.recipients.length === 1
                            ? dmChannel.recipients[0].avatar
                              ? `https://cdn.discordapp.com/avatars/${dmChannel.recipients[0].id}/${dmChannel.recipients[0].avatar}`
                              : "app-logos/discord.png"
                            : "https://discord.com/assets/e2779af34b8d9126b77420e5f09213ce.png"
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
                      {dmChannel.recipients
                        .map(({ username }) => username)
                        .join(", ")}
                    </ListItemText>
                    <ListItemIcon>
                      <Checkbox
                        edge="end"
                        checked={selectedDmChannels[dmChannel.id] ?? false}
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
        </div>
      )}
    </Card>
  );
}

export default memo(ChannelGrid);

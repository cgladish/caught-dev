import { useEffect, useState, memo, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import discordLogo from "../../../assets/app-logos/discord.png";
import { ActionType as DiscordActionType } from "../../../redux/discord/actions";
import { Dispatch } from "../../../redux";
import { getDmChannels, getGuilds } from "../../../redux/discord/selectors";
import { useTheme } from "@mui/material";
import { NavigateNext, NavigateBefore } from "@mui/icons-material";
import {
  Card,
  Tabs,
  Tab,
  Typography,
  FormControlLabel,
  Switch,
  Checkbox,
  List,
  ListItem,
  IconButton,
  ListItemButton,
  ListItemAvatar,
  Avatar,
  ListItemText,
  ListItemIcon,
  LinearProgress,
} from "@mui/material";

export const GRID_WIDTH = 800;

function ChannelGrid({
  selectedGuilds,
  setSelectedGuilds,
  selectedChannels,
  setSelectedChannels,
  selectedDmChannels,
  setSelectedDmChannels,
  autoPreserveNewGuilds,
  setAutoPreserveNewGuilds,
  autoPreserveNewChannels,
  setAutoPreserveNewChannels,
  autoPreserveNewDmChannels,
  setAutoPreserveNewDmChannels,
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
  autoPreserveNewGuilds: boolean;
  setAutoPreserveNewGuilds: (newAutoPreserveNewGuilds: boolean) => void;
  autoPreserveNewChannels: { [guildId: string]: boolean };
  setAutoPreserveNewChannels: (newAutoPreserveNewChannels: {
    [guildId: string]: boolean;
  }) => void;
  autoPreserveNewDmChannels: boolean;
  setAutoPreserveNewDmChannels: (newAutoPreserveNewDmChannels: boolean) => void;
}) {
  const dispatch = useDispatch<Dispatch>();
  const {
    palette: { primary },
  } = useTheme();

  const guilds = useSelector(getGuilds);
  const dmChannels = useSelector(getDmChannels);

  const [viewedGuildId, setViewedGuildId] = useState<string | null>(null);
  const [selectedTab, setSelectedTab] = useState<number>(0);

  const viewedGuild = viewedGuildId ? guilds?.[viewedGuildId] : null;
  const channels = viewedGuild?.channels;

  useEffect(() => {
    const newSelectedChannels = { ...selectedChannels };
    Object.entries(selectedGuilds)
      .filter(([guildId, selected]) => selected)
      .forEach(([guildId]) => {
        const channels = guilds?.[guildId]?.channels;
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
  }, []);

  useEffect(() => {
    dispatch({ type: DiscordActionType.fetchDmChannelsStart });
  }, []);

  useEffect(() => {
    if (viewedGuildId && !channels) {
      dispatch({
        type: DiscordActionType.fetchChannelsStart,
        payload: { guildId: viewedGuildId },
      });
    }
  }, [viewedGuildId]);

  const allGuildsSelected = useMemo(
    () =>
      !!guilds &&
      Object.keys(guilds).every((guildId) => selectedGuilds[guildId]),
    [guilds, selectedGuilds]
  );

  const toggleSelectAllGuilds = () => {
    if (!guilds) {
      return;
    }
    const newSelected = !allGuildsSelected;
    const newSelectedGuilds: { [guildId: string]: boolean } = {};
    const newSelectedChannels: { [channelId: string]: boolean } = {};
    const newAutoPreserveNewChannels: { [guildId: string]: boolean } = {};
    Object.entries(guilds).forEach(([guildId, guild]) => {
      newSelectedGuilds[guildId] = newSelected;
      newAutoPreserveNewChannels[guildId] = newSelected;
      if (guild.channels) {
        Object.keys(guild.channels).forEach((channelId) => {
          newSelectedChannels[channelId] = newSelected;
        });
      }
    });
    setSelectedGuilds(newSelectedGuilds);
    setSelectedChannels(newSelectedChannels);
    setAutoPreserveNewGuilds(newSelected);
    setAutoPreserveNewChannels(newAutoPreserveNewChannels);
  };

  const toggleSelectedGuild = (guildId: string) => {
    const newSelected = !selectedGuilds[guildId];
    const newSelectedGuilds = { ...selectedGuilds };
    newSelectedGuilds[guildId] = newSelected;
    setSelectedGuilds(newSelectedGuilds);

    const channels = guilds?.[guildId]?.channels;
    if (channels) {
      const newSelectedChannels = { ...selectedChannels };
      Object.keys(channels).forEach((channelId) => {
        newSelectedChannels[channelId] = newSelected;
      });
      setSelectedChannels(newSelectedChannels);
    }

    const newAutoPreserveNewChannels: { [guildId: string]: boolean } = {
      ...autoPreserveNewChannels,
    };
    newAutoPreserveNewChannels[guildId] = newSelected;
    setAutoPreserveNewChannels(newAutoPreserveNewChannels);
  };

  const toggleSelectedChannel = (channelId: string) => {
    if (!channels) {
      return;
    }
    const newSelectedChannels = { ...selectedChannels };
    newSelectedChannels[channelId] = !selectedChannels[channelId];
    setSelectedChannels(newSelectedChannels);

    const guildId = channels[channelId]?.guildId;
    const guildChannels = guildId && guilds?.[guildId]?.channels;
    if (guildChannels) {
      const newSelected = Object.keys(guildChannels).every(
        (channelId) => newSelectedChannels[channelId]
      );
      const newSelectedGuilds = { ...selectedGuilds };
      newSelectedGuilds[guildId] = newSelected;
      setSelectedGuilds(newSelectedGuilds);
    }
  };

  const allDmChannelsSelected = useMemo(
    () =>
      !!dmChannels &&
      Object.keys(dmChannels).every(
        (dmChannelId) => selectedDmChannels[dmChannelId]
      ),
    [dmChannels, selectedDmChannels]
  );

  const toggleSelectAllDms = () => {
    if (!dmChannels) {
      return;
    }
    const newSelected = !allDmChannelsSelected;
    const newSelectedDmChannels: { [dmChannelId: string]: boolean } = {};
    Object.keys(dmChannels).forEach((dmChannelId) => {
      newSelectedDmChannels[dmChannelId] = newSelected;
    });
    setSelectedDmChannels(newSelectedDmChannels);
    setAutoPreserveNewDmChannels(newSelected);
  };

  const toggleSelectedDmChannel = (dmChannelId: string) => {
    if (!dmChannels) {
      return;
    }
    const newSelectedDmChannels = { ...selectedDmChannels };
    newSelectedDmChannels[dmChannelId] = !selectedDmChannels[dmChannelId];
    setSelectedDmChannels(newSelectedDmChannels);
  };

  const showServers = selectedTab === 0 && !viewedGuildId;
  const showChannels = selectedTab === 0 && viewedGuildId;
  const showDms = selectedTab === 1;

  return (
    <Card style={{ width: GRID_WIDTH, height: 448 }}>
      <Tabs
        value={selectedTab}
        onChange={(event, tabIndex) => setSelectedTab(tabIndex)}
        style={{ height: 48 }}
      >
        <Tab label="Servers" />
        <Tab label="DMs" />
      </Tabs>
      {showServers && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            backgroundColor: "#222",
            borderBottom: "1px solid #111",
            height: 50,
            paddingLeft: 10,
          }}
        >
          <Typography
            sx={{
              overflow: "hidden",
              textOverflow: "ellipsis",
              marginLeft: "10px",
            }}
          >
            All Servers
          </Typography>
          {guilds && (
            <>
              <FormControlLabel
                sx={{
                  marginLeft: "auto",
                }}
                control={
                  <Switch
                    edge="end"
                    onClick={() =>
                      setAutoPreserveNewGuilds(!autoPreserveNewGuilds)
                    }
                    checked={autoPreserveNewGuilds}
                  />
                }
                label={
                  <Typography style={{ fontSize: "0.875rem" }}>
                    Auto preserve new servers
                  </Typography>
                }
              />
              <Checkbox
                style={{
                  marginLeft: 20,
                  marginRight: 72,
                }}
                onClick={() => toggleSelectAllGuilds()}
                edge="end"
                checked={allGuildsSelected}
                indeterminate={
                  !allGuildsSelected &&
                  Object.values(selectedGuilds).some(
                    (selectedGuild) => selectedGuild
                  )
                }
                tabIndex={-1}
              />
            </>
          )}
        </div>
      )}
      <div
        style={{
          backgroundColor: "#222",
          height: showServers ? "100%" : 0,
          width: showServers ? "100%" : 0,
        }}
      >
        {guilds ? (
          <List
            style={{
              overflowY: "scroll",
              maxHeight: 350,
            }}
            dense
          >
            {Object.values(guilds).map((guild) => (
              <ListItem
                key={guild.id}
                secondaryAction={
                  <IconButton onClick={() => setViewedGuildId(guild.id)}>
                    <NavigateNext />
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
                          : discordLogo
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
      <div
        style={{
          backgroundColor: "#222",
          height: showChannels ? "100%" : 0,
          width: showChannels ? "100%" : 0,
        }}
      >
        {showChannels && viewedGuild && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              borderBottom: "1px solid #111",
              height: 50,
            }}
          >
            <IconButton
              style={{ marginLeft: 5 }}
              onClick={() => setViewedGuildId(null)}
            >
              <NavigateBefore />
            </IconButton>
            <Avatar
              style={{ marginLeft: 5 }}
              src={
                viewedGuild.icon
                  ? `https://cdn.discordapp.com/icons/${viewedGuild.id}/${viewedGuild.icon}`
                  : discordLogo
              }
            />
            <Typography
              sx={{
                overflow: "hidden",
                textOverflow: "ellipsis",
                marginLeft: "10px",
              }}
            >
              {viewedGuild.name}
            </Typography>
            {channels && (
              <>
                <FormControlLabel
                  sx={{
                    marginLeft: "auto",
                  }}
                  control={
                    <Switch
                      edge="end"
                      onClick={() => {
                        const newAutoPreserveNewChannels = {
                          ...autoPreserveNewChannels,
                        };
                        newAutoPreserveNewChannels[viewedGuild.id] =
                          !newAutoPreserveNewChannels[viewedGuild.id];
                        setAutoPreserveNewChannels(newAutoPreserveNewChannels);
                      }}
                      checked={autoPreserveNewChannels[viewedGuild.id]}
                    />
                  }
                  label={
                    <Typography style={{ fontSize: "0.875rem" }}>
                      Auto preserve new channels
                    </Typography>
                  }
                />
                <Checkbox
                  style={{
                    marginLeft: 20,
                    marginRight: 40,
                  }}
                  onClick={() => toggleSelectedGuild(viewedGuild.id)}
                  edge="end"
                  checked={selectedGuilds[viewedGuildId!] ?? false}
                  indeterminate={
                    !selectedGuilds[viewedGuildId!] &&
                    Object.keys(channels).some(
                      (channelId) => selectedChannels[channelId]
                    )
                  }
                  tabIndex={-1}
                />
              </>
            )}
          </div>
        )}
        {channels ? (
          <List
            style={{
              maxHeight: 350,
              overflowY: "scroll",
            }}
            dense
          >
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
                    # {channel.name}
                  </ListItemText>
                  <ListItemIcon>
                    <Checkbox
                      edge="end"
                      checked={selectedChannels[channel.id] ?? false}
                      tabIndex={-1}
                    />
                  </ListItemIcon>
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        ) : (
          viewedGuildId && <LinearProgress />
        )}
      </div>
      <div
        style={{
          backgroundColor: "#222",
          height: showDms ? "100%" : 0,
          width: showDms ? "100%" : 0,
        }}
      >
        {showDms && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              borderBottom: "1px solid #111",
              height: 50,
              paddingLeft: 10,
            }}
          >
            <Typography
              sx={{
                overflow: "hidden",
                textOverflow: "ellipsis",
                marginLeft: "10px",
              }}
            >
              All Conversations
            </Typography>
            {dmChannels && (
              <>
                <FormControlLabel
                  sx={{
                    marginLeft: "auto",
                  }}
                  control={
                    <Switch
                      edge="end"
                      onClick={() =>
                        setAutoPreserveNewDmChannels(!autoPreserveNewDmChannels)
                      }
                      checked={autoPreserveNewDmChannels}
                    />
                  }
                  label={
                    <Typography style={{ fontSize: "0.875rem" }}>
                      Auto preserve new conversations
                    </Typography>
                  }
                />
                <Checkbox
                  style={{
                    marginLeft: 20,
                    marginRight: 40,
                  }}
                  onClick={() => toggleSelectAllDms()}
                  edge="end"
                  checked={allDmChannelsSelected}
                  indeterminate={
                    !allDmChannelsSelected &&
                    Object.values(selectedDmChannels).some(
                      (selected) => selected
                    )
                  }
                  tabIndex={-1}
                />
              </>
            )}
          </div>
        )}
        {dmChannels ? (
          <List
            style={{
              overflowY: "scroll",
              maxHeight: 350,
            }}
            dense
          >
            {Object.values(dmChannels).map((dmChannel) => (
              <ListItem key={dmChannel.id} disablePadding>
                <ListItemButton
                  onClick={() => toggleSelectedDmChannel(dmChannel.id)}
                >
                  <ListItemAvatar>
                    <Avatar
                      src={
                        dmChannel.recipients.length === 1
                          ? dmChannel.recipients[0]?.avatar
                            ? `https://cdn.discordapp.com/avatars/${dmChannel.recipients[0].id}/${dmChannel.recipients[0].avatar}`
                            : discordLogo
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
    </Card>
  );
}

export default memo(ChannelGrid);

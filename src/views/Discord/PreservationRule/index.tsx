import {
  Delete,
  Edit,
  NavigateBefore,
  NavigateNext,
} from "@mui/icons-material";
import {
  Avatar,
  Card,
  IconButton,
  LinearProgress,
  List,
  ListItem,
  ListItemAvatar,
  ListItemButton,
  ListItemText,
  Tab,
  Tabs,
  Typography,
  useTheme,
} from "@mui/material";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import { ActionType as DiscordActionType } from "../../../redux/discord/actions";
import {
  getDiscordPreservationRules,
  getSaveStatus,
} from "../../../redux/preservationRules/selectors";
import { ActionType as PreservationRulesActionType } from "../../../redux/preservationRules/actions";
import { getDmChannels, getGuilds } from "../../../redux/discord/selectors";

export default function PreservationRule() {
  const [viewedGuildId, setViewedGuildId] = useState<string | null>(null);
  const [viewedChannelId, setViewedChannelId] = useState<string | null>(null);
  const [selectedTab, setSelectedTab] = useState<number>(0);

  const {
    palette: { primary },
  } = useTheme();

  const params = useParams();
  const preservationRuleId = Number(params.preservationRuleId);
  const preservationRules = useSelector(getDiscordPreservationRules);
  const preservationRule = preservationRules?.[preservationRuleId];

  const guilds = useSelector(getGuilds);
  const dmChannels = useSelector(getDmChannels);

  const viewedGuild = viewedGuildId ? guilds?.[viewedGuildId] : null;
  const channels = viewedGuild?.channels;

  useEffect(() => {
    if (viewedGuildId && !channels) {
      dispatch({
        type: DiscordActionType.fetchChannelsStart,
        payload: { guildId: viewedGuildId },
      });
    }
  }, [viewedGuildId]);

  const saveStatus = useSelector(getSaveStatus);

  const dispatch = useDispatch();

  useEffect(() => {
    dispatch({ type: DiscordActionType.fetchGuildsStart });
  }, []);

  useEffect(() => {
    dispatch({ type: DiscordActionType.fetchDmChannelsStart });
  }, []);

  if (!preservationRule) {
    return null;
  }

  const showServers = selectedTab === 0 && !viewedGuildId;
  const showChannels = selectedTab === 0 && viewedGuildId;
  const showDms = selectedTab === 1;

  return (
    <div style={{ marginLeft: 40, marginTop: 20, width: 1000 }}>
      <div style={{ display: "flex" }}>
        <Typography variant="h6" style={{ marginBottom: 10 }}>
          {preservationRule.name}
        </Typography>
        <IconButton style={{ marginLeft: "auto" }}>
          <Edit />
        </IconButton>
        <IconButton
          onClick={() =>
            dispatch({
              type: PreservationRulesActionType.deleteStart,
              payload: {
                appName: "discord",
                preservationRuleId: preservationRule.id,
              },
            })
          }
          disabled={saveStatus === "pending"}
        >
          <Delete />
        </IconButton>
      </div>
      {(preservationRule.startDatetime || preservationRule.endDatetime) && (
        <div style={{ display: "flex", marginBottom: 10 }}>
          Messages preserved
          {preservationRule.startDatetime &&
            preservationRule.endDatetime &&
            ` from ${preservationRule.startDatetime.toLocaleDateString()} to ${preservationRule.endDatetime.toLocaleDateString()}`}
          {preservationRule.startDatetime &&
            !preservationRule.endDatetime &&
            ` after ${preservationRule.startDatetime.toLocaleDateString()}`}
          {!preservationRule.startDatetime &&
            preservationRule.endDatetime &&
            ` before ${preservationRule.endDatetime.toLocaleDateString()}`}
        </div>
      )}
      <Card style={{ height: 648, width: "100%" }}>
        <Tabs
          value={selectedTab}
          onChange={(event, tabIndex) => setSelectedTab(tabIndex)}
          style={{ height: 48 }}
        >
          <Tab label="Servers" />
          <Tab label="DMs" />
        </Tabs>
        <div
          style={{
            backgroundColor: "#222",
            height: showServers ? "100%" : 0,
            width: showServers ? "100%" : 0,
          }}
        >
          {guilds ? (
            <>
              {showServers && (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    backgroundColor: primary.dark,
                    height: 50,
                    paddingLeft: 10,
                  }}
                >
                  <Typography
                    sx={{
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      marginLeft: "10px",
                      fontSize: "0.875rem",
                    }}
                  >
                    All Servers
                  </Typography>
                </div>
              )}
              <List
                style={{
                  overflowY: "scroll",
                  maxHeight: 550,
                }}
                dense
              >
                {Object.values(guilds).map((guild) => (
                  <ListItem key={guild.id} disablePadding>
                    <ListItemButton onClick={() => setViewedGuildId(guild.id)}>
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
                    </ListItemButton>
                  </ListItem>
                ))}
              </List>
            </>
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
          {channels ? (
            <>
              {showChannels && (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    backgroundColor: primary.dark,
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
                        : "/app-logos/discord.png"
                    }
                  />
                  <Typography
                    sx={{
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      marginLeft: "10px",
                      fontSize: "0.875rem",
                    }}
                  >
                    {viewedGuild.name}
                  </Typography>
                </div>
              )}
              <List
                style={{
                  maxHeight: 550,
                  overflowY: "scroll",
                }}
                dense
              >
                {Object.values(channels).map((channel) => (
                  <ListItem key={channel.id} disablePadding>
                    <ListItemButton
                      onClick={() => setViewedChannelId(channel.id)}
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
                    </ListItemButton>
                  </ListItem>
                ))}
              </List>
            </>
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
          {dmChannels ? (
            <>
              {showDms && (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    backgroundColor: primary.dark,
                    height: 50,
                    paddingLeft: 10,
                  }}
                >
                  <Typography
                    sx={{
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      marginLeft: "10px",
                      fontSize: "0.875rem",
                    }}
                  >
                    All Conversations
                  </Typography>
                </div>
              )}
              <List
                style={{
                  overflowY: "scroll",
                  maxHeight: 550,
                }}
                dense
              >
                {Object.values(dmChannels).map((dmChannel) => (
                  <ListItem key={dmChannel.id} disablePadding>
                    <ListItemButton
                      onClick={() => setViewedChannelId(dmChannel.id)}
                    >
                      <ListItemAvatar>
                        <Avatar
                          src={
                            dmChannel.recipients.length === 1
                              ? dmChannel.recipients[0]?.avatar
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
                    </ListItemButton>
                  </ListItem>
                ))}
              </List>
            </>
          ) : (
            <LinearProgress />
          )}
        </div>
      </Card>
    </div>
  );
}

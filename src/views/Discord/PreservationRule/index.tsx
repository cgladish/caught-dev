import { Delete, Edit, NavigateBefore } from "@mui/icons-material";
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
import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { ActionType as DiscordActionType } from "../../../redux/discord/actions";
import {
  getDiscordPreservationRules,
  getSaveStatus,
} from "../../../redux/preservationRules/selectors";
import { ActionType as PreservationRulesActionType } from "../../../redux/preservationRules/actions";
import { getDmChannels, getGuilds } from "../../../redux/discord/selectors";
import { DiscordSelected } from "../../../../types/discord";
import Messages from "./Messages";

export default function PreservationRule() {
  const [viewedGuildId, setViewedGuildId] = useState<string | null>(null);
  const [viewedChannelId, setViewedChannelId] = useState<string | null>(null);
  const [viewedDmChannelId, setViewedDmChannelId] = useState<string | null>(
    null
  );
  const [selectedTab, setSelectedTab] = useState<number>(0);

  const navigate = useNavigate();

  const {
    palette: { primary },
  } = useTheme();

  const params = useParams();
  const preservationRuleId = Number(params.preservationRuleId);
  const preservationRules = useSelector(getDiscordPreservationRules);
  const preservationRule = preservationRules?.[preservationRuleId];
  const selected = preservationRule?.selected as DiscordSelected | undefined;

  const guilds = useSelector(getGuilds);
  const dmChannels = useSelector(getDmChannels);

  const viewedGuild = viewedGuildId ? guilds?.[viewedGuildId] : null;
  const channels = viewedGuild?.channels;
  const viewedChannel = viewedChannelId
    ? viewedGuild?.channels?.[viewedChannelId]
    : null;
  const viewedDmChannel = viewedDmChannelId
    ? dmChannels?.[viewedDmChannelId]
    : null;

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
    dispatch({
      type: PreservationRulesActionType.fetchStart,
      payload: { appName: "discord" },
    });
    dispatch({ type: DiscordActionType.fetchGuildsStart });
    dispatch({ type: DiscordActionType.fetchDmChannelsStart });
  }, []);

  const filteredGuilds = useMemo(
    () =>
      guilds &&
      selected &&
      Object.values(guilds).filter(({ id }) => selected.guilds[id]),
    [guilds, selected]
  );
  const filteredChannels = useMemo(
    () =>
      viewedGuildId &&
      channels &&
      selected &&
      Object.values(channels).filter(({ id }) =>
        selected.guilds[viewedGuildId]?.channelIds?.includes(id)
      ),
    [channels, selected]
  );
  const filteredDmChannels = useMemo(
    () =>
      dmChannels &&
      selected &&
      Object.values(dmChannels).filter(({ id }) =>
        selected.dmChannelIds.includes(id)
      ),
    [dmChannels, selected]
  );

  const channelMessages: string[] | undefined = [];
  const dmChannelMessages: string[] | undefined = [];

  if (!preservationRule) {
    return <LinearProgress />;
  }

  const showServersTab = !!filteredGuilds?.length && selectedTab === 0;
  const showServers = showServersTab && !viewedGuildId;
  const showChannels = showServersTab && !!viewedGuildId && !viewedChannelId;
  const showChannelMessages = showServersTab && !!viewedChannelId;

  const showDmsTab =
    !!filteredDmChannels?.length &&
    (filteredGuilds?.length ? selectedTab === 1 : selectedTab === 0);
  const showDms = showDmsTab && !viewedDmChannelId;
  const showDmChannelMessages = showDmsTab && !!viewedDmChannelId;

  return (
    <div style={{ marginLeft: 40, marginTop: 20, width: 850 }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          marginBottom: 10,
        }}
      >
        <IconButton onClick={() => navigate("..")}>
          <NavigateBefore />
        </IconButton>
        <Typography variant="h6">{preservationRule.name}</Typography>
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
          {!!filteredGuilds?.length && <Tab label="Servers" />}
          {!!filteredDmChannels?.length && <Tab label="DMs" />}
        </Tabs>
        <div
          style={{
            backgroundColor: "#222",
            height: showServers ? "100%" : 0,
            width: showServers ? "100%" : 0,
          }}
        >
          {filteredGuilds ? (
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
                {filteredGuilds.map((guild) => (
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
          {filteredChannels && viewedGuild ? (
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
                {filteredChannels.map((channel) => (
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
          {filteredDmChannels ? (
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
                {filteredDmChannels.map((dmChannel) => (
                  <ListItem key={dmChannel.id} disablePadding>
                    <ListItemButton
                      onClick={() => setViewedDmChannelId(dmChannel.id)}
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
        <Messages
          visible={showChannelMessages}
          loading={!(channelMessages && viewedChannel)}
          title={`# ${viewedChannel?.name}`}
          onBack={() => setViewedChannelId(null)}
        />
        <Messages
          visible={showDmChannelMessages}
          loading={!(dmChannelMessages && viewedDmChannel)}
          title={
            viewedDmChannel?.recipients
              .map(({ username }) => username)
              .join(", ") ?? ""
          }
          onBack={() => setViewedDmChannelId(null)}
        />
      </Card>
    </div>
  );
}

import { NavigateBefore } from "@mui/icons-material";
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
import WordCloud from "wordcloud";
import { useContext, useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import chroma from "chroma-js";
import discordLogo from "../../../assets/app-logos/discord.png";
import { ActionType as ChannelsActionType } from "../../../redux/channels/actions";
import {
  getDiscordPreservationRules,
  getSaveStatus,
} from "../../../redux/preservationRules/selectors";
import { ActionType as PreservationRulesActionType } from "../../../redux/preservationRules/actions";
import { DiscordSelected } from "../../../discord";
import Messages from "./Messages";
import { Dispatch } from "../../../redux";
import { getDiscordChannels } from "../../../redux/channels/selectors";
import { DeletePreservationRuleButton } from "../../../components/DeletePreservationRuleButton";
import { AlertContext } from "../../../Alerts";

export default function PreservationRule() {
  const [viewedGuildId, setViewedGuildId] = useState<string | null>(null);
  const [viewedChannelId, setViewedChannelId] = useState<string | null>(null);
  const [viewedDmChannelId, setViewedDmChannelId] = useState<string | null>(
    null
  );
  const [selectedTab, setSelectedTab] = useState<number>(0);
  const [selectedMessagesTab, setSelectedMessagesTab] = useState<number>(0);

  const navigate = useNavigate();

  const {
    palette: {
      primary: { main },
    },
  } = useTheme();

  const dispatch = useDispatch<Dispatch>();

  const allChannels = useSelector(getDiscordChannels);

  const params = useParams();
  const preservationRuleId = Number(params.preservationRuleId);
  const preservationRules = useSelector(getDiscordPreservationRules);
  const preservationRule = preservationRules?.[preservationRuleId];
  const selected = preservationRule?.selected as DiscordSelected | undefined;

  const { showAlert } = useContext(AlertContext);

  const wordCloudRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    (async () => {
      if (selectedTab === 1 && wordCloudRef.current) {
        try {
          const wordCounts = await window.api.wordCounts.fetchTopWordCounts(
            preservationRuleId,
            500
          );
          const biggestCount = wordCounts[0]?.count ?? 1;
          const colorScale = chroma.scale(["#eee", main]);
          WordCloud(wordCloudRef.current, {
            list: wordCounts.map(({ word, count }) => [word, count]),
            gridSize: Math.round((16 * wordCloudRef.current.width) / 1024),
            weightFactor: (weight) => {
              return (
                (((weight * 200) / biggestCount) *
                  wordCloudRef.current!.width) /
                1024
              );
            },
            color: (_, weight) => {
              return colorScale((weight as number) / biggestCount).hex();
            },
            fontFamily: "Roboto, serif",
            backgroundColor: "rgba(0, 0, 0, 0)",
          });
        } catch (err) {
          showAlert({ type: "error", message: "Failed to create word cloud" });
        }
      }
    })();
  }, [selectedTab]);

  const preservationRuleChannels = allChannels?.[preservationRuleId];
  const guilds =
    selected &&
    preservationRuleChannels &&
    Object.keys(selected.guilds).map((id) => preservationRuleChannels[id]!);
  const channels =
    selected &&
    !!viewedGuildId &&
    preservationRuleChannels &&
    selected.guilds[viewedGuildId]?.channelIds?.map(
      (id) => preservationRuleChannels[id]!
    );
  const dmChannels =
    selected &&
    preservationRuleChannels &&
    selected.dmChannelIds.map((id) => preservationRuleChannels[id]!);

  const viewedGuild = viewedGuildId
    ? preservationRuleChannels?.[viewedGuildId]
    : null;
  const viewedChannel = viewedChannelId
    ? preservationRuleChannels?.[viewedChannelId]
    : null;
  const viewedDmChannel = viewedDmChannelId
    ? preservationRuleChannels?.[viewedDmChannelId]
    : null;

  useEffect(() => {
    if (selected) {
      const channelIds = [
        ...Object.keys(selected.guilds),
        ...Object.values(selected.guilds).flatMap(
          ({ channelIds }) => channelIds ?? []
        ),
        ...selected.dmChannelIds,
      ];
      dispatch({
        type: ChannelsActionType.fetchStart,
        payload: { appName: "discord", preservationRuleId, channelIds },
      });
    }
  }, [selected]);

  const saveStatus = useSelector(getSaveStatus);

  useEffect(() => {
    dispatch({
      type: PreservationRulesActionType.fetchStart,
      payload: { appName: "discord" },
    });
  }, []);

  if (!preservationRule) {
    return <LinearProgress />;
  }

  const showServersTab = !!guilds?.length && selectedMessagesTab === 0;
  const showServers = showServersTab && !viewedGuildId;
  const showChannels = showServersTab && !!viewedGuildId && !viewedChannelId;
  const showChannelMessages = showServersTab && !!viewedChannelId;

  const showDmsTab =
    !!dmChannels?.length &&
    (guilds?.length ? selectedMessagesTab === 1 : selectedMessagesTab === 0);
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
        {/*
        <IconButton style={{ marginLeft: "auto" }}>
          <Edit />
        </IconButton>
        */}
        <div style={{ marginLeft: "auto" }}>
          <DeletePreservationRuleButton
            preservationRuleId={preservationRule.id}
            disabled={saveStatus === "pending"}
          />
        </div>
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
      <Tabs
        value={selectedTab}
        onChange={(event, tabIndex) => setSelectedTab(tabIndex)}
      >
        <Tab label="Messages" />
        <Tab label="Word Cloud" />
      </Tabs>
      {selectedTab === 0 && (
        <Card style={{ height: 598, width: "100%", overflow: "visible" }}>
          <Tabs
            value={selectedMessagesTab}
            onChange={(event, tabIndex) => setSelectedMessagesTab(tabIndex)}
            style={{ minHeight: 48 }}
          >
            {!!guilds?.length && <Tab label="Servers" />}
            {!!dmChannels?.length && <Tab label="DMs" />}
          </Tabs>
          <div
            style={{
              backgroundColor: "#222",
              height: showServers ? undefined : 0,
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
                  </div>
                )}
                <List
                  style={{
                    overflowY: "scroll",
                    maxHeight: 500,
                  }}
                  dense
                >
                  {guilds.map((guild) => (
                    <ListItem key={guild.id} disablePadding>
                      <ListItemButton
                        onClick={() => setViewedGuildId(guild.externalId)}
                      >
                        <ListItemAvatar>
                          <Avatar src={guild.iconUrl ?? discordLogo} />
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
              height: showChannels ? undefined : 0,
              width: showChannels ? "100%" : 0,
            }}
          >
            {channels && viewedGuild ? (
              <>
                {showChannels && (
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
                      src={viewedGuild.iconUrl ?? discordLogo}
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
                  </div>
                )}
                <List
                  style={{
                    maxHeight: 500,
                    overflowY: "scroll",
                  }}
                  dense
                >
                  {channels.map((channel) => (
                    <ListItem key={channel.id} disablePadding>
                      <ListItemButton
                        onClick={() => setViewedChannelId(channel.externalId)}
                        style={{ height: 50 }}
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
              height: showDms ? undefined : 0,
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
                  </div>
                )}
                <List
                  style={{
                    overflowY: "scroll",
                    maxHeight: 500,
                  }}
                  dense
                >
                  {dmChannels.map((dmChannel) => (
                    <ListItem key={dmChannel.id} disablePadding>
                      <ListItemButton
                        onClick={() =>
                          setViewedDmChannelId(dmChannel.externalId)
                        }
                      >
                        <ListItemAvatar>
                          <Avatar
                            src={
                              dmChannel?.iconUrl ??
                              "https://discord.com/assets/e2779af34b8d9126b77420e5f09213ce.png"
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
                          {dmChannel.name}
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
          {showChannelMessages && viewedChannel && (
            <Messages
              visible={showChannelMessages}
              title={`# ${viewedChannel.name}`}
              onBack={() => setViewedChannelId(null)}
              preservationRuleId={preservationRule.id}
              channelId={viewedChannel.externalId}
            />
          )}
          {showDmChannelMessages && viewedDmChannel && (
            <Messages
              visible={showDmChannelMessages}
              title={viewedDmChannel.name}
              onBack={() => setViewedDmChannelId(null)}
              preservationRuleId={preservationRule.id}
              channelId={viewedDmChannel.externalId}
            />
          )}
        </Card>
      )}
      {selectedTab === 1 && (
        <Card style={{ width: 850, height: 600 }}>
          <canvas ref={wordCloudRef} width={850} height={600} />
        </Card>
      )}
    </div>
  );
}

import {
  AttachFile,
  Attachment,
  Clear,
  Download,
  NavigateBefore,
  Search,
} from "@mui/icons-material";
import {
  IconButton,
  Typography,
  List,
  LinearProgress,
  useTheme,
  Avatar,
  ListItem,
  TextField,
  Button,
  InputAdornment,
  Popper,
  Paper,
  Modal,
} from "@mui/material";
import { useEffect, useRef, useState } from "react";
import { format } from "date-fns";
import { useDispatch, useSelector } from "react-redux";
import { DatePicker, TimePicker } from "@mui/x-date-pickers";
import { Dispatch } from "../../../redux";
import { ActionType } from "../../../redux/messages/actions";
import { DiscordMessage } from "../../../../api/messages";
import {
  getMessages,
  getSearchResults,
  getSearchStatus,
} from "../../../redux/messages/selectors";
import { combineDateAndTime } from "../../../utils";
import "./Messages.css";
import { partition } from "lodash";

const MessageItem = ({ message }: { message: DiscordMessage }) => {
  const [viewedImage, setViewedImage] = useState<{
    url: string;
    filename: string;
  } | null>(null);
  const [imageAttachments, nonImageAttachments] = message.appSpecificData
    ?.attachments
    ? partition(message.appSpecificData.attachments, ({ content_type }) =>
        content_type?.includes("image")
      )
    : [];
  return (
    <ListItem
      className="message-content"
      key={message.id}
      style={{ padding: "10px 5px" }}
      disablePadding
    >
      <div style={{ display: "flex", width: "100%" }}>
        <Avatar
          src={
            message.authorAvatar
              ? `https://cdn.discordapp.com/avatars/${message.authorId}/${message.authorAvatar}`
              : "app-logos/discord.png"
          }
        />
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            marginLeft: 10,
            width: "100%",
          }}
        >
          <div style={{ display: "flex", alignItems: "center" }}>
            <Typography style={{ fontWeight: "500" }}>
              {message.authorName}
            </Typography>
            <Typography
              color="text.secondary"
              style={{ fontSize: ".75rem", marginLeft: 20 }}
            >
              {format(message.sentAt, "P")} at {format(message.sentAt, "p")}
            </Typography>
          </div>
          <Typography style={{ marginTop: "2px" }}>
            {message.content}
          </Typography>
          {imageAttachments?.map(({ filename, url }, index) => (
            <div
              key={index}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-start",
              }}
            >
              <Typography
                className="message-view-original"
                color="text.secondary"
                style={{
                  fontSize: "0.75rem",
                  cursor: "pointer",
                  width: "fit-content",
                }}
                onClick={() => window.api.urls.openExternal(url)}
              >
                View Original
              </Typography>
              <img
                src={url}
                alt={filename}
                style={{
                  borderRadius: 4,
                  maxHeight: 300,
                  maxWidth: 300,
                  height: "auto",
                  width: "auto",
                  cursor: "pointer",
                }}
                onClick={() => setViewedImage({ url, filename })}
              />
            </div>
          ))}
          {viewedImage && (
            <Modal onClose={() => setViewedImage(null)} open>
              <img
                src={viewedImage.url}
                alt={viewedImage.filename}
                style={{
                  maxWidth: 800,
                  maxHeight: 600,
                  height: "auto",
                  width: "auto",
                  position: "absolute",
                  top: "50%",
                  left: "50%",
                  transform: "translate(-50%, -50%)",
                }}
              />
            </Modal>
          )}
          {nonImageAttachments?.map(
            ({ filename, url, content_type }, index) => (
              <div
                key={index}
                style={{
                  background: "#111",
                  height: 55,
                  display: "flex",
                  alignItems: "center",
                  margin: "5px 0 5px 0",
                  borderRadius: 4,
                  border: "1px solid #666",
                  cursor: "pointer",
                  padding: "0 10px",
                  width: "400px",
                  maxWidth: "400px",
                }}
                onClick={() => window.api.urls.openExternal(url)}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    width: "100%",
                  }}
                >
                  <Attachment />
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      marginLeft: 5,
                    }}
                  >
                    <Typography
                      style={{
                        width: "300px",
                        justifyContent: "space-between",
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      {filename}
                    </Typography>
                    <Typography
                      color="text.secondary"
                      style={{ fontSize: ".875rem" }}
                    >
                      {content_type}
                    </Typography>
                  </div>
                </div>
                <Download />
              </div>
            )
          )}
          {message.appSpecificData?.embeds.map((embed) => "EMBED")}
        </div>
      </div>
    </ListItem>
  );
};

export default function Messages({
  visible,
  title,
  onBack,
  preservationRuleId,
  channelId,
}: {
  visible: boolean;
  title: string;
  onBack: () => void;
  preservationRuleId: number;
  channelId: string;
}) {
  const {
    palette: { primary },
  } = useTheme();

  const dispatch = useDispatch<Dispatch>();

  const [searchContent, setSearchContent] = useState<string>("");
  const [searchStartDate, setSearchStartDate] = useState<Date | null>(null);
  const [searchStartTime, setSearchStartTime] = useState<Date | null>(null);
  const [searchEndDate, setSearchEndDate] = useState<Date | null>(null);
  const [searchEndTime, setSearchEndTime] = useState<Date | null>(null);
  const [showSearchResults, setShowSearchResults] = useState<boolean>(false);
  const [showFilterMenu, setShowFilterMenu] = useState<boolean>(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);
  const filterMenuRef = useRef<HTMLDivElement>(null);
  const startDateRef = useRef<HTMLDivElement>(null);

  const allMessages = useSelector(getMessages);
  const allSearchResults = useSelector(getSearchResults);
  const searchStatus = useSelector(getSearchStatus);

  const messages = allMessages[preservationRuleId]?.[channelId] as
    | DiscordMessage[]
    | null
    | undefined;
  const searchResults = allSearchResults[preservationRuleId]?.[channelId];

  useEffect(() => {
    if (!messages) {
      dispatch({
        type: ActionType.fetchStart,
        payload: { preservationRuleId, channelId },
      });
    }

    const onClick = (event: MouseEvent) => {
      if (
        !searchRef.current?.contains(event.target as any) &&
        !filterMenuRef.current?.contains(event.target as any) &&
        !startDateRef.current?.contains(event.target as any)
      ) {
        setShowFilterMenu(false);
      }
    };
    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, []);

  useEffect(() => {
    if (searchStatus === "pending") {
      setShowSearchResults(true);
    }
  }, [searchStatus]);

  const prevMessagesRef = useRef<DiscordMessage[]>();
  useEffect(() => {
    if (!prevMessagesRef.current && messages) {
      messagesEndRef.current?.scrollIntoView({ block: "nearest" });
    }
    prevMessagesRef.current = messages ?? undefined;
  }, [messages]);

  const loadMoreMessages: React.UIEventHandler<HTMLUListElement> = (event) => {
    if (messages?.[0] && (event.target as HTMLElement).scrollTop < 10) {
      dispatch({
        type: ActionType.fetchStart,
        payload: {
          preservationRuleId,
          channelId,
          cursor: { before: messages[0].id },
        },
      });
    }
  };

  const loadMoreSearchResults: React.UIEventHandler<HTMLUListElement> = (
    event
  ) => {
    if (
      searchResults &&
      !searchResults.isLastPage &&
      (event.target as HTMLElement).scrollTop + 550 ===
        (event.target as HTMLElement).scrollHeight
    ) {
      dispatch({
        type: ActionType.searchStart,
        payload: {
          preservationRuleId,
          channelId,
          filter: {
            content: searchContent || undefined,
            startDatetime: searchStartDate
              ? combineDateAndTime(searchStartDate, searchStartTime)
              : undefined,
            endDatetime: searchEndDate
              ? combineDateAndTime(searchEndDate, searchEndTime)
              : undefined,
          },
          before: searchResults.data[searchResults.data.length - 1]?.id,
        },
      });
    }
  };

  const onSearch = () => {
    dispatch({
      type: ActionType.searchStart,
      payload: {
        preservationRuleId,
        channelId,
        filter: {
          content: searchContent || undefined,
          startDatetime: searchStartDate
            ? combineDateAndTime(searchStartDate, searchStartTime)
            : undefined,
          endDatetime: searchEndDate
            ? combineDateAndTime(searchEndDate, searchEndTime)
            : undefined,
        },
      },
    });
    setShowFilterMenu(false);
  };

  return (
    <div
      style={{
        backgroundColor: "#222",
        height: visible ? "100%" : 0,
        width: visible ? "100%" : 0,
      }}
    >
      {visible && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            borderBottom: "1px solid #111",
            height: 50,
          }}
        >
          <IconButton style={{ marginLeft: 5 }} onClick={() => onBack()}>
            <NavigateBefore />
          </IconButton>
          <Typography
            sx={{
              overflow: "hidden",
              textOverflow: "ellipsis",
              marginLeft: "10px",
            }}
          >
            {title}
          </Typography>
          <form
            onSubmit={(event) => {
              event.preventDefault();
              onSearch();
            }}
            style={{ marginLeft: "auto", marginRight: 10 }}
          >
            <TextField
              ref={searchRef}
              placeholder="Search..."
              value={searchContent}
              onChange={(event) => {
                setSearchContent(event.target.value);
                setShowFilterMenu(true);
              }}
              onFocus={() => setShowFilterMenu(true)}
              style={{ width: 250 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search />
                  </InputAdornment>
                ),
                endAdornment: searchContent && (
                  <IconButton onClick={() => setSearchContent("")} size="small">
                    <Clear />
                  </IconButton>
                ),
              }}
              size="small"
            />
            {showFilterMenu && (
              <Popper
                anchorEl={searchRef.current}
                open={showFilterMenu}
                placement="bottom-end"
                ref={filterMenuRef}
              >
                <Paper
                  style={{ padding: "10px 10px", backgroundColor: "#111" }}
                >
                  <form
                    onSubmit={(event) => {
                      event.preventDefault();
                      onSearch();
                    }}
                  >
                    <Typography>From</Typography>
                    <div style={{ display: "flex", marginTop: 5 }}>
                      <DatePicker
                        label="Start Date"
                        value={searchStartDate}
                        onChange={(newValue) => setSearchStartDate(newValue)}
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            style={{ width: 160 }}
                            size="small"
                          />
                        )}
                        disableOpenPicker
                      />
                      <TimePicker
                        label="Start Time"
                        value={searchStartTime}
                        onChange={(newValue) => setSearchStartTime(newValue)}
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            style={{ width: 150, marginLeft: 5 }}
                            size="small"
                          />
                        )}
                        disableOpenPicker
                      />
                    </div>
                    <Typography style={{ marginTop: 10 }}>To</Typography>
                    <div style={{ display: "flex", marginTop: 5 }}>
                      <DatePicker
                        label="End Date"
                        value={searchEndDate}
                        onChange={(newValue) => setSearchEndDate(newValue)}
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            style={{ width: 160 }}
                            size="small"
                          />
                        )}
                        disableOpenPicker
                      />
                      <TimePicker
                        label="End Time"
                        value={searchEndTime}
                        onChange={(newValue) => setSearchEndTime(newValue)}
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            style={{ width: 150, marginLeft: 5 }}
                            size="small"
                          />
                        )}
                        disableOpenPicker
                      />
                    </div>
                    <div style={{ display: "flex", justifyContent: "end" }}>
                      <Button
                        type="submit"
                        variant="contained"
                        style={{ marginTop: 20 }}
                      >
                        Save
                      </Button>
                    </div>
                  </form>
                </Paper>
              </Popper>
            )}
          </form>
        </div>
      )}
      <div style={{ display: "flex", wordBreak: "break-all" }}>
        {messages ? (
          <List
            style={{
              overflowY: "scroll",
              maxHeight: 550,
              height: "100%",
              padding: 0,
            }}
            onScroll={(event) => loadMoreMessages(event)}
            dense
          >
            {messages.map((message) => (
              <MessageItem message={message} />
            ))}
            <div ref={messagesEndRef} />
          </List>
        ) : (
          <LinearProgress />
        )}
        {showSearchResults && (
          <div
            style={{
              backgroundColor: "#333",
              maxWidth: 350,
              minWidth: 350,
              minHeight: "100%",
            }}
          >
            {searchResults ? (
              <>
                <List
                  style={{
                    overflowY: "scroll",
                    maxHeight: 550,
                    padding: 0,
                  }}
                  onScroll={(event) => loadMoreSearchResults(event)}
                  dense
                >
                  {searchResults.data.map((message) => (
                    <ListItem key={message.id} disablePadding>
                      <div>
                        <Avatar
                          src={
                            message.authorAvatar
                              ? `https://cdn.discordapp.com/avatars/${message.authorId}/${message.authorAvatar}`
                              : "app-logos/discord.png"
                          }
                        />
                        <Typography>{message.content}</Typography>
                      </div>
                    </ListItem>
                  ))}
                </List>
              </>
            ) : (
              <LinearProgress />
            )}
          </div>
        )}
      </div>
    </div>
  );
}

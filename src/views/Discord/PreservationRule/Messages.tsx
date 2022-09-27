import { Cancel, Clear, NavigateBefore, Search } from "@mui/icons-material";
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
} from "@mui/material";
import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { DatePicker, TimePicker } from "@mui/x-date-pickers";
import { Dispatch } from "../../../redux";
import { ActionType } from "../../../redux/messages/actions";
import { Message } from "../../../../api/messages";
import {
  getMessages,
  getSearchResults,
  getSearchStatus,
} from "../../../redux/messages/selectors";
import { SearchResult } from "../../../redux/messages/state";
import { combineDateAndTime } from "../../../utils";

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
  const searchResultsEndRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);
  const filterMenuRef = useRef<HTMLDivElement>(null);
  const startDateRef = useRef<HTMLDivElement>(null);

  const allMessages = useSelector(getMessages);
  const allSearchResults = useSelector(getSearchResults);
  const searchStatus = useSelector(getSearchStatus);

  const messages = allMessages[preservationRuleId]?.[channelId];
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

  const prevMessagesRef = useRef<Message[]>();
  useEffect(() => {
    if (!prevMessagesRef.current && messages) {
      messagesEndRef.current?.scrollIntoView({ block: "nearest" });
    }
    prevMessagesRef.current = messages ?? undefined;
  }, [messages]);

  const prevSearchResultsRef = useRef<SearchResult>();
  useEffect(() => {
    if (!prevSearchResultsRef.current && searchResults) {
      searchResultsEndRef.current?.scrollIntoView({ block: "nearest" });
    }
    prevSearchResultsRef.current = searchResults ?? undefined;
  }, [searchResults]);

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
                  style={{ padding: "10px 10px", backgroundColor: "#222" }}
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
            }}
            dense
          >
            {messages.map((message) => (
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
            <div ref={messagesEndRef} />
          </List>
        ) : (
          <LinearProgress />
        )}
        {showSearchResults && (
          <div
            style={{
              backgroundColor: "#111",
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
                  }}
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
                  <div ref={searchResultsEndRef} />
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

import { Clear, Close, NavigateBefore, Search } from "@mui/icons-material";
import {
  IconButton,
  Typography,
  List,
  LinearProgress,
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
import { DiscordMessage } from "../../../../api/messages";
import {
  getMessages,
  getSearchResults,
  getSearchStatus,
} from "../../../redux/messages/selectors";
import { combineDateAndTime } from "../../../utils";
import "./Messages.css";
import { LoadingMessageItem, MessageItem } from "./MessageItem";
import { useIsInViewport } from "../../../hooks/useIsInViewport";

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
  const dispatch = useDispatch<Dispatch>();

  const [searchContent, setSearchContent] = useState<string>("");
  const [searchStartDate, setSearchStartDate] = useState<Date | null>(null);
  const [searchStartTime, setSearchStartTime] = useState<Date | null>(null);
  const [searchEndDate, setSearchEndDate] = useState<Date | null>(null);
  const [searchEndTime, setSearchEndTime] = useState<Date | null>(null);
  const [showSearchResults, setShowSearchResults] = useState<boolean>(false);
  const [showFilterMenu, setShowFilterMenu] = useState<boolean>(false);

  const messagesStartRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const searchResultsEndRef = useRef<HTMLDivElement>(null);
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
  const searchResultMessages = searchResults?.data as
    | DiscordMessage[]
    | null
    | undefined;

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

  const isMessageStartRefInViewport = useIsInViewport(messagesStartRef);
  useEffect(() => {
    if (isMessageStartRefInViewport && messages?.[0]) {
      dispatch({
        type: ActionType.fetchStart,
        payload: {
          preservationRuleId,
          channelId,
          cursor: { before: messages[0].id },
        },
      });
    }
  }, [isMessageStartRefInViewport]);

  const isSearchResultsEndRefInViewport = useIsInViewport(searchResultsEndRef);
  useEffect(() => {
    if (
      isSearchResultsEndRefInViewport &&
      searchResults?.data[searchResults.data.length - 1]
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
  }, [isSearchResultsEndRefInViewport]);

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
      <div style={{ display: "flex", wordWrap: "break-word" }}>
        {messages ? (
          <List
            style={{
              overflowY: "scroll",
              maxHeight: 550,
              height: "100%",
              width: "100%",
              padding: 0,
            }}
            dense
          >
            <LoadingMessageItem />
            <LoadingMessageItem />
            <LoadingMessageItem />
            <LoadingMessageItem ref={messagesStartRef} />
            {messages.map((message) => (
              <MessageItem key={message.id} message={message} />
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
            <div
              style={{
                display: "flex",
                alignItems: "center",
                height: 35,
                justifyContent: "space-between",
                padding: "0 10px",
                background: "#222",
                borderBottom: "1px solid #111",
              }}
            >
              <Typography>
                {searchResults?.totalCount
                  ? `${searchResults.totalCount} results`
                  : ""}
              </Typography>
              <Close
                style={{ cursor: "pointer" }}
                onClick={() => setShowSearchResults(false)}
              />
            </div>
            {searchResultMessages ? (
              <>
                <List
                  style={{
                    overflowY: "scroll",
                    maxHeight: 515,
                    padding: "0 10px",
                  }}
                  dense
                >
                  {searchResultMessages.map((message) => (
                    <MessageItem
                      key={message.id}
                      message={message}
                      isSearchResult
                    />
                  ))}
                  {!searchResults?.isLastPage && (
                    <>
                      <LoadingMessageItem
                        ref={searchResultsEndRef}
                        isSearchResult
                      />
                      <LoadingMessageItem isSearchResult />
                      <LoadingMessageItem isSearchResult />
                      <LoadingMessageItem isSearchResult />
                    </>
                  )}
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

import {
  ArrowDownward,
  Clear,
  Close,
  NavigateBefore,
  Search,
} from "@mui/icons-material";
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
  Card,
} from "@mui/material";
import { useContext, useEffect, useMemo, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { DatePicker, TimePicker } from "@mui/x-date-pickers";
import { Dispatch } from "../../../redux";
import { ActionType } from "../../../redux/messages/actions";
import { DiscordMessage } from "../../../api/messages";
import {
  getFetchStatus,
  getJumpStatus,
  getMessages,
  getSearchResults,
  getSearchStatus,
} from "../../../redux/messages/selectors";
import { combineDateAndTime } from "../../../utils";
import "./Messages.css";
import { LoadingMessageItem, MessageItem } from "./MessageItem";
import { useIsInViewport } from "../../../hooks/useIsInViewport";
import { AlertContext } from "../../../Alerts";
import { LoadingButton } from "@mui/lab";

const APP_URL =
  process.env.NODE_ENV === "development"
    ? "http://localhost:3000"
    : "https://www.preserve.dev";

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

  const messagesRef = useRef<HTMLUListElement>(null);
  const searchResultsRef = useRef<HTMLUListElement>(null);
  const messagesStartRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const searchResultsEndRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);
  const filterMenuRef = useRef<HTMLDivElement>(null);

  const messagesScrollDistanceFromBottom = useRef<number>();
  const messagesScrollDistanceFromTop = useRef<number>();
  const searchResultsScrollDistanceFromTop = useRef<number>();

  const allMessages = useSelector(getMessages);
  const allSearchResults = useSelector(getSearchResults);
  const fetchStatus = useSelector(getFetchStatus);
  const jumpStatus = useSelector(getJumpStatus);
  const searchStatus = useSelector(getSearchStatus);

  const { showAlert } = useContext(AlertContext);

  const messagesResult = allMessages[preservationRuleId]?.[channelId];
  const messages = messagesResult?.data as DiscordMessage[] | null | undefined;
  const searchResults = allSearchResults[preservationRuleId]?.[channelId];
  const searchResultMessages = searchResults?.data as
    | DiscordMessage[]
    | null
    | undefined;

  useEffect(() => {
    dispatch({
      type: ActionType.fetchStart,
      payload: { preservationRuleId, channelId },
    });

    const onClick = (event: MouseEvent) => {
      if (
        !searchRef.current?.contains(event.target as any) &&
        !filterMenuRef.current?.contains(event.target as any)
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

  const [firstSelectedMessageId, setFirstSelectedMessageId] = useState<
    number | null
  >(null);
  const [lastSelectedMessageId, setLastSelectedMessageId] = useState<
    number | null
  >(null);
  const firstSelectedMessageIndex = useMemo(() => {
    const index = messages?.findIndex(
      ({ id }) => id === firstSelectedMessageId
    );
    return index === -1 ? null : index;
  }, [messages, firstSelectedMessageId]);
  const lastSelectedMessageIndex = useMemo(() => {
    const index = messages?.findIndex(({ id }) => id === lastSelectedMessageId);
    return index === -1 ? null : index;
  }, [messages, lastSelectedMessageId]);
  const setFirstSelectedMessageIndex = (index: number) => {
    const message = messages?.[index];
    if (message) {
      setFirstSelectedMessageId(message.id);
    }
  };
  const setLastSelectedMessageIndex = (index: number) => {
    const message = messages?.[index];
    if (message) {
      setLastSelectedMessageId(message.id);
    }
  };
  useEffect(() => {
    setFirstSelectedMessageId(null);
    setLastSelectedMessageId(null);
  }, [jumpStatus, visible]);

  const scrollMessagesToHeight = (height: number) => {
    messagesRef?.current?.scrollTo(0, height);
  };

  const prevMessages = useRef<DiscordMessage[] | null | undefined>();
  useEffect(() => {
    if (fetchStatus === "success") {
      if (!prevMessages.current) {
        scrollMessagesToHeight(messagesRef.current?.scrollHeight ?? 0);
      } else if (prevMessages.current?.[0]?.id !== messages?.[0]?.id) {
        // If first element of messages has changed
        scrollMessagesToHeight(
          (messagesRef.current?.scrollHeight ?? 0) -
            (messagesScrollDistanceFromBottom.current ?? 0)
        );
      } else {
        scrollMessagesToHeight(messagesScrollDistanceFromTop.current ?? 0);
      }
    }
    prevMessages.current = messages;
  }, [fetchStatus]);
  useEffect(() => {
    if (searchStatus === "success") {
      searchResultsRef.current?.scrollTo(
        0,
        searchResultsScrollDistanceFromTop.current ?? 0
      );
    }
  }, [searchStatus]);

  const isMessageStartRefInViewport = useIsInViewport(messagesStartRef, [
    fetchStatus,
  ]);
  useEffect(() => {
    if (
      jumpStatus !== "pending" &&
      isMessageStartRefInViewport &&
      !messagesResult?.isLastPageBefore &&
      messages?.[0]
    ) {
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

  const isMessageEndRefInViewport = useIsInViewport(messagesEndRef, [
    fetchStatus,
  ]);
  useEffect(() => {
    if (
      jumpStatus !== "pending" &&
      isMessageEndRefInViewport &&
      !messagesResult?.isLastPageAfter &&
      messages?.[messages.length - 1]
    ) {
      dispatch({
        type: ActionType.fetchStart,
        payload: {
          preservationRuleId,
          channelId,
          cursor: { after: messages[messages.length - 1]?.id },
        },
      });
    }
  }, [isMessageEndRefInViewport]);

  const isSearchResultsEndRefInViewport = useIsInViewport(searchResultsEndRef, [
    searchStatus,
  ]);
  useEffect(() => {
    if (
      isSearchResultsEndRefInViewport &&
      !searchResults?.isLastPage &&
      searchResultMessages?.[searchResultMessages.length - 1]
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
          before: searchResultMessages[searchResultMessages.length - 1]?.id,
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

  const [isCreatingSnippet, setIsCreatingSnippet] = useState(false);
  const onPreserve = async () => {
    if (
      !messages ||
      firstSelectedMessageIndex == null ||
      lastSelectedMessageIndex == null
    ) {
      return;
    }
    setIsCreatingSnippet(true);
    try {
      const snippetId = await window.api.snippets.createSnippet(
        "discord",
        messages
          .slice(firstSelectedMessageIndex, lastSelectedMessageIndex + 1)
          .map((message) => ({
            content: message.content,
            sentAt: message.sentAt,
            attachments: message.appSpecificData?.attachments?.map(
              (attachment) => ({
                type: attachment.content_type ?? "file",
                url: attachment.url,
                width: attachment.width,
                height: attachment.height,
                size: attachment.size,
              })
            ),
            authorUsername: message.authorName,
            authorAvatarUrl: message.authorAvatar
              ? `https://cdn.discordapp.com/avatars/${message.authorId}/${message.authorAvatar}`
              : undefined,
          }))
      );
      window.api.urls.openExternal(`${APP_URL}/p/${snippetId}`);
    } catch (err) {
      showAlert({ type: "error", message: "Failed to create snippet" });
    }
    setIsCreatingSnippet(false);
    setFirstSelectedMessageId(null);
    setLastSelectedMessageId(null);
  };

  return (
    <div
      style={{
        backgroundColor: "#222",
        width: visible ? "100%" : 0,
      }}
    >
      {firstSelectedMessageIndex != null && lastSelectedMessageIndex != null && (
        <Card
          style={{
            position: "fixed",
            bottom: 20,
            left: "50%",
            transform: "translateX(-50%)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            padding: "20px 20px",
            zIndex: 9999,
          }}
        >
          <Typography variant="h5">
            {lastSelectedMessageIndex - firstSelectedMessageIndex + 1} selected
          </Typography>
          <div style={{ marginTop: 10 }}>
            <Button
              variant="text"
              size="large"
              onClick={() => {
                setFirstSelectedMessageId(null);
                setLastSelectedMessageId(null);
              }}
              disabled={isCreatingSnippet}
            >
              Cancel
            </Button>
            <LoadingButton
              variant="contained"
              style={{ marginLeft: 10 }}
              size="large"
              onClick={() => onPreserve()}
              disabled={isCreatingSnippet}
              loading={isCreatingSnippet}
            >
              Preserve it!
            </LoadingButton>
          </div>
        </Card>
      )}
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
      <div style={{ display: "flex", wordWrap: "break-word", height: "100%" }}>
        {messages ? (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "flex-end",
              maxWidth: showSearchResults ? 500 : 850,
              minWidth: showSearchResults ? 500 : 850,
              height: 500,
              position: "relative",
            }}
          >
            {messagesResult && !messagesResult.isLastPageAfter && (
              <div
                style={{
                  position: "absolute",
                  bottom: 0,
                  width: showSearchResults ? 500 : 850,
                  background: "#111",
                  opacity: 0.9,
                  borderRadius: "16px 16px 0 0",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  height: 25,
                  cursor: "pointer",
                  zIndex: 1,
                }}
                onClick={() =>
                  dispatch({
                    type: ActionType.fetchStart,
                    payload: { preservationRuleId, channelId },
                  })
                }
              >
                <Typography style={{ fontWeight: 500 }}>
                  Back to present
                </Typography>
                <ArrowDownward fontSize="small" />
              </div>
            )}
            {!messages.length && (
              <div
                style={{
                  display: "flex",
                  height: "100%",
                  width: "100%",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <Typography>There are no messages to display.</Typography>
              </div>
            )}
            <List
              ref={messagesRef}
              style={{
                overflowY: "scroll",
                maxHeight: 500,
                width: "calc(100% + 35px)",
                transform: "translateX(-35px)",
                padding: 0,
                paddingLeft: 35,
              }}
              onScroll={(event) => {
                const target = event.target as HTMLUListElement;
                messagesScrollDistanceFromBottom.current =
                  target.scrollHeight - target.scrollTop;
                messagesScrollDistanceFromTop.current = target.scrollTop;
              }}
              dense
            >
              {messagesResult && !messagesResult.isLastPageBefore && (
                <>
                  <LoadingMessageItem />
                  <LoadingMessageItem />
                  <LoadingMessageItem />
                  <LoadingMessageItem ref={messagesStartRef} />
                </>
              )}
              {messages.map((message, index) => (
                <MessageItem
                  key={message.id}
                  index={index}
                  message={message}
                  totalMessages={messages.length}
                  scrollMessagesToHeight={scrollMessagesToHeight}
                  firstSelectedMessageIndex={firstSelectedMessageIndex}
                  lastSelectedMessageIndex={lastSelectedMessageIndex}
                  setFirstSelectedMessageIndex={setFirstSelectedMessageIndex}
                  setLastSelectedMessageIndex={setLastSelectedMessageIndex}
                />
              ))}
              {messagesResult && !messagesResult.isLastPageAfter && (
                <>
                  <LoadingMessageItem ref={messagesEndRef} />
                  <LoadingMessageItem />
                  <LoadingMessageItem />
                  <LoadingMessageItem />
                </>
              )}
            </List>
          </div>
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
                {searchResults?.totalCount != null
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
                  ref={searchResultsRef}
                  style={{
                    overflowY: "scroll",
                    maxHeight: 465,
                    padding: "0 10px",
                  }}
                  onScroll={(event) => {
                    const target = event.target as HTMLUListElement;
                    searchResultsScrollDistanceFromTop.current =
                      target.scrollTop;
                  }}
                  dense
                >
                  {searchResultMessages.map((message, index) => (
                    <MessageItem
                      key={message.id}
                      index={index}
                      totalMessages={searchResultMessages.length}
                      message={message}
                      scrollMessagesToHeight={scrollMessagesToHeight}
                      isSearchResult
                    />
                  ))}
                  {searchResults && !searchResults.isLastPage && (
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

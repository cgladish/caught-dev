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

  const [messagesElem, setMessagesElem] = useState<HTMLUListElement | null>(
    null
  );
  const [searchResultsElem, setSearchResultsElem] =
    useState<HTMLUListElement | null>(null);

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

  const messagesResult = allMessages[preservationRuleId]?.[channelId];
  const messages = messagesResult?.data as DiscordMessage[] | null | undefined;
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

  const prevMessages = useRef<DiscordMessage[] | null | undefined>();
  useEffect(() => {
    if (fetchStatus === "success") {
      // If first element of messages has changed
      if (prevMessages.current?.[0]?.id !== messages?.[0]?.id) {
        messagesElem?.scrollTo(
          0,
          messagesElem.scrollHeight -
            (messagesScrollDistanceFromBottom.current ?? 0)
        );
      } else {
        messagesElem?.scrollTo(0, messagesScrollDistanceFromTop.current ?? 0);
      }
    }
    prevMessages.current = messages;
  }, [fetchStatus]);
  useEffect(() => {
    if (searchStatus === "success") {
      searchResultsElem?.scrollTo(
        0,
        searchResultsScrollDistanceFromTop.current ?? 0
      );
    }
  }, [searchStatus]);

  const isMessageStartRefInViewport = useIsInViewport(messagesStartRef);
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

  const isMessageEndRefInViewport = useIsInViewport(messagesEndRef);
  useEffect(() => {
    console.log(
      jumpStatus !== "pending",
      isMessageEndRefInViewport,
      !messagesResult?.isLastPageAfter,
      messages?.[messages.length - 1]
    );
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

  const isSearchResultsEndRefInViewport = useIsInViewport(searchResultsEndRef);
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
            ref={(node) => setMessagesElem(node)}
            style={{
              overflowY: "scroll",
              maxHeight: 550,
              height: "100%",
              width: "100%",
              padding: 0,
            }}
            onScroll={(event) => {
              const target = event.target as HTMLUListElement;
              messagesScrollDistanceFromBottom.current =
                target.scrollHeight - target.scrollTop;
              messagesScrollDistanceFromTop.current = target.scrollTop;
            }}
            dense
          >
            {!messagesResult?.isLastPageBefore && (
              <>
                <LoadingMessageItem />
                <LoadingMessageItem />
                <LoadingMessageItem />
                <LoadingMessageItem ref={messagesStartRef} />
              </>
            )}
            {messages.map((message) => (
              <MessageItem key={message.id} message={message} />
            ))}
            {!messagesResult?.isLastPageAfter && (
              <>
                <LoadingMessageItem ref={messagesEndRef} />
                <LoadingMessageItem />
                <LoadingMessageItem />
                <LoadingMessageItem />
              </>
            )}
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
                  ref={(node) => setSearchResultsElem(node)}
                  style={{
                    overflowY: "scroll",
                    maxHeight: 515,
                    padding: "0 10px",
                  }}
                  onScroll={(event) => {
                    const target = event.target as HTMLUListElement;
                    searchResultsScrollDistanceFromTop.current =
                      target.scrollTop;
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

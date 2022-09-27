import { NavigateBefore, Search } from "@mui/icons-material";
import {
  IconButton,
  Typography,
  List,
  LinearProgress,
  useTheme,
  Avatar,
  ListItem,
  ListItemAvatar,
  ListItemText,
  TextField,
  Button,
  InputAdornment,
} from "@mui/material";
import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Dispatch } from "../../../redux";
import { ActionType } from "../../../redux/messages/actions";
import { Message } from "../../../../api/messages";
import {
  getMessages,
  getSearchResults,
  getSearchStatus,
} from "../../../redux/messages/selectors";
import { SearchResult } from "../../../redux/messages/state";

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
  const [searchEndDate, setSearchEndDate] = useState<Date | null>(null);
  const [showSearchResults, setShowSearchResults] = useState<boolean>(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const searchResultsEndRef = useRef<HTMLDivElement>(null);

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
        filter: { content: searchContent || undefined },
      },
    });
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
            backgroundColor: primary.dark,
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
              fontSize: "0.875rem",
            }}
          >
            {title}
          </Typography>
          <form
            onSubmit={(event) => {
              event.preventDefault();
              onSearch();
            }}
          >
            <TextField
              label="Search..."
              type="search"
              value={searchContent}
              onChange={(event) => setSearchContent(event.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search />
                  </InputAdornment>
                ),
              }}
              size="small"
            />
            <Button
              type="submit"
              variant="contained"
              style={{ marginLeft: 20 }}
            >
              Submit
            </Button>
          </form>
        </div>
      )}
      <div style={{ display: "flex" }}>
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
                <ListItemAvatar>
                  <Avatar
                    src={
                      message.authorAvatar
                        ? `https://cdn.discordapp.com/avatars/${message.authorId}/${message.authorAvatar}`
                        : "app-logos/discord.png"
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
                  {message.content}
                </ListItemText>
              </ListItem>
            ))}
            <div ref={messagesEndRef} />
          </List>
        ) : (
          <LinearProgress />
        )}
        {showSearchResults && (
          <div style={{ backgroundColor: "#111", width: 300, height: "100%" }}>
            {searchResults ? (
              <>
                <List
                  style={{
                    overflowY: "scroll",
                    maxHeight: 550,
                  }}
                  dense
                >
                  {searchResults.data.map((message) => (
                    <ListItem key={message.id} disablePadding>
                      <ListItemAvatar>
                        <Avatar
                          src={
                            message.authorAvatar
                              ? `https://cdn.discordapp.com/avatars/${message.authorId}/${message.authorAvatar}`
                              : "app-logos/discord.png"
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
                        {message.content}
                      </ListItemText>
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

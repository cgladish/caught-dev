import { NavigateBefore } from "@mui/icons-material";
import {
  IconButton,
  Typography,
  List,
  LinearProgress,
  useTheme,
  Avatar,
  ListItem,
  ListItemAvatar,
  ListItemButton,
  ListItemText,
} from "@mui/material";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Dispatch } from "../../../redux";
import { ActionType } from "../../../redux/messages/actions";
import {
  getMessages,
  getSearchResults,
} from "../../../redux/messages/selectors";

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

  const allMessages = useSelector(getMessages);
  const allSearchResults = useSelector(getSearchResults);

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

  return (
    <div
      style={{
        backgroundColor: "#222",
        height: visible ? "100%" : 0,
        width: visible ? "100%" : 0,
      }}
    >
      {messages ? (
        <>
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
            </div>
          )}
          <List
            style={{
              overflowY: "scroll",
              maxHeight: 550,
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
          </List>
        </>
      ) : (
        <LinearProgress />
      )}
    </div>
  );
}

import { NavigateBefore } from "@mui/icons-material";
import {
  IconButton,
  Typography,
  List,
  LinearProgress,
  useTheme,
} from "@mui/material";

export default function Messages({
  visible,
  loading,
  title,
  onBack,
}: {
  visible: boolean;
  loading: boolean;
  title: string;
  onBack: () => void;
}) {
  const {
    palette: { primary },
  } = useTheme();

  return (
    <div
      style={{
        backgroundColor: "#222",
        height: visible ? "100%" : 0,
        width: visible ? "100%" : 0,
      }}
    >
      {!loading ? (
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
            {/*
                {filteredDmChannels.map((dmChannel) => (
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
                        */}
          </List>
        </>
      ) : (
        <LinearProgress />
      )}
    </div>
  );
}

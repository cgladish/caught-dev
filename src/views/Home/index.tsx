import { Button, Typography, useTheme } from "@mui/material";

export default function Home() {
  const {
    palette: {
      primary: { main },
    },
  } = useTheme();
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        width: "100%",
        height: "100%",
        padding: "20px 20px",
      }}
    >
      <Typography variant="h4" fontWeight={700}>
        Welcome to Preserve.dev!
      </Typography>
      <br />
      <Typography>
        To view your saved snippest and snippets shared by the community, visit
        the web app.
      </Typography>
      <br />
      <Button
        variant="contained"
        onClick={() => window.api.urls.openExternal("https://www.preserve.dev")}
        size="large"
      >
        Go to Web App
      </Button>
    </div>
  );
}

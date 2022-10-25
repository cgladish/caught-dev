import { Card, Typography, Button } from "@mui/material";
import discordLogo from "../../assets/app-logos/discord.png";

export default function Login() {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        width: "100%",
        height: "100%",
      }}
    >
      <Card
        style={{
          width: 400,
          height: 250,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <img
          src={discordLogo}
          width={50}
          alt="discord"
          style={{ marginBottom: 20 }}
        />
        <Typography style={{ marginBottom: 20 }}>
          Log in with Discord to start saving messages
        </Typography>
        <Button
          variant="contained"
          size="large"
          onClick={() => {
            window.open(
              "https://discord.com/login",
              "_blank",
              "width=1000,height=600"
            );
          }}
        >
          Log in
        </Button>
      </Card>
    </div>
  );
}

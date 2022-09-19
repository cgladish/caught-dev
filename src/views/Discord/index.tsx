import Card from "@mui/material/Card";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";

export default function Discord() {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        width: "100%",
        height: "100vh",
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
          src="/app-logos/discord.png"
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

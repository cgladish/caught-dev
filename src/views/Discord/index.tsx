import React from "react";
import Button from "@mui/material/Button";

export default function Discord() {
  return (
    <Button
      onClick={() => {
        window.open(
          "https://discord.com/login",
          "_blank",
          "width=1000,height=600"
        );
      }}
    >
      Log in with Discord
    </Button>
  );
}

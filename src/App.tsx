import React from "react";
import { Button } from "@mui/material";
import { useEffect } from "react";
import "./App.css";

function App() {
  useEffect(() => {
    (async () => {
      console.log(
        await (window as any).api.serviceAuth.fetchAuthentication("discord")
      );
    })();
  }, []);
  return (
    <div className="App">
      <header className="App-header">
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
      </header>
    </div>
  );
}

export default App;

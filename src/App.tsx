import { Button } from "@mui/material";
import "./App.css";

function App() {
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

import React from "react";
import { HashRouter, Link, Route, Routes, useLocation } from "react-router-dom";
import { createTheme } from "@mui/material/styles";
import Box from "@mui/material/Box";
import CssBaseline from "@mui/material/CssBaseline";
import Divider from "@mui/material/Divider";
import Drawer from "@mui/material/Drawer";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import HomeIcon from "@mui/icons-material/Home";
import { ThemeProvider } from "@emotion/react";
import Discord from "./views/Discord";
import Home from "./views/Home";
import { ListSubheader } from "@mui/material";

const theme = createTheme({
  palette: {
    mode: "dark",
    primary: {
      main: "#663399",
    },
    text: {
      primary: "#eee",
    },
  },
});

const drawerWidth = 240;

const MenuLink = (props: {
  to: string;
  text: string;
  iconElement: React.ReactElement;
}) => {
  const location = useLocation();
  return (
    <ListItem disablePadding>
      <ListItemButton
        component={Link}
        to={props.to}
        selected={location.pathname === props.to}
      >
        <ListItemIcon>{props.iconElement}</ListItemIcon>
        <ListItemText primary={props.text} />
      </ListItemButton>
    </ListItem>
  );
};

function App() {
  return (
    <HashRouter>
      <ThemeProvider theme={theme}>
        <Box sx={{ display: "flex" }}>
          <CssBaseline />
          <Drawer
            sx={{
              width: drawerWidth,
              flexShrink: 0,
              "& .MuiDrawer-paper": {
                width: drawerWidth,
                boxSizing: "border-box",
              },
            }}
            variant="permanent"
            anchor="left"
          >
            <List>
              <MenuLink to="/" text="Home" iconElement={<HomeIcon />} />
            </List>
            <Divider />
            <List>
              <ListSubheader>APPLICATIONS</ListSubheader>
              <MenuLink
                to="/apps/discord"
                text="Discord"
                iconElement={
                  <img src="/app-logos/discord.png" alt="discord" height={25} />
                }
              />
            </List>
          </Drawer>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/apps/discord" element={<Discord />} />
          </Routes>
        </Box>
      </ThemeProvider>
    </HashRouter>
  );
}

export default App;

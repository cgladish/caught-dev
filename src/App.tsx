import React from "react";
import { HashRouter, Link, Route, Routes, useLocation } from "react-router-dom";
import { Provider } from "react-redux";
import { store } from "./redux";
import Alerts from "./Alerts";
import { Home } from "@mui/icons-material";
import {
  createTheme,
  ThemeProvider,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Box,
  CssBaseline,
  Drawer,
  List,
  Divider,
  ListSubheader,
} from "@mui/material";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import Discord from "./views/Discord";

const theme = createTheme({
  palette: {
    mode: "dark",
    primary: {
      main: "#A45EE5",
      dark: "#52168b",
    },
    text: {
      primary: "#eee",
    },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundImage:
            "radial-gradient(circle at 10% 20%, rgb(20, 20, 20) 0%, rgb(10, 10, 10) 90.2%);",
        },
        "&::-webkit-scrollbar": {
          width: 10,
        },
        "&::-webkit-scrollbar-track": {
          boxShadow: `inset 0 0 6px rgba(0, 0, 0, 0.3)`,
        },
        "&::-webkit-scrollbar-thumb": {
          backgroundColor: "#A45EE5",
          borderRadius: 6,
        },
      },
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
        selected={
          props.to === "/"
            ? location.pathname === "/"
            : location.pathname.startsWith(props.to)
        }
      >
        <ListItemIcon>{props.iconElement}</ListItemIcon>
        <ListItemText primary={props.text} />
      </ListItemButton>
    </ListItem>
  );
};

function App() {
  return (
    <Provider store={store}>
      <HashRouter>
        <LocalizationProvider dateAdapter={AdapterDateFns}>
          <ThemeProvider theme={theme}>
            <Alerts>
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
                    <MenuLink to="/" text="Home" iconElement={<Home />} />
                  </List>
                  <Divider />
                  <List>
                    <ListSubheader>APPLICATIONS</ListSubheader>
                    <MenuLink
                      to="/apps/discord"
                      text="Discord"
                      iconElement={
                        <img
                          src="/app-logos/discord.png"
                          alt="discord"
                          height={25}
                        />
                      }
                    />
                  </List>
                </Drawer>
                <div
                  style={{
                    width: "100%",
                    height: "100vh",
                    paddingBottom: 50,
                    overflow: "auto",
                  }}
                >
                  <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/apps/discord/*" element={<Discord />} />
                  </Routes>
                </div>
              </Box>
            </Alerts>
          </ThemeProvider>
        </LocalizationProvider>
      </HashRouter>
    </Provider>
  );
}

export default App;

import { app, BrowserWindow, session } from "electron";
import isDev from "electron-is-dev";
import debounce from "lodash/debounce";
import path from "path";
import { saveAuthentication } from "../api/serviceAuth";

app.whenReady().then(() => {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    autoHideMenuBar: true,
    webPreferences: {
      nodeIntegration: false,
      preload: path.join(__dirname, "preload.js"),
    },
  });
  win.webContents.setWindowOpenHandler(() => {
    return {
      action: "allow",
      overrideBrowserWindowOptions: {
        autoHideMenuBar: true,
        webPreferences: { nodeIntegration: false },
      },
    };
  });
  if (isDev) {
    win.loadURL("http://localhost:3000");
    win.webContents.openDevTools({ mode: "detach" });
  } else {
    win.loadFile("public/index.html");
  }

  session.defaultSession.webRequest.onBeforeSendHeaders(
    {
      urls: ["*://discord.com/*/users/@me/*"],
    },
    debounce(async (details) => {
      const token = details.requestHeaders.Authorization;
      if (token) {
        await saveAuthentication("discord", token);
        BrowserWindow.getAllWindows().forEach((window) => {
          if (window.webContents.getURL().includes("discord")) {
            window.close();
          }
        });
      }
    }, 1000)
  );
});

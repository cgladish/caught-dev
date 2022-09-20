import { app, BrowserWindow, session, ipcMain } from "electron";
import isDev from "electron-is-dev";
import debounce from "lodash/debounce";
import path from "path";
import { saveAuthentication, deleteAuthentication } from "../api/appLogin";
import { fetchChannels, fetchGuilds, fetchUserInfo } from "../api/discord";

const startApiListener = (moduleName: string, func: Function) => {
  ipcMain.handle(`@@${moduleName}/${func.name}`, async (event, ...args) => {
    try {
      const result = await func(...args);
      return {
        data: result,
        error: null,
      };
    } catch (err) {
      console.error(err);
      return {
        data: null,
        error: (err as Error)?.toString?.() ?? "Error",
      };
    }
  });
};

startApiListener("appLogin", fetchUserInfo);
startApiListener("appLogin", deleteAuthentication);
startApiListener("discord", fetchGuilds);
startApiListener("discord", fetchChannels);

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
          if (window.webContents.getURL().includes("discord.com")) {
            window.close();
          }
        });
      }
    }, 1000)
  );
});

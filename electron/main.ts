import { app, BrowserWindow, session, ipcMain } from "electron";
import isDev from "electron-is-dev";
import debounce from "lodash/debounce";
import path from "path";
import cron from "node-cron";
import { saveAuthentication, deleteAuthentication } from "../api/appLogin";
import {
  fetchChannels,
  fetchDmChannels,
  fetchGuilds,
  fetchUserInfo,
} from "../api/discord";
import {
  addInitialBackupToQueue,
  addRegularBackupToQueue,
  getBackupProgress,
  isRegularBackupInProgress,
  searchMessages,
  fetchMessages,
} from "../api/messages";
import {
  createPreservationRule,
  deletePreservationRule,
  fetchCompletePreservationRules,
  fetchIncompletePreservationRules,
  fetchPreservationRules,
  updatePreservationRule,
} from "../api/preservationRules";

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
startApiListener("discord", fetchDmChannels);
startApiListener("preservationRules", createPreservationRule);
startApiListener("preservationRules", updatePreservationRule);
startApiListener("preservationRules", deletePreservationRule);
startApiListener("preservationRules", fetchPreservationRules);
startApiListener("messages", getBackupProgress);
startApiListener("messages", searchMessages);
startApiListener("messages", fetchMessages);

app.whenReady().then(async () => {
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

  const incompletePreservationRules = await fetchIncompletePreservationRules();
  incompletePreservationRules.forEach((preservationRule) => {
    if (preservationRule.appName === "discord") {
      addInitialBackupToQueue(preservationRule);
    }
  });

  cron.schedule("*/1 * * * *", async () => {
    if (isRegularBackupInProgress) {
      return;
    }
    console.log("running regular backup");
    const completePreservationRules = await fetchCompletePreservationRules();
    completePreservationRules.forEach((preservationRule) => {
      if (preservationRule.appName === "discord") {
        addRegularBackupToQueue(preservationRule);
      }
    });
  });
});

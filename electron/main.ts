import { app, BrowserWindow, session, ipcMain, Menu, Tray } from "electron";
import isDev from "electron-is-dev";
import debounce from "lodash/debounce";
import path from "path";
import cron from "node-cron";
import { shell } from "electron";
import * as AppLoginApi from "../api/appLogin";
import * as DiscordApi from "../api/discord";
import * as MessagesApi from "../api/messages";
import * as PreservationRulesApi from "../api/preservationRules";
import * as ChannelsApi from "../api/channels";

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

startApiListener("urls", function openExternal(url: string) {
  shell.openExternal(url);
});
startApiListener("appLogin", DiscordApi.fetchUserInfo);
startApiListener("appLogin", AppLoginApi.deleteAuthentication);
startApiListener("discord", DiscordApi.fetchGuilds);
startApiListener("discord", DiscordApi.fetchChannels);
startApiListener("discord", DiscordApi.fetchDmChannels);
startApiListener(
  "preservationRules",
  PreservationRulesApi.createPreservationRule
);
startApiListener(
  "preservationRules",
  PreservationRulesApi.updatePreservationRule
);
startApiListener(
  "preservationRules",
  PreservationRulesApi.deletePreservationRule
);
startApiListener(
  "preservationRules",
  PreservationRulesApi.fetchPreservationRules
);
startApiListener("messages", MessagesApi.getBackupProgress);
startApiListener("messages", MessagesApi.searchMessages);
startApiListener("messages", MessagesApi.fetchMessages);
startApiListener("channels", ChannelsApi.fetchChannels);

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

  if (process.platform === "win32") {
    let isQuitting = false;
    let hasShownBackgroundRunningBalloon = false;
    win.on("close", (event) => {
      if (!isQuitting) {
        event.preventDefault();
        win.hide();
        if (!hasShownBackgroundRunningBalloon) {
          trayIcon.displayBalloon({
            icon: "public/logo192.png",
            title: "Preserve.dev",
            content:
              "Application is running in the background. Messages will continue to be fetched and preserved.",
          });
          hasShownBackgroundRunningBalloon = true;
        }
      }
      return false;
    });
    const trayContextMenu = Menu.buildFromTemplate([
      {
        label: "Open Preserve.dev",
        click: () => win.show(),
      },
      {
        label: "Quit",
        click: () => {
          isQuitting = true;
          app.quit();
        },
      },
    ]);
    const trayIcon = new Tray("public/logo192.png");
    trayIcon.setToolTip("Preserve.dev");
    trayIcon.setContextMenu(trayContextMenu);
    trayIcon.on("click", () => win.show());
  }

  session.defaultSession.webRequest.onBeforeSendHeaders(
    {
      urls: ["*://discord.com/*/users/@me/*"],
    },
    debounce(async (details) => {
      const token = details.requestHeaders.Authorization;
      if (token) {
        await AppLoginApi.saveAuthentication("discord", token);
        BrowserWindow.getAllWindows().forEach((window) => {
          if (window.webContents.getURL().includes("discord.com")) {
            window.close();
          }
        });
      }
    }, 1000)
  );

  const incompletePreservationRules =
    await PreservationRulesApi.fetchIncompletePreservationRules();
  incompletePreservationRules.forEach((preservationRule) => {
    if (preservationRule.appName === "discord") {
      MessagesApi.addInitialBackupToQueue(preservationRule);
    }
  });

  cron.schedule("*/1 * * * *", async () => {
    if (MessagesApi.isRegularBackupInProgress) {
      return;
    }
    console.log("running regular backup");
    const completePreservationRules =
      await PreservationRulesApi.fetchCompletePreservationRules();
    completePreservationRules.forEach((preservationRule) => {
      if (preservationRule.appName === "discord") {
        MessagesApi.addRegularBackupToQueue(preservationRule);
      }
    });
  });
});

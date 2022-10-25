import { app, BrowserWindow, session, ipcMain, Menu, Tray } from "electron";
import debounce from "lodash/debounce";
import cron from "node-cron";
import { shell } from "electron";
import path from "path";
import icon from "./assets/icon-512.png";
import * as AppLoginApi from "./api/appLogin";
import * as DiscordApi from "./api/discord";
import * as MessagesApi from "./api/messages";
import * as PreservationRulesApi from "./api/preservationRules";
import * as ChannelsApi from "./api/channels";

declare const MAIN_WINDOW_WEBPACK_ENTRY: string;
declare const MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY: string;

if (require("electron-squirrel-startup")) app.quit();

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
      preload: MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY,
    },
    icon: path.resolve(__dirname, icon),
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
  win.loadURL(MAIN_WINDOW_WEBPACK_ENTRY);

  if (process.platform === "win32") {
    let isQuitting = false;
    let hasShownBackgroundRunningBalloon = false;
    win.on("close", (event) => {
      if (!isQuitting) {
        event.preventDefault();
        win.hide();
        if (!hasShownBackgroundRunningBalloon) {
          trayIcon.displayBalloon({
            icon: path.resolve(__dirname, icon),
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
    const trayIcon = new Tray(path.resolve(__dirname, icon));
    trayIcon.setToolTip("Preserve.dev");
    trayIcon.setContextMenu(trayContextMenu);
    trayIcon.on("click", () => win.show());
  }

  console.log("LKASJDFLKJASLK");

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

import {
  app,
  BrowserWindow,
  session,
  ipcMain,
  Menu,
  Tray,
  autoUpdater,
} from "electron";
import log from "electron-log";
import debounce from "lodash/debounce";
import cron from "node-cron";
import { shell } from "electron";
import path from "path";
import iconSmall from "./assets/icon-16.png";
import icon from "./assets/icon-512.png";
import * as AppLoginApi from "./api/appLogin";
import * as DiscordApi from "./api/discord";
import * as MessagesApi from "./api/messages";
import * as PreservationRulesApi from "./api/preservationRules";
import * as ChannelsApi from "./api/channels";
import * as WordCountsApi from "./api/wordCounts";

declare const MAIN_WINDOW_WEBPACK_ENTRY: string;
declare const MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY: string;

if (process.env.NODE_ENV !== "development") {
  autoUpdater.setFeedURL({
    url: `https://download.preserve.dev/update/${
      process.platform
    }/${app.getVersion()}`,
  });
}

if (require("electron-squirrel-startup")) {
  app.quit();
} else {
  const gotTheLock = app.requestSingleInstanceLock();
  if (!gotTheLock) {
    app.quit();
  } else {
    let win: BrowserWindow;
    app.on("second-instance", (event, commandLine, workingDirectory) => {
      // Someone tried to run a second instance, we should focus our window.
      if (win) {
        if (win.isMinimized()) win.restore();
        win.focus();
      }
    });

    const startApiListener = (
      moduleName: string,
      funcName: string,
      func: Function
    ) => {
      ipcMain.handle(`@@${moduleName}/${funcName}`, async (event, ...args) => {
        try {
          const result = await func(...args);
          return {
            data: result,
            error: null,
          };
        } catch (err) {
          log.error(err);
          return {
            data: null,
            error: (err as Error)?.toString?.() ?? "Error",
          };
        }
      });
    };

    startApiListener(
      "urls",
      "openExternal",
      function openExternal(url: string) {
        shell.openExternal(url);
      }
    );
    startApiListener("appLogin", "fetchUserInfo", DiscordApi.fetchUserInfo);
    startApiListener(
      "appLogin",
      "deleteAuthentication",
      AppLoginApi.deleteAuthentication
    );
    startApiListener("discord", "fetchGuilds", DiscordApi.fetchGuilds);
    startApiListener("discord", "fetchChannels", DiscordApi.fetchChannels);
    startApiListener("discord", "fetchDmChannels", DiscordApi.fetchDmChannels);
    startApiListener(
      "preservationRules",
      "createPreservationRule",
      PreservationRulesApi.createPreservationRule
    );
    startApiListener(
      "preservationRules",
      "updatePreservationRule",
      PreservationRulesApi.updatePreservationRule
    );
    startApiListener(
      "preservationRules",
      "deletePreservationRule",
      PreservationRulesApi.deletePreservationRule
    );
    startApiListener(
      "preservationRules",
      "fetchPreservationRules",
      PreservationRulesApi.fetchPreservationRules
    );
    startApiListener(
      "messages",
      "getBackupProgress",
      MessagesApi.getBackupProgress
    );
    startApiListener("messages", "searchMessages", MessagesApi.searchMessages);
    startApiListener("messages", "fetchMessages", MessagesApi.fetchMessages);
    startApiListener("channels", "fetchChannels", ChannelsApi.fetchChannels);
    startApiListener(
      "wordCounts",
      "fetchTopWordCounts",
      WordCountsApi.fetchTopWordCounts
    );

    app.whenReady().then(async () => {
      win = new BrowserWindow({
        width: 1200,
        height: 800,
        autoHideMenuBar: true,
        webPreferences: {
          nodeIntegration: false,
          preload: MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY,
        },
        icon: path.resolve(__dirname, iconSmall),
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
        const trayIcon = new Tray(path.resolve(__dirname, iconSmall));
        trayIcon.setToolTip("Preserve.dev");
        trayIcon.setContextMenu(trayContextMenu);
        trayIcon.on("click", () => win.show());
      }

      session.defaultSession.webRequest.onHeadersReceived(
        (details, callback) => {
          if (details.url.includes("localhost")) {
            callback({
              responseHeaders: {
                ...details.responseHeaders,
                "Content-Security-Policy": [
                  `
          default-src 'self' 'unsafe-inline' data:;
          script-src 'self' 'unsafe-eval' 'unsafe-inline' data:;
          style-src-elem 'self' 'unsafe-inline' https://fonts.googleapis.com;
          style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
          font-src 'self' https://fonts.googleapis.com https://fonts.gstatic.com;
          img-src 'self' https://discord.com https://cdn.discordapp.com;
          `,
                ],
              },
            });
          } else {
            callback({ responseHeaders: details.responseHeaders });
          }
        }
      );
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
  }
}

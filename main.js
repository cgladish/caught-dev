const { app, BrowserWindow } = require("electron");
const { session } = require("electron");
const isDev = require("electron-is-dev");
const debounce = require("lodash/debounce");
const { saveAuthentication } = require("./api/serviceAuth.ts");
const path = require("path");

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

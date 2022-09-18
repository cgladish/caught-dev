const { app, BrowserWindow, safeStorage } = require("electron");
const { session } = require("electron");
const isDev = require("electron-is-dev");
const { PrismaClient } = require("@prisma/client");
const debounce = require("lodash/debounce");

let prisma = new PrismaClient();

app.whenReady().then(() => {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    autoHideMenuBar: true,
    webPreferences: {
      nodeIntegration: true,
    },
  });
  if (isDev) {
    win.loadURL("http://localhost:3000");
    win.webContents.openDevTools({ mode: "detach" });
  } else {
    win.loadFile("public/index.html");
  }

  win.webContents.setWindowOpenHandler(() => {
    return {
      action: "allow",
      overrideBrowserWindowOptions: { autoHideMenuBar: true },
    };
  });
  session.defaultSession.webRequest.onBeforeSendHeaders(
    {
      urls: ["*://discord.com/*/users/@me/*"],
    },
    debounce(async (details) => {
      const discordAuthorization = details.requestHeaders.Authorization;
      const encryptedToken = safeStorage
        .encryptString(discordAuthorization)
        .toString();
      await prisma.authentication.upsert({
        where: { serviceName: "discord" },
        create: { serviceName: "discord", encryptedToken },
        update: { encryptedToken },
      });
      if (discordAuthorization) {
        BrowserWindow.getAllWindows().forEach((window) => {
          if (window.webContents.getURL().includes("discord")) {
            window.close();
          }
        });
      }
    }, 1000)
  );
});

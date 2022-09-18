const { app, BrowserWindow } = require("electron");
const { session } = require("electron");
const isDev = require("electron-is-dev");

let discordAuthorization = null;

const createWindow = () => {
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
    (details) => {
      discordAuthorization = details.requestHeaders.Authorization;
      if (discordAuthorization) {
        BrowserWindow.getAllWindows().forEach((window) => {
          if (window.webContents.getURL().includes("discord")) {
            window.close();
          }
        });
      }
    }
  );
  /*
  win.webContents.on("did-create-window", (subWindow, details) => {
    if (details.url.includes("discord")) {
      subWindow.webContents.debugger.attach("1.1");
      subWindow.webContents.debugger.on("message", (event, method, params) => {
        if (method === "Network.responseReceived") {
          if (params.response.url.includes("/users/@me")) {
            console.log(params);
          }
        }
      });
      subWindow.webContents.debugger.sendCommand("Network.enable");
    }
  });
  */
};
app.whenReady().then(() => {
  createWindow();
});

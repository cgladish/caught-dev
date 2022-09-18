const { app, BrowserWindow } = require("electron");
const isDev = require("electron-is-dev");

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

  win.webContents.setWindowOpenHandler(({ url }) => {
    return {
      action: "allow",
      overrideBrowserWindowOptions: { autoHideMenuBar: true },
    };
  });
};
app.whenReady().then(() => {
  createWindow();
});

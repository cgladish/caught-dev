const { app, BrowserWindow } = require("electron");
const isDev = require("electron-is-dev");

const createWindow = () => {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
  });
  if (isDev) {
    win.loadURL("http://localhost:3000");
    win.webContents.openDevTools({ mode: "detach" });
  } else {
    win.loadFile("index.html");
  }
};
app.whenReady().then(() => {
  createWindow();
});

import { contextBridge, ipcRenderer } from "electron";
import { FetchAuthentication } from "../api/serviceAuth";

contextBridge.exposeInMainWorld("api", {
  serviceAuth: {
    fetchAuthentication: (...args: Parameters<FetchAuthentication>) => {
      return ipcRenderer.invoke("@@serviceAuth/fetchAuthentication", ...args);
    },
  },
});

export {};

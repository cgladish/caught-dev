import { contextBridge, ipcRenderer } from "electron";
import { FetchAuthentication } from "../api/serviceAuth";

export const api = {
  serviceAuth: {
    fetchAuthentication: (...args: Parameters<FetchAuthentication>) => {
      return ipcRenderer.invoke("@@serviceAuth/fetchAuthentication", ...args);
    },
  },
};

contextBridge.exposeInMainWorld("api", api);

export {};

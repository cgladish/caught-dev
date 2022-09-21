import { contextBridge, ipcRenderer } from "electron";
import { deleteAuthentication } from "../api/appLogin";
import {
  fetchUserInfo,
  fetchGuilds,
  fetchChannels,
  fetchDmChannels,
} from "../api/discord";

const makeInvoker =
  <TFuncType extends (...args: any[]) => Promise<any>>(
    moduleName: string,
    funcName: string
  ) =>
  async (...args: Parameters<TFuncType>) => {
    const result: {
      data: Awaited<ReturnType<TFuncType>>;
      error: string | null;
    } = await ipcRenderer.invoke(`@@${moduleName}/${funcName}`, ...args);

    if (result.error) {
      throw new Error(result.error);
    }
    return result.data;
  };

export const api = {
  appLogin: {
    fetchUserInfo: makeInvoker<typeof fetchUserInfo>(
      "appLogin",
      "fetchUserInfo"
    ),
    logout: makeInvoker<typeof deleteAuthentication>(
      "appLogin",
      "deleteAuthentication"
    ),
  },
  discord: {
    fetchGuilds: makeInvoker<typeof fetchGuilds>("discord", "fetchGuilds"),
    fetchChannels: makeInvoker<typeof fetchChannels>(
      "discord",
      "fetchChannels"
    ),
    fetchDmChannels: makeInvoker<typeof fetchDmChannels>(
      "discord",
      "fetchDmChannels"
    ),
  },
};

contextBridge.exposeInMainWorld("api", api);

export {};

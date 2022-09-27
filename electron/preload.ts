import { contextBridge, ipcRenderer } from "electron";
import { deleteAuthentication } from "../api/appLogin";
import {
  fetchUserInfo,
  fetchGuilds,
  fetchChannels,
  fetchDmChannels,
} from "../api/discord";
import {
  fetchMessages,
  getBackupProgress,
  searchMessages,
} from "../api/messages";
import {
  createPreservationRule,
  deletePreservationRule,
  fetchPreservationRules,
  updatePreservationRule,
} from "../api/preservationRules";

const makeInvoker =
  <TFuncType extends (...args: any[]) => Promise<any>>(
    moduleName: string,
    funcName: string
  ) =>
  async (
    ...args: Parameters<TFuncType>
  ): Promise<Awaited<ReturnType<TFuncType>>> => {
    let result: {
      data: Awaited<ReturnType<TFuncType>>;
      error: string | null;
    };
    // Retry logic since can't use node module in preload
    for (let i = 0; i < 3; ++i) {
      if (i) {
        await new Promise<void>((resolve) =>
          setTimeout(() => resolve(), 500 * 2 ** i)
        );
      }
      result = await ipcRenderer.invoke(`@@${moduleName}/${funcName}`, ...args);
      if (!result.error) {
        break;
      }
    }

    if (result!.error) {
      throw new Error(result!.error);
    }
    return result!.data;
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
  preservationRules: {
    createPreservationRule: makeInvoker<typeof createPreservationRule>(
      "preservationRules",
      "createPreservationRule"
    ),
    updatePreservationRule: makeInvoker<typeof updatePreservationRule>(
      "preservationRules",
      "updatePreservationRule"
    ),
    deletePreservationRule: makeInvoker<typeof deletePreservationRule>(
      "preservationRules",
      "deletePreservationRule"
    ),
    fetchPreservationRules: makeInvoker<typeof fetchPreservationRules>(
      "preservationRules",
      "fetchPreservationRules"
    ),
  },
  messages: {
    getBackupProgress: makeInvoker<typeof getBackupProgress>(
      "messages",
      "getBackupProgress"
    ),
    searchMessages: makeInvoker<typeof searchMessages>(
      "messages",
      "searchMessages"
    ),
    fetchMessages: makeInvoker<typeof fetchMessages>(
      "messages",
      "fetchMessages"
    ),
  },
};

contextBridge.exposeInMainWorld("api", api);

export {};

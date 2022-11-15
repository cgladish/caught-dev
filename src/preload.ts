import { contextBridge, ipcRenderer } from "electron";
import * as AppLoginApi from "./api/appLogin";
import * as DiscordApi from "./api/discord";
import * as MessagesApi from "./api/messages";
import * as PreservationRulesApi from "./api/preservationRules";
import * as ChannelsApi from "./api/channels";
import * as SnippetsApi from "./api/snippets";
import * as WordCountsApi from "./api/wordCounts";

const makeInvoker =
  <
    TFuncType extends
      | ((...args: any[]) => Promise<any>)
      | ((...args: any[]) => any)
  >(
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
      console.error(result!.error);
      throw new Error(result!.error);
    }
    return result!.data;
  };

export const api = {
  urls: {
    openExternal: makeInvoker<(url: string) => void>("urls", "openExternal"),
  },
  appLogin: {
    fetchUserInfo: makeInvoker<typeof DiscordApi.fetchUserInfo>(
      "appLogin",
      "fetchUserInfo"
    ),
    logout: makeInvoker<typeof AppLoginApi.deleteAuthentication>(
      "appLogin",
      "deleteAuthentication"
    ),
  },
  discord: {
    fetchGuilds: makeInvoker<typeof DiscordApi.fetchGuilds>(
      "discord",
      "fetchGuilds"
    ),
    fetchChannels: makeInvoker<typeof DiscordApi.fetchChannels>(
      "discord",
      "fetchChannels"
    ),
    fetchDmChannels: makeInvoker<typeof DiscordApi.fetchDmChannels>(
      "discord",
      "fetchDmChannels"
    ),
  },
  preservationRules: {
    restartInitialPreservationRuleBackup: makeInvoker<
      typeof PreservationRulesApi.restartInitialPreservationRuleBackup
    >("preservationRules", "restartInitialPreservationRuleBackup"),
    createPreservationRule: makeInvoker<
      typeof PreservationRulesApi.createPreservationRule
    >("preservationRules", "createPreservationRule"),
    updatePreservationRule: makeInvoker<
      typeof PreservationRulesApi.updatePreservationRule
    >("preservationRules", "updatePreservationRule"),
    deletePreservationRule: makeInvoker<
      typeof PreservationRulesApi.deletePreservationRule
    >("preservationRules", "deletePreservationRule"),
    fetchPreservationRules: makeInvoker<
      typeof PreservationRulesApi.fetchPreservationRules
    >("preservationRules", "fetchPreservationRules"),
  },
  messages: {
    getBackupProgress: makeInvoker<typeof MessagesApi.getBackupProgress>(
      "messages",
      "getBackupProgress"
    ),
    searchMessages: makeInvoker<typeof MessagesApi.searchMessages>(
      "messages",
      "searchMessages"
    ),
    fetchMessages: makeInvoker<typeof MessagesApi.fetchMessages>(
      "messages",
      "fetchMessages"
    ),
  },
  channels: {
    fetchChannels: makeInvoker<typeof ChannelsApi.fetchChannels>(
      "channels",
      "fetchChannels"
    ),
  },
  wordCounts: {
    fetchTopWordCounts: makeInvoker<typeof WordCountsApi.fetchTopWordCounts>(
      "wordCounts",
      "fetchTopWordCounts"
    ),
  },
  snippets: {
    createSnippet: makeInvoker<typeof SnippetsApi.createSnippet>(
      "snippets",
      "createSnippet"
    ),
  },
};

contextBridge.exposeInMainWorld("api", api);

export {};

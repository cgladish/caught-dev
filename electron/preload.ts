import { contextBridge, ipcRenderer } from "electron";
import { FetchAuthentication } from "../api/serviceAuth";

const makeInvoker =
  <TFuncType extends (...args: any[]) => Promise<any>>(
    moduleName: string,
    funcName: string
  ) =>
  (...args: Parameters<TFuncType>) =>
    ipcRenderer.invoke(
      `@@${moduleName}/${funcName}`,
      ...args
    ) as ReturnType<TFuncType>;

export const api = {
  serviceAuth: {
    fetchAuthentication: makeInvoker<FetchAuthentication>(
      "serviceAuth",
      "fetchAuthentication"
    ),
  },
};

contextBridge.exposeInMainWorld("api", api);

export {};

import { contextBridge, ipcRenderer } from "electron";
import { fetchAuthentication } from "../api/serviceAuth";

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
    fetchAuthentication: makeInvoker<typeof fetchAuthentication>(
      "serviceAuth",
      "fetchAuthentication"
    ),
  },
};

contextBridge.exposeInMainWorld("api", api);

export {};

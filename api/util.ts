import { ipcRenderer } from "electron";

export const wrapApiFunc = <TArgs, TResult>(
  moduleName: string,
  func: (args: TArgs) => Promise<TResult>
) => {
  ipcRenderer.on(
    `@@${moduleName}/${func.name}/request`,
    (event, args: TArgs) => {
      ipcRenderer.send(`@@${moduleName}/${func.name}/success`, args);
    }
  );
};

import { safeStorage } from "electron";
import db from "../db";

export type ServiceAuth = {
  appName: AppName;
  encryptedToken: string;
};

export const saveAuthentication = async (
  appName: AppName,
  token: string
): Promise<void> => {
  const encryptedToken = safeStorage.encryptString(token).toString("hex");
  const numUpdated = await db<ServiceAuth>("ServiceAuth")
    .where({ appName })
    .update({ encryptedToken });
  if (!numUpdated) {
    await db<ServiceAuth>("ServiceAuth").insert({
      appName,
      encryptedToken,
    });
  }
};

export const fetchAuthentication = async (
  appName: AppName
): Promise<string | null> => {
  const result = await db<ServiceAuth>("ServiceAuth")
    .where({ appName })
    .first();
  return result
    ? safeStorage.decryptString(Buffer.from(result.encryptedToken, "hex"))
    : null;
};

export const deleteAuthentication = async (appName: AppName): Promise<void> => {
  await db<ServiceAuth>("ServiceAuth").where({ appName }).delete();
};

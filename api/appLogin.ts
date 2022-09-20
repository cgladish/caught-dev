import { safeStorage } from "electron";
import db from "../db";

export type ServiceAuth = {
  serviceName: AppName;
  encryptedToken: string;
};

export const saveAuthentication = async (
  serviceName: AppName,
  token: string
): Promise<void> => {
  const encryptedToken = safeStorage.encryptString(token).toString("hex");
  const numUpdated = await db<ServiceAuth>("ServiceAuth")
    .where({ serviceName })
    .update({ encryptedToken });
  if (!numUpdated) {
    await db<ServiceAuth>("ServiceAuth").insert({
      serviceName,
      encryptedToken,
    });
  }
};

export const fetchAuthentication = async (
  serviceName: AppName
): Promise<string | null> => {
  const result = await db<ServiceAuth>("ServiceAuth")
    .where({ serviceName })
    .first();
  return result
    ? safeStorage.decryptString(Buffer.from(result.encryptedToken, "hex"))
    : null;
};

export const deleteAuthentication = async (
  serviceName: AppName
): Promise<void> => {
  await db<ServiceAuth>("ServiceAuth").where({ serviceName }).delete();
};

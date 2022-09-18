import { safeStorage } from "electron";
import db from "../db";

export type ServiceName = "discord";
export type ServiceAuth = {
  serviceName: ServiceName;
  encryptedToken: string;
};

export const saveAuthentication = async (
  serviceName: ServiceName,
  token: string
): Promise<void> => {
  const encryptedToken = safeStorage.encryptString(token).toString();
  const numUpdated = await db<ServiceAuth>("ServiceAuth")
    .where("serviceName", serviceName)
    .update({ encryptedToken });
  if (!numUpdated) {
    await db<ServiceAuth>("ServiceAuth").insert({
      serviceName,
      encryptedToken,
    });
  }
};

export const fetchAuthentication = async (
  serviceName: ServiceName
): Promise<string | null> => {
  const result = await db<ServiceAuth>("ServiceAuth")
    .where("serviceName", serviceName)
    .first();
  return result
    ? safeStorage.decryptString(Buffer.from(result.encryptedToken))
    : null;
};

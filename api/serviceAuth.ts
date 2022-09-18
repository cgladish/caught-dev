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
  serviceName: ServiceName
): Promise<string | null> => {
  console.log(serviceName);
  const result = await db<ServiceAuth>("ServiceAuth")
    .where({ serviceName })
    .first();
  return result
    ? safeStorage.decryptString(Buffer.from(result.encryptedToken, "hex"))
    : null;
};
export type FetchAuthentication = typeof fetchAuthentication;

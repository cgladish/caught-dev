import { safeStorage } from "electron";
import TableName from "../db/tableName";
import getDb from "../db";

export type ServiceAuth = {
  id: number;
  appName: AppName;
  encryptedToken: string;
};

export const saveAuthentication = async (
  appName: AppName,
  token: string
): Promise<void> => {
  const db = await getDb();
  const encryptedToken = safeStorage.encryptString(token).toString("hex");
  const numUpdated = await db<ServiceAuth>(TableName.ServiceAuth)
    .where({ appName })
    .update({ encryptedToken });
  if (!numUpdated) {
    await db<ServiceAuth>(TableName.ServiceAuth).insert({
      appName,
      encryptedToken,
    });
  }
};

export const fetchAuthentication = async (
  appName: AppName
): Promise<string | null> => {
  const db = await getDb();
  const result = await db<ServiceAuth>(TableName.ServiceAuth)
    .where({ appName })
    .first();
  return result
    ? safeStorage.decryptString(Buffer.from(result.encryptedToken, "hex"))
    : null;
};

export const deleteAuthentication = async (appName: AppName): Promise<void> => {
  const db = await getDb();
  await db<ServiceAuth>(TableName.ServiceAuth).where({ appName }).delete();
};

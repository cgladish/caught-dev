import { safeStorage } from "electron";
import axios, { AxiosError, AxiosResponse } from "axios";
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

type FetchedUserInfo = {
  id: string;
  username: string;
  avatar?: string;
  email: string;
  discriminator: string;
};
export const fetchUserInfo = async (
  serviceName: AppName
): Promise<FetchedUserInfo | null> => {
  const token = await fetchAuthentication(serviceName);
  if (!token) {
    return null;
  }
  switch (serviceName) {
    case "discord": {
      try {
        const response: AxiosResponse<FetchedUserInfo> = await axios({
          method: "get",
          url: "https://discord.com/api/v9/users/@me",
          headers: { authorization: token },
        });
        return response.data;
      } catch (err) {
        const error = err as AxiosError;
        if (error.response?.status === 401) {
          return null;
        }
        throw err;
      }
    }
  }
};

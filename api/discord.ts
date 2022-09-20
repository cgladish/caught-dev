import axios, { AxiosError, AxiosResponse } from "axios";
import { fetchAuthentication } from "./appLogin";

type FetchedUserInfo = {
  id: string;
  username: string;
  avatar?: string;
  email: string;
  discriminator: string;
};
export const fetchUserInfo = async (): Promise<FetchedUserInfo | null> => {
  const token = await fetchAuthentication("discord");
  if (!token) {
    return null;
  }
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
};

type FetchedGuildInfo = {
  id: string;
  name: string;
  icon?: string;
};
export const fetchGuilds = async (): Promise<FetchedGuildInfo[]> => {
  const token = await fetchAuthentication("discord");
  if (!token) {
    throw new Error("Not logged in!");
  }
  const response: AxiosResponse<FetchedGuildInfo[]> = await axios({
    method: "get",
    url: "https://discord.com/api/v9/users/@me/guilds",
    headers: { authorization: token },
  });
  return response.data;
};

type FetchedChannelInfo = {
  id: string;
  name: string;
  guild_id: string;
};
export const fetchChannels = async (
  guildId: string
): Promise<FetchedChannelInfo[]> => {
  const token = await fetchAuthentication("discord");
  if (!token) {
    throw new Error("Not logged in!");
  }
  const response: AxiosResponse<FetchedChannelInfo[]> = await axios({
    method: "get",
    url: `https://discord.com/api/v9/guilds/${guildId}/channels`,
    headers: { authorization: token },
  });
  return response.data;
};

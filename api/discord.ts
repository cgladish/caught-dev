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

type FetchedDmChannelInfo = {
  id: string;
  recipients: {
    id: string;
    username: string;
    discrimator: string;
    avatar?: string;
  }[];
};
export const fetchDmChannels = async (): Promise<FetchedDmChannelInfo[]> => {
  const token = await fetchAuthentication("discord");
  if (!token) {
    throw new Error("Not logged in!");
  }
  const response: AxiosResponse<FetchedDmChannelInfo[]> = await axios({
    method: "get",
    url: "https://discord.com/api/v9/users/@me/channels",
    headers: { authorization: token },
  });
  return response.data;
};

export type FetchedMessageInfo = {
  id: string;
  author: {
    id: string;
    username: string;
    avatar?: string;
  };
  content: string;
  timestamp: string;
  edited_timestamp?: string;
  attachments: {
    id: string;
    filename: string;
    description?: string;
    content_type?: string;
    size: number;
    url: string;
    height?: number;
    width?: number;
    ephemeral?: boolean;
  }[];
  embeds: {
    title?: string;
    type?: string;
    description?: string;
    url?: string;
    timestamp?: string;
    footer?: {
      text: string;
      icon_url?: string;
    };
    image?: {
      url: string;
      height?: number;
      width?: number;
    };
    thumbnail?: {
      url: string;
      height?: number;
      width?: number;
    };
    video?: {
      url: string;
      height?: number;
      width?: number;
    };
    provider?: {
      name?: string;
      url?: string;
    };
    author?: {
      name: string;
      url?: string;
      icon_url?: string;
    };
    fields?: {
      name: string;
      value: string;
      inline?: boolean;
    }[];
  }[];
  sticker_items: {
    id: string;
    name: string;
    format_type: number;
  }[];
};
export const fetchMessages = async (
  channelId: string,
  params: {
    around?: string;
    before?: string;
    after?: string;
    limit?: number;
  }
) => {
  const token = await fetchAuthentication("discord");
  if (!token) {
    throw new Error("Not logged in!");
  }
  const response: AxiosResponse<FetchedMessageInfo[]> = await axios({
    method: "get",
    url: `https://discord.com/api/v9/channels/${channelId}/messages`,
    headers: { authorization: token },
    params,
  });
  return response.data;
};

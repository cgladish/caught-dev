import axios, { AxiosError, AxiosResponse } from "axios";
import { fetchAuthentication } from "./appLogin";

// https://discord.com/developers/docs/reference#snowflakes
const DISCORD_EPOCH = BigInt(1420070400000);
export const datetimeToSnowflake = (datetime: Date): bigint =>
  (BigInt(datetime.getTime()) - DISCORD_EPOCH) << BigInt(22);

const RATE_LIMIT_INTERVAL = 100; // 100ms
export const waitForInterval = (() => {
  let lastFetchTime = new Date(0);
  return () => {
    let timeBeforeNextCall =
      RATE_LIMIT_INTERVAL - (Date.now() - lastFetchTime.getTime());
    if (timeBeforeNextCall > 0) {
      return new Promise<void>((resolve) => {
        setTimeout(() => {
          lastFetchTime = new Date();
          resolve();
        }, timeBeforeNextCall);
      });
    }
    lastFetchTime = new Date();
    return Promise.resolve();
  };
})();

type FetchedUserInfo = {
  id: string;
  username: string;
  avatar?: string;
  email: string;
  discriminator: string;
  permissions: number;
};
export const fetchUserInfo = async (): Promise<FetchedUserInfo | null> => {
  const token = await fetchAuthentication("discord");
  if (!token) {
    return null;
  }
  try {
    await waitForInterval();
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

type FetchedGuildsSingleGuildInfo = {
  id: string;
  name: string;
  owner: boolean;
  icon?: string;
};
export const fetchGuilds = async (): Promise<
  FetchedGuildsSingleGuildInfo[]
> => {
  const token = await fetchAuthentication("discord");
  if (!token) {
    throw new Error("Not logged in!");
  }
  await waitForInterval();
  const response: AxiosResponse<FetchedGuildsSingleGuildInfo[]> = await axios({
    method: "get",
    url: "https://discord.com/api/v9/users/@me/guilds",
    headers: { authorization: token },
  });
  return response.data;
};

// https://discord.com/developers/docs/resources/channel#channel-object-channel-types
const TEXT_CHANNEL_TYPES = [0, 1, 3, 5, 10, 11, 12, 15];
type FetchedChannelInfo = {
  id: string;
  type: number;
  name: string;
  guild_id: string;
  permission_overwrites: {
    id: string;
    type: number;
    allow: string;
    deny: string;
  }[];
};
type FetchedGuildInfo = {
  id: string;
  owner_id: string;
  roles: {
    id: string;
    permissions: string;
  }[];
};
type FetchedGuildMember = {
  roles: string[];
  user: {
    id: string;
  };
};
export const fetchChannels = async (
  guildId: string
): Promise<FetchedChannelInfo[]> => {
  const token = await fetchAuthentication("discord");
  if (!token) {
    throw new Error("Not logged in!");
  }
  await waitForInterval();
  const guildMemberResponse: AxiosResponse<FetchedGuildMember> = await axios({
    method: "get",
    url: `https://discord.com/api/v9/users/@me/guilds/${guildId}/member`,
    headers: { authorization: token },
  });
  await waitForInterval();
  const guildResponse: AxiosResponse<FetchedGuildInfo> = await axios({
    method: "get",
    url: `https://discord.com/api/v9/guilds/${guildId}`,
    headers: { authorization: token },
  });
  await waitForInterval();
  const response: AxiosResponse<FetchedChannelInfo[]> = await axios({
    method: "get",
    url: `https://discord.com/api/v9/guilds/${guildId}/channels`,
    headers: { authorization: token },
  });
  return response.data.filter(
    (channel) =>
      TEXT_CHANNEL_TYPES.includes(channel.type) &&
      hasPermissions(guildMemberResponse.data, guildResponse.data, channel)
  );
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
  await waitForInterval();
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
  await waitForInterval();
  const response: AxiosResponse<FetchedMessageInfo[]> = await axios({
    method: "get",
    url: `https://discord.com/api/v9/channels/${channelId}/messages`,
    headers: { authorization: token },
    params,
  });
  return response.data;
};

export const fetchMessagesCount = async ({
  channelId,
  startSnowflake,
  endSnowflake,
}: {
  channelId: string;
  startSnowflake: string;
  endSnowflake: string;
}) => {
  const token = await fetchAuthentication("discord");
  if (!token) {
    throw new Error("Not logged in!");
  }
  await waitForInterval();
  const response: AxiosResponse<{ total_results: number }> = await axios({
    method: "get",
    url: `https://discord.com/api/v9/channels/${channelId}/messages/search`,
    params: {
      min_id: startSnowflake,
      max_id: endSnowflake,
      include_nsfw: true,
    },
    headers: { authorization: token },
  });
  return response.data.total_results;
};

// This code was tranlated from the Python snippet here:
// https://discord.com/developers/docs/topics/permissions
const ALL = -1;
const ADMINISTRATOR = 1 << 3;
const computeBasePermissions = (
  member: FetchedGuildMember,
  guild: FetchedGuildInfo
) => {
  if (guild.owner_id === member.user.id) {
    return ALL;
  }

  const roleEveryone = guild.roles.find(({ id }) => id === guild.id); // get @everyone role
  let permissions = Number(roleEveryone!.permissions);

  for (let role of member.roles) {
    const rolePermissions = guild.roles.find(({ id }) => id === role);
    if (rolePermissions) {
      permissions |= Number(rolePermissions.permissions);
    }
  }

  if ((permissions & ADMINISTRATOR) === ADMINISTRATOR) {
    return ALL;
  }

  return permissions;
};
const computeOverwrites = (
  basePermissions: number,
  member: FetchedGuildMember,
  channel: FetchedChannelInfo
) => {
  let permissions = basePermissions;
  const overwrites = channel.permission_overwrites;
  const overwriteEveryone = overwrites.find(
    ({ id }) => id === channel.guild_id
  ); // Find (@everyone) role overwrite and apply it.
  if (overwriteEveryone) {
    permissions &= ~Number(overwriteEveryone.deny);
    permissions |= Number(overwriteEveryone.allow);
  }

  // Apply role specific overwrites.
  let allow = Number(0);
  let deny = Number(0);
  for (let roleId of member.roles) {
    const overwriteRole = overwrites.find(({ id }) => id === roleId);
    if (overwriteRole) {
      allow |= Number(overwriteRole.allow);
      deny |= Number(overwriteRole.deny);
    }
  }

  permissions &= ~deny;
  permissions |= allow;

  // Apply member specific overwrite if it exist.
  const overwriteMember = overwrites.find(({ id }) => id === member.user.id);
  if (overwriteMember) {
    permissions &= ~Number(overwriteMember.deny);
    permissions |= Number(overwriteMember.allow);
  }

  return permissions;
};
const computePermissions = (
  member: FetchedGuildMember,
  guild: FetchedGuildInfo,
  channel: FetchedChannelInfo
) => {
  const basePermissions = computeBasePermissions(member, guild);
  if (basePermissions === ALL) {
    return ALL;
  }
  return computeOverwrites(basePermissions, member, channel);
};
const VIEW_CHANNEL = 1 << 10;
export const hasPermissions = (
  member: FetchedGuildMember,
  guild: FetchedGuildInfo,
  channel: FetchedChannelInfo,
  desiredPermissions = [VIEW_CHANNEL]
) => {
  const permissions = computePermissions(member, guild, channel);
  return (
    permissions === ALL ||
    desiredPermissions.every(
      (desiredPermission) =>
        (permissions & desiredPermission) === desiredPermission
    )
  );
};

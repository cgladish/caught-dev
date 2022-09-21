import { ResourceStatus } from "../types";

export type Guild = {
  id: string;
  name: string;
  icon?: string;
  channels?: { [channelId: string]: Channel } | null;
};
export type Channel = {
  id: string;
  name: string;
  guildId: string;
};
export type DmChannel = {
  id: string;
  recipients: {
    id: string;
    username: string;
    discrimator: string;
    avatar?: string;
  }[];
};
export type State = {
  guildsFetchStatus: ResourceStatus;
  channelsFetchStatus: ResourceStatus;
  dmChannelsFetchStatus: ResourceStatus;
  guilds: {
    [guildId: string]: Guild;
  } | null;
  dmChannels: {
    [channelId: string]: DmChannel;
  } | null;
};

export const initialState: State = {
  guildsFetchStatus: "initial",
  channelsFetchStatus: "initial",
  dmChannelsFetchStatus: "initial",
  guilds: null,
  dmChannels: null,
};

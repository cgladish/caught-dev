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
export type State = {
  fetchStatus: ResourceStatus;
  guilds: {
    [guildId: string]: Guild;
  } | null;
};

export const initialState: State = {
  fetchStatus: "initial",
  guilds: null,
};

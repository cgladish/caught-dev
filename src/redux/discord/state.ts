import { ResourceStatus } from "../types";

export type Guild = {
  id: string;
  name: string;
  icon?: string;
};
export type Channel = {
  id: string;
  name: string;
};
export type State = {
  fetchStatus: ResourceStatus;
  guilds: {
    [guildId: string]: Guild & {
      channels: {
        [channelId: string]: Channel;
      } | null;
    };
  } | null;
};

export const initialState: State = {
  fetchStatus: "initial",
  guilds: null,
};

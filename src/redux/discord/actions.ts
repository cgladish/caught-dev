import { Channel, Guild } from "./state";

export enum ActionType {
  fetchGuildsStart = "@@discord/FETCH_GUILDS_START",
  fetchGuildsSuccess = "@@discord/FETCH_GUILDS_SUCCESS",
  fetchGuildsFailure = "@@discord/FETCH_GUILDS_FAILURE",
  fetchChannelsStart = "@@discord/FETCH_CHANNELS_START",
  fetchChannelsSuccess = "@@discord/FETCH_CHANNELS_SUCCESS",
  fetchChannelsFailure = "@@discord/FETCH_CHANNELS_FAILURE",
}

export type FetchGuildsStartAction = {
  type: ActionType.fetchGuildsStart;
};
export type FetchGuildsSuccessAction = {
  type: ActionType.fetchGuildsSuccess;
  payload: { guilds: Guild[] };
};
export type FetchGuildsFailureAction = {
  type: ActionType.fetchGuildsFailure;
  payload: { error: Error };
};

export type FetchChannelsStartAction = {
  type: ActionType.fetchChannelsStart;
  payload: { guildId: string };
};
export type FetchChannelSuccessAction = {
  type: ActionType.fetchChannelsSuccess;
  payload: { guildId: string; channels: Channel[] };
};
export type FetchChannelFailureAction = {
  type: ActionType.fetchChannelsFailure;
  payload: { guildId: string; error: Error };
};

export type Action =
  | FetchGuildsStartAction
  | FetchGuildsSuccessAction
  | FetchGuildsFailureAction
  | FetchChannelsStartAction
  | FetchChannelSuccessAction
  | FetchChannelFailureAction;

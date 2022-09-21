import { createSelector } from "@reduxjs/toolkit";
import { RootState } from "../rootState";
import { State } from "./state";

export const getState = (rootState: RootState): State => rootState.discord;
export const getGuildsFetchStatus = createSelector(
  [getState],
  (state) => state.guildsFetchStatus
);
export const getChannelsFetchStatus = createSelector(
  [getState],
  (state) => state.channelsFetchStatus
);
export const getDmChannelsFetchStatus = createSelector(
  [getState],
  (state) => state.dmChannelsFetchStatus
);
export const getGuilds = createSelector([getState], (state) => state.guilds);
export const getDmChannels = createSelector(
  [getState],
  (state) => state.dmChannels
);

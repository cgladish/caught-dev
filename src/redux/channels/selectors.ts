import { createSelector } from "@reduxjs/toolkit";
import { RootState } from "../rootState";
import { State } from "./state";

export const getState = (rootState: RootState): State => rootState.channels;
export const getFetchStatus = createSelector(
  [getState],
  (state) => state.fetchStatus
);
export const getChannels = createSelector(
  [getState],
  (state) => state.channels
);

export const getDiscordChannels = createSelector(
  [getState],
  (state) => state.channels.discord
);

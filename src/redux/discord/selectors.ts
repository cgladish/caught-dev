import { createSelector } from "@reduxjs/toolkit";
import { RootState } from "../rootState";
import { State } from "./state";

export const getState = (rootState: RootState): State => rootState.discord;
export const getFetchStatus = createSelector(
  [getState],
  (state) => state.fetchStatus
);
export const getGuilds = createSelector([getState], (state) => state.guilds);

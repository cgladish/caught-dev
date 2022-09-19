import { createSelector } from "@reduxjs/toolkit";
import { RootState } from "../rootState";
import { State } from "./state";

export const getState = (rootState: RootState): State => rootState.appLogin;
export const getFetchStatus = createSelector(
  [getState],
  (state) => state.fetchStatus
);
export const getUserInfo = createSelector(
  [getState],
  (state) => state.userInfo
);

export const getDiscordFetchStatus = createSelector(
  [getFetchStatus],
  (state) => state.discord
);
export const getDiscordUserInfo = createSelector(
  [getUserInfo],
  (state) => state.discord
);

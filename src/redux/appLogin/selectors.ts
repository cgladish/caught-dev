import { createSelector } from "@reduxjs/toolkit";
import { RootState } from "../rootState";
import { State } from "./state";

export const getState = (rootState: RootState): State => rootState.appLogin;
export const getFetchStatus = createSelector(
  [getState],
  (state) => state.fetchStatus
);
export const getLogoutStatus = createSelector(
  [getState],
  (state) => state.logoutStatus
);
export const getUserInfo = createSelector(
  [getState],
  (state) => state.userInfo
);

export const getDiscordUserInfo = createSelector(
  [getUserInfo],
  (state) => state.discord
);

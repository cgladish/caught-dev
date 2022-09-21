import { createSelector } from "@reduxjs/toolkit";
import { RootState } from "../rootState";
import { State } from "./state";

export const getState = (rootState: RootState): State =>
  rootState.preservationRules;
export const getFetchStatus = createSelector(
  [getState],
  (state) => state.fetchStatus
);
export const getSaveStatus = createSelector(
  [getState],
  (state) => state.saveStatus
);
export const getPreservationRules = createSelector(
  [getState],
  (state) => state.preservationRules
);

export const getDiscordPreservationRules = createSelector(
  [getState],
  (state) => state.preservationRules.discord
);

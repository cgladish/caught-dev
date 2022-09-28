import { createSelector } from "@reduxjs/toolkit";
import { RootState } from "../rootState";
import { State } from "./state";

export const getState = (rootState: RootState): State => rootState.messages;
export const getFetchStatus = createSelector(
  [getState],
  (state) => state.fetchStatus
);
export const getJumpStatus = createSelector(
  [getState],
  (state) => state.jumpStatus
);
export const getSearchStatus = createSelector(
  [getState],
  (state) => state.searchStatus
);
export const getJumpedToMessage = createSelector(
  [getState],
  (state) => state.jumpedToMessage
);
export const getMessages = createSelector(
  [getState],
  (state) => state.messages
);
export const getSearchResults = createSelector(
  [getState],
  (state) => state.searchResults
);

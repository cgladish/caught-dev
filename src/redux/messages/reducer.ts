import { sortBy } from "lodash";
import { combineReducers } from "redux";
import { Action, ActionType } from "./actions";
import { initialState, State } from "./state";

export const fetchStatus = (
  state = initialState.fetchStatus,
  action: Action
): State["fetchStatus"] => {
  switch (action.type) {
    case ActionType.fetchStart: {
      return "pending";
    }
    case ActionType.fetchSuccess: {
      return "success";
    }
    case ActionType.fetchFailure: {
      return "errored";
    }
    default:
      return state;
  }
};

export const searchStatus = (
  state = initialState.searchStatus,
  action: Action
): State["searchStatus"] => {
  switch (action.type) {
    case ActionType.searchStart: {
      return "pending";
    }
    case ActionType.searchSuccess: {
      return "success";
    }
    case ActionType.searchFailure: {
      return "errored";
    }
    default:
      return state;
  }
};

export const messages = (
  state = initialState.messages,
  action: Action
): State["messages"] => {
  switch (action.type) {
    case ActionType.fetchStart: {
      if (!action.payload.cursor) {
        const newState = { ...state };
        newState[action.payload.preservationRuleId] = {
          ...state[action.payload.preservationRuleId],
        };
        newState[action.payload.preservationRuleId]![action.payload.channelId] =
          null;
        return newState;
      }
      return state;
    }
    case ActionType.fetchSuccess: {
      const newState = { ...state };
      newState[action.payload.preservationRuleId] = {
        ...state[action.payload.preservationRuleId],
      };
      const newMessages = sortBy(
        [
          ...(newState[action.payload.preservationRuleId]![
            action.payload.channelId
          ]?.data ?? []),
          ...action.payload.messagesResult.data,
        ],
        "sentAt"
      );
      newState[action.payload.preservationRuleId]![action.payload.channelId] = {
        data: newMessages,
        isLastPage: action.payload.messagesResult.isLastPage,
      };
      return newState;
    }
    default:
      return state;
  }
};

export const searchResults = (
  state = initialState.searchResults,
  action: Action
): State["searchResults"] => {
  switch (action.type) {
    case ActionType.searchStart: {
      if (!action.payload.before) {
        const newState = { ...state };
        newState[action.payload.preservationRuleId] = {
          ...state[action.payload.preservationRuleId],
        };
        newState[action.payload.preservationRuleId]![action.payload.channelId] =
          null;
        return newState;
      }
      return state;
    }
    case ActionType.searchSuccess: {
      const newState = { ...state };
      newState[action.payload.preservationRuleId] = {
        ...state[action.payload.preservationRuleId],
      };
      const newMessages = sortBy(
        [
          ...(newState[action.payload.preservationRuleId]![
            action.payload.channelId
          ]?.data ?? []),
          ...action.payload.searchResult.data,
        ],
        "sentAt"
      ).reverse();
      newState[action.payload.preservationRuleId]![action.payload.channelId] = {
        data: newMessages,
        totalCount: action.payload.searchResult.totalCount,
        isLastPage: action.payload.searchResult.isLastPage,
      };
      return newState;
    }
    default:
      return state;
  }
};

export const reducer = combineReducers({
  fetchStatus,
  searchStatus,
  messages,
  searchResults,
});

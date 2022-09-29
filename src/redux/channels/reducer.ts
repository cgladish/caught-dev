import keyBy from "lodash/keyBy";
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

export const channels = (
  state = initialState.channels,
  action: Action
): State["channels"] => {
  switch (action.type) {
    case ActionType.fetchStart: {
      const newState = { ...state };
      newState[action.payload.appName] = {
        ...state[action.payload.appName],
      };
      newState[action.payload.appName]![action.payload.preservationRuleId] =
        null;
      return newState;
    }
    case ActionType.fetchSuccess: {
      const newState = { ...state };
      newState[action.payload.appName] = {
        ...state[action.payload.appName],
      };
      newState[action.payload.appName]![action.payload.preservationRuleId] =
        keyBy(action.payload.channels, "externalId");
      return newState;
    }
    default:
      return state;
  }
};

export const reducer = combineReducers({
  fetchStatus,
  channels,
});

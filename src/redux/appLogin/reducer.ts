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

export const logoutStatus = (
  state = initialState.logoutStatus,
  action: Action
): State["logoutStatus"] => {
  switch (action.type) {
    case ActionType.logoutStart: {
      return "pending";
    }
    case ActionType.logoutSuccess: {
      return "success";
    }
    case ActionType.logoutFailure: {
      return "errored";
    }
    default:
      return state;
  }
};

export const userInfo = (
  state = initialState.userInfo,
  action: Action
): State["userInfo"] => {
  switch (action.type) {
    case ActionType.fetchStart:
    case ActionType.fetchFailure:
    case ActionType.logoutStart:
    case ActionType.logoutSuccess: {
      const newState = { ...state };
      newState[action.payload.appName] = null;
      return newState;
    }
    case ActionType.fetchSuccess: {
      const newState = { ...state };
      newState[action.payload.appName] = action.payload.userInfo;
      return newState;
    }
    default:
      return state;
  }
};

export const reducer = combineReducers({ fetchStatus, logoutStatus, userInfo });

import { combineReducers } from "redux";
import { Action, ActionType } from "./actions";
import { initialState, State } from "./state";

export const fetchStatus = (
  state = initialState.fetchStatus,
  action: Action
): State["fetchStatus"] => {
  switch (action.type) {
    case ActionType.fetchStart: {
      const newState = { ...state };
      newState[action.payload.appName] = "pending";
      return newState;
    }
    case ActionType.fetchSuccess: {
      const newState = { ...state };
      newState[action.payload.appName] = "success";
      return newState;
    }
    case ActionType.fetchFailure: {
      const newState = { ...state };
      newState[action.payload.appName] = "errored";
      return newState;
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
    case ActionType.fetchFailure: {
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

export const reducer = combineReducers({ fetchStatus, userInfo });

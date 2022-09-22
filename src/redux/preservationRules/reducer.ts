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

export const saveStatus = (
  state = initialState.saveStatus,
  action: Action
): State["saveStatus"] => {
  switch (action.type) {
    case ActionType.createStart: {
      return "pending";
    }
    case ActionType.createSuccess: {
      return "success";
    }
    case ActionType.createFailure: {
      return "errored";
    }
    default:
      return state;
  }
};

export const preservationRules = (
  state = initialState.preservationRules,
  action: Action
): State["preservationRules"] => {
  switch (action.type) {
    case ActionType.fetchStart:
    case ActionType.fetchFailure: {
      const newPreservationRules = { ...state };
      newPreservationRules[action.payload.appName] = null;
      return newPreservationRules;
    }
    case ActionType.fetchSuccess: {
      const newPreservationRules = { ...state };
      newPreservationRules[action.payload.appName] = keyBy(
        action.payload.preservationRules,
        "id"
      );
      return newPreservationRules;
    }
    case ActionType.createSuccess: {
      const newPreservationRules = { ...state };
      newPreservationRules[action.payload.appName] = {
        ...newPreservationRules[action.payload.appName],
      };
      newPreservationRules[action.payload.appName]![
        action.payload.preservationRule.id
      ] = action.payload.preservationRule;
      return newPreservationRules;
    }
    default:
      return state;
  }
};

export const reducer = combineReducers({
  fetchStatus,
  saveStatus,
  preservationRules,
});

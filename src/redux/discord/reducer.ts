import { keyBy } from "lodash";
import { combineReducers } from "redux";
import { Action, ActionType } from "./actions";
import { initialState, State } from "./state";

export const fetchStatus = (
  state = initialState.fetchStatus,
  action: Action
): State["fetchStatus"] => {
  switch (action.type) {
    case ActionType.fetchGuildsStart:
    case ActionType.fetchChannelsStart: {
      return "pending";
    }
    case ActionType.fetchGuildsSuccess:
    case ActionType.fetchChannelsSuccess: {
      return "success";
    }
    case ActionType.fetchGuildsFailure:
    case ActionType.fetchChannelsFailure: {
      return "errored";
    }
    default:
      return state;
  }
};

export const guilds = (
  state = initialState.guilds,
  action: Action
): State["guilds"] => {
  switch (action.type) {
    case ActionType.fetchGuildsStart:
    case ActionType.fetchGuildsFailure: {
      return {};
    }
    case ActionType.fetchGuildsSuccess: {
      return keyBy(
        action.payload.guilds.map((guild) => ({ ...guild, channels: null })),
        "id"
      );
    }
    case ActionType.fetchChannelsStart:
    case ActionType.fetchChannelsFailure: {
      const newState = { ...state };
      newState[action.payload.guildId] = {
        ...newState[action.payload.guildId],
        channels: null,
      };
      return newState;
    }
    case ActionType.fetchChannelsSuccess: {
      const newState = { ...state };
      newState[action.payload.guildId] = {
        ...newState[action.payload.guildId],
        channels: keyBy(action.payload.channels, "id"),
      };
      return newState;
    }
    default:
      return state;
  }
};

export const reducer = combineReducers({ fetchStatus, guilds });

import { keyBy } from "lodash";
import { combineReducers } from "redux";
import { Action, ActionType } from "./actions";
import { initialState, State } from "./state";

export const guildsFetchStatus = (
  state = initialState.guildsFetchStatus,
  action: Action
): State["guildsFetchStatus"] => {
  switch (action.type) {
    case ActionType.fetchGuildsStart: {
      return "pending";
    }
    case ActionType.fetchGuildsSuccess: {
      return "success";
    }
    case ActionType.fetchGuildsFailure: {
      return "errored";
    }
    default:
      return state;
  }
};

export const channelsFetchStatus = (
  state = initialState.channelsFetchStatus,
  action: Action
): State["channelsFetchStatus"] => {
  switch (action.type) {
    case ActionType.fetchChannelsStart: {
      return "pending";
    }
    case ActionType.fetchChannelsSuccess: {
      return "success";
    }
    case ActionType.fetchChannelsFailure: {
      return "errored";
    }
    default:
      return state;
  }
};

export const dmChannelsFetchStatus = (
  state = initialState.dmChannelsFetchStatus,
  action: Action
): State["dmChannelsFetchStatus"] => {
  switch (action.type) {
    case ActionType.fetchDmChannelsStart: {
      return "pending";
    }
    case ActionType.fetchDmChannelsSuccess: {
      return "success";
    }
    case ActionType.fetchDmChannelsFailure: {
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
      return null;
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

export const dmChannels = (
  state = initialState.dmChannels,
  action: Action
): State["dmChannels"] => {
  switch (action.type) {
    case ActionType.fetchDmChannelsStart:
    case ActionType.fetchDmChannelsFailure: {
      return {};
    }
    case ActionType.fetchDmChannelsSuccess: {
      return keyBy(action.payload.dmChannels, "id");
    }
    default:
      return state;
  }
};

export const reducer = combineReducers({
  guildsFetchStatus,
  channelsFetchStatus,
  dmChannelsFetchStatus,
  guilds,
  dmChannels,
});

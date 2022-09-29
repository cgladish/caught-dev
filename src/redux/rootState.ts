import {
  initialState as appLoginInitialState,
  State as AppLoginState,
} from "./appLogin/state";
import {
  initialState as channelsInitialState,
  State as ChannelsState,
} from "./channels/state";
import {
  initialState as discordInitialState,
  State as DiscordState,
} from "./discord/state";
import {
  initialState as messagesInitialState,
  State as MessagesState,
} from "./messages/state";
import {
  initialState as preservationRulesInitialState,
  State as PreservationRulesState,
} from "./preservationRules/state";

export type RootState = {
  appLogin: AppLoginState;
  channels: ChannelsState;
  discord: DiscordState;
  messages: MessagesState;
  preservationRules: PreservationRulesState;
};
export const initialRootState: RootState = {
  appLogin: appLoginInitialState,
  channels: channelsInitialState,
  discord: discordInitialState,
  messages: messagesInitialState,
  preservationRules: preservationRulesInitialState,
};

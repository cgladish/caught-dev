import {
  initialState as appLoginInitialState,
  State as AppLoginState,
} from "./appLogin/state";
import {
  initialState as discordInitialState,
  State as DiscordState,
} from "./discord/state";
import {
  initialState as preservationRulesInitialState,
  State as PreservationRulesState,
} from "./preservationRules/state";

export type RootState = {
  appLogin: AppLoginState;
  discord: DiscordState;
  preservationRules: PreservationRulesState;
};
export const initialRootState: RootState = {
  appLogin: appLoginInitialState,
  discord: discordInitialState,
  preservationRules: preservationRulesInitialState,
};

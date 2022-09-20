import {
  initialState as appLoginInitialState,
  State as AppLoginState,
} from "./appLogin/state";
import {
  initialState as discordInitialState,
  State as DiscordState,
} from "./discord/state";

export type RootState = {
  appLogin: AppLoginState;
  discord: DiscordState;
};
export const initialRootState: RootState = {
  appLogin: appLoginInitialState,
  discord: discordInitialState,
};

import { Dispatch as _Dispatch } from "redux";
import { Action as AppLoginAction } from "./appLogin/actions";
import { Action as DiscordAction } from "./discord/actions";
import { Action as PreservationRulesAction } from "./preservationRules/actions";

export type Dispatch = _Dispatch<
  AppLoginAction | DiscordAction | PreservationRulesAction
>;

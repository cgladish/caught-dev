import { combineReducers, Dispatch as _Dispatch } from "redux";
import { reducer as appLoginReducer } from "./appLogin/reducer";
import { reducer as channelsReducer } from "./channels/reducer";
import { reducer as discordReducer } from "./discord/reducer";
import { reducer as messagesReducer } from "./messages/reducer";
import { reducer as preservationRulesReducer } from "./preservationRules/reducer";

export const rootReducer = combineReducers({
  appLogin: appLoginReducer,
  channels: channelsReducer,
  discord: discordReducer,
  messages: messagesReducer,
  preservationRules: preservationRulesReducer,
});

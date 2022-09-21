import { combineReducers, Dispatch as _Dispatch } from "redux";
import { reducer as appLoginReducer } from "./appLogin/reducer";
import { reducer as discordReducer } from "./discord/reducer";
import { reducer as preservationRulesReducer } from "./preservationRules/reducer";

export const rootReducer = combineReducers({
  appLogin: appLoginReducer,
  discord: discordReducer,
  preservationRulesReducer: preservationRulesReducer,
});

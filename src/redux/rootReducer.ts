import { combineReducers, Dispatch as _Dispatch } from "redux";
import { reducer as appLoginReducer } from "./appLogin/reducer";
import { reducer as discordReducer } from "./discord/reducer";

export const rootReducer = combineReducers({
  appLogin: appLoginReducer,
  discord: discordReducer,
});

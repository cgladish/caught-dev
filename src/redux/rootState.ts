import {
  initialState as appLoginInitialState,
  State as AppLoginState,
} from "./appLogin/state";

export type RootState = {
  appLogin: AppLoginState;
};
export const initialRootState: RootState = {
  appLogin: appLoginInitialState,
};

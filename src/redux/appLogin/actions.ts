import { UserInfo } from "./state";

export enum ActionType {
  fetchStart = "@@appLogin/FETCH_START",
  fetchSuccess = "@@appLogin/FETCH_SUCCESS",
  fetchFailure = "@@appLogin/FETCH_FAILURE",
}

export type FetchStartAction = {
  type: ActionType.fetchStart;
  payload: { appName: AppName };
};
export type FetchSuccessAction = {
  type: ActionType.fetchSuccess;
  payload: { appName: AppName; userInfo: UserInfo | null };
};
export type FetchFailureAction = {
  type: ActionType.fetchFailure;
  payload: { appName: AppName; error: Error };
};

export type Action = FetchStartAction | FetchSuccessAction | FetchFailureAction;

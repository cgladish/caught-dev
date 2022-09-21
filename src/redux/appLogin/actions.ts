import { UserInfo } from "./state";

export enum ActionType {
  fetchStart = "@@appLogin/FETCH_START",
  fetchSuccess = "@@appLogin/FETCH_SUCCESS",
  fetchFailure = "@@appLogin/FETCH_FAILURE",
  logoutStart = "@@appLogin/LOGOUT_START",
  logoutSuccess = "@@appLogin/LOGOUT_SUCCESS",
  logoutFailure = "@@appLogin/LOGOUT_FAILURE",
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
  payload: { appName: AppName; error: string };
};

export type LogoutStartAction = {
  type: ActionType.logoutStart;
  payload: { appName: AppName };
};
export type LogoutSuccessAction = {
  type: ActionType.logoutSuccess;
  payload: { appName: AppName };
};
export type LogoutFailureAction = {
  type: ActionType.logoutFailure;
  payload: { appName: AppName; error: string };
};

export type Action =
  | FetchStartAction
  | FetchSuccessAction
  | FetchFailureAction
  | LogoutStartAction
  | LogoutSuccessAction
  | LogoutFailureAction;

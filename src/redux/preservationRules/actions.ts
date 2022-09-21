import { PreservationRule } from "./state";

export enum ActionType {
  fetchStart = "@@preservationRules/FETCH_START",
  fetchSuccess = "@@preservationRules/FETCH_SUCCESS",
  fetchFailure = "@@preservationRules/FETCH_FAILURE",
  createStart = "@@preservationRules/SAVE_START",
  createSuccess = "@@preservationRules/SAVE_SUCCESS",
  createFailure = "@@preservationRules/SAVE_FAILURE",
}

export type FetchStartAction = {
  type: ActionType.fetchStart;
  payload: { appName: AppName };
};
export type FetchSuccessAction = {
  type: ActionType.fetchSuccess;
  payload: { appName: AppName; preservationRules: PreservationRule[] };
};
export type FetchFailureAction = {
  type: ActionType.fetchFailure;
  payload: { appName: AppName; error: string };
};

export type CreateStartAction = {
  type: ActionType.createStart;
  payload: {
    appName: AppName;
    preservationRule: Parameters<
      typeof window.api.preservationRules.createPreservationRule
    >[0];
  };
};
export type CreateSuccessAction = {
  type: ActionType.createSuccess;
  payload: { appName: AppName; preservationRule: PreservationRule };
};
export type CreateFailureAction = {
  type: ActionType.createFailure;
  payload: { appName: AppName; error: string };
};

export type Action =
  | FetchStartAction
  | FetchSuccessAction
  | FetchFailureAction
  | CreateStartAction
  | CreateSuccessAction
  | CreateFailureAction;

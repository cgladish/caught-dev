import { PreservationRule } from "./state";

export enum ActionType {
  fetchStart = "@@preservationRules/FETCH_START",
  fetchSuccess = "@@preservationRules/FETCH_SUCCESS",
  fetchFailure = "@@preservationRules/FETCH_FAILURE",
  createStart = "@@preservationRules/CREATE_START",
  createSuccess = "@@preservationRules/CREATE_SUCCESS",
  createFailure = "@@preservationRules/CREATE_FAILURE",
  updateStart = "@@preservationRules/UPDATE_START",
  updateSuccess = "@@preservationRules/UPDATE_SUCCESS",
  updateFailure = "@@preservationRules/UPDATE_FAILURE",
  deleteStart = "@@preservationRules/DELETE_START",
  deleteSuccess = "@@preservationRules/DELETE_SUCCESS",
  deleteFailure = "@@preservationRules/DELETE_FAILURE",
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

export type UpdateStartAction = {
  type: ActionType.updateStart;
  payload: {
    appName: AppName;
    preservationRuleId: number;
    preservationRule: Parameters<
      typeof window.api.preservationRules.updatePreservationRule
    >[1];
  };
};
export type UpdateSuccessAction = {
  type: ActionType.updateSuccess;
  payload: { appName: AppName; preservationRule: PreservationRule };
};
export type UpdateFailureAction = {
  type: ActionType.updateFailure;
  payload: { appName: AppName; preservationRuleId: number; error: string };
};

export type DeleteStartAction = {
  type: ActionType.deleteStart;
  payload: {
    appName: AppName;
    preservationRuleId: number;
  };
};
export type DeleteSuccessAction = {
  type: ActionType.deleteSuccess;
  payload: { appName: AppName; preservationRuleId: number };
};
export type DeleteFailureAction = {
  type: ActionType.deleteFailure;
  payload: { appName: AppName; preservationRuleId: number; error: string };
};

export type Action =
  | FetchStartAction
  | FetchSuccessAction
  | FetchFailureAction
  | CreateStartAction
  | CreateSuccessAction
  | CreateFailureAction
  | UpdateStartAction
  | UpdateSuccessAction
  | UpdateFailureAction
  | DeleteStartAction
  | DeleteSuccessAction
  | DeleteFailureAction;

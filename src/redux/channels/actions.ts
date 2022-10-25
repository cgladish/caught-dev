import { Channel } from "../../api/channels";

export enum ActionType {
  fetchStart = "@@channels/FETCH_START",
  fetchSuccess = "@@channels/FETCH_SUCCESS",
  fetchFailure = "@@channels/FETCH_FAILURE",
}

export type FetchStartAction = {
  type: ActionType.fetchStart;
  payload: {
    appName: AppName;
    preservationRuleId: number;
    channelIds: string[];
  };
};
export type FetchSuccessAction = {
  type: ActionType.fetchSuccess;
  payload: {
    appName: AppName;
    preservationRuleId: number;
    channels: Channel[];
  };
};
export type FetchFailureAction = {
  type: ActionType.fetchFailure;
  payload: { appName: AppName; preservationRuleId: number; error: string };
};

export type Action = FetchStartAction | FetchSuccessAction | FetchFailureAction;

import { Message } from "../../../api/messages";
import { SearchResult } from "./state";

export enum ActionType {
  fetchStart = "@@messages/FETCH_START",
  fetchSuccess = "@@messages/FETCH_SUCCESS",
  fetchFailure = "@@messages/FETCH_FAILURE",
  searchStart = "@@messages/SEARCH_START",
  searchSuccess = "@@messages/SEARCH_SUCCESS",
  searchFailure = "@@messages/SEARCH_FAILURE",
}

export type FetchStartAction = {
  type: ActionType.fetchStart;
  payload: {
    preservationRuleId: number;
    channelId: string;
    cursor?: {
      before?: number;
      after?: number;
    };
  };
};
export type FetchSuccessAction = {
  type: ActionType.fetchSuccess;
  payload: {
    preservationRuleId: number;
    channelId: string;
    messages: Message[];
  };
};
export type FetchFailureAction = {
  type: ActionType.fetchFailure;
  payload: { error: string };
};

export type SearchStartAction = {
  type: ActionType.searchStart;
  payload: {
    preservationRuleId: number;
    channelId: string;
    filter: {
      content?: string;
      authorId?: string;
      startDatetime?: Date;
      endDatetime?: Date;
    };
    before?: number;
  };
};
export type SearchSuccessAction = {
  type: ActionType.searchSuccess;
  payload: {
    preservationRuleId: number;
    channelId: string;
    searchResult: SearchResult;
  };
};
export type SearchFailureAction = {
  type: ActionType.searchFailure;
  payload: { error: string };
};

export type Action =
  | FetchStartAction
  | FetchSuccessAction
  | FetchFailureAction
  | SearchStartAction
  | SearchSuccessAction
  | SearchFailureAction;

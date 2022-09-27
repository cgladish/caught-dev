import { Message } from "../../../api/messages";
import { ResourceStatus } from "../types";

export type SearchResult = {
  data: Message[];
  totalCount: number;
  isLastPage: boolean;
};

export type State = {
  fetchStatus: ResourceStatus;
  searchStatus: ResourceStatus;
  messages: {
    [preservationRuleId: number]: {
      [channelId: string]: Message[] | null;
    };
  };
  searchResults: {
    [preservationRuleId: number]: {
      [channelId: string]: SearchResult | null;
    };
  };
};

export const initialState: State = {
  fetchStatus: "initial",
  searchStatus: "initial",
  messages: {},
  searchResults: {},
};

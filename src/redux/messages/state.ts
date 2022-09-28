import { Message } from "../../../api/messages";
import { ResourceStatus } from "../types";

export type MessagesResult = {
  data: Message[];
  isLastPageBefore: boolean;
  isLastPageAfter: boolean;
};

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
      [channelId: string]: MessagesResult | null;
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

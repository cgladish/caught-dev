import { Channel } from "../../api/channels";
import { ResourceStatus } from "../types";

export type State = {
  fetchStatus: ResourceStatus;
  channels: Record<
    AppName,
    {
      [preservationRuleId: number]: { [channelId: string]: Channel } | null;
    } | null
  >;
};

export const initialState: State = {
  fetchStatus: "initial",
  channels: {
    discord: null,
  },
};

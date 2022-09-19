import { ResourceStatus } from "../types";

export type UserInfo = {
  username: string;
};
export type State = {
  fetchStatus: Record<AppName, ResourceStatus>;
  userInfo: Record<AppName, UserInfo | null>;
};

export const initialState: State = {
  fetchStatus: {
    discord: "initial",
  },
  userInfo: {
    discord: null,
  },
};

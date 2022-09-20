import { ResourceStatus } from "../types";

export type UserInfo = {
  id: string;
  username: string;
  email: string;
  avatar?: string;
  discriminator: string;
};
export type State = {
  fetchStatus: Record<AppName, ResourceStatus>;
  logoutStatus: Record<AppName, ResourceStatus>;
  userInfo: Record<AppName, UserInfo | null>;
};

export const initialState: State = {
  fetchStatus: {
    discord: "initial",
  },
  logoutStatus: {
    discord: "initial",
  },
  userInfo: {
    discord: null,
  },
};

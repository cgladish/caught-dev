import { ResourceStatus } from "../types";

export type UserInfo = {
  id: string;
  username: string;
  email: string;
  avatar?: string;
  discriminator: string;
};
export type State = {
  fetchStatus: ResourceStatus;
  logoutStatus: ResourceStatus;
  userInfo: Record<AppName, UserInfo | null>;
};

export const initialState: State = {
  fetchStatus: "initial",
  logoutStatus: "initial",
  userInfo: {
    discord: null,
  },
};

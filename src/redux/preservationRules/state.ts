import { ResourceStatus } from "../types";

export type PreservationRule = {
  id: number;
  appName: AppName;
  name: string;
  selected: object;
  startDatetime: Date | null;
  endDatetime: Date | null;
  createdAt: Date;
  updatedAt: Date;
};
export type State = {
  fetchStatus: ResourceStatus;
  saveStatus: ResourceStatus;
  preservationRules: Record<
    AppName,
    { [preservationRuleId: number]: PreservationRule } | null
  >;
};

export const initialState: State = {
  fetchStatus: "initial",
  saveStatus: "initial",
  preservationRules: {
    discord: null,
  },
};

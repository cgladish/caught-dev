import db from "../db";

type PreservationRule = {
  id: string;
  appName: AppName;
  name: string;
  selectedJson: string;
  startDatetime: Date | null;
  endDatetime: Date | null;
  createdAt: Date;
  updatedAt: Date;
};

export const createPreservationRule = async ({
  appName,
  name,
  selected,
  startDatetime,
  endDatetime,
}: Omit<PreservationRule, "id" | "selectedJson" | "createdAt" | "updatedAt"> & {
  selected: object;
}) => {
  await db<PreservationRule>("PreservationRule").insert({
    appName,
    name,
    selectedJson: JSON.stringify(selected),
    startDatetime,
    endDatetime,
  });
};

export const updatePreservationRule = async (
  id: string,
  {
    name,
    selected,
    startDatetime,
    endDatetime,
  }: Omit<
    PreservationRule,
    "id" | "appName" | "selectedJson" | "createdAt" | "updatedAt"
  > & {
    selected: object;
  }
) => {
  await db<PreservationRule>("PreservationRule")
    .where({ id })
    .update({
      name,
      selectedJson: JSON.stringify(selected),
      startDatetime,
      endDatetime,
    });
};

export const fetchPreservationRules = async (appName: AppName) => {
  return await db<PreservationRule>("PreservationRule")
    .where({ appName })
    .first();
};

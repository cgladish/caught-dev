import TableName from "../db/tableName";
import getDb from "../db";

export type PreservationRule = {
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
  const db = await getDb();
  await db<PreservationRule>(TableName.PreservationRule).insert({
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
  const db = await getDb();
  await db<PreservationRule>(TableName.PreservationRule)
    .where({ id })
    .update({
      name,
      selectedJson: JSON.stringify(selected),
      startDatetime,
      endDatetime,
    });
};

export const deletePreservationRule = async (id: string) => {
  const db = await getDb();
  await db<PreservationRule>(TableName.PreservationRule).where({ id }).delete();
};

export const fetchPreservationRules = async (appName: AppName) => {
  const db = await getDb();
  return await db<PreservationRule>(TableName.PreservationRule)
    .where({ appName })
    .first();
};

import TableName from "../db/tableName";
import getDb from "../db";

export type PreservationRuleEntity = {
  id: number;
  appName: AppName;
  name: string;
  selectedJson: string;
  startDatetime: string | null;
  endDatetime: string | null;
  createdAt: string;
  updatedAt: string;
};
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

const entityToType = ({
  selectedJson,
  startDatetime,
  endDatetime,
  createdAt,
  updatedAt,
  ...rest
}: PreservationRuleEntity): PreservationRule => ({
  selected: JSON.parse(selectedJson),
  startDatetime: startDatetime ? new Date(startDatetime) : null,
  endDatetime: endDatetime ? new Date(endDatetime) : null,
  createdAt: new Date(createdAt + " UTC"),
  updatedAt: new Date(updatedAt + " UTC"),
  ...rest,
});

export const createPreservationRule = async ({
  appName,
  name,
  selected,
  startDatetime,
  endDatetime,
}: Omit<
  PreservationRule,
  "id" | "createdAt" | "updatedAt"
>): Promise<PreservationRule> => {
  const db = await getDb();
  const [id] = await db<PreservationRuleEntity>(
    TableName.PreservationRule
  ).insert({
    appName,
    name,
    selectedJson: JSON.stringify(selected),
    startDatetime: startDatetime?.toISOString() ?? null,
    endDatetime: endDatetime?.toISOString() ?? null,
  });
  const preservationRule = await db<PreservationRuleEntity>(
    TableName.PreservationRule
  )
    .where({ id })
    .first();
  return entityToType(preservationRule!);
};

export const updatePreservationRule = async (
  id: number,
  {
    name,
    selected,
    startDatetime,
    endDatetime,
  }: Omit<PreservationRule, "id" | "appName" | "createdAt" | "updatedAt">
) => {
  const db = await getDb();
  await db<PreservationRuleEntity>(TableName.PreservationRule)
    .where({ id })
    .update({
      name,
      selectedJson: JSON.stringify(selected),
      startDatetime: startDatetime?.toISOString() ?? null,
      endDatetime: endDatetime?.toISOString() ?? null,
    });
  const preservationRule = await db<PreservationRuleEntity>(
    TableName.PreservationRule
  )
    .where({ id })
    .first();
  return entityToType(preservationRule!);
};

export const deletePreservationRule = async (id: number) => {
  const db = await getDb();
  await db<PreservationRuleEntity>(TableName.PreservationRule)
    .where({ id })
    .delete();
};

export const fetchPreservationRules = async (
  appName: AppName
): Promise<PreservationRule[]> => {
  const db = await getDb();
  const preservationRules = await db<PreservationRuleEntity>(
    TableName.PreservationRule
  )
    .where({ appName })
    .orderBy("updatedAt", "desc")
    .select();
  return preservationRules.map(entityToType);
};

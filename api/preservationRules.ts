import TableName from "../db/tableName";
import getDb from "../db";

export type PreservationRuleEntity = {
  id: number;
  appName: AppName;
  name: string;
  selectedJson: string;
  startDatetime: Date | null;
  endDatetime: Date | null;
  createdAt: Date;
  updatedAt: Date;
};
export type PreservationRule = Omit<PreservationRuleEntity, "selectedJson"> & {
  selected: object;
};

const entityToType = ({ selectedJson, ...rest }: PreservationRuleEntity) => ({
  selected: JSON.parse(selectedJson),
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
    startDatetime,
    endDatetime,
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
      startDatetime,
      endDatetime,
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

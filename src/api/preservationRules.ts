import TableName from "../db/tableName";
import getDb from "../db";
import { addInitialBackupToQueue } from "./messages";
import { PreservationRuleEntity } from "../db/entities";

export type PreservationRule = {
  id: number;
  appName: AppName;
  name: string;
  selected: object;
  startDatetime: Date | null;
  endDatetime: Date | null;
  initialBackupComplete: boolean;
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

export type PreservationRuleInput = Omit<
  PreservationRule,
  "id" | "initialBackupComplete" | "createdAt" | "updatedAt"
> & {
  initialBackupComplete?: boolean;
};

export const restartInitialPreservationRuleBackup = async (
  preservationRuleId: number
): Promise<void> => {
  const db = await getDb();
  const preservationRuleEntity = await db<PreservationRuleEntity>(
    TableName.PreservationRule
  )
    .where({ id: preservationRuleId })
    .first();
  if (!preservationRuleEntity) {
    throw new Error("Failed to fetch preservation rule with the provided id");
  }
  const preservationRule = entityToType(preservationRuleEntity);
  if (preservationRule.appName === "discord") {
    addInitialBackupToQueue(preservationRule);
  }
};

export const createPreservationRule = async (
  {
    appName,
    name,
    selected,
    startDatetime,
    endDatetime,
  }: PreservationRuleInput,
  runInitialBackup = true
): Promise<PreservationRule> => {
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
  const preservationRuleEntity = await db<PreservationRuleEntity>(
    TableName.PreservationRule
  )
    .where({ id })
    .first();
  const preservationRule = entityToType(preservationRuleEntity!);
  if (runInitialBackup && preservationRule.appName === "discord") {
    addInitialBackupToQueue(preservationRule);
  }
  return preservationRule;
};

export const updatePreservationRule = async (
  id: number,
  {
    selected,
    startDatetime,
    endDatetime,
    ...rest
  }: Omit<PreservationRuleInput, "appName">
) => {
  const db = await getDb();
  await db<PreservationRuleEntity>(TableName.PreservationRule)
    .where({ id })
    .update({
      selectedJson: JSON.stringify(selected),
      startDatetime: startDatetime?.toISOString() ?? null,
      endDatetime: endDatetime?.toISOString() ?? null,
      ...rest,
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

export const fetchCompletePreservationRules = async (): Promise<
  PreservationRule[]
> => {
  const db = await getDb();
  const preservationRules = await db<PreservationRuleEntity>(
    TableName.PreservationRule
  )
    .where({ initialBackupComplete: true })
    .orderBy("updatedAt", "asc")
    .select();
  return preservationRules.map(entityToType);
};

export const fetchIncompletePreservationRules = async (): Promise<
  PreservationRule[]
> => {
  const db = await getDb();
  const preservationRules = await db<PreservationRuleEntity>(
    TableName.PreservationRule
  )
    .where({ initialBackupComplete: false })
    .orderBy("updatedAt", "asc")
    .select();
  return preservationRules.map(entityToType);
};

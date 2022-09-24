import { v4 } from "uuid";
import getDb from "../db";
import { MessageEntity, PreservationRuleEntity } from "../db/entities";
import TableName from "../db/tableName";

export const makeMessage = async (
  preservationRuleId: number,
  overwrites?: Partial<MessageEntity>
): Promise<MessageEntity> => {
  const db = await getDb();
  const [id] = await db<MessageEntity>(TableName.Message).insert({
    preservationRuleId,
    externalId: v4(),
    externalChannelId: "1234567",
    authorId: "1234567",
    authorName: "Name",
    content: "Content",
    sentAt: "2022-09-21T02:00:00.000Z",
    ...overwrites,
  });
  const entity = await db<MessageEntity>(TableName.Message)
    .where({ id })
    .first();
  return entity!;
};

export const makePreservationRule = async (
  overwrites?: Partial<PreservationRuleEntity>
): Promise<PreservationRuleEntity> => {
  const db = await getDb();
  const [id] = await db<PreservationRuleEntity>(
    TableName.PreservationRule
  ).insert({
    appName: "discord",
    name: v4(),
    selectedJson: '{"key":"value"}',
    startDatetime: "2022-09-21T02:00:00.000Z",
    endDatetime: "2022-09-21T04:00:00.000Z",
    initialBackupComplete: false,
    ...overwrites,
  });
  const entity = await db<PreservationRuleEntity>(TableName.PreservationRule)
    .where({ id })
    .first();
  return entity!;
};

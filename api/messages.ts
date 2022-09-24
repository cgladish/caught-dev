import getDb from "../db";
import { MessageEntity } from "../db/entities";
import TableName from "../db/tableName";
import { DiscordSelected } from "../types/discord";
import {
  datetimeToSnowflake,
  fetchChannels,
  FetchedMessageInfo,
  fetchMessages,
  fetchMessagesCount,
} from "./discord";
import { PreservationRule, updatePreservationRule } from "./preservationRules";
import retry from "async-retry";
import queue from "queue";
import { pick } from "lodash";

const RATE_LIMIT_INTERVAL = 150; // 150ms
const waitForInterval = (() => {
  let lastFetchTime = new Date(0);
  return () => {
    let timeBeforeNextCall =
      RATE_LIMIT_INTERVAL - (Date.now() - lastFetchTime.getTime());
    if (timeBeforeNextCall > 0) {
      return new Promise<void>((resolve) => {
        setTimeout(() => {
          lastFetchTime = new Date();
          resolve();
        }, timeBeforeNextCall);
      });
    }
    lastFetchTime = new Date();
    return Promise.resolve();
  };
})();

const fetchedMessageToEntity = (
  preservationRuleId: number,
  channelId: string,
  {
    id,
    author,
    content,
    timestamp,
    attachments,
    embeds,
    sticker_items,
  }: FetchedMessageInfo
): Omit<MessageEntity, "id"> => ({
  preservationRuleId: preservationRuleId,
  externalId: id,
  externalChannelId: channelId,
  authorId: author.id,
  authorName: author.username,
  authorAvatar: author.avatar,
  content,
  sentAt: timestamp,
  appSpecificDataJson: JSON.stringify({
    attachments,
    embeds,
    sticker_items,
  }),
});

export const getMessagesCount = async (
  preservationRuleId: number
): Promise<number> => {
  const db = await getDb();
  const existingMessagesCount = await db<MessageEntity>(TableName.Message)
    .where({ preservationRuleId })
    .count("id")
    .first();
  return Number(Object.values(existingMessagesCount!)[0]);
};

export const getLatestChannelMessage = async (
  preservationRuleId: number,
  externalChannelId: string
): Promise<MessageEntity | undefined> => {
  const db = await getDb();
  const latestMessage = await db<MessageEntity>(TableName.Message)
    .where({ preservationRuleId, externalChannelId })
    .orderBy("sentAt", "desc")
    .first();
  return latestMessage;
};

export type BackupsInProgress = {
  [preservationRuleId: number]: {
    progressRatio: number;
    started: boolean;
    complete: boolean;
    errored: boolean;
  };
};
const backupsInProgress: BackupsInProgress = {};
export const getBackupProgress = async (
  ...preservationRuleIds: number[]
): Promise<BackupsInProgress> => {
  const backupProgress: BackupsInProgress = {};
  preservationRuleIds.forEach((preservationRuleId) => {
    const backupInProgress = backupsInProgress[preservationRuleId];
    if (backupInProgress) {
      backupProgress[preservationRuleId] = backupInProgress;
    }
  });
  return backupProgress;
};

export const initialBackupQueue = queue({
  concurrency: 1,
  autostart: true,
});

type DiscordSpecificData = Pick<
  FetchedMessageInfo,
  "attachments" | "embeds" | "sticker_items"
>;
export const runInitialBackupDiscord = async (
  preservationRule: PreservationRule
) => {
  const backupInProgress = {
    progressRatio: 0,
    started: false,
    complete: false,
    errored: false,
  };
  try {
    backupsInProgress[preservationRule.id] = backupInProgress;

    const db = await getDb();
    const selected = preservationRule.selected as DiscordSelected;

    const { startDatetime, endDatetime } = preservationRule;
    const startSnowflake = startDatetime
      ? datetimeToSnowflake(startDatetime)
      : 0;
    const endSnowflake = datetimeToSnowflake(endDatetime ?? new Date());

    let totalMessages = 0;
    for (let [guildId, { channelIds }] of Object.entries(selected.guilds)) {
      if (!channelIds) {
        await waitForInterval();
        const channels = await retry(() => fetchChannels(guildId), {
          retries: 5,
        });
        channelIds = channels.map(({ id }) => id);
        selected.guilds[guildId]!.channelIds = channelIds;
      }

      for (let channelId of channelIds) {
        await waitForInterval();
        totalMessages += await retry(
          () =>
            fetchMessagesCount({
              guildId,
              startSnowflake: startSnowflake.toString(),
              endSnowflake: endSnowflake.toString(),
              channelId,
            }),
          { retries: 5 }
        );
      }
    }
    let messagesFetched = await retry(
      () => getMessagesCount(preservationRule.id),
      {
        retries: 3,
      }
    );

    backupInProgress.started = true;
    backupInProgress.progressRatio = messagesFetched / totalMessages;

    for (let { channelIds } of Object.values(selected.guilds)) {
      for (let channelId of channelIds!) {
        const latestChannelMessage = await retry(
          () => getLatestChannelMessage(preservationRule.id, channelId),
          { retries: 3 }
        );
        let latestMessageExternalId: string | undefined =
          latestChannelMessage?.externalId;
        let messagesToCreate: Omit<MessageEntity, "id">[] | undefined;
        while (!messagesToCreate || messagesToCreate.length) {
          await waitForInterval();
          let messages = await retry(
            () =>
              fetchMessages(channelId, {
                after: latestMessageExternalId ?? startSnowflake.toString(),
                limit: 100,
              }),
            { retries: 5 }
          );
          if (
            endDatetime &&
            messages[0] &&
            new Date(messages[0].timestamp) >= endDatetime
          ) {
            const postFilterIndex = messages.findIndex(
              ({ timestamp }) => new Date(timestamp) < endDatetime
            );
            messages =
              postFilterIndex === -1 ? [] : messages.slice(postFilterIndex);
          }
          messagesToCreate = messages.map((fetchedMessage) =>
            fetchedMessageToEntity(
              preservationRule.id,
              channelId,
              fetchedMessage
            )
          );
          if (messagesToCreate[0]) {
            latestMessageExternalId = messagesToCreate[0].externalId;
            await retry(
              () =>
                db<MessageEntity>(TableName.Message).insert(messagesToCreate!),
              { retries: 2 }
            );
          }
          messagesFetched += messages.length;
          backupInProgress.progressRatio = messagesFetched / totalMessages;
        }
      }
    }
    backupInProgress.progressRatio = 1;
    backupInProgress.complete = true;

    await updatePreservationRule(preservationRule.id, {
      ...pick(
        preservationRule,
        "name",
        "selected",
        "startDatetime",
        "endDatetime"
      ),
      initialBackupComplete: true,
    });
  } catch (err) {
    console.error(err);
    backupInProgress.errored = true;
  }
};

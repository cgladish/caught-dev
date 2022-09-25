import getDb from "../db";
import { MessageEntity } from "../db/entities";
import TableName from "../db/tableName";
import { DiscordSelected } from "../types/discord";
import {
  datetimeToSnowflake,
  fetchChannels,
  fetchDmChannels,
  FetchedMessageInfo,
  fetchGuilds,
  fetchMessages,
  fetchMessagesCount,
} from "./discord";
import { PreservationRule, updatePreservationRule } from "./preservationRules";
import retry from "async-retry";
import queue from "queue";
import { pick } from "lodash";

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

const regularBackupQueue = queue({
  concurrency: 1,
  autostart: true,
});
export const isRegularBackupInProgress = () => !!regularBackupQueue.length;
export const addRegularBackupToQueue = (preservationRule: PreservationRule) => {
  regularBackupQueue.push(() => runRegularBackupDiscord(preservationRule));
};

export const runRegularBackupDiscord = async (
  preservationRule: PreservationRule
) => {
  try {
    const db = await getDb();
    const selected = preservationRule.selected as DiscordSelected;

    const { startDatetime, endDatetime } = preservationRule;
    const startSnowflake = startDatetime
      ? datetimeToSnowflake(startDatetime)
      : 0;
    const endSnowflake = datetimeToSnowflake(endDatetime ?? new Date());

    const preservationRuleCreatedSnowflake = datetimeToSnowflake(
      preservationRule.createdAt
    );
    for (let [
      guildId,
      { channelIds, autoPreserveNewChannels },
    ] of Object.entries(selected.guilds)) {
      if (autoPreserveNewChannels && channelIds) {
        const channels = await retry(() => fetchChannels(guildId), {
          retries: 5,
        });
        const newChannels = channels.filter(
          ({ id }) =>
            !channelIds!.includes(id) &&
            BigInt(id) > preservationRuleCreatedSnowflake
        );
        channelIds.push(...newChannels.map(({ id }) => id));
      }
    }
    if (selected.autoPreserveNewGuilds) {
      const guilds = await retry(() => fetchGuilds(), {
        retries: 5,
      });
      const newGuilds = guilds.filter(
        ({ id }) =>
          !selected.dmChannelIds.includes(id) &&
          BigInt(id) > preservationRuleCreatedSnowflake
      );
      for (let newGuild of newGuilds) {
        const channels = await retry(() => fetchChannels(newGuild.id), {
          retries: 5,
        });
        selected.guilds[newGuild.id] = {
          autoPreserveNewChannels: true,
          channelIds: channels.map(({ id }) => id),
        };
      }
    }
    if (selected.autoPreserveNewDmChannels) {
      const dmChannels = await retry(() => fetchDmChannels(), {
        retries: 5,
      });
      const newChannels = dmChannels.filter(
        ({ id }) =>
          !selected.dmChannelIds.includes(id) &&
          BigInt(id) > preservationRuleCreatedSnowflake
      );
      selected.dmChannelIds.push(...newChannels.map(({ id }) => id));
    }

    const allChannelIds = [
      ...Object.values(selected.guilds).flatMap(
        ({ channelIds }) => channelIds!
      ),
      ...selected.dmChannelIds,
    ];

    for (let channelId of allChannelIds) {
      const latestChannelMessage = await retry(
        () => getLatestChannelMessage(preservationRule.id, channelId),
        { retries: 3 }
      );

      let latestMessageExternalId: string | undefined =
        latestChannelMessage?.externalId;
      let messagesToCreate: Omit<MessageEntity, "id">[] | undefined;
      while (!messagesToCreate || messagesToCreate.length) {
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
          BigInt(messages[0].id) >= endSnowflake
        ) {
          const postFilterIndex = messages.findIndex(
            ({ id }) => BigInt(id) < endSnowflake
          );
          messages =
            postFilterIndex === -1 ? [] : messages.slice(postFilterIndex);
        }
        messagesToCreate = messages.map((fetchedMessage) =>
          fetchedMessageToEntity(preservationRule.id, channelId, fetchedMessage)
        );
        if (messagesToCreate[0]) {
          latestMessageExternalId = messagesToCreate[0].externalId;
          await retry(
            () =>
              db<MessageEntity>(TableName.Message).insert(messagesToCreate!),
            { retries: 2 }
          );
        }
      }
    }

    await updatePreservationRule(preservationRule.id, {
      ...pick(
        preservationRule,
        "name",
        "selected",
        "startDatetime",
        "endDatetime"
      ),
    });
  } catch (err) {
    console.error(err);
  }
};

export type BackupsInProgress = {
  [preservationRuleId: number]: {
    currentMessages: number;
    totalMessages: number;
    status: "queued" | "preparing" | "started" | "complete" | "errored";
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

const initialBackupQueue = queue({
  concurrency: 1,
  autostart: true,
});
export const addInitialBackupToQueue = (preservationRule: PreservationRule) => {
  backupsInProgress[preservationRule.id] = {
    currentMessages: 0,
    totalMessages: 0,
    status: "queued",
  };
  initialBackupQueue.push(() => runInitialBackupDiscord(preservationRule));
};

type DiscordSpecificData = Pick<
  FetchedMessageInfo,
  "attachments" | "embeds" | "sticker_items"
>;
export const runInitialBackupDiscord = async (
  preservationRule: PreservationRule
) => {
  const backupInProgress = backupsInProgress[preservationRule.id]!;
  try {
    backupInProgress.status = "preparing";

    const db = await getDb();
    const selected = preservationRule.selected as DiscordSelected;

    const { startDatetime, endDatetime } = preservationRule;
    const startSnowflake = startDatetime
      ? datetimeToSnowflake(startDatetime)
      : 0;
    const endSnowflake = datetimeToSnowflake(endDatetime ?? new Date());

    for (let [guildId, { channelIds }] of Object.entries(selected.guilds)) {
      if (!channelIds) {
        const channels = await retry(() => fetchChannels(guildId), {
          retries: 5,
        });
        channelIds = channels.map(({ id }) => id);
        selected.guilds[guildId]!.channelIds = channelIds;
      }
    }
    const allChannelIds = [
      ...Object.values(selected.guilds).flatMap(
        ({ channelIds }) => channelIds!
      ),
      ...selected.dmChannelIds,
    ];

    for (let channelId of allChannelIds) {
      backupInProgress.totalMessages += await retry(
        () =>
          fetchMessagesCount({
            channelId,
            startSnowflake: startSnowflake.toString(),
            endSnowflake: endSnowflake.toString(),
          }),
        { retries: 5 }
      );
    }
    backupInProgress.currentMessages = await retry(
      () => getMessagesCount(preservationRule.id),
      {
        retries: 3,
      }
    );

    backupInProgress.status = "started";
    for (let channelId of allChannelIds) {
      const latestChannelMessage = await retry(
        () => getLatestChannelMessage(preservationRule.id, channelId),
        { retries: 3 }
      );
      let latestMessageExternalId: string | undefined =
        latestChannelMessage?.externalId;
      let messagesToCreate: Omit<MessageEntity, "id">[] | undefined;
      while (!messagesToCreate || messagesToCreate.length) {
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
          BigInt(messages[0].id) >= endSnowflake
        ) {
          const postFilterIndex = messages.findIndex(
            ({ id }) => BigInt(id) < endSnowflake
          );
          messages =
            postFilterIndex === -1 ? [] : messages.slice(postFilterIndex);
        }
        messagesToCreate = messages.map((fetchedMessage) =>
          fetchedMessageToEntity(preservationRule.id, channelId, fetchedMessage)
        );
        if (messagesToCreate[0]) {
          latestMessageExternalId = messagesToCreate[0].externalId;
          await retry(
            () =>
              db<MessageEntity>(TableName.Message).insert(messagesToCreate!),
            { retries: 2 }
          );
        }
        backupInProgress.currentMessages += messages.length;
      }
    }
    backupInProgress.status = "complete";

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
    backupInProgress.status = "errored";
  }
};

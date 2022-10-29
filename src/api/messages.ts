import getDb from "../db";
import { MessageEntity } from "../db/entities";
import TableName from "../db/tableName";
import { DiscordSelected } from "../discord";
import {
  datetimeToSnowflake,
  fetchChannels,
  fetchDmChannels,
  FetchedMessageInfo,
  fetchGuilds,
  fetchMessages as fetchDiscordMessages,
  fetchMessagesCount as fetchDiscordMessagesCount,
} from "./discord";
import { PreservationRule, updatePreservationRule } from "./preservationRules";
import retry from "async-retry";
import queue from "queue";
import { pick } from "lodash";
import log from "electron-log";
import { createOrUpdateChannels } from "./channels";
import { updateWordCounts } from "./wordCounts";

export type Message = {
  id: number;
  preservationRuleId: number;
  externalId: string;
  externalChannelId: string;
  authorId: string;
  authorName: string;
  authorAvatar?: string | null;
  content: string;
  sentAt: Date;
  appSpecificData?: object | null;
};

export type DiscordMessage = Omit<Message, "appSpecificData"> & {
  appSpecificData?: Pick<
    FetchedMessageInfo,
    "attachments" | "embeds" | "sticker_items"
  >;
};

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

export const entityToType = ({
  sentAt,
  appSpecificDataJson,
  ...rest
}: MessageEntity): Message => ({
  sentAt: new Date(sentAt),
  appSpecificData: appSpecificDataJson && JSON.parse(appSpecificDataJson),
  ...rest,
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
): Promise<Message | undefined> => {
  const db = await getDb();
  const latestMessage = await db<MessageEntity>(TableName.Message)
    .where({ preservationRuleId, externalChannelId })
    .orderBy("sentAt", "desc")
    .first();
  return latestMessage && entityToType(latestMessage);
};

export const MESSAGE_LIMIT = 20;
export const searchMessages = async (
  preservationRuleId: number,
  externalChannelId: string,
  filter: {
    content?: string;
    authorId?: string;
    startDatetime?: Date;
    endDatetime?: Date;
  },
  before?: number
): Promise<{
  data: Message[];
  totalCount: number;
  isLastPage: boolean;
}> => {
  const db = await getDb();
  const createQuery = () => {
    let query = db<MessageEntity>(TableName.MessageSearch).where({
      preservationRuleId,
      externalChannelId,
    });
    if (filter?.content) {
      query = query.andWhereRaw(
        `content MATCH '"${filter.content
          .replaceAll('"', '""')
          .replaceAll("'", "''")}"'`
      );
    }
    if (filter?.authorId) {
      query = query.andWhere("authorId", filter.authorId);
    }
    if (filter?.startDatetime) {
      query = query.andWhere(
        "sentAt",
        ">=",
        filter.startDatetime.toISOString()
      );
    }
    if (filter?.endDatetime) {
      query = query.andWhere("sentAt", "<=", filter.endDatetime.toISOString());
    }
    return query;
  };

  const totalCountResult = await createQuery().count("rowid").first();

  let messagesQuery = createQuery();
  if (before) {
    const message = await db<MessageEntity>(TableName.Message)
      .where({ id: before })
      .first();
    if (!message) {
      throw new Error("invalid message id");
    }
    messagesQuery = messagesQuery.where("sentAt", "<", message.sentAt);
  }
  const messages = await messagesQuery
    .orderBy("sentAt", "desc")
    .limit(MESSAGE_LIMIT + 1);

  return {
    data: messages.slice(0, MESSAGE_LIMIT).map(entityToType),
    totalCount: Number(Object.values(totalCountResult!)[0]),
    isLastPage: messages.length <= MESSAGE_LIMIT,
  };
};
export const fetchMessages = async (
  preservationRuleId: number,
  externalChannelId: string,
  cursor?: {
    before?: number;
    after?: number;
  }
): Promise<{
  data: Message[];
  isLastPage: boolean;
}> => {
  const db = await getDb();
  let query = db<MessageEntity>(TableName.Message).where({
    preservationRuleId,
    externalChannelId,
  });
  if (cursor?.before) {
    const message = await db<MessageEntity>(TableName.Message)
      .where({ id: cursor.before })
      .first();
    if (!message) {
      throw new Error("invalid message id");
    }
    query = query
      .where("sentAt", "<", message.sentAt)
      .orderBy("sentAt", "desc");
  } else if (cursor?.after) {
    const message = await db<MessageEntity>(TableName.Message)
      .where({ id: cursor.after })
      .first();
    if (!message) {
      throw new Error("invalid message id");
    }
    query = query.where("sentAt", ">", message.sentAt).orderBy("sentAt", "asc");
  } else {
    query = query.orderBy("sentAt", "desc");
  }
  const messages = await query.limit(MESSAGE_LIMIT + 1);
  return {
    data: messages.slice(0, MESSAGE_LIMIT).map(entityToType),
    isLastPage: messages.length <= MESSAGE_LIMIT,
  };
};

const regularBackupQueue = queue({
  concurrency: 1,
  autostart: true,
});
export let isRegularBackupInProgress = false;
regularBackupQueue.on("start", () => {
  isRegularBackupInProgress = true;
});
regularBackupQueue.on("end", () => {
  isRegularBackupInProgress = false;
});
export const addRegularBackupToQueue = (preservationRule: PreservationRule) => {
  regularBackupQueue.push(() => runRegularBackupDiscord(preservationRule));
};
export const waitForRegularBackupsToFinish = async () => {
  while (true) {
    if (!isRegularBackupInProgress) {
      break;
    }
    await new Promise<void>((resolve) => setTimeout(() => resolve(), 100));
  }
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

    for (let [guildId, guild] of Object.entries(selected.guilds)) {
      if (guild.autoPreserveNewChannels && guild.channelIds) {
        const channels = await retry(() => fetchChannels(guildId), {
          retries: 5,
        });
        const newChannels = channels.filter(
          ({ id }) =>
            !guild.channelIds!.includes(id) &&
            BigInt(id) > preservationRuleCreatedSnowflake
        );
        await retry(
          () =>
            createOrUpdateChannels(
              newChannels.map(({ id, name }) => ({
                appName: "discord",
                externalId: id,
                name: name,
                iconUrl: null,
              }))
            ),
          { retries: 2 }
        );
        guild.channelIds.push(...newChannels.map(({ id }) => id));
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
      await retry(
        () =>
          createOrUpdateChannels(
            newGuilds.map(({ id, name, icon }) => ({
              appName: "discord",
              externalId: id,
              name: name,
              iconUrl: icon
                ? `https://cdn.discordapp.com/icons/${id}/${icon}`
                : null,
            }))
          ),
        { retries: 2 }
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
      await retry(
        () =>
          createOrUpdateChannels(
            newChannels.map(({ id, recipients }) => ({
              appName: "discord",
              externalId: id,
              name: recipients.map(({ username }) => username).join(", "),
              iconUrl:
                recipients.length === 1
                  ? `https://cdn.discordapp.com/avatars/${recipients[0]!.id}/${
                      recipients[0]!.avatar
                    }`
                  : null,
            }))
          ),
        { retries: 2 }
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
            fetchDiscordMessages(channelId, {
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
          await retry(
            () => updateWordCounts(preservationRule.id, messagesToCreate!),
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
    log.error(err);
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

    const guilds = await retry(() => fetchGuilds(), {
      retries: 5,
    });
    await retry(
      () =>
        createOrUpdateChannels(
          guilds.map(({ id, name, icon }) => ({
            appName: "discord",
            externalId: id,
            name: name,
            iconUrl: icon
              ? `https://cdn.discordapp.com/icons/${id}/${icon}`
              : null,
          }))
        ),
      { retries: 2 }
    );

    for (let [guildId, { channelIds }] of Object.entries(selected.guilds)) {
      const channels = await retry(() => fetchChannels(guildId), {
        retries: 5,
      });
      await retry(
        () =>
          createOrUpdateChannels(
            channels.map(({ id, name }) => ({
              appName: "discord",
              externalId: id,
              name: name,
              iconUrl: null,
            }))
          ),
        { retries: 2 }
      );
      if (!channelIds) {
        channelIds = channels.map(({ id }) => id);
        selected.guilds[guildId]!.channelIds = channelIds;
      }
    }

    const dmChannels = await retry(() => fetchDmChannels(), { retries: 5 });
    await retry(
      () =>
        createOrUpdateChannels(
          dmChannels.map(({ id, recipients }) => ({
            appName: "discord",
            externalId: id,
            name: recipients.map(({ username }) => username).join(", "),
            iconUrl:
              recipients.length === 1
                ? `https://cdn.discordapp.com/avatars/${recipients[0]!.id}/${
                    recipients[0]!.avatar
                  }`
                : null,
          }))
        ),
      { retries: 2 }
    );

    const allChannelIds = [
      ...Object.values(selected.guilds).flatMap(
        ({ channelIds }) => channelIds!
      ),
      ...selected.dmChannelIds,
    ];

    for (let channelId of allChannelIds) {
      backupInProgress.totalMessages += await retry(
        () =>
          fetchDiscordMessagesCount({
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
      await waitForRegularBackupsToFinish();
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
            fetchDiscordMessages(channelId, {
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
          await retry(
            () => updateWordCounts(preservationRule.id, messagesToCreate!),
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
    log.error(err);
    backupInProgress.status = "errored";
  }
};

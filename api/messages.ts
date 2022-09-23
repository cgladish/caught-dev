import getDb from "../db";
import { MessageEntity } from "../db/entities";
import TableName from "../db/tableName";
import { DiscordSelected } from "../types/discord";
import { fetchChannels, FetchedMessageInfo, fetchMessages } from "./discord";
import { PreservationRule } from "./preservationRules";
import retry from "async-retry";

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

type DiscordSpecificData = Pick<
  FetchedMessageInfo,
  "attachments" | "embeds" | "sticker_items"
>;
export const runInitialBackup = async (preservationRule: PreservationRule) => {
  try {
    const db = await getDb();
    if (preservationRule.appName === "discord") {
      const selected = preservationRule.selected as DiscordSelected;

      for (let [guildId, { channelIds }] of Object.entries(selected.guilds)) {
        // Populate missing channel IDs
        if (!channelIds) {
          const channels = await fetchChannels(guildId);
          channelIds = channels.map(({ id }) => id);
          selected.guilds[guildId].channelIds = channelIds;
        }
        for (let channelId of channelIds) {
          let messagesToCreate: Omit<MessageEntity, "id">[] | undefined;
          while (!messagesToCreate || messagesToCreate.length) {
            await waitForInterval();
            const messages = await retry(
              () =>
                fetchMessages(channelId, {
                  before:
                    messagesToCreate?.[messagesToCreate.length - 1]?.externalId,
                  limit: 100,
                }),
              { retries: 5 }
            );
            messagesToCreate = messages.map(
              ({
                id,
                author,
                content,
                timestamp,
                attachments,
                embeds,
                sticker_items,
              }) => ({
                preservationRuleId: preservationRule.id,
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
              })
            );
            if (messagesToCreate.length) {
              await retry(
                () =>
                  db<MessageEntity>(TableName.Message).insert(
                    messagesToCreate!
                  ),
                { retries: 2 }
              );
            }
          }
        }
      }
    }
  } catch (err) {
    console.error(err);
  }
};

import getDb from "../db";
import { ChannelEntity } from "../db/entities";
import TableName from "../db/tableName";

export type Channel = ChannelEntity;

export type ChannelInput = Omit<ChannelEntity, "id">;

export const fetchChannels = async (
  appName: AppName,
  channelIds: string[]
): Promise<Channel[]> => {
  const db = await getDb();
  const channels = await db<ChannelEntity>(TableName.Channel)
    .where({ appName })
    .andWhere("externalId", "IN", channelIds);
  return channels;
};

export const createOrUpdateChannels = async (
  channelInputs: ChannelInput[]
): Promise<void> => {
  const db = await getDb();
  await Promise.all(
    channelInputs.map((channel) =>
      db<ChannelEntity>(TableName.Channel)
        .insert({ ...channel, iconUrl: channel.iconUrl ?? null })
        .onConflict(["appName", "externalId"])
        .merge()
    )
  );
};

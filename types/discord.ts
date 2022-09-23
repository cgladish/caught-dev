export type DiscordSelected = {
  guilds: {
    [guildId: string]: {
      autoPreserveNewChannels: boolean;
      channelIds: string[] | null;
    };
  };
  dmChannelIds: string[];
  autoPreserveNewGuilds: boolean;
  autoPreserveNewDmChannels: boolean;
};

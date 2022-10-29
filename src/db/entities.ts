export type ServiceAuthEntity = {
  id: number;
  appName: AppName;
  encryptedToken: string;
};

export type PreservationRuleEntity = {
  id: number;
  appName: AppName;
  name: string;
  selectedJson: string;
  startDatetime?: string | null;
  endDatetime?: string | null;
  initialBackupComplete: boolean;
  createdAt: string;
  updatedAt: string;
};

export type ChannelEntity = {
  id: number;
  appName: AppName;
  externalId: string;
  name: string;
  iconUrl?: string | null;
};

export type MessageEntity = {
  id: number;
  preservationRuleId: number;
  externalId: string;
  externalChannelId: string;
  authorId: string;
  authorName: string;
  authorAvatar?: string | null;
  content: string;
  sentAt: string;
  appSpecificDataJson?: string | null;
};

export type WordCountEntity = {
  id: number;
  preservationRuleId: number;
  word: string;
  count: number;
};

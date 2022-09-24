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
  startDatetime: string | null;
  endDatetime: string | null;
  initialBackupComplete: boolean;
  createdAt: string;
  updatedAt: string;
};

export type MessageEntity = {
  id: number;
  preservationRuleId: number;
  externalId: string;
  externalChannelId: string;
  authorId: string;
  authorName: string;
  authorAvatar?: string;
  content: string;
  sentAt: string;
  appSpecificDataJson?: string;
};

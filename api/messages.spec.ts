import { Knex } from "knex";
import getDb from "../db";
import { getLatestChannelMessage, getMessagesCount } from "./messages";
import { makeMessage, makePreservationRule } from "./mockData";

describe("preservationRules", () => {
  let db: Knex;

  beforeEach(async () => {
    db = await getDb();
  });

  describe("getMessagesCount", () => {
    it("gets message count correctly for a preservation rule", async () => {
      const { id: preservationRuleId } = await makePreservationRule();
      const { id: preservationRuleIdOther } = await makePreservationRule();
      await makeMessage(preservationRuleId);
      await makeMessage(preservationRuleId);
      await makeMessage(preservationRuleId);
      await makeMessage(preservationRuleIdOther);

      const messageCount = await getMessagesCount(preservationRuleId);
      expect(messageCount).toEqual(3);
    });

    it("gets message count correctly when no messages", async () => {
      const messageCount = await getMessagesCount(1);
      expect(messageCount).toEqual(0);
    });
  });

  describe("getLatestChannelMessage", () => {
    it("gets latest channel message correctly for a channel ID", async () => {
      const { id: preservationRuleId } = await makePreservationRule();
      const { id: preservationRuleIdOther } = await makePreservationRule();
      await makeMessage(preservationRuleId, {
        externalChannelId: "123",
        sentAt: "2022-09-20T10:00:00.000Z",
      });
      const correctLatestMessage = await makeMessage(preservationRuleId, {
        externalChannelId: "123",
        sentAt: "2022-09-21T02:00:00.000Z",
      });
      await makeMessage(preservationRuleId, {
        externalChannelId: "123",
        sentAt: "2022-09-21T00:00:00.000Z",
      });
      await makeMessage(preservationRuleId, {
        externalChannelId: "123",
        sentAt: "2022-09-21T01:00:00.000Z",
      });
      await makeMessage(preservationRuleId, {
        externalChannelId: "321",
        sentAt: "2022-09-21T10:00:00.000Z",
      });
      await makeMessage(preservationRuleIdOther, {
        externalChannelId: "321",
        sentAt: "2022-09-21T10:00:00.000Z",
      });

      const latestMessage = await getLatestChannelMessage("123");
      expect(latestMessage).toEqual(correctLatestMessage);
    });

    it("gets undefined when no messages for channel", async () => {
      const latestMessage = await getLatestChannelMessage("123");
      expect(latestMessage).toBeUndefined();
    });
  });
});

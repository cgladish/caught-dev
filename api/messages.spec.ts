import { addMinutes } from "date-fns";
import { Knex } from "knex";
import { sortBy } from "lodash";
import getDb from "../db";
import { MessageEntity } from "../db/entities";
import {
  entityToType,
  fetchMessages,
  getLatestChannelMessage,
  getMessagesCount,
  Message,
  MESSAGE_LIMIT,
  searchMessages,
} from "./messages";
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
      const correctLatestMessage = entityToType(
        await makeMessage(preservationRuleId, {
          externalChannelId: "123",
          sentAt: "2022-09-21T02:00:00.000Z",
        })
      );
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
        externalChannelId: "123",
        sentAt: "2022-09-21T10:00:00.000Z",
      });

      const latestMessage = await getLatestChannelMessage(
        preservationRuleId,
        "123"
      );
      expect(latestMessage).toEqual(correctLatestMessage);
    });

    it("gets undefined when no messages for channel", async () => {
      const latestMessage = await getLatestChannelMessage(1, "123");
      expect(latestMessage).toBeUndefined();
    });
  });

  describe("searchMessages", () => {
    const channelId = "123";
    const channelIdOther = "321";
    const author1 = "123";
    const author2 = "321";
    const content1 = "it's a me, mario!";
    const content2 = "it's a you, wario!";

    let preservationRuleId: number;
    let preservationRuleIdOther: number;
    let messageAuthor1Content1: Message;
    let messageAuthor1Content2: Message;
    let messageAuthor2Content1: Message;
    let messageAuthor2Content2: Message;
    let otherMessages: Message[];

    beforeEach(async () => {
      preservationRuleId = (await makePreservationRule()).id;
      preservationRuleIdOther = (await makePreservationRule()).id;

      messageAuthor1Content1 = entityToType(
        await makeMessage(preservationRuleId, {
          externalChannelId: channelId,
          authorId: author1,
          content: content1,
          sentAt: "2022-09-21T02:00:00.000Z",
        })
      );
      messageAuthor1Content2 = entityToType(
        await makeMessage(preservationRuleId, {
          externalChannelId: channelId,
          authorId: author1,
          content: content2,
          sentAt: "2022-09-21T00:00:00.000Z",
        })
      );
      messageAuthor2Content1 = entityToType(
        await makeMessage(preservationRuleId, {
          externalChannelId: channelId,
          authorId: author2,
          content: content1,
          sentAt: "2022-09-21T01:00:00.000Z",
        })
      );
      messageAuthor2Content2 = entityToType(
        await makeMessage(preservationRuleId, {
          externalChannelId: channelId,
          authorId: author2,
          content: content2,
          sentAt: "2022-09-21T03:00:00.000Z",
        })
      );

      otherMessages = [];
      const startDate = new Date("2022-09-21T00:00:00.000Z");
      for (let i = 0; i < 100; ++i) {
        const sentAt = addMinutes(startDate, i * 10).toISOString();
        otherMessages.push(
          entityToType(
            await makeMessage(preservationRuleId, {
              externalChannelId: channelId,
              sentAt,
            })
          )
        );
        await makeMessage(preservationRuleIdOther, {
          externalChannelId: channelId,
          sentAt,
        });
        await makeMessage(preservationRuleId, {
          externalChannelId: channelIdOther,
          sentAt,
        });
      }
    });

    it("can search when filtering by author", async () => {
      const searchResult = await searchMessages(preservationRuleId, channelId, {
        authorId: author1,
      });

      expect(searchResult.data.length).toEqual(2);
      expect(searchResult.data).toEqual([
        messageAuthor1Content1,
        messageAuthor1Content2,
      ]);
      expect(searchResult.totalCount).toEqual(2);
      expect(searchResult.isLastPage).toBeTruthy();
    });

    it("can search when filtering by content", async () => {
      let searchResult = await searchMessages(preservationRuleId, channelId, {
        content: "it's",
      });

      expect(searchResult.data.length).toEqual(4);
      expect(searchResult.data).toEqual([
        messageAuthor2Content2,
        messageAuthor1Content1,
        messageAuthor2Content1,
        messageAuthor1Content2,
      ]);
      expect(searchResult.totalCount).toEqual(4);
      expect(searchResult.isLastPage).toBeTruthy();

      searchResult = await searchMessages(preservationRuleId, channelId, {
        content: ", wario",
      });

      expect(searchResult.data.length).toEqual(2);
      expect(sortBy(searchResult.data, "sentAt")).toEqual([
        messageAuthor1Content2,
        messageAuthor2Content2,
      ]);
      expect(searchResult.totalCount).toEqual(2);
      expect(searchResult.isLastPage).toBeTruthy();

      searchResult = await searchMessages(preservationRuleId, channelId, {
        content: ", mario!",
      });

      expect(searchResult.data.length).toEqual(2);
      expect(sortBy(searchResult.data, "sentAt")).toEqual([
        messageAuthor2Content1,
        messageAuthor1Content1,
      ]);
      expect(searchResult.totalCount).toEqual(2);
      expect(searchResult.isLastPage).toBeTruthy();

      searchResult = await searchMessages(preservationRuleId, channelId, {
        content: "me",
      });

      expect(searchResult.data.length).toEqual(2);
      expect(sortBy(searchResult.data, "sentAt")).toEqual([
        messageAuthor2Content1,
        messageAuthor1Content1,
      ]);

      expect(searchResult.totalCount).toEqual(2);
      expect(searchResult.isLastPage).toBeTruthy();
    });

    it("can search when filtering by start datetime", async () => {
      let searchResult = await searchMessages(preservationRuleId, channelId, {
        startDatetime: new Date("2022-09-21T02:00:00.000Z"),
      });

      expect(searchResult.data.length).toEqual(20);
      expect(searchResult.data).toEqual(
        sortBy(
          otherMessages.slice(otherMessages.length - MESSAGE_LIMIT),
          "sentAt"
        ).reverse()
      );
      expect(searchResult.isLastPage).toBeFalsy();

      searchResult = await searchMessages(preservationRuleId, channelId, {
        startDatetime: new Date("2022-09-21T15:00:00.000Z"),
      });

      expect(searchResult.data.length).toEqual(10);
      expect(searchResult.data).toEqual(
        sortBy(
          otherMessages.slice(otherMessages.length - 10),
          "sentAt"
        ).reverse()
      );
      expect(searchResult.isLastPage).toBeTruthy();

      searchResult = await searchMessages(preservationRuleId, channelId, {
        startDatetime: new Date("2022-09-21T20:00:00.000Z"),
      });

      expect(searchResult.data.length).toEqual(0);
      expect(searchResult.isLastPage).toBeTruthy();
    });

    it("can search when filtering by end datetime", async () => {
      let searchResult = await searchMessages(preservationRuleId, channelId, {
        endDatetime: new Date("2022-09-21T20:00:00.000Z"),
      });

      expect(searchResult.data.length).toEqual(20);
      expect(searchResult.data).toEqual(
        sortBy(
          otherMessages.slice(otherMessages.length - MESSAGE_LIMIT),
          "sentAt"
        ).reverse()
      );
      expect(searchResult.isLastPage).toBeFalsy();

      searchResult = await searchMessages(preservationRuleId, channelId, {
        endDatetime: new Date("2022-09-21T10:00:00.000Z"),
      });

      expect(searchResult.data.length).toEqual(20);
      expect(searchResult.data).toEqual(
        sortBy(otherMessages.slice(41, 61), "sentAt").reverse()
      );
      expect(searchResult.isLastPage).toBeFalsy();

      searchResult = await searchMessages(preservationRuleId, channelId, {
        endDatetime: new Date("2022-09-21T01:00:00.000Z"),
      });

      expect(searchResult.data.length).toEqual(9);
      expect(searchResult.data).toEqual(
        sortBy(
          [
            ...otherMessages.slice(0, 7),
            messageAuthor1Content2,
            messageAuthor2Content1,
          ],
          "sentAt"
        ).reverse()
      );
      expect(searchResult.isLastPage).toBeTruthy();
    });

    it("can search with multiple filters", async () => {
      const searchResult = await searchMessages(preservationRuleId, channelId, {
        authorId: author1,
        content: content2,
        endDatetime: new Date("2022-09-21T10:00:00.000Z"),
      });

      expect(searchResult.data.length).toEqual(1);
      expect(searchResult.data).toEqual([messageAuthor1Content2]);
      expect(searchResult.isLastPage).toBeTruthy();
    });
  });

  describe("fetchMessages", () => {
    const channelId = "123";
    const channelIdOther = "321";

    let preservationRuleId: number;
    let preservationRuleIdOther: number;
    let messages: Message[];

    beforeEach(async () => {
      preservationRuleId = (await makePreservationRule()).id;
      preservationRuleIdOther = (await makePreservationRule()).id;

      messages = [];
      const startDate = new Date("2022-09-21T00:00:00.000Z");
      for (let i = 0; i < 100; ++i) {
        const sentAt = addMinutes(startDate, i * 10).toISOString();
        messages.push(
          entityToType(
            await makeMessage(preservationRuleId, {
              externalChannelId: channelId,
              sentAt,
            })
          )
        );
        await makeMessage(preservationRuleIdOther, {
          externalChannelId: channelId,
          sentAt,
        });
        await makeMessage(preservationRuleId, {
          externalChannelId: channelIdOther,
          sentAt,
        });
      }
    });

    it("fetches messages", async () => {
      let searchResult = await fetchMessages(preservationRuleId, channelId);

      expect(searchResult).toEqual(
        messages.slice(messages.length - MESSAGE_LIMIT).reverse()
      );
    });

    it("fetches more messages before provided message ID", async () => {
      let searchResult = await fetchMessages(preservationRuleId, channelId, {
        before: messages[50]!.id,
      });

      expect(searchResult).toEqual(messages.slice(30, 50).reverse());

      searchResult = await fetchMessages(preservationRuleId, channelId, {
        before: messages[10]!.id,
      });

      expect(searchResult).toEqual(messages.slice(0, 10).reverse());
    });

    it("fetches more messages after provided message ID", async () => {
      let searchResult = await fetchMessages(preservationRuleId, channelId, {
        after: messages[50]!.id,
      });

      expect(searchResult).toEqual(messages.slice(51, 71));

      searchResult = await fetchMessages(preservationRuleId, channelId, {
        after: messages[90]!.id,
      });

      expect(searchResult).toEqual(messages.slice(91, 100));
    });
  });
});

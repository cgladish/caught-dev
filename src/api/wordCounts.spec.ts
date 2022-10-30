import { WordCountEntity } from "../db/entities";
import TableName from "../db/tableName";
import { Knex } from "knex";
import getDb from "../db";
import { makeMessage, makePreservationRule, makeWordCount } from "./mockData";
import { fetchTopWordCounts, updateWordCounts } from "./wordCounts";

describe("preservationRules", () => {
  let db: Knex;

  beforeEach(async () => {
    db = await getDb();
  });

  describe("fetchTopWordCounts", () => {
    it("successfully fetches top word counts", async () => {
      const { id: preservationRuleId } = await makePreservationRule();
      for (let i = 0; i < 10; ++i) {
        const wordCounts = new Array(100).fill(null).map((_, j) => ({
          preservationRuleId,
          word: `word-${i * 100 + j}`,
          count: i * 100 + j,
        }));
        await db<WordCountEntity>(TableName.WordCount).insert(wordCounts);
      }

      expect(await fetchTopWordCounts(preservationRuleId)).toMatchSnapshot();
    });
  });

  describe("updateWordCounts", () => {
    it("successfully updates word counts for a preservation rule", async () => {
      const { id: preservationRuleId } = await makePreservationRule();
      const { id: otherPreservationRuleId } = await makePreservationRule();
      const messages = await Promise.all([
        makeMessage(preservationRuleId, {
          content: "Hello, this is a test message!",
        }),
        makeMessage(preservationRuleId, { content: "Also a test message :)" }),
        makeMessage(preservationRuleId, {
          content: "Maybe not a test message?",
        }),
        makeMessage(preservationRuleId, {
          content: "Definitely a test  message!!",
        }),
      ]);
      await Promise.all([
        makeWordCount(preservationRuleId, { word: "hello", count: 2 }),
        makeWordCount(preservationRuleId, { word: "message", count: 1 }),
        makeWordCount(preservationRuleId, { word: "test", count: 3 }),
        makeWordCount(preservationRuleId, { word: "other", count: 6 }),
        makeWordCount(otherPreservationRuleId, { word: "test", count: 1 }),
      ]);

      await updateWordCounts(preservationRuleId, messages);

      const wordCounts = await db<WordCountEntity>(TableName.WordCount)
        .select("word", "count")
        .orderBy("word", "asc")
        .orderBy("count", "asc");
      expect(wordCounts).toMatchSnapshot();
    });
  });
});

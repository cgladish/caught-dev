import getDb from "../db";
import { MessageEntity, WordCountEntity } from "../db/entities";
import TableName from "../db/tableName";
import chunk from "lodash/chunk";
import { removeStopwords } from "stopword";

type TempWordCountEntity = Omit<WordCountEntity, "preservationRuleId">;

export const fetchTopWordCounts = async (
  preservationRuleId: number,
  limit: number = 200
): Promise<WordCountEntity[]> => {
  const db = await getDb();
  return db<WordCountEntity>(TableName.WordCount)
    .where({ preservationRuleId })
    .orderBy("count", "desc")
    .orderBy("word", "asc")
    .limit(limit);
};

const INSERT_BATCH_SIZE = 100;
export const updateWordCounts = async (
  preservationRuleId: number,
  messages: Pick<MessageEntity, "content">[]
): Promise<void> => {
  const wordCounts: Record<string, number> = {};
  messages.forEach(({ content }) => {
    const words = removeStopwords(
      content
        .replace(/[.,\/#!\?$%\^&\*;:{}=\-_`~()]/g, "")
        .replace(/\s{2,}/g, " ")
        .trim()
        .split(" ")
    );
    words.forEach((word) => {
      const wordLower = word.toLocaleLowerCase();
      wordCounts[wordLower] = (wordCounts[wordLower] ?? 0) + 1;
    });
  });
  const wordCountEntities: Omit<TempWordCountEntity, "id">[] = Object.entries(
    wordCounts
  ).map(([word, count]) => ({
    word,
    count,
  }));
  const db = await getDb();
  await db.transaction(async (tx) => {
    const tempTableName = `TempWordCounts${preservationRuleId}`;
    await tx.schema.createTable(tempTableName, (table) => {
      table.increments("id");
      table.string("word").notNullable().index();
      table.integer("count").notNullable();
    });
    for (let wordCountEntityChunk of chunk(
      wordCountEntities,
      INSERT_BATCH_SIZE
    )) {
      await tx
        .table<TempWordCountEntity>(tempTableName)
        .insert(wordCountEntityChunk);
    }

    await tx.raw(`
      UPDATE ${TableName.WordCount}
      SET count = a.count + b.count
      FROM ${TableName.WordCount} a
      INNER JOIN ${tempTableName} b ON a.word = b.word
      WHERE (
        a.preservationRuleId = ${preservationRuleId} AND
        ${TableName.WordCount}.id = a.id
      )
    `);

    const newWords: { word: string }[] = await tx.raw(`
      SELECT word
      FROM ${tempTableName}
      WHERE NOT EXISTS (
        SELECT id FROM ${TableName.WordCount}
        WHERE (
          ${TableName.WordCount}.preservationRuleId = ${preservationRuleId} AND
          ${TableName.WordCount}.word = ${tempTableName}.word
        )
      )
    `);
    const newWordCountEntities = wordCountEntities
      .filter(({ word }) => newWords.some((newWord) => newWord.word === word))
      .map((entity) => ({ ...entity, preservationRuleId }));

    for (let wordCountEntityChunk of chunk(
      newWordCountEntities,
      INSERT_BATCH_SIZE
    )) {
      await tx
        .table<WordCountEntity>(TableName.WordCount)
        .insert(wordCountEntityChunk);
    }

    await tx.schema.dropTable(tempTableName);
  });
};

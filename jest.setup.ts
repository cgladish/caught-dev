import TableName from "./db/tableName";
import getDb from "./db";

global.beforeEach(async () => {
  const db = await getDb();
  for (let table in TableName) {
    await db.raw(`DELETE FROM "${table}"`);
  }
});

export {};

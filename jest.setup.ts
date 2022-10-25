import TableName from "./src/db/tableName";
import getDb from "./src/db";

global.beforeEach(async () => {
  const db = await getDb();
  for (let table in TableName) {
    await db.raw(`DELETE FROM "${table}"`);
  }
});

export {};

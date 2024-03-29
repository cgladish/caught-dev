import knex from "knex";

const config = require("./knexfile");

const environment = process.env.JEST_WORKER_ID ? "test" : "production";

const db = knex(config[environment]);
const migrate = db.migrate.latest(config[environment].migrations);
const turnOnForeignKeys = db.raw("PRAGMA foreign_keys = ON");

export default async function getDb() {
  await migrate;
  await turnOnForeignKeys;
  return db;
}

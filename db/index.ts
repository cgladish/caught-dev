import knex from "knex";
const config = require("./knexfile");

const db = knex(config);
db.migrate.latest(config.migrations);

export default db;

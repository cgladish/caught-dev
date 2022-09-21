import type { Knex } from "knex";
import path from "path";

const config: { [env: string]: Knex.Config } = {
  test: {
    client: "sqlite3",
    connection: {
      filename: path.join(__dirname, "test.db.sqlite3"),
    },
    migrations: {
      tableName: "migrations",
      directory: path.join(__dirname, "migrations"),
    },
  },
  production: {
    client: "sqlite3",
    connection: {
      filename: path.join(__dirname, "db.sqlite3"),
    },
    migrations: {
      tableName: "migrations",
      directory: path.join(__dirname, "migrations"),
    },
  },
};

module.exports = config;

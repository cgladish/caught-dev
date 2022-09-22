import { Knex } from "knex";
import TableName from "../tableName";

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable(TableName.ServiceAuth, function (table) {
    table.increments("id");
    table.string("appName").notNullable().unique();
    table.string("encryptedToken").notNullable();
  });
  await knex.schema.createTable(TableName.PreservationRule, function (table) {
    table.increments("id");
    table.string("appName").notNullable();
    table.string("name").notNullable().unique();
    table.string("selectedJson").notNullable();
    table.datetime("startDatetime");
    table.datetime("endDatetime");
    table.timestamps(false, true, true);
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTable(TableName.PreservationRule);
  await knex.schema.dropTable(TableName.ServiceAuth);
}

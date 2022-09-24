import { Knex } from "knex";
import TableName from "../tableName";

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable(TableName.ServiceAuth, function (table) {
    table.increments("id");
    table.string("appName").notNullable().unique().index();
    table.string("encryptedToken").notNullable();
  });
  await knex.schema.createTable(TableName.PreservationRule, function (table) {
    table.increments("id");
    table.string("appName").notNullable().index();
    table.string("name").notNullable().unique();
    table.string("selectedJson").notNullable();
    table.datetime("startDatetime");
    table.datetime("endDatetime");
    table.boolean("initialBackupComplete").notNullable().defaultTo(false);
    table.timestamps(false, true, true);
  });
  await knex.schema.createTable(TableName.Message, function (table) {
    table.increments("id");
    table
      .string("preservationRuleId")
      .notNullable()
      .references("id")
      .inTable(TableName.PreservationRule)
      .onDelete("CASCADE");
    table.string("externalId").notNullable().index();
    table.string("externalChannelId").notNullable().index();
    table.string("authorId").notNullable();
    table.string("authorName").notNullable();
    table.string("authorAvatar");
    table.string("content").notNullable();
    table.string("sentAt").notNullable().index();
    table.string("appSpecificDataJson");

    table.unique(["preservationRuleId", "externalId"]);
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTable(TableName.Message);
  await knex.schema.dropTable(TableName.PreservationRule);
  await knex.schema.dropTable(TableName.ServiceAuth);
}

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
      .integer("preservationRuleId")
      .notNullable()
      .references("id")
      .inTable(TableName.PreservationRule)
      .onDelete("CASCADE")
      .index();
    table.string("externalId").notNullable().index();
    table.string("externalChannelId").notNullable().index();
    table.string("authorId").notNullable().index();
    table.string("authorName").notNullable();
    table.string("authorAvatar");
    table.string("content").notNullable().index();
    table.string("sentAt").notNullable().index();
    table.string("appSpecificDataJson");

    table.unique(["preservationRuleId", "externalId"]);
  });
  await knex.raw(`
CREATE VIRTUAL TABLE ${TableName.MessageSearch} USING fts5(
  id UNINDEXED,
  preservationRuleId UNINDEXED,
  externalId UNINDEXED,
  externalChannelId UNINDEXED,
  authorId UNINDEXED,
  authorName UNINDEXED,
  authorAvatar UNINDEXED,
  content,
  sentAt UNINDEXED,
  appSpecificDataJson UNINDEXED,
  content=${TableName.Message},
  content_rowid=id
);
`);
  await knex.raw(`
CREATE TRIGGER message_ai AFTER INSERT ON ${TableName.Message} BEGIN
  INSERT INTO ${TableName.MessageSearch}(rowid, content) VALUES (new.id, new.content);
END;
`);
  await knex.raw(`
CREATE TRIGGER message_ad AFTER DELETE ON ${TableName.Message} BEGIN
  INSERT INTO ${TableName.MessageSearch}(${TableName.MessageSearch}, rowid, content) VALUES('delete', old.id, old.content);
END;
`);
  await knex.raw(`
CREATE TRIGGER message_au AFTER UPDATE ON ${TableName.Message} BEGIN
  INSERT INTO ${TableName.MessageSearch}(${TableName.MessageSearch}, rowid, content) VALUES('delete', old.id, old.content);
  INSERT INTO ${TableName.MessageSearch}(rowid, content) VALUES (new.id, new.content);
END;`);
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTable(TableName.Message);
  await knex.schema.dropTable(TableName.PreservationRule);
  await knex.schema.dropTable(TableName.ServiceAuth);
}

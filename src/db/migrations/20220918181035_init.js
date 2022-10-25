exports.up = async function (knex) {
  await knex.schema.createTable("ServiceAuth", function (table) {
    table.increments("id");
    table.string("appName").notNullable().unique().index();
    table.string("encryptedToken").notNullable();
  });
  await knex.schema.createTable("PreservationRule", function (table) {
    table.increments("id");
    table.string("appName").notNullable().index();
    table.string("name").notNullable().unique();
    table.string("selectedJson").notNullable();
    table.datetime("startDatetime");
    table.datetime("endDatetime");
    table.boolean("initialBackupComplete").notNullable().defaultTo(false);
    table.timestamps(false, true, true);
  });
  await knex.schema.createTable("Channel", function (table) {
    table.increments("id");
    table.string("appName").notNullable().index();
    table.string("externalId").notNullable().index();
    table.string("name").notNullable();
    table.string("iconUrl");

    table.unique(["appName", "externalId"]);
  });
  await knex.schema.createTable("Message", function (table) {
    table.increments("id");
    table
      .integer("preservationRuleId")
      .notNullable()
      .references("id")
      .inTable("PreservationRule")
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
CREATE VIRTUAL TABLE ${"MessageSearch"} USING fts5(
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
  content=${"Message"},
  content_rowid=id
);
`);
  await knex.raw(`
CREATE TRIGGER message_ai AFTER INSERT ON ${"Message"} BEGIN
  INSERT INTO ${"MessageSearch"}(rowid, content) VALUES (new.id, new.content);
END;
`);
  await knex.raw(`
CREATE TRIGGER message_ad AFTER DELETE ON ${"Message"} BEGIN
  INSERT INTO ${"MessageSearch"}(${"MessageSearch"}, rowid, content) VALUES('delete', old.id, old.content);
END;
`);
  await knex.raw(`
CREATE TRIGGER message_au AFTER UPDATE ON ${"Message"} BEGIN
  INSERT INTO ${"MessageSearch"}(${"MessageSearch"}, rowid, content) VALUES('delete', old.id, old.content);
  INSERT INTO ${"MessageSearch"}(rowid, content) VALUES (new.id, new.content);
END;`);
};

exports.down = async function (knex) {
  await knex.schema.dropTable("Message");
  await knex.schema.dropTable("PreservationRule");
  await knex.schema.dropTable("ServiceAuth");
};

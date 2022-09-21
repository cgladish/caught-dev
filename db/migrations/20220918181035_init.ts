import { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable("ServiceAuth", function (table) {
    table.increments("id");
    table.string("appName").notNullable().unique();
    table.string("encryptedToken").notNullable();
  });
  await knex.schema.createTable("PreservationRule", function (table) {
    table.increments("id");
    table.string("appName").notNullable();
    table.string("name").notNullable().unique();
    table.string("selectedJson").notNullable();
    table.datetime("startDatetime", { useTz: false });
    table.datetime("endDatetime", { useTz: false });
    table.timestamps(false, true, true);
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTable("ServiceAuth");
}

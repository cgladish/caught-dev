import { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.schema.table("ServiceAuth", function (table) {
    table.string("serviceName");
    table.string("encryptedToken");
  });
}

export async function down(knex: Knex): Promise<void> {}

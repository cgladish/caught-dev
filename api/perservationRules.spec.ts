import { Knex } from "knex";
import omit from "lodash/omit";
import getDb from "../db";
import TableName from "../db/tableName";
import {
  createPreservationRule,
  updatePreservationRule,
  fetchPreservationRules,
  PreservationRule,
} from "./preservationRules";

describe("preservationRules", () => {
  let db: Knex;

  beforeEach(async () => {
    db = await getDb();
  });

  describe("createPreservationRule", () => {
    it("creates a preservation rule", async () => {
      await createPreservationRule({
        appName: "discord",
        name: "Rule",
        selected: { key: "value" },
        startDatetime: new Date(5),
        endDatetime: new Date(10),
      });

      const preservationRules = await db<PreservationRule>(
        TableName.PreservationRule
      ).select();
      expect(preservationRules.length).toEqual(1);
      expect(
        omit(preservationRules[0], "id", "createdAt", "updatedAt")
      ).toMatchSnapshot();
    });
  });
});

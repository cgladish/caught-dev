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
      const createdPreservationRule = await createPreservationRule({
        appName: "discord",
        name: "Rule",
        selected: { key: "value" },
        startDatetime: new Date("2022-09-21T02:00:00.000Z"),
        endDatetime: new Date("2022-09-21T04:00:00.000Z"),
      });
      expect(
        omit(createdPreservationRule, "id", "createdAt", "updatedAt")
      ).toMatchSnapshot();

      const preservationRules = await db<PreservationRule>(
        TableName.PreservationRule
      ).select();
      expect(preservationRules.length).toEqual(1);
      expect(
        omit(preservationRules[0], "id", "createdAt", "updatedAt")
      ).toMatchSnapshot();
    });
  });

  describe("updatePreservationRule", () => {
    it("updates a preservation rule", async () => {
      await createPreservationRule({
        appName: "discord",
        name: "Rule",
        selected: { key: "value" },
        startDatetime: new Date("2022-09-21T02:00:00.000Z"),
        endDatetime: new Date("2022-09-21T04:00:00.000Z"),
      });
      const { id } = await createPreservationRule({
        appName: "twitter" as any,
        name: "Rule2",
        selected: { key2: "value2" },
        startDatetime: new Date("2022-09-21T03:00:00.000Z"),
        endDatetime: new Date("2022-09-21T05:00:00.000Z"),
      });

      const updatedPreservationRule = await updatePreservationRule(id, {
        name: "Rule3",
        selected: { key3: "value3" },
        startDatetime: new Date("2022-09-21T03:00:00.000Z"),
        endDatetime: new Date("2022-09-21T05:00:00.000Z"),
      });
      expect(
        omit(updatedPreservationRule, "id", "createdAt", "updatedAt")
      ).toMatchSnapshot();

      const preservationRules = await db<PreservationRule>(
        TableName.PreservationRule
      ).select();
      expect(preservationRules.length).toEqual(2);
      expect(
        omit(preservationRules[0], "id", "createdAt", "updatedAt")
      ).toMatchSnapshot();
      expect(
        omit(preservationRules[1], "id", "createdAt", "updatedAt")
      ).toMatchSnapshot();
    });
  });

  describe("fetchPreservationRules", () => {
    it("fetches preservation rules", async () => {
      await createPreservationRule({
        appName: "discord",
        name: "Rule",
        selected: { key: "value" },
        startDatetime: new Date("2022-09-21T02:00:00.000Z"),
        endDatetime: new Date("2022-09-21T04:00:00.000Z"),
      });
      await createPreservationRule({
        appName: "discord",
        name: "Rule2",
        selected: { key2: "value2" },
        startDatetime: new Date("2022-09-21T03:00:00.000Z"),
        endDatetime: new Date("2022-09-21T05:00:00.000Z"),
      });
      await createPreservationRule({
        appName: "twitter" as any,
        name: "Rule3",
        selected: { key3: "value3" },
        startDatetime: new Date("2022-09-21T04:00:00.000Z"),
        endDatetime: new Date("2022-09-21T06:00:00.000Z"),
      });

      const preservationRules = await fetchPreservationRules("discord");
      expect(preservationRules.length).toEqual(2);
      expect(
        omit(preservationRules[0], "id", "createdAt", "updatedAt")
      ).toMatchSnapshot();
      expect(
        omit(preservationRules[1], "id", "createdAt", "updatedAt")
      ).toMatchSnapshot();
    });
  });
});

import { Knex } from "knex";
import omit from "lodash/omit";
import getDb from "../db";
import { MessageEntity } from "../db/entities";
import TableName from "../db/tableName";
import { makeMessage, makePreservationRule } from "./mockData";
import {
  createPreservationRule,
  updatePreservationRule,
  fetchPreservationRules,
  PreservationRule,
  deletePreservationRule,
} from "./preservationRules";

describe("preservationRules", () => {
  let db: Knex;

  beforeEach(async () => {
    db = await getDb();
  });

  describe("createPreservationRule", () => {
    it("creates a preservation rule", async () => {
      const createdPreservationRule = await createPreservationRule(
        {
          appName: "discord",
          name: "Rule",
          selected: { key: "value" },
          startDatetime: new Date("2022-09-21T02:00:00.000Z"),
          endDatetime: new Date("2022-09-21T04:00:00.000Z"),
        },
        false
      );
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
      await makePreservationRule({
        name: "Rule",
        startDatetime: "2022-09-21T02:00:00.000Z",
        endDatetime: "2022-09-21T04:00:00.000Z",
      });
      const { id } = await makePreservationRule({
        appName: "twitter" as any,
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

  describe("deletePreservatinoRule", () => {
    it("deletes a preservation rule and associated messages", async () => {
      const { id } = await makePreservationRule({
        appName: "twitter" as any,
      });
      const { id: otherId } = await makePreservationRule({
        name: "Rule",
        startDatetime: "2022-09-21T02:00:00.000Z",
        endDatetime: "2022-09-21T04:00:00.000Z",
      });
      await makeMessage(id);
      await makeMessage(id);
      const { id: otherMessageId } = await makeMessage(otherId);

      await deletePreservationRule(id);

      const preservationRules = await db<PreservationRule>(
        TableName.PreservationRule
      ).select();
      expect(preservationRules.length).toEqual(1);
      expect(preservationRules[0]!.id).toEqual(otherId);

      const messages = await db<MessageEntity>(TableName.Message).select();
      expect(messages.length).toEqual(1);
      expect(messages[0]!.id).toEqual(otherMessageId);
    });
  });

  describe("fetchPreservationRules", () => {
    it("fetches preservation rules", async () => {
      await makePreservationRule({
        name: "Rule",
      });
      await makePreservationRule({
        name: "Rule2",
        selectedJson: '{ "key2": "value2" }',
        startDatetime: "2022-09-21T03:00:00.000Z",
        endDatetime: "2022-09-21T05:00:00.000Z",
      });
      await makePreservationRule({
        appName: "twitter" as any,
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

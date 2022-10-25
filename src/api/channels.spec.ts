import { Knex } from "knex";
import getDb from "../db";
import { ChannelEntity } from "../db/entities";
import TableName from "../db/tableName";
import { createOrUpdateChannels, fetchChannels } from "./channels";
import { makeChannel } from "./mockData";

describe("channels", () => {
  let db: Knex;

  beforeEach(async () => {
    db = await getDb();
  });

  describe("fetchChannels", () => {
    it("fetches channels filtered by app name and external ID", async () => {
      const channel1 = await makeChannel({
        appName: "discord",
        externalId: "1",
        name: "name1",
      });
      const channel2 = await makeChannel({
        appName: "discord",
        externalId: "2",
        name: "name2",
      });
      await makeChannel({
        appName: "discord",
        externalId: "3",
        name: "name3",
      });
      await makeChannel({
        appName: "twitter" as any,
        externalId: "2",
        name: "name3",
      });

      const channels = await fetchChannels("discord", [
        channel1.externalId,
        channel2.externalId,
        "otherID",
      ]);
      expect(channels.length).toEqual(2);
      expect(channels).toEqual([channel1, channel2]);
    });
  });

  describe("createOrUpdateChannels", () => {
    it("can do a mix of creates and updates for multiple channels", async () => {
      await makeChannel({
        externalId: "1",
        name: "name1",
      });
      await makeChannel({
        externalId: "2",
        name: "name2",
      });

      await createOrUpdateChannels([
        { appName: "discord", externalId: "3", name: "name3" },
        { appName: "discord", externalId: "1", name: "newname1" },
        { appName: "discord", externalId: "2", name: "newname2" },
        { appName: "discord", externalId: "4", name: "name4" },
      ]);

      const channels = await db<ChannelEntity>(TableName.Channel).select();
      expect(channels.length).toEqual(4);
      expect(channels[0]!.name).toEqual("newname1");
      expect(channels[1]!.name).toEqual("newname2");
      expect(channels[2]!.name).toEqual("name3");
      expect(channels[3]!.name).toEqual("name4");
    });
  });
});

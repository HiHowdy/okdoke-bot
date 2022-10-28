import { Guild } from "discord.js";
const mongoose = require("mongoose");
const _Guild = require("./Guild.ts");
const cache = new Map();

const Schema = mongoose.Schema(
   {
      _id: {
         type: String,
         required: true,
      },
      authorizedOn: {
         type: Number,
         required: true,
         default: Date.now(),
      },
   },
   {
      collection: "authorized",
   }
);

const Model = mongoose.model("Authorized", Schema);

module.exports = {
   authorizeGuild: async (guild: Guild) => {
      const isAuth = await Model.findOne({ _id: guild.id });
      cache.set(guild.id, "authorized");

      if (!isAuth) {
         const newGuild = new Model({
            _id: guild.id,
            authorizedOn: Date.now(),
         });

         await newGuild.save();
      }

      await _Guild.createGuild(guild);
      return true;
   },
   unauthorizedGuild: async (guild: Guild) => {
      cache.set(guild.id, "unauthorized");
      const _guild = await Model.findOne({
         _id: guild.id,
      });
      if (!_guild) return false;
      cache.delete(guild.id);
      await _guild.delete();
      return true;
   },
   isGuildAuthorized: async (guild: Guild) => {
      if (cache.get(guild.id) === "authorized") return true;
      if (cache.get(guild.id) === "unauthorized") return false;

      const _guild = await Model.findOne({
         _id: guild.id,
      });

      cache.set(guild.id, _guild ? "authorized" : "unauthorized");

      if (!_guild) return false;
      return true;
   },
   fetchAuthorizedGuilds: async () => {
      const data = await Model.find();

      data.forEach((guild: any) => {
         cache.set(guild._id, "authorized");
      });

      return data;
   },
};

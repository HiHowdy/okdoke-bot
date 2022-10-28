import { Guild, User } from "discord.js";
const mongoose = require("mongoose");

const cache = new Map();

const Schema = mongoose.Schema(
   {
      guild_id: {
         type: String,
         required: true,
      },
      member_id: {
         type: String,
         required: true,
      },
      strikes: {
         type: Number,
         default: 0,
      },
      warnings: {
         type: [String],
         default: 0,
      },
   },
   {
      collection: "members",
   }
);

const Model = mongoose.model("Member", Schema);

module.exports = {
   fetchMember: async (guild: Guild, member: User) => {
      const key = `${guild.id}-${member.id}`;

      if (cache.has(key)) {
         return cache.get(key);
      }

      const data = await Model.findOne({
         guild_id: guild.id,
         member_id: member.id,
      });

      if (data) {
         cache.set(key, data);
         return data;
      }

      const newData = new Model({
         guild_id: guild.id,
         member_id: member.id,
      });

      cache.set(key, newData);
      await newData.save();
      return newData;
   },
   setMemberValue: async (
      guild: Guild,
      member: User,
      key: string,
      value: any
   ) => {
      const data = await Model.findOne({
         guild_id: guild.id,
         member_id: member.id,
      });

      if (data) {
         data[key] = value;
         await data.save();
         cache.set(`${guild.id}-${member.id}`, data);
         return data;
      }

      return false;
   },
   setStrikes: async (guild: Guild, member: User, strikes: number) => {
      const key = `${guild.id}-${member.id}`;
      const data = await Model.findOne({
         guild_id: guild.id,
         member_id: member.id,
      });

      if (data) {
         cache.set(key, data);
         data.strikes = strikes;
         await data.save();
         return data;
      }

      const newData = new Model({
         guild_id: guild.id,
         member_id: member.id,
         strikes: strikes,
      });

      cache.set(key, newData);
      await newData.save();
      return newData;
   },
};

import { Guild } from "discord.js";
const mongoose = require("mongoose");

const cache = new Map();

export const GuildSchema = mongoose.Schema(
   {
      _id: {
         type: String,
         required: true,
      },
      registeredAt: {
         type: Number,
         required: true,
         default: Date.now(),
      },
      settings: {
         welcome: {
            enabled: {
               type: Boolean,
               required: true,
               default: false,
            },
            channel: {
               type: String,
               required: true,
               default: "unset",
            },
            message: {
               type: String,
               required: true,
               default: "Welcome {user} to {guild}!",
            },
            rules: {
               type: [String],
               required: true,
            },
         },
      },
      automod: {
         debug: {
            type: Boolean,
            required: true,
            default: false,
         },
         log_channel: {
            type: String,
            default: "unset",
         },
         strikes: {
            type: Number,
            default: 5,
         },
         action: {
            type: String,
            default: "mute",
         },
         anti_links: {
            type: Boolean,
            default: false,
         },
         anti_invites: {
            type: Boolean,
            default: false,
         },
         anti_ghostping: {
            type: Boolean,
            default: false,
         },
         banned_words: {
            type: [String],
            required: true,
            default: [],
         },
         muted_members: {
            type: [String],
            required: true,
            default: [],
         }
      },
      presence: {
         enabled: {
            type: Boolean,
            required: true,
            default: false,
         },
         channel: {
            type: String,
            required: true,
            default: "unset",
         },
         client_id: {
            type: String,
            required: true,
            default: "unset",
         },
         message: {
            type: String,
            required: true,
            default: "{user} has just went live!",
         },
      },
      rolePresence: {
         enabled: {
            type: Boolean,
            required: true,
            default: false,
         },
         channel: {
            type: String,
            required: true,
            default: "unset",
         },
         message: {
            type: String,
            required: true,
            default: "{user} has just went live!",
         },
         role: {
            type: String,
            required: true,
            default: "unset",
         },
      },
   },
   {
      collection: "guilds",
   }
);

const Model = mongoose.model("Guild", GuildSchema);

module.exports = {
   fetchAllGuilds: async () => {
      await Model.find();
   },
   fetchGuild: async (guild: Guild) => {
      const _guild =
         cache.get(guild.id) || (await Model.findOne({ _id: guild.id }));

      if (_guild) {
         cache.set(guild.id, _guild);
         return _guild;
      }

      cache.set(guild.id, false);
      return false;
   },
   createGuild: async (guild: Guild) => {
      const _guild = await new Model({
         _id: guild.id,
      });

      await _guild.save();
      cache.set(guild.id, _guild);
      return _guild;
   },
   setAutomodSetting: async (guild: Guild, setting: string, value: any) => {
      const _guild = await Model.findOne({ _id: guild.id });

      if (_guild) {
         _guild.automod[setting] = value;
         await _guild.save();
         cache.set(guild.id, _guild);
         return _guild;
      }

      return false;
   },
   setPresenceSetting: async (guild: Guild, setting: string, value: any) => {
      const _guild = await Model.findOne({ _id: guild.id });

      if (_guild) {
         _guild.presence[setting] = value;
         await _guild.save();
         cache.set(guild.id, _guild);
         return true;
      }

      return false;
   },
   setRolePresenceSetting: async (
      guild: Guild,
      setting: string,
      value: any
   ) => {
      const _guild = await Model.findOne({ _id: guild.id });

      if (_guild) {
         _guild.rolePresence[setting] = value;
         await _guild.save();
         cache.set(guild.id, _guild);
         return true;
      }

      return false;
   },
};

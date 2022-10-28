import { Guild, User } from "discord.js";

const _Guild = require("../schemas/Guild");

export const muteMember = async (
   user: User,
   mute: boolean,
   guild: Guild
): Promise<boolean> => {
   try {
      const settings = await _Guild.fetchGuild(guild);
      if (!settings) return false;

      const userId = user.id;

      if (mute) {
         if (settings.automod.muted_members) {
            if (settings.automod.muted_members.includes(userId)) return false;
            settings.automod.muted_members.push(userId);
         } else {
            settings.automod.muted_members = [userId];
         }
      }

      if (!mute) {
         if (!settings.automod.muted_members) return false;
         if (!settings.automod.muted_members.includes(userId)) return false;
         settings.automod.muted_members = settings.automod.muted_members.filter(
            (id: string) => id !== userId
         );
      }

      await _Guild.setAutomodSetting(
         guild,
         "muted_members",
         settings.automod.muted_members
      );

      return true;
   } catch (error) {
      console.log(error);
      return false;
   }
};

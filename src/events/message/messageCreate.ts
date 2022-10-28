import { autoMod } from "../../handlers/automod";

const _Guild = require("../../schemas/Guild");
const _Auth = require("../../schemas/Authorized");

module.exports = async (client: any, message: any) => {
   if (!message.guild || message.author.bot) return;

   const _guild = await _Guild.fetchGuild(message.guild);
   if (!_guild) return;
   const mutedMembers = _guild?.automod?.muted_members || [];

   if (mutedMembers) {
      if (mutedMembers.includes(message.author.id)) {
         try {
            await message.delete();
         } catch (error) {
            console.log(error);
         }
         return;
      }
   }

   await autoMod(client, message, _guild);
};

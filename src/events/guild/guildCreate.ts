import { Guild } from "discord.js";
import ExtendedClient from "../../structs/client";

const pogger = require("pogger");

module.exports = async (client: ExtendedClient, guild: Guild) => {
   try {
      if (!guild.members.cache.has(guild.ownerId))
         await guild.fetchOwner({ cache: true });
      const owner = guild.members.cache.get(guild.ownerId);
      pogger.info(
         `Joined guild ${guild.name} owned by ${
            guild.members.cache.get(guild.ownerId)?.user.tag
         }`
      );

      owner?.user.send({
         content: client.config.WELCOME_MSG,
      });
   } catch (error) {
      console.log(error);
   }
};

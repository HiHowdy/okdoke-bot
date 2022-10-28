import {
   ActionRowBuilder,
   ButtonBuilder,
   EmbedBuilder,
} from "@discordjs/builders";
import { ButtonStyle } from "discord.js";
import ExtendedClient from "src/structs/client";
import { shouldModerate } from "../../handlers/automod";

const _Guild = require("../../schemas/Guild");
const _Auth = require("../../schemas/Authorized");

module.exports = async (client: ExtendedClient, message: any) => {
   try {
      if (message.partial || message.author.bot || !message.guild) return;

      const authorized = await _Auth.isGuildAuthorized(message.guild);
      if (!authorized) return;

      const guild = await _Guild.fetchGuild(message.guild);

      if (!guild) return;
      if (!shouldModerate(message) && !guild.automod.debug) return;
      if (!guild.automod.anti_ghostping) return;

      const { members, roles, everyone, here } = message.mentions;

      if (members.size > 0 || roles.size > 0 || everyone) {
         const logChannel = await message.guild.channels.cache.get(
            guild.automod?.log_channel
         );

         if (!logChannel) return;

         const embed = new EmbedBuilder()
            .setColor(3)
            .setAuthor({ name: "Automod: Ghost Ping" })
            .setDescription(
               `${message.author} has ghost pinged in ${message.channel}`
            )
            .setFooter({ text: `Message ID: ${message.id}` })
            .addFields([
               { name: "Message", value: message.content },
               {
                  name: "Mentions",
                  value: `${members.size} members, ${roles.size} roles, ${
                     everyone ? "mentioned everyone" : "no one"
                  }`,
               },
            ]);

         const row = new ActionRowBuilder()
            .addComponents(
               new ButtonBuilder()
                  .setCustomId("ghostping")
                  .setLabel("Strike User")
                  .setStyle(ButtonStyle.Danger)
            )
            .addComponents(
               new ButtonBuilder()
                  .setCustomId("ghostping")
                  .setLabel("Ignore")
                  .setStyle(ButtonStyle.Secondary)
            );

         if (!logChannel.isTextBased()) return;
         // send data to interaction

         await logChannel.send({ embeds: [embed] });
      }
   } catch (error) {
      console.error(error);
   }
};

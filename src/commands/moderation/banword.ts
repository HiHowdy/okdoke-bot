import { SlashCommandBuilder } from "@discordjs/builders";
import { PermissionFlagsBits } from "discord.js";
import ExtendedClient from "src/structs/client";

const auth = require("../../schemas/Authorized");
const _Guild = require("../../schemas/Guild");

export default {
   data: new SlashCommandBuilder()
      .setName("banword")
      .setDescription("Ban words or phrases from being used in the server")
      .addStringOption((option) =>
         option
            .setName("word")
            .setDescription("The word or phrase to ban")
            .setRequired(true)
      )
      .addBooleanOption((option) =>
         option
            .setName("enabled")
            .setDescription("Whether to enable or disable the word/phrase")
            .setRequired(true)
      )
      .setDefaultMemberPermissions(PermissionFlagsBits.KickMembers),
   help: "Ban words or phrases from being used in the server",
   async execute(client: ExtendedClient, interaction: any) {
      try {
         if (!interaction.isRepliable()) return;
         const authorized = await auth.isGuildAuthorized(interaction.guild);
         if (!authorized)
            return interaction.reply({
               content: "This server is not authorized to use my features",
               ephemeral: true,
            });

         const word = interaction.options.getString("word");
         const enabled = interaction.options.getBoolean("enabled");

         const settings = await _Guild.fetchGuild(interaction.guild);
         const banned_words = settings.automod.banned_words || [];

         if (enabled) {
            if (banned_words.includes(word))
               return interaction.reply({
                  content: "That word/phrase is already banned",
                  ephemeral: true,
               });

            banned_words.push(word);
         } else {
            if (!banned_words.includes(word))
               return interaction.reply({
                  content: "That word/phrase is not banned",
                  ephemeral: true,
               });

            banned_words.splice(banned_words.indexOf(word), 1);
         }

         await _Guild.setAutomodSetting(interaction.guild, 'banned_words', banned_words);

         interaction.reply({
            content: `\`${word}\` is now ${
               enabled ? "banned" : "unbanned"
            }`,
            ephemeral: true,
         });
      } catch (error) {
         console.error(error);
      }
   },
};

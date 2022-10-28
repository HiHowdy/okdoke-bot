import { SlashCommandBuilder } from "@discordjs/builders";
import { Interaction, PermissionFlagsBits } from "discord.js";
import ExtendedClient from "src/structs/client";
import config from "../../config";

const auth = require("../../schemas/Authorized");
const _Guild = require("../../schemas/Guild");

export default {
   data: new SlashCommandBuilder()
      .setName("setmaxstrikes")
      .setDescription(
         "Set the maximum number of strikes a member can receive before being muted"
      )
      .addNumberOption((option) =>
         option
            .setName("strikes")
            .setDescription("The number of strikes")
            .setRequired(true)
      )
      .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
   help: "Generate an authentication code for a server to access my features",
   async execute(client: ExtendedClient, interaction: any) {
      try {
         if (!interaction.isRepliable()) return;
         const authorized = await auth.isGuildAuthorized(interaction.guild);
         if (!authorized)
            return interaction.reply({
               content: "This server is not authorized to use my features",
               ephemeral: true,
            });

         const strikes = interaction.options.getNumber("strikes");
         await _Guild.setAutomodSetting(interaction.guild, "strikes", strikes);

         return interaction.reply({
            content: `Set the maximum number of strikes to ${strikes}`,
            ephemeral: true,
         });
      } catch (error) {
         console.error(error);
      }
   },
};

import { SlashCommandBuilder } from "@discordjs/builders";
import { Interaction, PermissionFlagsBits } from "discord.js";
import ExtendedClient from "src/structs/client";
import config from "../../config";

const auth = require("../../schemas/AuthCodes");

export default {
   data: new SlashCommandBuilder()
      .setName("genauth")
      .setDescription(
         "Generate an authentication code for a server to access my features"
      )
      .addBooleanOption((option) =>
         option
            .setName("show")
            .setDescription("Display the code publicly")
            .setRequired(true)
      )
      .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels),
   help: "Generate an authentication code for a server to access my features",
   hide: true,
   async execute(client: ExtendedClient, interaction: any) {
      try {
         if (!interaction.isRepliable()) return;

         const userId = interaction.user.id;
         if (userId !== config.OWNER_ID)
            return interaction.reply({
               content: "You are not authorized to use this command",
               ephemeral: true,
            });
         const show = interaction.options.getBoolean("show") || false;
         const code = await auth.generateUniqueAuthCode(interaction.guild);
         interaction.reply({
            content: `Generated authentication code: \`${code}\`. This code is valid for 30 days.`,
            ephemeral: !show,
         });
      } catch (error) {
         console.error(error);
      }
   },
};

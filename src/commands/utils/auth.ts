import { SlashCommandBuilder } from "@discordjs/builders";
import { Interaction, PermissionFlagsBits } from "discord.js";
import ExtendedClient from "src/structs/client";
import config from "../../config";

const codes = require("../../schemas/AuthCodes");
const auth = require("../../schemas/Authorized");

export default {
   data: new SlashCommandBuilder()
      .setName("auth")
      .setDescription(
         "Authorize this server to use OkDoke features with an authorization code"
      )
      .addStringOption((option) =>
         option
            .setName("code")
            .setDescription("Your authorization code")
            .setRequired(true)
      )
      .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels),
      help: "Authorize this server to use OkDoke features with an authorization code",
      permissions: PermissionFlagsBits.Administrator,
   async execute(client: ExtendedClient, interaction: any) {
      try {
         if (!interaction.isRepliable()) return;

         const code = interaction.options.getString("code");
         const authorized = await codes.isAuthCodeValid(code);
         if (!authorized)
            return interaction.reply({
               content: "Invalid authorization code",
               ephemeral: true,
            });

         await codes.deleteAuthCode(code);
         await auth.authorizeGuild(interaction.guild);
         return interaction.reply({
            content: `Successfully authorized this server to use OkDoke features`,
         });
      } catch (error) {
         console.error(error);
      }
   },
};

import { SlashCommandBuilder } from "@discordjs/builders";
import { PermissionFlagsBits } from "discord.js";
import ExtendedClient from "src/structs/client";
import { muteMember } from "../../handlers/moderation";

const auth = require("../../schemas/Authorized");

export default {
   data: new SlashCommandBuilder()
      .setName("mute")
      .setDescription("Mute a member")
      .addMentionableOption((option) =>
         option
            .setName("user")
            .setDescription("The user to mute")
            .setRequired(true)
      )
      .setDefaultMemberPermissions(PermissionFlagsBits.KickMembers),
   hide: true,
   help: "Prevent a member from speaking in text channels. This deletes their message immediately.",
   async execute(client: ExtendedClient, interaction: any) {
      try {
         if (!interaction.isRepliable()) return;
         const authorized = await auth.isGuildAuthorized(interaction.guild);
         if (!authorized)
            return interaction.reply({
               content: "This server is not authorized to use my features",
            });

         const result = await muteMember(
            interaction.options.getMentionable("user"),
            true,
            interaction.guild
         );

         if (!result)
            return interaction.reply({
               content: "Failed to mute member. Maybe they're already muted?",
            });

         return interaction.reply({
            content: `Muted member`,
         });
      } catch (error) {
         console.error(error);
      }
   },
};

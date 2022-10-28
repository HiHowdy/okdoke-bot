import { SlashCommandBuilder } from "@discordjs/builders";
import { PermissionFlagsBits } from "discord.js";
import ExtendedClient from "src/structs/client";
import { muteMember } from "../../handlers/moderation";

const auth = require("../../schemas/Authorized");

export default {
   data: new SlashCommandBuilder()
      .setName("unmute")
      .setDescription("Unmute a member")
      .addMentionableOption((option) =>
         option
            .setName("user")
            .setDescription("The user to mute")
            .setRequired(true)
      )
      .setDefaultMemberPermissions(PermissionFlagsBits.KickMembers),
   hide: true,
   help: "Allow a member to talk again who has previously been muted.",
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
            false,
            interaction.guild
         );

         if (!result)
            return interaction.reply({
               content: "Failed to unmute member, perhaps they're not muted?",
               ephemeral: true,
            });

         return interaction.reply({
            content: `Unmuted member`,
            ephemeral: true,
         });
      } catch (error) {
         console.error(error);
      }
   },
};

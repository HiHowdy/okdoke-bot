import { bold, EmbedBuilder, SlashCommandBuilder } from "@discordjs/builders";
import { PermissionFlagsBits } from "discord.js";
import { safeDM } from "../../lib/utils";
import ExtendedClient from "../../structs/client";

const auth = require("../../schemas/Authorized");
const Members = require("../../schemas/Member");

export default {
   data: new SlashCommandBuilder()
      .setName("warn")
      .setDescription("Warn a member")
      .addMentionableOption((option) =>
         option
            .setName("user")
            .setDescription("The user to mute")
            .setRequired(true)
      )
      .addStringOption((option) =>
         option
            .setName("reason")
            .setDescription("The reason for the mute")
            .setRequired(true)
      )
      .setDefaultMemberPermissions(PermissionFlagsBits.KickMembers),
   hide: true,
   help: "Warn a member of the community.",
   async execute(client: ExtendedClient, interaction: any) {
      try {
         if (!interaction.isRepliable()) return;
         const authorized = await auth.isGuildAuthorized(interaction.guild);
         if (!authorized)
            return interaction.reply({
               content: "This server is not authorized to use my features",
            });

         const user = interaction.options.getMentionable("user");
         const reason = interaction.options.getString("reason");

         const warningEmbed = new EmbedBuilder()
            .setTitle("You have been warned")
            .setDescription(
               `You have been warned in ${bold(
                  interaction.guild.name
               )}. Reason: ${bold(reason)}`
            )
            .setColor([235, 12, 34])
            .setTimestamp();

         await safeDM(user, warningEmbed);

         const member = await Members.fetchMember(interaction.guild, user);
         if (!member) return;

         const warnings = member.warnings;
         warnings.push(reason);
         await Members.setMemberValue(
            interaction.guild,
            user,
            "warnings",
            warnings
         );

         return interaction.reply({
            content: `Warned ${bold(user)} for reason: ${bold(reason)}. This member has been warned a total of ${warnings.length} times.`,
            ephemeral: true,
         });
      } catch (error) {
         console.error(error);
      }
   },
};

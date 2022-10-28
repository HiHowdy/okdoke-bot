import { SlashCommandBuilder } from "@discordjs/builders";
import { PermissionFlagsBits, TextChannel } from "discord.js";
import ExtendedClient from "src/structs/client";

const auth = require("../../schemas/Authorized");
const _Guild = require("../../schemas/Guild");

export default {
   data: new SlashCommandBuilder()
      .setName("setrolepresence")
      .setDescription("Enable/Disable live stream presence updates for a role")
      .addBooleanOption((option) =>
         option
            .setName("enabled")
            .setDescription(
               "Whether to enable or disable live stream presence updates"
            )
            .setRequired(true)
      )
      .addRoleOption((option) =>
         option

            .setName("role")
            .setDescription("The role to set the presence for")
            .setRequired(true)
      )
      .addChannelOption((option) =>
         option
            .setName("channel")
            .setDescription("The channel to send the presence update in")
            .setRequired(true)
      )
      .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),
   help: "Enable/Disable live stream presence updates for a user by specifying the required fields.\nEnabled: True/False\nRole: Select which role\nChannel: Mention the channel",
   async execute(client: ExtendedClient, interaction: any) {
      try {
         if (!interaction.isRepliable()) return;
         const authorized = await auth.isGuildAuthorized(interaction.guild);
         if (!authorized)
            return interaction.reply({
               content: "This server is not authorized to use my features",
               ephemeral: true,
            });

         const enabled = interaction.options.getBoolean("enabled");
         const role = interaction.options.getRole("role");
         const channel = interaction.options.getChannel("channel");
         await _Guild.setRolePresenceSetting(
            interaction.guild,
            "enabled",
            enabled
         );
         await _Guild.setRolePresenceSetting(
            interaction.guild,
            "role",
            role.id
         );
         await _Guild.setRolePresenceSetting(
            interaction.guild,
            "channel",
            channel.id
         );

         const _channel = (await client.channels.fetch(
            channel.id
         )) as TextChannel;

         if (_channel && _channel.isTextBased()) {
            _channel.send({
               content: `<@&${role.id}> live stream updates will now ${
                  enabled ? "be sent" : "no longer be sent"
               } to this channel`,
            });
         }

         interaction.reply({
            content: `Live stream presence updates are now ${
               enabled ? "enabled" : "disabled"
            } for <@&${role.id}> in <#${channel.id}>`,
            ephemeral: true,
         });
      } catch (error) {
         console.error(error);
      }
   },
};

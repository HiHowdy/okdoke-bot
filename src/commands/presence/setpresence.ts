import { SlashCommandBuilder } from "@discordjs/builders";
import { PermissionFlagsBits, TextChannel } from "discord.js";
import ExtendedClient from "src/structs/client";

const auth = require("../../schemas/Authorized");
const _Guild = require("../../schemas/Guild");

export default {
   data: new SlashCommandBuilder()
      .setName("setpresence")
      .setDescription(
         "Enable/Disable live stream presence updates for a user"
      )
      .addBooleanOption((option) =>
         option
            .setName("enabled")
            .setDescription(
               "Whether to enable or disable live stream presence updates"
            )
            .setRequired(true)
      )
      .addMentionableOption((option) =>
         option
            .setName("user")
            .setDescription("The user to set the presence for")
            .setRequired(true)
      )
      .addChannelOption((option) =>
         option
            .setName("channel")
            .setDescription("The channel to send the presence update in")
            .setRequired(true)
      )
      .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),
   help: "Enable/Disable live stream presence updates for a user by specifying the required fields.\nEnabled: True/False\nUser: Mention the user\nChannel: Mention the channel",
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
         const user = interaction.options.getMentionable("user");
         const channel = interaction.options.getChannel("channel");
         await _Guild.setPresenceSetting(interaction.guild, 'enabled', enabled);
         await _Guild.setPresenceSetting(interaction.guild, 'client_id', user.id);
         await _Guild.setPresenceSetting(interaction.guild, 'channel', channel.id);

         const _channel = await client.channels.fetch(channel.id) as TextChannel;
         
         if (_channel && _channel.isTextBased()) {
            _channel.send({
               content: `<@${user.id}> live stream updates will now ${
                  enabled ? "be sent" : "no longer be sent"
               } to this channel`,
            });
         }

         interaction.reply({
            content: `Live stream presence updates are now ${
               enabled ? "enabled" : "disabled"
            } for <@${user.id}> in <#${channel.id}>`,
            ephemeral: true,
         });
      } catch (error) {
         console.error(error);
      }
   },
};

import { SlashCommandBuilder } from "@discordjs/builders";
import { PermissionFlagsBits } from "discord.js";
import ExtendedClient from "src/structs/client";

const auth = require("../../../schemas/Authorized");
const _Guild = require("../../../schemas/Guild");

export default {
   data: new SlashCommandBuilder()
      .setName("setautomodchannel")
      .setDescription("Sets the channel for automod to send logs to")
      .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels),
   async execute(client: ExtendedClient, interaction: any) {
      try {
         if (!interaction.isRepliable()) return;
         const authorized = await auth.isGuildAuthorized(interaction.guild);
         if (!authorized)
            return interaction.reply({
               content: "This server is not authorized to use my features",
            });

         const _guild = await _Guild.fetchGuild(interaction.guild);
         _guild.automod.log_channel = interaction.channel.id;
         await _guild.save();

         interaction.reply({
            content: `Set the automod channel to ${interaction.channel}`,
            ephemeral: true,
         });
      } catch (error) {
         console.error(error);
      }
   },
};

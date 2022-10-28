import { ActionRowBuilder } from "@discordjs/builders";
import {
   ApplicationCommandType,
   ButtonBuilder,
   ButtonStyle,
   Interaction,
} from "discord.js";
import formatString from "../../lib/formatString";
import ExtendedClient from "src/structs/client";

module.exports = {
   name: "test",
   description: "Command for testing purposes",
   type: ApplicationCommandType.ChatInput,
   cooldown: 3000,
   run: async (client: ExtendedClient, interaction: Interaction) => {
      if (!interaction.isRepliable()) return;

      // get the user Client
      const user = interaction.user;

      const string = formatString(
         "Hello, {user}! Welcome to {guild}! It is currently {date} and the time is {time}.",
         user,
         interaction.guild!
      );

      interaction.reply({
         content: string,
      })
   },
};

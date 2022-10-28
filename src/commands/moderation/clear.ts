import { SlashCommandBuilder } from "@discordjs/builders";
import { PermissionFlagsBits } from "discord.js";
import ExtendedClient from "src/structs/client";

const auth = require("../../schemas/Authorized");

export default {
   data: new SlashCommandBuilder()
      .setName("clear")
      .setDescription("Clears messages from a channel")
      .addNumberOption((option) =>
         option
            .setName("amount")
            .setDescription("The amount of messages to clear")
            .setRequired(true)
      )
      .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),
   help: "Clears messages from a channel. The maximum amount of messages that can be cleared at once is 100.",
   async execute(client: ExtendedClient, interaction: any) {
      try {
         if (!interaction.isRepliable()) return;
         const authorized = await auth.isGuildAuthorized(interaction.guild);
         if (!authorized)
            return interaction.reply({
               content: "This server is not authorized to use my features",
            });

         const amount = interaction.options.getNumber("amount");
         if (amount > 100)
            return interaction.reply({
               content: "You can only clear up to 100 messages at a time",
               ephemeral: true,
            });

         interaction.channel
            .bulkDelete(amount)
            .then(() => {
               interaction.reply({
                  content: `Cleared ${amount} messages`,
                  ephemeral: true,
               });
            })
            .catch((error: any) => {
               console.error(error);
               interaction.reply({
                  content: "An error occurred while clearing messages",
                  ephemeral: true,
               });
            });
      } catch (error) {
         console.error(error);
      }
   },
};

import { SlashCommandBuilder } from "@discordjs/builders";
import ExtendedClient from "src/structs/client";

const auth = require("../../schemas/Authorized");

export default {
   data: new SlashCommandBuilder()
      .setName("uptime")
      .setDescription("Check how long OkDoke has been online"),
   help: "Check how long I have been online for",
   async execute(client: ExtendedClient, interaction: any) {
      try {
         if (!interaction.isRepliable()) return;
         const authorized = await auth.isGuildAuthorized(interaction.guild);
         if (!authorized)
            return interaction.reply({
               content: "This server is not authorized to use my features",
               ephemeral: true,
            });

         const uptime = process.uptime();
         const days = Math.floor(uptime / 86400);
         const hours = Math.floor((uptime % 86400) / 3600);
         const minutes = Math.floor((uptime % 3600) / 60);
         const seconds = Math.floor(uptime % 60);

         const uptimeString = `${days} days, ${hours} hours, ${minutes} minutes, and ${seconds} seconds`;

         return await interaction.reply({
            content: `I have been online for ${uptimeString}`,
         });
      } catch (error) {
         console.error(error);
      }
   },
};

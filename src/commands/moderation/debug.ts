import { SlashCommandBuilder } from "@discordjs/builders";
import { PermissionFlagsBits } from "discord.js";
import ExtendedClient from "src/structs/client";

const auth = require("../../schemas/Authorized");
const _Guild = require("../../schemas/Guild");

export default {
   data: new SlashCommandBuilder()
      .setName("debug")
      .setDescription("Set debug mode for auto mod")
      .addBooleanOption((option) =>
         option
            .setName("debug")
            .setDescription("Set debug mode for auto mod")
            .setRequired(true)
      )
      .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
   hide: true,
   help: "Places the community into debug mode.",
   async execute(client: ExtendedClient, interaction: any) {
      try {
         if (!interaction.isRepliable()) return;
         const authorized = await auth.isGuildAuthorized(interaction.guild);
         if (!authorized)
            return interaction.reply({
               content: "This server is not authorized to use my features",
            });

         const userId = interaction.user.id;
         if (userId !== process.env.OWNER_ID)
            return interaction.reply({
               content: "You are not authorized to use this command",
               ephemeral: true,
            });

         const debug = interaction.options.getBoolean("debug") || false;
         await _Guild.setAutomodSetting(interaction.guild, "debug", debug);

         return interaction.reply({
            content: `Debug mode for auto mod has been set to \`${debug}\``,
         });
      } catch (error) {
         console.error(error);
      }
   },
};

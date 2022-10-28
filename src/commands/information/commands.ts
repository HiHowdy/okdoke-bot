import { EmbedBuilder, SlashCommandBuilder } from "@discordjs/builders";
import { APIApplicationCommandOptionChoice } from "discord.js";
import { client } from "../../index";
import ExtendedClient from "../../structs/client";

const auth = require("../../schemas/Authorized");

const buildChoices = () => {
   const choices = [];

   for (const command of client.commands.values()) {
      choices.push(command.name);
   }

   return { ...choices };
};

export default {
   data: new SlashCommandBuilder()
      .setName("commands")
      .setDescription(
         "Get a list of my commands and how to use them. Type /commands categories for a list of categories."
      )
      .addStringOption((option: any) => {
         option
            .setName("category")
            .setDescription(
               "The category of commands you want to see (Help for more info)"
            )
            .setRequired(true);
         return option;
      }),
   help: "Get a list of my commands and how to use them.",
   async execute(client: ExtendedClient, interaction: any) {
      try {
         if (!interaction.isRepliable()) return;
         const authorized = await auth.isGuildAuthorized(interaction.guild);
         if (!authorized)
            return interaction.reply({
               content: "This server is not authorized to use my features",
               ephemeral: true,
            });

         const fields: any = [];

         const category = interaction.options.getString("category");

         if (category === "categories") {
            const embed = new EmbedBuilder().setTitle("Categories").addFields([
               {
                  name: "Here are a list of command categories that I offer to this server",
                  value: client.commandCategories.join(", "),
               },
            ]);

            return await interaction.reply({ embeds: [embed] });
         }

         // check if category exists
         if (!client.commandCategories.includes(category))
            return interaction.reply({
               content:
                  "That category does not exist. Type /commands categories for help",
               ephemeral: true,
            });

         client.commands.forEach((command) => {
            if (
               (command.hide && interaction.user.id !== process.env.OWNER_ID) ||
               command.category !== category
            )
               return;

            fields.push({
               name: `/${command.name}`,
               value: command.help ?? "Undocumented. Check back soon...",
            });
         });

         if (fields.length === 0) {
            return await interaction.reply({
               content:
                  "It appears you do not have permission to access the commands in this category",
            });
         }

         const EMBED = new EmbedBuilder()
            .setTitle("OkDoke Commands")
            .setDescription(
               `Here is a list of commands for the category ${category}`
            )
            .setColor(2)
            .setFooter({
               text: "OkDoke",
            })
            .addFields(fields);

         interaction.reply({
            embeds: [EMBED],
         });
      } catch (error) {
         console.error(error);
      }
   },
};

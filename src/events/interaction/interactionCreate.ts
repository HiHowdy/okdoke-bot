import { Collection, CommandInteraction } from "discord.js";
import ExtendedClient from "src/structs/client";

const cooldown = new Collection();

module.exports = async (
   client: ExtendedClient,
   interaction: CommandInteraction
) => {
   if (!interaction.guild) {
      return interaction
         .reply({
            content:
               "Commands can only be executed from within an authorized Discord server.",
         })
         .catch(() => {});
   } else if (interaction.isCommand()) {
      const command: any = client.slashCommands.get(interaction.commandName);
      await command.execute(client, interaction);
   }
};

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
exports.default = (client) => {
    client.on(discord_js_1.Events.InteractionCreate, (interaction) => {
        if (!interaction.isCommand() || !client.commands)
            return;
        const command = client.commands.get(interaction.commandName);
        if (!command)
            return;
        try {
            command.execute(interaction);
        }
        catch (error) {
            console.error(error);
            interaction.reply({
                content: "There was an error while executing this command!",
                ephemeral: true,
            });
        }
    });
};

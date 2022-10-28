"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.client = void 0;
require("dotenv").config();
const fs = require("node:fs");
const path = require("path");
const { Client, REST, GatewayIntentBits, Collection, Routes, } = require("discord.js");
exports.client = new Client({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildPresences],
});
exports.client.commands = new Collection();
const commands = [];
const commandsPath = path.join(__dirname, "commands");
const commandFiles = fs
    .readdirSync(commandsPath)
    .filter((file) => file.endsWith(".ts"));
for (const file of commandFiles) {
    const command = require(`./commands/${file}`);
    commands.push(command.data.toJSON());
    if ("data" in command && "execute" in command) {
        exports.client.commands.set(command.data.name, command);
    }
    else {
        console.log(`Command ${file} is missing data or execute`);
    }
}
const listenersPath = path.join(__dirname, "listeners");
const listenerFiles = fs
    .readdirSync(listenersPath)
    .filter((file) => file.endsWith(".ts"));
for (const file of listenerFiles) {
    const listener = require(`./listeners/${file}`);
    if ("default" in listener) {
        listener.default(exports.client);
    }
    else {
        console.log(`Listener ${file} is missing default`);
    }
}
const rest = new REST({ version: "10" }).setToken(process.env.DISCORD_TOKEN);
(async () => {
    try {
        console.log("Started refreshing application (/) commands.");
        await rest.put(Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID), { body: commands });
        console.log("Successfully reloaded application (/) commands.");
    }
    catch (error) {
        console.error(error);
    }
})();
exports.client.login(process.env.DISCORD_TOKEN);

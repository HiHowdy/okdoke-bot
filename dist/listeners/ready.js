"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const pogger = require("pogger");
exports.default = (client) => {
    client.on("ready", async () => {
        if (!client.user || !client.application)
            return;
        pogger.success(`Bot online as: ${client.user.tag}!`);
        client.user?.setActivity("commands", {
            type: discord_js_1.ActivityType.Listening
        });
    });
};

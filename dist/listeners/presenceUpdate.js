"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LIVE_EMBED = void 0;
const discord_js_1 = require("discord.js");
const LIVE_MEMBERS = {};
const LIVE_LINK = "https://highhowdy.tv";
exports.LIVE_EMBED = new discord_js_1.EmbedBuilder()
    .setColor("#6441a5")
    .setTitle("Howdy is LIVE")
    .setURL(LIVE_LINK)
    .setDescription("Howdy is now live on Twitch. Click the title to watch.")
    .setThumbnail("https://blog.twitch.tv/assets/uploads/03-glitch.jpg")
    .setTimestamp()
    .setFooter({
    text: "HighHowdy - https://highhowdy.tv",
})
    .setImage("https://blog.twitch.tv/assets/uploads/03-glitch.jpg");
const containsActivityType = (activities, type) => activities.some((activity) => activity.type === type);
const liveTimeRemaining = (date) => date - Date.now();
exports.default = (client) => {
    client.on(discord_js_1.Events.PresenceUpdate, async (oldMember, newMember) => {
        try {
            if (!oldMember.user)
                return;
            const userId = oldMember.user.id;
            const roles = oldMember.member.roles.cache;
            const isHowdy = userId === process.env.HOWDY_ID;
            if (!isHowdy)
                return;
            const liveDate = LIVE_MEMBERS[userId] ?? Date.now();
            const timeRemaining = liveTimeRemaining(liveDate);
            if (timeRemaining > 0)
                return;
            const isStreaming = containsActivityType(newMember.activities, discord_js_1.ActivityType.Streaming);
            if (!isStreaming)
                return;
            LIVE_MEMBERS[userId] = Date.now() + 15 * 60 * 1000;
            const channelId = isHowdy
                ? process.env.LIVE_CHANNEL_ID
                : process.env.SQUAD_LIVE_CHANNEL_ID;
            const channel = client.channels.cache.get(channelId);
            if (!channel)
                return;
            await channel.send({
                content: isHowdy ? "@here" : `<@${userId}>`,
                embeds: [exports.LIVE_EMBED],
            });
        }
        catch (error) {
            console.error(error);
        }
    });
};

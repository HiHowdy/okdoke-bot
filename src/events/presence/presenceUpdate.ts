import { EmbedBuilder } from "@discordjs/builders";
import { ActivityType, TextChannel } from "discord.js";
import ExtendedClient from "../../structs/client";

const _Guild = require("../../schemas/Guild");
const _Auth = require("../../schemas/Authorized");

const LIVE_EMBED = new EmbedBuilder()
   .setColor([100, 65, 165])
   .setTitle("Live Stream")
   .setTimestamp();

const LIVE_TIMERS: { [key: string]: number } = {};

const timeRemaining = (date: number) => date - Date.now();
export const containsActivityType = (activities: any[], type: ActivityType) =>
   activities.some((activity) => activity.type === type);
export const getStreamingActivityIndex = (activities: any[]) =>
   activities.findIndex((activity) => activity.type === ActivityType.Streaming);

module.exports = async (client: ExtendedClient, _old: any, _new: any) => {
   try {
      if (!_old || !_old.user) return;
      const guild = _old.guild;
      const authorized = await _Auth.isGuildAuthorized(guild);
      if (!authorized) return;

      const settings = await _Guild.fetchGuild(guild);
      if (!settings) return;

      if (settings.rolePresence.enabled) {
         if (settings.presence.enabled)
            if (settings.presence.client_id === _old.user.id) {
               if (
                  containsActivityType(_old.activities, ActivityType.Streaming)
               )
                  return;
               if (settings.presence.client_id === _old.user.id) {
                  if (
                     settings.presence.channel &&
                     settings.presence.channel !== "unset"
                  ) {
                     const liveDate = LIVE_TIMERS[_old.user.id] ?? Date.now();
                     const remaining = timeRemaining(liveDate);
                     if (remaining > 0) return;

                     const isStreaming = containsActivityType(
                        _new.activities,
                        ActivityType.Streaming
                     );

                     if (isStreaming) {
                        LIVE_TIMERS[_old.user.id] = Date.now() + 15 * 60 * 1000;
                        const channel = guild.channels.cache.get(
                           settings.presence.channel
                        ) as TextChannel;

                        if (channel) {
                           const index = getStreamingActivityIndex(
                              _new.activities
                           );
                           const activity = _new.activities[index];
                           const message = settings.presence.message
                              .replace("{user}", _new.user.toString())
                              .replace("{url}", activity.url)
                              .replace("{name}", activity.name)
                              .replace("{game}", activity.details);

                           LIVE_EMBED.setTitle(activity.details);
                           LIVE_EMBED.setDescription(message);
                           LIVE_EMBED.setURL(activity.url);
                           LIVE_EMBED.setThumbnail(
                              _old.user.displayAvatarURL()
                           );

                           try {
                              channel.send({
                                 content: "@everyone",
                                 embeds: [LIVE_EMBED],
                              });
                           } catch (error) {
                              console.log(error);
                           }
                        }
                     }
                  }
               }
            }

         const role = guild.roles.cache.get(settings.rolePresence.role);
         if (!role) return;

         const member = guild.members.cache.get(_old.user.id);
         if (!member) return;

         if (!member.roles.cache.has(role.id)) return;
         if (containsActivityType(_old.activities, ActivityType.Streaming))
            return;

         if (containsActivityType(_new.activities, ActivityType.Streaming)) {
            const liveDate = LIVE_TIMERS[_old.user.id] ?? Date.now();
            const remaining = timeRemaining(liveDate);

            if (remaining > 0) return;

            if (remaining <= 0) {
               LIVE_TIMERS[_old.user.id] = Date.now() + 15 * 60 * 1000;
               const index = getStreamingActivityIndex(_new.activities);
               const activity = _new.activities[index];
               if (!activity) return;

               const channel = guild.channels.cache.get(
                  settings.rolePresence.channel
               ) as TextChannel;
               if (!channel) return;

               const avatar = _old.user.displayAvatarURL({ dynamic: true });

               const message = settings.rolePresence.message
                  .replace("{user}", _new.user.toString())
                  .replace("{url}", activity.url)
                  .replace("{name}", activity.name)
                  .replace("{game}", activity.details);

               LIVE_EMBED.setTitle(activity.details);
               LIVE_EMBED.setDescription(message);
               LIVE_EMBED.setURL(activity.url);
               LIVE_EMBED.setThumbnail(avatar);
               channel.send({ embeds: [LIVE_EMBED] });
            }
         }
      }
   } catch (error) {
      console.error(error);
   }
};

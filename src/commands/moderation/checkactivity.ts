import { EmbedBuilder, SlashCommandBuilder } from "@discordjs/builders";
import { ActivityType, PermissionFlagsBits } from "discord.js";
import ExtendedClient from "../../structs/client";

const auth = require("../../schemas/Authorized");

const containsActivityType = (activities: any[], type: ActivityType) =>
   activities.some((activity) => activity.type === type);
const getStreamingActivityIndex = (activities: any[]) =>
   activities.findIndex((activity) => activity.type === ActivityType.Streaming);

export default {
   data: new SlashCommandBuilder()
      .setName("checkactivity")
      .setDescription("Check a users activities")
      .addMentionableOption((option) =>
         option
            .setName("user")
            .setDescription("The user to clear messages from")
            .setRequired(true)
      )
      .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
   hide: true,
   help: "Check a users activities",
   async execute(client: ExtendedClient, interaction: any) {
      try {
         const user = interaction.options.getMentionable("user");
         const authorized = await auth.isGuildAuthorized(interaction.guild);
         if (!authorized)
            return interaction.reply({
               content: "This server is not authorized to use my features",
            });

         const activities = user.presence.activities;
         if (containsActivityType(activities, ActivityType.Streaming)) {
            const index = getStreamingActivityIndex(activities);
            const activity = activities[index];
            const avatar = user.displayAvatarURL({ dynamic: true });

            const LIVE_EMBED = new EmbedBuilder()
               .setColor([100, 65, 165])
               .setTitle(activity.details)
               .setURL(activity.url)
               .setThumbnail(avatar)
               .setDescription(
                  `<@${user.id}> is now live on ${activity.name}: ${activity.url}. Streaming ${
                     activity.state ? activity.state : `on ${activity.name}`
                  } @everyone`
               );

            await interaction.reply({
               embeds: [LIVE_EMBED],
            });
         }
      } catch (error) {
         console.error(error);
      }
   },
};

import { EmbedBuilder, SlashCommandBuilder } from "@discordjs/builders";
import { PermissionFlagsBits } from "discord.js";
import ExtendedClient from "src/structs/client";

const auth = require("../../schemas/Authorized");

export default {
   data: new SlashCommandBuilder()
      .setName("setup")
      .setDescription("Get help setting up OkDoke for your server")
      .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
   help: "Get help setting up OkDoke for your server.",
   permissions: PermissionFlagsBits.Administrator,
   async execute(client: ExtendedClient, interaction: any) {
      try {
         if (!interaction.isRepliable() || !client.user) return;
         const authorized = await auth.isGuildAuthorized(interaction.guild);
         const embedDescription = authorized
            ? "It seems your server is authorized. Great, let me help you get started on setting up some features for your community. Listed below are the commands you can use to set up the features you want."
            : "It seems your server is not authorized. To get started, you need to authorize your server. To do this, you need to run `/auth <code>` command. Once you have done this, use /setup again for more information.";

         // get bot avatar
         const botAvatar = client?.user?.displayAvatarURL();
         const EMBED = new EmbedBuilder()
            .setTitle("OkDoke Setup")
            .setDescription(embedDescription)
            .setColor(1)
            .setThumbnail(botAvatar);

         await interaction.reply({ embeds: [EMBED] });

         if (!authorized) return;

         const PRESENCE_EMBED = new EmbedBuilder()
            .setTitle("User Stream Notifications")
            .setDescription(
               "I have built in live streaming presence. This means that when a user is live streaming, I will update the presence of the bot to show that they are live. This is a great way to let your community know that a user is live streaming."
            )
            .setColor(1)
            .addFields([
               {
                  name: "User Stream Notifications",
                  value: "You can opt in to have live streaming presence for the main user/streamer of your community.\nFirstly you will need a text channel created for the stream notifications to be sent to. Once you have done this, run the `/setpresence` command. It will ask for three options. Enable or disable the feature, the user to set the presence for and the channel to send the presence update in. Once you have done this, you are all set up.",
               },
               {
                  name: "Role Stream Notifications",
                  value: "You can opt in to have live streaming presence for a group of users/streamers in your community. This works very similar to the user stream notifications, but instead of setting a single user, you can set a group of users. To do this, firstly set up a role within your discord & a notification channel, name them whatever you like. Then, run the `/setrolegroup` command. It will ask for three options. Enable or disable the feature, the role to set the presence for and the channel to send the presence update in. Once you have done this, you are all set up.",
               },
            ]);

         await interaction.followUp({ embeds: [PRESENCE_EMBED] });

         const AUTOMOD_EMBED = new EmbedBuilder()
            .setTitle("Auto Mod")
            .setDescription(
               "I have an auto moderation feature built in and running by default. This feature is still a work in progress. Addons such as naughty words are optional."
            )
            .setColor(1)
            .addFields([
               {
                  name: "Strike System",
                  value: "The strike system is still in it's early stages of development. Once a member has broken an auto-mod rule that you've set up they will recieve a direct message letting them know, I will also log this in a text channel of your choice. Once the user reaches 5 strikes they will recieve punishment. By default this is a mute from the server. I am working to add more punishments which you will be able to choose. You will soon also be able to set the maximum strikes before punishment.",
               },
               {
                  name: "Auto Mod: Naughty Words/Phrases",
                  value: "You can choose to ban specific words of phrases within your community. To do this, run `/banword`. It will ask two options. To enable/disable the ban of this word or phrase and secondly the word or phrase in question. It's not case sensitive so don't worry! You can disable the ban of a word or phrase by running the same command and setting the enabled option to false.",
               },
               {
                  name: "Auto Mod: Invite Links",
                  value: "Feature coming soon...",
               },
               {
                  name: "Auto Mod: Mentions",
                  value: "Feature coming soon...",
               },
               {
                  name: "Auto Mod: Spam",
                  value: "Feature coming soon...",
               },
               {
                  name: "Auto Mod: Caps",
                  value: "Feature coming soon...",
               },
               {
                  name: "Auto Mod: Ghost Links",
                  value: "Feature coming soon...",
               },
            ]);

         await interaction.followUp({ embeds: [AUTOMOD_EMBED] });
      } catch (error) {
         console.error(error);
      }
   },
};

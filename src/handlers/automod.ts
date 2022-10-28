import { EmbedBuilder } from "@discordjs/builders";
import { Message, PermissionFlagsBits } from "discord.js";
import { safeDM, containsLink, containsInvite } from "../lib/utils";
import { muteMember } from "./moderation";

const _Guild = require("../schemas/Guild");
const _Members = require("../schemas/Member");
const _Memes = require("random-memes");

const IGNORED_PERMS = [
   PermissionFlagsBits.Administrator,
   PermissionFlagsBits.ManageMessages,
   PermissionFlagsBits.ManageGuild,
   PermissionFlagsBits.BanMembers,
   PermissionFlagsBits.KickMembers,
];

export const shouldModerate = (message: Message) => {
   const { member } = message;
   if (member?.permissions.has(IGNORED_PERMS)) return false;
   return true;
};

export const autoMod = async (client: any, message: any, settings: any) => {
   try {
      const { automod } = settings;
      const { content, author } = message;

      if (!shouldModerate(message) && !automod.debug) return;

      const fields = [];
      let totalStrikes = 0;
      let deleteMessage = false;

      if (automod.anti_links && containsLink(content)) {
         totalStrikes += 1;
         deleteMessage = true;
         fields.push({
            name: "Anti-Links",
            value: "You are not allowed to send links in this server.",
         });
      }

      if (automod.anti_invites && containsInvite(content)) {
         totalStrikes += 1;
         deleteMessage = true;
         fields.push({
            name: "Anti-Invites",
            value: "You are not allowed to send invites in this server.",
         });
      }

      if (automod.banned_words.length > 0) {
         const bannedWords = automod.banned_words;
         for (const word of bannedWords) {
            if (content.toLowerCase().includes(word.toLowerCase())) {
               totalStrikes += 1;
               fields.push({
                  name: "Banned Word",
                  value: `You are not allowed to send the word \`${word}\` in this server.`,
               });
            }
         }
      }

      if (deleteMessage)
         await message.delete().catch((err: any) => {
            console.error(err);
         });

      if (totalStrikes > 0) {
         const member = await _Members.fetchMember(message.guild, author);
         const strikes = member.strikes + totalStrikes;
         await _Members.setStrikes(message.guild, author, strikes);

         const strikeEmbed = new EmbedBuilder()
            .setColor(3)
            .setThumbnail(message.guild.iconURL())
            .setAuthor({ name: "Automod" })
            .setDescription(
               `You have been given ${totalStrikes} strike(s) in ${message.guild.name} for the following reasons:`
            )
            .addFields(fields);

         await safeDM(author, strikeEmbed);

         const messageId = message.id;
         const meme = await _Memes.random();
         const logEmbed = new EmbedBuilder()
            .setColor(3)
            .setThumbnail(meme.image)
            .setAuthor({ name: "Automod" })
            .setFooter({ text: `Message ID: ${messageId}` })
            .setDescription(
               `${author} has been given ${totalStrikes} strike(s) for the following reasons:`
            )
            .addFields(fields);

         const guild = await _Guild.fetchGuild(message.guild);
         const logChannel = guild.automod?.log_channel;

         if (logChannel && logChannel !== "unset")
            await client.channels.cache.get(logChannel).send({
               embeds: [logEmbed],
            });

         if (strikes >= automod.strikes) {
            await _Members.setStrikes(message.guild, author, 0);
            await muteMember(author, true, message.guild);
            await safeDM(
               author,
               new EmbedBuilder()
                  .setColor(3)
                  .setThumbnail(message.guild.iconURL())
                  .setAuthor({ name: "Automod" })
                  .setDescription(
                     `You have been muted in ${message.guild.name} for reaching ${automod.strikes} strike(s).`
                  )
            );

            if (logChannel && logChannel !== "unset")
               await client.channels.cache.get(logChannel).send({
                  embeds: [
                     new EmbedBuilder()
                        .setColor(3)
                        .setThumbnail(message.guild.iconURL())
                        .setAuthor({ name: "Automod" })
                        .setDescription(
                           `${author} has been muted for reaching ${automod.strikes} strike(s).`
                        ),
                  ],
               });
            return;
         }
      }
   } catch (error) {
      console.error(error);
   }
};

import { User } from "discord.js";

export const safeDM = async (user: User, content: any, seconds?: number) => {
   if (!user || !content) return;

   try {
      const dm = await (
         await user.createDM()
      ).send({
         embeds: [content],
      });

      if (seconds) {
         setTimeout(() => {
            dm.delete();
         }, seconds * 1000);
      }
   } catch (error) {
      console.error(error);
   }
};

const LINK_PATTERN =
   /(https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|www\.[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9]+\.[^\s]{2,}|www\.[a-zA-Z0-9]+\.[^\s]{2,})/;

const containsLink = (content: string) => LINK_PATTERN.test(content);

const INVITE_PATTERN =
   /(https?:\/\/)?(www.)?(discord.(gg|io|me|li|link|plus)|discorda?p?p?.com\/invite|invite.gg|dsc.gg|urlcord.cf)\/[^\s/]+?(?=\b)/;

const containsInvite = (content: string) => INVITE_PATTERN.test(content);

export { containsLink, containsInvite };

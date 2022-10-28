import { Client, Guild, time, User } from "discord.js";

const formatString = (str: string, client: Client | User, guild: Guild) => {
   return str
      .replace(
         /{user}/g,
         client instanceof User ? client.username : client.user!.username
      )
      .replace(/{guild}/g, guild.name)
      .replace(/{time}/g, time(new Date(), "t"))
      .replace(/{date}/g, time(Date.now(), "D"));
};

export default formatString;

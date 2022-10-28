import { ActivityType } from "discord.js";
import ExtendedClient from "../structs/client";

const pogger = require("pogger");

module.exports = async (client: ExtendedClient) => {
   pogger.success(`Logged in as ${client.user!.tag}!`);

   client.user?.setPresence({
      status: 'online',
      activities: [
         {
            name: 'with the code',
            type: ActivityType.Playing
         }
      ]
   })
}
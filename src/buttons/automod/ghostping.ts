import { Interaction } from "discord.js"

module.exports = {
   execute: async (interaction: Interaction, buttonId: string) => {
      console.log(buttonId);
   }
}
require("dotenv").config();

import {
   GatewayIntentBits,
   Client,
   Collection,
   REST,
   Routes,
} from "discord.js";

const mongoose = require("mongoose");
const pogger = require("pogger");
const path = require("path");
const fs = require("fs");

const rest = new REST({ version: "10" }).setToken(process.env.DISCORD_TOKEN!);

class ExtendedClient extends Client {
   config: any;
   slashCommands: Collection<unknown, unknown>;
   commands: {
      name: string;
      help?: string;
      permissions?: any;
      hide?: boolean;
      category: string;
   }[];
   commandCategories: string[];
   buttons: Collection<unknown, unknown>;

   constructor() {
      super({
         intents: [
            GatewayIntentBits.Guilds,
            GatewayIntentBits.GuildMessages,
            GatewayIntentBits.GuildPresences,
            GatewayIntentBits.MessageContent,
         ],
      });

      this.config = require("../config");
      this.slashCommands = new Collection();
      this.buttons = new Collection();
      this.commands = [];
      this.commandCategories = [];
   }

   async initDatabase() {
      pogger.info("Attempting to connect to the database...");
      mongoose
         .connect(process.env.MONGO_URI!)
         .then(() => {
            pogger.success(
               "Database connection has been established successfully"
            );
         })
         .catch((err: any) => {
            pogger.error("Error connecting to database");
            console.log(err);
         });
   }

   getAbsoluteFilePaths(directory: string) {
      const filePaths: any[] = [];

      const readCommands = (dir: string) => {
         const files = fs.readdirSync(path.join(__basedir, dir));
         files.forEach((file: any) => {
            const stat = fs.lstatSync(path.join(__basedir, dir, file));
            if (stat.isDirectory()) {
               readCommands(path.join(dir, file));
            } else {
               const extension = path.extname(file);
               if (extension !== ".ts") {
                  console.error(`Invalid file extension: ${extension}`);
                  return;
               }
               const filePath = path.join(__basedir, dir, file);
               filePaths.push(filePath);
            }
         });
      };
      readCommands(directory);
      return filePaths;
   }

   async loadEvents(directory: string) {
      pogger.info("Loading events...");
      let success = 0;
      let failed = 0;
      const clientEvents = [];

      this.getAbsoluteFilePaths(directory).forEach((file: any) => {
         const event = require(file);
         const eventName = path.basename(file).split(".")[0];

         try {
            this.on(eventName, event.bind(null, this));
            clientEvents.push(eventName);
            success++;
         } catch (err) {
            pogger.error(`Error loading event ${eventName}`);
            console.log(err);
            failed++;
         }
      });

      pogger.success(`Successfully loaded ${success} events`);
      failed > 0 && pogger.error(`Failed to load ${failed} events`);
   }

   async loadButtons(directory: string) {
      pogger.info("Loading buttons...");
      let success = 0;
      let failed = 0;

      this.getAbsoluteFilePaths(directory).forEach((file: any) => {
         const button = require(file);
         const buttonName = path.basename(file).split(".")[0];

         try {
            this.buttons.set(buttonName, button);
            success++;
         } catch (err) {
            pogger.error(`Error loading button ${buttonName}`);
            console.log(err);
            failed++;
         }
      });

      pogger.success(`Successfully loaded ${success} buttons`);
      failed > 0 && pogger.error(`Failed to load ${failed} buttons`);
   }

   async loadCommands(directory: string) {
      pogger.info("Loading commands...");
      const commands: any[] = [];
      let success = 0;
      let failed = 0;

      const filePaths = this.getAbsoluteFilePaths(directory);

      filePaths.forEach((file: any) => {
         const folderName = path.basename(path.dirname(file));
         const command = require(file).default;
         const commandName = path.basename(file).split(".")[0];

         try {
            if (command?.data) {
               commands.push(command.data.toJSON());
               this.commands.push({
                  name: commandName,
                  help: command.help,
                  permissions: command.permissions,
                  hide: command.hide,
                  category: folderName,
               });
               this.slashCommands.set(command.data.name, command);
               success++;
            }
         } catch (err) {
            pogger.error(`Error loading command ${commandName}`);
            console.log(err);
            failed++;
         }
      });

      this.commandCategories = Array.from(
         new Set(this.commands.map((command) => command.category))
      );

      try {
         const result = await rest.put(
            Routes.applicationCommands(this.user!.id),
            {
               body: commands,
            }
         );
         success > 0 &&
            pogger.success(`Successfully loaded ${success} commands`);
      } catch (error) {
         console.error(error);
      }

      failed > 0 && pogger.error(`Failed to load ${failed} commands`);
      pogger.info("Finished loading commands");
   }
}

export default ExtendedClient;

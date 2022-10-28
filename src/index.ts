
require("dotenv").config();

// import chalk from "chalk";
import ExtendedClient from "./structs/client";
export const client = new ExtendedClient();
const pogger = require("pogger");

declare global {
   var __basedir: string;
}

globalThis.__basedir = __dirname;

const init = async () => {
   pogger.info("Initializing OkDoke...");
   await client.initDatabase();
   await client.login(process.env.TOKEN);
   await client.loadEvents('events');
   await client.loadCommands('commands');
   await client.loadButtons('buttons');
}

init();
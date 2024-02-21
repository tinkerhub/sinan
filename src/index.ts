import { Client, IntentsBitField, Collection } from "discord.js";
import dotenv from "dotenv";
import processHandler from "./utils/processHandler";
import fs from "fs";
import { Command, Sinan, SlashCommand } from "types/interfaces";
import getDir from "./utils/getDir";

console.clear();
dotenv.config();

const client = new Client({
  intents: [
    IntentsBitField.Flags.Guilds,
    IntentsBitField.Flags.GuildMessages,
    IntentsBitField.Flags.GuildMessageReactions,
    IntentsBitField.Flags.MessageContent,
    IntentsBitField.Flags.GuildEmojisAndStickers,
    IntentsBitField.Flags.GuildPresences,
    IntentsBitField.Flags.GuildWebhooks,
    IntentsBitField.Flags.DirectMessages,
    IntentsBitField.Flags.DirectMessageTyping,
  ],
  allowedMentions: {
    parse: ["users", "roles"],
    repliedUser: false,
  },
});

const config = JSON.parse(fs.readFileSync("./config.json", "utf-8"));
const sinan = client as Sinan;
sinan.config = config;

sinan.commands = new Collection<string, Command>();
sinan.aliases = new Collection<string, string[]>();
sinan.cooldowns = new Collection<string, number>();
sinan.slashCommands = new Collection<string, SlashCommand>();

export default sinan;

fs.readdirSync(`./${getDir()}/handlers`).forEach((handler) => {
  let event = import(`./handlers/${handler}`);
  event.then((e) => e.default(sinan));
});

sinan.login(process.env.TOKEN!);

// processHandler();

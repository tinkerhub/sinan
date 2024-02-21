import fs from "fs";
import getDir from "../utils/getDir";
import { Routes } from "discord-api-types/v9";
import { REST } from "@discordjs/rest";
import sinan from "../index";
import { ConfigType, SlashCommand, Sinan } from "types/interfaces";
const { clientID } = JSON.parse(
  fs.readFileSync("./config.json", "utf-8")
) as ConfigType;

const TOKEN = sinan.token;

const rest = new REST({ version: "9" }).setToken(TOKEN as string);

export default (sinan: Sinan) => {
  const slashCommands: any[] = [];
  const sinan_ID = process.env.testBotId ?? clientID;
  fs.readdirSync(`./${getDir()}/slashCommands`).forEach(async (dir) => {
    const files = fs
      .readdirSync(`./${getDir()}/slashCommands/${dir}/`)
      .filter((file) => file.endsWith(".js") || file.endsWith(".ts"));

    for (const file of files) {
      let slashCommand = require(`../slashCommands/${dir}/${file}`);

      // When using typescript, the default export is not available
      slashCommand = slashCommand.default;

      slashCommands.push({
        name: slashCommand.name,
        description: slashCommand.description,
        type: slashCommand.type,
        options: slashCommand.options ? slashCommand.options : [],
        dir,
        file,
      });

      if (slashCommand.name) {
        sinan.slashCommands.set(slashCommand.name, slashCommand);
      }
    }
  });
  console.log(`Slash Commands Loaded ✅`);
  (async () => {
    try {
      await rest.put(Routes.applicationCommands(sinan_ID), {
        body: slashCommands,
      });
      console.log("Slash Commands • Registered");
    } catch (error) {
      console.error(error);
    }
  })();
};

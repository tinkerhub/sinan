import fs from "fs";
import client from "../index";
import getDir from "../utils/getDir";

export default (sinan: typeof client) => {
  fs.readdirSync(`./${getDir()}/commands`).forEach((dir: string) => {
    const commands = fs
      .readdirSync(`./${getDir()}/commands/${dir}/`)
      .filter((file: string) => file.endsWith(".js") || file.endsWith(".ts"));
    for (let file of commands) {
      let cmd = require(`../commands/${dir}/${file}`);
      if (cmd.name) {
        sinan.commands.set(cmd.name, cmd);
      }
      if (cmd.aliases && Array.isArray(cmd.aliases))
        cmd.aliases.forEach((alias: string) =>
          sinan.aliases.set(alias, cmd.name)
        );
    }
  });
  console.log("Commands Loaded ✅");
};

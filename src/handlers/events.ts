import fs from "fs";
import client from "../index";
import getDir from "../utils/getDir";

export default (_sinan: typeof client): void => {
  fs.readdirSync(`./${getDir()}/events`)
    .filter((file: string) => file.endsWith(".ts") || file.endsWith(".js"))
    .forEach((event: string) => {
      require(`../events/${event}`);
    });
  console.log("Events Loaded ✅");
};

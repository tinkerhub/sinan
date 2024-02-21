import { ActivityType, Events } from "discord.js";
import sinan from "../index";

sinan.on(Events.ClientReady, () => {
  console.log(`Logged in as ${sinan.user?.username}`);
  sinan.user?.setActivity({
    name: " hackathons 🚀",
    type: ActivityType.Competing,
  });
});

import { Command, Sinan } from "../../types/interfaces";
import { Message } from "discord.js";

export = {
  name: "ping",
  description: "Pong!",
  cooldown: 5000,
  run: async (sinan: Sinan, message: Message, args : String[]) => {
    message.reply({
      content: `🏓 Pong! Latency is ${Date.now() - message.createdTimestamp}ms.\n
      API Latency is ${Math.round(sinan.ws.ping)}ms.`,
    });
  },
} as Command;

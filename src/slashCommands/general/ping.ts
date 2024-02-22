import { ApplicationCommandType, CommandInteraction } from "discord.js";
import { Sinan, SlashCommand } from "../../types/interfaces";

export = {
  name: "ping",
  description: "Check the bot's latency.",
  type: ApplicationCommandType.ChatInput,
  cooldown: 5000,
  options: [],
  run: async (client: Sinan, interaction: CommandInteraction) => {
    interaction.reply({
      content: `🏓 Pong! Latency is ${
        Date.now() - interaction.createdTimestamp
      }ms.\nWebsocket Latency is ${Math.round(client.ws.ping)}ms.`,
      ephemeral: true,
    });
  },
} as SlashCommand;

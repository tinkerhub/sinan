import { EmbedBuilder, WebhookClient } from "discord.js";

const processNotifier = new WebhookClient({
  url: process.env.PROCESS_HOOK as string,
});

export default function processHandler() {
  process.on("unhandledRejection", (reason, promise) => {
    processNotifier.send({
      embeds: [
        new EmbedBuilder()
          .setTitle("Process Handler: Unhandled Rejection")
          .setDescription(
            `**Unhandled Rejection** at: ${JSON.stringify(
              promise,
              null,
              2
            )}\n${reason}`
          )
          .setColor("#ff0000"),
      ],
    });
  });
  process.on("uncaughtException", (error) => {
    processNotifier.send({
      embeds: [
        new EmbedBuilder()
          .setTitle("Process Handler: Uncaught Exception")
          .setDescription(
            `**Uncaught Exception**\nError: ${error?.message}\n\n${
              error?.stack ? "```js\n" + error?.stack + "\n```" : ""
            }`
          )
          .setColor("#ff0000"),
      ],
    });
  });
}

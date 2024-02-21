import {
  Collection,
  EmbedBuilder,
  BaseInteraction,
  GuildMember,
  TextChannel,
  WebhookClient,
  PermissionResolvable,
} from "discord.js";
import ms from "ms";
import sinan from "../index";
import { SlashCommand } from "../types/interfaces";

const cooldown = new Collection<string, number>();

sinan.on("interactionCreate", async (interaction: BaseInteraction | any) => {
  if (interaction.isCommand()) {
    const slashCommand = sinan.slashCommands.get(
      interaction.commandName
    ) as SlashCommand;
    if (!slashCommand) return;

    try {
      if (
        slashCommand.cooldown &&
        !sinan.config.admins.includes(interaction.user.id)
      ) {
        if (cooldown.has(`slash-${slashCommand.name}${interaction.user.id}`))
          return interaction.reply({
            content:
              `You have to wait ` +
              ms(
                cooldown.get(
                  `slash-${slashCommand.name}${interaction.user.id}`
                ) ?? Date.now() - Date.now(),
                { long: true }
              ) +
              `  before you can use this command again!`,
            ephemeral: true,
          });
        if (slashCommand.user_perms || slashCommand.bot_perms) {
          if (
            !(interaction.member as GuildMember).permissions.has(
              (slashCommand.user_perms as PermissionResolvable) || []
            )
          ) {
            const user_perms = new EmbedBuilder()
              .setDescription(
                `🚫 ${interaction.user}, You don't have \`${slashCommand.user_perms}\` permissions to use this command!`
              )
              .setColor("Red");
            return interaction.reply({ embeds: [user_perms] });
          }
          if (
            !interaction.guild?.me?.permissions.has(
              slashCommand.bot_perms || []
            )
          ) {
            const bot_perms = new EmbedBuilder()
              .setDescription(
                `🚫 ${interaction.user}, I don't have \`${slashCommand.bot_perms}\` permissions to use this command!`
              )
              .setColor("Red");
            return interaction.reply({ embeds: [bot_perms] });
          }
        }

        await slashCommand.run(sinan, interaction);
        cooldown.set(
          `slash-${slashCommand.name}${interaction.user.id}`,
          Date.now() + slashCommand.cooldown
        );
        setTimeout(() => {
          cooldown.delete(`slash-${slashCommand.name}${interaction.user.id}`);
        }, slashCommand.cooldown);
      } else {
        if (slashCommand.user_perms || slashCommand.bot_perms) {
          if (
            !(interaction.member as GuildMember).permissions.has(
              (slashCommand.user_perms as PermissionResolvable) || []
            )
          ) {
            const user_perms = new EmbedBuilder()
              .setDescription(
                `🚫 ${interaction.user}, You don't have \`${slashCommand.user_perms}\` permissions to use this command!`
              )
              .setColor("Red");
            return interaction.reply({ embeds: [user_perms] });
          }
          if (
            !interaction.guild?.me?.permissions.has(
              slashCommand.bot_perms || []
            )
          ) {
            const bot_perms = new EmbedBuilder()
              .setDescription(
                `🚫 ${interaction.user}, I don't have \`${slashCommand.bot_perms}\` permissions to use this command!`
              )
              .setColor("Red");
            return interaction.reply({ embeds: [bot_perms] });
          }
        }

        const logEmbed = new EmbedBuilder()
          .setTitle(`**Slash Command Used**`)
          .setColor("Orange")
          .setDescription(
            `**Command Name:** \`${
              slashCommand.name
            }\`\n\n**Command Description:** \`${
              slashCommand.description
            }\`\n\n**Username:** \`${
              interaction.user.username
            }\`\n\n**User ID:** \`${interaction.user.id}\` | <@${
              interaction.user.id
            }>\n\n**Guild Name:** \`${
              interaction.guild?.name
            }\`\n\n**Guild ID:** \`${
              interaction.guild?.id
            }\`\n\n**Channel Name:** \`${
              (interaction.channel as TextChannel).name
            }\`\n\n**Channel ID:** \`${interaction.channel.id}\`` +
              (interaction.options.data.length > 0
                ? `\n\n\n**Command Options:**`
                : "\n")
          )
          .setTimestamp();

        if (interaction.options.data.length > 0) {
          const optionsUsed = [];
          for (const option of interaction.options.data) {
            optionsUsed.push({
              name: `#️⃣  ${option.name}`,
              value: `➡️  ${option.value}`,
              inline: true,
            });
          }
          logEmbed.addFields(...optionsUsed);
        }
        new WebhookClient({ url: process.env.PROCESS_HOOK! }).send({
          embeds: [logEmbed],
        });
        await slashCommand.run(sinan, interaction);
      }
    } catch (error) {
      console.log(error);
    }
  }
});

import { Collection, Message, EmbedBuilder, Events } from "discord.js";
import ms from "ms";
import sinan from "../index";
import { Command, Sinan } from "../types/interfaces";
import { PermissionResolvable } from "discord.js";

const cooldown = new Collection<string, number>();

sinan.on(Events.MessageCreate, async (message: Message | any) => {
  if (
    message.author.bot ||
    !message.guild ||
    !message.content.startsWith(sinan.config.prefix)
  ) {
    return;
  }

  const [cmd, ...args] = message.content
    .slice(sinan.config.prefix.length)
    .trim()
    .split(/ +/g);
  const command =
    sinan.commands.get(cmd.toLowerCase()) ||
    (sinan.commands.get(sinan.aliases.get(cmd.toLowerCase())) as Command);

  if (!command) {
    return;
  }

  if (command.cooldown && !sinan.config.admins.includes(message.author.id)) {
    if (cooldown.has(`${command.name}${message.author.id}`)) {
      return message.reply({
        content: `You have to wait ${ms(
          (cooldown?.get(`${command?.name}${message.author?.id}`) ?? 0) -
            Date.now() ?? 0,
          { long: true }
        )} before you can use this command again!`,
        ephemeral: true,
      });
    }

    if (command.user_perms || command.bot_perms) {
      if (
        !checkPermissions(message, command.user_perms, true) ||
        !checkPermissions(
          message.guild.members.cache.get(sinan.user?.id),
          command.bot_perms,
          false
        )
      ) {
        return;
      }
    }

    await runCommand(command, sinan, message, args);
    cooldown.set(
      `${command.name}${message.author.id}`,
      Date.now() + command.cooldown
    );
    setTimeout(
      () => cooldown.delete(`${command.name}${message.author.id}`),
      command.cooldown
    );
  } else {
    if (command.user_perms || command.bot_perms) {
      if (
        !checkPermissions(message, command.user_perms, true) ||
        !checkPermissions(
          message.guild.members.cache.get(sinan.user?.id),
          command.bot_perms,
          false
        )
      ) {
        return;
      }
    }

    await runCommand(command, sinan, message, args);
  }
});

function checkPermissions(
  message: Message,
  requiredPerms: string[] | undefined,
  isUser: boolean
): boolean {
  if (
    requiredPerms &&
    !message.member?.permissions.has(requiredPerms as PermissionResolvable)
  ) {
    replyPermissionsError(message, message.author, requiredPerms);
    return false;
  }

  const entity = isUser
    ? message.guild?.members.cache.get(sinan.user?.id ?? "")
    : message.member;
  if (
    entity &&
    requiredPerms &&
    !entity.permissions.has(requiredPerms as PermissionResolvable)
  ) {
    replyPermissionsError(message, message.author, requiredPerms);
    return false;
  }

  return true;
}

function replyPermissionsError(
  message: Message,
  entity: Message["author"],
  requiredPerms: string[] | undefined
): void {
  const permsMessage = new EmbedBuilder()
    .setDescription(
      `🚫 ${entity}, You don't have \`${requiredPerms}\` permissions to use this command!`
    )
    .setColor("Red");
  message.reply({ embeds: [permsMessage] });
}

async function runCommand(
  command: Command,
  sinan: Sinan,
  message: Message,
  args: string[]
): Promise<void> {
  await command.run(sinan, message, args);
}

import {
  ApplicationCommandType,
  Client,
  Collection,
} from "discord.js";

interface Command {
  name: string;
  description?: string;
  developerOnly?: boolean;
  teamOnly?: boolean;
  aliases?: string[];
  usage?: string;
  user_perms?: string[];
  bot_perms?: string[];
  cooldown?: number;
  run: Function;
}

interface ConfigType {
  prefix: string;
  admins: string[];
  developers: string[];
  clientID: string;
  teamRoles: string[];
  codeChampsChannel: string;
}

interface Sinan extends Client {
  config: ConfigType;
  commands: Collection<string, Command>;
  aliases: Collection<string, any>;
  cooldowns: Collection<string, any>;
  slashCommands: Collection<string, any>;
}

interface SlashCommand {
  name: string;
  description?: string;
  developerOnly?: boolean;
  teamOnly?: boolean;
  cooldown?: number;
  user_perms?: string[];
  bot_perms?: string[];
  options?: any[];
  type?: ApplicationCommandType;
  run: Function;
}

export { Command, ConfigType, Sinan, SlashCommand };

import { EmbedBuilder, Message } from "discord.js";
import { Bot } from "../../../core/client";
import { Command } from "../../../tools/command";
import { db } from "../../../utils/database";
import { chunk } from "../../../tools/embed.tools";
import { validateChannel } from "../../../tools/user.tools";

export default class Ignore extends Command {
  constructor(client: Bot) {
    super(client, {
      name: "ignore",
      category: "config",
      description: {
        content: "ignore management",
        usage: ".ignore <add/remove/list/reset>",
        examples: [
          ".ignore add 1234567890",
          ".ignore remove 1234567890",
          ".ignore list",
          ".ignore reset",
        ],
      },
      aliases: ["ig"],
      cooldown: 5,
      slashCommand: true,
      permissions: {
        user: ["MANAGE_GUILD"],
        client: ["MANAGE_GUILD", "SEND_MESSAGES", "EMBED_LINKS"],
      },
    });
  }

  public async run(
    _client: Bot,
    _message: Message,
    _args: string[]
  ): Promise<void> {
    switch (_args[0]) {
      case "add":
        if (!_args[1]) {
          await _message.reply("Please provide a channel id");
          return;
        }
        const channelValidation = validateChannel(_args[1],this.client);
        if(!channelValidation){
          await _message.reply("Invalid Channel ID");
          return;
        }
        const exists = await db.ignoredChannels.findFirst({
          where: {
            channelId: _args[1],
          },
        });
        if (exists) {
          await _message.reply("Channel already ignored");
          return;
        }
        await db.ignoredChannels.create({
          data: {
            channelId: _args[1],
            guildId: _message.guild!.id,
          },
        });
        await _message.reply("Channel added to ignore list");
        break;
      case "remove":
        if (!_args[1]) {
          await _message.reply("Please provide a channel id");
          return;
        }
        const Validation = validateChannel(_args[1],this.client);
        if(!Validation){
          await _message.reply("Invalid Channel ID");
          return;
        }
        const removed = await db.ignoredChannels.findFirst({
          where: {
            channelId: _args[1],
          },
        });
        if (!removed) {
          await _message.reply("Channel not ignored");
          return;
        }
        await db.ignoredChannels.deleteMany({
          where: {
            channelId: _args[1],
          },
        });
        await _message.reply("Channel removed from ignore list");
        break;
      case "list":
        const ignored = await db.ignoredChannels.findMany({
          where: {
            guildId: _message.guild?.id,
          },
        });
        if (ignored.length < 1) {
          await _message.reply("No channels are ignored");
          return;
        }
        const chunks = await chunk(ignored, 10);
        const pages = [] as EmbedBuilder[];
        chunks.map((chunk: any[], index: number) => {
          pages.push(
            new EmbedBuilder()
              .setColor("#7289DA")
              .setTitle(`Ignored Channels - Page ${index + 1}`)
              .setDescription(
                chunk
                  .map((channel) => {
                    return `<#${channel.channelId}> - ${channel.channelId}`;
                  })
                  .join("\n")
              )
              .setFooter({
                text: `${_message.author.tag}`,
                iconURL: _message.author.displayAvatarURL(),
              })
          );
        });
        break;
      case "reset":
        const reset = await db.ignoredChannels.findFirst({
          where: {
            guildId: _message.guild?.id,
          },
        });
        if (!reset) {
          await _message.reply("No channels are ignored");
          return;
        }
        await db.ignoredChannels.deleteMany({
          where: {
            guildId: _message.guild?.id,
          },
        });
        break;
      default:
        const embed = new EmbedBuilder()
          .setTitle("<:R_:1293480423443140662> Ignore Management")
          .setDescription(
            "<:folder:1304460353278574622> Ignore Channels and Commands to Avoid a Mess\n\n> `.ignore add` : ignore a channel\n> `.ignore remove` : remove a channel from ignore list\n> `.ignore list` : list all ignored channels\n> `.ignore reset` : reset all ignored channels"
          )
          .setColor("#7289DA")
          .setFooter({
            iconURL: this.client.user?.displayAvatarURL(),
            text: "Made by Cemetery Studios with Love",
          });

        await _message.reply({
          embeds: [embed],
        });
        break;
    }
  }
}

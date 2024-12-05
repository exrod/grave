import { Message } from "discord.js";
import { Bot } from "../../../core/client";
import { Command } from "../../../tools/command";

export default class Pause extends Command {
  constructor(client: Bot) {
    super(client, {
      name: "pause",
      description: {
        content: "Pauses the current song",
        examples: ["pause"],
        usage: ".pause",
      },
      category: "music",
      cooldown: 3,
      args: false,
      player: {
        voice: true,
        dj: true,
        active: true,
        djPerm: null,
      },
      permissions: {
        dev: false,
        client: ["SendMessages", "ViewChannel", "EmbedLinks"],
        user: [],
      },
      slashCommand: true,
      options: [],
    });
  }

  public async run(
    _client: Bot,
    _message: Message,
    _args: string[]
  ): Promise<any> {
    const player = this.client.queue.get(_message.guild?.id as string);
    const embed = this.client.embed();
    if (player.paused) {
      embed
        .setColor("#7289DA")
        .setAuthor({
          name: "Grave - Player",
          iconURL: this.client.user?.displayAvatarURL(),
        })
        .setDescription(
          `**${_message.author.username}**, Player is already **paused**.`
        );
      return await _message.reply({
        embeds: [embed],
      });
    }

    player.pause();
    await _message?.react("⏸");
    return await _message.reply({
      content: "**Paused** The Player.",
    });
  }
}

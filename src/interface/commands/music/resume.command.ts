import { Command } from "../../../tools/command";
import { Bot } from "../../../core/client";
import { Message } from "discord.js";

export default class Resume extends Command {
  constructor(client: Bot) {
    super(client, {
      name: "resume",
      description: {
        content: "Resumes the current song",
        examples: ["resume"],
        usage: "resume",
      },
      category: "music",
      aliases: ["rm"],
      cooldown: 3,
      args: false,
      player: {
        voice: true,
        dj: false,
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
    client: Bot,
    _message: Message,
    _args: string[]
  ): Promise<any> {
    const player = client.queue.get(_message.guild?.id as string);
    const embed = this.client.embed();
    if (!player.paused) {
      embed
        .setColor("#7289DA")
        .setAuthor({
          name: "Grave - Player",
          iconURL: this.client.user?.displayAvatarURL(),
        })
        .setDescription(
          `**${_message.author.username}**, Player is not **paused**.`
        );
      return await _message.reply({
        embeds: [embed],
      });
    }
    player.pause();
    await _message?.react("▶️");
    return await _message.reply({
      content: "**Resumed** The Player.",
    });
  }
}

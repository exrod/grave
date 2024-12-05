import { Message } from "discord.js";
import { Bot } from "../../../core/client";
import { Command } from "../../../tools/command";

export default class Stop extends Command {
  constructor(client: Bot) {
    super(client, {
      name: "stop",
      description: {
        content: "Stops the music and clears the queue",
        examples: ["stop"],
        usage: ".stop",
      },
      category: "music",
      aliases: ["stopmusic"],
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

  public async run(_client: Bot, _message: Message, _args: string[]): Promise<any> {
    const player = this.client.queue.get(_message.guild?.id as string);
    player.queue = [];
    player.stop();
    let embed = this.client
      .embed()
      .setColor(`#7289DA`)
      .setAuthor({
        name: "Grave - Player",
        iconURL: this.client.user?.displayAvatarURL(),
      })
      .setDescription(
        `**${_message.author.username}**, I've stopped the music & cleared the queue!`
      );
    return await _message.reply({
      embeds: [embed]
    });
  }
}
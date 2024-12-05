import { Message } from "discord.js";
import { Bot } from "../../../core/client";
import { Command } from "../../../tools/command";

export default class Stop extends Command {
  constructor(client: Bot) {
    super(client, {
      name: "volume",
      description: {
        content: "changes the volume of the player.",
        examples: ["volume 80"],
        usage: ".volume <volume>",
      },
      category: "music",
      aliases: ["vol"],
      cooldown: 3,
      args: true,
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
    const number = Number(_args[0]);
    if (isNaN(number) || number < 0 || number > 500) {
      const description = isNaN(number)
        ? "Please provide me a valid number."
        : number < 0
        ? "Oops The volume can't be lower than 0!"
        : "Sorry The volume can't be higher than 500!";
      embed
        .setColor("Red")
        .setDescription(`**${_message.author.username}**, ${description}`);
      return await _message.reply({
        embeds: [embed],
      });
    }
    await player.player.setGlobalVolume(number);
    embed
      .setColor("#7289DA")
      .setAuthor({
        name: "Grave - Player",
        iconURL: this.client.user?.displayAvatarURL(),
      })
      .setDescription(
        `**${_message.author.username}**, Successfully set the volume to \`${number}%\``
      );
    return await _message.reply({
      embeds: [embed],
    });
  }
}

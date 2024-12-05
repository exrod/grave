import { Message } from "discord.js";
import { Bot } from "../../../core/client";
import { Command } from "../../../tools/command";

export default class Skip extends Command {
  constructor(client: Bot) {
    super(client, {
      name: "skip",
      description: {
        content: "Skips the music",
        examples: ["skip"],
        usage: ".skip",
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
    const guild = await this.client.guilds.fetch(player.guildId);
    const vcId = guild.members.me?.voice.channelId;
    await player.skip();
    let embed = this.client
      .embed()
      .setColor(`#7289DA`)
      .setAuthor({
        name: "Grave - Player",
        iconURL: this.client.user?.displayAvatarURL(),
      })
      .setDescription(
        `**${_message.author.username}**, skipped the current song!`
      );
    return await _message.reply({
      embeds: [embed]
    });
  }
}
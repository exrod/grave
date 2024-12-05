import { EmbedBuilder, Message } from "discord.js";
import { Bot } from "../../../core/client";
import { Command } from "../../../tools/command";
import { chunk, formatTime, paginate } from "../../../tools/embed.tools";

export default class Queue extends Command {
  constructor(client: Bot) {
    super(client, {
      name: "queue",
      category: "music",
      description: {
        content: "Shows the current queue",
        usage: ".queue",
        examples: [".queue"],
      },
      cooldown: 5,
      slashCommand: true,
      player: {
        active: true,
        voice: true,
        dj: false,
        djPerm: null,
      },
    });
  }

  public async run(client: Bot, ctx: Message): Promise<void> {
    const player = client.queue.get(ctx.guild!.id);
    let embed = this.client.embed();
    if (player.queue.length < 1) {
      embed
        .setColor("#7289DA")
        .setAuthor({
          name: "Grave - Player",
          iconURL: this.client.user?.displayAvatarURL(),
        })
        .setDescription(`There is no queue to display`)
        .setFooter({
          text: `${ctx.author.tag}`,
          iconURL: ctx.author.displayAvatarURL(),
        });
      await ctx.reply({
        embeds: [embed],
      });
      return;
    }
    const queue = player.queue.map((track, index) => {
      return `${index + 1}. [${track.info.title}](${track.info.uri}) . ${formatTime(track.info.length)} . added by <@${track.info.requester.id}>`;
    });

    const chunks = chunk(queue, 10);
    const pages = [] as EmbedBuilder[];
    chunks.map((chunk: string[],index:number) => {
        pages.push(new EmbedBuilder()
        .setColor("#7289DA")
        .setAuthor({
          name: "Grave - Player",
          iconURL: this.client.user?.displayAvatarURL(),
        })
        .setTitle(`Queue Page - ${index+1}`)
        .setDescription(chunk.join("\n"))
        .setFooter({
          text: `${ctx.author.tag}`,
          iconURL: ctx.author.displayAvatarURL(),
        })
    );
    });
    await paginate(pages, ctx);
  }
}

import { Message } from "discord.js";
import { Bot } from "../../../core/client";
import { Command } from "../../../tools/command";

export default class LeaveVC extends Command {
  constructor(client: Bot) {
    super(client, {
      name: "leave",
      category: "music",
      description: {
        content: "Bot leaves the voice channel",
        usage: ".leave",
        examples: [".leave"],
      },
      cooldown: 5,
      slashCommand: true,
      player: {
        active: false,
        voice: true,
        dj: false,
        djPerm: null,
      },
    });
  }

  public async run(client: Bot, ctx: Message): Promise<void> {
    const player = client.queue.get(ctx.guild!.id);
    const embed = this.client.embed();
    if (player) {
      const channelId = player.node.manager.connections.get(
        ctx.guild!.id
      )!.channelId;
      player.destroy();
      await this.client.rest
        .put(`/channels/${channelId}/voice-status`, {
          body: {
            status: ``,
          },
        })
        .catch((e) => { });

      embed
        .setColor("#7289DA")
        .setAuthor({
          name: "Grave - Player",
          iconURL: this.client.user?.displayAvatarURL(),
        })
        .setDescription(
          `<:R_:1293480423443140662> Left ** <#${channelId}> ** & cleared the queue.`
        )
        .setFooter({
          text: `${ctx.author.tag}`,
          iconURL: ctx.author.displayAvatarURL(),
        });
      await ctx.reply({
        embeds: [embed],
      });
      return;
    }
    embed
      .setColor("#7289DA")
      .setAuthor({
        name: "Grave - Player",
        iconURL: this.client.user?.displayAvatarURL(),
      })
      .setDescription(
        `**${ctx.author.tag}**, I'm not connected to any voice channel!`
      );
    await ctx.reply({
      embeds: [embed],
    });
    return;
  }
}

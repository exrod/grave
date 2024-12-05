import { Message, VoiceChannel } from "discord.js";
import { Bot } from "../../../core/client";
import { Command } from "../../../tools/command";

export default class JoinVC extends Command {
  constructor(client: Bot) {
    super(client, {
      name: "join",
      category: "music",
      description: {
        content: "Bot joins the voice channel you're in",
        usage: ".join",
        examples: [".join"],
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
    const member = ctx.member;
    const embed = this.client.embed();
    let player = client.queue.get(ctx.guild?.id as string);

    if (player) {
      const channelId = player.node.manager.connections.get(
        ctx.guild?.id as string
      )?.channelId;
      embed
        .setColor("#7289DA")
        .setAuthor({
          name: "Grave - Player",
          iconURL: this.client.user?.displayAvatarURL(),
        })
        .setDescription(
          `<@${ctx.member?.user.id}>, I'm already connected to <#${channelId}> !`
        );
      await ctx.reply({
        embeds: [embed],
      });
      return;
    }

    const voiceChannel = member?.voice.channel as VoiceChannel;

    try {
      player = await client.queue.create(
        ctx.guild!,
        voiceChannel,
        ctx.channel,
        client.shoukaku.options.nodeResolver(client.shoukaku.nodes)
      );
      const joinedChannelId = player.node.manager.connections.get(
        ctx.guild!.id
      )!.channelId;
      embed
        .setColor("#7289DA")
        .setAuthor({
          name: "Grave - Player",
          iconURL: this.client.user?.displayAvatarURL(),
        })
        .setDescription(
          `<:R_:1293480423443140662> Joined ** <#${joinedChannelId}> **!.`
        )
        .setFooter({
          text: `${ctx.member?.user.username}`,
          iconURL: ctx.author.displayAvatarURL({}),
        });
      await ctx.reply({
        embeds: [embed],
      });
      return;
    } catch (error) {
      embed
        .setColor("#7289DA")
        .setAuthor({
          name: "Grave - Player",
          iconURL: this.client.user?.displayAvatarURL(),
        })
        .setDescription("I couldn't join the voice channel.");
      await ctx.reply({ embeds: [embed] });
    }
  }
}

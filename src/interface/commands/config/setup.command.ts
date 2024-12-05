import {
  Message,
  ChannelType,
  OverwriteType,
  PermissionFlagsBits,
  VoiceChannel,
  TextChannel,
} from "discord.js";
import { Bot } from "../../../core/client";
import { Command } from "../../../tools/command";
import { db } from "../../../utils/database";

export default class MusicSetup extends Command {
  constructor(client: Bot) {
    super(client, {
      name: "setup",
      category: "config",
      description: {
        content: "Setup music control panel",
        usage: ".setup",
        examples: [".setup"],
      },
      aliases: ["musicsetup", "music-setup", "panel-setup"],
      cooldown: 5,
      slashCommand: true,
      player: {
        active: false,
        voice: false,
        dj: false,
        djPerm: null,
      },
      permissions: {
        user: ["MANAGE_GUILD"],
        client: ["MANAGE_GUILD", "SEND_MESSAGES", "EMBED_LINKS"],
      },
    });
  }

  public async run(
    client: Bot,
    message: Message,
    args: string[]
  ): Promise<void> {
    const player = client.queue.get(message.guild?.id as string);
    const setup = await db.musicPanel.findFirst({
      where: { guildId: message.guild?.id },
    });
    if (args[0] === "delete") {
      if (!setup) {
        await message.reply(
          "No music panel found. If you want to create it, use `.setup`"
        );
        return;
      }
      await message.guild?.channels.delete(
        setup.channelId,
        "Music Control Panel Deleted"
      );
      await db.musicPanel.deleteMany({ where: { guildId: message.guild?.id } });
      await message.reply("Music control panel deleted");
      return;
    }
    if (setup) {
      await message.reply(
        "Music control panel is already exists. If you want to delete it, use: `setup delete`"
      );
      return;
    }
    const tempMessage = await message.reply("Creating music control panel...");

    await tempMessage.edit("Creating Text Channel...");
    const channel = await message.guild?.channels.create({
      name: `${this.client.user?.username}-control-panel`,
      type: ChannelType.GuildText,
      permissionOverwrites: [
        {
          type: OverwriteType.Member,
          id: client.user?.id as string,
          allow: [
            PermissionFlagsBits.ViewChannel,
            PermissionFlagsBits.SendMessages,
            PermissionFlagsBits.EmbedLinks,
            PermissionFlagsBits.ReadMessageHistory,
          ],
        },
        {
          type: OverwriteType.Role,
          id: message.guild?.roles.everyone.id as string,
          allow: [
            PermissionFlagsBits.ViewChannel,
            PermissionFlagsBits.SendMessages,
            PermissionFlagsBits.ReadMessageHistory,
          ],
        },
      ],
    });
    const embed = this.client.embed();
    embed
      .setColor("#7289DA")
      .setAuthor({
        name: "Grave - Music Control Panel",
        iconURL: this.client.user?.displayAvatarURL(),
      })
      .setDescription(
        `This is the control panel for music. You can control the music bot from here.`
      )
      .setImage(
        "https://media.discordapp.net/attachments/1227558676638863411/1307339888865185802/courage_the_cowardly_dogs_purple_night_hd_courage_the_cowardly_dog.jpg?ex=6739f2a6&is=6738a126&hm=e93389a9d3d9d20ed8aa1f32ca19faf214909bdaa6ce81ee2d894c1eb126936a&=&format=webp&width=675&height=380"
      )
      .setFooter({
        text: `${client.user?.username}`,
        iconURL: this.client.user!.displayAvatarURL(),
      });
    const PlayerButtons1 = [
      {
        type: 2,
        style: 2,
        emoji: `<:shuffle:1304461116159688704>`,
        custom_id: "shuffle",
      },
      {
        type: 2,
        style: 2,
        emoji: `<:left:1304461141921108119>`,
        custom_id: "previous",
      },
      {
        type: 2,
        style: 2,
        emoji: `<:pause:1304461113357893793>`,
        custom_id: "pause",
      },
      {
        type: 2,
        style: 2,
        emoji: "<:right:1304461125743542292>",
        custom_id: "skip",
      },
      {
        type: 2,
        style: 4,
        emoji: "<:stop:1304461122945941524>",
        custom_id: "stop",
      },
      {
        type: 2,
        style: 4,
        emoji: "<:heart:1304461109415116881>",
        custom_id: "like",
      },
    ];

    const controllerMessage = await channel?.send({
      embeds: [embed],
      components: [
        {
          type: 1,
          components: PlayerButtons1,
        },
      ],
    });
    await tempMessage.edit("Creating Buttons...");
    await tempMessage.edit(`Created Text Channel: <#${channel?.id}>`);
    if (!player) {
      if (message.member?.voice.channel) {
        await tempMessage.edit(`Creating Player...`);
        await client.queue.create(
          message.guild as any,
          message.member?.voice.channel as VoiceChannel,
          channel as TextChannel,
          client.shoukaku.options.nodeResolver(client.shoukaku.nodes)
        );
      }
    }
    await tempMessage.edit(`Updating Database...`);
    const final = await db.musicPanel.create({
      data: {
        guildId: message.guild?.id as string,
        channelId: channel?.id as string,
        messageId: controllerMessage?.id as string,
      },
    });
    this.client.musicPanels.set(message.guild?.id as string, final);
    await tempMessage.edit(
      `Music Control Panel Created! with Text Channel: <#${channel?.id}>`
    );
  }
}

import { Player } from "shoukaku";
import { Bot } from "../../../core/client";
import Dispatcher, { Song } from "../../../tools/shoukaku/dispatcher";
import { Event } from "../../../tools/events";
import { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, Interaction, TextChannel } from "discord.js";
import { db } from "../../../utils/database";
import { changeChannelStatus } from "../../../tools/channel.tools";
import { getLyrics } from "../../../tools/track.tools";
import { chunk, paginate } from "../../../tools/embed.tools";

export default class TrackStart extends Event {
  constructor(client: Bot, file: string) {
    super(client, file, {
      name: "trackStart",
    });
  }

  public async run(
    _player: Player,
    track: Song,
    dispatcher: Dispatcher
  ): Promise<void> {
    const guild = await this.client.guilds.fetch(_player.guildId);
    const vcId = guild.members.me!.voice.channelId!;
    const channel = guild.channels.cache.get(
      dispatcher.channelId
    ) as TextChannel;
    if (!channel) return;
    if (vcId) {
      await changeChannelStatus(
        vcId,
        `Now Playing: ${track.info.title.substring(0, 300)} By ${
          track.info.author
        }`,
        this.client
      );
    }
    // const thumbnail = await Classic({
    //   thumbnailImage: track.info.artworkUrl,
    //   name: track.info.title,
    //   author: track.info.author,
    //   endTime: ms(track.info.length)
    // });

    // const img = new AttachmentBuilder(thumbnail,{name:'nowplaying.png'})
    const PlayerEmbed = this.client
      .embed()
      .setColor("#7289DA")
      .setAuthor({
        name: "Grave - Player",
        iconURL: this.client.user?.displayAvatarURL(),
      })
      .setTitle("Now Playing")
      .setDescription(
        `<:R_:1295262156144644098> Song : [${track.info.title}](https://discord.gg/ghouls)`
      )
      // .setImage(`attachment://nowplaying.png`)
      .setThumbnail(track.info.artworkUrl || track.info.requester.avatarURL())
      .setTimestamp()
      .setFooter({
        text: `Requested By : ${track.info.requester.displayName}`,
        iconURL: track.info.requester.displayAvatarURL(),
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
        emoji: _player.paused
          ? `<:play:1304489222861754429>`
          : `<:pause:1304461113357893793>`,
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
    ];

    const PlayerButtons2 = [
      //   {
      //     type: 2,
      //     style: 2,
      //     label: "Quick Filters",
      //     emoji: Emoji.Qfilters,
      //     custom_id: "filter",
      //   },
      {
        type: 2,
        style: 2,
        emoji: "<:heart:1304461109415116881>",
        custom_id: "like",
      },
      {
        type: 2,
        style: 2,
        emoji: "<:playlist2:1304461105703419976>",
        label: "Lyrics",
        custom_id: "lyrics",
      },
    ];

    // const row = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(
    //   new StringSelectMenuBuilder()
    //     .setCustomId("f")
    //     .setPlaceholder(`Select Filters`)
    //     .addOptions([
    //       {
    //         label: "Reset Filters",
    //         description: "Clears all filters.",
    //         value: "reset",
    //       },
    //       {
    //         label: "8D",
    //         description: "Sets the 8D Filter.",
    //         value: "8",
    //       },
    //       {
    //         label: "BassBoost",
    //         description: "Sets the BassBoost Filter.",
    //         value: "bb",
    //       },
    //       {
    //         label: "Distortion",
    //         description: "Sets the distortion Filter.",
    //         value: "d",
    //       },
    //       {
    //         label: "Karaoke",
    //         description: "Sets the Karaoke Filter.",
    //         value: "k",
    //       },
    //       {
    //         label: "Lofi",
    //         description: "Sets the Lofi Filter.",
    //         value: "l",
    //       },
    //       {
    //         label: "NightCore",
    //         description: "Sets the NightCore Filter.",
    //         value: "nc",
    //       },
    //       {
    //         label: "Pitch",
    //         description: "Sets the Pitch Filter.",
    //         value: "p",
    //       },
    //       {
    //         label: "Rate",
    //         description: "Sets the Rate Filter.",
    //         value: "ra",
    //       },
    //       {
    //         label: "Rotation",
    //         description: "Sets the Rotation Filter.",
    //         value: "ro",
    //       },
    //       {
    //         label: "Speed",
    //         description: "Sets the Speedy Filter.",
    //         value: "s",
    //       },
    //       {
    //         label: "Tremolo",
    //         description: "Sets the Tremolo Filter.",
    //         value: "t",
    //       },
    //       {
    //         label: "Vibrato",
    //         description: "Sets the Vibrato Filter.",
    //         value: "v",
    //       },
    //     ])
    // );
    const message = await channel.send({
      embeds: [PlayerEmbed],
      // files:[img],
      components: [
        {
          type: 1,
          components: PlayerButtons1,
        },
        {
          type: 1,
          components: PlayerButtons2,
        },
      ],
    });
    dispatcher.nowPlayingMessage = message;
    const collector = message.createMessageComponentCollector({
      filter: (b) => {
        if (
          b.guild.members.me?.voice.channel &&
          b.guild.members.me.voice.channelId === b.member.voice.channelId
        )
          return true;
        else {
          b.reply({
            content: `You Are Not Connected To <#${
              b.guild.members.me?.voice?.channelId ?? "None"
            }> To Use This Command.`,
            ephemeral: true,
          });
          return false;
        }
      },
    });

    collector.on("collect", async (interaction) => {
      await interaction.deferReply({
        ephemeral: true,
      });
      switch (interaction.customId) {
        case "previous":
          if (dispatcher.previous) {
            dispatcher.previousTrack();
            await interaction.editReply({
              content: `Rewinded the player!`,
            });
          } else {
            await interaction.editReply({
              content: `No previous song available!`,
            });
          }
          break;

        case "pause":
          dispatcher.pause();
          await interaction.editReply({
            content: _player.paused
              ? `Resumed the music!`
              : `Paused the music!`,
          });
          break;

        case "resume":
          dispatcher.pause();
          await interaction.editReply({
            content: _player.paused
              ? `Paused the music!`
              : `Resumed the music!`,
          });
          break;

        case "skip":
          if (dispatcher.queue.length) {
            dispatcher.skip();
            await interaction.editReply({
              content: `Skipped the Song!`,
            });
          } else {
            await interaction.editReply({
              content: `No more songs in queue!`,
            });
          }
          break;

        case "like":
          const existingCheck = await db.likedSongs.findFirst({
            where: {
              userId: interaction.user.id,
              url: track.info.uri as string,
            },
          });
          if (existingCheck) {
            await interaction.editReply({
              embeds: [
                this.client
                  .embed()
                  .setAuthor({
                    name: `Grave - Bot`,
                    iconURL: this.client.user!.displayAvatarURL(),
                  })
                  .setDescription(
                    `**${track.info.title}** Is Already In **Liked Songs** 🤍`
                  ),
              ],
            });
            break;
          }
          await db.likedSongs.create({
            data: {
              title: track.info.title as string,
              url: track.info.uri as string,
              userId: interaction.user.id,
              artist: track.info.author as string,
              songId: track.info.identifier as string,
            },
          });
          await interaction.editReply({
            embeds: [
              this.client
                .embed()
                .setAuthor({
                  name: `Grave - Bot`,
                  iconURL: this.client.user!.displayAvatarURL(),
                })
                .setDescription(
                  `<:music2:1304459912482525205> Added **${track.info.title}** To **Liked Songs** 🤍`
                ),
            ],
          });
          break;

        case "stop":
          dispatcher.stop();
          await interaction.editReply({
            content: `Stopped the music & cleared the queue!`,
          });
          await message.delete();
          break;

        case "lyrics":
          const lyrics = await getLyrics(track.info.title);
          const lyrics_array = lyrics.split("\n\n");
          const chunks = chunk(lyrics_array, 3);
          // await interaction.editReply({
          //   content: `${lyrics}`,
          // });
          const pages = [] as EmbedBuilder[];
          chunks.map((chunk: string[], index: number) => {
            pages.push(
              new EmbedBuilder()
                .setColor("#7289DA")
                .setAuthor({
                  name: "Grave - Player",
                  iconURL: this.client.user?.displayAvatarURL(),
                })
                .setTitle(`Lyrics - Page ${index + 1}`)
                .setDescription(chunk.join("\n\n"))
                .setFooter({
                  text: `${interaction.user.tag}`,
                  iconURL: interaction.user.displayAvatarURL(),
                })
            );
          });

          let page = 0;
          let embed = pages[page];
          const prevButton = new ButtonBuilder()
            .setCustomId("prev")
            .setLabel("Previous")
            .setStyle(ButtonStyle.Primary)
            .setDisabled(page === 0);
          const pageIndex = new ButtonBuilder()
            .setCustomId("pageIndex")
            .setLabel(`${page + 1}/${pages.length}`)
            .setStyle(ButtonStyle.Secondary)
            .setDisabled(true);
          const nextButton = new ButtonBuilder()
            .setCustomId("next")
            .setLabel("Next")
            .setStyle(ButtonStyle.Primary)
            .setDisabled(page === pages.length - 1);
          const row = new ActionRowBuilder().addComponents(
            prevButton,
            pageIndex,
            nextButton
          );
          const msg = await interaction.editReply({
            embeds: [embed],
            components: [row as any],
          });

          const filter = (int: Interaction): any => int.user.id === interaction.user.id;
          const collector = msg.createMessageComponentCollector({
            filter,
            time: 60000,
          });
          collector.on("collect", async (int) => {
            if (int.user.id !== interaction.user.id) {
              int.reply({
                content: "You are not allowed to interact with this button",
                ephemeral: true,
              });
              return;
            }
            if (int.customId === "prev") {
              page = page > 0 ? --page : pages.length - 1;
            } else if (int.customId === "next") {
              page = page + 1 < pages.length ? ++page : 0;
            }
            embed = pages[page];
            prevButton.setDisabled(page === 0);
            nextButton.setDisabled(page === pages.length - 1);
            pageIndex.setLabel(`${page + 1}/${pages.length}`);
            await int.update({ embeds: [embed], components: [row as any] });
          });
          collector.on("end", async () => {
            await interaction.editReply({ embeds: [embed], components: [] });
          });

          break;

        case "loop":
          switch (dispatcher.loop) {
            case "off":
              dispatcher.loop = "repeat";
              await interaction.editReply({
                content: `Alright, I'll be looping the **Track**!`,
              });
              break;
            case "repeat":
              dispatcher.loop = "queue";
              await interaction.editReply({
                content: `Alright, I'll be looping the **Queue**!`,
              });

              break;
            case "queue":
              dispatcher.loop = "off";
              await interaction.editReply({
                content: `Alright, I've **Disabled** Looping!`,
              });
              break;
          }
          break;

        // case "filter":
        //   await interaction.editReply({
        //     content: `<@${interaction.user.id}> Select your favourite **Filters**`,
        //     embeds: [
        //       this.client.embed().setFooter({
        //         text: `Powered by Nirvana Music`,
        //         iconURL: this.client.user!.displayAvatarURL(),
        //       }),
        //     ],
        //     components: [row],
        //   });
        //   break;

        case "shuffle":
          dispatcher.setShuffle();
          await interaction.editReply({
            content: `Shuffling the Queue!`,
          });
          break;
      }
    });
  }
}

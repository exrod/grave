import { Message } from "discord.js";
import { Bot } from "../../../core/client";
import { Command } from "../../../tools/command";
import { LoadType } from "shoukaku";
import ms from "ms";

export default class Play extends Command {
  constructor(client: Bot) {
    super(client, {
      name: "play",
      category: "music",
      aliases: ["p"],
      description: {
        content: "Play music in a voice channel.",
        usage: ".play",
        examples: ["play"],
      },
      args:true,
      cooldown: 5,
      slashCommand: false,
      player:{
        voice:true,
        dj:false,
        active: false,
        djPerm: null
      }
    });
  }
  public async run(_client: Bot, _message: Message, _args: string[]) {
    try {
      const query = _args.join(" ");
      let player = this.client.queue.get(_message?.guild!.id);
      const embed = this.client.embed();
      const vc = _message.member as any;
      if (!player)
        player = await this.client.queue.create(
          _message.guild!,
          vc.voice.channel,
          _message.channel
        );

      const res = await this.client.queue.search(query);
      switch (res?.loadType) {
        case LoadType.EMPTY:
          _message.reply({
            embeds:[
              embed
              .setAuthor({
                name: "Grave - Player",
                iconURL: this.client.user?.displayAvatarURL(),
              })
              .setDescription(`No search result found for your query - **${query}**`)
            ]
          });
          break;
        case LoadType.TRACK:
          const track = player.buildTrack(res.data, _message.author);
          player.queue.push(track);
          await player.isPlaying();
          await _message.reply({
            embeds: [
              embed
                .setColor(`#7289DA`)
                .setAuthor({
                  name: `Position - #${player.queue.length + 1}`,
                  iconURL: this.client.user?.displayAvatarURL(),
                })
                .setDescription(
                  `<:music2:1304459912482525205> Added [${res.data.info.title}](${
                    res.data.info.uri
                  }) (\`${ms(
                    track.info.length
                  )}\`) To Music Queue`
                ),
            ],
          })
          break;
        case LoadType.PLAYLIST:
          for (const track of res.data.tracks) {
            const pl = player.buildTrack(track, _message.author);
            player.queue.push(pl);
          }
          await player.isPlaying();
          await _message.reply({
            embeds:[
              embed
              .setColor(`#7289DA`)
              .setAuthor({
                name: `Queue Size - ${player.queue.length}`,
                iconURL: this.client.user?.displayAvatarURL(),
              })
              .setDescription(
                `Loaded \`[${res.data.tracks.length}]\` Tracks From: [${
                  res.data.info.name
                }](${query}) - \`[${ms(
                  res.data.tracks.length
                )}]\``
              ),
            ]
          })
          break;
        case LoadType.SEARCH:
          const track1 = player.buildTrack(res.data[0], _message.author);
          player.queue.push(track1);
          await player.isPlaying();
          _message.reply({
            embeds:[
              embed
              .setColor("#7289DA")
              .setDescription(`<:music2:1304459912482525205> [${track1.info.title}](https://discord.gg/ghouls) added to the queue by - <@${track1.info.requester.id}>`)
            ]
          })
          break;
        case LoadType.ERROR:
          _message.reply({
            embeds:[
              embed
              .setDescription(`There was a error while searching...`)
            ]
          })
          break;
      }
    } catch (e) {
      console.log(e);
    }
  }
}

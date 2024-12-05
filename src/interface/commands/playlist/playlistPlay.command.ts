import { Bot } from "../../../core/client";
import { Command } from "../../../tools/command";
import { db } from "../../../utils/database";
import { LoadType } from "shoukaku";

export default class PlaylistPlay extends Command {
  constructor(client: Bot) {
    super(client, {
      name: "playlistplay",
      category: "playlist",
      description: {
        content: "Plays a playlist",
        usage: ".playlistplay <name>",
        examples: [".playlistplay MyPlaylist"],
      },
      aliases: ["plplay", "plp"],
      player: {
        active: false,
        voice: true,
        dj: false,
        djPerm: null,
      },
      cooldown: 5,
      slashCommand: true,
    });
  }

  public async run(_client: Bot, _message: any, _args: string[]): Promise<any> {
    const playlistName = _args[0];
    if (!playlistName) {
      await _message.reply("Please provide a playlist name");
      return;
    }

    const playlist = await db.playlist.findFirst({
      where: {
        name: playlistName,
        userId: _message.author.id,
      },
    });
    if (!playlist) {
      await _message.reply("Playlist not found");
      return;
    }
    const songs = await db.song.findMany({
      where: {
        playlistId: playlist.id,
      },
    });
    if (songs.length < 1) {
      await _message.reply("No songs found in the playlist");
      return;
        const guildId = _message.guild.id;
        const existingPlayer = this.client.queue.get(guildId);

        if (existingPlayer) {
            existingPlayer.destroy();
            await _message.reply('Disconnected the existing connection');
        }

        const playlist = await db.playlist.findFirst({
            where: {
                name: playlistName,
                userId: _message.author.id,
            },
        })
        if(!playlist){
            await _message.reply('Playlist not found');
            return;
        }

        const songs = await db.song.findMany({
            where: {
                playlistId: playlist.id,
            },
        });
        
            let count = 0;
            for (const song of songs) {
            const res = await this.client.queue.search(song.url);
            const player = this.client.queue.get(_message.guild.id);
            if (!player)
                await this.client.queue.create(
                    _message.guild,
                    _message.member.voice.channel,
                    _message.channel
                );
            switch (res?.loadType) {
                case LoadType.TRACK:
                    const track = player.buildTrack(res.data, _message.author);
                    player.queue.push(track);
                    await player.isPlaying();
                    count++;
                    break;
            }
        };
        await _message.reply(`Added ${count} songs to queue`);
    }
    let player = this.client.queue.get(_message.guild.id);
    if (!player)
      player = await this.client.queue.create(
        _message.guild,
        _message.member.voice.channel,
        _message.channel
      );
    await songs.forEach(async (song) => {
      const res = await this.client.queue.search(song.url);
      switch (res?.loadType) {
        case LoadType.TRACK:
          const track = player.buildTrack(res.data, _message.author);
          player.queue.push(track);
          await player.isPlaying();
          break;
      }
    });
    await _message.reply(`Added ${songs.length + 1} songs to queue`);
  }
}

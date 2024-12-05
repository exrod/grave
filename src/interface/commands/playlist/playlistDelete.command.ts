import { Bot } from "../../../core/client";
import { Command } from "../../../tools/command";
import { Message, EmbedBuilder } from "discord.js";
import { db } from "../../../utils/database";

export default class PlaylistAdd extends Command {
  constructor(client: Bot) {
    super(client, {
      name: "playlistDelete",
      category: "playlist",
      description: {
        content: "delete a playlist",
        usage: ".playlistdelete <playlist_name> ",
        examples: [".playlistadelete uwu"],
      },
      cooldown: 10,
    });
  }

  public async run(
    _client: Bot,
    _message: Message,
    _args: string[]
  ): Promise<any> {
    const playlist_name = _args[0];
    if (!playlist_name) {
      await _message.reply("Please provide a playlist name");
      return;
    }
    const playlist = await db.playlist.findFirst({
      where: {
        name: playlist_name,
        userId: _message.author.id,
      },
    });
    if(!playlist){
        await _message.reply('Playlist not found');
        return;
    }
    await db.playlist.delete({
        where:{
            id:playlist.id
        }
    });
    await db.song.deleteMany({
        where:{
            playlistId:playlist.id
        }
    });
    await _message.reply(`Playlist ${playlist_name} Deleted`);
  }
}

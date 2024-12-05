import { Bot } from "../../../core/client";
import { Command } from "../../../tools/command";
import { Message, EmbedBuilder } from "discord.js";
import SpotifyWebApi from 'spotify-web-api-node';
import { db } from "../../../utils/database";

export default class PlaylistAdd extends Command {
    private spotifyApi: SpotifyWebApi;

    constructor(client: Bot) {
        super(client, {
            name: 'playlistadd',
            category: 'music',
            description: {
                content: 'Add songs from a Spotify playlist to your playlist',
                usage: '.playlistadd <playlist_name> <spotify_playlist_url>',
                examples: ['.playlistadd uwu https://open.spotify.com/playlist/37i9dQZF1DXcBWIGoYBM5M'],
            },
        });
        this.spotifyApi = new SpotifyWebApi({
            clientId: process.env.SPOTIFY_CLIENT_ID,
            clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
        });
    }

    private async authenticateSpotify() {
        try {
            const data = await this.spotifyApi.clientCredentialsGrant();
            this.spotifyApi.setAccessToken(data.body['access_token']);
        } catch (error) {
            console.error('Error authenticating with Spotify:', error);
            throw new Error('Could not authenticate with Spotify');
        }
    }

    public async run(_client: Bot, _message: Message, _args: string[]): Promise<any> {
        const userId = _message.author.id;
        const playlistName = _args[0];
        const spotifyPlaylistUrl = _args[1];

        if(!_args[1]){
            return await _message.reply({
                content: "Please specify a Spotify playlist URL. Example: `.playlistadd MyPlaylist <spotify_playlist_url>`",
            });
        }


        const playlistIdMatch = spotifyPlaylistUrl.match(/https:\/\/[a-z]+\.spotify\.com\/playlist\/([a-zA-Z0-9]+)/);
        if (!playlistIdMatch) {
            await _message.reply('Invalid Spotify playlist URL.');
            return;
        }
        const spotifyPlaylistId = playlistIdMatch[1];

        try {
            await this.authenticateSpotify();
        } catch (error) {
            await _message.reply('There was an error authenticating with Spotify. Please try again later.');
            return;
        }

        const embed = new EmbedBuilder()
            .setTitle('Adding Songs')
            .setDescription('Please wait, we are adding your songs to your playlist.')
            .setColor('#43B581');
        const statusMessage = await _message.reply({ embeds: [embed] });

        try {
            const spotifyPlaylist = await this.spotifyApi.getPlaylist(spotifyPlaylistId);
            const tracks = spotifyPlaylist.body.tracks.items;

            let playlist = await db.playlist.findFirst({
                where: { name: playlistName },
            });

            if (!playlist) {
                playlist = await db.playlist.create({
                    data: {
                        name: playlistName,
                        userId: userId,
                    },
                });
            }

            const playlistId = playlist.id.replace(/-/g, '');

            for (const track of tracks) {
                const song = track.track;
                if (song) {
                    await db.song.create({
                        data: {
                            userId: userId,
                            songId: song.id,
                            title: song.name,
                            url: song.uri,
                            artist: song.artists.map(artist => artist.name).join(', '),
                            album: song.album.name,
                            playlistId: playlistId,
                        },
                    });
                }
            }

            embed.setTitle('Songs Added')
                .setDescription(`Added ${tracks.length} songs to the playlist "${playlistName}".`)
                .setColor('#43B581');
            await statusMessage.edit({ embeds: [embed] });
        } catch (error) {
            console.error('Error fetching Spotify playlist:', error);
            embed.setTitle('Error')
                .setDescription('There was an error fetching the Spotify playlist. Please try again later.')
                .setColor('#F04747');
            await statusMessage.edit({ embeds: [embed] });
        }
    }
}
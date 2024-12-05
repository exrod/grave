import { EmbedBuilder, Message } from "discord.js";
import { Bot } from "../../../core/client";
import { Command } from "../../../tools/command";

export default class Playlist extends Command {
    constructor(client: Bot) {
        super(client, {
            name: 'playlist',
            category: 'playlist',
            description: {
                content: 'playlist management',
                usage: '.playlist',
                examples: ['.playlist'],
            },
            aliases: ['pl'],
            cooldown: 5,
            slashCommand: true,
        });
    }
    
    public async run(_client: Bot, _message: Message, _args: string[]): Promise<void> {
        const embed = new EmbedBuilder()
        .setTitle('<:R_:1293480423443140662> Playlist Management')
        .setDescription('<:music2:1304459912482525205> Create Playlists with Ease \n\n <:config:1292463932828549221> Commands \n > `.playlistadd` - Creates Playlist of your songs\n > `.playlistplay` - Starts playing you playlist')
        .setColor('#7289DA')
        .setFooter({
            iconURL: this.client.user?.displayAvatarURL(),
            text: 'Made by Cemetery Studios with Love',
        });
        
        await _message.reply({
            embeds: [embed],
        });
    }
}
import { EmbedBuilder, Message } from "discord.js";
import { Bot } from "../../../core/client";
import { Command } from "../../../tools/command";
import { db } from "../../../utils/database";

export default class PlaylistCreate extends Command {
    constructor(client: Bot) {
        super(client, {
            name: "playlistcreate",
            category: "playlist",
            description: {
                content: "Creates a playlist from your liked songs",
                usage: ".playlistcreate <name>",
                examples: [".playlistcreate MyPlaylist"],
            },
            aliases: ['pcreate', 'plc'],
            cooldown: 5,
            slashCommand: true,
        });
    }

    public async run(client: Bot, ctx: Message) {
        const args = ctx.content.split(' ').slice(1);

        if (args.length === 0) {
            return await ctx.reply({
                content: "Please specify a name for your playlist. Example: `.playlistcreate MyPlaylist`",
            });
        }

        const playlistName = args.join(' ');

        if (!playlistName.trim()) {
            return await ctx.reply({
                content: "Please specify a valid name for your playlist. Example: `.playlistcreate MyPlaylist`",
            });
        }

        try {
            const exists = await db.playlist.findFirst({
                where:{
                    userId: ctx.author.id,
                    name: playlistName
                }
            })
            if(exists){
                return await ctx.reply({
                    content: "Playlist with this name already exists. Please use a different name.",
                });
            }
            const pl = await db.playlist.create({
                data: {
                    userId: ctx.author.id,
                    name: playlistName,
                },
            });

            const embed = new EmbedBuilder()
                .setTitle('<:R_:1293480423443140662> Playlist Added')
                .setDescription(`<:musicnote:1302871596435767297> PlayList has Been created Succesfully with name ${pl.name} \n Use \`.playlistAdd\` to add songs to your playlist \n Use \`.playlistplay\` to play your songs`)
                .setColor('#7289DA')
                .setFooter({
                    iconURL: this.client.user?.displayAvatarURL(),
                    text: 'Made by Cemetery Studios with Love',
                });

            await ctx.reply({ embeds: [embed] });
        } catch (error) {
            console.error("Error creating playlist:", error);
            await ctx.reply({
                content: "An error occurred while creating the playlist. Please try again later.",
            });
        }
    }
}
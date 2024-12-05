import { EmbedBuilder, Message } from "discord.js";
import { Bot } from "../../../core/client";
import { Command } from "../../../tools/command";
import { db } from "../../../utils/database";
import { chunk, paginate } from "../../../tools/embed.tools";


export default class LikesCommand extends Command {
    constructor(client: Bot) {
        super(client, {
            name: "likes",
            category: "music",
            description: {
                content: "Displays your liked songs.",
                usage: ".likes",
                examples: [".likes"],
            },
            aliases: ['l'],
            cooldown: 5,
            slashCommand: true,
        });
    }

    public async run(client: Bot, ctx: Message) {
        const likedSongs = await db.likedSongs.findMany({
            where: { userId: ctx.author.id },
        });

        if (likedSongs.length < 1) {
            return await ctx.reply({
                content: "You have not liked any songs yet.",
            });
        }

        const chunks = await chunk(likedSongs, 10);
        const pages = [] as EmbedBuilder[];
        chunks.map((chunk, index: number) => {
            pages.push(
                new EmbedBuilder()
                    .setColor("#7289DA")
                    .setAuthor({
                        name: "Grave - Player",
                        iconURL: this.client.user?.displayAvatarURL(),
                    })
                    .setTitle(`Liked Songs - ${index + 1}`)
                    .setDescription(
                        chunk.map((song) => {
                            return `• ${song.title} by ${song.artist} [(link)](${song.url})`;
                        }).join("\n")
                    )
            );
        });
        await paginate(pages, ctx)
    }
}

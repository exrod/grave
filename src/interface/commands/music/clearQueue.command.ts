import { Command } from "../../../tools/command";
import { Bot } from "../../../core/client";
import { Message } from "discord.js";

export default class ClearQueue extends Command {
    constructor(client: Bot) {
        super(client, {
            name: "clearqueue",
            description: {
                content: "Clears the queue!",
                examples: ["clearqueue"],
                usage: "clearqueue",
            },
            category: "music",
            aliases: ["cq"],
            cooldown: 3,
            args: false,
            player: {
                voice: true,
                dj: true,
                active: true,
                djPerm: null,
            },
            permissions: {
                dev: false,
                client: ["SendMessages", "ReadMessageHistory", "ViewChannel", "EmbedLinks"],
                user: [],
            },
            slashCommand: true,
            options: [],
        });
    }

    public async run(client: Bot, ctx: Message): Promise<any> {
        const player = client.queue.get(ctx.guild!.id);
        const embed = this.client.embed();

        if (!player) {
            embed.setColor("#7289DA")
            return await ctx.reply({
                embeds: [embed],
            });
        }

        if (player.queue.length === 0) {
            embed.setColor("#7289DA")
                .setDescription(`**${ctx.author.tag}**, Music queue is empty!`)
            return await ctx.reply({
                embeds: [embed],
            });
        }

        player.queue = [];
        embed.setColor("#7289DA")
            .setDescription(`**${ctx.author.tag}**, Removed all songs from the queue!`)
        return await ctx.reply({
            embeds: [embed],
        });
    }
}

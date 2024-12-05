import { Command } from "../../../tools/command";
import { Bot } from "../../../core/client";
import { Message } from "discord.js";

export default class Autoplay extends Command {
    constructor(client: Bot) {
        super(client, {
            name: "autoplay",
            description: {
                content: "Enables/Disables the autoplay mode",
                examples: ["autoplay"],
                usage: "autoplay",
            },
            category: "music",
            aliases: ["ap"],
            cooldown: 3,
            args: false,
            vote: true,
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
                .setDescription(`**${ctx.author.tag}**, Play a song before using the command!`)
            return await ctx.reply({
                embeds: [embed],
            });
        }

        const autoplay = player.autoplay;
        player.setAutoplay(!autoplay);

        if (autoplay) {
            embed.setColor("#7289DA")
                .setDescription(`**${ctx.author.tag}**, Autoplay has been **Disabled.**`);
        } else {
            embed.setColor("#7289DA")
                .setDescription(`**${ctx.author.tag}**, Autoplay has been **Enabled.**`);
        }
        await ctx.reply({ embeds: [embed] });
    }
}
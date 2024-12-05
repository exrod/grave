import { Command } from "../../../tools/command";
import { Bot } from "../../../core/client";
import { Message } from "discord.js";
import { formatTime, parseTime } from "../../../tools/embed.tools";

export default class Seek extends Command {
    constructor(client: Bot) {
        super(client, {
            name: "seek",
            description: {
                content: "Seeks to a certain time in the song",
                examples: ["seek 1m", "seek 1h 30m", "seek 1h 30m 30s"],
                usage: "seek <duration>",
            },
            category: "music",
            aliases: ["seekmusic"],
            cooldown: 3,
            args: true,
            player: {
                voice: true,
                dj: false,
                active: true,
                djPerm: null,
            },
            permissions: {
                dev: false,
                client: ["SendMessages", "ViewChannel", "EmbedLinks"],
                user: [],
            },
            slashCommand: true,
            options: [
                {
                    name: "duration",
                    description: "The duration to seek to",
                    type: 3,
                    required: true,
                },
            ],
        });
    }

    public async run(client: Bot, ctx: Message, args: string[]): Promise<any> {
        const player = client.queue.get(ctx.guild!.id);
        const current = player.current?.info;
        const position = player.player.position;
        const embed = this.client.embed();
        const duration = parseTime(args.join(" "));

        if (!duration) {
            embed.setColor("#7289DA")
                .setDescription(`**${ctx.author.tag}**, Invalid time format.\n Examples: \`seek 1m\`, \`seek 1h\`, \`seek 30m\``);
            return await ctx.reply({
                embeds: [embed],
            });
        }

        if (!current?.isSeekable) {
            embed.setColor("#7289DA")
                .setDescription(`**${ctx.author.tag}**, The provided track is **NOT** seekable!`)
            return await ctx.reply({
                embeds: [embed],
            });
        }

        if (duration <= current.length) {
            if (duration > position) {
                player.seek(duration);
                embed.setColor("#7289DA")
                    .setTitle(`Seeked The Track`)
                    .setDescription(`[${current.title}](${current.uri}) - \`${formatTime(duration)} / ${formatTime(current.length)}\``)
                    .setFooter({ text: `Requested By ${ctx.author.tag}`, iconURL: ctx.author.displayAvatarURL() })
                return await ctx.reply({
                    embeds: [embed],
                });
            } else {
                player.seek(duration);
                embed.setColor("#7289DA")
                    .setTitle(`Rewinded The Track`)
                    .setDescription(`[${current.title}](${current.uri}) - \`${formatTime(duration)} / ${formatTime(current.length)}\``)
                    .setFooter({ text: `Requested By ${ctx.author.tag}`, iconURL: ctx.author.displayAvatarURL() })
                return await ctx.reply({
                    embeds: [embed]
                });
            }
        } else {
            embed.setColor("#7289DA")
                .setDescription(`Seek Duration Exceeds Song Duration!\n\n> Requested duration: \`${formatTime(duration)}.\`\n> Song duration: \`${formatTime(current.length)}.\``);
            return await ctx.reply({
                embeds: [embed],
            });
        }
    }
}
import { Message, EmbedBuilder } from "discord.js";
import { Bot } from "../../../core/client";
import { Command } from "../../../tools/command";
import moment from "moment";

export default class UserInfo extends Command {
    constructor(client: Bot) {
        super(client, {
            name: "userinfo",
            category: "information",
            description: {
                content: "Display information about a user",
                usage: ".userinfo @jacob",
                examples: ["userinfo @grave"],
            },
            cooldown: 5,
            slashCommand: false,
        });
    }

    public async run(_client: Bot, _message: Message, _args: string[]): Promise<void> {
        let target = _message.mentions.users.first() || _message.author;
        let member = await _message.guild?.members.fetch(target.id);

        const avatarURL = target.displayAvatarURL({ size: 1024 });

        const embed = new EmbedBuilder()
            .setAuthor({
                name: `${target.username} - (${target.id})`,
                iconURL: avatarURL,
            })
            .setColor("#7289DA")
            .setThumbnail(avatarURL)
            .addFields(
                {
                    name: "Created",
                    value: `${moment(target.createdAt).format("MMMM Do YYYY")} (${moment(
                        target.createdAt
                    ).fromNow()})`,
                    inline: true,
                },
                {
                    name: "Joined",
                    value: `${moment(member?.joinedAt).format("MMMM Do YYYY")} (${moment(
                        member?.joinedAt
                    ).fromNow()})`,
                    inline: true,
                },
                {
                    name: "Roles",
                    value: member?.roles.cache.map(role => `<@&${role.id}>`).join(", ") || "None",
                    inline: true,
                }
            )
            .setFooter({
                iconURL: `https://cdn.discordapp.com/attachments/1304704898973044806/1305780138914611261/R_.png?ex=67078856&is=670636d6&hm=79a492d0427b181d6e2e317861b852c9bfd653b20c43426219c27f03c6a80195&`,
                text: `Join Position: ${await this.getJoinPosition(_message, target)} | In ${_message.guild?.name}`,
            });

        await _message.reply({ embeds: [embed] });
    }
    private async getJoinPosition(message: Message, user: any): Promise<number> {
        const members = await message.guild?.members.fetch();
        const sortedMembers = members?.sort((a, b) => (a.joinedTimestamp || 0) - (b.joinedTimestamp || 0));
        // i used nullish coalescing to handle the case where sortedMembers is undefined so yeah i am big brain hooman
        if (!sortedMembers) return 0;

        return Array.from(sortedMembers.keys()).indexOf(user.id) + 1;
    }
}
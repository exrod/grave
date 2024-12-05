import { Message } from "discord.js";
import { Bot } from "../../../core/client";
import { Command } from "../../../tools/command";
import { db } from "../../../utils/database";
import { validateGuild, validateUser } from "../../../tools/user.tools";

export default class BlackList extends Command {
    constructor(client: Bot) {
        super(client, {
            name: "blacklist",
            category: "developer",
            description: {
                content: "adds or removes a guild from blacklist",
                usage: ".bl [guild | user] <id>",
                examples: ["bl guild <guild.id>", "bl user <user.id>"],
            },
            permissions: {
                dev: true,
            },
            cooldown: 5,
            slashCommand: true,
        });
    }

    public async run(_client: Bot, _message: Message, _args: string[]) {
        const id = _args[1];
        const type = _args[0];
        const embed = this.client.embed();
        if (!id || !type) {
            return _message.reply({
                embeds: [
                    embed
                        .setAuthor({
                            name: "Grave - Developer",
                            iconURL: this.client.user?.displayAvatarURL(),
                        })
                        .setDescription(`Please provide type and id.`),
                ],
            });
        }
        if (type === "guild") {
            await validateGuild(id, this.client);
            const guild = await db.guilds.findFirst({
                where: { guildId: _message.guild?.id }
            })
            if (guild?.isBlacklisted == true) {
                return _message.reply({
                    content: `\`⚠️\` <@${_message.author.id}> : This guild is already blacklisted`
                })
            }
            await db.guilds.update({
                where: { id: guild?.id },
                data: { isBlacklisted: true }
            })
            return _message.reply({
                content: `\`✅\` <@${_message.author.id}> : This guild has been blacklisted`
            })
        }
        if (type == "user") {
            await validateUser(id, this.client);
            const user = await db.users.findFirst({
                where: { userId: id }
            })
            if (user?.isBlacklisted == true) {
                return _message.reply({
                    content: `\`⚠️\` <@${_message.author.id}> : This user is already blacklisted`
                })
            }
        }
    }
}
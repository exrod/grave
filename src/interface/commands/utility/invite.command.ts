import { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, Message } from "discord.js";
import { Bot } from "../../../core/client";
import { Command } from "../../../tools/command";

export default class Invite extends Command {
    constructor(client: Bot) {
        super(client, {
            name: 'invite',
            category: 'utility',
            description: {
                content: 'Invite and Support Links for the Bot',
                usage: '.invite',
                examples: ['invite']
            },
            cooldown: 5,
            slashCommand: true,
        });
    }
    public async run(_client: Bot, _message: Message, _args: string[]): Promise<void> {
        const embed = new EmbedBuilder()
            .setTitle("Important Links")
            .setDescription("<:link:1154448839483346965> Click the buttons below to Invite `grave` or Join our Support Server")
            .setColor("#7289DA")
            .setFooter({ text: 'Thank You for Using Grave ' });

        const row = new ActionRowBuilder<ButtonBuilder>()
            .addComponents(
                new ButtonBuilder()
                    .setLabel('Invite Me')
                    .setStyle(ButtonStyle.Link)
                    .setEmoji("<:plus:1304459894128115882>")
                    .setURL('https://discord.com/oauth2/authorize?client_id=1156619696339177525&permissions=1170845702942033&integration_type=0&scope=bot+applications.commands'),

                new ButtonBuilder()
                    .setLabel('Support')
                    .setStyle(ButtonStyle.Link)
                    .setEmoji('<:R_:1293480423443140662>')
                    .setURL('https://discord.gg/JQQHMr8jzC')
            );
        await _message.reply({
            embeds: [embed],
            components: [row]
        })
    }
}

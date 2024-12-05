import { EmbedBuilder, Message, WebhookClient } from "discord.js";
import { Bot } from "../../../core/client";
import logger from "../../../utils/logger";
import { Event } from "../../../tools/events";

export default class CommandRun extends Event {
    constructor(client: Bot, file: string) {
        super(client, file, { name: "messageCreate" });
    }

    public async run(message: Message): Promise<void> {
        if (!message.content.startsWith(this.client.prefix) || message.author.bot) return;

        const args = message.content.slice(this.client.prefix.length).trim().split(/ +/);
        const commandName = args.shift()?.toLowerCase();

        const embed = new EmbedBuilder()
            .setColor("#7289DA")
            .setTitle(`🔍 Command Executed`)
            .setDescription(`A command was run on the server!`)
            .addFields(
                { name: "User:", value: `${message.author.tag} (\`${message.author.id}\`)`, inline: true },
                { name: "Command:", value: `\`${commandName}\``, inline: true },
                { name: "Server:", value: `${message.guild?.name || "DM"}`, inline: true }
            )
            .setFooter({ text: `Server ID: ${message.guild?.id || "N/A"}` })
            .setTimestamp();

            const webhookUrl = process.env.COMMAND_LOGS_HOOK;

            if (!webhookUrl) {
                logger.error("Error logging webhook URL is not defined in environment variables.");
                return;
            }
    
            const hook = new WebhookClient({ url: webhookUrl });
    

        try {
            await hook.send({ embeds: [embed] });
            logger.info(`Command "${commandName}" executed by ${message.author.tag} in ${message.guild?.name || "DM"}`);
        } catch (error) {
            logger.error(`Failed to send command log embed for guild ${message.guild?.id}: ${error}`);
        }
    }
}

import { EmbedBuilder, WebhookClient } from "discord.js";
import { Bot } from "../../../core/client";
import logger from "../../../utils/logger";
import { Event } from "../../../tools/events";
import dotenv from "dotenv";

dotenv.config();

export default class ErrorEvent extends Event {
    constructor(client: Bot, file: string) {
        super(client, file, { name: "error" });
    }

    public async run(error: Error): Promise<void> {
        logger.error(`An error occurred: ${error.message}`);

        const embed = new EmbedBuilder()
            .setColor("#FF0000")
            .setTitle(`⚠️ Bot Error Occurred`)
            .setDescription(`An error was encountered in the bot's runtime.`)
            .addFields(
                { name: "Error Message:", value: `\`${error.message}\``, inline: false },
                { name: "Stack Trace:", value: `\`\`\`${error.stack?.slice(0, 1024) || "No stack trace available"}\`\`\``, inline: false }
            )
            .setTimestamp();

        const webhookUrl = process.env.ERROR_LOGS_HOOK;

        if (!webhookUrl) {
            logger.error("Error logging webhook URL is not defined in environment variables.");
            return;
        }

        const hook = new WebhookClient({ url: webhookUrl });

        try {
            await hook.send({ embeds: [embed] });
            logger.info("Error log embed sent successfully.");
        } catch (webhookError) {
            logger.error(`Failed to send error log embed: ${webhookError}`);
        }
    }
}
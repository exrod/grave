import { Bot } from "../../../core/client";
import logger from "../../../utils/logger";
import { EmbedBuilder, WebhookClient } from "discord.js";
import { Event } from "../../../tools/events";

export default class NodeError extends Event {
    constructor(client: Bot, file: string) {
        super(client, file, { name: "nodeError" });
    }

    public async run(node: string, error: Error): Promise<void> {
        const webhookUrl = process.env.NODE_ERROR_LOGS_HOOK;
        if (!webhookUrl) {
            logger.error("Error logging webhook URL is not defined in environment variables.");
            return;
        }
        const hook = new WebhookClient({ url: webhookUrl });
        const embed = new EmbedBuilder()
            .setColor("#7289DA") // Using the same color from previous embeds
            .setTitle("⚠️ Node Error")
            .setDescription(`An error occurred on a node.`)
            .addFields(
                { name: "Node:", value: `${node}`, inline: true },
                { name: "Error:", value: `${error.message}`, inline: false }
            )
            .setTimestamp();

        try {
            await hook.send({ embeds: [embed] });
            logger.info(`Embed sent successfully for node error: ${node}`);
        } catch (error) {
            logger.error(`Failed to send embed for node error: ${node}, error: ${error}`);
        }
    }
}
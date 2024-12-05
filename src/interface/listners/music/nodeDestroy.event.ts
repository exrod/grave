import { Bot } from "../../../core/client";
import logger from "../../../utils/logger";
import { EmbedBuilder, WebhookClient } from "discord.js";
import { Event } from "../../../tools/events";

export default class NodeDestroy extends Event {
    constructor(client: Bot, file: string) {
        super(client, file, { name: "nodeDestroy" });
    }

    public async run(node: string, code: number, reason: string): Promise<void> {
        const webhookUrl = process.env.NODE_DESTROY_LOGS_HOOK; 
        if (!webhookUrl) {
            logger.error("Error logging webhook URL is not defined in environment variables.");
            return;
        }
        const hook = new WebhookClient({ url: webhookUrl });;
        const embed = new EmbedBuilder()
            .setColor("#7289DA")
            .setTitle("🛑 Node Destroyed")
            .setDescription(`A node has been destroyed or closed.`)
            .addFields(
                { name: "Node:", value: `${node}`, inline: true },
                { name: "Code:", value: `${code}`, inline: true },
                { name: "Reason:", value: `${reason || "Unknown"}`, inline: false }
            )
            .setTimestamp();

        try {
            await hook.send({ embeds: [embed] });
            logger.info(`Embed sent successfully for node destroy: ${node}`);
        } catch (error) {
            logger.error(`Failed to send embed for node destroy: ${node}, error: ${error}`);
        }
    }
}
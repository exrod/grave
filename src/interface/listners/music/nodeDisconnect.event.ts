import { Bot } from "../../../core/client";
import logger from "../../../utils/logger";
import { EmbedBuilder, WebhookClient } from "discord.js";
import { Event } from "../../../tools/events";

export default class NodeDisconnect extends Event {
    constructor(client: Bot, file: string) {
        super(client, file, { name: "nodeDisconnect" });
    }

    public async run(node: string, reason: string): Promise<void> {
        const webhookUrl = process.env.NODE_DISCONNECT_LOGS_HOOK; 

        if (!webhookUrl) {
            logger.error("Error logging webhook URL is not defined in environment variables.");
            return;
        }
        
        const hook = new WebhookClient({ url: webhookUrl });
        const embed = new EmbedBuilder()
            .setColor("#7289DA")
            .setTitle("❌ Node Disconnected")
            .setDescription(`A node has disconnected.`)
            .addFields(
                { name: "Node:", value: `${node}`, inline: true },
                { name: "Reason:", value: `${reason}`, inline: true }
            )
            .setTimestamp();

        try {
            await hook.send({ embeds: [embed] });
            logger.info(`Embed sent successfully for node: ${node} (Reason: ${reason})`);
        } catch (error) {
            logger.error(`Failed to send embed for node: ${node}, error: ${error}`);
        }
    }
}
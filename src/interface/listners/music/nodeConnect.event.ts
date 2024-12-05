import { Bot } from "../../../core/client";
import logger from "../../../utils/logger";
import { EmbedBuilder, WebhookClient } from "discord.js";
import { Event } from "../../../tools/events";

export default class NodeConnect extends Event {
    constructor(client: Bot, file: string) {
        super(client, file, { name: "nodeConnect" });
    }

    public async run(node: string): Promise<void> {
        const webhookUrl = process.env.NODE_CONNECTION_HOOK;

        if (!webhookUrl) {
            logger.error("Error logging webhook URL is not defined in environment variables.");
            return;
        }

        const hook = new WebhookClient({ url: webhookUrl });
        const embed = new EmbedBuilder()
            .setColor("#7289DA")
            .setTitle("🌐 Node Connected")
            .setDescription(`A node has successfully connected!`)
            .addFields(
                { name: "Node:", value: `${node}`, inline: true },
                { name: "Status:", value: `Ready!`, inline: true }
            )
            .setTimestamp();

        try {
            await hook.send({ embeds: [embed] });
            logger.info(`Embed sent successfully for node: ${node}`);
        } catch (error) {
            logger.error(`Failed to send embed for node: ${node}, error: ${error}`);
        }
    }
}

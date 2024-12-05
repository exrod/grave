import { EmbedBuilder, WebhookClient } from "discord.js";
import { Bot } from "../../../core/client";
import logger from "../../../utils/logger";
import { Event } from "../../../tools/events";
import dotenv from "dotenv";

dotenv.config();

export default class RuntimeLogger extends Event {
    private preLoginLogs: string[] = [];
    private originalInfo: typeof logger.info;
    private originalError: typeof logger.error;

    constructor(client: Bot, file: string) {
        super(client, file, { name: "ready" });

        this.originalInfo = logger.info.bind(logger);
        this.originalError = logger.error.bind(logger);

        logger.info = ((message: any, ...meta: any[]): void => {
            this.preLoginLogs.push(`INFO: ${message}`);
            this.originalInfo(message, ...meta);
        }) as typeof logger.info;

        logger.error = ((message: any, ...meta: any[]): void => {
            this.preLoginLogs.push(`ERROR: ${message}`);
            this.originalError(message, ...meta);
        }) as typeof logger.error;

        logger.info("Loaded command pl");
    }

    public async run(): Promise<void> {
        const client = this.client as Bot;

        logger.info(`Bot ${client.user?.tag} has started successfully!`);
        logger.info(`Serving in ${client.guilds.cache.size} guilds with ${client.users.cache.size} users.`);

        const embed = new EmbedBuilder()
            .setColor("#7289DA")
            .setTitle("🚀 Bot Started")
            .setDescription(`The bot **${client.user?.tag}** has started and is now online.`)
            .addFields(
                { name: "Total Guilds:", value: `${client.guilds.cache.size}`, inline: true },
                { name: "Total Users:", value: `${client.users.cache.size}`, inline: true },
                { name: "Bot ID:", value: `${client.user?.id}`, inline: true }
            )
            .setTimestamp();

        if (this.preLoginLogs.length > 0) {
            embed.addFields({
                name: "Pre-Login Logs",
                value: this.preLoginLogs.join("\n").substring(0, 1024) || "No pre-login logs.",
            });
        }

        const webhookUrl = process.env.RUNTIME_LOGS_HOOK;
        if (!webhookUrl) {
            logger.error("Runtime logging webhook URL is not defined in environment variables.");
            return;
        }

        const hook = new WebhookClient({ url: webhookUrl });
        try {
            await hook.send({ embeds: [embed] });
            logger.info("Startup log embed sent successfully.");
        } catch (error) {
            logger.error(`Failed to send startup log embed: ${error}`);
        }

        logger.info = this.originalInfo;
        logger.error = this.originalError;

        client.on("guildCreate", (guild) => {
            logger.info(`Joined new guild: ${guild.name} (ID: ${guild.id})`);
        });

        client.on("guildDelete", (guild) => {
            logger.info(`Removed from guild: ${guild.name} (ID: ${guild.id})`);
        });

        client.on("interactionCreate", (interaction) => {
            logger.info(`Interaction received of type: ${interaction.type}`);
        });
    }
}
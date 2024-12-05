import { EmbedBuilder, Guild, GuildMember, WebhookClient } from "discord.js";
import { Bot } from "../../../core/client";
import logger from "../../../utils/logger";
import { Event } from "../../../tools/events";

export default class GuildCreate extends Event {
    constructor(client: Bot, file: string) {
        super(client, file, {
            name: "guildCreate",
        });
    }

    public async run(guild: Guild): Promise<void> {
        if (!guild) {
            logger.error("Guild object is undefined.");
            return;
        }

        let owner: GuildMember | null = null;

        try {
            owner = await guild.fetchOwner();
        } catch (error) {
            logger.error(`Failed to fetch owner for guild ${guild.id}: ${error}`);
        }

        const embed = new EmbedBuilder()
            .setColor("#7289DA")
            .setTitle(`🌟 New Server Joined`)
            .setDescription(`I have successfully joined a new server!`)
            .addFields(
                { name: 'Server Name:', value: `${guild.name}`, inline: true },
                { name: 'Owner:', value: owner ? owner.user.tag : "Owner not found", inline: true },
                { name: 'Server ID:', value: `\`${guild.id}\``, inline: true },
                { name: 'Total Members:', value: `${guild.memberCount}`, inline: true }
            )
            .setFooter({ text: `Total Servers: ${this.client.guilds.cache.size}` })
            .setTimestamp();

            const webhookUrl = process.env.GUILD_CREATE_LOGS_HOOK;

            if (!webhookUrl) {
                logger.error("Error logging webhook URL is not defined in environment variables.");
                return;
            }
    
            const hook = new WebhookClient({ url: webhookUrl });
    

        try {
            await hook.send({ embeds: [embed] });
            logger.info(`Embed sent successfully for guild: ${guild.name}`);
        } catch (error) {
            logger.error(`Failed to send embed for guild ${guild.id}: ${error}`);
        }
    }
}
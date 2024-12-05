import { EmbedBuilder, Guild, GuildMember, WebhookClient } from "discord.js";
import { Bot } from "../../../core/client";
import { Event } from "../../../tools/events";
import logger from "../../../utils/logger";


export default class GuildLeave extends Event {
    constructor(client: Bot, file: string) {
        super(client, file, {
            name: "guildDelete",
        });
    }

    public async run(guild: Guild): Promise<void> {
        let owner: GuildMember | undefined;
        try {
            owner = await guild.members.fetch(guild.ownerId);
        } catch (e) {
            console.error(`Error fetching owner for guild ${guild.id}: ${e}`);
        }

        const embed = new EmbedBuilder()
            .setColor("#7289DA")
            .setTitle(`👋 Guild Left`)
            .setDescription(`I have left a guild!`)
            .addFields(
                { name: 'Server Name:', value: `${guild.name}`, inline: true },
                { name: 'Owner:', value: owner ? owner.user.tag : "Unknown#0000", inline: true },
                { name: 'Server ID:', value: `\`${guild.id}\``, inline: true },
                { name: 'Member Count:', value: `${guild.memberCount}`, inline: true }
            )
            .setTimestamp();

            const webhookUrl = process.env.GUILD_LEAVE_LOGS_HOOK;
            if (!webhookUrl) {
                logger.error("Error logging webhook URL is not defined in environment variables.");
                return;
            }
    
            const hook = new WebhookClient({ url: webhookUrl });
    
        await hook.send({ embeds: [embed] });
    }
}

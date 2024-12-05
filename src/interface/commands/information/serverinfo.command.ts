import { ActionRowBuilder, ButtonBuilder, ButtonStyle, CommandInteraction, EmbedBuilder, Message, Guild } from "discord.js";
import { Bot } from "../../../core/client";
import { Command } from "../../../tools/command";
import logger from "../../../utils/logger";

export default class ServerInfo extends Command {
    constructor(client: Bot) {
        super(client, {
            name: "serverinfo",
            category: "information",
            description: {
                content: "Displays server information",
                usage: ".serverinfo",
                examples: ["serverinfo"],
            },
            aliases: ["si"],
            cooldown: 5,
            slashCommand: true,
        });
    }

    public async run(_client: Bot, _message: Message): Promise<void> {
        const guild = _message.guild;
        if (!guild) return;

        await this.sendServerInfo(guild, _message, null);
    }

    // big brain
    private toNullableUrl(url?: string | null): string | null {
        return url ?? null; 
    }

    public async runInteraction(interaction: CommandInteraction): Promise<void> {
        const guild = interaction.guild;
        if (!guild) return;

        await this.sendServerInfo(guild, null, interaction); 
    }

    private async sendServerInfo(guild: Guild, _message: Message | null, interaction: CommandInteraction | null): Promise<void> {
        try {
            const owner = await guild.fetchOwner();
            const roles = guild.roles.cache.size;
            const emojis = guild.emojis.cache.size;
            const stickers = guild.stickers.cache.size;
            const members = guild.memberCount;
            const bots = guild.members.cache.filter((m) => m.user.bot).size;
            const textChannels = guild.channels.cache.filter((ch) => ch.type === 0).size;
            const voiceChannels = guild.channels.cache.filter((ch) => ch.type === 2).size;
            const categories = guild.channels.cache.filter((ch) => ch.type === 4).size;
            const boosts = guild.premiumSubscriptionCount ?? 0;
            const boostLevel = guild.premiumTier;
            const createdAt = `<t:${Math.floor(guild.createdTimestamp / 1000)}:R>`;
    
            const userId = interaction ? interaction.user.id : _message?.author.id;
            
            const member = userId ? guild.members.cache.get(userId) : null;
            const joinedTimestamp = member?.joinedTimestamp ?? 0; 
    
            const joinedAt = `<t:${Math.floor(joinedTimestamp / 1000)}:R>`;
            
            const vanityUrlCode = guild.vanityURLCode ?? "None";
    
            const bannerUrl = this.toNullableUrl(guild.bannerURL({ size: 1024 }));
            const iconUrl = this.toNullableUrl(guild.iconURL({ size: 1024 }));
            const splashUrl = this.toNullableUrl(guild.splashURL({ size: 1024 }));
    
            const embed = new EmbedBuilder()
                .setColor("#7289DA")
                .setTitle(`<:R_:1293480423443140662> Server Info: ${guild.name}`)
                .setThumbnail(iconUrl)
                .addFields([
                    { name: "Created On", value: createdAt, inline: true },
                    { name: "Joined On", value: joinedAt, inline: true },
                    { name: "Owner", value: `${owner.user.tag}`, inline: true },
                    { name: "Counts", value: `Roles: ${roles}\nEmojis: ${emojis}\nStickers: ${stickers}`, inline: true },
                    { name: "Members", value: `Members: ${members}\nBots: ${bots}`, inline: true },
                    { name: "Channels", value: `Text: ${textChannels}\nVoice: ${voiceChannels}\nCategories: ${categories}`, inline: true },
                    { name: "Boost Info", value: `Boosts: ${boosts}\nLevel: ${boostLevel}`, inline: true },
                    { name: "Vanity URL", value: `${vanityUrlCode}`, inline: true },
                ])
                .setFooter({
                    text: `Guild ID: ${guild.id}`,
                    iconURL: 'https://cdn.discordapp.com/attachments/1304704898973044806/1305780138914611261/R_.png'
                });
    
            const buttonRow = new ActionRowBuilder<ButtonBuilder>().addComponents(
                new ButtonBuilder()
                    .setLabel('Invite Me')
                    .setStyle(ButtonStyle.Link)
                    .setURL('https://discord.com/oauth2/authorize?client_id=1156619696339177525&permissions=1170845702942033&integration_type=0&scope=bot+applications.commands'),
                new ButtonBuilder()
                    .setLabel('Support Server')
                    .setStyle(ButtonStyle.Link)
                    .setURL('https://discord.gg/ghouls')
            );
    
            if (_message) {
                await _message.reply({ embeds: [embed], components: [buttonRow] });
            } else if (interaction) {
                await interaction.reply({ embeds: [embed], components: [buttonRow] });
            }
        } catch (error) {
            logger.error("Error fetching server info", error);
            if (interaction) {
                await interaction.reply({ content: "An error occurred while fetching server info.", ephemeral: true });
            } else if (_message) {
                await _message.reply({ content: "An error occurred while fetching server info." });
            }
        }
    }
}

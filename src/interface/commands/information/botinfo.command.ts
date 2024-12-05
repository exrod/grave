import { Message, EmbedBuilder, version as discordJsVersion, ButtonBuilder, ButtonStyle, ActionRowBuilder } from "discord.js";
import os from "os";
import { version as nodeVersion } from "process";
import { Command } from "../../../tools/command";
import { Bot } from "../../../core/client";
import * as ts from 'typescript';

export default class Botinfo extends Command {
  constructor(client: Bot) {
    super(client, {
      name: "botinfo",
      category: "information",
      description: {
        content: "Information about Bot and it's System",
        usage: ".botinfo",
        examples: ["botinfo"],
      },
      cooldown: 5,
      slashCommand: false,
    });
  }

  public async run(_client: Bot, _message: Message, _args: string[]) {
    const totalServer = this.client.guilds.cache.size;
    const totalUsers = this.client.users.cache.size;
    const uptime = this.formatUptime(this.client.uptime || 0);
    const systemUptime = this.formatUptime(os.uptime() * 1000);
    const memoryUsage = (process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2);
    const commandCount = this.client.commands.size;
    const typescriptVersion = ts.version;
    

    const embed = new EmbedBuilder()
      .setDescription(`<:music2:1304459912482525205> Grave is a music bot made by Cemetery Studios, a team of developers dedicated to making your server experience better.`)
      .setColor("#7289DA")
      .setTitle(`<:R_:1293480423443140662> ${this.client.user?.username}'s Info`)
      .addFields(
        { name: "<:folder:1304460353278574622> General", value: `> Guilds: ${totalServer}\n> User Count: ${totalUsers}\n> Command Count: ${commandCount}`, inline: false },
        { name: "<:ubuntu:1304459910141968395> System", value: `> Ram Usage${memoryUsage} MB\n> Uptime: ${uptime}\n> System Uptime: ${systemUptime}`, inline: false },
        { name: "<:github:1304459888541564968> Misc", value: `> discord.js: ${nodeVersion}\n> TypeScript: ${typescriptVersion}`, inline: false },
      ) // ${discordJsVersion}
      .setFooter({ text: `cemetery.studio`, iconURL: `https://cdn.discordapp.com/attachments/1304704898973044806/1305780138914611261/R_.png` })
      .setThumbnail(`https://cdn.discordapp.com/attachments/1304704898973044806/1305780138914611261/R_.png`)
      .setTimestamp();
    
      const buttonRow = new ActionRowBuilder<ButtonBuilder>().addComponents(
        new ButtonBuilder()
            .setEmoji(`<:plus:1304459894128115882>`)
            .setLabel('Invite Me')
            .setStyle(ButtonStyle.Link)
            .setURL('https://discord.com/oauth2/authorize?client_id=1156619696339177525&permissions=1170845702942033&integration_type=0&scope=bot+applications.commands'),
        new ButtonBuilder()
            .setEmoji(`<:R_:1293480423443140662>`)
            .setLabel('Support Server')
            .setStyle(ButtonStyle.Link)
            .setURL('https://discord.gg/ghouls')
    );

    await _message.reply({ embeds: [embed], components: [buttonRow] });
  }
  private formatUptime(uptime: number): string {
    const totalSeconds = Math.floor(uptime / 1000);
    const days = Math.floor(totalSeconds / (3600 * 24));
    const hours = Math.floor(totalSeconds % (3600 * 24) / 3600);
    const minutes = Math.floor(totalSeconds % 3600 / 60);
    const seconds = Math.floor(totalSeconds % 60);

    return `${days}d ${hours}h ${minutes}m ${seconds}s`;
  }
}

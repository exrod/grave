import { EmbedBuilder } from "discord.js";
import os from "os";
import { Bot } from "../../../core/client";
import { Command } from "../../../tools/command";

export default class Uptime extends Command {
  constructor(client: Bot) {
    super(client, {
      name: "uptime",
      category: "information",
      description: {
        content: "Information about Bot and it's Uptime",
        usage: ".uptime",
        examples: ["uptime"],
      },
      cooldown: 5,
      slashCommand: false,
    });
  } 

  public async run(_client: Bot, _message: any, _args: string[]): Promise<any> {
    const botUptime = this.formatUptime(this.client.uptime || 0);
    const systemUptime = this.formatUptime(os.uptime() * 1000);

    const totalRam = os.totalmem() / (1024 * 1024);
    const freeRam = os.freemem() / (1024 * 1024);
    const usedRam = totalRam - freeRam;

    const embed = new EmbedBuilder()
      .setColor("#7289DA")
      .setTitle("<:serveruptime:1304459879020363868>  Bot & System Uptime")
      .addFields(
        { name: "**Bot Uptime**", value: botUptime, inline: false },
        { name: "**System Uptime**", value: systemUptime, inline: false },
        { name: "**RAM Usage**", value: `${usedRam.toFixed(2)} MB / ${totalRam.toFixed(2)} MB`, inline: false }
      )
      .setFooter({
        iconURL: 'https://cdn.discordapp.com/attachments/1304704898973044806/1305780138914611261/R_.png',
        text: 'cemetery.studio'
      })
      .setTimestamp();

    await _message.reply({ embeds: [embed] });
  }

  private formatUptime(duration: number): string {
    const seconds = Math.floor((duration / 1000) % 60);
    const minutes = Math.floor((duration / (1000 * 60)) % 60);
    const hours = Math.floor((duration / (1000 * 60 * 60)) % 24);
    const days = Math.floor(duration / (1000 * 60 * 60 * 24));

    return `${days}d ${hours}h ${minutes}m ${seconds}s`;
  }

/*   private mathuptime(duration: number): string {
    const mathSeconds = Math.floor((duration / 1000) % 60);
    const mathMinutes = Math.floor((duration / (1000 * 60)) % 60);
    const mathHours = Math.floor(((duration / 1000 * 60 * 60)) % 24);
    const mathDays = Math.floor(duration / (1000 * 60 * 60 * 24));


    return `${mathSeconds}s ${mathMinutes}m ${mathHours}h ${mathDays}d`
  } */
}
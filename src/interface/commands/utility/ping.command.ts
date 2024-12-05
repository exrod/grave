import { Message, EmbedBuilder } from "discord.js";
import { Bot } from "../../../core/client";
import { Command } from "../../../tools/command";

export default class ping extends Command {
	constructor(client: Bot) {
		super(client, {
			name: "ping",
			category: "utility",
			description: {
				content: "Check the bot's latency",
				usage: ".ping",
				examples: ["ping"],
			},
			cooldown: 5,
			slashCommand: false,
		});
	}

	public async run(_client: Bot, _message: Message, _args: string[]) {
		const msg = await _message.reply("Pinging...");
		const webSocketPing = this.client.ws.ping;
		const uptime = this.client.uptime ? this.formatUptime(this.client.uptime) : "N/A";

		const embed = new EmbedBuilder()
			.setColor("#7289DA")
			.setTitle("Grave's Web-Socket Latency!")
			.addFields(
				{ name: "<:ping:1304459885030932490> WebSocket Ping", value: `\`${webSocketPing}ms\``, inline: true },
				{ name: "<:serveruptime:1304459879020363868> Uptime", value: uptime, inline: true },
			)
			.setTimestamp()
			.setFooter({
                text: "cemetery.studio",
                iconURL: 'https://cdn.discordapp.com/attachments/1304704898973044806/1305780138914611261/R_.png'
            });

		await msg.edit({ content: null, embeds: [embed] });
	}

	private formatUptime(uptime: number): string {
		const seconds = Math.floor((uptime / 1000) % 60);
		const minutes = Math.floor((uptime / (1000 * 60)) % 60);
		const hours = Math.floor((uptime / (1000 * 60 * 60)) % 24);
		const days = Math.floor(uptime / (1000 * 60 * 60 * 24));

		return `${days}d ${hours}h ${minutes}m ${seconds}s`;
	}
}
import { Message } from "discord.js";
import { Bot } from "../../../core/client";
import { Command } from "../../../tools/command";
import dotenv from "dotenv";
import { owners } from "../../../config";

dotenv.config();

const BOT_OWNERS: string[] = owners;
const terminalLogs: string[] = [];

const originalLog = console.log.bind(console);
const originalError = console.error.bind(console);

console.log = (...args: any[]): void => {
    terminalLogs.push(`LOG: ${args.join(" ")}`);
    originalLog(...args);
};

console.error = (...args: any[]): void => {
    terminalLogs.push(`ERROR: ${args.join(" ")}`);
    originalError(...args);
};

export default class Terminal extends Command {
    constructor(client: Bot) {
        super(client, {
            name: "terminal",
            category: "developer",
            description: {
                content: "shows terminal logs",
                usage: ".terminal",
                examples: ["terminal"],
            },
            permissions: {
                dev: true,
            },
            cooldown: 5,
            slashCommand: true,
        });
    }

    public async run(_client: Bot, message: Message, args: string[]): Promise<void> {
        const userId = message.author.id;
        if (!BOT_OWNERS.includes(userId)) {
            await message.reply("You do not have permission to use this command.");
            return;
        }

        if (terminalLogs.length === 0) {
            await message.author.send("No terminal logs available.");
            return;
        }

        const logs = terminalLogs.join("\n");
        const logChunks = logs.match(/[\s\S]{1,2000}/g) || [];

        for (const chunk of logChunks) {
            await message.author.send(`\`\`\`${chunk}\`\`\``);
        }
    }
} // kk
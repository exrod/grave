import Module from "../../tools/modules";
import path from "path";
import fs from "fs";
import logger from "../../utils/logger";
import { Bot } from "../../core/client";

export default class CommandListeners extends Module {
    public client: Bot;

    constructor(client: Bot, file: string) {
        super(client, file, {
            name: "modules",
            required: true,
        });
        this.client = client;
    }

    public async load(): Promise<void> {
        const commandsPath = path.join(__dirname);
        const directories = fs
            .readdirSync(commandsPath)
            .filter((dir) => fs.statSync(path.join(commandsPath, dir)).isDirectory());

        for (const dir of directories) {
            const fullPath = path.join(commandsPath, dir);
            const commandFiles = fs
                .readdirSync(fullPath)
                .filter((file) => file.endsWith(".ts") || file.endsWith(".js"));

            for (const commandFile of commandFiles) {
                try {
                    const commandModule = await import(path.join(fullPath, commandFile));
                    const CommandClass = commandModule.default;

                    if (typeof CommandClass !== 'function') {
                        logger.error(`Invalid command class in file: ${commandFile}`);
                        continue;
                    }

                    const command = new CommandClass(this.client);

                    this.client.commands.set(command.name, command);
                    logger.info(`Loaded command: ${command.name} from file: ${commandFile}`);

                    if (command.aliases?.length > 0) {
                        logger.info(`Command ${command.name} has aliases: ${command.aliases.join(", ")}`);
                        command.aliases.forEach((alias: string) => {
                            this.client.aliases.set(alias, command.name);
                        });
                    }

                } catch (error) {
                    logger.error(`Error loading command from file: ${commandFile}, error: ${error}`);
                }
            }
        }
    }
}
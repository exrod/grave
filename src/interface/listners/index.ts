import { Bot } from "../../core/client";
import logger from "../../utils/logger";
import fs from "node:fs";
import path from "node:path";

export class EventListeners {
    public client: Bot;

    constructor(client: Bot) {
        this.client = client;
        logger.debug(`[ EVENT ] : Event Listener has been initialized!`);
    }

    public async loadEvents(): Promise<void> {
        const eventsPath = path.join(__dirname);
        const directories = ['client', 'music', 'bot'];

        for (const dir of directories) {
            const fullPath = path.join(eventsPath, dir);

            if (!fs.existsSync(fullPath)) {
                logger.error(`Directory does not exist: ${fullPath}`);
                continue;
            }

            const eventFiles = fs
                .readdirSync(fullPath)
                .filter((file) => file.endsWith(".ts") || file.endsWith(".js"));

            for (const file of eventFiles) {
                try {
                    const eventModule = await import(path.join(fullPath, file));
                    const EventClass = eventModule.default;
                    if (typeof EventClass === 'function') {
                        const evt = new EventClass(this.client, file);
                        switch (dir) {
                            case "music":
                                this.client.shoukaku.on(evt.name, (...args) => { try { evt.run(...args) } catch (e) { } });
                                break;
                            default:
                                this.client.on(evt.name, (...args: any[]) => evt.run(...args));
                        }
                        logger.info(`Loaded event: ${evt.name} from file: ${file}`);
                    } else {
                        logger.error(`Invalid event class in file: ${file}`);
                    }
                } catch (error) {
                    logger.error(`Error loading event from file: ${file}, error: ${error}`);
                }
            }
        }
    }
}

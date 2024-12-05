import { Bot } from "../../../core/client";
import { Event } from "../../../tools/events";
import logger from "../../../utils/logger";
import { grave_presence } from "../../../config";
import { db } from "../../../utils/database";

export default class Ready extends Event {
    constructor(client: Bot, file: string) {
        super(client, file, {
            name: "ready",
            once: true
        });
    }

    public async run(): Promise<void> {
        db.ignoredChannels.findMany().then((channels) => {
            channels.forEach((channel) => {
                this.client.ignoredChannels.push(channel.channelId);
            });
        });
        logger.info(`[ CLIENT ] : ${this.client.user?.tag} is ready!`);
        this.client.user?.setPresence(grave_presence)
    }
}

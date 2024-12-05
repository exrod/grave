import { Client, ClientOptions } from "discord.js";
import logger from "../utils/logger";

class BaseClient extends Client {
    constructor(options: ClientOptions) {
        super(options);
    }

    public async run(): Promise<void> {
        logger.info('Client is running...');
    }
}

export default BaseClient;

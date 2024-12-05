import dotenv from "dotenv";
import { token } from "./config";
import { Bot } from "./core/client";
import logger from "./utils/logger";
import { WebhookClient } from "discord.js";

dotenv.config();

const client = new Bot();
const webhookUrl = process.env.RUNTIME_LOGS_HOOK;

const webhook = webhookUrl ? new WebhookClient({ url: webhookUrl }) : null;

const logMessage = async (level: "info" | "error", message: string) => {
    if (level === "info") {
        logger.info(message);
    } else {
        logger.error(message);
    }

    if (webhook) {
        try {
            await webhook.send({
                content: `[${level.toUpperCase()}]: ${message}`
            });
        } catch (error) {
            logger.error("Failed to send log message to webhook:", error);
        }
    }
};

(async () => {
    try {
        if (!token || token === 'no token found') {
            await logMessage("error", "[ CLIENT ]: Token is missing. Check your .env file.");
            process.exit(1);
        }
        await logMessage("info", `[ CLIENT ] : Attempting to log in with token: ${token ? 'Token present' : 'Token missing'}`);

        await client.login(token);

        await logMessage("info", `[ CLIENT ] : Bot has successfully logged in!`);
    } catch (error) {
        await logMessage("error", `[ CLIENT ] : Failed to login : ${error}`);
        process.exit(1);
    }
})();

process.on('unhandledRejection', (reason, promise) => {
    console.log(reason, promise);
});

process.on('uncaughtException', (err, origin) => {
    console.log(err, origin);
});

process.on('uncaughtExceptionMonitor', (err, origin) => {
    console.log(err, origin);
});
process.on('error', (err, origin) => {
    console.log(err, origin);
});
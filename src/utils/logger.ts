import path from "path";
import { createLogger, format, transports } from "winston";
const { combine, timestamp, printf, colorize } = format;

const loggerFormat = printf(({ level, message, timestamp }) => {
    return `${timestamp} ${level}: ${message}`;
});

const logger = createLogger({
    level: "info",
    format: combine(
        colorize(),
        timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
        loggerFormat
    ),
    transports: [
        new transports.Console(),
        new transports.File({
            filename: path.join("src", "logs", "combined.log"),
        }),
        new transports.File({
            filename: path.join("src", "logs", "error.log"),
            level: "error",
        }),
    ],
});

export default logger;
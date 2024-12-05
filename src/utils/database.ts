import logger from "./logger";
import { PrismaClient } from "@prisma/client";

interface CustomNodeJsGlobal extends Global {
    prisma: PrismaClient;
}

declare const global: CustomNodeJsGlobal;

export const db = global.prisma || new PrismaClient({});

db.$connect()
    .then(() => {
        logger.info("[ PRISMA ] : connected to database");
    })
    .catch((error: any) => {
        logger.error("[ PRISMA ] : failed to connect datatabase : ", error);
    });

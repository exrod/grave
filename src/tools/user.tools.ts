import { Bot } from "../core/client";

export async function validateGuild(id: string, client: Bot): Promise<boolean> {
    const guild = await client.guilds.fetch(id).catch(() => null);
    if (!guild) {
        return false
    }
    return true
}

export async function validateUser(id: string, client: Bot): Promise<boolean> {
    const user = await client.users.fetch(id).catch(() => null);
    if (!user) {
        return false
    }
    return true
}

export async function validateChannel(id: string, client: Bot): Promise<boolean> {
    const channel = await client.channels.fetch(id).catch(() => null);
    if (!channel) {
        return false
    }
    return true
}
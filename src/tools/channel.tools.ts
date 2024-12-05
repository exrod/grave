import { Bot } from "../core/client";
import { ChannelType } from "discord.js";

export async function changeChannelStatus(channelId: string, content: string, client: Bot) {
    const channel = await client.channels.fetch(channelId);
    if (!channel || channel.type !== ChannelType.GuildVoice) return;
    try {
        await client.rest.put(`/channels/${channel.id}/voice-status`, {
            body: {
                status: `${content}`
            }
        })
    } catch (error) {
        console.log(error)
    }
}
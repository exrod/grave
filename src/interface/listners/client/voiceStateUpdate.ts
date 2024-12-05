import { ChannelType, VoiceState } from "discord.js";
import { Bot } from "../../../core/client";
import { Event } from "../../../tools/events";

export default class voiceStateUpdate extends Event {
  constructor(client: Bot, file: string) {
    super(client, file, {
      name: "voiceStateUpdate",
      once: false,
    });
  }
  public async run(_oldState: VoiceState, newState: VoiceState): Promise<void> {
    const guildId = newState.guild.id;
    if (!guildId) return;

    const player = this.client.queue.get(guildId);
    if (!player) return;
    const vcConnection = player.player.node.manager.connections.get(guildId);
    if (!vcConnection?.channelId) return player.destroy();
    const vc = newState.guild.channels.cache.get(vcConnection.channelId);
    if (!(vc && vc.members instanceof Map)) return;

    if (
      !newState.guild.members.cache.get(this.client.user!.id)?.voice.channelId
    ) {
      return player.destroy();
    }

    if (
      newState.id === this.client.user!.id &&
      newState.channelId &&
      newState.channel!.type === ChannelType.GuildStageVoice &&
      newState.guild.members.me!.voice.suppress
    ) {
      if (
        newState.guild.members.me!.permissions.has(["Connect", "Speak"]) ||
        newState
          .channel!.permissionsFor(newState.guild.members.me!)
          .has("MuteMembers")
      ) {
        await newState.guild.members
          .me!.voice.setSuppressed(false)
          .catch(() => { });
      }
    }
    if (newState.id === this.client.user!.id) return;

    if (
      newState.id === this.client.user!.id &&
      !newState.serverDeaf &&
      vc.permissionsFor(newState.guild.members.me!).has("DeafenMembers")
    ) {
      await newState.setDeaf(true);
    }

    if (newState.id === this.client.user!.id && newState.serverMute && !player.paused) {
      player.pause();
    }

    if (newState.id === this.client.user!.id && !newState.serverMute && player.paused) {
      player.pause();
    }
  }
}

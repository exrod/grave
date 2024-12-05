import { Player } from "shoukaku";
import { Bot } from "../../../core/client";
import Dispatcher, { Song } from "../../../tools/shoukaku/dispatcher";
import { Event } from "../../../tools/events";

export default class TrackStart extends Event {
  constructor(client: Bot, file: string) {
    super(client, file, {
      name: "trackEnd",
    });
  }

  public async run(
    _player: Player,
    track: Song,
    dispatcher: Dispatcher
  ): Promise<void> {
    dispatcher.previous = dispatcher.current;
    dispatcher.current = null;
    const vcId = dispatcher.voiceChannelId;
    await this.client.rest
      .put(`/channels/${vcId}/voice-status`, {
        body: {
          status: ``,
        },
      })
      .catch(() => { null });
    const nowPlayingMessage = await dispatcher.nowPlayingMessage
      ?.fetch()
      .catch(() => null);

    switch (dispatcher.loop) {
      case "repeat":
        dispatcher.queue.unshift(track);
        break;
      case "queue":
        dispatcher.queue.push(track);
        break;
    }

    await dispatcher.play();
    if (!nowPlayingMessage) return;
    if (nowPlayingMessage?.deletable) {
      await nowPlayingMessage.delete().catch(() => { null });
    }
  }
}

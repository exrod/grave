import type { Player } from "shoukaku";
import { Bot } from "../../../core/client";
import Dispatcher, { Song } from "../../../tools/shoukaku/dispatcher";
import { Event } from "../../../tools/events";

export default class QueueEnd extends Event {
  constructor(client: Bot, file: string) {
    super(client, file, {
      name: "queueEnd",
    });
  }

  public async run(
    _player: Player,
    track: Song,
    dispatcher: Dispatcher
  ): Promise<void> {
    const guild = await this.client.guilds
      .fetch(dispatcher.guildId)
      .catch(() => {});
    if (!guild) return;
    switch (dispatcher.loop) {
      case "repeat":
        dispatcher.queue.unshift(track);
        break;
      case "queue":
        dispatcher.queue.push(track);
        break;
      case "off":
        dispatcher.previous = dispatcher.current;
        dispatcher.current = null;
        break;
    }

    if (dispatcher.autoplay) {
      await dispatcher.Autoplay(track);
    } else {
      dispatcher.autoplay = false;
    }
  }
}

import { Message, User } from "discord.js";
import { LavalinkResponse, Node, Player, Track, UpdatePlayerTrackOptions } from "shoukaku";

import { Bot } from "../../core/client";
import { searchEngine } from "../../config";

export class Song implements Track {
  encoded: string;
  info: {
    identifier: string;
    isSeekable: boolean;
    author: string;
    length: number;
    isStream: boolean;
    position: number;
    title: string;
    uri?: string;
    artworkUrl?: string;
    isrc?: string;
    sourceName: string;
    requester: User;
  };
  pluginInfo: unknown;

  constructor(track: Song | Track, user: User) {
    if (!track) throw new Error("Track is not provided");
    this.encoded = track.encoded;
    this.info = {
      ...track.info,
      requester: user,
    };
  }
}
export default class Dispatcher {
  private client: Bot;
  public guildId: string;
  public channelId: string;
  public voiceChannelId: string;
  public player: Player;
  public queue: Song[] = [];
  public stopped: boolean;
  public previous: Song | null;
  public current: Song | null;
  public loop: "off" | "repeat" | "queue";
  public requester: User | undefined;
  public repeat: number;
  public node: Node;
  public paused: boolean;
  public filters: Array<string>;
  public autoplay: boolean;
  public nowPlayingMessage: Message | null;
  public history: Song[] = [];

  constructor(options: DispatcherOptions) {
    this.client = options.client;
    this.guildId = options.guildId;
    this.channelId = options.channelId;
    this.voiceChannelId = options.voicechannelId;
    this.player = options.player;
    this.queue = [];
    this.stopped = false;
    this.previous = null;
    this.current = null;
    this.loop = "off";
    this.repeat = 0;
    if (!options.node) throw new Error("Node is not provided");
    this.node = options.node;
    this.paused = false;
    this.filters = [];
    this.autoplay = false;
    this.nowPlayingMessage = null;

    this.player
      .on("start", () =>
        this.client.shoukaku.emit("trackStart" as any, this.player, this.current, this)
      )
      .on("end", () => {
        if (!this.queue.length)
          this.client.shoukaku.emit(
            "queueEnd" as any,
            this.player,
            this.current,
            this
          );
        this.client.shoukaku.emit("trackEnd" as any, this.player, this.current, this);
      })
      .on("stuck", () =>
        this.client.shoukaku.emit("trackStuck" as any, this.player, this.current)
      )
      .on("closed", (...arr) => {
        this.client.shoukaku.emit("socketClosed" as any, this.player, ...arr);
      });
  }

  get exists(): boolean {
    return this.client.queue.has(this.guildId);
  }
  get volume(): number {
    return this.player.volume;
  }
  public async play(): Promise<void> {
    if (!this.exists || (!this.queue.length && !this.current)) {
      return;
    }
    this.current = this.queue.length !== 0 ? this.queue.shift() || null : this.queue[0];
    if (!this.current) return;
    this.player.playTrack({ track: { encoded: this.current.encoded } as UpdatePlayerTrackOptions });
    if (this.current) {
      this.history.push(this.current);
      if (this.history.length > 100) {
        this.history.shift();
      }
    }
  }
  public pause(): void {
    if (!this.player) return;
    if (!this.paused) {
      this.player.setPaused(true);
      this.client.rest.put(`/channels/${this.voiceChannelId}/voice-status`, {
        body: {
          status: ` Paused: ${this.current?.info.title} By ${this.current?.info.author}`,
        },
      }).catch(e => { null })
      this.paused = true;
    } else {
      this.player.setPaused(false);
      this.client.rest.put(`/channels/${this.voiceChannelId}/voice-status`, {
        body: {
          status: ` Now Playing: ${this.current?.info.title.substring(0,300)} By ${this.current?.info.author}`,
        },
      }).catch(e => { null })
      this.paused = false;
    }
  }
  public remove(index: number): void {
    if (!this.player) return;
    if (index > this.queue.length) return;
    this.queue.splice(index, 1);
  }
  public previousTrack(): void {
    if (!this.player) return;
    if (!this.previous) return;
    this.queue.unshift(this.previous);
    this.player.stopTrack();
  }
  /**
   * Function to destroy the player
   * @returns void
   */
  public destroy(): void {
    this.queue = [];
    this.history = [];
    this.client.shoukaku.leaveVoiceChannel(this.guildId);
    this.client.queue.delete(this.guildId);
    this.client.rest.put(`/channels/${this.voiceChannelId}/voice-status`, {
      body: {
        status: ``,
      },
    }).catch(e => { null });
    if (this.stopped) return;
    this.client.shoukaku.emit("playerDestroy" as any, this.player);
  }
  public setShuffle(): void {
    if (!this.player) return;
    const queue = this.queue;
    for (let i = queue.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [queue[i], queue[j]] = [queue[j], queue[i]];
    }
    this.queue = queue;
  }
  public async skip(skipto: any = 1): Promise<void> {
    if (!this.player) return;
    if (skipto > 1) {
      if (skipto > this.queue.length) {
        this.queue.length = 0;
      } else {
        this.queue.splice(0, skipto - 1);
      }
    }
    this.repeat = this.repeat == 1 ? 0 : this.repeat;
    this.player.stopTrack();
  }
  public seek(time: number): void {
    if (!this.player) return;
    this.player.seekTo(time);
  }
  public stop(): void {
    if (!this.player) return;
    this.queue = [];
    this.history = [];
    this.loop = "off";
    this.autoplay = false;
    this.repeat = 0;
    this.stopped = true;
    this.player.stopTrack();
    this.client.rest.put(`/channels/${this.voiceChannelId}/voice-status`, {
      body: {
        status: ``,
      },
    }).catch(e => { null });
  }
  public setLoop(loop: any): void {
    this.loop = loop;
  }

  public buildTrack(track: Song | Track, user: User): Song {
    return new Song(track, user);
  }
  public async isPlaying(): Promise<void> {
    if (this.queue.length && !this.current && !this.player.paused) {
      this.play();
    }
  }
    public async Autoplay(song: Song): Promise<void> {
      const resolve = await this.node.rest.resolve(
        `${searchEngine}:${song.info.author}`
      );
      if (!resolve || !resolve?.data || !Array.isArray(resolve.data))
        return this.destroy();

      const metadata = resolve.data as Array<any> as any;
      let choosed: Song | null = null;
      const maxAttempts = 10; // Maximum number of attempts to find a unique song
      let attempts = 0;
      while (attempts < maxAttempts) {
        const potentialChoice = this.buildTrack(
          metadata[Math.floor(Math.random() * metadata.length)],
          this.client.user!
        );
        if (
          !this.queue.some((s) => s.encoded === potentialChoice.encoded) &&
          !this.history.some((s) => s.encoded === potentialChoice.encoded)
        ) {
          choosed = potentialChoice;
          break;
        }
        attempts++;
      }
      if (choosed) {
        this.queue.push(choosed);
        return await this.isPlaying();
      }
      return this.destroy();
    }
    public async setAutoplay(autoplay: boolean): Promise<void> {
      this.autoplay = autoplay;
      if (autoplay) {
        this.Autoplay(this.current ? this.current : this.queue[0]);
      }
    }
}

export interface DispatcherOptions {
  client: Bot;
  guildId: string;
  channelId: string;
  voicechannelId: string;
  player: Player;
  node: Node | undefined;
}
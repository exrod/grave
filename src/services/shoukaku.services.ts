import { Connectors, NodeOption, Shoukaku } from "shoukaku";
import { Bot } from "../core/client";
import logger from "../utils/logger";

export class ShoukakuClient extends Shoukaku {
  public client: Bot;

  constructor(client: Bot, lavanodes: NodeOption[]) {
    super(new Connectors.DiscordJS(client), lavanodes, {
      resume: true,
      resumeTimeout: 30,
      resumeByLibrary: true,
      reconnectTries: 5,
      reconnectInterval: 5,
      restTimeout: 60,
      moveOnDisconnect: false,
      userAgent: `Grave Bot`,
      nodeResolver: (nodes) =>
        [...nodes.values()]
          .filter((node) => node.state === 2)
          .sort((a, b) => a.penalties - b.penalties)
          .shift(),
    });

    this.client = client;

    this.on("ready", (name, reconnected) => {
      const event = reconnected ? "nodeReconnect" : "nodeConnect";
      logger.info(`[ SHOUKAKU ]: ${event} for node ${name}`);
      this.client.shoukaku.emit(event as any, name);
    });

    this.on("error", (name, error) => {
      logger.error(`[ SHOUKAKU ]: Node ${name} encountered an error: ${error.message}`);
      this.client.shoukaku.emit("nodeError" as any, name, error);
    });

    this.on("close", (name, code, reason) => {
      logger.warn(`[ SHOUKAKU ]: Node ${name} closed with code ${code}, reason: ${reason}`);
      this.client.shoukaku.emit("nodeDestroy" as any, name, code, reason);
    });

    this.on("disconnect", (name, count) => {
      logger.warn(`[ SHOUKAKU ]: Node ${name} disconnected, retry count: ${count}`);
      this.client.shoukaku.emit("nodeDisconnect" as any, name, count);
    });

    this.on("debug", (name, reason) => {
      logger.debug(`[ SHOUKAKU ]: Debug event on node ${name}: ${reason}`);
      this.client.shoukaku.emit("nodeRaw" as any, name, reason);
    });
  }
}
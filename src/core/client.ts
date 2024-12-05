import { EmbedBuilder, Collection } from "discord.js";
import { grave_options, owners, prefix, searchEngine } from "../config";
import BaseClient from "../tools/baseClient";
import { EventListeners } from "../interface/listners";
import CommandListners from "../interface/commands";
import { ShoukakuClient } from "../services/shoukaku.services"; // Adjust path as necessary
import { lavanodes } from "../config"; // Assuming lavanodes are configured here
import { Queue } from "../tools/shoukaku/queue";
import { Client as Dokdo } from 'dokdo';



export class Bot extends BaseClient {
    public prefix: string;
    public aliases: Collection<string, any> = new Collection();
    public commands: Collection<string, any> = new Collection();
    public cooldown: Collection<string, any> = new Collection();
    public shoukaku: ShoukakuClient; // Add shoukaku as a property
    public queue: Queue; //add queue as a property
    public searchEngine: string = searchEngine;
    public blacklistedUsers:string[] = [];
    public blacklistedGuilds:string[] = [];
    public ignoredChannels:string[] = [];
    public dokdo: any;
    public musicPanels: Collection<string, any> = new Collection();
    public globalCache: Collection<string, any> = new Collection();

    public constructor() {
        super(grave_options);
        this.shoukaku = new ShoukakuClient(this, lavanodes);
        this.queue = new Queue(this);
        this.setupBot();
        this.prefix = prefix;
        this.dokdo = new Dokdo(
            this,
            {
                aliases: ['dokdo', 'dok'],
                prefix: this.prefix,
                owners: owners
            })

    }

    public embed(): EmbedBuilder {
        return new EmbedBuilder();
    }

    private async setupBot(): Promise<void> {
        await new EventListeners(this).loadEvents();
        await new CommandListners(this, "modules").load();
    }
}

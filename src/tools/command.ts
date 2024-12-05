import { ApplicationCommandOption, PermissionResolvable } from "discord.js";
import { Bot } from "../core/client";
import { CommandOptions } from "../types/command";

export class Command {
    public client: Bot
    public name: string;
    public description: {
        content: string | null;
        usage: string | null;
        examples: string[] | null;
    };
    public aliases: string[];
    public cooldown: number;
    public args: boolean;
    public vote: boolean;
    public isPremium: boolean;
    public player: {
        voice: boolean;
        dj: boolean;
        active: boolean;
        djPerm: string | null;
    };
    public permissions: {
        dev: boolean;
        client: string[] | PermissionResolvable;
        user: string[] | PermissionResolvable;
    };
    public slashCommand: boolean;
    public options: ApplicationCommandOption[];
    public category: string | null;

    constructor(client: Bot, options: CommandOptions) {
        this.client = client
        this.name = options.name
        this.name = options.name;
        this.description = {
            content: options.description
                ? options.description.content || "No description provided"
                : "No description provided",
            usage: options.description
                ? options.description.usage || "No usage provided"
                : "No usage provided",
            examples: options.description
                ? options.description.examples || [""]
                : [""],
        };
        this.aliases = options.aliases || [];
        this.cooldown = options.cooldown || 3;
        this.args = options.args || false;
        this.vote = options.vote ?? false;
        this.isPremium = options.isPremium || false;
        this.player = {
            voice: options.player?.voice ?? false,
            dj: options.player?.dj ?? false,
            active: options.player?.active ?? false,
            djPerm: options.player?.djPerm ?? null,
        };
        this.permissions = {
            dev: options.permissions ? options.permissions.dev || false : false,
            client: options.permissions
                ? options.permissions.client || []
                : ["SendMessages", "ViewChannel", "EmbedLinks"],
            user: options.permissions ? options.permissions.user || [] : [],
        };
        this.slashCommand = options.slashCommand || false;
        this.options = options.options || [];
        this.category = options.category || "general";
    }
    public async run(_client: Bot, _message: any, _args: string[]): Promise<any> {
        return await Promise.resolve();
    }
}
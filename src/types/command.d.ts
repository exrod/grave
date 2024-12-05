export interface CommandOptions {
    name: string;
    description?: {
        content: string;
        usage: string;
        examples: string[];
    };
    aliases?: string[];
    cooldown?: number;
    args?: boolean;
    vote?: boolean;
    isPremium?: boolean;
    player?: {
        voice: boolean;
        dj: boolean;
        active: boolean;
        djPerm: string | null;
    };
    permissions?: {
        dev?: boolean;
        client?: string[] | PermissionResolvable;
        user?: string[] | PermissionResolvable;
    };
    slashCommand?: boolean;
    options?: ApplicationCommandOption[];
    category?: string;
}

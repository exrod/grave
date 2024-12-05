import { ClientOptions, Partials, PresenceData, ActivityType } from "discord.js";
import dotenv from "dotenv";

dotenv.config();

export const token: string = process.env.TOKEN || 'no token found';
export const prefix: string = process.env.PREFIX || '-';
export const searchEngine: string = process.env.searchEngine || 'spsearch'
export const owners: string[] = ["1139950107995934863", "1207107876058046494", "983787597627273267"];

export const grave_options: ClientOptions = {
    intents: [
        'Guilds',
        'GuildVoiceStates',
        'GuildMembers',
        'GuildMessages',    
        'GuildMessageTyping',
        'DirectMessages',
        'MessageContent',
        'GuildVoiceStates'
    ],
    allowedMentions: {
        parse: ['roles', 'users'],
        repliedUser: false,
    },
    partials: [
        Partials.Channel,
        Partials.GuildMember,
        Partials.Message,
        Partials.User
    ],
    failIfNotExists: false,
    waitGuildTimeout: 1000,
    closeTimeout: 2000,
    shards: 'auto'
};

export const grave_presence: PresenceData = {
    activities: [
        {
            name: '/play',
            type: ActivityType.Listening,
        },
    ],
    status: 'idle',
};

export const lavanodes = [
    {
        name: "Grave-Lavalink",
        url: "",
        auth: "",
        secure: false,
    },
];

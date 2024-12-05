import { Bot } from '../core/client';
import { moduleOptions } from '../types/module';


export default class Module {
    public client: Bot;
    public file: string;
    public name: string;
    public required: boolean;

    constructor(client: Bot, file: string, options: moduleOptions) {
        this.client = client;
        this.file = file;
        this.name = options.name;
        this.required = options.required || false;

    }
    public async load(..._args: any[]): Promise<any> {
        return await Promise.resolve();
    }
}
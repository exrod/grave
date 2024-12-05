import { CommandInteraction, Message } from "discord.js";
import { Bot } from "../../../core/client";
import { Command } from "../../../tools/command";
import { EmbedBuilder } from "discord.js";
import { db } from "../../../utils/database";


export default class AFK extends Command {
  constructor(client: Bot) {
    super(client, {
      name: "afk",
      category: "utility",
      description: {
        content: "Set or remove your AFK status",
        usage: ".afk [reason | clear]",
        examples: ["afk Busy with work", "afk clear"],
      },
      cooldown: 5,
      slashCommand: true,
    });
  }

  public async run(client: Bot, ctx: CommandInteraction | Message, args: string[]): Promise<void> {
    const userId = ctx instanceof CommandInteraction ? ctx.user.id : ctx.author.id;

    if (args[0] === "clear") {
      await db.afk.delete({ where: { userId } });
      await ctx.reply({ embeds: [new EmbedBuilder().setColor("#FFD700").setDescription("Your AFK status has been cleared.")] });
      return;
    }

    const reason = args.join(" ") || "No reason provided";
    const existingAFK = await db.afk.findUnique({ where: { userId } });

    if (existingAFK) {
      await ctx.reply({ embeds: [new EmbedBuilder().setColor("#FFD700").setDescription("You are already AFK.")] });
      return;
    }

    await db.afk.create({ data: { userId, reason } });
    await ctx.reply({ embeds: [new EmbedBuilder().setColor("#FFD700").setDescription(`<:R_:1293480423443140662> You are now AFK: ${reason}`)] });

    const messageHandler = async (message: Message) => {
      if (message.author.bot) return;

      if (message.mentions.has(message.author)) {
        const afkStatus = await db.afk.findUnique({ where: { userId } });
        if (afkStatus) {
          const embed = new EmbedBuilder()
            .setColor("#FFD700")
            .setTitle(`<:R_:1293480423443140662> ${message.author.username} is AFK`)
            .setDescription(`Reason: ${afkStatus.reason}`);

          await message.reply({ embeds: [embed] });
        }
      }

      if (message.author.id === userId) {
        const userAFK = await db.afk.findUnique({ where: { userId } });
        if (userAFK) {
          await db.afk.delete({ where: { userId } });
          await message.reply({ embeds: [new EmbedBuilder().setColor("#FFD700").setDescription("Welcome back! Your AFK status has been removed.")] });
          client.removeListener("messageCreate", messageHandler);
        }
      }
    };

    client.on("messageCreate", messageHandler);
  }
}
import { ChannelType, Collection, Message, PermissionFlagsBits, WebhookClient } from "discord.js";
import { Bot } from "../../../core/client";
import { Event } from "../../../tools/events";
import logger from "../../../utils/logger";
import { db } from "../../../utils/database";
import { LoadType } from "shoukaku";
import ms from "ms";

export default class MessageCreateListener extends Event {
  constructor(client: Bot, file: string) {
    super(client, file, {
      name: "messageCreate",
      once: false,
    });
    this.client = client;
  }

  public async run(message: Message): Promise<void> {
    if (!message || !message.author || message.author.bot) return;
    if (!message.inGuild()) {
      if(message.channel.type === ChannelType.DM) {
        const webhookUrl = process.env.DM_LOGS_HOOK;
        if (!webhookUrl) {
            logger.error("DM logging webhook URL is not defined in environment variables.");
            return;
        } 
        const webhook = new WebhookClient({ url: webhookUrl });
        const embed = this.client.embed()
            .setColor("#7289DA")
            .setTitle("DM Received")
            .setAuthor({
                name: `From: ${message.author.tag}`,
                iconURL: message.author.displayAvatarURL(),
            })
            .setDescription(`Message: ${message.content}`)
            .setTimestamp();

        webhook.send({embeds: [embed]});
      };
      return;
    };
    const user = await db.users.findFirst({
      where: {
        userId: message.author.id,
      },
    });
    if (user) {
      if(user.isBlacklisted) return;
    }
    const guild = await db.guilds.findFirst({
      where: {
        guildId: message.guildId,
      },
    });
    if (guild) {
      if(guild.isBlacklisted) return;
    }
    const ignoredChannel = await db.ignoredChannels.findFirst({
      where: {
        channelId: message.channelId,
      },
    });
    if(ignoredChannel) return;
    // let panelChannel = this.client.musicPanels.get(message.guildId);
    // if(!panelChannel) {
    //   panelChannel = db.musicPanel.findFirst({
    //     where: {
    //       channelId: message.channelId,
    //     },
    //   })
    // }
    // if(panelChannel) {
    //   let player = this.client.queue.get(message.guildId);
    //   if(!message.member?.voice.channel) {
    //     message.reply(`You must be connected to a voice channel to use the music panel.`).then((msg) => { setTimeout(() => msg.delete(), 5000) });
    //   }
    //   if(player.voiceChannelId !== message.member?.voice.channelId) {
    //     message.reply(`You must be connected to the same voice channel to use the music panel.`).then((msg) => { setTimeout(() => msg.delete(), 5000) });
    //     return;
    //   }
    //   if(!player) {
    //     player = await this.client.queue.create(message.guild, message.member?.voice.channel, message.channel);
    //   }
    //   this.client.musicPanels.set(message.guildId, panelChannel);
    //   if(message.content.startsWith(this.client.prefix)) {
    //     message.delete().catch(() => null);
    //     return;
    //   }
    //   const res = await this.client.queue.search(message.content);
    //   switch (res?.loadType){
    //     case LoadType.TRACK:
    //       const track = player.buildTrack(res.data, message.author);
    //       this.client.queue.get(message.guildId)?.queue.push(track);
    //       await this.client.queue.get(message.guildId)?.isPlaying();
    //       break;
    //   }
    // }
    
    await this.client.dokdo.run(message).catch(() => null);

    const mention = new RegExp(`^<@!?${this.client.user?.id}>( |)$`);
    if (message.content.match(mention)) {
      message.reply({ content: `My prefix for this server is \`${this.client.prefix}\`` });
    }


    const escapeRegex = (str: string): string =>
      str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    let prefix = this.client.prefix;
    if(guild){
      if(guild.prefix) {
        prefix = guild.prefix;
      }
    }
    const prefixRegex = new RegExp(
      `^(<@!?${this.client.user?.id}>|${escapeRegex(prefix)})\\s*`
    );

    if (!prefixRegex.test(message.content)) return;
    const [matchedPrefix] = message.content.match(prefixRegex)!;

    const args = message.content
      .slice(matchedPrefix.length)
      .trim()
      .split(/ +/g);
    const cmd = args.shift()!.toLowerCase();

    const command =
      this.client.commands.get(cmd) ||
      this.client.commands.get(this.client.aliases.get(cmd) as string);

    if (!command) return;

    if (command.permissions) {
      if (command.permissions.client) {
        if (
          !message.guild.members.me!.permissions.has(command.permissions.client)
        ) {
          await message.reply({
            content: "I don't have enough permissions to execute this command.",
          });
          return;
        }
      }

      if (command.permissions.user) {
        if (!message.member!.permissions.has(command.permissions.user)) {
          await message.reply({
            content: "You don't have enough permissions to use this command.",
          });
          return;
        }
      }
      if (command.player) {
        if (command.player.voice) {
          if (!message.member?.voice.channel) {
            await message.reply({
              content: `You must be connected to a voice channel to use this \`${command.name}\` command.`,
            });
            return;
          }


          if (
            !message.guild.members.me?.permissions.has(PermissionFlagsBits.Speak)
          ) {
            await message.reply({
              content: `I don't have \`CONNECT\` permissions to execute this \`${command.name}\` command.`,
            });
            return;
          }


          if (
            !message.guild.members.me?.permissions.has(PermissionFlagsBits.Speak)
          ) {
            await message.reply({
              content: `I don't have \`SPEAK\` permissions to execute this \`${command.name}\` command.`,
            });
            return;
          }

          if (
            message.member!.voice.channel?.type === ChannelType.GuildStageVoice &&
            !message.guild.members.me?.permissions.has(
              PermissionFlagsBits.RequestToSpeak
            )
          ) {
            await message.reply({
              content: `I don't have \`REQUEST TO SPEAK\` permission to execute this \`${command.name}\` command.`,
            });
            return;
          }

          if (message.guild.members.me?.voice.channel) {
            if (
              message.guild.members.me.voice.channelId !==
              message.member?.voice.channelId
            ) {
              await message.reply({
                content: `You are not connected to <#${message.guild.members.me.voice.channel.id}> to use this \`${command.name}\` command.`,
              });
              return;
            }
          }
        }
        if (command.player.active) {
          if (!this.client.queue.get(message.guildId)) {
            await message.reply({
              content: "Nothing is playing right now.",
            });
            return;
          }
          if (!this.client.queue.get(message.guildId).queue) {
            await message.reply({
              content: "Nothing is playing right now.",
            });
            return;
          }
          if (!this.client.queue.get(message.guildId).current) {
            await message.reply({
              content: "Nothing is playing right now.",
            });
            return;
          }
        }
      }
      if (command.args) {
        if (!args.length) {
          const embed = this.client
            .embed()
            .setColor('#7289DA')
            .setAuthor({
              name: `${command.category}`,
              iconURL: this.client.user?.displayAvatarURL(),
            })
            .setDescription(`${command.description.content}`)
            .setFields(
              {
                name: `Usage`,
                value: `\`${command.description.usage}\``,
              },
              {
                name: `Examples`,
                value: `\`${command.description.examples[0]}\``
              },
              {
                name: `Aliases`,
                value: `\`${command.aliases}\``,
              }
            );
          await message.reply({
            embeds: [embed],
          });
          return;
        }
      }

      // if (command.permissions.dev) {

      // }


    }

    if (!this.client.cooldown.has(cmd)) {
      this.client.cooldown.set(cmd, new Collection());
    }
    const now = Date.now();
    const timestamps = this.client.cooldown.get(cmd);

    const cooldownAmount = Math.floor(command.cooldown || 5) * 1000;

    if (!timestamps.has(message.author.id)) {
      timestamps.set(message.author.id, now);
      setTimeout(() => timestamps.delete(message.author.id), cooldownAmount);
    } else {
      const expirationTime = timestamps.get(message.author.id) + cooldownAmount;
      const timeLeft = (expirationTime - now);
      if (now < expirationTime) {
        const msg = await message.reply({
          content: `Please wait <t:${Math.floor(Math.floor(expirationTime / 1000))}:R> more second(s) before reusing the \`${cmd}\` command.`,
        });
        setTimeout(() => { msg.delete().catch(() => { }) }, timeLeft)
        return;
      }
      timestamps.set(message.author.id, now);
      setTimeout(() => timestamps.delete(message.author.id), cooldownAmount);
    }
    if (args.includes("@everyone") || args.includes("@here")) {
      await message.reply({
        content: "You can't use this command with everyone or here.",
      });
      return;
    }

    try {
      await command.run(this.client, message, args);
    } catch (error) {
      logger.error(
        `[ COMMAND ]: Failed to execute ${cmd} command. Error: ${error}`
      );

      await message.reply(
        `An error occurred while executing the command, please try again later.`
      );
      return;
    }
  }
}

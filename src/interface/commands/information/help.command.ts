import { ActionRowBuilder, StringSelectMenuBuilder, EmbedBuilder, Message, StringSelectMenuInteraction, ComponentType, ButtonBuilder, ButtonStyle } from "discord.js";
import { Bot } from "../../../core/client";
import { Command } from "../../../tools/command";

export default class Help extends Command {
  constructor(client: Bot) {
    super(client, {
      name: "help",
      category: "information",
      description: {
        content: "Shows all the available bot commands",
        usage: ".help",
        examples: ["help"],
      },
      aliases: ["h"],
      cooldown: 5,
      slashCommand: true,
    });
  }

  public async run(_client: Bot, _message: Message, _args: string[]): Promise<void> {
    const embed = new EmbedBuilder()
      .setTitle("<:R_:1293480423443140662> Help Menu")
      .setDescription("<:8319folder:1154676193354862633> Select a category from the dropdown to see available commands.")
      .setColor("#7289DA")
      .setFooter({
        iconURL: `https://cdn.discordapp.com/attachments/1304704898973044806/1305780138914611261/R_.png?ex=67078856&is=670636d6&hm=79a492d0427b181d6e2e317861b852c9bfd653b20c43426219c27f03c6a80195&`,
        text: `Made by Team grave`,
      });
    const selectMenu = new StringSelectMenuBuilder()
      .setCustomId('helpMenu')
      .setPlaceholder('Select Command Category')
      .addOptions([
        {
          label: 'Configuration',
          description: 'Configure bot settings',
          value: 'config',
          emoji: '<:config:1292463932828549221>'
        },
        {
          label: 'Information',
          description: 'Get bot and user information',
          value: 'information',
          emoji: '<:info:1292465072307835000>'
        },
        {
          label: 'Music',
          description: 'Access music commands',
          value: 'music',
          emoji: '<:music:1292465868881788958>'
        },
        {
          label: 'playlists',
          description: 'Access playlist commands',
          value: 'playlist',
          emoji: '<:8319folder:1154676193354862633>'
        },
        {
          label: 'Utility',
          description: 'General utility commands',
          value: 'utility',
          emoji: '<:utils:1292465829056876584>'
        }
      ]);
    const row = new ActionRowBuilder<StringSelectMenuBuilder>()
      .addComponents(selectMenu);

    const row2 = new ActionRowBuilder<ButtonBuilder>()
      .addComponents(
        new ButtonBuilder()
          .setLabel('Invite Me')
          .setStyle(ButtonStyle.Link)
          .setEmoji("<:add:1293478505408892939>")
          .setURL('https://discord.com/oauth2/authorize?client_id=1156619696339177525&scope=bot+applications.commands&permissions=8'),

        new ButtonBuilder()
          .setLabel('Support')
          .setStyle(ButtonStyle.Link)
          .setEmoji('<:R_:1293480423443140662>')
          .setURL('https://discord.gg/JQQHMr8jzC')
      )

    const message = await _message.reply({
      embeds: [embed],
      components: [row, row2]
    });

    const filter = (interaction: StringSelectMenuInteraction) => interaction.user.id === _message.author.id;

    const collector = message.createMessageComponentCollector({
      filter,
      componentType: ComponentType.StringSelect,
      time: 60000
    });

    collector.on('collect', async (interaction: StringSelectMenuInteraction) => {
      if (interaction.user.id !== _message.author.id) {
        interaction.reply({ content: "You are not allowed to interact with this interaction", ephemeral: true });
        return;
      };
      const selectedCategory = interaction.values[0];

      let categoryCommands:string[] = [];

      const Commands = _client.commands.filter(cmd => cmd.category === selectedCategory);

      Commands.forEach(cmd => {
        categoryCommands.push(`**${cmd.name}** - ${cmd.description.content}`);
      });


      const categoryEmbed = new EmbedBuilder()
        .setAuthor({
          name: `${this.client.user?.username}`,
          iconURL: `${this.client.user?.displayAvatarURL({})}`
        })
        .setTitle(`${selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1)} Commands`)
        .setDescription(`${categoryCommands.join('\n')}\n\n`)
        .setColor("#7289DA")
        .setFooter({
          iconURL: interaction.user.displayAvatarURL({}),
          text: "made with ❤️ by team grave",
        });

      await interaction.update({
        embeds: [categoryEmbed],
        components: [row, row2]
      });
    });

    collector.on('end', async () => {
      await message.edit({
        components: []
      });
    });
  }
}
const {
  ContainerBuilder,
  TextDisplayBuilder,
  SeparatorBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  MessageFlags,
  SlashCommandBuilder
} = require('discord.js');

const SeparatorSpacingSize = {
  Small: 1,
  Large: 2
};

module.exports = {
  name: "help",
  aliases: ["h"],
  data: new SlashCommandBuilder()
    .setName("help")
    .setDescription("Shows the bot's help menu"),
  async execute(client, ctx) {
    const isInteraction = !!ctx.commandName;

    const getAccentColor = () => {
      const color = client.color || '#2B2D31';
      if (typeof color === 'string') {
        return parseInt(color.replace('#', ''), 16);
      }
      return color;
    };

    const container = new ContainerBuilder()
      .setAccentColor(getAccentColor())
      .addTextDisplayComponents(
        new TextDisplayBuilder()
          .setContent('**Sakshi Music Bot - Help Menu**')
      )
      .addSeparatorComponents(
        new SeparatorBuilder()
          .setSpacing(SeparatorSpacingSize.Large)
          .setDivider(true)
      )
      .addTextDisplayComponents(
        new TextDisplayBuilder().setContent(
          `**<:dotred:1459597087292522751> About Bot**\n` +
          `A powerful music bot with high-quality playback and easy controls.\n` +
          `Now fully supporting Slash Commands!`
        )
      )
      .addSeparatorComponents(
        new SeparatorBuilder()
          .setSpacing(SeparatorSpacingSize.Large)
          .setDivider(true)
      )
      .addTextDisplayComponents(
        new TextDisplayBuilder().setContent(
          `**<:dotred:1459597087292522751> Music Commands**\n` +
          `\`/play\` - Play a song from YouTube/Spotify\n` +
          `\`/pause\` - Pause/Resume current track\n` +
          `\`/skip\` - Skip to next track\n` +
          `\`/stop\` - Stop playback and clear queue\n` +
          `\`/autoplay\` - Toggle YouTube autoplay\n` +
          `\`/filter\` - Apply audio effects (bass, nightcore, etc.)`
        )
      )
      .addSeparatorComponents(
        new SeparatorBuilder()
          .setSpacing(SeparatorSpacingSize.Large)
          .setDivider(true)
      )
      .addTextDisplayComponents(
        new TextDisplayBuilder().setContent(
          `**<:dotred:1459597087292522751> Utility Commands**\n` +
          `\`/help\` - Show this help menu\n`
        )
      );

    container.addSeparatorComponents(
      new SeparatorBuilder()
        .setSpacing(SeparatorSpacingSize.Large)
        .setDivider(true)
    );

    const musicButton = new ButtonBuilder()
      .setCustomId('help_music')
      .setLabel('Music')
      .setStyle(ButtonStyle.Primary);

    const utilityButton = new ButtonBuilder()
      .setCustomId('help_utility')
      .setLabel('Utility')
      .setStyle(ButtonStyle.Secondary);

    const supportButton = new ButtonBuilder()
      .setCustomId('help_support')
      .setLabel('Support')
      .setStyle(ButtonStyle.Success);

    container.addActionRowComponents(
      new ActionRowBuilder().addComponents(
        musicButton, utilityButton, supportButton
      )
    );

    return ctx.reply({
      components: [container],
      flags: MessageFlags.IsComponentsV2,
      ephemeral: isInteraction
    });
  }
};
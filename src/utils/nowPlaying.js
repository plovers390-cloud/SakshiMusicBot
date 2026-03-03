const {
  ContainerBuilder,
  TextDisplayBuilder,
  SectionBuilder,
  SeparatorBuilder,
  ThumbnailBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  StringSelectMenuBuilder,
  MessageFlags
} = require('discord.js');

// SeparatorSpacingSize enum values
const SeparatorSpacingSize = {
  Small: 1,
  Large: 2
};

module.exports = (client, track, user) => {

  const truncate = (text, max = 20) => {
    if (!text) return "Unknown Track";
    return text.length > max ? text.slice(0, max - 3) + "..." : text;
  };

  /* ===== TIME FORMAT ===== */
  const formatTime = (ms = 0) => {
    const s = Math.floor(ms / 1000);
    const m = Math.floor(s / 60);
    return `${m}:${String(s % 60).padStart(2, "0")} `;
  };

  /* ===== GET ACCENT COLOR ===== */
  const getAccentColor = () => {
    const color = client.color || '#2B2D31';
    if (typeof color === 'string') {
      return parseInt(color.replace('#', ''), 16);
    }
    return color;
  };

  /* ===== NOW PLAYING CONTAINER ===== */
  const container = new ContainerBuilder()
    .setAccentColor(getAccentColor())

    // Header
    .addTextDisplayComponents(
      new TextDisplayBuilder()
        .setContent('**Sakshi Music Bot**')
    )

    .addSeparatorComponents(
      new SeparatorBuilder()
        .setSpacing(SeparatorSpacingSize.Large)
        .setDivider(true)
    )

    // Current track section with thumbnail
    .addSectionComponents(
      new SectionBuilder()
        .addTextDisplayComponents(
          new TextDisplayBuilder().setContent(`**<:dotred:1459597087292522751> Now Playing:** ${truncate(track.title, 20)} `),
          new TextDisplayBuilder().setContent(
            `**<:dotred:1459597087292522751> Artist:** ${truncate(track.author || 'Unknown Artist', 20)} \n` +
            `**<:dotred:1459597087292522751> Duration:** ${formatTime(track.durationMs)} \n` +
            `**<:dotred:1459597087292522751> Requested by:** ${user ? user.username : 'Auto-played from queue'} `
          )
        )
        .setThumbnailAccessory(
          new ThumbnailBuilder()
            .setURL(track.thumbnail || client.user.displayAvatarURL({ size: 256 }))
            .setDescription('Track Cover')
        )
    );

  /* ===== CONTROL BUTTONS ===== */
  container.addSeparatorComponents(
    new SeparatorBuilder()
      .setSpacing(SeparatorSpacingSize.Large)
      .setDivider(true)
  );

  const pauseButton = new ButtonBuilder()
    .setCustomId('music_pause')
    .setLabel('Pause')
    .setStyle(ButtonStyle.Secondary);

  const skipButton = new ButtonBuilder()
    .setCustomId('music_skip')
    .setLabel('Skip')
    .setStyle(ButtonStyle.Secondary);

  const stopButton = new ButtonBuilder()
    .setCustomId('music_stop')
    .setLabel('Stop')
    .setStyle(ButtonStyle.Secondary);

  const autoplayButton = new ButtonBuilder()
    .setCustomId('music_autoplay')
    .setLabel('Autoplay')
    .setStyle(ButtonStyle.Secondary);

  const queueButton = new ButtonBuilder()
    .setCustomId('music_queue')
    .setLabel('📃 Queue')
    .setStyle(ButtonStyle.Secondary);

  const rewindButton = new ButtonBuilder()
    .setCustomId('music_rewind')
    .setLabel('-10s')
    .setStyle(ButtonStyle.Secondary);

  const forwardButton = new ButtonBuilder()
    .setCustomId('music_forward')
    .setLabel('+10s')
    .setStyle(ButtonStyle.Secondary);

  container.addActionRowComponents(
    new ActionRowBuilder().addComponents(
      rewindButton, pauseButton, forwardButton, skipButton, stopButton
    )
  );

  container.addActionRowComponents(
    new ActionRowBuilder().addComponents(
      autoplayButton, queueButton
    )
  );



  return {
    components: [container],
    flags: MessageFlags.IsComponentsV2
  };
};
const embed = require("../../utils/embed");
const { EmbedBuilder, SlashCommandBuilder } = require("discord.js");

module.exports = {
  name: "skip",
  aliases: ["s"],
  data: new SlashCommandBuilder()
    .setName("skip")
    .setDescription("Skips the current playing song"),
  async execute(client, ctx) {
    const isInteraction = !!ctx.commandName;
    const member = ctx.member;
    const guild = ctx.guild;
    const user = isInteraction ? ctx.user : ctx.author;

    const voiceChannel = member.voice.channel;
    if (!voiceChannel) {
      const embedData = embed("<:close:1476181740207738930> Error", "Pehle voice channel join karo", client);
      return ctx.reply({ components: embedData.components, flags: embedData.flags, ephemeral: true });
    }

    const player = client.shoukaku.players.get(guild.id);

    if (!player || !player.track) {
      const embedData = embed("<:close:1476181740207738930> Error", "Koi song nahi chal raha", client);
      return ctx.reply({ components: embedData.components, flags: embedData.flags, ephemeral: true });
    }

    const skippedTrack = player.track;
    const trackTitle = skippedTrack?.info?.title || 'Unknown';
    const trackAuthor = skippedTrack?.info?.author || 'Unknown Artist';
    const trackThumbnail = skippedTrack?.info?.artworkUrl ||
      `https://img.youtube.com/vi/${skippedTrack?.info?.identifier}/hqdefault.jpg`;

    if (client.nowPlayingMessages && client.nowPlayingMessages.has(guild.id)) {
      const oldMsg = client.nowPlayingMessages.get(guild.id);
      try {
        await oldMsg.delete();
      } catch (err) { }
      client.nowPlayingMessages.delete(guild.id);
    }

    player.stopTrack();

    const skipEmbed = new EmbedBuilder()
      .setColor(0xED4245)
      .setAuthor({ name: 'Song Skipped' })
      .setDescription(`**${trackTitle}**\nby ${trackAuthor}`)
      .setThumbnail(trackThumbnail)
      .setFooter({
        text: `Skipped by ${user.username}`,
        iconURL: user.displayAvatarURL({ size: 32 })
      })
      .setTimestamp();

    return ctx.reply({ embeds: [skipEmbed], ephemeral: isInteraction });
  }
};

const embed = require("../../utils/embed");
const { SlashCommandBuilder } = require("discord.js");

module.exports = {
  name: "stop",
  data: new SlashCommandBuilder()
    .setName("stop")
    .setDescription("Stops the music and clears the queue"),
  async execute(client, ctx) {
    const isInteraction = !!ctx.commandName;
    const guild = ctx.guild;
    const member = ctx.member;
    const voiceChannel = member.voice.channel;

    if (!voiceChannel) {
      const embedData = embed("<:close:1476181740207738930> Error", "Pehle voice channel join karo", client);
      return ctx.reply({ components: embedData.components, flags: embedData.flags, ephemeral: true });
    }

    const player = client.shoukaku.players.get(guild.id);
    if (!player) {
      const embedData = embed("<:close:1476181740207738930> Error", "Koi song nahi chal raha", client);
      return ctx.reply({ components: embedData.components, flags: embedData.flags, ephemeral: true });
    }

    if (client.nowPlayingMessages && client.nowPlayingMessages.has(guild.id)) {
      const oldMsg = client.nowPlayingMessages.get(guild.id);
      try {
        await oldMsg.delete();
      } catch (err) { }
      client.nowPlayingMessages.delete(guild.id);
    }

    client.clearInactivityTimer(guild.id);
    client.playerManager.clearQueue(guild.id);
    player.stopTrack();

    try {
      await client.rest.put(`/channels/${voiceChannel.id}/voice-status`, {
        body: { status: "" }
      });
    } catch (err) { }

    try {
      if (player.connection) {
        player.connection.disconnect();
      }
      client.shoukaku.leaveVoiceChannel(guild.id);
    } catch (err) { }

    client.shoukaku.players.delete(guild.id);

    const embedData = embed("<:Tick:1476181795102920867> Stopped", "Music stopped and queue cleared", client);
    return ctx.reply({
      components: embedData.components,
      flags: embedData.flags,
      ephemeral: isInteraction
    });
  }
};

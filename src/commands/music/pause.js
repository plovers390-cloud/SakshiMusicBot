const embed = require("../../utils/embed");
const { SlashCommandBuilder } = require("discord.js");

module.exports = {
  name: "pause",
  data: new SlashCommandBuilder()
    .setName("pause")
    .setDescription("Pauses or resumes the current playing song"),
  async execute(client, ctx) {
    const isInteraction = !!ctx.commandName;
    const guild = ctx.guild;

    const player = client.shoukaku.players.get(guild.id);
    if (!player) {
      const embedData = embed("<:close:1476181740207738930> Error", "Koi song nahi chal raha", client);
      return ctx.reply({ components: embedData.components, flags: embedData.flags, ephemeral: true });
    }

    player.setPaused(!player.paused);

    const embedData = embed(player.paused ? "<:Tick:1476181795102920867> ⏸ Paused" : "<:Tick:1476181795102920867> Resumed", player.paused ? "Music paused" : "Music resumed", client);
    return ctx.reply({
      components: embedData.components,
      flags: embedData.flags,
      ephemeral: isInteraction
    });
  }
};

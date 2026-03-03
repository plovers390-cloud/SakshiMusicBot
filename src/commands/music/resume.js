const embed = require("../../utils/embed");
const { SlashCommandBuilder } = require("discord.js");

module.exports = {
  name: "resume",
  aliases: ["r"],
  data: new SlashCommandBuilder()
    .setName("resume")
    .setDescription("Resumes the paused music"),
  async execute(client, ctx) {
    const isInteraction = !!ctx.commandName;
    const guild = ctx.guild;

    const player = client.shoukaku.players.get(guild.id);
    if (!player) {
      const embedData = embed("<:close:1476181740207738930> Error", "Koi song nahi chal raha", client);
      return ctx.reply({ components: embedData.components, flags: embedData.flags, ephemeral: true });
    }

    if (!player.paused) {
      const embedData = embed("⚠️ Already Playing", "Music already chal raha hai", client);
      return ctx.reply({ components: embedData.components, flags: embedData.flags, ephemeral: true });
    }

    player.setPaused(false);

    const embedData = embed("<:Tick:1476181795102920867> ▶️ Resumed", "Music resumed", client);
    return ctx.reply({
      components: embedData.components,
      flags: embedData.flags,
      ephemeral: isInteraction
    });
  }
};

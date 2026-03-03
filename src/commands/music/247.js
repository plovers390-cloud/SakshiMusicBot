const embed = require("../../utils/embed");
const mode247 = require("../../utils/247");
const { SlashCommandBuilder } = require("discord.js");

module.exports = {
  name: "247",
  aliases: ["stay", "alwayson"],
  data: new SlashCommandBuilder()
    .setName("247")
    .setDescription("Toggles 24/7 mode (Bot stays in voice channel)"),
  async execute(client, ctx) {
    const isInteraction = !!ctx.commandName;
    const guildId = ctx.guild.id;
    const isEnabled = mode247.has(guildId);

    if (isEnabled) {
      await mode247.disable(guildId);
      const embedData = embed("<:Tick:1476181795102920867> 24/7 Mode Disabled", "Bot will now disconnect when the queue is empty or if it's left alone.", client);
      return ctx.reply({
        components: embedData.components,
        flags: embedData.flags,
        ephemeral: isInteraction
      });
    } else {
      await mode247.enable(guildId);
      const embedData = embed("<:Tick:1476181795102920867> 24/7 Mode Enabled", "Bot will now stay in the voice channel even after the queue is empty.", client);
      return ctx.reply({
        components: embedData.components,
        flags: embedData.flags,
        ephemeral: isInteraction
      });
    }
  },
};

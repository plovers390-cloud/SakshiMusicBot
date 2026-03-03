const embed = require("../../utils/embed");
const { SlashCommandBuilder } = require("discord.js");

module.exports = {
    name: "autoplay",
    aliases: ["ap", "auto"],
    data: new SlashCommandBuilder()
        .setName("autoplay")
        .setDescription("Toggles YouTube style autoplay mode on or off"),
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
            const embedData = embed("<:close:1476181740207738930> Error", "Koi song play nahi ho raha hai", client);
            return ctx.reply({ components: embedData.components, flags: embedData.flags, ephemeral: true });
        }

        const currentAutoplay = client.playerManager.getAutoplay(guild.id);
        const newAutoplay = !currentAutoplay;

        client.playerManager.setAutoplay(guild.id, newAutoplay);

        const embedData = embed(
            "🔄 Autoplay",
            `Autoplay mode ab **${newAutoplay ? "ON" : "OFF"}** hai.\nYouTube recommendations ke hisaab se songs play honge.`,
            client
        );

        return ctx.reply({ components: embedData.components, flags: embedData.flags, ephemeral: isInteraction });
    }
};

const embed = require("../../utils/embed");
const { SlashCommandBuilder } = require("discord.js");

module.exports = {
    name: "ping",
    aliases: ["latency"],
    data: new SlashCommandBuilder()
        .setName("ping")
        .setDescription("Check the bot's latency and API ping"),
    async execute(client, ctx) {
        const isInteraction = !!ctx.commandName;

        let msg;
        if (isInteraction) {
            msg = await ctx.reply({ content: "Pinging...", fetchReply: true, ephemeral: false });
        } else {
            msg = await ctx.reply("Pinging...");
        }

        const latency = msg.createdTimestamp - ctx.createdTimestamp;
        const apiLatency = Math.round(client.ws.ping);

        const embedData = embed(
            "🏓 Pong!",
            `**Bot Latency:** \`${latency}ms\`\n**API Latency:** \`${apiLatency}ms\``
        );

        if (isInteraction) {
            await ctx.editReply({
                content: "",
                components: embedData.components,
                flags: embedData.flags
            });
        } else {
            await msg.edit({
                content: null,
                components: embedData.components,
                flags: embedData.flags
            });
        }
    },
};

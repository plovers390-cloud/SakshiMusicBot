const embed = require("../../utils/embed");
const mode247 = require("../../utils/247");
const { SlashCommandBuilder } = require("discord.js");

module.exports = {
    name: "stats",
    aliases: ["info", "botinfo"],
    data: new SlashCommandBuilder()
        .setName("stats")
        .setDescription("Shows bot statistics and developer info"),
    async execute(client, ctx) {
        const isInteraction = !!ctx.commandName;
        const guildId = ctx.guild.id;

        const ping = Math.round(client.ws.ping);
        const is247Enabled = mode247.has(guildId);

        // Developer information
        const devName = "Nothing Dev"; // or "Aditya kumar aka Nothing💌" as specified
        const language = "JavaScript (Node.js)";

        // Optional: get basic system stats
        const uptime = Math.floor(process.uptime());
        const hours = Math.floor(uptime / 3600);
        const minutes = Math.floor((uptime % 3600) / 60);
        const seconds = uptime % 60;
        const uptimeStr = `${hours}h ${minutes}m ${seconds}s`;

        const description =
            `**Developer:** ${devName}\n` +
            `**Language:** ${language}\n` +
            `**Ping:** \`${ping}ms\`\n` +
            `**24/7 Mode:** ${is247Enabled ? '🟢 On' : '🔴 Off'}\n` +
            `**Uptime:** \`${uptimeStr}\``;

        const embedData = embed("Bot Statistics", description, client);

        return ctx.reply({
            components: embedData.components,
            flags: embedData.flags,
            ephemeral: false // Anyone can see the stats publicly
        });
    }
};

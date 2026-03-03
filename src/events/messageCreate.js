const config = require("../config/config");

module.exports = {
  name: "messageCreate",
  async execute(client, message) {
    // Ignore bots
    if (message.author.bot) return;

    // Determine the prefix (either the config prefix or bot mention)
    const mentionPrefix = `<@${client.user.id}>`;
    const mentionPrefixNick = `<@!${client.user.id}>`;
    const configPrefix = config.prefix.toLowerCase();

    let usedPrefix = null;
    const lowerContent = message.content.toLowerCase();

    if (lowerContent.startsWith(configPrefix)) {
      usedPrefix = config.prefix; // To slice correctly based on original length
    } else if (message.content.startsWith(mentionPrefix)) {
      usedPrefix = mentionPrefix;
    } else if (message.content.startsWith(mentionPrefixNick)) {
      usedPrefix = mentionPrefixNick;
    }

    // Check if the message starts with any valid prefix
    if (!usedPrefix) return;

    // Parse command and args
    const args = message.content.slice(usedPrefix.length).trim().split(/ +/);
    const commandName = args.shift().toLowerCase();

    console.log(`📨 Command: ${commandName}, Args:`, args);

    // Get command
    const command = client.commands.get(commandName) ||
      client.commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName));

    if (!command) return;

    try {
      await command.execute(client, message, args);
    } catch (error) {
      console.error(`❌ Error executing ${commandName}:`, error);
      message.reply("<:close:1476181740207738930> Command execute karte waqt error aaya!");
    }
  }
};
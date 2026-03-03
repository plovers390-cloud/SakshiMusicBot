const { set247Status, getAll247Servers } = require('../database/supabase');

const active247 = new Set();

module.exports = {
  enable: async (guildId) => {
    active247.add(guildId);
    await set247Status(guildId, true);
  },
  disable: async (guildId) => {
    active247.delete(guildId);
    await set247Status(guildId, false);
  },
  has: (guildId) => active247.has(guildId),

  // Initialization function to call on bot startup
  init247Modes: async () => {
    console.log("🔄 Loading 24/7 modes from database...");
    const guilds = await getAll247Servers();
    guilds.forEach(guildId => active247.add(guildId));
    console.log(`✅ Loaded ${guilds.length} guilds with 24/7 mode enabled`);
  }
};

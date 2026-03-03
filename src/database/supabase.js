const { Client } = require('pg');
require('dotenv').config();

const dbUrl = process.env.SUPABASE_URL || process.env.DATABASE_URL;

let client = null;

if (dbUrl) {
    client = new Client({
        connectionString: dbUrl.trim(),
        ssl: { rejectUnauthorized: false } // Required for Supabase standard connections
    });

    client.connect()
        .then(() => console.log("✅ PostgreSQL Server connected successfully"))
        .catch(err => console.error("❌ PostgreSQL Connection Error:", err.message));
} else {
    console.log("⚠️ Database credentials missing. Please set SUPABASE_URL in .env");
}

module.exports = {
    getDbClient: () => client,

    // Get all active 24/7 guilds
    getAll247Servers: async () => {
        if (!client) return [];
        try {
            // make sure table exists
            await client.query(`
        CREATE TABLE IF NOT EXISTS guild_settings (
          guild_id TEXT PRIMARY KEY,
          is_247_enabled BOOLEAN DEFAULT false
        );
      `);

            const res = await client.query('SELECT guild_id FROM guild_settings WHERE is_247_enabled = true');
            return res.rows.map(row => row.guild_id);
        } catch (err) {
            console.error("Exception fetching 24/7 servers:", err.message);
            return [];
        }
    },

    // Set 24/7 status for a guild
    set247Status: async (guildId, isEnabled) => {
        if (!client) return false;
        try {
            await client.query(`
        INSERT INTO guild_settings (guild_id, is_247_enabled) 
        VALUES ($1, $2)
        ON CONFLICT (guild_id) DO UPDATE 
        SET is_247_enabled = EXCLUDED.is_247_enabled;
      `, [guildId, isEnabled]);

            return true;
        } catch (err) {
            console.error(`Exception updating 24/7 status for ${guildId}:`, err.message);
            return false;
        }
    }
};

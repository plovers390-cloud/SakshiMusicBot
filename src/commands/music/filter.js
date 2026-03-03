const {
  ActionRowBuilder,
  StringSelectMenuBuilder,
  ComponentType,
  SlashCommandBuilder
} = require("discord.js");
const embed = require("../../utils/embed");

module.exports = {
  name: "filter",
  aliases: ["f", "bass", "bassboost", "nightcore", "vaporwave", "lofi"],
  data: new SlashCommandBuilder()
    .setName("filter")
    .setDescription("Apply an audio filter to the current song")
    .addStringOption(option =>
      option.setName("name")
        .setDescription("Filter name (e.g., bass, nightcore, off)")
        .setRequired(false)
    ),
  async execute(client, ctx, args) {
    const isInteraction = !!ctx.commandName;
    const guild = ctx.guild;
    const member = ctx.member;
    const user = isInteraction ? ctx.user : ctx.author;

    if (!member.voice.channel) {
      const embedData = embed("❌ Error", "Pehle voice channel join karo", client);
      return isInteraction ? ctx.reply({ components: embedData.components, flags: embedData.flags, ephemeral: true }) : ctx.channel.send({ components: embedData.components, flags: embedData.flags });
    }

    const player = client.shoukaku.players.get(guild.id);
    if (!player) {
      const embedData = embed(" Error", "Koi song nahi chal raha", client);
      return isInteraction ? ctx.reply({ components: embedData.components, flags: embedData.flags, ephemeral: true }) : ctx.channel.send({ components: embedData.components, flags: embedData.flags });
    }

    const filters = {
      reset: { label: "Reset", description: "Clear all filters", emoji: "🗑️", value: "reset", filter: {} },
      bass: {
        label: "Surround Bass", description: "3D Club Bass - DJ all around you!", emoji: "🔊", value: "bass",
        filter: {
          equalizer: [
            { band: 0, gain: 0.50 }, { band: 1, gain: 0.40 }, { band: 2, gain: 0.25 },
            { band: 3, gain: 0.15 }, { band: 4, gain: 0.05 }, { band: 5, gain: -0.05 },
            { band: 6, gain: -0.10 }, { band: 7, gain: 0.05 }, { band: 8, gain: 0.15 },
            { band: 9, gain: 0.20 }, { band: 10, gain: 0.25 }, { band: 11, gain: 0.25 },
            { band: 12, gain: 0.20 }, { band: 13, gain: 0.15 }
          ],
          rotation: { rotationHz: 0.15 },
          tremolo: { frequency: 1.5, depth: 0.08 }
        }
      },
      nightcore: {
        label: "Nightcore", description: "Speed up and pitch up", emoji: "🐿️", value: "nightcore",
        filter: { timescale: { speed: 1.2999999523162842, pitch: 1.2999999523162842, rate: 1 } }
      },
      vaporwave: {
        label: "Vaporwave", description: "Slow down and pitch down", emoji: "🌫️", value: "vaporwave",
        filter: { timescale: { speed: 0.8500000238418579, pitch: 0.800000011920929, rate: 1 } }
      },
      soft: {
        label: "Soft", description: "Remove high frequencies", emoji: "☁️", value: "soft",
        filter: { lowPass: { smoothing: 20.0 } }
      },
      pop: {
        label: "Pop", description: "Boost mid frequencies", emoji: "🎤", value: "pop",
        filter: {
          equalizer: [
            { band: 0, gain: -0.25 }, { band: 1, gain: 0.48 }, { band: 2, gain: 0.59 },
            { band: 3, gain: 0.72 }, { band: 4, gain: 0.56 }, { band: 5, gain: 0.15 },
            { band: 6, gain: -0.24 }, { band: 7, gain: -0.24 }, { band: 8, gain: -0.16 },
            { band: 9, gain: -0.16 }, { band: 10, gain: 0 }, { band: 11, gain: 0 },
            { band: 12, gain: 0 }, { band: 13, gain: 0 }
          ]
        }
      },
      treblebass: {
        label: "Treble Bass", description: "Boost high and low frequencies", emoji: "🎸", value: "treblebass",
        filter: {
          equalizer: [
            { band: 0, gain: 0.6 }, { band: 1, gain: 0.67 }, { band: 2, gain: 0.67 },
            { band: 3, gain: 0 }, { band: 4, gain: -0.5 }, { band: 5, gain: 0.15 },
            { band: 6, gain: -0.45 }, { band: 7, gain: 0.23 }, { band: 8, gain: 0.35 },
            { band: 9, gain: 0.45 }, { band: 10, gain: 0.55 }, { band: 11, gain: 0.6 },
            { band: 12, gain: 0.55 }, { band: 13, gain: 0 }
          ]
        }
      },
      eightd: {
        label: "8D", description: "Simulate 8D audio", emoji: "🎧", value: "eightd",
        filter: { rotation: { rotationHz: 0.2 } }
      },
      karaoke: {
        label: "Karaoke", description: "Remove vocals", emoji: "🎤", value: "karaoke",
        filter: { karaoke: { level: 1.0, monoLevel: 1.0, filterBand: 220.0, filterWidth: 100.0 } }
      },
      dj: {
        label: "DJ", description: "Heavy club DJ with punchy bass & crisp highs", emoji: "🎧", value: "dj",
        filter: {
          equalizer: [
            { band: 0, gain: 0.40 }, { band: 1, gain: 0.35 }, { band: 2, gain: 0.20 },
            { band: 3, gain: 0.05 }, { band: 4, gain: -0.10 }, { band: 5, gain: -0.15 },
            { band: 6, gain: -0.10 }, { band: 7, gain: 0.05 }, { band: 8, gain: 0.15 },
            { band: 9, gain: 0.20 }, { band: 10, gain: 0.25 }, { band: 11, gain: 0.25 },
            { band: 12, gain: 0.20 }, { band: 13, gain: 0.15 }
          ],
          timescale: { speed: 1.06, pitch: 1.0, rate: 1.0 },
          tremolo: { frequency: 2.0, depth: 0.03 }
        }
      },
      lofi: {
        label: "Lofi", description: "Chill lofi vibes with warm bass & smooth highs", emoji: "🌙", value: "lofi",
        filter: {
          equalizer: [
            { band: 0, gain: 0.3 }, { band: 1, gain: 0.35 }, { band: 2, gain: 0.25 },
            { band: 3, gain: 0.2 }, { band: 4, gain: 0.1 }, { band: 5, gain: 0.05 },
            { band: 6, gain: 0.0 }, { band: 7, gain: -0.1 }, { band: 8, gain: -0.15 },
            { band: 9, gain: -0.2 }, { band: 10, gain: -0.25 }, { band: 11, gain: -0.3 },
            { band: 12, gain: -0.3 }, { band: 13, gain: -0.25 }
          ],
          lowPass: { smoothing: 14.0 },
          timescale: { speed: 0.95, pitch: 0.93, rate: 1.0 },
          tremolo: { frequency: 0.3, depth: 0.08 }
        }
      }
    };

    const filterName = isInteraction ? ctx.options.getString("name")?.toLowerCase() : args[0]?.toLowerCase();

    if (filterName === 'off' || filterName === 'reset') {
      try {
        await player.setFilters({});
        const embedData = embed("<:Tick:1476181795102920867> Filter Reset", "Filters removed!", client);
        return isInteraction ? ctx.reply({ components: embedData.components, flags: embedData.flags, ephemeral: true }) : ctx.channel.send({ components: embedData.components, flags: embedData.flags });
      } catch (err) {
        return isInteraction ? ctx.reply({ content: "Failed to reset filters.", ephemeral: true }) : ctx.channel.send("Failed to reset filters.");
      }
    }

    if (filterName && filters[filterName]) {
      const selectedFilter = filters[filterName];
      try {
        await player.setFilters(selectedFilter.filter);
        const embedData = embed("<:Tick:1476181795102920867> Filter Applied", `Filter **${selectedFilter.label}** apply kar diya!`, client);
        return isInteraction ? ctx.reply({ components: embedData.components, flags: embedData.flags, ephemeral: true }) : ctx.channel.send({
          components: embedData.components,
          flags: embedData.flags
        });
      } catch (err) {
        const embedData = embed("<:TickNo:1452330293401747526> Error", "Filter apply karne mein error aaya", client);
        return isInteraction ? ctx.reply({ components: embedData.components, flags: embedData.flags, ephemeral: true }) : ctx.channel.send({ components: embedData.components, flags: embedData.flags });
      }
    }

    const options = Object.values(filters).map(f => ({
      label: f.label, description: f.description, emoji: f.emoji, value: f.value
    }));

    const selectMenu = new StringSelectMenuBuilder()
      .setCustomId("filter_select")
      .setPlaceholder("Select an audio filter")
      .addOptions(options);

    const row = new ActionRowBuilder().addComponents(selectMenu);
    const embedData = embed("🎚️ Audio Filters", "Select a filter from the menu below.\nNote: Filters may take a few seconds to apply.", client);
    embedData.components[0].addActionRowComponents(row);

    let reply;
    if (isInteraction) {
      reply = await ctx.reply({ components: embedData.components, flags: embedData.flags, ephemeral: true });
    } else {
      reply = await ctx.channel.send({ components: embedData.components, flags: embedData.flags });
    }

    if (!reply && isInteraction) {
      reply = await ctx.fetchReply();
    }

    const collector = reply.createMessageComponentCollector({
      componentType: ComponentType.StringSelect,
      time: 60000,
      filter: (i) => i.user.id === user.id
    });

    collector.on("collect", async (interaction) => {
      const selectedValue = interaction.values[0];
      const selectedFilter = filters[selectedValue];
      if (!selectedFilter) return;

      try {
        await interaction.deferUpdate();
        await player.setFilters(selectedFilter.filter || {});
        const updateEmbed = embed("<:Tick:1476181795102920867> Filter Applied", `Filter set to: **${selectedFilter.label}**`, client);
        updateEmbed.components[0].addActionRowComponents(row);

        await interaction.editReply({ components: updateEmbed.components, flags: updateEmbed.flags });
      } catch (error) { }
    });

    collector.on("end", () => {
      const disabledRow = new ActionRowBuilder().addComponents(selectMenu.setDisabled(true));
      const expiredEmbed = embed("🎚️ Audio Filters", "Menu expired. Use the filter command again.", client);
      expiredEmbed.components[0].addActionRowComponents(disabledRow);
      reply.edit({ components: expiredEmbed.components, flags: expiredEmbed.flags }).catch(() => { });
    });
  }
};

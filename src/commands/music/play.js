const embed = require("../../utils/embed");
const nowPlaying = require("../../utils/nowPlaying");
const { showQueueEmbed } = require("./queue");
const { EmbedBuilder, SlashCommandBuilder } = require("discord.js");

module.exports = {
  name: "play",
  aliases: ["p"],
  data: new SlashCommandBuilder()
    .setName("play")
    .setDescription("Plays a song from YouTube, Spotify, etc.")
    .addStringOption(option =>
      option.setName("query")
        .setDescription("Song name or URL")
        .setRequired(true)
    ),
  async execute(client, ctx, args) {
    const isInteraction = !!ctx.commandName;
    const member = ctx.member;
    const guild = ctx.guild;
    const channel = ctx.channel;
    const user = isInteraction ? ctx.user : ctx.author;

    // 1️⃣ Voice channel check
    const voiceChannel = member.voice.channel;
    if (!voiceChannel) {
      const embedData = embed("<:close:1476181740207738930> Error", "Pehle voice channel join karo", client);
      return ctx.reply({ components: embedData.components, flags: embedData.flags, ephemeral: true });
    }

    // 2️⃣ Query check
    const query = isInteraction ? ctx.options.getString("query") : args.join(" ");
    if (!query) {
      const embedData = embed("<:close:1476181740207738930> Error", "Song name ya URL do", client);
      return ctx.reply({ components: embedData.components, flags: embedData.flags, ephemeral: true });
    }

    // 3️⃣ Lavalink node
    const node = client.shoukaku.nodes.get("main");
    if (!node) {
      const embedData = embed("<:close:1476181740207738930> Error", "Lavalink node ready nahi hai", client);
      return ctx.reply({ components: embedData.components, flags: embedData.flags, ephemeral: true });
    }

    try {
      // 4️⃣ Send "Searching..." embed
      const searchingEmbed = new EmbedBuilder()
        .setColor(0x880808)
        .setDescription('<:searchS:1476180998034296913> **Searching a song...**');

      let searchingMsg;
      if (isInteraction) {
        await ctx.reply({ embeds: [searchingEmbed] });
      } else {
        searchingMsg = await channel.send({ embeds: [searchingEmbed] });
      }

      // 5️⃣ Resolve track
      const isUrl = query.startsWith("http");

      let isAutoPlaylist = false;
      let actualQuery = query;
      if (!isUrl && query.toLowerCase().endsWith("playlist")) {
        isAutoPlaylist = true;
        // Remove 'playlist' word to get better search results
        actualQuery = query.toLowerCase().replace("playlist", "").trim();
        if (!actualQuery) actualQuery = "top songs mix"; // fallback
      }

      const searchQuery = isUrl ? query : `ytsearch:${actualQuery}`;
      const result = await node.rest.resolve(searchQuery);

      // ✅ Delete searching message
      if (isInteraction) {
        try { await ctx.deleteReply(); } catch { }
      } else if (searchingMsg) {
        try { await searchingMsg.delete(); } catch { }
      }

      let tracksToQueue = [];
      let isPlaylistLoaded = false;
      let playlistName = "";

      if (result.loadType === "track") {
        tracksToQueue = [result.data];
      } else if (result.loadType === "playlist") {
        tracksToQueue = result.data.tracks;
        isPlaylistLoaded = true;
        playlistName = result.data.info.name;
      } else if (result.loadType === "search") {
        if (isAutoPlaylist) {
          tracksToQueue = result.data.slice(0, 15); // Auto playlist gets 15 songs
          isPlaylistLoaded = true;
          playlistName = `${actualQuery} Mix`;
        } else {
          tracksToQueue = [result.data[0]]; // Normal search gets 1 song
        }
      }

      if (!tracksToQueue || !tracksToQueue.length) {
        const embedData = embed("<:close:1476181740207738930> Error", "Koi song nahi mila", client);
        return isInteraction ? channel.send({ components: embedData.components, flags: embedData.flags }) : ctx.reply({ components: embedData.components, flags: embedData.flags });
      }

      const firstTrack = tracksToQueue[0];

      // 5️⃣ Player check
      let player = client.shoukaku.players.get(guild.id);
      const isPlaying = player && client.playerManager.getCurrentTrack(guild.id);

      // 6️⃣ Create player
      if (!player) {
        player = await client.shoukaku.joinVoiceChannel({
          guildId: guild.id,
          channelId: voiceChannel.id,
          shardId: guild.shardId ?? 0,
          deaf: true
        });
        client.setupPlayerEvents(player, channel);
      }

      // 7️⃣ Queue or Play
      let addedToQueueCount = 0;

      if (isPlaying) {
        if (isPlaylistLoaded) {
          for (const t of tracksToQueue) {
            client.playerManager.addTrack(guild.id, t);
            addedToQueueCount++;
          }
          const embedData = embed("🎶 Playlist Added", `**${playlistName || 'Playlist'}** - \`${addedToQueueCount}\` tracks added to queue!`, client);
          channel.send({ components: embedData.components, flags: embedData.flags });
        } else {
          client.playerManager.addTrack(guild.id, firstTrack);
          const position = client.playerManager.getQueueLength(guild.id);
          showQueueEmbed(channel, firstTrack, position, client);
        }

        if (isInteraction) {
          ctx.reply({ content: `**Added to Queue**`, ephemeral: true }).catch(() => { });
        }
      } else {
        client.clearInactivityTimer(guild.id);

        await player.playTrack({
          track: { encoded: firstTrack.encoded }
        });

        client.playerManager.setCurrentTrack(guild.id, firstTrack);

        // Queue the rest if it's a playlist
        if (tracksToQueue.length > 1) {
          for (let i = 1; i < tracksToQueue.length; i++) {
            client.playerManager.addTrack(guild.id, tracksToQueue[i]);
            addedToQueueCount++;
          }
          if (isPlaylistLoaded) {
            const embedData = embed("🎶 Playlist Playing", `**${playlistName || 'Playlist'}** - \`1\` playing, \`${addedToQueueCount}\` added to queue!`, client);
            channel.send({ components: embedData.components, flags: embedData.flags });
          }
        }

        try {
          await client.rest.put(`/channels/${voiceChannel.id}/voice-status`, {
            body: { status: `🎵 ${firstTrack.info.title}` }
          });
        } catch (err) { }

        const ui = nowPlaying(
          client,
          {
            title: firstTrack.info.title,
            author: firstTrack.info.author,
            durationMs: firstTrack.info.length,
            thumbnail: firstTrack.info.artworkUrl || `https://img.youtube.com/vi/${firstTrack.info.identifier}/hqdefault.jpg`,
            isStream: firstTrack.info.isStream,
            url: firstTrack.info.uri,
            identifier: firstTrack.info.identifier
          },
          user
        );

        const nowPlayingMsg = await channel.send({
          components: ui.components,
          flags: ui.flags
        });

        if (!client.nowPlayingMessages) {
          client.nowPlayingMessages = new Map();
        }
        client.nowPlayingMessages.set(guild.id, nowPlayingMsg);

        if (isInteraction) {
          ctx.reply({ content: "**Playing Song**", ephemeral: true }).catch(() => { });
        }
      }

    } catch (error) {
      console.error("<:close:1476181740207738930> Play command error:", error);
      const embedData = embed("<:close:1476181740207738930> Error", `Kuch galat ho gaya: ${error.message}`, client);
      if (isInteraction) {
        return ctx.reply({ components: embedData.components, flags: embedData.flags, ephemeral: true }).catch(() => { });
      } else {
        return ctx.reply({ components: embedData.components, flags: embedData.flags });
      }
    }
  }
};

class PlayerManager {
  constructor() {
    this.queues = new Map(); // guildId -> queue array
    this.queues = new Map(); // guildId -> queue array
    this.currentTracks = new Map(); // guildId -> current track object
  }

  createQueue(guildId) {
    if (!this.queues.has(guildId)) {
      this.queues.set(guildId, []);
    }
    return this.queues.get(guildId);
  }

  getQueue(guildId) {
    return this.queues.get(guildId) || [];
  }

  addTrack(guildId, track) {
    const queue = this.createQueue(guildId);
    queue.push(track);
    return queue;
  }

  removeTrack(guildId) {
    const queue = this.getQueue(guildId);
    return queue.shift();
  }

  clearQueue(guildId) {
    this.queues.delete(guildId);
  }

  getQueueLength(guildId) {
    return this.getQueue(guildId).length;
  }



  // === AUTOPLAY MODE ===
  setAutoplay(guildId, state) {
    if (!this.autoplayModes) this.autoplayModes = new Map();
    this.autoplayModes.set(guildId, state);
  }

  getAutoplay(guildId) {
    if (!this.autoplayModes) this.autoplayModes = new Map();
    return this.autoplayModes.get(guildId) || false;
  }

  // === HISTORY ===
  addHistory(guildId, trackId) {
    if (!this.histories) this.histories = new Map();
    if (!this.histories.has(guildId)) {
      this.histories.set(guildId, []);
    }
    const history = this.histories.get(guildId);
    history.push(trackId);
    // Keep last 5 songs
    if (history.length > 5) {
      history.shift();
    }
  }

  getHistory(guildId) {
    if (!this.histories) this.histories = new Map();
    return this.histories.get(guildId) || [];
  }

  // === CURRENT TRACK ===
  setCurrentTrack(guildId, track) {
    this.currentTracks.set(guildId, track);
    if (track && track.info && track.info.identifier) {
      this.addHistory(guildId, track.info.identifier);
    }
  }

  getCurrentTrack(guildId) {
    return this.currentTracks.get(guildId) || null;
  }
}

module.exports = PlayerManager;
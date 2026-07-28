const EventEmitter = require("events");

/**
 * In-memory matchmaking queue. Deliberately decoupled from Socket.IO —
 * it just emits "match" and "queueUpdate" events; socket/battleHandlers.js
 * wires those into actual room creation and client notifications.
 *
 * NOTE: this state lives in a single Node process's memory. That's fine for
 * a single-instance deployment (which is what Render/Railway gives you by
 * default), but if this app is ever scaled to multiple instances, the queue
 * needs to move to Redis (or similar) so all instances share one queue.
 */
class MatchmakingQueue extends EventEmitter {
  constructor() {
    super();
    this.queue = new Map(); // userId -> { userId, username, name, rating, socketId, joinedAt }
    this.matchInterval = null;
  }

  start(intervalMs = 2000) {
    if (this.matchInterval) return;
    this.matchInterval = setInterval(() => this.tryMatchAll(), intervalMs);
  }

  stop() {
    clearInterval(this.matchInterval);
    this.matchInterval = null;
  }

  isQueued(userId) {
    return this.queue.has(userId.toString());
  }

  addToQueue(player) {
    this.queue.set(player.userId.toString(), { ...player, joinedAt: Date.now() });
    this.emitQueueUpdate();
  }

  removeFromQueue(userId) {
    const removed = this.queue.delete(userId.toString());
    if (removed) this.emitQueueUpdate();
    return removed;
  }

  size() {
    return this.queue.size;
  }

  emitQueueUpdate() {
    this.emit("queueUpdate", { size: this.queue.size });
  }

  /**
   * Rating-search-window widens the longer someone waits, so nobody queues
   * forever just because the pool is thin — after 30s, effectively anyone
   * gets matched with anyone.
   */
  static searchWindowFor(waitedMs) {
    const waitedSec = waitedMs / 1000;
    return Math.min(100 + waitedSec * 20, 1000);
  }

  /**
   * Scans the queue and pairs up every mutually-compatible match it can find
   * in one pass. Greedy, oldest-first — not globally optimal, but stable and
   * good enough for a queue that's realistically a handful of people deep.
   */
  tryMatchAll() {
    const players = [...this.queue.values()].sort((a, b) => a.joinedAt - b.joinedAt);
    const matched = new Set();

    for (let i = 0; i < players.length; i += 1) {
      const p1 = players[i];
      if (matched.has(p1.userId)) continue;

      let bestMatch = null;
      let bestDiff = Infinity;

      for (let j = i + 1; j < players.length; j += 1) {
        const p2 = players[j];
        if (matched.has(p2.userId)) continue;

        const diff = Math.abs(p1.rating - p2.rating);
        const p1Window = MatchmakingQueue.searchWindowFor(Date.now() - p1.joinedAt);
        const p2Window = MatchmakingQueue.searchWindowFor(Date.now() - p2.joinedAt);
        const allowedWindow = Math.max(p1Window, p2Window);

        if (diff <= allowedWindow && diff < bestDiff) {
          bestMatch = p2;
          bestDiff = diff;
        }
      }

      if (bestMatch) {
        matched.add(p1.userId);
        matched.add(bestMatch.userId);
        this.queue.delete(p1.userId);
        this.queue.delete(bestMatch.userId);
        this.emit("match", { player1: p1, player2: bestMatch });
      }
    }

    if (matched.size > 0) this.emitQueueUpdate();
  }

  /**
   * Rough estimate shown to the user while they wait: based on current queue
   * depth, not a real historical average (we don't have enough volume in a
   * student project to make a historical estimate meaningful).
   */
  estimateWaitSeconds(userId) {
    const player = this.queue.get(userId.toString());
    if (!player) return 0;
    const waitedSec = (Date.now() - player.joinedAt) / 1000;
    const queueDepth = this.queue.size;
    const base = queueDepth <= 1 ? 25 : 8;
    return Math.max(Math.round(base - waitedSec * 0.3), 3);
  }
}

module.exports = new MatchmakingQueue();

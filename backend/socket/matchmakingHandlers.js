const matchmakingQueue = require("../services/matchmakingService");
const battleService = require("../services/battleService");

/**
 * Wires the queue's "match" event (fired from tryMatchAll's interval) into
 * actual room creation + client notification. Called ONCE at server startup
 * from socket/index.js, not per-connection.
 */
const wireMatchmakingEvents = (io) => {
  matchmakingQueue.start();

  matchmakingQueue.on("match", async ({ player1, player2 }) => {
    try {
      const battle = await battleService.createBattle(player1, player2);

      [player1, player2].forEach((player, i) => {
        const opponent = i === 0 ? player2 : player1;
        const socket = io.sockets.sockets.get(player.socketId);
        if (!socket) return; // they disconnected between matching and now

        socket.emit("matchFound", {
          roomId: battle.roomId,
          opponent: {
            userId: opponent.userId,
            username: opponent.username,
            name: opponent.name,
            avatar: opponent.avatar || null,
            rating: opponent.rating,
          },
          problemDifficulty: battle.problem.difficulty,
        });
      });
    } catch (err) {
      // No problems available, DB hiccup, etc. — tell both players and let
      // them decide whether to requeue rather than silently dropping them.
      [player1, player2].forEach((player) => {
        const socket = io.sockets.sockets.get(player.socketId);
        socket?.emit("matchmakingError", { message: err.message || "Couldn't start the battle. Please try again." });
      });
    }
  });
};

const registerMatchmakingHandlers = (io, socket) => {
  socket.on("joinQueue", () => {
    const userId = socket.user._id.toString();

    if (battleService.getBattleByUser(userId)) {
      socket.emit("matchmakingError", { message: "You're already in an active battle." });
      return;
    }
    if (matchmakingQueue.isQueued(userId)) {
      socket.emit("queueStatus", { queued: true, size: matchmakingQueue.size() });
      return;
    }

    matchmakingQueue.addToQueue({
      userId,
      username: socket.user.username,
      name: socket.user.name,
      avatar: socket.user.avatar?.url || null,
      rating: socket.user.rating,
      socketId: socket.id,
    });

    socket.emit("queueStatus", {
      queued: true,
      size: matchmakingQueue.size(),
      estimatedWaitSeconds: matchmakingQueue.estimateWaitSeconds(userId),
    });
  });

  socket.on("leaveQueue", () => {
    const userId = socket.user._id.toString();
    matchmakingQueue.removeFromQueue(userId);
    socket.emit("queueStatus", { queued: false });
  });

  socket.on("queueStatus", () => {
    const userId = socket.user._id.toString();
    const queued = matchmakingQueue.isQueued(userId);
    socket.emit("queueStatus", {
      queued,
      size: matchmakingQueue.size(),
      estimatedWaitSeconds: queued ? matchmakingQueue.estimateWaitSeconds(userId) : null,
    });
  });
};

module.exports = { registerMatchmakingHandlers, wireMatchmakingEvents };

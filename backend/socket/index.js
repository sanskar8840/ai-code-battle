const { Server } = require("socket.io");
const config = require("../config/config");
const socketAuth = require("./socketAuth");
const { registerMatchmakingHandlers, wireMatchmakingEvents } = require("./matchmakingHandlers");
const { registerBattleHandlers } = require("./battleHandlers");
const matchmakingQueue = require("../services/matchmakingService");

/**
 * Attaches Socket.IO to the existing HTTP server (shares the port with
 * Express — no separate server/port needed). Called once from server.js.
 */
const initSocket = (httpServer) => {
  const io = new Server(httpServer, {
    cors: {
      origin: config.clientUrl,
      credentials: true,
    },
    // Keep both transports so environments that block WebSocket upgrades
    // (some corporate proxies, certain free hosting tiers) still work via
    // long-polling rather than failing to connect entirely.
    transports: ["websocket", "polling"],
  });

  io.use(socketAuth);

  // Module-level: wires the queue's internal matching loop to actual room
  // creation. Must happen once, not per-connection.
  wireMatchmakingEvents(io);

  io.on("connection", (socket) => {
    // Personal room so future features (notifications, direct challenges)
    // can target a user even if they have multiple tabs open.
    socket.join(`user:${socket.user._id}`);

    registerMatchmakingHandlers(io, socket);
    registerBattleHandlers(io, socket);

    socket.on("disconnect", () => {
      // If they were waiting in queue (not yet matched), pull them out —
      // registerBattleHandlers' own disconnect listener handles the
      // "already in an active battle" case separately.
      matchmakingQueue.removeFromQueue(socket.user._id.toString());
    });
  });

  return io;
};

module.exports = initSocket;

const jwt = require("jsonwebtoken");
const config = require("../config/config");
const User = require("../models/User");

/**
 * Socket.IO middleware: verifies the same JWT used for REST auth, sent via
 * `socket.handshake.auth.token` (preferred) or `?token=` query param as a
 * fallback for clients that can't set handshake auth. Attaches `socket.user`
 * on success; rejects the connection outright on failure so no unauthenticated
 * socket ever reaches a battle handler.
 */
const socketAuth = async (socket, next) => {
  try {
    const token =
      socket.handshake.auth?.token ||
      socket.handshake.query?.token ||
      socket.handshake.headers?.authorization?.split(" ")[1];

    if (!token) {
      return next(new Error("Authentication required"));
    }

    const decoded = jwt.verify(token, config.jwt.secret);
    const user = await User.findById(decoded.id);

    if (!user || !user.isActive) {
      return next(new Error("Invalid or expired session"));
    }

    socket.user = user;
    next();
  } catch (err) {
    next(new Error("Authentication failed"));
  }
};

module.exports = socketAuth;

import { io } from "socket.io-client";

const SOCKET_URL = (import.meta.env.VITE_API_URL || "http://localhost:5000/api").replace(/\/api$/, "");

let socket = null;

/**
 * Lazily creates (or returns) the single shared socket connection for this
 * tab. Auth token is read fresh each call so a just-logged-in user gets a
 * correctly authenticated socket without needing a page reload.
 */
export const getSocket = () => {
  if (socket) return socket;

  const token = localStorage.getItem("token");

  socket = io(SOCKET_URL, {
    autoConnect: false,
    auth: { token },
    transports: ["websocket", "polling"],
    reconnection: true,
    reconnectionAttempts: 10,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
  });

  return socket;
};

export const connectSocket = () => {
  const s = getSocket();
  if (!s.connected) {
    // Refresh the token in case it changed (login) since the socket was created.
    s.auth = { token: localStorage.getItem("token") };
    s.connect();
  }
  return s;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

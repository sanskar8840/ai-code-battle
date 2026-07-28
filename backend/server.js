const http = require("http");
const app = require("./app");
const connectDB = require("./config/db");
const config = require("./config/config");
const initSocket = require("./socket");


const server = http.createServer(app);

const start = async () => {
  await connectDB();

  initSocket(server);

  server.listen(config.port, () => {
    console.log(`Server running in ${config.env} mode on port ${config.port}`);
    console.log("Socket.IO attached — real-time battles are live");
  });
};

start();

// Guard against crashing the whole process on an unhandled promise rejection —
// log it, close the server gracefully, then exit so a process manager (Render) restarts it.
process.on("unhandledRejection", (err) => {
  console.error(`Unhandled Rejection: ${err.message}`);
  server.close(() => process.exit(1));
});

process.on("uncaughtException", (err) => {
  console.error(`Uncaught Exception: ${err.message}`);
  process.exit(1);
});

module.exports = server;

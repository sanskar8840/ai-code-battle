import { createContext, useContext, useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { connectSocket, disconnectSocket, getSocket } from "../services/socket";

const SocketContext = createContext(null);

export const SocketProvider = ({ children }) => {
  const { isAuthenticated } = useSelector((state) => state.auth);
  const [connected, setConnected] = useState(false);
  const socketRef = useRef(null);

  useEffect(() => {
    if (!isAuthenticated) {
      disconnectSocket();
      setConnected(false);
      return;
    }

    const socket = connectSocket();
    socketRef.current = socket;

    const onConnect = () => setConnected(true);
    const onDisconnect = () => setConnected(false);

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    if (socket.connected) setConnected(true);

    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
    };
  }, [isAuthenticated]);

  useEffect(() => {
    return () => disconnectSocket();
  }, []);

  return (
    <SocketContext.Provider value={{ socket: socketRef.current || getSocket(), connected }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  const ctx = useContext(SocketContext);
  if (!ctx) throw new Error("useSocket must be used within a SocketProvider");
  return ctx;
};

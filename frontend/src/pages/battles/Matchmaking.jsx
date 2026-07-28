import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { FiX, FiZap } from "react-icons/fi";
import { useSocket } from "../../context/SocketContext";
import MatchFoundModal from "../../components/battle/MatchFoundModal";

const Matchmaking = () => {
  const { socket, connected } = useSocket();
  const navigate = useNavigate();
  const [elapsed, setElapsed] = useState(0);
  const [queueSize, setQueueSize] = useState(1);
  const [estimatedWait, setEstimatedWait] = useState(20);
  const [matchInfo, setMatchInfo] = useState(null);

  // Join the queue once connected; always leave on unmount (covers cancel,
  // navigating away, or the component being torn down for any reason).
  useEffect(() => {
    if (!connected || !socket) return undefined;

    socket.emit("joinQueue");

    const onQueueStatus = (data) => {
      if (data.size) setQueueSize(data.size);
      if (data.estimatedWaitSeconds != null) setEstimatedWait(data.estimatedWaitSeconds);
    };
    const onMatchFound = (data) => setMatchInfo(data);
    const onError = (err) => {
      toast.error(err.message || "Matchmaking failed");
      navigate("/battles");
    };

    socket.on("queueStatus", onQueueStatus);
    socket.on("matchFound", onMatchFound);
    socket.on("matchmakingError", onError);

    return () => {
      socket.emit("leaveQueue");
      socket.off("queueStatus", onQueueStatus);
      socket.off("matchFound", onMatchFound);
      socket.off("matchmakingError", onError);
    };
  }, [connected, socket, navigate]);

  useEffect(() => {
    if (matchInfo) return undefined;
    const t = setInterval(() => setElapsed((e) => e + 1), 1000);
    return () => clearInterval(t);
  }, [matchInfo]);

  const handleCancel = () => {
    socket?.emit("leaveQueue");
    navigate("/battles");
  };

  const handleJoinRoom = () => {
    if (matchInfo) navigate(`/battles/room/${matchInfo.roomId}`);
  };

  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center px-4">
      <motion.div
        animate={{ scale: [1, 1.08, 1] }}
        transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
        className="flex h-24 w-24 items-center justify-center rounded-full bg-duel-500/10 text-duel-500"
      >
        <FiZap size={36} />
      </motion.div>

      <h1 className="mt-6 font-display text-xl font-bold">Searching for an opponent…</h1>
      <p className="mt-1 font-mono text-sm text-ink-800/50 dark:text-paper-100/50">
        {String(Math.floor(elapsed / 60)).padStart(2, "0")}:{String(elapsed % 60).padStart(2, "0")} elapsed
      </p>

      <div className="mt-6 flex gap-6 font-body text-sm text-ink-800/60 dark:text-paper-100/60">
        <span>{queueSize} in queue</span>
        <span>~{estimatedWait}s estimated</span>
      </div>

      {!connected && (
        <p className="mt-4 font-body text-xs text-fail">Reconnecting to the server…</p>
      )}

      <button type="button" onClick={handleCancel} className="btn-secondary mt-10">
        <FiX size={14} /> Cancel
      </button>

      {matchInfo && <MatchFoundModal opponent={{ ...matchInfo.opponent, difficulty: matchInfo.problemDifficulty }} onJoin={handleJoinRoom} />}
    </div>
  );
};

export default Matchmaking;

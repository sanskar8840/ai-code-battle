import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import toast from "react-hot-toast";
import { FiTag } from "react-icons/fi";
import { useSocket } from "../../context/SocketContext";
import languageService from "../../services/languageService";
import CodeEditor from "../../components/editor/CodeEditor";
import BattleExecutionPanel from "../../components/battle/BattleExecutionPanel";
import BattleHeader from "../../components/battle/BattleHeader";
import ScoreBoard from "../../components/battle/ScoreBoard";
import Countdown from "../../components/battle/Countdown";
import ReconnectOverlay from "../../components/battle/ReconnectOverlay";
import BattleChat from "../../components/battle/BattleChat";
import DifficultyBadge from "../../components/problems/DifficultyBadge";
import Spinner from "../../components/common/Spinner";
import { BATTLE_DURATION_SECONDS } from "../../utils/battleConstants";

const BattleRoom = () => {
  const { roomId } = useParams();
  const { socket, connected } = useSocket();
  const { user } = useSelector((state) => state.auth);
  const navigate = useNavigate();

  const [battle, setBattle] = useState(null);
  const [languages, setLanguages] = useState([]);
  const [editorState, setEditorState] = useState(null);
  const [countdownValue, setCountdownValue] = useState(null);
  const [chatMessages, setChatMessages] = useState([]);
  const [typingUser, setTypingUser] = useState(null);
  const [chatCollapsed, setChatCollapsed] = useState(true);
  const [opponentDisconnected, setOpponentDisconnected] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    languageService.getLanguages().then(setLanguages).catch(() => {});
  }, []);

  // --- Join the room + register every battle event once socket is connected ---
  useEffect(() => {
    if (!connected || !socket) return undefined;

    socket.emit("joinRoom", { roomId });

    const onStateSync = (state) => {
      setBattle(state);
      setLoading(false);
    };
    const onBattleReady = () => setLoading(false);
    const onCountdownTick = ({ remaining }) => setCountdownValue(remaining);
    const onBattleStart = (state) => {
      setCountdownValue(null);
      setBattle(state);
    };
    const onTimerSync = ({ remainingSeconds }) => {
      setBattle((prev) => (prev ? { ...prev, remainingSeconds } : prev));
    };
    const onPlayerProgress = (players) => {
      setBattle((prev) => (prev ? { ...prev, players } : prev));
    };
    const onBattleEnd = (result) => {
      toast(result.reason === "forfeit" ? "Battle ended — opponent forfeited" : "Battle finished!", { icon: "🏁" });
      navigate(`/battles/result/${roomId}`, { state: { result } });
    };
    const onChatMessage = (msg) => setChatMessages((prev) => [...prev, msg]);
    const onTyping = ({ userId, isTyping }) => {
      if (userId === user?._id) return;
      setTypingUser(isTyping ? battle?.players.find((p) => p.userId === userId)?.name || "Opponent" : null);
    };
    const onOpponentDisconnected = () => setOpponentDisconnected(true);
    const onOpponentReconnected = () => setOpponentDisconnected(false);
    const onBattleError = (err) => toast.error(err.message || "Something went wrong");
    const onRematchRequest = () => {
      toast("Opponent wants a rematch — check the result screen if this battle just ended.", { icon: "🔁" });
    };

    socket.on("battleStateSync", onStateSync);
    socket.on("battleReady", onBattleReady);
    socket.on("countdownTick", onCountdownTick);
    socket.on("battleStart", onBattleStart);
    socket.on("timerSync", onTimerSync);
    socket.on("playerProgress", onPlayerProgress);
    socket.on("battleEnd", onBattleEnd);
    socket.on("chatMessage", onChatMessage);
    socket.on("typing", onTyping);
    socket.on("opponentDisconnected", onOpponentDisconnected);
    socket.on("opponentReconnected", onOpponentReconnected);
    socket.on("battleError", onBattleError);
    socket.on("rematchRequest", onRematchRequest);

    return () => {
      socket.off("battleStateSync", onStateSync);
      socket.off("battleReady", onBattleReady);
      socket.off("countdownTick", onCountdownTick);
      socket.off("battleStart", onBattleStart);
      socket.off("timerSync", onTimerSync);
      socket.off("playerProgress", onPlayerProgress);
      socket.off("battleEnd", onBattleEnd);
      socket.off("chatMessage", onChatMessage);
      socket.off("typing", onTyping);
      socket.off("opponentDisconnected", onOpponentDisconnected);
      socket.off("opponentReconnected", onOpponentReconnected);
      socket.off("battleError", onBattleError);
      socket.off("rematchRequest", onRematchRequest);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [connected, socket, roomId, navigate, user?._id]);

  // --- If our own socket drops mid-battle, Socket.IO auto-reconnects; once
  // it does, explicitly re-join the room to resync state. ---
  useEffect(() => {
    if (!socket) return undefined;
    const onReconnect = () => socket.emit("reconnectToBattle", { roomId });
    socket.on("connect", onReconnect);
    return () => socket.off("connect", onReconnect);
  }, [socket, roomId]);

  const handleSendChat = (message) => {
    socket.emit("chatMessage", { roomId, message });
  };

  const handleTyping = (isTyping) => {
    socket.emit("typing", { roomId, isTyping });
  };

  if (loading || !battle) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  const battleActive = battle.battleStatus === "in_progress";

  return (
    <div className="mx-auto max-w-[1600px] px-4 py-6 sm:px-6 lg:px-8">
      {countdownValue !== null && <Countdown value={countdownValue} />}
      {!connected && <ReconnectOverlay mode="self" />}
      {connected && opponentDisconnected && <ReconnectOverlay mode="opponent" />}

      <BattleHeader problem={battle.problem} remainingSeconds={battle.remainingSeconds} totalSeconds={BATTLE_DURATION_SECONDS} />

      <div className="mt-4">
        <ScoreBoard players={battle.players} />
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2 lg:items-start">
        <div className="card max-h-[65vh] overflow-y-auto p-6">
          <div className="flex items-center gap-2">
            <DifficultyBadge difficulty={battle.problem.difficulty} />
          </div>
          <div className="mt-4 whitespace-pre-wrap font-body text-sm leading-relaxed text-ink-800/90 dark:text-paper-100/90">
            {battle.problem.description}
          </div>

          {battle.problem.tags?.length > 0 && (
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <FiTag className="text-ink-800/40 dark:text-paper-100/40" size={14} />
              {battle.problem.tags.map((tag) => (
                <span key={tag} className="rounded-full bg-ink-600/5 px-2.5 py-0.5 font-mono text-xs text-ink-800/60 dark:bg-paper-200/5 dark:text-paper-100/60">
                  {tag}
                </span>
              ))}
            </div>
          )}

          <div className="mt-4 space-y-3">
            {battle.problem.examples?.map((ex, i) => (
              <div key={i} className="rounded-lg bg-ink-900/[0.03] p-3 font-mono text-xs dark:bg-paper-100/[0.03]">
                <p className="font-body text-xs font-semibold not-italic">Example {i + 1}</p>
                <p className="mt-1"><span className="text-ink-800/50 dark:text-paper-100/50">Input: </span>{ex.input}</p>
                <p className="mt-1"><span className="text-ink-800/50 dark:text-paper-100/50">Output: </span>{ex.output}</p>
              </div>
            ))}
          </div>
        </div>

        <div>
          <CodeEditor problem={battle.problem} languages={languages} onStateChange={setEditorState} />
          <div className="mt-4">
            <BattleExecutionPanel roomId={roomId} editorState={editorState} disabled={!battleActive} />
          </div>
        </div>
      </div>

      <div className="fixed bottom-6 right-6 z-40">
        <BattleChat
          messages={chatMessages}
          typingUser={typingUser}
          onSend={handleSendChat}
          onTyping={handleTyping}
          collapsed={chatCollapsed}
          onToggleCollapse={() => setChatCollapsed((c) => !c)}
        />
      </div>
    </div>
  );
};

export default BattleRoom;

import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import toast from "react-hot-toast";
import { FiRefreshCw, FiHome, FiAward } from "react-icons/fi";
import { useSocket } from "../../context/SocketContext";
import battleService from "../../services/battleService";
import RatingChangeAnimation from "../../components/battle/RatingChangeAnimation";
import Spinner from "../../components/common/Spinner";
import Button from "../../components/common/Button";

const OUTCOME_COPY = {
  win: { title: "Victory!", color: "text-pass" },
  loss: { title: "Defeat", color: "text-fail" },
  draw: { title: "Draw", color: "text-amber-500" },
};

const BattleResult = () => {
  const { roomId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { socket } = useSocket();
  const { user } = useSelector((state) => state.auth);

  const [result, setResult] = useState(location.state?.result || null);
  const [loading, setLoading] = useState(!result);
  const [rematchState, setRematchState] = useState("idle"); // idle | requested | incoming

  useEffect(() => {
    if (result) return;

    // Reload-safe fallback: fetch the persisted battle from the REST API if
    // we landed here directly (no navigation state, e.g. a page refresh).
    battleService
      .getBattleByRoom(roomId)
      .then(({ battle }) => {
        const players = battle.players.map((p) => ({
          userId: p.user._id,
          name: p.user.name,
          result: p.result,
          status: p.finalStatus,
          testCasesPassed: p.testCasesPassed,
          testCasesTotal: p.testCasesTotal,
          submissionCount: p.submissionCount,
          solved: !!p.solvedAt,
          ratingBefore: p.ratingBefore,
          ratingAfter: p.ratingAfter,
          ratingDelta: p.ratingAfter - p.ratingBefore,
        }));
        setResult({
          roomId: battle.roomId,
          outcome: battle.winner ? (battle.winner.toString?.() === user?._id ? "player1" : "player2") : "draw",
          durationSeconds: battle.durationSeconds,
          players,
        });
      })
      .catch((err) => toast.error(err.message || "Couldn't load battle result"))
      .finally(() => setLoading(false));
  }, [roomId, result, user?._id]);

  useEffect(() => {
    if (!socket) return undefined;
    const onRematchRequest = () => setRematchState("incoming");
    const onRematchAccepted = ({ roomId: newRoomId }) => navigate(`/battles/room/${newRoomId}`);

    socket.on("rematchRequest", onRematchRequest);
    socket.on("rematchAccepted", onRematchAccepted);
    return () => {
      socket.off("rematchRequest", onRematchRequest);
      socket.off("rematchAccepted", onRematchAccepted);
    };
  }, [socket, navigate]);

  if (loading || !result) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  const self = result.players.find((p) => p.userId === user?._id) || result.players[0];
  const opponent = result.players.find((p) => p.userId !== user?._id) || result.players[1];
  const copy = OUTCOME_COPY[self?.result] || OUTCOME_COPY.draw;

  const handleRematchRequest = () => {
    socket.emit("rematchRequest", { roomId: result.roomId });
    setRematchState("requested");
    toast("Rematch request sent");
  };

  const handleRematchAccept = () => {
    socket.emit("rematchAccepted", { roomId: result.roomId });
  };

  return (
    <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="card p-8 text-center sm:p-10">
        <FiAward className={`mx-auto ${copy.color}`} size={40} />
        <h1 className={`mt-4 font-display text-3xl font-bold ${copy.color}`}>{copy.title}</h1>
        <p className="mt-1 font-body text-sm text-ink-800/60 dark:text-paper-100/60">
          {self?.solved ? "You solved it first." : opponent?.solved ? "Your opponent solved it first." : "Time ran out."}
        </p>

        <div className="mt-8 grid grid-cols-2 gap-4">
          <div className="rounded-xl border border-ink-600/10 p-5 dark:border-paper-200/10">
            <p className="font-body text-xs text-ink-800/50 dark:text-paper-100/50">You</p>
            <div className="mt-2">
              <RatingChangeAnimation before={self?.ratingBefore ?? 1200} after={self?.ratingAfter ?? 1200} delta={self?.ratingDelta ?? 0} />
            </div>
            <p className="mt-2 font-mono text-xs text-ink-800/50 dark:text-paper-100/50">
              {self?.testCasesPassed}/{self?.testCasesTotal} passed
            </p>
          </div>
          <div className="rounded-xl border border-ink-600/10 p-5 dark:border-paper-200/10">
            <p className="font-body text-xs text-ink-800/50 dark:text-paper-100/50">{opponent?.name || "Opponent"}</p>
            <div className="mt-2">
              <RatingChangeAnimation before={opponent?.ratingBefore ?? 1200} after={opponent?.ratingAfter ?? 1200} delta={opponent?.ratingDelta ?? 0} />
            </div>
            <p className="mt-2 font-mono text-xs text-ink-800/50 dark:text-paper-100/50">
              {opponent?.testCasesPassed}/{opponent?.testCasesTotal} passed
            </p>
          </div>
        </div>

        <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          {rematchState === "incoming" ? (
            <Button onClick={handleRematchAccept}>
              <FiRefreshCw size={14} /> Accept rematch
            </Button>
          ) : (
            <Button variant="secondary" onClick={handleRematchRequest} isLoading={rematchState === "requested"} disabled={rematchState === "requested"}>
              <FiRefreshCw size={14} /> {rematchState === "requested" ? "Waiting for opponent…" : "Request rematch"}
            </Button>
          )}
          <Link to="/battles" className="btn-primary">
            <FiHome size={14} /> Back to lobby
          </Link>
        </div>
      </div>
    </div>
  );
};

export default BattleResult;

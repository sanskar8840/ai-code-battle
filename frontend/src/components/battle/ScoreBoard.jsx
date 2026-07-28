import { useSelector } from "react-redux";
import OpponentCard from "./OpponentCard";

const ScoreBoard = ({ players }) => {
  const { user } = useSelector((state) => state.auth);
  if (!players || players.length < 2) return null;

  const self = players.find((p) => p.userId === user?._id);
  const opponent = players.find((p) => p.userId !== user?._id);

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      <OpponentCard player={self} isSelf />
      <OpponentCard player={opponent} />
    </div>
  );
};

export default ScoreBoard;

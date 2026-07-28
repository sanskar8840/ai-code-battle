import DifficultyBadge from "../problems/DifficultyBadge";
import Timer from "./Timer";

const BattleHeader = ({ problem, remainingSeconds, totalSeconds }) => (
  <div className="card flex flex-wrap items-center justify-between gap-3 px-4 py-3">
    <div className="min-w-0">
      <p className="truncate font-display text-base font-semibold">{problem?.title}</p>
      {problem?.difficulty && <DifficultyBadge difficulty={problem.difficulty} className="mt-1" />}
    </div>
    <Timer remainingSeconds={remainingSeconds} totalSeconds={totalSeconds} />
  </div>
);

export default BattleHeader;

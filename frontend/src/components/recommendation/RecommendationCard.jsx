import { Link } from "react-router-dom";
import DifficultyBadge from "../problems/DifficultyBadge";

const RecommendationCard = ({ problem }) => {
  return (
    <Link
      to={`/problems/${problem.slug}`}
      className="block"
    >
      <div className="card p-4 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer border border-transparent hover:border-duel-500/30">

        <h3 className="text-lg font-bold line-clamp-2">
          {problem.title}
        </h3>

        <div className="mt-3">
          <DifficultyBadge difficulty={problem.difficulty} />
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {problem.tags?.map((tag) => (
            <span
              key={tag}
              className="rounded-full bg-duel-500/10 px-2 py-1 text-xs font-medium"
            >
              {tag}
            </span>
          ))}
        </div>

        {/* Hybrid Scores */}
        <div className="mt-5 text-sm">
          ⭐ Final Score:
          <span className="ml-1 font-semibold text-green-500">
            {problem.finalScore?.toFixed(2)}
          </span>
        </div>

        <div className="mt-2 text-xs text-gray-500">
          🤖 ML Score: {problem.mlScore?.toFixed(2)}
        </div>

        <div className="mt-1 text-xs text-gray-500">
          📊 Rule Score: {problem.score?.toFixed(2)}
        </div>

        <div className="mt-2 text-xs text-gray-500">
          Acceptance: {problem.acceptanceRate?.toFixed(1)}%
        </div>

        <div className="mt-3 rounded-lg bg-green-100 dark:bg-green-900/30 p-2 text-xs text-green-700 dark:text-green-300">
          ✅ {problem.reason}
        </div>

        <div className="mt-4 text-sm font-medium text-duel-500">
          Solve Problem →
        </div>

      </div>
    </Link>
  );
};

export default RecommendationCard;
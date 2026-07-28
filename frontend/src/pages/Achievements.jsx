import { useEffect, useState } from "react";
import { getAchievements } from "../services/achievementService";

const Achievements = () => {
  const [achievements, setAchievements] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAchievements();
  }, []);

  const loadAchievements = async () => {
    try {
      const res = await getAchievements();
      setAchievements(res.achievements);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center mt-20 text-2xl font-bold">
        Loading Achievements...
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">

      <h1 className="text-5xl font-bold text-center mb-10">
        🏆 Achievements
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">

        {achievements.map((achievement) => (

          <div
            key={achievement._id}
            className={`rounded-2xl shadow-lg p-6 transition duration-300 hover:scale-105
              ${
                achievement.unlocked
                  ? "bg-green-50 border-2 border-green-500"
                  : "bg-white border"
              }`}
          >

            {/* Top */}

            <div className="flex justify-between items-center mb-5">

              <div
                className="text-5xl"
                style={{ color: achievement.color }}
              >
                {achievement.icon}
              </div>

              {achievement.unlocked ? (
                <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-bold">
                  ✅ Unlocked
                </span>
              ) : (
                <span className="bg-gray-200 text-gray-700 px-3 py-1 rounded-full text-sm font-bold">
                  🔒 Locked
                </span>
              )}

            </div>

            {/* Title */}

            <h2 className="text-3xl font-bold mb-2">
              {achievement.title}
            </h2>

            {/* Description */}

            <p className="text-gray-600 mb-5">
              {achievement.description}
            </p>

            {/* Reward */}

            <p className="font-bold text-lg">
              Reward: {achievement.xpReward} XP
            </p>

            {/* Progress */}

            <div className="mt-5">

              <div className="flex justify-between text-sm mb-2">

                <span>Progress</span>

                <span>
                  {achievement.progress}/{achievement.value}
                </span>

              </div>

              <div className="w-full bg-gray-300 rounded-full h-3">

                <div
                  className="bg-purple-600 h-3 rounded-full transition-all duration-500"
                  style={{
                    width: `${Math.min(
                      (achievement.progress / achievement.value) * 100,
                      100
                    )}%`,
                  }}
                ></div>

              </div>

            </div>

            {/* Condition */}

            <div className="mt-5 text-gray-500 text-sm">
              Condition: {achievement.condition} = {achievement.value}
            </div>

          </div>

        ))}

      </div>

    </div>
  );
};

export default Achievements;
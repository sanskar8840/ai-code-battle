import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getLeaderboard } from "../services/leaderboardService";

const Leaderboard = () => {
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    loadLeaderboard();
  }, []);

  const loadLeaderboard = async () => {
    try {
      const data = await getLeaderboard();
      setLeaderboard(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = leaderboard.filter(
    (user) =>
      user.username.toLowerCase().includes(search.toLowerCase()) ||
      user.name.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <div className="text-center mt-10 text-2xl font-semibold">
        Loading Leaderboard...
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      <h1 className="text-4xl font-bold text-center mb-8">
        🏆 Global Leaderboard
      </h1>

      {/* Search */}
      <div className="mb-8">
        <input
          type="text"
          placeholder="Search by name or username..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full border rounded-xl px-4 py-3 shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
        />
      </div>

      {/* Top 3 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        {leaderboard.slice(0, 3).map((user, index) => {
          const medal =
            index === 0 ? "🥇" : index === 1 ? "🥈" : "🥉";

          return (
            <div
              key={user._id}
              className="bg-white rounded-2xl shadow-xl border p-6 text-center hover:scale-105 transition duration-300"
            >
              <div className="text-5xl mb-4">{medal}</div>

              {user.avatar?.url ? (
                <img
                  src={user.avatar.url}
                  alt={user.username}
                  className="w-24 h-24 rounded-full mx-auto object-cover border-4 border-purple-500 mb-4"
                />
              ) : (
                <div className="w-24 h-24 rounded-full bg-purple-600 text-white flex items-center justify-center text-4xl font-bold mx-auto mb-4">
                  {user.name?.charAt(0).toUpperCase()}
                </div>
              )}

              <Link
                to={`/profile/${user.username}`}
                className="text-2xl font-bold hover:text-purple-600"
              >
                {user.name}
              </Link>

              <p className="text-gray-500">@{user.username}</p>

              <p className="mt-2 font-semibold">
                Rank #{user.rank}
              </p>

              <div className="mt-4 text-4xl font-bold text-indigo-600">
                {user.rating}
              </div>

              <div className="mt-4 text-gray-600">
                Solved : {user.problemsSolved}
              </div>

              <div className="text-gray-600">
                Wins : {user.battlesWon}
              </div>

              <div className="text-gray-600">
                Win Rate : {user.winRate}%
              </div>
            </div>
          );
        })}
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-xl shadow-lg">
        <table className="min-w-full bg-white">
          <thead className="bg-gray-900 text-white">
            <tr>
              <th className="p-4">Rank</th>
              <th className="p-4">Player</th>
              <th className="p-4">Rating</th>
              <th className="p-4">Solved</th>
              <th className="p-4">Wins</th>
              <th className="p-4">Losses</th>
              <th className="p-4">Win Rate</th>
            </tr>
          </thead>

          <tbody>
            {filteredUsers.length === 0 ? (
              <tr>
                <td
                  colSpan={7}
                  className="p-8 text-center text-gray-500"
                >
                  No users found.
                </td>
              </tr>
            ) : (
              filteredUsers.map((user) => (
                <tr
                  key={user._id}
                  className="border-b hover:bg-gray-100 transition"
                >
                  <td className="p-4 text-center font-bold">
                    {user.rank === 1 && "🥇"}
                    {user.rank === 2 && "🥈"}
                    {user.rank === 3 && "🥉"}
                    {user.rank > 3 && `#${user.rank}`}
                  </td>

                  <td className="p-4">
                    <Link
                      to={`/profile/${user.username}`}
                      className="flex items-center gap-4"
                    >
                      {user.avatar?.url ? (
                        <img
                          src={user.avatar.url}
                          alt={user.username}
                          className="w-12 h-12 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-purple-600 text-white flex items-center justify-center font-bold text-lg">
                          {user.name?.charAt(0).toUpperCase()}
                        </div>
                      )}

                      <div>
                        <p className="font-semibold">
                          {user.name}
                        </p>

                        <p className="text-sm text-gray-500">
                          @{user.username}
                        </p>
                      </div>
                    </Link>
                  </td>

                  <td className="p-4 text-center font-bold text-indigo-600">
                    {user.rating}
                  </td>

                  <td className="p-4 text-center">
                    {user.problemsSolved}
                  </td>

                  <td className="p-4 text-center text-green-600 font-semibold">
                    {user.battlesWon}
                  </td>

                  <td className="p-4 text-center text-red-600 font-semibold">
                    {user.battlesLost}
                  </td>

                  <td className="p-4 text-center">
                    {user.winRate}%
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Leaderboard;
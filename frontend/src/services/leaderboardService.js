import api from "./api";

export const getLeaderboard = async () => {
  const response = await api.get("/users/leaderboard");
  return response.data.data.leaderboard;
};
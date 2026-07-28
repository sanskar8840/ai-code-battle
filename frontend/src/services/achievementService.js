import api from "./api";

export const getAchievements = async () => {
  const { data } = await api.get("/achievements");
  return data.data.achievements;
};
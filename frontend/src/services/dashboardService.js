import api from "./api";

const dashboardService = {
  getStats: async () => {
    const { data } = await api.get("/dashboard/stats");
    return data.data;
  },

  getChartData: async () => {
    const { data } = await api.get("/dashboard/charts");
    return data.data;
  },

  getRecentSubmissions: async (limit = 5) => {
    const { data } = await api.get(`/dashboard/recent-submissions?limit=${limit}`);
    return data.data.submissions;
  },

  getRecentBattles: async (limit = 5) => {
    const { data } = await api.get(`/dashboard/recent-battles?limit=${limit}`);
    return data.data.battles;
  },

  getActivityTimeline: async (limit = 15) => {
    const { data } = await api.get(`/dashboard/activity?limit=${limit}`);
    return data.data.events;
  },

  uploadAvatar: async (file) => {
    const formData = new FormData();
    formData.append("avatar", file);
    const { data } = await api.post("/users/me/avatar", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return data.data.avatar;
  },
};

export default dashboardService;

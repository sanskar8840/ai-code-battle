import api from "./api";

const battleService = {
  getMyBattles: async (params = {}) => {
    const query = new URLSearchParams(
      Object.entries(params).filter(([, v]) => v !== undefined && v !== "" && v !== null)
    ).toString();
    const { data } = await api.get(`/battles${query ? `?${query}` : ""}`);
    return data.data;
  },

  getBattleByRoom: async (roomId) => {
    const { data } = await api.get(`/battles/${roomId}`);
    return data.data;
  },
};

export default battleService;

import api from "./api";

const problemService = {
  getProblems: async (params = {}) => {
    const query = new URLSearchParams(
      Object.entries(params).filter(([, v]) => v !== undefined && v !== "" && v !== null)
    ).toString();
    const { data } = await api.get(`/problems${query ? `?${query}` : ""}`);
    return data.data;
  },

  getProblem: async (idOrSlug) => {
    const { data } = await api.get(`/problems/${idOrSlug}`);
    return data.data.problem;
  },

  getStarterCode: async (idOrSlug) => {
    const { data } = await api.get(`/problems/${idOrSlug}/starter-code`);
    return data.data.starterCode;
  },

  getFilterMeta: async () => {
    const { data } = await api.get("/problems/meta/filters");
    return data.data;
  },

  createProblem: async (payload) => {
    const { data } = await api.post("/problems", payload);
    return data.data.problem;
  },

  updateProblem: async (id, payload) => {
    const { data } = await api.put(`/problems/${id}`, payload);
    return data.data.problem;
  },

  deleteProblem: async (id) => {
    const { data } = await api.delete(`/problems/${id}`);
    return data;
  },
};

export default problemService;

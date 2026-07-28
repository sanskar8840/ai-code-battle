import api from "./api";

const submissionService = {
  getMySubmissions: async (params = {}) => {
    const query = new URLSearchParams(
      Object.entries(params).filter(([, v]) => v !== undefined && v !== "" && v !== null)
    ).toString();
    const { data } = await api.get(`/submissions${query ? `?${query}` : ""}`);
    return data.data;
  },

  getSubmissionById: async (id) => {
    const { data } = await api.get(`/submissions/${id}`);
    return data.data.submission;
  },
};

export default submissionService;

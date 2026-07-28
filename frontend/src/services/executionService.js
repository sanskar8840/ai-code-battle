import api from "./api";

const executionService = {
  runCode: async ({ problemId, language, code }) => {
    const { data } = await api.post("/execute/run", { problemId, language, code });
    return data.data;
  },

  submitCode: async ({ problemId, language, code }) => {
    const { data } = await api.post("/execute/submit", { problemId, language, code });
    return data.data;
  },
};

export default executionService;

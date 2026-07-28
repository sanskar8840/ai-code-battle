import api from "./api";

const languageService = {
  getLanguages: async () => {
    const { data } = await api.get("/languages");
    return data.data.languages;
  },
};

export default languageService;

import api from "./api";

const authService = {
  signup: async (payload) => {
    const { data } = await api.post("/auth/signup", payload);
    return data;
  },

  login: async (payload) => {
    const { data } = await api.post("/auth/login", payload);
    return data;
  },

  logout: async () => {
    const { data } = await api.post("/auth/logout");
    return data;
  },

  getMe: async () => {
    const { data } = await api.get("/auth/me");
    return data;
  },

  forgotPassword: async (email) => {
    const { data } = await api.post("/auth/forgot-password", { email });
    return data;
  },

  resetPassword: async (resetToken, password) => {
    const { data } = await api.put(`/auth/reset-password/${resetToken}`, { password });
    return data;
  },

  updatePassword: async (payload) => {
    const { data } = await api.put("/auth/update-password", payload);
    return data;
  },

  updateProfile: async (payload) => {
    const { data } = await api.put("/users/me", payload);
    return data;
  },
};

export default authService;

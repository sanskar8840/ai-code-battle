import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // send the httpOnly auth cookie
  headers: { "Content-Type": "application/json" },
});

// --- Request interceptor: attach bearer token from localStorage as a fallback
// to the httpOnly cookie (useful for cross-domain Vercel/Render deployments
// where third-party cookies can be blocked). ---
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// --- Response interceptor: normalize errors, auto-logout on 401 ---
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const message = error.response?.data?.message || error.message || "Something went wrong";

    if (status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      // Only force a redirect if we're not already on an auth page,
      // to avoid interrupting a user who's simply not logged in yet.
      const onAuthPage = ["/login", "/register", "/"].includes(window.location.pathname);
      if (!onAuthPage) {
        window.location.href = "/login";
      }
    }

    return Promise.reject({ status, message, raw: error });
  }
);

export default api;

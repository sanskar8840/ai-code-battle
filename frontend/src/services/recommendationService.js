import axios from "axios";

const API =
  `${import.meta.env.VITE_API_URL}/recommendations`;

const getRecommendations = async () => {
  const token = localStorage.getItem("token");

  const res = await axios.get(API, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return res.data;
};

export default {
  getRecommendations,
};
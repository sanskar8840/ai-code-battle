import { useEffect, useState } from "react";
import RecommendationCard from "./RecommendationCard";
import axios from "axios";


const RecommendationSection = () => {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
 

useEffect(() => {
  const fetchRecommendations = async () => {
    try {
      const token = localStorage.getItem("token");

const res = await axios.get(
  "http://localhost:5000/api/recommendations",
  {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  }
);
console.log("Response:", res);
console.log("Data:", res.data);
console.log("Recommendations:", res.data.recommendations);

console.log(JSON.stringify(recommendations[0], null, 2));

      setRecommendations(res.data.recommendations);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  fetchRecommendations();
}, []);

  if (loading) {
    return (
      <div className="mt-8">
        <h2 className="text-2xl font-bold mb-4">
          🤖 Recommended Problems
        </h2>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="card h-40 animate-pulse bg-gray-200 dark:bg-gray-800"
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="mt-8">
      <h2 className="text-2xl font-bold mb-4">
        🤖 Recommended Problems
      </h2>

      {recommendations.length === 0 ? (
        <p>No recommendations available.</p>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {recommendations.map((problem) => (
            <RecommendationCard
              key={problem._id}
              problem={problem}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default RecommendationSection;
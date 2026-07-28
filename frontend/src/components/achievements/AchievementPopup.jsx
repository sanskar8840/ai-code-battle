import { useEffect } from "react";
import toast from "react-hot-toast";

const AchievementPopup = ({ achievements }) => {
  useEffect(() => {
    if (!achievements || achievements.length === 0) return;

    achievements.forEach((achievement) => {
      toast.success(
        `${achievement.icon} Achievement Unlocked!\n${achievement.title}`,
        {
          duration: 5000,
        }
      );
    });
  }, [achievements]);

  return null;
};

export default AchievementPopup;
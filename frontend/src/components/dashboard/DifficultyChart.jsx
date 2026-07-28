import "../../utils/chartSetup";
import { Doughnut } from "react-chartjs-2";
import { useTheme } from "../../context/ThemeContext";

const COLORS = { Easy: "#22C55E", Medium: "#F5A623", Hard: "#EF4444" };
const ORDER = ["Easy", "Medium", "Hard"];

const DifficultyChart = ({ distribution = [] }) => {
  const { theme } = useTheme();
  const textColor = theme === "dark" ? "rgba(244,242,238,0.7)" : "rgba(10,14,26,0.7)";

  const byDifficulty = Object.fromEntries(distribution.map((d) => [d._id, d.count]));
  const values = ORDER.map((k) => byDifficulty[k] || 0);
  const total = values.reduce((a, b) => a + b, 0);

  const data = {
    labels: ORDER,
    datasets: [
      {
        data: values,
        backgroundColor: ORDER.map((k) => COLORS[k]),
        borderWidth: 0,
        hoverOffset: 6,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: "68%",
    plugins: {
      legend: {
        position: "bottom",
        labels: { color: textColor, boxWidth: 10, font: { family: "IBM Plex Sans", size: 11 } },
      },
    },
  };

  return (
    <div className="relative h-56">
      {total === 0 ? (
        <div className="flex h-full items-center justify-center font-body text-sm text-ink-800/40 dark:text-paper-100/40">
          Solve problems to see your difficulty breakdown.
        </div>
      ) : (
        <>
          <Doughnut data={data} options={options} />
          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center pb-8">
            <span className="font-mono text-xl font-semibold">{total}</span>
            <span className="font-body text-[10px] text-ink-800/50 dark:text-paper-100/50">solved</span>
          </div>
        </>
      )}
    </div>
  );
};

export default DifficultyChart;

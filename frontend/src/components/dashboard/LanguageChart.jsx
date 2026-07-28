import "../../utils/chartSetup";
import { Bar } from "react-chartjs-2";
import { useTheme } from "../../context/ThemeContext";

const LANGUAGE_LABELS = {
  cpp: "C++",
  java: "Java",
  python: "Python",
  javascript: "JavaScript",
  c: "C",
};

const LanguageChart = ({ usage = [] }) => {
  const { theme } = useTheme();
  const gridColor = theme === "dark" ? "rgba(244,242,238,0.06)" : "rgba(10,14,26,0.06)";
  const textColor = theme === "dark" ? "rgba(244,242,238,0.5)" : "rgba(10,14,26,0.5)";

  const data = {
    labels: usage.map((u) => LANGUAGE_LABELS[u._id] || u._id),
    datasets: [
      {
        label: "Submissions",
        data: usage.map((u) => u.count),
        backgroundColor: "#F5A623",
        borderRadius: 6,
        maxBarThickness: 36,
      },
    ],
  };

  const options = {
    indexAxis: "y",
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      x: {
        beginAtZero: true,
        grid: { color: gridColor },
        ticks: { color: textColor, precision: 0, font: { size: 10 } },
      },
      y: {
        grid: { display: false },
        ticks: { color: textColor, font: { family: "JetBrains Mono", size: 11 } },
      },
    },
  };

  return (
    <div className="h-56">
      {usage.length === 0 ? (
        <div className="flex h-full items-center justify-center font-body text-sm text-ink-800/40 dark:text-paper-100/40">
          No submissions yet — your language usage will show up here.
        </div>
      ) : (
        <Bar data={data} options={options} />
      )}
    </div>
  );
};

export default LanguageChart;

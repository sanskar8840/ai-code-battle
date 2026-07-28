import "../../utils/chartSetup";
import { Line } from "react-chartjs-2";
import { useTheme } from "../../context/ThemeContext";

/**
 * Builds a continuous 30-day x-axis (filling in zero-count days) from the
 * sparse day-bucketed data the backend returns, so the line doesn't skip gaps.
 */
const buildLast30Days = (trend) => {
  const map = new Map(trend.map((t) => [t._id, t]));
  const days = [];
  for (let i = 29; i >= 0; i -= 1) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    const entry = map.get(key);
    days.push({
      label: d.toLocaleDateString(undefined, { month: "short", day: "numeric" }),
      count: entry?.count || 0,
      accepted: entry?.accepted || 0,
    });
  }
  return days;
};

const SubmissionTrendChart = ({ trend = [] }) => {
  const { theme } = useTheme();
  const gridColor = theme === "dark" ? "rgba(244,242,238,0.06)" : "rgba(10,14,26,0.06)";
  const textColor = theme === "dark" ? "rgba(244,242,238,0.5)" : "rgba(10,14,26,0.5)";

  const days = buildLast30Days(trend);

  const data = {
    labels: days.map((d) => d.label),
    datasets: [
      {
        label: "Submissions",
        data: days.map((d) => d.count),
        borderColor: "#7C3AED",
        backgroundColor: "rgba(124,58,237,0.15)",
        fill: true,
        tension: 0.35,
        pointRadius: 0,
        pointHoverRadius: 4,
      },
      {
        label: "Accepted",
        data: days.map((d) => d.accepted),
        borderColor: "#22C55E",
        backgroundColor: "rgba(34,197,94,0.1)",
        fill: true,
        tension: 0.35,
        pointRadius: 0,
        pointHoverRadius: 4,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: { mode: "index", intersect: false },
    plugins: {
      legend: {
        position: "top",
        align: "end",
        labels: { color: textColor, boxWidth: 10, font: { family: "IBM Plex Sans", size: 11 } },
      },
      tooltip: {
        backgroundColor: theme === "dark" ? "#1C2338" : "#FFFFFF",
        titleColor: theme === "dark" ? "#F4F2EE" : "#0A0E1A",
        bodyColor: theme === "dark" ? "#F4F2EE" : "#0A0E1A",
        borderColor: "rgba(124,58,237,0.3)",
        borderWidth: 1,
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { color: textColor, maxTicksLimit: 8, font: { size: 10 } },
      },
      y: {
        beginAtZero: true,
        grid: { color: gridColor },
        ticks: { color: textColor, precision: 0, font: { size: 10 } },
      },
    },
  };

  const hasData = days.some((d) => d.count > 0);

  return (
    <div className="h-64">
      {hasData ? (
        <Line data={data} options={options} />
      ) : (
        <div className="flex h-full items-center justify-center font-body text-sm text-ink-800/40 dark:text-paper-100/40">
          No submissions in the last 30 days yet — solve a problem to see your trend here.
        </div>
      )}
    </div>
  );
};

export default SubmissionTrendChart;

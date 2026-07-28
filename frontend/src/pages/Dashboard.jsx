import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { FiTarget, FiTrendingUp, FiZap, FiAward, FiArrowRight } from "react-icons/fi";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { fetchCurrentUser } from "../features/auth/authSlice";
import dashboardService from "../services/dashboardService";
import Spinner from "../components/common/Spinner";
import SubmissionTrendChart from "../components/dashboard/SubmissionTrendChart";
import DifficultyChart from "../components/dashboard/DifficultyChart";
import LanguageChart from "../components/dashboard/LanguageChart";
import SubmissionHeatmap from "../components/dashboard/SubmissionHeatmap";
import RecentSubmissions from "../components/dashboard/RecentSubmissions";
import RecentBattles from "../components/dashboard/RecentBattles";
import ActivityTimeline from "../components/dashboard/ActivityTimeline";
import BadgeList from "../components/dashboard/BadgeList";
import RecommendationSection from "../components/recommendation/RecommendationSection";
const StatCard = ({ icon: Icon, label, value, accent = "text-duel-500" }) => (
  <div className="card p-5">
    <div className={`flex h-9 w-9 items-center justify-center rounded-lg bg-current/10 ${accent}`}>
      <Icon size={18} />
    </div>
    <p className="mt-4 font-mono text-2xl font-semibold">{value}</p>
    <p className="font-body text-xs text-ink-800/60 dark:text-paper-100/60">{label}</p>
  </div>
);

const Dashboard = () => {
  const dispatch = useDispatch();
  const { user, status } = useSelector((state) => state.auth);

  const [stats, setStats] = useState(null);
  const [charts, setCharts] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [battles, setBattles] = useState([]);
  const [activity, setActivity] = useState([]);
  const [loadingDashboard, setLoadingDashboard] = useState(true);

  useEffect(() => {
    // Refresh the base user profile so rating/badges/etc. stay current.
    dispatch(fetchCurrentUser());
  }, [dispatch]);

  useEffect(() => {
    let cancelled = false;

    const loadAll = async () => {
      setLoadingDashboard(true);
      try {
        const [statsData, chartData, recentSubs, recentBattlesData, activityData] = await Promise.all([
          dashboardService.getStats(),
          dashboardService.getChartData(),
          dashboardService.getRecentSubmissions(6),
          dashboardService.getRecentBattles(5),
          dashboardService.getActivityTimeline(12),
        ]);

        if (cancelled) return;
        setStats(statsData);
        setCharts(chartData);
        setSubmissions(recentSubs);
        setBattles(recentBattlesData);
        setActivity(activityData);
      } catch (err) {
        if (!cancelled) toast.error(err.message || "Couldn't load dashboard data");
      } finally {
        if (!cancelled) setLoadingDashboard(false);
      }
    };

    loadAll();
    return () => {
      cancelled = true;
    };
  }, []);

  if ((status === "loading" && !user) || loadingDashboard) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold">Welcome back, {user.name?.split(" ")[0]}</h1>
          <p className="mt-1 font-body text-sm text-ink-800/60 dark:text-paper-100/60">
            Here's where you stand in the arena.
          </p>
        </div>
        <Link to="/battles/new" className="btn-primary">
          Start a battle <FiArrowRight />
        </Link>
      </div>

      {/* Stat cards */}
      <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        <StatCard icon={FiZap} label="Rating" value={stats?.rating ?? user.rating ?? 1200} accent="text-amber-500" />
        <StatCard icon={FiTarget} label="Problems solved" value={stats?.problemsSolved ?? 0} />
        <StatCard icon={FiTrendingUp} label="Battles won" value={stats?.battlesWon ?? 0} accent="text-pass" />
        <StatCard icon={FiTrendingUp} label="Battles lost" value={stats?.battlesLost ?? 0} accent="text-fail" />
        <StatCard icon={FiAward} label="Current streak" value={`${stats?.currentStreak ?? 0}d`} />
        <StatCard icon={FiTarget} label="Accuracy" value={`${stats?.accuracy ?? 0}%`} accent="text-duel-500" />
      </div>

      {/* Badges */}
      <div className="card mt-6 p-5">
        <h2 className="font-display text-sm font-semibold text-ink-800/70 dark:text-paper-100/70">Badges</h2>
        <div className="mt-3">
          <BadgeList badges={stats?.badges ?? []} />
        </div>
      </div>

      {/* Charts row */}
      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="card p-5 lg:col-span-2">
          <h2 className="font-display text-sm font-semibold text-ink-800/70 dark:text-paper-100/70">
            Submission trend (30 days)
          </h2>
          <div className="mt-4">
            <SubmissionTrendChart trend={charts?.submissionTrend ?? []} />
          </div>
        </div>

        <div className="card p-5">
          <h2 className="font-display text-sm font-semibold text-ink-800/70 dark:text-paper-100/70">
            Difficulty breakdown
          </h2>
          <div className="mt-4">
            <DifficultyChart distribution={charts?.difficultyDistribution ?? []} />
          </div>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="card p-5">
          <h2 className="font-display text-sm font-semibold text-ink-800/70 dark:text-paper-100/70">
            Language usage
          </h2>
          <div className="mt-4">
            <LanguageChart usage={charts?.languageUsage ?? []} />
          </div>
        </div>

        <div className="card p-5 lg:col-span-2">
          <h2 className="font-display text-sm font-semibold text-ink-800/70 dark:text-paper-100/70">
            Coding activity
          </h2>
          <div className="mt-4 overflow-x-auto">
            <SubmissionHeatmap data={charts?.heatmap ?? []} />
          </div>
        </div>
      </div>

      {/* Recent activity row */}
      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="card p-5">
          <h2 className="font-display text-sm font-semibold text-ink-800/70 dark:text-paper-100/70">
            Recent submissions
          </h2>
          <div className="mt-2">
            <RecentSubmissions submissions={submissions} />
          </div>
        </div>

        <div className="card p-5">
          <h2 className="font-display text-sm font-semibold text-ink-800/70 dark:text-paper-100/70">
            Recent battles
          </h2>
          <div className="mt-2">
            <RecentBattles battles={battles} />
          </div>
        </div>

        <div className="card p-5">
          <h2 className="font-display text-sm font-semibold text-ink-800/70 dark:text-paper-100/70">
            Activity timeline
          </h2>
          <div className="mt-4 max-h-72 overflow-y-auto pr-1">
            <ActivityTimeline events={activity} />
          </div>
        </div>
      </div>


              {/* AI Recommendation System */}
<div className="mt-6">
  <RecommendationSection />
</div>



    </div>





  );
};

export default Dashboard;

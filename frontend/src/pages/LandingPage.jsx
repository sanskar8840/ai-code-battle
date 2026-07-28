import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { FiZap, FiCpu, FiUsers, FiTrendingUp, FiArrowRight } from "react-icons/fi";
import { useSelector } from "react-redux";

const features = [
  {
    icon: FiUsers,
    title: "Real-time 1v1 battles",
    desc: "Challenge a friend or get matched instantly. Same problem, same clock, live opponent status.",
  },
  {
    icon: FiCpu,
    title: "AI in your corner",
    desc: "Stuck? Get a hint, a complexity breakdown, or a plain-English explanation of your wrong answer — not just the solution.",
  },
  {
    icon: FiTrendingUp,
    title: "Recommendations that adapt",
    desc: "The more you solve, the sharper the suggestions — tuned to your weak topics, not a fixed syllabus.",
  },
];

const steps = [
  { label: "Pick a problem or a duel", detail: "Practice solo, or queue up for a live 1v1 match." },
  { label: "Write, run, submit", detail: "Full Monaco editor, five languages, instant Judge0 feedback." },
  { label: "Climb the rating", detail: "Wins, losses, and streaks feed a live rating — global and by college." },
];

const LandingPage = () => {
  const { isAuthenticated } = useSelector((state) => state.auth);

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden bg-ink-900">
        <div className="absolute inset-0 bg-arena-grid bg-[size:36px_36px] opacity-30" />
        <div className="relative mx-auto max-w-7xl px-4 py-24 sm:px-6 sm:py-32 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="mb-6 inline-flex items-center gap-2 rounded-full border border-paper-100/15 bg-paper-100/5 px-4 py-1.5 font-mono text-xs text-paper-100/70"
            >
              <FiZap className="text-amber-500" /> Live battles · AI hints · Real rating system
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="font-display text-4xl font-extrabold leading-[1.1] text-paper-100 sm:text-6xl"
            >
              Two coders enter.
              <br />
              <span className="text-amber-500">One rating</span> goes up.
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="mx-auto mt-6 max-w-xl font-body text-base text-paper-100/60 sm:text-lg"
            >
              Practice problems, real-time 1v1 duels, and an AI that actually helps you learn —
              not just an answer key.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row"
            >
              <Link to={isAuthenticated ? "/dashboard" : "/register"} className="btn-primary px-6 py-3 text-base">
                {isAuthenticated ? "Go to dashboard" : "Start battling — it's free"} <FiArrowRight />
              </Link>
              <Link to="/problems" className="btn-secondary border-paper-100/20 px-6 py-3 text-base text-paper-100 hover:bg-paper-100/5">
                Browse problems
              </Link>
            </motion.div>
          </div>

          {/* Duel motif: signature element */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.35 }}
            className="mx-auto mt-16 flex max-w-2xl items-center justify-center gap-6 rounded-2xl border border-paper-100/10 bg-paper-100/[0.03] p-6 font-mono text-sm"
          >
            <div className="flex-1 text-right">
              <p className="text-paper-100/40">Player One</p>
              <p className="text-lg font-semibold text-pass">1847 ELO</p>
              <p className="text-xs text-paper-100/40">3 tests passed</p>
            </div>
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-duel-500 font-display text-sm font-bold text-white shadow-glow">
              VS
            </div>
            <div className="flex-1">
              <p className="text-paper-100/40">Player Two</p>
              <p className="text-lg font-semibold text-amber-500">1802 ELO</p>
              <p className="text-xs text-paper-100/40">2 tests passed</p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <h2 className="text-center font-display text-3xl font-bold">Built for people who want to get better</h2>
        <p className="mx-auto mt-3 max-w-xl text-center font-body text-ink-800/60 dark:text-paper-100/60">
          Not another static problem list. A loop that pushes you to actually improve.
        </p>

        <div className="mt-14 grid grid-cols-1 gap-6 sm:grid-cols-3">
          {features.map((f) => (
            <div key={f.title} className="card p-6">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-duel-500/10 text-duel-500">
                <f.icon size={20} />
              </div>
              <h3 className="mt-4 font-display text-lg font-semibold">{f.title}</h3>
              <p className="mt-2 font-body text-sm text-ink-800/60 dark:text-paper-100/60">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="bg-ink-800/[0.02] dark:bg-paper-100/[0.02] py-20">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-center font-display text-3xl font-bold">How a session goes</h2>
          <div className="mt-14 space-y-8">
            {steps.map((s, i) => (
              <div key={s.label} className="flex gap-5">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-duel-500 font-mono text-sm font-semibold text-duel-500">
                  {i + 1}
                </div>
                <div>
                  <p className="font-display text-base font-semibold">{s.label}</p>
                  <p className="mt-1 font-body text-sm text-ink-800/60 dark:text-paper-100/60">{s.detail}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-4xl px-4 py-20 text-center sm:px-6 lg:px-8">
        <h2 className="font-display text-3xl font-bold">Your first duel is one click away</h2>
        <p className="mx-auto mt-3 max-w-md font-body text-ink-800/60 dark:text-paper-100/60">
          No credit card, no fake trial. Just sign up and queue for a match.
        </p>
        <Link to={isAuthenticated ? "/dashboard" : "/register"} className="btn-primary mt-8 px-6 py-3 text-base">
          {isAuthenticated ? "Go to dashboard" : "Create your account"} <FiArrowRight />
        </Link>
      </section>
    </div>
  );
};

export default LandingPage;

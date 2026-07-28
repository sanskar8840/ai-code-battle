import { Link } from "react-router-dom";
import { FiGithub, FiTwitter, FiZap } from "react-icons/fi";

const Footer = () => {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-ink-600/10 dark:border-paper-200/10 bg-paper-50 dark:bg-ink-900">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-8 sm:grid-cols-4">
          <div className="col-span-2">
            <div className="flex items-center gap-2 font-display text-base font-bold">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-duel-500 text-white">
                <FiZap size={14} />
              </span>
              Code Battle Arena
            </div>
            <p className="mt-3 max-w-xs font-body text-sm text-ink-800/60 dark:text-paper-100/60">
              Sharpen your skills in real-time 1v1 coding duels, with AI in your corner.
            </p>
            <div className="mt-4 flex gap-3 text-ink-800/60 dark:text-paper-100/60">
              <a href="https://github.com" target="_blank" rel="noreferrer" aria-label="GitHub">
                <FiGithub size={18} />
              </a>
              <a href="https://twitter.com" target="_blank" rel="noreferrer" aria-label="Twitter">
                <FiTwitter size={18} />
              </a>
            </div>
          </div>

          <div>
            <h4 className="font-body text-sm font-semibold text-ink-900 dark:text-paper-100">Platform</h4>
            <ul className="mt-3 space-y-2 font-body text-sm text-ink-800/60 dark:text-paper-100/60">
              <li><Link to="/problems" className="hover:text-duel-500">Problems</Link></li>
              <li><Link to="/leaderboard" className="hover:text-duel-500">Leaderboard</Link></li>
              <li><Link to="/battles" className="hover:text-duel-500">Battles</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-body text-sm font-semibold text-ink-900 dark:text-paper-100">Company</h4>
            <ul className="mt-3 space-y-2 font-body text-sm text-ink-800/60 dark:text-paper-100/60">
              <li><Link to="/about" className="hover:text-duel-500">About</Link></li>
              <li><Link to="/contact" className="hover:text-duel-500">Contact</Link></li>
            </ul>
          </div>
        </div>

        <div className="mt-10 border-t border-ink-600/10 dark:border-paper-200/10 pt-6 font-body text-xs text-ink-800/50 dark:text-paper-100/50">
          © {year} AI Code Battle Ground Arena. Built as a final-year B.Tech project.
        </div>
      </div>
    </footer>
  );
};

export default Footer;

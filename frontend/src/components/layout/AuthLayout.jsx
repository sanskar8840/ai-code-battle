import { Link, Outlet } from "react-router-dom";
import { FiZap } from "react-icons/fi";
import ThemeToggle from "../common/ThemeToggle";

/**
 * Split layout: branding + duel motif on the left (hidden on mobile),
 * auth form card on the right. Used for login, register, forgot/reset password.
 */
const AuthLayout = () => {
  return (
    <div className="grid min-h-screen grid-cols-1 lg:grid-cols-2">
      {/* Left: brand panel */}
      <div className="relative hidden overflow-hidden bg-ink-900 lg:flex lg:flex-col lg:justify-between lg:p-10">
        <div className="absolute inset-0 bg-arena-grid bg-[size:32px_32px] opacity-40" />
        <div className="relative z-10 flex items-center gap-2 font-display text-lg font-bold text-paper-100">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-duel-500 text-white">
            <FiZap size={16} />
          </span>
          Code Battle Arena
        </div>

        <div className="relative z-10 max-w-md">
          <p className="font-display text-3xl font-bold leading-tight text-paper-100">
            Two coders enter.
            <br />
            <span className="text-amber-500">One rating</span> goes up.
          </p>
          <p className="mt-4 font-body text-sm text-paper-100/60">
            Solve problems, battle live 1v1, and get AI-powered hints when you're stuck —
            all in one arena built for people who actually want to get better at this.
          </p>
        </div>

        <div className="relative z-10 font-mono text-xs text-paper-100/40">
          © {new Date().getFullYear()} AI Code Battle Ground Arena
        </div>
      </div>

      {/* Right: form panel */}
      <div className="flex flex-col justify-center px-6 py-12 sm:px-12 lg:px-16">
        <div className="mx-auto flex w-full max-w-sm items-center justify-between lg:justify-end">
          <Link to="/" className="flex items-center gap-2 font-display text-lg font-bold lg:hidden">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-duel-500 text-white">
              <FiZap size={16} />
            </span>
            Code Battle Arena
          </Link>
          <ThemeToggle className="mb-8" />
        </div>
        <div className="mx-auto w-full max-w-sm">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;

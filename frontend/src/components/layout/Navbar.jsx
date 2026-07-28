import { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { FiMenu, FiX, FiZap } from "react-icons/fi";
import { useSelector } from "react-redux";
import ThemeToggle from "../common/ThemeToggle";
import Button from "../common/Button";
import useAuth from "../../hooks/useAuth";
import toast from "react-hot-toast";

const navLinkClass = ({ isActive }) =>
  `font-body text-sm font-medium transition-colors ${
    isActive
      ? "text-duel-500"
      : "text-ink-800/70 dark:text-paper-100/70 hover:text-ink-900 dark:hover:text-paper-100"
  }`;

const Navbar = () => {
  const [open, setOpen] = useState(false);
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    toast.success("Logged out successfully");
    setOpen(false);
    navigate("/");
  };

  const links = [
    { to: "/problems", label: "Problems" },
    ...(isAuthenticated
      ? [
          { to: "/dashboard", label: "Dashboard" },
          { to: "/battles", label: "Battles" },
          { to: "/submissions", label: "Submissions" },
          { to: `/profile/${user?.username}`, label: "Profile" },
        ]
      : []),
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-ink-600/10 dark:border-paper-200/10 bg-paper-50/90 dark:bg-ink-900/90 backdrop-blur-md">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        <Link to="/" className="flex items-center gap-2 font-display text-lg font-bold">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-duel-500 text-white">
            <FiZap size={16} />
          </span>
          <span className="hidden sm:inline">Code Battle Arena</span>
        </Link>

        {/* Desktop links */}
        <div className="hidden items-center gap-8 md:flex">
          {links.map((l) => (
            <NavLink key={l.to} to={l.to} className={navLinkClass}>
              {l.label}
            </NavLink>
          ))}
        </div>

        <div className="hidden items-center gap-3 md:flex">
          <ThemeToggle />
          {isAuthenticated ? (
            <Button variant="secondary" onClick={handleLogout}>
              Log out
            </Button>
          ) : (
            <>
              <Link to="/login" className="btn-secondary">
                Log in
              </Link>
              <Link to="/register" className="btn-primary">
                Sign up
              </Link>
            </>
          )}
        </div>

        {/* Mobile toggle */}
        <div className="flex items-center gap-2 md:hidden">
          <ThemeToggle />
          <button
            aria-label={open ? "Close menu" : "Open menu"}
            onClick={() => setOpen((o) => !o)}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-ink-900 dark:text-paper-100"
          >
            {open ? <FiX size={20} /> : <FiMenu size={20} />}
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      {open && (
        <div className="border-t border-ink-600/10 dark:border-paper-200/10 px-4 py-4 md:hidden">
          <div className="flex flex-col gap-4">
            {links.map((l) => (
              <NavLink key={l.to} to={l.to} className={navLinkClass} onClick={() => setOpen(false)}>
                {l.label}
              </NavLink>
            ))}
            {isAuthenticated ? (
              <Button variant="secondary" onClick={handleLogout} className="w-full">
                Log out
              </Button>
            ) : (
              <>
                <Link to="/login" className="btn-secondary w-full" onClick={() => setOpen(false)}>
                  Log in
                </Link>
                <Link to="/register" className="btn-primary w-full" onClick={() => setOpen(false)}>
                  Sign up
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;

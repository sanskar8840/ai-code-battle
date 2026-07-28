import { Link } from "react-router-dom";

const NotFound = () => (
  <div className="flex min-h-[70vh] flex-col items-center justify-center px-4 text-center">
    <p className="font-mono text-sm text-duel-500">404</p>
    <h1 className="mt-2 font-display text-3xl font-bold">This problem doesn't exist</h1>
    <p className="mt-2 font-body text-sm text-ink-800/60 dark:text-paper-100/60">
      The page you're looking for was moved, renamed, or never existed.
    </p>
    <Link to="/" className="btn-primary mt-6">
      Back to home
    </Link>
  </div>
);

export default NotFound;

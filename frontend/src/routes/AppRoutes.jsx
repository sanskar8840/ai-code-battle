import { createBrowserRouter } from "react-router-dom";
import MainLayout from "../components/layout/MainLayout";
import AuthLayout from "../components/layout/AuthLayout";
import ProtectedRoute from "../components/common/ProtectedRoute";
import AdminRoute from "../components/common/AdminRoute";

import LandingPage from "../pages/LandingPage";
import Login from "../pages/auth/Login";
import Register from "../pages/auth/Register";
import ForgotPassword from "../pages/auth/ForgotPassword";
import ResetPassword from "../pages/auth/ResetPassword";
import Dashboard from "../pages/Dashboard";
import Profile from "../pages/Profile";
import NotFound from "../pages/NotFound";
import ProblemList from "../pages/problems/ProblemList";
import ProblemDetail from "../pages/problems/ProblemDetail";
import CreateProblem from "../pages/admin/CreateProblem";
import EditProblem from "../pages/admin/EditProblem";
import SubmissionHistory from "../pages/submissions/SubmissionHistory";
import SubmissionDetail from "../pages/submissions/SubmissionDetail";
import BattleLobby from "../pages/battles/BattleLobby";
import Matchmaking from "../pages/battles/Matchmaking";
import BattleRoom from "../pages/battles/BattleRoom";
import BattleResult from "../pages/battles/BattleResult";
import BattleHistory from "../pages/battles/BattleHistory";
import Leaderboard from "../pages/leaderboard";
import Achievements from "../pages/Achievements";

export const router = createBrowserRouter([
  {
    element: <MainLayout />,
    children: [
      { path: "/", element: <LandingPage /> },
      { path: "/problems", element: <ProblemList /> },
      { path: "/problems/:slug", element: <ProblemDetail /> },
      { path: "/leaderboard", element: <Leaderboard /> },
      { path: "/achievements", element: <Achievements /> },

      {
        element: <ProtectedRoute />,
        children: [
          { path: "/dashboard", element: <Dashboard /> },
          { path: "/profile/:username", element: <Profile /> },
          { path: "/submissions", element: <SubmissionHistory /> },
          { path: "/submissions/:id", element: <SubmissionDetail /> },
          { path: "/battles", element: <BattleLobby /> },
          { path: "/battles/matchmaking", element: <Matchmaking /> },
          { path: "/battles/room/:roomId", element: <BattleRoom /> },
          { path: "/battles/result/:roomId", element: <BattleResult /> },
          { path: "/battles/history", element: <BattleHistory /> },

          {
            element: <AdminRoute />,
            children: [
              { path: "/admin/problems/new", element: <CreateProblem /> },
              { path: "/admin/problems/:id/edit", element: <EditProblem /> },
            ],
          },
        ],
      },
    ],
  },

  {
    element: <AuthLayout />,
    children: [
      { path: "/login", element: <Login /> },
      { path: "/register", element: <Register /> },
      { path: "/forgot-password", element: <ForgotPassword /> },
      { path: "/reset-password/:resetToken", element: <ResetPassword /> },
    ],
  },

  {
    path: "*",
    element: <NotFound />,
  },
]);

export default router;
import { Navigate, Outlet } from "react-router-dom";
import { useSelector } from "react-redux";

/**
 * Nested inside ProtectedRoute in the router tree, so this only needs to check
 * role — authentication is already guaranteed by the parent route.
 */
const AdminRoute = () => {
  const { user } = useSelector((state) => state.auth);

  if (user?.role !== "admin") {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
};

export default AdminRoute;

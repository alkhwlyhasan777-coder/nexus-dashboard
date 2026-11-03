import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export default function ProtectedRoute() {
  const { user, loading, configured } = useAuth();
  const location = useLocation();

  if (!configured) return <Navigate to="/login" replace state={{ from: location }} />;
  if (loading) {
    return <div className="grid min-h-screen place-items-center bg-neutral-50 text-sm text-neutral-500 dark:bg-neutral-950 dark:text-neutral-400">Restoring your secure session…</div>;
  }
  if (!user) return <Navigate to="/login" replace state={{ from: location }} />;
  return <Outlet />;
}

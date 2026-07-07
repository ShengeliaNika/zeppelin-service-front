import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "./AuthContext";

export default function RequireRole({ roles }: { roles: string[] }) {
  const { user } = useAuth();

  // RequireAuth (rendered above this in the route tree) already redirects
  // unauthenticated users to /login, so a missing user here just means
  // we're mid-render and shouldn't flash a redirect.
  if (!user) {
    return null;
  }

  const allowed = roles.some((role) => user.roles.includes(role));
  return allowed ? <Outlet /> : <Navigate to="/" replace />;
}

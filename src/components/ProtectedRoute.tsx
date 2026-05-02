import { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import useStore from "../store/useStore";
import type { UserRole } from "../types/api";

interface Props {
  allowedRole?: UserRole;
  children: ReactNode;
}

const ProtectedRoute = ({ allowedRole, children }: Props) => {
  const user = useStore((state) => state.user);

  if (!user) return <Navigate to="/login" replace />;
  if (allowedRole && user.role !== allowedRole) {
    const roleMap: Record<UserRole, string> = {
      borrower: "/borrower",
      agent: "/agent",
      admin: "/admin",
    };
    return <Navigate to={roleMap[user.role] || "/login"} replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
